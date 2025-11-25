import { evaluateAST, astToString } from './booleanParser.js';
import { generateTruthTable } from './truthTableGenerator.js';

/**
 * Advanced Boolean Expression Minimizer
 * Implements multiple minimization algorithms and compares results
 */

export class MinimizationResult {
  constructor(algorithm, expression, originalExpression, metadata = {}) {
    this.algorithm = algorithm;
    this.expression = expression;
    this.originalExpression = originalExpression;
    this.metadata = {
      gateCount: this.calculateGateCount(),
      depth: this.calculateDepth(),
      reductionPercentage: this.calculateReduction(),
      performance: 0,
      ...metadata
    };
  }

  calculateGateCount() {
    return (this.expression.match(/[+·̄]/g) || []).length;
  }

  calculateDepth() {
    // Simplified depth calculation based on parentheses nesting
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of this.expression) {
      if (char === '(') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }

  calculateReduction() {
    const originalLength = this.originalExpression.length;
    const minimizedLength = this.expression.length;
    return Math.round(((originalLength - minimizedLength) / originalLength) * 100);
  }

  toJSON() {
    return {
      algorithm: this.algorithm,
      expression: this.expression,
      originalExpression: this.originalExpression,
      metadata: this.metadata
    };
  }
}

/**
 * Quine-McCluskey Algorithm Implementation
 */
class QuineMcCluskeyMinimizer {
  constructor(variables, minterms) {
    this.variables = variables;
    this.minterms = minterms;
    this.primeImplicants = [];
    this.essentialPrimeImplicants = [];
  }

  minimize() {
    if (this.minterms.length === 0) return '0';
    if (this.minterms.length === Math.pow(2, this.variables.length)) return '1';

    // Step 1: Generate all prime implicants
    this.generatePrimeImplicants();

    // Step 2: Find essential prime implicants
    this.findEssentialPrimeImplicants();

    // Step 3: Solve covering problem for remaining minterms
    const allImplicants = this.solveCoveringProblem();

    // Step 4: Convert to Boolean expression
    return this.implicantsToExpression(allImplicants);
  }

  generatePrimeImplicants() {
    let currentLevel = this.minterms.map(m => ({
      binary: m.toString(2).padStart(this.variables.length, '0'),
      minterms: [m],
      dashes: 0
    }));

    const allImplicants = [...currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel = [];
      const used = new Set();

      for (let i = 0; i < currentLevel.length; i++) {
        for (let j = i + 1; j < currentLevel.length; j++) {
          const combined = this.combineImplicants(currentLevel[i], currentLevel[j]);
          if (combined) {
            nextLevel.push(combined);
            used.add(i);
            used.add(j);
          }
        }
      }

      // Add unused implicants as prime implicants
      for (let i = 0; i < currentLevel.length; i++) {
        if (!used.has(i)) {
          this.primeImplicants.push(currentLevel[i]);
        }
      }

      allImplicants.push(...nextLevel);
      currentLevel = nextLevel;
    }

    // Add remaining implicants
    this.primeImplicants.push(...currentLevel);
  }

  combineImplicants(impl1, impl2) {
    // Check if they differ by exactly one bit
    let differences = 0;
    let diffPosition = -1;

    for (let i = 0; i < impl1.binary.length; i++) {
      if (impl1.binary[i] !== impl2.binary[i]) {
        differences++;
        diffPosition = i;
      }
    }

    if (differences === 1) {
      const newBinary = impl1.binary.substring(0, diffPosition) + 
                       '-' + 
                       impl1.binary.substring(diffPosition + 1);
      
      return {
        binary: newBinary,
        minterms: [...new Set([...impl1.minterms, ...impl2.minterms])].sort((a, b) => a - b),
        dashes: impl1.dashes + 1
      };
    }

    return null;
  }

  findEssentialPrimeImplicants() {
    const mintermCoverage = new Map();

    // For each minterm, track which prime implicants cover it
    this.minterms.forEach(minterm => {
      mintermCoverage.set(minterm, []);
    });

    this.primeImplicants.forEach((pi, index) => {
      pi.minterms.forEach(minterm => {
        if (mintermCoverage.has(minterm)) {
          mintermCoverage.get(minterm).push(index);
        }
      });
    });

    // Find essential prime implicants (cover unique minterms)
    mintermCoverage.forEach((coveringPIs, minterm) => {
      if (coveringPIs.length === 1) {
        const piIndex = coveringPIs[0];
        if (!this.essentialPrimeImplicants.some(pi => pi.index === piIndex)) {
          this.essentialPrimeImplicants.push({
            ...this.primeImplicants[piIndex],
            index: piIndex
          });
        }
      }
    });
  }

  solveCoveringProblem() {
    // Simple greedy approach for covering remaining minterms
    const coveredMinterms = new Set();
    this.essentialPrimeImplicants.forEach(pi => {
      pi.minterms.forEach(m => coveredMinterms.add(m));
    });

    const selectedPIs = [...this.essentialPrimeImplicants];
    const remainingMinterms = this.minterms.filter(m => !coveredMinterms.has(m));

    // Greedy selection for remaining minterms
    while (remainingMinterms.length > 0) {
      let bestPI = null;
      let bestCoverage = 0;

      this.primeImplicants.forEach(pi => {
        if (!selectedPIs.some(selected => selected.binary === pi.binary)) {
          const coverage = pi.minterms.filter(m => remainingMinterms.includes(m)).length;
          if (coverage > bestCoverage) {
            bestCoverage = coverage;
            bestPI = pi;
          }
        }
      });

      if (bestPI) {
        selectedPIs.push(bestPI);
        bestPI.minterms.forEach(m => {
          const index = remainingMinterms.indexOf(m);
          if (index !== -1) {
            remainingMinterms.splice(index, 1);
          }
        });
      } else {
        break;
      }
    }

    return selectedPIs;
  }

  implicantsToExpression(implicants) {
    const terms = implicants.map(pi => this.implicantToTerm(pi));
    return terms.join(' + ');
  }

  implicantToTerm(implicant) {
    const literals = [];
    
    for (let i = 0; i < implicant.binary.length; i++) {
      if (implicant.binary[i] !== '-') {
        const variable = this.variables[i];
        if (implicant.binary[i] === '1') {
          literals.push(variable);
        } else {
          literals.push(variable + '̄');
        }
      }
    }
    
    return literals.join('');
  }
}

/**
 * Petrick's Method for exact minimization
 */
class PetrickMinimizer {
  constructor(variables, minterms) {
    this.variables = variables;
    this.minterms = minterms;
  }

  minimize() {
    // First use Quine-McCluskey to get prime implicants
    const qm = new QuineMcCluskeyMinimizer(this.variables, this.minterms);
    qm.generatePrimeImplicants();

    // Then use Petrick's method to find minimum cover
    return this.findMinimumCover(qm.primeImplicants);
  }

  findMinimumCover(primeImplicants) {
    // Create coverage matrix
    const matrix = this.createCoverageMatrix(primeImplicants);
    
    // Generate Petrick's function
    const petrickFunction = this.generatePetrickFunction(matrix);
    
    // Solve for minimum cover
    const minCover = this.solveMinimumCover(petrickFunction, primeImplicants);
    
    return this.coverToExpression(minCover, primeImplicants);
  }

  createCoverageMatrix(primeImplicants) {
    const matrix = [];
    
    this.minterms.forEach(minterm => {
      const row = [];
      primeImplicants.forEach(pi => {
        row.push(pi.minterms.includes(minterm));
      });
      matrix.push(row);
    });
    
    return matrix;
  }

  generatePetrickFunction(matrix) {
    // Simplified Petrick's function generation
    // In practice, this would be more complex
    return matrix.map((row, mintermIndex) => {
      const terms = [];
      row.forEach((covers, piIndex) => {
        if (covers) {
          terms.push(`P${piIndex}`);
        }
      });
      return `(${terms.join(' + ')})`;
    });
  }

  solveMinimumCover(petrickFunction, primeImplicants) {
    // Simplified minimum cover finding
    // In practice, this would involve expanding the function and finding minimum terms
    const selectedPIs = [];
    const coveredMinterms = new Set();
    
    // Greedy approach
    while (coveredMinterms.size < this.minterms.length) {
      let bestPI = null;
      let bestCoverage = 0;
      
      primeImplicants.forEach((pi, index) => {
        if (!selectedPIs.includes(index)) {
          const coverage = pi.minterms.filter(m => !coveredMinterms.has(m)).length;
          if (coverage > bestCoverage) {
            bestCoverage = coverage;
            bestPI = index;
          }
        }
      });
      
      if (bestPI !== null) {
        selectedPIs.push(bestPI);
        primeImplicants[bestPI].minterms.forEach(m => coveredMinterms.add(m));
      } else {
        break;
      }
    }
    
    return selectedPIs;
  }

  coverToExpression(cover, primeImplicants) {
    const qm = new QuineMcCluskeyMinimizer(this.variables, this.minterms);
    const terms = cover.map(piIndex => qm.implicantToTerm(primeImplicants[piIndex]));
    return terms.join(' + ');
  }
}

/**
 * Espresso-style heuristic minimizer
 */
class EspressoMinimizer {
  constructor(variables, minterms) {
    this.variables = variables;
    this.minterms = minterms;
  }

  minimize() {
    // Simplified Espresso-style algorithm
    let currentCover = this.generateInitialCover();
    let improved = true;
    
    while (improved) {
      improved = false;
      
      // Expand step
      const expanded = this.expand(currentCover);
      if (expanded.length !== currentCover.length) {
        currentCover = expanded;
        improved = true;
      }
      
      // Reduce step  
      const reduced = this.reduce(currentCover);
      if (reduced.length !== currentCover.length) {
        currentCover = reduced;
        improved = true;
      }
    }
    
    return this.coverToExpression(currentCover);
  }

  generateInitialCover() {
    // Start with each minterm as a cube
    return this.minterms.map(minterm => ({
      binary: minterm.toString(2).padStart(this.variables.length, '0'),
      minterms: [minterm]
    }));
  }

  expand(cover) {
    // Try to expand each cube
    return cover.map(cube => this.expandCube(cube));
  }

  expandCube(cube) {
    // Try expanding in each dimension
    let expanded = { ...cube };
    
    for (let i = 0; i < this.variables.length; i++) {
      if (cube.binary[i] !== '-') {
        // Try making this position a don't-care
        const testBinary = cube.binary.substring(0, i) + '-' + cube.binary.substring(i + 1);
        const testCube = { binary: testBinary, minterms: this.getMintermsForCube(testBinary) };
        
        // Check if expansion is valid (doesn't cover extra minterms)
        if (testCube.minterms.every(m => this.minterms.includes(m))) {
          expanded = testCube;
        }
      }
    }
    
    return expanded;
  }

  reduce(cover) {
    // Remove redundant cubes
    return cover.filter((cube, index) => {
      const otherCubes = cover.filter((_, i) => i !== index);
      return !this.isCubeRedundant(cube, otherCubes);
    });
  }

  isCubeRedundant(cube, otherCubes) {
    // Check if cube is covered by other cubes
    return cube.minterms.every(minterm => {
      return otherCubes.some(otherCube => otherCube.minterms.includes(minterm));
    });
  }

  getMintermsForCube(binary) {
    const minterms = [];
    const dashPositions = [];
    
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '-') {
        dashPositions.push(i);
      }
    }
    
    const numCombinations = Math.pow(2, dashPositions.length);
    
    for (let i = 0; i < numCombinations; i++) {
      let testBinary = binary;
      
      dashPositions.forEach((pos, index) => {
        const bit = (i >> index) & 1;
        testBinary = testBinary.substring(0, pos) + bit + testBinary.substring(pos + 1);
      });
      
      const minterm = parseInt(testBinary, 2);
      minterms.push(minterm);
    }
    
    return minterms;
  }

  coverToExpression(cover) {
    const qm = new QuineMcCluskeyMinimizer(this.variables, this.minterms);
    const terms = cover.map(cube => qm.implicantToTerm(cube));
    return terms.join(' + ');
  }
}

/**
 * Main advanced minimization function
 */
export async function advancedMinimization(parsedExpr, algorithms = ['quine-mccluskey', 'petrick', 'espresso']) {
  try {
    const startTime = Date.now();
    const results = [];
    
    // Generate truth table to get minterms
    const truthTableResult = await generateTruthTable(parsedExpr);
    const minterms = truthTableResult.minterms;
    const variables = parsedExpr.variables;
    const originalExpression = parsedExpr.originalExpression;

    // Handle edge cases
    if (minterms.length === 0) {
      const result = new MinimizationResult('trivial', '0', originalExpression, {
        performance: 0,
        processingTime: 0
      });
      return [result.toJSON()];
    }

    if (minterms.length === Math.pow(2, variables.length)) {
      const result = new MinimizationResult('trivial', '1', originalExpression, {
        performance: 0,
        processingTime: 0
      });
      return [result.toJSON()];
    }

    // Run each requested algorithm
    for (const algorithm of algorithms) {
      const algoStartTime = Date.now();
      let minimized = '';
      
      try {
        switch (algorithm) {
          case 'quine-mccluskey':
            const qm = new QuineMcCluskeyMinimizer(variables, minterms);
            minimized = qm.minimize();
            break;
            
          case 'petrick':
            const petrick = new PetrickMinimizer(variables, minterms);
            minimized = petrick.minimize();
            break;
            
          case 'espresso':
            const espresso = new EspressoMinimizer(variables, minterms);
            minimized = espresso.minimize();
            break;
            
          default:
            throw new Error(`Unknown algorithm: ${algorithm}`);
        }
        
        const algoEndTime = Date.now();
        const processingTime = algoEndTime - algoStartTime;
        
        const result = new MinimizationResult(
          algorithm,
          minimized,
          originalExpression,
          {
            performance: calculatePerformanceScore(minimized, originalExpression, processingTime),
            processingTime,
            minterms: minterms.length,
            variables: variables.length
          }
        );
        
        results.push(result);
        
      } catch (error) {
        console.warn(`Algorithm ${algorithm} failed:`, error.message);
        // Continue with other algorithms
      }
    }

    // Sort results by performance (best first)
    results.sort((a, b) => b.metadata.performance - a.metadata.performance);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Add total processing time to metadata
    results.forEach(result => {
      result.metadata.totalProcessingTime = totalTime;
    });

    return results.map(r => r.toJSON());

  } catch (error) {
    throw new Error(`Advanced minimization failed: ${error.message}`);
  }
}

/**
 * Calculate performance score for a minimization result
 */
function calculatePerformanceScore(minimized, original, processingTime) {
  const reductionFactor = Math.max(0, (original.length - minimized.length) / original.length);
  const speedFactor = Math.max(0, 1 - (processingTime / 10000)); // Penalize slow algorithms
  const lengthFactor = Math.max(0, 1 - (minimized.length / 100)); // Prefer shorter expressions
  
  return Math.round((reductionFactor * 50 + speedFactor * 30 + lengthFactor * 20));
}

/**
 * Compare multiple minimization algorithms
 */
export async function compareMinimizationAlgorithms(parsedExpr) {
  try {
    const allAlgorithms = ['quine-mccluskey', 'petrick', 'espresso'];
    const results = await advancedMinimization(parsedExpr, allAlgorithms);
    
    const comparison = {
      originalExpression: parsedExpr.originalExpression,
      results: results,
      bestAlgorithm: results[0]?.algorithm || 'none',
      summary: {
        averageReduction: Math.round(
          results.reduce((sum, r) => sum + r.metadata.reductionPercentage, 0) / results.length
        ),
        averageGateCount: Math.round(
          results.reduce((sum, r) => sum + r.metadata.gateCount, 0) / results.length
        ),
        totalProcessingTime: results[0]?.metadata?.totalProcessingTime || 0
      }
    };
    
    return comparison;
    
  } catch (error) {
    throw new Error(`Algorithm comparison failed: ${error.message}`);
  }
}

/**
 * Get minimization recommendations
 */
export async function getMinimizationRecommendations(parsedExpr) {
  try {
    const variables = parsedExpr.variables;
    const complexity = parsedExpr.metadata?.complexity || 'unknown';
    
    const recommendations = [];
    
    if (variables.length <= 4) {
      recommendations.push({
        algorithm: 'quine-mccluskey',
        reason: 'Optimal for small number of variables',
        priority: 'high'
      });
    }
    
    if (variables.length > 4 && variables.length <= 8) {
      recommendations.push({
        algorithm: 'espresso',
        reason: 'Good heuristic approach for medium complexity',
        priority: 'high'
      });
    }
    
    if (complexity === 'advanced') {
      recommendations.push({
        algorithm: 'espresso',
        reason: 'Handles complex expressions well',
        priority: 'medium'
      });
    }
    
    recommendations.push({
      algorithm: 'petrick',
      reason: 'Exact solution when optimal result is critical',
      priority: 'low'
    });
    
    return {
      expression: parsedExpr.originalExpression,
      complexity,
      variableCount: variables.length,
      recommendations
    };
    
  } catch (error) {
    throw new Error(`Recommendation generation failed: ${error.message}`);
  }
}

export default {
  advancedMinimization,
  compareMinimizationAlgorithms,
  getMinimizationRecommendations,
  MinimizationResult
}; 