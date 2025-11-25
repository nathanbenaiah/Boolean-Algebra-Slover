import { evaluateAST } from './booleanParser.js';

/**
 * Boolean Satisfiability (SAT) Solver
 * Determines if a Boolean expression can be satisfied and finds solutions
 */

export class SATResult {
  constructor(expression, satisfiable, solutions = [], metadata = {}) {
    this.expression = expression;
    this.satisfiable = satisfiable;
    this.solutions = solutions;
    this.solution = solutions.length > 0 ? solutions[0] : null;
    this.allSolutions = solutions;
    this.solutionCount = solutions.length;
    this.metadata = {
      searchTime: 0,
      searchMethod: 'dpll',
      variableCount: 0,
      clauseCount: 0,
      ...metadata
    };
  }

  toJSON() {
    return {
      expression: this.expression,
      satisfiable: this.satisfiable,
      solution: this.solution,
      allSolutions: this.allSolutions,
      solutionCount: this.solutionCount,
      metadata: this.metadata
    };
  }
}

export class SATConstraint {
  constructor(type, variables, value = null) {
    this.type = type; // 'equals', 'not_equals', 'at_least_one', 'at_most_one', 'exactly_one'
    this.variables = variables;
    this.value = value;
  }

  evaluate(assignment) {
    switch (this.type) {
      case 'equals':
        return this.variables.every(v => assignment[v] === this.value);
      case 'not_equals':
        return !this.variables.every(v => assignment[v] === this.value);
      case 'at_least_one':
        return this.variables.some(v => assignment[v] === true);
      case 'at_most_one':
        return this.variables.filter(v => assignment[v] === true).length <= 1;
      case 'exactly_one':
        return this.variables.filter(v => assignment[v] === true).length === 1;
      default:
        return true;
    }
  }
}

/**
 * DPLL Algorithm Implementation
 */
class DPLLSolver {
  constructor(variables, constraints = []) {
    this.variables = variables;
    this.constraints = constraints;
    this.solutions = [];
    this.searchSteps = 0;
  }

  solve(findAllSolutions = false) {
    this.solutions = [];
    this.searchSteps = 0;
    
    const assignment = {};
    this.variables.forEach(v => assignment[v] = undefined);
    
    this.dpll(assignment, 0, findAllSolutions);
    
    return {
      satisfiable: this.solutions.length > 0,
      solutions: this.solutions,
      searchSteps: this.searchSteps
    };
  }

  dpll(assignment, variableIndex, findAllSolutions) {
    this.searchSteps++;
    
    // Base case: all variables assigned
    if (variableIndex === this.variables.length) {
      // Check if this assignment satisfies all constraints
      if (this.satisfiesConstraints(assignment)) {
        this.solutions.push({ ...assignment });
        return !findAllSolutions; // Continue searching if we want all solutions
      }
      return false;
    }

    const variable = this.variables[variableIndex];
    
    // Try assigning true
    assignment[variable] = true;
    if (this.isConsistent(assignment)) {
      if (this.dpll(assignment, variableIndex + 1, findAllSolutions)) {
        return true;
      }
    }
    
    // Try assigning false
    assignment[variable] = false;
    if (this.isConsistent(assignment)) {
      if (this.dpll(assignment, variableIndex + 1, findAllSolutions)) {
        return true;
      }
    }
    
    // Backtrack
    assignment[variable] = undefined;
    return false;
  }

  isConsistent(assignment) {
    // Check if current partial assignment is consistent with constraints
    return this.constraints.every(constraint => {
      // Only check constraints where all involved variables are assigned
      const involvedVariables = constraint.variables;
      const allAssigned = involvedVariables.every(v => assignment[v] !== undefined);
      
      if (allAssigned) {
        return constraint.evaluate(assignment);
      }
      
      // For partial assignments, check if constraint can still be satisfied
      return this.canSatisfyConstraint(constraint, assignment);
    });
  }

  canSatisfyConstraint(constraint, assignment) {
    // Check if constraint can potentially be satisfied given partial assignment
    const assignedVars = constraint.variables.filter(v => assignment[v] !== undefined);
    const unassignedVars = constraint.variables.filter(v => assignment[v] === undefined);
    
    switch (constraint.type) {
      case 'at_least_one':
        // If any assigned variable is true, constraint is satisfied
        if (assignedVars.some(v => assignment[v] === true)) return true;
        // If there are unassigned variables, constraint can still be satisfied
        return unassignedVars.length > 0;
        
      case 'at_most_one':
        // If more than one assigned variable is true, constraint is violated
        return assignedVars.filter(v => assignment[v] === true).length <= 1;
        
      case 'exactly_one':
        const trueCount = assignedVars.filter(v => assignment[v] === true).length;
        if (trueCount > 1) return false;
        if (trueCount === 1) {
          // If one is already true, all others must be false
          return assignedVars.filter(v => assignment[v] === false).length === assignedVars.length - 1;
        }
        // If none are true yet, we need exactly one to be true from remaining
        return unassignedVars.length > 0;
        
      default:
        return true;
    }
  }

  satisfiesConstraints(assignment) {
    return this.constraints.every(constraint => constraint.evaluate(assignment));
  }
}

/**
 * WalkSAT Algorithm Implementation (for harder problems)
 */
class WalkSATSolver {
  constructor(variables, constraints = [], maxFlips = 1000, probability = 0.5) {
    this.variables = variables;
    this.constraints = constraints;
    this.maxFlips = maxFlips;
    this.probability = probability;
  }

  solve() {
    // Start with random assignment
    const assignment = {};
    this.variables.forEach(v => {
      assignment[v] = Math.random() < 0.5;
    });

    for (let flip = 0; flip < this.maxFlips; flip++) {
      if (this.satisfiesAllConstraints(assignment)) {
        return {
          satisfiable: true,
          solutions: [{ ...assignment }],
          searchSteps: flip + 1
        };
      }

      // Find unsatisfied constraints
      const unsatisfiedConstraints = this.constraints.filter(
        constraint => !constraint.evaluate(assignment)
      );

      if (unsatisfiedConstraints.length === 0) break;

      // Pick random unsatisfied constraint
      const constraint = unsatisfiedConstraints[
        Math.floor(Math.random() * unsatisfiedConstraints.length)
      ];

      // With probability p, flip random variable in constraint
      // Otherwise, flip variable that maximizes satisfied constraints
      if (Math.random() < this.probability) {
        const randomVar = constraint.variables[
          Math.floor(Math.random() * constraint.variables.length)
        ];
        assignment[randomVar] = !assignment[randomVar];
      } else {
        let bestVar = null;
        let bestScore = -1;

        constraint.variables.forEach(variable => {
          assignment[variable] = !assignment[variable];
          const score = this.countSatisfiedConstraints(assignment);
          if (score > bestScore) {
            bestScore = score;
            bestVar = variable;
          }
          assignment[variable] = !assignment[variable]; // flip back
        });

        if (bestVar) {
          assignment[bestVar] = !assignment[bestVar];
        }
      }
    }

    return {
      satisfiable: false,
      solutions: [],
      searchSteps: this.maxFlips
    };
  }

  satisfiesAllConstraints(assignment) {
    return this.constraints.every(constraint => constraint.evaluate(assignment));
  }

  countSatisfiedConstraints(assignment) {
    return this.constraints.filter(constraint => constraint.evaluate(assignment)).length;
  }
}

/**
 * Main SAT solving function
 */
export async function solveSAT(parsedExpr, constraints = [], options = {}) {
  try {
    const startTime = Date.now();
    const {
      findAllSolutions = false,
      method = 'auto',
      maxSolutions = 100,
      timeout = 30000
    } = options;

    const variables = parsedExpr.variables;
    const expression = parsedExpr.originalExpression;

    // Convert constraint objects to SATConstraint instances
    const satConstraints = constraints.map(c => 
      new SATConstraint(c.type, c.variables, c.value)
    );

    // Add the main expression as a constraint (must be true)
    satConstraints.push(new SATConstraint('expression', variables, parsedExpr.ast));

    let solver;
    let result;

    // Choose solving method
    if (method === 'dpll' || (method === 'auto' && variables.length <= 10)) {
      solver = new DPLLSolver(variables, satConstraints);
      result = solver.solve(findAllSolutions);
    } else if (method === 'walksat' || (method === 'auto' && variables.length > 10)) {
      solver = new WalkSATSolver(variables, satConstraints);
      result = solver.solve();
    } else {
      // Brute force for small problems
      result = bruteForceSolve(parsedExpr, satConstraints, findAllSolutions);
    }

    // Filter solutions that actually satisfy the main expression
    const validSolutions = result.solutions.filter(solution => {
      const exprResult = evaluateAST(parsedExpr.ast, solution);
      const constraintsResult = satConstraints.every(c => 
        c.type === 'expression' ? exprResult : c.evaluate(solution)
      );
      return exprResult && constraintsResult;
    });

    // Limit number of solutions if requested
    if (maxSolutions && validSolutions.length > maxSolutions) {
      validSolutions.splice(maxSolutions);
    }

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    const satResult = new SATResult(
      expression,
      validSolutions.length > 0,
      validSolutions,
      {
        searchTime,
        searchMethod: method,
        variableCount: variables.length,
        constraintCount: constraints.length,
        searchSteps: result.searchSteps || 0
      }
    );

    return satResult.toJSON();

  } catch (error) {
    throw new Error(`SAT solving failed: ${error.message}`);
  }
}

/**
 * Brute force SAT solver for small problems
 */
function bruteForceSolve(parsedExpr, constraints, findAllSolutions) {
  const variables = parsedExpr.variables;
  const solutions = [];
  const totalCombinations = Math.pow(2, variables.length);

  for (let i = 0; i < totalCombinations; i++) {
    const assignment = {};
    
    // Generate binary assignment
    variables.forEach((variable, index) => {
      const bitPosition = variables.length - 1 - index;
      assignment[variable] = (i & (1 << bitPosition)) !== 0;
    });

    // Check if this assignment satisfies the expression
    const expressionSatisfied = evaluateAST(parsedExpr.ast, assignment);
    
    // Check if this assignment satisfies all constraints
    const constraintsSatisfied = constraints.every(constraint => 
      constraint.type === 'expression' ? expressionSatisfied : constraint.evaluate(assignment)
    );

    if (expressionSatisfied && constraintsSatisfied) {
      solutions.push(assignment);
      if (!findAllSolutions) break;
    }
  }

  return {
    satisfiable: solutions.length > 0,
    solutions,
    searchSteps: totalCombinations
  };
}

/**
 * Check if two Boolean expressions are equivalent using SAT
 */
export async function checkEquivalence(expr1, expr2) {
  try {
    // Create XOR of the two expressions: (expr1 ⊕ expr2)
    // Two expressions are equivalent if their XOR is unsatisfiable
    
    const variables1 = expr1.variables;
    const variables2 = expr2.variables;
    const allVariables = [...new Set([...variables1, ...variables2])];

    // For each variable assignment, check if expr1 and expr2 have the same value
    const solutions = [];
    const totalCombinations = Math.pow(2, allVariables.length);

    for (let i = 0; i < totalCombinations; i++) {
      const assignment = {};
      
      allVariables.forEach((variable, index) => {
        const bitPosition = allVariables.length - 1 - index;
        assignment[variable] = (i & (1 << bitPosition)) !== 0;
      });

      const result1 = evaluateAST(expr1.ast, assignment);
      const result2 = evaluateAST(expr2.ast, assignment);

      if (result1 !== result2) {
        solutions.push({
          assignment,
          expr1Result: result1,
          expr2Result: result2
        });
      }
    }

    return {
      equivalent: solutions.length === 0,
      counterExamples: solutions,
      totalChecked: totalCombinations
    };

  } catch (error) {
    throw new Error(`Equivalence checking failed: ${error.message}`);
  }
}

/**
 * Find satisfying assignments with specific properties
 */
export async function findAssignmentsWithProperties(parsedExpr, properties) {
  try {
    const constraints = [];

    // Convert properties to constraints
    properties.forEach(property => {
      switch (property.type) {
        case 'minimize_true':
          // Find assignments with minimum number of true variables
          constraints.push(new SATConstraint('at_most_one', property.variables));
          break;
        case 'maximize_true':
          // Find assignments with maximum number of true variables
          constraints.push(new SATConstraint('at_least_one', property.variables));
          break;
        case 'balance':
          // Find assignments with roughly equal true/false variables
          const half = Math.floor(property.variables.length / 2);
          constraints.push(new SATConstraint('exactly_one', property.variables.slice(0, half)));
          break;
      }
    });

    return await solveSAT(parsedExpr, constraints, { findAllSolutions: true });

  } catch (error) {
    throw new Error(`Property-based SAT solving failed: ${error.message}`);
  }
}

/**
 * Generate constraints from natural language descriptions
 */
export function parseConstraints(descriptions, variables) {
  const constraints = [];

  descriptions.forEach(desc => {
    const lowerDesc = desc.toLowerCase();

    if (lowerDesc.includes('at most one')) {
      constraints.push(new SATConstraint('at_most_one', variables));
    } else if (lowerDesc.includes('exactly one')) {
      constraints.push(new SATConstraint('exactly_one', variables));
    } else if (lowerDesc.includes('at least one')) {
      constraints.push(new SATConstraint('at_least_one', variables));
    }
    // Add more natural language parsing as needed
  });

  return constraints;
}

export default {
  solveSAT,
  checkEquivalence,
  findAssignmentsWithProperties,
  parseConstraints,
  SATResult,
  SATConstraint
}; 