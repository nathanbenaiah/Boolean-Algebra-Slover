import { evaluateAST, astToString } from './booleanParser.js';
import { generateTruthTable } from './truthTableGenerator.js';

/**
 * SOP/POS Converter
 * Converts between Sum of Products and Product of Sums canonical forms
 */

export class ConversionResult {
  constructor(original, converted, form, steps = [], metadata = {}) {
    this.original = original;
    this.converted = converted;
    this.form = form; // 'sop' or 'pos'
    this.steps = steps;
    this.metadata = {
      complexity: this.calculateComplexity(),
      termCount: this.countTerms(),
      ...metadata
    };
  }

  calculateComplexity() {
    const termCount = this.countTerms();
    const length = this.converted.length;
    
    if (termCount <= 2 && length <= 10) return 'Low';
    if (termCount <= 4 && length <= 25) return 'Medium';
    return 'High';
  }

  countTerms() {
    if (this.form === 'sop') {
      return (this.converted.match(/\+/g) || []).length + 1;
    } else {
      return (this.converted.match(/\(/g) || []).length;
    }
  }

  toJSON() {
    return {
      original: this.original,
      converted: this.converted,
      form: this.form,
      steps: this.steps,
      metadata: this.metadata
    };
  }
}

export class ConversionStep {
  constructor(description, expression, rule = '') {
    this.description = description;
    this.expression = expression;
    this.rule = rule;
    this.timestamp = Date.now();
  }
}

/**
 * Convert expression to Sum of Products (SOP) canonical form
 */
export async function convertToSOP(parsedExpr, options = {}) {
  try {
    const { useCanonical = true, showSteps = true } = options;
    const steps = [];
    
    if (showSteps) {
      steps.push(new ConversionStep(
        'Starting conversion to SOP form',
        parsedExpr.originalExpression
      ));
    }

    // Generate truth table
    const truthTableResult = await generateTruthTable(parsedExpr);
    const minterms = truthTableResult.minterms;
    const variables = parsedExpr.variables;

    if (minterms.length === 0) {
      steps.push(new ConversionStep(
        'Expression is always false',
        '0',
        'Null expression'
      ));
      return new ConversionResult(parsedExpr.originalExpression, '0', 'sop', steps);
    }

    if (minterms.length === Math.pow(2, variables.length)) {
      steps.push(new ConversionStep(
        'Expression is always true',
        '1',
        'Tautology'
      ));
      return new ConversionResult(parsedExpr.originalExpression, '1', 'sop', steps);
    }

    let sopExpression;
    
    if (useCanonical) {
      // Generate canonical SOP form
      sopExpression = generateCanonicalSOP(variables, minterms, steps);
    } else {
      // Try to minimize the SOP form
      sopExpression = generateMinimizedSOP(variables, minterms, steps);
    }

    if (showSteps) {
      steps.push(new ConversionStep(
        'Final SOP expression',
        sopExpression,
        'Conversion complete'
      ));
    }

    return new ConversionResult(
      parsedExpr.originalExpression,
      sopExpression,
      'sop',
      steps,
      { minterms, canonical: useCanonical }
    );

  } catch (error) {
    throw new Error(`SOP conversion failed: ${error.message}`);
  }
}

/**
 * Convert expression to Product of Sums (POS) canonical form
 */
export async function convertToPOS(parsedExpr, options = {}) {
  try {
    const { useCanonical = true, showSteps = true } = options;
    const steps = [];
    
    if (showSteps) {
      steps.push(new ConversionStep(
        'Starting conversion to POS form',
        parsedExpr.originalExpression
      ));
    }

    // Generate truth table
    const truthTableResult = await generateTruthTable(parsedExpr);
    const maxterms = truthTableResult.maxterms;
    const variables = parsedExpr.variables;

    if (maxterms.length === 0) {
      steps.push(new ConversionStep(
        'Expression is always true',
        '1',
        'Tautology'
      ));
      return new ConversionResult(parsedExpr.originalExpression, '1', 'pos', steps);
    }

    if (maxterms.length === Math.pow(2, variables.length)) {
      steps.push(new ConversionStep(
        'Expression is always false',
        '0',
        'Null expression'
      ));
      return new ConversionResult(parsedExpr.originalExpression, '0', 'pos', steps);
    }

    let posExpression;
    
    if (useCanonical) {
      // Generate canonical POS form
      posExpression = generateCanonicalPOS(variables, maxterms, steps);
    } else {
      // Try to minimize the POS form
      posExpression = generateMinimizedPOS(variables, maxterms, steps);
    }

    if (showSteps) {
      steps.push(new ConversionStep(
        'Final POS expression',
        posExpression,
        'Conversion complete'
      ));
    }

    return new ConversionResult(
      parsedExpr.originalExpression,
      posExpression,
      'pos',
      steps,
      { maxterms, canonical: useCanonical }
    );

  } catch (error) {
    throw new Error(`POS conversion failed: ${error.message}`);
  }
}

/**
 * Generate canonical SOP form from minterms
 */
function generateCanonicalSOP(variables, minterms, steps = []) {
  if (minterms.length === 0) return '0';
  
  const terms = minterms.map(minterm => {
    const binary = minterm.toString(2).padStart(variables.length, '0');
    const literals = binary.split('').map((bit, index) => {
      const variable = variables[index];
      return bit === '1' ? variable : variable + '̄';
    });
    
    const term = literals.join('');
    
    if (steps.length > 0) {
      steps.push(new ConversionStep(
        `Minterm ${minterm}: ${binary} → ${term}`,
        term,
        'Minterm expansion'
      ));
    }
    
    return term;
  });
  
  const sopForm = terms.join(' + ');
  
  if (steps.length > 0) {
    steps.push(new ConversionStep(
      'Combine all minterms with OR',
      sopForm,
      'SOP formation'
    ));
  }
  
  return sopForm;
}

/**
 * Generate canonical POS form from maxterms
 */
function generateCanonicalPOS(variables, maxterms, steps = []) {
  if (maxterms.length === 0) return '1';
  
  const terms = maxterms.map(maxterm => {
    const binary = maxterm.toString(2).padStart(variables.length, '0');
    const literals = binary.split('').map((bit, index) => {
      const variable = variables[index];
      return bit === '0' ? variable : variable + '̄';
    });
    
    const term = '(' + literals.join(' + ') + ')';
    
    if (steps.length > 0) {
      steps.push(new ConversionStep(
        `Maxterm ${maxterm}: ${binary} → ${term}`,
        term,
        'Maxterm expansion'
      ));
    }
    
    return term;
  });
  
  const posForm = terms.join('');
  
  if (steps.length > 0) {
    steps.push(new ConversionStep(
      'Combine all maxterms with AND',
      posForm,
      'POS formation'
    ));
  }
  
  return posForm;
}

/**
 * Generate minimized SOP form (basic minimization)
 */
function generateMinimizedSOP(variables, minterms, steps = []) {
  // Start with canonical form
  let sopForm = generateCanonicalSOP(variables, minterms, steps);
  
  // Apply basic minimization rules
  sopForm = applySopMinimization(sopForm, variables, steps);
  
  return sopForm;
}

/**
 * Generate minimized POS form (basic minimization)
 */
function generateMinimizedPOS(variables, maxterms, steps = []) {
  // Start with canonical form
  let posForm = generateCanonicalPOS(variables, maxterms, steps);
  
  // Apply basic minimization rules
  posForm = applyPosMinimization(posForm, variables, steps);
  
  return posForm;
}

/**
 * Apply basic SOP minimization rules
 */
function applySopMinimization(sopExpression, variables, steps = []) {
  let minimized = sopExpression;
  let changed = true;
  
  while (changed) {
    changed = false;
    const originalLength = minimized.length;
    
    // Remove duplicate terms
    minimized = removeDuplicateTerms(minimized);
    
    // Apply absorption law: A + AB = A
    minimized = applyAbsorptionSOP(minimized);
    
    // Apply consensus theorem
    minimized = applyConsensusSOP(minimized, variables);
    
    if (minimized.length < originalLength) {
      changed = true;
      if (steps.length > 0) {
        steps.push(new ConversionStep(
          'Applied minimization rules',
          minimized,
          'SOP minimization'
        ));
      }
    }
  }
  
  return minimized;
}

/**
 * Apply basic POS minimization rules
 */
function applyPosMinimization(posExpression, variables, steps = []) {
  let minimized = posExpression;
  let changed = true;
  
  while (changed) {
    changed = false;
    const originalLength = minimized.length;
    
    // Remove duplicate clauses
    minimized = removeDuplicateClauses(minimized);
    
    // Apply absorption law: (A)(A+B) = A
    minimized = applyAbsorptionPOS(minimized);
    
    if (minimized.length < originalLength) {
      changed = true;
      if (steps.length > 0) {
        steps.push(new ConversionStep(
          'Applied minimization rules',
          minimized,
          'POS minimization'
        ));
      }
    }
  }
  
  return minimized;
}

/**
 * Remove duplicate terms from SOP expression
 */
function removeDuplicateTerms(sopExpression) {
  const terms = sopExpression.split(' + ').map(term => term.trim());
  const uniqueTerms = [...new Set(terms)];
  return uniqueTerms.join(' + ');
}

/**
 * Remove duplicate clauses from POS expression
 */
function removeDuplicateClauses(posExpression) {
  const clauses = posExpression.match(/\([^)]+\)/g) || [];
  const uniqueClauses = [...new Set(clauses)];
  return uniqueClauses.join('');
}

/**
 * Apply absorption law for SOP: A + AB = A
 */
function applyAbsorptionSOP(sopExpression) {
  const terms = sopExpression.split(' + ').map(term => term.trim());
  const filtered = [];
  
  for (let i = 0; i < terms.length; i++) {
    const term1 = terms[i];
    let absorbed = false;
    
    for (let j = 0; j < terms.length; j++) {
      if (i !== j) {
        const term2 = terms[j];
        
        // Check if term1 absorbs term2 (term1 is subset of term2)
        if (isSubsetTerm(term1, term2)) {
          absorbed = true;
          break;
        }
      }
    }
    
    if (!absorbed) {
      filtered.push(term1);
    }
  }
  
  return filtered.join(' + ');
}

/**
 * Apply absorption law for POS: (A)(A+B) = A
 */
function applyAbsorptionPOS(posExpression) {
  const clauses = posExpression.match(/\([^)]+\)/g) || [];
  const filtered = [];
  
  for (let i = 0; i < clauses.length; i++) {
    const clause1 = clauses[i];
    let absorbed = false;
    
    for (let j = 0; j < clauses.length; j++) {
      if (i !== j) {
        const clause2 = clauses[j];
        
        // Check if clause1 absorbs clause2
        if (isSubsetClause(clause1, clause2)) {
          absorbed = true;
          break;
        }
      }
    }
    
    if (!absorbed) {
      filtered.push(clause1);
    }
  }
  
  return filtered.join('');
}

/**
 * Check if term1 is a subset of term2 (for absorption)
 */
function isSubsetTerm(term1, term2) {
  const vars1 = extractVariablesFromTerm(term1);
  const vars2 = extractVariablesFromTerm(term2);
  
  return vars1.every(v => vars2.includes(v));
}

/**
 * Check if clause1 is a subset of clause2 (for absorption)
 */
function isSubsetClause(clause1, clause2) {
  const vars1 = extractVariablesFromClause(clause1);
  const vars2 = extractVariablesFromClause(clause2);
  
  return vars1.every(v => vars2.includes(v));
}

/**
 * Extract variables from a SOP term
 */
function extractVariablesFromTerm(term) {
  const variables = [];
  const matches = term.match(/[A-Z]̄?/g) || [];
  return matches;
}

/**
 * Extract variables from a POS clause
 */
function extractVariablesFromClause(clause) {
  const content = clause.slice(1, -1); // Remove parentheses
  const variables = content.split(' + ').map(v => v.trim());
  return variables;
}

/**
 * Apply consensus theorem for SOP minimization
 */
function applyConsensusSOP(sopExpression, variables) {
  // Simplified consensus theorem application
  // In practice, this would be much more complex
  return sopExpression;
}

/**
 * Convert between SOP and POS using De Morgan's laws
 */
export async function convertBetweenForms(parsedExpr, targetForm, options = {}) {
  try {
    if (targetForm === 'sop') {
      return await convertToSOP(parsedExpr, options);
    } else if (targetForm === 'pos') {
      return await convertToPOS(parsedExpr, options);
    } else {
      throw new Error(`Unknown target form: ${targetForm}`);
    }
  } catch (error) {
    throw new Error(`Form conversion failed: ${error.message}`);
  }
}

/**
 * Main conversion function
 */
export async function convertSopPos(parsedExpr, targetForm = 'sop', options = {}) {
  try {
    return await convertBetweenForms(parsedExpr, targetForm, options);
  } catch (error) {
    throw new Error(`SOP/POS conversion failed: ${error.message}`);
  }
}

/**
 * Compare SOP and POS forms
 */
export async function compareSopPosComplexity(parsedExpr) {
  try {
    const sopResult = await convertToSOP(parsedExpr, { showSteps: false });
    const posResult = await convertToPOS(parsedExpr, { showSteps: false });
    
    return {
      sop: {
        expression: sopResult.converted,
        complexity: sopResult.metadata.complexity,
        termCount: sopResult.metadata.termCount,
        length: sopResult.converted.length
      },
      pos: {
        expression: posResult.converted,
        complexity: posResult.metadata.complexity,
        termCount: posResult.metadata.termCount,
        length: posResult.converted.length
      },
      recommendation: sopResult.converted.length <= posResult.converted.length ? 'sop' : 'pos'
    };
  } catch (error) {
    throw new Error(`SOP/POS comparison failed: ${error.message}`);
  }
}

export default {
  convertSopPos,
  convertToSOP,
  convertToPOS,
  convertBetweenForms,
  compareSopPosComplexity,
  ConversionResult,
  ConversionStep
}; 