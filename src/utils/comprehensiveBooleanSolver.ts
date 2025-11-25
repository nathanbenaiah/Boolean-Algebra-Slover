// Comprehensive Boolean Algebra Solver
// Handles all gate types: OR, AND, NAND, NOR, XOR, XNOR
// Provides step-by-step simplification using pure Boolean laws

import type { CircuitNode, CircuitEdge, LogicCircuit as CircuitType } from './circuitGenerator';
import type { KarnaughMap as KMapType } from './karnaughMapGenerator';

export interface BooleanVariable {
  name: string;
  negated?: boolean;
}

export interface BooleanExpression {
  type: 'variable' | 'constant' | 'and' | 'or' | 'not' | 'xor' | 'xnor' | 'nand' | 'nor';
  value?: boolean | string;
  variable?: BooleanVariable;
  operands?: BooleanExpression[];
}

export interface SimplificationStep {
  step: number;
  expression: string;
  rule: string;
  description: string;
  lawApplied: string;
  beforeExpression?: string;
  afterExpression?: string;
}

export interface TruthTableRow {
  inputs: { [variable: string]: boolean };
  output: boolean;
  minterm?: number;
  maxterm?: number;
}

export interface KMapCell {
  row: number;
  col: number;
  value: boolean;
  inputs: { [variable: string]: boolean };
  minterm: number;
}

export interface KMapGroup {
  id: string;
  cells: KMapCell[];
  term: string;
  size: number;
}

export interface KarnaughMap {
  variables: string[];
  cells: KMapCell[][];
  groups: KMapGroup[];
  simplifiedSOP: string;
  simplifiedPOS: string;
  rowLabels: string[];
  colLabels: string[];
  dimensions: { rows: number; cols: number };
}

export interface LogicCircuit {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  inputs: string[];
  outputs: string[];
  levels: number;
  gateCount: { [key: string]: number };
  complexity: number;
}

export interface ComprehensiveResult {
  originalExpression: string;
  simplifiedExpression: string;
  steps: SimplificationStep[];
  truthTable: TruthTableRow[];
  karnaughMap: KarnaughMap | KMapType;
  logicCircuit: LogicCircuit;
  parsed?: BooleanExpression;
  lawsApplied: string[];
  complexity: {
    original: number;
    simplified: number;
    reduction: number;
  };
  gatesUsed: string[];
  visualizations: {
    kMapElement?: HTMLElement;
    circuitElement?: HTMLElement;
  };
}

// Boolean Laws with formulas and descriptions
const BOOLEAN_LAWS = {
  IDENTITY: {
    name: 'Identity Law',
    formulas: ['A + 0 = A', 'A · 1 = A'],
    description: 'Adding 0 or multiplying by 1 leaves the variable unchanged'
  },
  NULL: {
    name: 'Null Law',
    formulas: ['A + 1 = 1', 'A · 0 = 0'],
    description: 'Adding 1 always gives 1, multiplying by 0 always gives 0'
  },
  IDEMPOTENT: {
    name: 'Idempotent Law',
    formulas: ['A + A = A', 'A · A = A'],
    description: 'A variable combined with itself remains unchanged'
  },
  COMPLEMENT: {
    name: 'Complement Law',
    formulas: ['A + A\' = 1', 'A · A\' = 0', '(A\')\'= A'],
    description: 'A variable combined with its complement gives 1 (OR) or 0 (AND)'
  },
  DE_MORGAN: {
    name: 'De Morgan\'s Law',
    formulas: ['(A + B)\' = A\' · B\'', '(A · B)\' = A\' + B\''],
    description: 'Complement of OR/AND becomes AND/OR of complements'
  },
  ABSORPTION: {
    name: 'Absorption Law',
    formulas: ['A + A · B = A', 'A · (A + B) = A'],
    description: 'A variable absorbs terms containing itself'
  },
  DISTRIBUTIVE: {
    name: 'Distributive Law',
    formulas: ['A · (B + C) = A · B + A · C', 'A + (B · C) = (A + B) · (A + C)'],
    description: 'AND distributes over OR, and vice versa'
  },
  CONSENSUS: {
    name: 'Consensus Law',
    formulas: ['A · B + A\' · C + B · C = A · B + A\' · C'],
    description: 'Redundant terms can be eliminated'
  },
  XOR_PROPERTIES: {
    name: 'XOR Properties',
    formulas: [
      'A ⊕ A = 0',
      'A ⊕ 0 = A',
      'A ⊕ 1 = A\'',
      '(A ⊕ B) · (A ⊙ B) = 0'
    ],
    description: 'Special properties of XOR and XNOR gates'
  },
  XNOR_PROPERTIES: {
    name: 'XNOR Properties',
    formulas: [
      'A ⊙ A = 1',
      'A ⊙ 0 = A\'',
      'A ⊙ 1 = A',
      'A ⊙ B = AB + A\'B\''
    ],
    description: 'Special properties of XNOR gates'
  },
  GATE_EXPANSION: {
    name: 'Gate Expansion',
    formulas: [
      'A ↑ B = (A · B)\'',
      'A ↓ B = (A + B)\'',
      'A ⊕ B = A\' · B + A · B\'',
      'A ⊙ B = A · B + A\' · B\''
    ],
    description: 'Complex gates expanded to basic AND/OR/NOT form'
  }
};

// Parse expression string into BooleanExpression tree
export function parseExpression(expression: string): BooleanExpression {
  const cleaned = expression.replace(/\s+/g, '').trim();
  
  // Handle constants
  if (cleaned === '0' || cleaned === 'false') {
    return { type: 'constant', value: false };
  }
  if (cleaned === '1' || cleaned === 'true') {
    return { type: 'constant', value: true };
  }
  
  // Handle parentheses
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    let parenCount = 0;
    let isFullyParenthesized = true;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '(') parenCount++;
      if (cleaned[i] === ')') parenCount--;
      if (parenCount === 0 && i < cleaned.length - 1) {
        isFullyParenthesized = false;
        break;
      }
    }
    if (isFullyParenthesized) {
      return parseExpression(cleaned.slice(1, -1));
    }
  }
  
  // Handle negation
  if (cleaned.startsWith('(') && cleaned.endsWith(')\'')){
    const inner = cleaned.slice(1, -2);
    return { type: 'not', operands: [parseExpression(inner)] };
  }
  
  // Handle XOR (⊕)
  const xorIndex = findMainOperator(cleaned, '⊕');
  if (xorIndex !== -1) {
    return {
      type: 'xor',
      operands: [
        parseExpression(cleaned.slice(0, xorIndex)),
        parseExpression(cleaned.slice(xorIndex + 1))
      ]
    };
  }
  
  // Handle XNOR (⊙)
  const xnorIndex = findMainOperator(cleaned, '⊙');
  if (xnorIndex !== -1) {
    return {
      type: 'xnor',
      operands: [
        parseExpression(cleaned.slice(0, xnorIndex)),
        parseExpression(cleaned.slice(xnorIndex + 1))
      ]
    };
  }
  
  // Handle NOR (↓)
  const norIndex = findMainOperator(cleaned, '↓');
  if (norIndex !== -1) {
    return {
      type: 'nor',
      operands: [
        parseExpression(cleaned.slice(0, norIndex)),
        parseExpression(cleaned.slice(norIndex + 1))
      ]
    };
  }
  
  // Handle NAND (↑)
  const nandIndex = findMainOperator(cleaned, '↑');
  if (nandIndex !== -1) {
    return {
      type: 'nand',
      operands: [
        parseExpression(cleaned.slice(0, nandIndex)),
        parseExpression(cleaned.slice(nandIndex + 1))
      ]
    };
  }
  
  // Handle OR (+)
  const orIndex = findMainOperator(cleaned, '+');
  if (orIndex !== -1) {
    return {
      type: 'or',
      operands: [
        parseExpression(cleaned.slice(0, orIndex)),
        parseExpression(cleaned.slice(orIndex + 1))
      ]
    };
  }
  
  // Handle AND (·)
  const andIndex = findMainOperator(cleaned, '·');
  if (andIndex !== -1) {
    return {
      type: 'and',
      operands: [
        parseExpression(cleaned.slice(0, andIndex)),
        parseExpression(cleaned.slice(andIndex + 1))
      ]
    };
  }
  
  // Handle implicit AND (adjacent variables)
  if (cleaned.length > 1 && /^[A-Z]'?[A-Z]'?/.test(cleaned)) {
    const variables = extractVariables(cleaned);
    if (variables.length > 1) {
      return {
        type: 'and',
        operands: variables.map(v => ({ 
          type: 'variable' as const, 
          variable: { name: v.replace('\'', ''), negated: v.includes('\'') }
        }))
      };
    }
  }
  
  // Handle single variable
  if (/^[A-Z]'?$/.test(cleaned)) {
    const negated = cleaned.includes('\'');
    const name = cleaned.replace('\'', '');
    return { 
      type: 'variable', 
      variable: { name, negated }
    };
  }
  
  throw new Error(`Unable to parse expression: ${cleaned}`);
}

// Find the main operator at the current level (not inside parentheses)
function findMainOperator(expr: string, operator: string): number {
  let parenCount = 0;
  for (let i = expr.length - 1; i >= 0; i--) {
    if (expr[i] === ')') parenCount++;
    if (expr[i] === '(') parenCount--;
    if (parenCount === 0 && expr.slice(i, i + operator.length) === operator) {
      return i;
    }
  }
  return -1;
}

// Extract variable names from expression
function extractVariables(expr: string): string[] {
  const matches = expr.match(/[A-Z]'?/g) || [];
  return matches;
}

// Convert expression back to string
export function expressionToString(expr: BooleanExpression): string {
  switch (expr.type) {
    case 'constant':
      return expr.value ? '1' : '0';
    case 'variable':
      return expr.variable!.name + (expr.variable!.negated ? '\'' : '');
    case 'not':
      return `(${expressionToString(expr.operands![0])})'`;
    case 'and':
      return expr.operands!.map(op => expressionToString(op)).join('·');
    case 'or':
      return expr.operands!.map(op => expressionToString(op)).join(' + ');
    case 'xor':
      return `${expressionToString(expr.operands![0])} ⊕ ${expressionToString(expr.operands![1])}`;
    case 'xnor':
      return `${expressionToString(expr.operands![0])} ⊙ ${expressionToString(expr.operands![1])}`;
    case 'nand':
      return `${expressionToString(expr.operands![0])} ↑ ${expressionToString(expr.operands![1])}`;
    case 'nor':
      return `${expressionToString(expr.operands![0])} ↓ ${expressionToString(expr.operands![1])}`;
    default:
      return '';
  }
}

// Evaluate expression with given variable values
export function evaluateExpression(expr: BooleanExpression, values: { [variable: string]: boolean }): boolean {
  switch (expr.type) {
    case 'constant':
      return expr.value as boolean;
    case 'variable':
      const varValue = values[expr.variable!.name];
      return expr.variable!.negated ? !varValue : varValue;
    case 'not':
      return !evaluateExpression(expr.operands![0], values);
    case 'and':
      return expr.operands!.every(op => evaluateExpression(op, values));
    case 'or':
      return expr.operands!.some(op => evaluateExpression(op, values));
    case 'xor':
      const xorResults = expr.operands!.map(op => evaluateExpression(op, values));
      return xorResults[0] !== xorResults[1];
    case 'xnor':
      const xnorResults = expr.operands!.map(op => evaluateExpression(op, values));
      return xnorResults[0] === xnorResults[1];
    case 'nand':
      return !expr.operands!.every(op => evaluateExpression(op, values));
    case 'nor':
      return !expr.operands!.some(op => evaluateExpression(op, values));
    default:
      return false;
  }
}

// Get all variables from expression
export function getVariables(expr: BooleanExpression): string[] {
  const variables = new Set<string>();
  
  function collect(e: BooleanExpression) {
    if (e.type === 'variable') {
      variables.add(e.variable!.name);
    } else if (e.operands) {
      e.operands.forEach(collect);
    }
  }
  
  collect(expr);
  return Array.from(variables).sort();
}

// Generate complete truth table
export function generateTruthTable(expr: BooleanExpression): TruthTableRow[] {
  const variables = getVariables(expr);
  const rows: TruthTableRow[] = [];
  const numRows = Math.pow(2, variables.length);
  
  for (let i = 0; i < numRows; i++) {
    const inputs: { [variable: string]: boolean } = {};
    
    variables.forEach((variable, index) => {
      const bitPosition = variables.length - 1 - index;
      inputs[variable] = (i & (1 << bitPosition)) !== 0;
    });
    
    const output = evaluateExpression(expr, inputs);
    
    rows.push({
      inputs,
      output,
      minterm: output ? i : undefined,
      maxterm: !output ? i : undefined
    });
  }
  
  return rows;
}

// Calculate expression complexity (more sophisticated measurement)
function calculateComplexity(exprStr: string): number {
  // Count different types with different weights
  const operators = (exprStr.match(/[+·⊕⊙↑↓]/g) || []).length * 2; // Binary operators cost more
  const negations = (exprStr.match(/'/g) || []).length * 1; // Negations are simpler
  const parentheses = (exprStr.match(/[()]/g) || []).length * 0.5; // Parentheses add some complexity
  const variables = (exprStr.match(/[A-Z]/g) || []).length * 1; // Variables are basic
  
  // Penalize long expressions and repeated patterns
  const lengthPenalty = exprStr.length * 0.1;
  
  return Math.round(operators + negations + parentheses + variables + lengthPenalty);
}

// Comprehensive Boolean simplification with step-by-step explanations
export function comprehensiveSimplify(expression: string): ComprehensiveResult {
  const originalExpr = parseExpression(expression);
  const variables = getVariables(originalExpr);
  const truthTable = generateTruthTable(originalExpr);
  const steps: SimplificationStep[] = [];
  const lawsApplied: string[] = [];
  let currentExpr = originalExpr;
  let stepCount = 1;
  
  // Add the starting step
  steps.push({
    step: stepCount++,
    expression: expression,
    rule: 'Start',
    description: 'Original Boolean expression',
    lawApplied: 'Start',
    beforeExpression: '',
    afterExpression: expression
  });
  
  // Step 1: CONDITIONALLY expand complex gates (only if beneficial)
  const originalComplexityBeforeExpansion = calculateComplexity(expression);
  const { expanded, expansionSteps } = expandComplexGates(currentExpr);
  const expandedComplexity = calculateComplexity(expressionToString(expanded));
  
  // Only apply expansion if it's a simple expression or if expansion enables further simplification
  const shouldExpand = variables.length <= 2 || 
                      (expandedComplexity <= originalComplexityBeforeExpansion * 1.5) ||
                      expression.includes('⊕') || expression.includes('⊙') || 
                      expression.includes('↑') || expression.includes('↓');
  
  if (shouldExpand && expansionSteps.length > 0) {
    steps.push(...expansionSteps.map((step, index) => ({
      step: stepCount + index,
      expression: step.expression,
      rule: step.rule,
      description: step.description,
      lawApplied: step.rule,
      beforeExpression: step.beforeExpression,
      afterExpression: step.afterExpression
    })));
    stepCount += expansionSteps.length;
    currentExpr = expanded;
  }
  
  // Step 2: Apply Boolean algebra laws iteratively
  let changed = true;
  let iteration = 0;
  const maxIterations = 25; // Increased for more thorough simplification
  
  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;
    const beforeSimplification = expressionToString(currentExpr);
    
    // Apply each law in optimal order for MAXIMUM SIMPLIFICATION (not expansion)
    // CRITICAL: Simplification laws FIRST, expansion laws ONLY when absolutely necessary
    const lawApplications = [
      // Phase 1: IMMEDIATE simplification laws (always beneficial, never expand)
      () => applyComplementLaws(currentExpr),      // A + A' = 1, A · A' = 0
      () => applyIdentityAndNullLaws(currentExpr), // A + 0 = A, A · 1 = A
      () => applyIdempotentLaws(currentExpr),      // A + A = A, A · A = A
      
      // Phase 2: ADVANCED simplification patterns (high priority)
      () => applyAbsorptionLaws(currentExpr),      // A + AB = A, A(A + B) = A
      () => applyXORSpecialRules(currentExpr),     // A ⊕ A = 0, A ⊕ 0 = A
      
      // Phase 3: PATTERN recognition for complex expressions
      () => recognizeAdvancedPatterns(currentExpr), // Complex pattern matching
      
      // Phase 4: STRUCTURAL transformations (use with EXTREME caution)
      () => applyDeMorganLaws(currentExpr),        // Only if genuinely helpful
      () => applyConsensusLaw(currentExpr),        // Only for specific patterns
      
      // Phase 5: LAST RESORT - Distributive law (usually expands, avoid if possible)
      () => applyDistributiveLaws(currentExpr)     // Only if all else fails and beneficial
    ];
    
    for (const applyLaw of lawApplications) {
      const result = applyLaw();
      if (result.changed) {
        const newExprStr = expressionToString(result.expression);
        
        // Calculate complexity to ensure we're actually simplifying
        const oldComplexity = calculateComplexity(expressionToString(currentExpr));
        const newComplexity = calculateComplexity(newExprStr);
        
        // Be VERY strict about complexity - only allow changes that genuinely reduce complexity
        const isGenuineSimplification = newComplexity < oldComplexity;
        const isNeutralSimplification = newComplexity === oldComplexity && newExprStr.length <= expressionToString(currentExpr).length;
        
        // Only allow beneficial transformations for specific cases
        const isBeneficialTransformation = (result.lawApplied.includes('De Morgan') && newComplexity <= oldComplexity * 1.1) ||
                                         (result.lawApplied.includes('Double Negation') && newComplexity < oldComplexity);
        
        // STRICT RULE: Only apply if it actually simplifies or is neutral
        if (newExprStr !== beforeSimplification && 
            (isGenuineSimplification || isNeutralSimplification || isBeneficialTransformation)) {
          steps.push({
            step: stepCount++,
            expression: newExprStr,
            rule: result.lawApplied,
            description: result.description,
            lawApplied: result.lawApplied,
            beforeExpression: beforeSimplification,
            afterExpression: newExprStr
          });
          
          if (!lawsApplied.includes(result.lawApplied)) {
            lawsApplied.push(result.lawApplied);
          }
          
          currentExpr = result.expression;
          changed = true;
          break;
        }
      }
    }
    
    // Additional check: If no laws applied in this iteration, try one more pass
    // with advanced pattern recognition only
    if (!changed && iteration < maxIterations - 1) {
      const finalPatternResult = recognizeAdvancedPatterns(currentExpr);
      if (finalPatternResult.changed) {
        const finalExprStr = expressionToString(finalPatternResult.expression);
        if (finalExprStr !== beforeSimplification) {
          steps.push({
            step: stepCount++,
            expression: finalExprStr,
            rule: finalPatternResult.lawApplied,
            description: finalPatternResult.description,
            lawApplied: finalPatternResult.lawApplied,
            beforeExpression: beforeSimplification,
            afterExpression: finalExprStr
          });
          
          if (!lawsApplied.includes(finalPatternResult.lawApplied)) {
            lawsApplied.push(finalPatternResult.lawApplied);
          }
          
          currentExpr = finalPatternResult.expression;
          changed = true;
        }
      }
    }
  }
  
  // Step 3: Generate Karnaugh Map for further optimization
  const karnaughMap = generateKMapWithD3(originalExpr);
  
  // Step 3.5: Generate Logic Circuit
  const logicCircuit = generateLogicCircuit(originalExpr);
  
  // Step 4: Calculate complexity metrics
  const originalComplexity = calculateComplexity(expression);
  const simplifiedString = expressionToString(currentExpr);
  const simplifiedComplexity = calculateComplexity(simplifiedString);
  const reduction = originalComplexity > 0 ? 
    Math.round(((originalComplexity - simplifiedComplexity) / originalComplexity) * 100) : 0;
  
  // Always add final step explicitly, even if no intermediate steps were generated
  const lastStepExpression = steps.length > 0 ? steps[steps.length - 1].expression : expression;
  if (simplifiedString !== lastStepExpression || steps.length === 1) {
    // Only add final step if it's different from the last step, or if we only have the start step
    const finalStepExists = steps.some(step => step.rule === 'Final Simplified Expression' || (step.rule !== 'Start' && step.expression === simplifiedString));
    if (!finalStepExists) {
      steps.push({
        step: stepCount++,
        expression: simplifiedString,
        rule: 'Final Simplified Expression',
        description: 'This is the most simplified form of your Boolean expression.',
        lawApplied: 'Final Result',
        beforeExpression: lastStepExpression,
        afterExpression: simplifiedString
      });
    }
  }
  
  // Step 5: Detect gates used
  const gatesUsed = detectGatesUsed(expression);
  
  return {
    originalExpression: expression,
    simplifiedExpression: simplifiedString,
    steps,
    truthTable,
    karnaughMap,
    logicCircuit,
    parsed: originalExpr,
    lawsApplied,
    complexity: {
      original: originalComplexity,
      simplified: simplifiedComplexity,
      reduction
    },
    gatesUsed,
    visualizations: {}
  };
}

interface ExpansionStep {
  expression: string;
  rule: string;
  description: string;
  beforeExpression: string;
  afterExpression?: string;
}

// Expand complex gates to basic AND/OR/NOT
function expandComplexGates(expr: BooleanExpression): { expanded: BooleanExpression; expansionSteps: ExpansionStep[] } {
  const steps: ExpansionStep[] = [];
  
  function expand(e: BooleanExpression): BooleanExpression {
    switch (e.type) {
      case 'xor':
        // A ⊕ B = A'B + AB'
        steps.push({
          expression: `${expressionToString(e.operands![0])}'·${expressionToString(e.operands![1])} + ${expressionToString(e.operands![0])}·${expressionToString(e.operands![1])}'`,
          rule: BOOLEAN_LAWS.GATE_EXPANSION.name,
          description: `XOR gate expanded: ${expressionToString(e)} = A'B + AB'`,
          beforeExpression: expressionToString(e)
        });
        return {
          type: 'or',
          operands: [
            {
              type: 'and',
              operands: [
                { type: 'not', operands: [expand(e.operands![0])] },
                expand(e.operands![1])
              ]
            },
            {
              type: 'and',
              operands: [
                expand(e.operands![0]),
                { type: 'not', operands: [expand(e.operands![1])] }
              ]
            }
          ]
        };
        
      case 'xnor':
        // A ⊙ B = AB + A'B'
        steps.push({
          expression: `${expressionToString(e.operands![0])}·${expressionToString(e.operands![1])} + ${expressionToString(e.operands![0])}'·${expressionToString(e.operands![1])}'`,
          rule: BOOLEAN_LAWS.GATE_EXPANSION.name,
          description: `XNOR gate expanded: ${expressionToString(e)} = AB + A'B'`,
          beforeExpression: expressionToString(e)
        });
        return {
          type: 'or',
          operands: [
            {
              type: 'and',
              operands: [expand(e.operands![0]), expand(e.operands![1])]
            },
            {
              type: 'and',
              operands: [
                { type: 'not', operands: [expand(e.operands![0])] },
                { type: 'not', operands: [expand(e.operands![1])] }
              ]
            }
          ]
        };
        
      case 'nand':
        // A ↑ B = (AB)'
        steps.push({
          expression: `(${expressionToString(e.operands![0])}·${expressionToString(e.operands![1])})'`,
          rule: BOOLEAN_LAWS.GATE_EXPANSION.name,
          description: `NAND gate expanded: ${expressionToString(e)} = (AB)'`,
          beforeExpression: expressionToString(e)
        });
        return {
          type: 'not',
          operands: [{
            type: 'and',
            operands: e.operands!.map(expand)
          }]
        };
        
      case 'nor':
        // A ↓ B = (A+B)'
        steps.push({
          expression: `(${expressionToString(e.operands![0])} + ${expressionToString(e.operands![1])})'`,
          rule: BOOLEAN_LAWS.GATE_EXPANSION.name,
          description: `NOR gate expanded: ${expressionToString(e)} = (A+B)'`,
          beforeExpression: expressionToString(e)
        });
        return {
          type: 'not',
          operands: [{
            type: 'or',
            operands: e.operands!.map(expand)
          }]
        };
        
      default:
        if (e.operands) {
          return { ...e, operands: e.operands.map(expand) };
        }
        return e;
    }
  }
  
  return { expanded: expand(expr), expansionSteps: steps };
}

// Import advanced Boolean laws and generators
import { 
  applyIdentityAndNullLaws as advancedIdentityNullLaws,
  applyComplementLaws as advancedComplementLaws,
  applyIdempotentLaws as advancedIdempotentLaws,
  applyAbsorptionLaws as advancedAbsorptionLaws,
  applyDeMorganLaws as advancedDeMorganLaws,
  applyDistributiveLaws as advancedDistributiveLaws,
  applyConsensusLaw as advancedConsensusLaw,
  applyXORSpecialRules as advancedXORRules,
  recognizeAdvancedPatterns
} from './advancedBooleanLaws.ts';

import { 
  generateKarnaughMap as generateKMapWithD3,
  visualizeKMap,
  exportKMapAsText
} from './karnaughMapGenerator.ts';

import { 
  generateLogicCircuit,
  visualizeCircuit,
  exportCircuitAsText,
  analyzeCircuit
} from './circuitGenerator.ts';

// Apply Boolean algebra laws using advanced implementations
function applyIdentityAndNullLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedIdentityNullLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyComplementLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedComplementLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyIdempotentLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedIdempotentLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyAbsorptionLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedAbsorptionLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyDeMorganLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedDeMorganLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyDistributiveLaws(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedDistributiveLaws(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyConsensusLaw(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedConsensusLaw(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

function applyXORSpecialRules(expr: BooleanExpression): { changed: boolean; expression: BooleanExpression; lawApplied: string; description: string } {
  const result = advancedXORRules(expr);
  return { changed: result.changed, expression: result.expression, lawApplied: result.lawApplied, description: result.description };
}

// Generate Karnaugh Map
function generateKarnaughMap(expr: BooleanExpression, variables: string[]): KarnaughMap {
  const truthTable = generateTruthTable(expr);
  
  if (variables.length < 2 || variables.length > 4) {
    throw new Error('Karnaugh maps only support 2-4 variables');
  }
  
  // Determine K-map dimensions
  let rows: number, cols: number;
  if (variables.length === 2) {
    rows = 2; cols = 2;
  } else if (variables.length === 3) {
    rows = 2; cols = 4;
  } else {
    rows = 4; cols = 4;
  }
  
  // Generate Gray code labels
  const grayCode2 = ['0', '1'];
  const grayCode4 = ['00', '01', '11', '10'];
  
  const rowLabels = rows === 2 ? grayCode2 : grayCode4;
  const colLabels = cols === 2 ? grayCode2 : grayCode4;
  
  // Create K-map cells
  const cells: KMapCell[][] = [];
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      const inputs: { [variable: string]: boolean } = {};
      
      // Map Gray code to variable values
      if (variables.length === 2) {
        inputs[variables[0]] = rowLabels[r] === '1';
        inputs[variables[1]] = colLabels[c] === '1';
      } else if (variables.length === 3) {
        inputs[variables[0]] = rowLabels[r] === '1';
        inputs[variables[1]] = colLabels[c][0] === '1';
        inputs[variables[2]] = colLabels[c][1] === '1';
      } else {
        inputs[variables[0]] = rowLabels[r][0] === '1';
        inputs[variables[1]] = rowLabels[r][1] === '1';
        inputs[variables[2]] = colLabels[c][0] === '1';
        inputs[variables[3]] = colLabels[c][1] === '1';
      }
      
      const value = evaluateExpression(expr, inputs);
      const minterm = truthTable.findIndex(row => 
        Object.keys(inputs).every(v => row.inputs[v] === inputs[v])
      );
      
      cells[r][c] = { row: r, col: c, value, inputs, minterm };
    }
  }
  
  // Find optimal groupings (basic implementation)
  const groups: KMapGroup[] = [];
  const minterms = truthTable.filter(row => row.output).map((_, index) => index);
  
  // Basic SOP form from minterms
  const sopTerms = minterms.map(m => {
    const row = truthTable[m];
    return variables.map(v => row.inputs[v] ? v : v + '\'').join('·');
  });
  const simplifiedSOP = sopTerms.join(' + ');
  
  // Basic POS form from maxterms
  const maxterms = truthTable.filter(row => !row.output).map((_, index) => index);
  const posTerms = maxterms.map(m => {
    const row = truthTable[m];
    return '(' + variables.map(v => row.inputs[v] ? v + '\'' : v).join(' + ') + ')';
  });
  const simplifiedPOS = posTerms.join('·');
  
  return {
    variables,
    cells,
    groups,
    simplifiedSOP,
    simplifiedPOS,
    rowLabels,
    colLabels,
    dimensions: { rows, cols }
  };
}

// Detect gates used in expression
function detectGatesUsed(expression: string): string[] {
  const gates: string[] = [];
  
  if (expression.includes('+')) gates.push('OR');
  if (expression.includes('·') || /[A-Z][A-Z]/.test(expression)) gates.push('AND');
  if (expression.includes('\'')) gates.push('NOT');
  if (expression.includes('↑')) gates.push('NAND');
  if (expression.includes('↓')) gates.push('NOR');
  if (expression.includes('⊕')) gates.push('XOR');
  if (expression.includes('⊙')) gates.push('XNOR');
  
  return gates;
}

// Test the comprehensive solver
export function testComprehensiveSolver(): void {
  const testCases = [
    "(A + B) · (A + B)' + (A'B + AB') · (AB + A'B')",
    "(AB)' + (A + B)' + (A'B + AB') + (AB + A'B')",
    "((A'B + AB') · C) + ((AB + A'B') · C') + (AB · C)",
    "(A + B)' · (A'B + AB') + (AB)' · (AB + A'B') + AB"
  ];
  
  testCases.forEach((expression) => {
    try {
      comprehensiveSimplify(expression);
    } catch (error) {
      // Error handling for test cases
      if (error instanceof Error) {
        throw error;
      }
    }
  });
} 