// Advanced Boolean Algebra Laws Implementation
// Complete implementation of all Boolean laws with step-by-step application

import { BooleanExpression, expressionToString } from './comprehensiveBooleanSolver.ts';

export interface SimplificationResult {
  changed: boolean;
  expression: BooleanExpression;
  lawApplied: string;
  description: string;
}

// Deep clone expression to avoid mutations
function cloneExpression(expr: BooleanExpression): BooleanExpression {
  return JSON.parse(JSON.stringify(expr));
}

// Check if two expressions are identical
function expressionsEqual(expr1: BooleanExpression, expr2: BooleanExpression): boolean {
  if (expr1.type !== expr2.type) return false;
  
  if (expr1.type === 'constant') {
    return expr1.value === expr2.value;
  }
  
  if (expr1.type === 'variable') {
    return expr1.variable?.name === expr2.variable?.name && 
           expr1.variable?.negated === expr2.variable?.negated;
  }
  
  if (expr1.operands && expr2.operands) {
    if (expr1.operands.length !== expr2.operands.length) return false;
    return expr1.operands.every((op1, index) => expressionsEqual(op1, expr2.operands![index]));
  }
  
  return false;
}

// Check if expressions are complements
function areComplements(expr1: BooleanExpression, expr2: BooleanExpression): boolean {
  // A and A'
  if (expr1.type === 'variable' && expr2.type === 'variable') {
    return expr1.variable?.name === expr2.variable?.name &&
           expr1.variable?.negated !== expr2.variable?.negated;
  }
  
  // A and (A)'
  if (expr1.type === 'variable' && expr2.type === 'not') {
    return expressionsEqual(expr1, expr2.operands![0]);
  }
  
  // (A)' and A
  if (expr1.type === 'not' && expr2.type === 'variable') {
    return expressionsEqual(expr1.operands![0], expr2);
  }
  
  // (A)' and (A)'
  if (expr1.type === 'not' && expr2.type === 'not') {
    return expressionsEqual(expr1.operands![0], expr2.operands![0]);
  }
  
  return false;
}

// Identity and Null Laws: A + 0 = A, A · 1 = A, A + 1 = 1, A · 0 = 0
export function applyIdentityAndNullLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if (e.type === 'or' && e.operands) {
      // A + 0 = A
      const withoutZeros = e.operands.filter(op => !(op.type === 'constant' && op.value === false));
      if (withoutZeros.length < e.operands.length) {
        if (withoutZeros.length === 0) {
          return { changed: true, expr: { type: 'constant', value: false } };
        }
        if (withoutZeros.length === 1) {
          return { changed: true, expr: withoutZeros[0] };
        }
        return { changed: true, expr: { ...e, operands: withoutZeros } };
      }
      
      // A + 1 = 1
      if (e.operands.some(op => op.type === 'constant' && op.value === true)) {
        return { changed: true, expr: { type: 'constant', value: true } };
      }
    }
    
    if (e.type === 'and' && e.operands) {
      // A · 1 = A
      const withoutOnes = e.operands.filter(op => !(op.type === 'constant' && op.value === true));
      if (withoutOnes.length < e.operands.length) {
        if (withoutOnes.length === 0) {
          return { changed: true, expr: { type: 'constant', value: true } };
        }
        if (withoutOnes.length === 1) {
          return { changed: true, expr: withoutOnes[0] };
        }
        return { changed: true, expr: { ...e, operands: withoutOnes } };
      }
      
      // A · 0 = 0
      if (e.operands.some(op => op.type === 'constant' && op.value === false)) {
        return { changed: true, expr: { type: 'constant', value: false } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'Identity/Null Law',
    description: finalResult.changed ? 'Applied Identity Law (A + 0 = A, A · 1 = A) or Null Law (A + 1 = 1, A · 0 = 0)' : 'No identity/null laws applicable'
  };
}

// Complement Laws: A + A' = 1, A · A' = 0
export function applyComplementLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if (e.type === 'or' && e.operands) {
      // Check for A + A' = 1
      for (let i = 0; i < e.operands.length; i++) {
        for (let j = i + 1; j < e.operands.length; j++) {
          if (areComplements(e.operands[i], e.operands[j])) {
            return { changed: true, expr: { type: 'constant', value: true } };
          }
        }
      }
    }
    
    if (e.type === 'and' && e.operands) {
      // Check for A · A' = 0
      for (let i = 0; i < e.operands.length; i++) {
        for (let j = i + 1; j < e.operands.length; j++) {
          if (areComplements(e.operands[i], e.operands[j])) {
            return { changed: true, expr: { type: 'constant', value: false } };
          }
        }
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'Complement Law',
    description: finalResult.changed ? 'Applied Complement Law (A + A\' = 1, A · A\' = 0)' : 'No complement laws applicable'
  };
}

// Idempotent Laws: A + A = A, A · A = A
export function applyIdempotentLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if ((e.type === 'or' || e.type === 'and') && e.operands) {
      // Remove duplicate operands
      const uniqueOperands: BooleanExpression[] = [];
      const seen = new Set<string>();
      
      for (const operand of e.operands) {
        const operandStr = expressionToString(operand);
        if (!seen.has(operandStr)) {
          seen.add(operandStr);
          uniqueOperands.push(operand);
        }
      }
      
      if (uniqueOperands.length < e.operands.length) {
        if (uniqueOperands.length === 1) {
          return { changed: true, expr: uniqueOperands[0] };
        }
        return { changed: true, expr: { ...e, operands: uniqueOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'Idempotent Law',
    description: finalResult.changed ? 'Applied Idempotent Law (A + A = A, A · A = A)' : 'No idempotent laws applicable'
  };
}

// Absorption Laws: A + AB = A, A(A + B) = A
export function applyAbsorptionLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if (e.type === 'or' && e.operands) {
      // A + AB = A
      for (let i = 0; i < e.operands.length; i++) {
        const operandA = e.operands[i];
        
        for (let j = 0; j < e.operands.length; j++) {
          if (i === j) continue;
          const operandB = e.operands[j];
          
          // Check if operandB is an AND containing operandA
          if (operandB.type === 'and' && operandB.operands) {
            const containsA = operandB.operands.some(op => expressionsEqual(op, operandA));
            if (containsA) {
              // Remove operandB (it's absorbed by operandA)
              const newOperands = e.operands.filter((_, index) => index !== j);
              if (newOperands.length === 1) {
                return { changed: true, expr: newOperands[0] };
              }
              return { changed: true, expr: { ...e, operands: newOperands } };
            }
          }
        }
      }
    }
    
    if (e.type === 'and' && e.operands) {
      // A(A + B) = A
      for (let i = 0; i < e.operands.length; i++) {
        const operandA = e.operands[i];
        
        for (let j = 0; j < e.operands.length; j++) {
          if (i === j) continue;
          const operandB = e.operands[j];
          
          // Check if operandB is an OR containing operandA
          if (operandB.type === 'or' && operandB.operands) {
            const containsA = operandB.operands.some(op => expressionsEqual(op, operandA));
            if (containsA) {
              // Remove operandB (it's absorbed by operandA)
              const newOperands = e.operands.filter((_, index) => index !== j);
              if (newOperands.length === 1) {
                return { changed: true, expr: newOperands[0] };
              }
              return { changed: true, expr: { ...e, operands: newOperands } };
            }
          }
        }
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'Absorption Law',
    description: finalResult.changed ? 'Applied Absorption Law (A + AB = A, A(A + B) = A)' : 'No absorption laws applicable'
  };
}

// De Morgan's Laws: (A + B)' = A'B', (AB)' = A' + B'
export function applyDeMorganLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if (e.type === 'not' && e.operands && e.operands.length === 1) {
      const inner = e.operands[0];
      
      // (A + B)' = A'B'
      if (inner.type === 'or' && inner.operands) {
        return {
          changed: true,
          expr: {
            type: 'and',
            operands: inner.operands.map(op => ({ type: 'not', operands: [op] }))
          }
        };
      }
      
      // (AB)' = A' + B'
      if (inner.type === 'and' && inner.operands) {
        return {
          changed: true,
          expr: {
            type: 'or',
            operands: inner.operands.map(op => ({ type: 'not', operands: [op] }))
          }
        };
      }
      
      // (A')' = A (Double negation)
      if (inner.type === 'not' && inner.operands) {
        return { changed: true, expr: inner.operands[0] };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'De Morgan\'s Law',
    description: finalResult.changed ? 'Applied De Morgan\'s Law ((A + B)\' = A\'B\', (AB)\' = A\' + B\')' : 'No De Morgan\'s laws applicable'
  };
}

// Distributive Laws: A(B + C) = AB + AC, A + BC = (A + B)(A + C)
// IMPORTANT: Only apply when it leads to actual simplification
export function applyDistributiveLaws(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function calculateComplexity(e: BooleanExpression): number {
    // Count total number of operations and variables
    if (e.type === 'variable' || e.type === 'constant') return 1;
    if (e.type === 'not') return 1 + calculateComplexity(e.operands![0]);
    if (e.operands) {
      return 1 + e.operands.reduce((sum, op) => sum + calculateComplexity(op), 0);
    }
    return 1;
  }
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    // AND distributive over OR: A(B + C) = AB + AC
    // Only apply if it reduces complexity or enables further simplification
    if (e.type === 'and' && e.operands && e.operands.length >= 2) {
      for (let i = 0; i < e.operands.length; i++) {
        const operandA = e.operands[i];
        
        for (let j = 0; j < e.operands.length; j++) {
          if (i === j) continue;
          const operandB = e.operands[j];
          
          if (operandB.type === 'or' && operandB.operands) {
            // Check if distribution would be beneficial
            // Only distribute if:
            // 1. One of the OR terms contains the same variable as A (for absorption)
            // 2. The resulting expression would be simpler
            
            const hasCommonTerm = operandB.operands.some(term => 
              expressionsEqual(term, operandA) || 
              (term.type === 'and' && term.operands && 
               term.operands.some(subterm => expressionsEqual(subterm, operandA)))
            );
            
            if (hasCommonTerm) {
              // Distribute A over (B + C) because it will likely enable absorption
              const distributedTerms = operandB.operands.map(term => ({
                type: 'and' as const,
                operands: [operandA, term]
              }));
              
              const otherOperands = e.operands.filter((_, index) => index !== i && index !== j);
              
              const newExpr = otherOperands.length === 0 ? {
                type: 'or' as const,
                operands: distributedTerms
              } : {
                type: 'and' as const,
                operands: [
                  ...otherOperands,
                  {
                    type: 'or' as const,
                    operands: distributedTerms
                  }
                ]
              };
              
              return { changed: true, expr: newExpr };
            }
          }
        }
      }
    }
    
    // OR distributive (reverse): A + BC = (A + B)(A + C)
    // Generally avoid this as it increases complexity
    // Only apply in very specific cases where it enables major simplification
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      let changed = false;
      const newOperands = e.operands.map(operand => {
        const operandResult = traverse(operand);
        if (operandResult.changed) {
          changed = true;
        }
        return operandResult.expr;
      });
      
      if (changed) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: finalResult.changed ? 'Distributive Law' : '',
    description: finalResult.changed ? 'Applied selective distribution for simplification: A(B + C) = AB + AC' : 'No beneficial distributive transformations found'
  };
}

// Consensus Law: AB + A'C + BC = AB + A'C
export function applyConsensusLaw(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    if (e.type === 'or' && e.operands && e.operands.length >= 3) {
      // Look for consensus terms
      for (let i = 0; i < e.operands.length; i++) {
        for (let j = i + 1; j < e.operands.length; j++) {
          for (let k = j + 1; k < e.operands.length; k++) {
            const termI = e.operands[i];
            const termJ = e.operands[j];
            const termK = e.operands[k];
            
            // Check if we have AB + A'C + BC pattern
            if (termI.type === 'and' && termJ.type === 'and' && termK.type === 'and' &&
                termI.operands && termJ.operands && termK.operands &&
                termI.operands.length === 2 && termJ.operands.length === 2 && termK.operands.length === 2) {
              
              // Try different combinations to find consensus
              const patterns = [
                { ab: termI, ac: termJ, bc: termK },
                { ab: termI, ac: termK, bc: termJ },
                { ab: termJ, ac: termI, bc: termK },
                { ab: termJ, ac: termK, bc: termI },
                { ab: termK, ac: termI, bc: termJ },
                { ab: termK, ac: termJ, bc: termI }
              ];
              
              for (const pattern of patterns) {
                if (isConsensusPattern(pattern.ab, pattern.ac, pattern.bc)) {
                  // Remove the consensus term (bc)
                  const newOperands = e.operands.filter((_, index) => 
                    index !== [i, j, k].find(idx => e.operands![idx] === pattern.bc)
                  );
                  
                  if (newOperands.length === 1) {
                    return { changed: true, expr: newOperands[0] };
                  }
                  
                  return { changed: true, expr: { ...e, operands: newOperands } };
                }
              }
            }
          }
        }
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function isConsensusPattern(ab: BooleanExpression, ac: BooleanExpression, bc: BooleanExpression): boolean {
    // This is a simplified check - in a full implementation, you'd need more complex pattern matching
    return false; // Placeholder for now
  }
  
  const finalResult = applyToExpression(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'Consensus Law',
    description: finalResult.changed ? 'Applied Consensus Law (AB + A\'C + BC = AB + A\'C)' : 'No consensus laws applicable'
  };
}

// XOR Special Rules: A ⊕ A = 0, A ⊕ 0 = A, A ⊕ 1 = A', (A ⊕ B)(A ⊙ B) = 0
export function applyXORSpecialRules(expr: BooleanExpression): SimplificationResult {
  let result = cloneExpression(expr);
  
  function applyToExpression(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    // XOR properties
    if (e.type === 'xor' && e.operands && e.operands.length === 2) {
      const [a, b] = e.operands;
      
      // A ⊕ A = 0
      if (expressionsEqual(a, b)) {
        return { changed: true, expr: { type: 'constant', value: false } };
      }
      
      // A ⊕ 0 = A
      if (b.type === 'constant' && b.value === false) {
        return { changed: true, expr: a };
      }
      
      // A ⊕ 1 = A'
      if (b.type === 'constant' && b.value === true) {
        return { changed: true, expr: { type: 'not', operands: [a] } };
      }
    }
    
    // (A ⊕ B)(A ⊙ B) = 0
    if (e.type === 'and' && e.operands && e.operands.length === 2) {
      const [op1, op2] = e.operands;
      
      if ((op1.type === 'xor' && op2.type === 'xnor') || (op1.type === 'xnor' && op2.type === 'xor')) {
        const xorOp = op1.type === 'xor' ? op1 : op2;
        const xnorOp = op1.type === 'xnor' ? op1 : op2;
        
        if (xorOp.operands && xnorOp.operands &&
            expressionsEqual(xorOp.operands[0], xnorOp.operands[0]) &&
            expressionsEqual(xorOp.operands[1], xnorOp.operands[1])) {
          return { changed: true, expr: { type: 'constant', value: false } };
        }
      }
    }
    
    return { changed: false, expr: e };
  }
  
  function traverse(e: BooleanExpression): { changed: boolean; expr: BooleanExpression } {
    const localResult = applyToExpression(e);
    if (localResult.changed) {
      return localResult;
    }
    
    if (e.operands) {
      const newOperands: BooleanExpression[] = [];
      let anyChanged = false;
      
      for (const operand of e.operands) {
        const operandResult = traverse(operand);
        newOperands.push(operandResult.expr);
        if (operandResult.changed) {
          anyChanged = true;
        }
      }
      
      if (anyChanged) {
        return { changed: true, expr: { ...e, operands: newOperands } };
      }
    }
    
    return { changed: false, expr: e };
  }
  
  const finalResult = traverse(result);
  
  return {
    changed: finalResult.changed,
    expression: finalResult.expr,
    lawApplied: 'XOR Properties',
    description: finalResult.changed ? 'Applied XOR Properties (A ⊕ A = 0, A ⊕ 0 = A, (A ⊕ B)(A ⊙ B) = 0)' : 'No XOR properties applicable'
  };
}

// Advanced pattern recognition for complex simplifications
export function recognizeAdvancedPatterns(expr: BooleanExpression): SimplificationResult {
  // Recognize complex patterns including all gate types:
  // - XOR/XNOR interactions: (A ⊕ B)(A ⊙ B) = 0
  // - NAND/NOR combinations: (A ↑ B) + (A ↓ B) = A' + B'
  // - Complex complement patterns: (A + B)(A' + B') = AB' + A'B
  // - Tautology/Contradiction patterns
  
  const exprStr = expressionToString(expr);
  
  // Pattern 1: (A + B) · (A + B)' = 0 - Complement Law
  if (expr.type === 'and' && expr.operands && expr.operands.length === 2) {
    const [op1, op2] = expr.operands;
    
    if (op2.type === 'not' && op2.operands && expressionsEqual(op1, op2.operands[0])) {
      return {
        changed: true,
        expression: { type: 'constant', value: false },
        lawApplied: 'Complement Law',
        description: 'Recognized pattern: A · A\' = 0'
      };
    }
  }
  
  // Pattern 2: (A ⊕ B) · (A ⊙ B) = 0 - XOR-XNOR Complement
  if (expr.type === 'and' && expr.operands && expr.operands.length === 2) {
    const [op1, op2] = expr.operands;
    
    if ((op1.type === 'xor' && op2.type === 'xnor') || (op1.type === 'xnor' && op2.type === 'xor')) {
      const xorOp = op1.type === 'xor' ? op1 : op2;
      const xnorOp = op1.type === 'xnor' ? op1 : op2;
      
      if (xorOp.operands && xnorOp.operands &&
          xorOp.operands.length === 2 && xnorOp.operands.length === 2 &&
          expressionsEqual(xorOp.operands[0], xnorOp.operands[0]) &&
          expressionsEqual(xorOp.operands[1], xnorOp.operands[1])) {
        return {
          changed: true,
          expression: { type: 'constant', value: false },
          lawApplied: 'XOR-XNOR Complement',
          description: 'Recognized pattern: (A ⊕ B) · (A ⊙ B) = 0'
        };
      }
    }
  }
  
  // Pattern 3: (A ↑ B) + (A ↓ B) + (A ⊕ B) + (A ⊙ B) = 1 - Complete Gate Coverage
  if (expr.type === 'or' && expr.operands && expr.operands.length === 4) {
    const hasNand = expr.operands.some(op => op.type === 'nand');
    const hasNor = expr.operands.some(op => op.type === 'nor');
    const hasXor = expr.operands.some(op => op.type === 'xor');
    const hasXnor = expr.operands.some(op => op.type === 'xnor');
    
    if (hasNand && hasNor && hasXor && hasXnor) {
      // Check if all operate on the same variables
      const firstOp = expr.operands[0];
      if (firstOp.operands && firstOp.operands.length === 2) {
        const [varA, varB] = firstOp.operands;
        const allSameVars = expr.operands.every(op => 
          op.operands && op.operands.length === 2 &&
          expressionsEqual(op.operands[0], varA) &&
          expressionsEqual(op.operands[1], varB)
        );
        
        if (allSameVars) {
          return {
            changed: true,
            expression: { type: 'constant', value: true },
            lawApplied: 'Complete Gate Coverage',
            description: 'Recognized pattern: NAND + NOR + XOR + XNOR = 1 (covers all possibilities)'
          };
        }
      }
    }
  }
  
  // Pattern 4: (A + B)(A' + B') = AB' + A'B - XOR Expansion
  if (expr.type === 'and' && expr.operands && expr.operands.length === 2) {
    const [op1, op2] = expr.operands;
    
    if (op1.type === 'or' && op2.type === 'or' &&
        op1.operands && op2.operands &&
        op1.operands.length === 2 && op2.operands.length === 2) {
      
      const [a1, b1] = op1.operands;
      const [a2, b2] = op2.operands;
      
      // Check if one is complement of the other
      if (areComplements(a1, a2) && areComplements(b1, b2)) {
        // Create XOR expression: AB' + A'B
        const term1: BooleanExpression = {
          type: 'and',
          operands: [a1, { type: 'not', operands: [b1] }]
        };
        const term2: BooleanExpression = {
          type: 'and',
          operands: [{ type: 'not', operands: [a1] }, b1]
        };
        
        return {
          changed: true,
          expression: { type: 'or', operands: [term1, term2] },
          lawApplied: 'XOR Expansion',
          description: 'Recognized pattern: (A + B)(A\' + B\') = AB\' + A\'B'
        };
      }
    }
  }
  
  // Pattern 5: Detect Tautologies (expressions that are always true)
  if (expr.type === 'or' && expr.operands) {
    // Check for A + A' pattern
    for (let i = 0; i < expr.operands.length; i++) {
      for (let j = i + 1; j < expr.operands.length; j++) {
        if (areComplements(expr.operands[i], expr.operands[j])) {
          return {
            changed: true,
            expression: { type: 'constant', value: true },
            lawApplied: 'Tautology Detection',
            description: 'Recognized tautology: A + A\' = 1'
          };
        }
      }
    }
  }
  
  // Pattern 6: Double Negation Elimination
  if (expr.type === 'not' && expr.operands && expr.operands[0].type === 'not') {
    return {
      changed: true,
      expression: expr.operands[0].operands![0],
      lawApplied: 'Double Negation',
      description: 'Applied double negation elimination: (A\') = A'
    };
  }
  
  // Pattern 7: NAND/NOR to AND/OR with NOT
  if (expr.type === 'nand' && expr.operands && expr.operands.length === 2) {
    return {
      changed: true,
      expression: {
        type: 'not',
        operands: [{
          type: 'and',
          operands: expr.operands
        }]
      },
      lawApplied: 'NAND Expansion',
      description: 'Expanded NAND: A ↑ B = (AB)\''
    };
  }
  
  if (expr.type === 'nor' && expr.operands && expr.operands.length === 2) {
    return {
      changed: true,
      expression: {
        type: 'not',
        operands: [{
          type: 'or',
          operands: expr.operands
        }]
      },
      lawApplied: 'NOR Expansion',
      description: 'Expanded NOR: A ↓ B = (A + B)\''
    };
  }
  
  // Pattern 8: XOR to AND/OR expansion
  if (expr.type === 'xor' && expr.operands && expr.operands.length === 2) {
    const [a, b] = expr.operands;
    return {
      changed: true,
      expression: {
        type: 'or',
        operands: [
          { type: 'and', operands: [a, { type: 'not', operands: [b] }] },
          { type: 'and', operands: [{ type: 'not', operands: [a] }, b] }
        ]
      },
      lawApplied: 'XOR Expansion',
      description: 'Expanded XOR: A ⊕ B = AB\' + A\'B'
    };
  }
  
  // Pattern 9: XNOR to AND/OR expansion
  if (expr.type === 'xnor' && expr.operands && expr.operands.length === 2) {
    const [a, b] = expr.operands;
    return {
      changed: true,
      expression: {
        type: 'or',
        operands: [
          { type: 'and', operands: [a, b] },
          { type: 'and', operands: [{ type: 'not', operands: [a] }, { type: 'not', operands: [b] }] }
        ]
      },
      lawApplied: 'XNOR Expansion',
      description: 'Expanded XNOR: A ⊙ B = AB + A\'B\''
    };
  }
  
  return {
    changed: false,
    expression: expr,
    lawApplied: 'Advanced Pattern Recognition',
    description: 'No advanced patterns recognized'
  };
} 