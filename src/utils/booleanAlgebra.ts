// Complete Boolean algebra utility functions with proper parsing and evaluation

export interface ParsedExpression {
  type: 'variable' | 'not' | 'and' | 'or' | 'nand' | 'nor' | 'xor' | 'xnor' | 'constant';
  value?: string | boolean;
  children?: ParsedExpression[];
}

export interface SimplificationStep {
  expression: string;
  rule: string;
  description: string;
}

export interface TruthTableRow {
  inputs: { [key: string]: boolean };
  output: boolean;
}

export interface KMapCell {
  value: boolean;
  inputs: { [key: string]: boolean };
  row: number;
  col: number;
}

export interface KMap {
  cells: KMapCell[][];
  variables: string[];
  rowLabels: string[];
  colLabels: string[];
}

export interface Gate {
  id: string;
  type: 'and' | 'or' | 'nand' | 'nor' | 'xor' | 'xnor' | 'not' | 'input' | 'output';
  x: number;
  y: number;
  inputs: string[];
  output: string;
  label?: string;
}

export interface Connection {
  from: string;
  to: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface LogicCircuit {
  gates: Gate[];
  connections: Connection[];
  inputs: string[];
  width: number;
  height: number;
}

// Normalize expression to use consistent notation
function normalizeExpression(expr: string): string {
  return expr
    .replace(/([A-Z])'/g, '$1̄')
    .replace(/\*/g, '·')
    .replace(/↑/g, '↑') // NAND symbol
    .replace(/↓/g, '↓') // NOR symbol
    .replace(/⊕/g, '⊕') // XOR symbol  
    .replace(/⊙/g, '⊙') // XNOR symbol
    .replace(/↔/g, '⊙') // Alternative XNOR symbol
    .replace(/\s+/g, '')
    .trim();
}

// Enhanced tokenizer with NOR, XOR, XNOR support
function tokenize(expr: string): string[] {
  const normalized = normalizeExpression(expr);
  const tokens: string[] = [];
  let i = 0;
  
  while (i < normalized.length) {
    const char = normalized[i];
    
    if (/[A-Z]/.test(char)) {
      if (i + 1 < normalized.length && normalized[i + 1] === '̄') {
        tokens.push(char + '̄');
        i += 2;
      } else {
        tokens.push(char);
        i++;
      }
    } else if (char === '+' || char === '·' || char === '(' || char === ')') {
      tokens.push(char);
      i++;
    } else if (char === '⊕') {
      tokens.push('⊕'); // XOR
      i++;
    } else if (char === '⊙') {
      tokens.push('⊙'); // XNOR
      i++;
    } else if (char === '↓') {
      tokens.push('↓'); // NOR
      i++;
    } else if (char === '↑') {
      tokens.push('↑'); // NAND
      i++;
    } else {
      i++; // Skip unknown characters
    }
  }
  
  // Add implicit AND operators between adjacent variables
  const processedTokens: string[] = [];
  for (let j = 0; j < tokens.length; j++) {
    processedTokens.push(tokens[j]);
    
    // Add implicit AND between variables or between variable and opening parenthesis
    if (j < tokens.length - 1) {
      const current = tokens[j];
      const next = tokens[j + 1];
      
      if ((/[A-Z]̄?/.test(current) && /[A-Z]̄?/.test(next)) ||
          (/[A-Z]̄?/.test(current) && next === '(') ||
          (current === ')' && /[A-Z]̄?/.test(next)) ||
          (current === ')' && next === '(')) {
        processedTokens.push('·');
      }
    }
  }
  
  return processedTokens;
}

// Helper function to split expression by operator while respecting parentheses
function splitByOperator(expr: string, operator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenLevel = 0;
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    
    if (char === '(') {
      parenLevel++;
      current += char;
    } else if (char === ')') {
      parenLevel--;
      current += char;
    } else if (char === operator && parenLevel === 0) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}

// Enhanced Boolean expression parser with comprehensive gate support
export function parseExpression(expr: string): ParsedExpression {
  // Clean and normalize the expression
  let cleanExpr = expr.trim().replace(/\s+/g, '');
  
  // Handle alternative gate symbols
  cleanExpr = cleanExpr
    .replace(/\bNAND\b/g, '↑')
    .replace(/\bNOR\b/g, '↓')
    .replace(/\bXOR\b/g, '⊕')
    .replace(/\bXNOR\b/g, '⊙')
    .replace(/\bAND\b/g, '·')
    .replace(/\bOR\b/g, '+')
    .replace(/\*/g, '·')  // Convert * to ·
    .replace(/\^/g, '⊕'); // Convert ^ to ⊕ for XOR
  
  if (!cleanExpr) {
    return { type: 'variable', value: 'A' };
  }
  
  // Handle simple cases first
  if (/^[A-Z]$/.test(cleanExpr)) {
    return { type: 'variable', value: cleanExpr };
  }
  
  if (/^[A-Z]'$/.test(cleanExpr)) {
    return {
      type: 'not',
      children: [{ type: 'variable', value: cleanExpr[0] }]
    };
  }
  
  // Handle constants
  if (cleanExpr === '0' || cleanExpr === '1') {
    return { type: 'constant', value: cleanExpr === '1' };
  }
  
  // Handle NAND operations (A ↑ B) - highest precedence for binary operators
  if (cleanExpr.includes('↑')) {
    const nandParts = splitByOperator(cleanExpr, '↑');
    if (nandParts.length === 2) {
      return {
        type: 'nand',
        children: [
          parseExpression(nandParts[0]),
          parseExpression(nandParts[1])
        ]
      };
    }
  }
  
  // Handle NOR operations (A ↓ B)
  if (cleanExpr.includes('↓')) {
    const norParts = splitByOperator(cleanExpr, '↓');
    if (norParts.length === 2) {
      return {
        type: 'nor',
        children: [
          parseExpression(norParts[0]),
          parseExpression(norParts[1])
        ]
      };
    }
  }
  
  // Handle XNOR operations (A ⊙ B)
  if (cleanExpr.includes('⊙')) {
    const xnorParts = splitByOperator(cleanExpr, '⊙');
    if (xnorParts.length === 2) {
      return {
        type: 'xnor',
        children: [
          parseExpression(xnorParts[0]),
          parseExpression(xnorParts[1])
        ]
      };
    }
  }
  
  // Handle XOR operations (A ⊕ B)
  if (cleanExpr.includes('⊕')) {
    const xorParts = splitByOperator(cleanExpr, '⊕');
    if (xorParts.length === 2) {
      return {
        type: 'xor',
        children: [
          parseExpression(xorParts[0]),
          parseExpression(xorParts[1])
        ]
      };
    }
  }
  
  // Handle NAND as negated AND: (AB)' or (A·B)'
  if (cleanExpr.match(/^\([^)]+\)'$/)) {
    const inner = cleanExpr.slice(1, -2); // Remove outer parentheses and '
    const innerExpr = parseExpression(inner);
    if (innerExpr.type === 'and') {
      return {
        type: 'nand',
        children: innerExpr.children || []
      };
    } else if (innerExpr.type === 'or') {
      return {
        type: 'nor',
        children: innerExpr.children || []
      };
    }
    // General negation
    return {
      type: 'not',
      children: [innerExpr]
    };
  }
  
  // Handle OR operations (A + B) - lower precedence
  if (cleanExpr.includes('+')) {
    const orParts = splitByOperator(cleanExpr, '+');
    if (orParts.length >= 2) {
      return {
        type: 'or',
        children: orParts.map(part => parseExpression(part))
      };
    }
  }
  
  // Handle AND operations (AB or A·B) - implicit multiplication
  const tokens = tokenize(cleanExpr);
  if (tokens.includes('·')) {
    const andParts = splitByOperator(cleanExpr, '·');
    if (andParts.length >= 2) {
      return {
        type: 'and',
        children: andParts.map(part => parseExpression(part))
      };
    }
  }
  
  // Handle implicit AND (adjacent variables like AB)
  if (/^[A-Z]([A-Z]'?)+$/.test(cleanExpr)) {
    const variables: ParsedExpression[] = [];
    let i = 0;
    while (i < cleanExpr.length) {
      if (/[A-Z]/.test(cleanExpr[i])) {
        if (i + 1 < cleanExpr.length && cleanExpr[i + 1] === "'") {
          variables.push({
            type: 'not',
            children: [{ type: 'variable', value: cleanExpr[i] }]
          });
          i += 2;
        } else {
          variables.push({ type: 'variable', value: cleanExpr[i] });
          i++;
        }
      } else {
        i++;
      }
    }
    if (variables.length >= 2) {
      return {
        type: 'and',
        children: variables
      };
    }
  }
  
  // Handle parentheses
  if (cleanExpr.startsWith('(') && cleanExpr.endsWith(')')) {
    return parseExpression(cleanExpr.slice(1, -1));
  }
  
  // Default fallback
  return { type: 'variable', value: cleanExpr || 'A' };
}

// Convert parsed expression back to string
export function expressionToString(expr: ParsedExpression): string {
  switch (expr.type) {
    case 'variable':
      return expr.value as string;
    case 'constant':
      return expr.value ? '1' : '0';
    case 'not':
      if (expr.children && expr.children.length > 0) {
        const child = expressionToString(expr.children[0]);
        if (expr.children[0].type === 'and' || expr.children[0].type === 'or' || 
            expr.children[0].type === 'nor' || expr.children[0].type === 'xor' || 
            expr.children[0].type === 'xnor') {
          return `(${child})'`;
        }
        return child + "'";
      }
      return '';
    case 'and':
      if (expr.children && expr.children.length >= 2) {
        const terms = expr.children.map(child => {
          if (child.type === 'or' || child.type === 'nor' || child.type === 'xor' || child.type === 'xnor') {
            return `(${expressionToString(child)})`;
          }
          return expressionToString(child);
        });
        return terms.join('');
      }
      return '';
    case 'or':
      if (expr.children && expr.children.length >= 2) {
        const terms = expr.children.map(child => expressionToString(child));
        return terms.join(' + ');
      }
      return '';
    case 'nand':
      if (expr.children && expr.children.length >= 2) {
        const terms = expr.children.map(child => expressionToString(child));
        return `(${terms.join('')})'`;
      }
      return '';
    case 'nor':
      if (expr.children && expr.children.length >= 2) {
        const terms = expr.children.map(child => expressionToString(child));
        return `(${terms.join(' + ')})'`;
      }
      return '';
    case 'xor':
      if (expr.children && expr.children.length === 2) {
        const a = expressionToString(expr.children[0]);
        const b = expressionToString(expr.children[1]);
        return `${a} ⊕ ${b}`;
      }
      return '';
    case 'xnor':
      if (expr.children && expr.children.length === 2) {
        const a = expressionToString(expr.children[0]);
        const b = expressionToString(expr.children[1]);
        return `${a} ⊙ ${b}`;
      }
      return '';
    default:
      return '';
  }
}

// Get all variables from expression
function getVariables(expr: ParsedExpression): string[] {
  const variables = new Set<string>();
  
  function traverse(node: ParsedExpression) {
    if (node.type === 'variable') {
      variables.add(node.value as string);
    } else if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(expr);
  return Array.from(variables).sort();
}

// Evaluate expression with given variable values
export function evaluateExpression(expr: ParsedExpression, values: { [key: string]: boolean }): boolean {
  switch (expr.type) {
    case 'variable':
      return values[expr.value as string] ?? false;
    case 'constant':
      return expr.value as boolean;
    case 'not':
      return expr.children ? !evaluateExpression(expr.children[0], values) : false;
    case 'and':
      return expr.children ? expr.children.every(child => evaluateExpression(child, values)) : false;
    case 'or':
      return expr.children ? expr.children.some(child => evaluateExpression(child, values)) : false;
    case 'nand':
      return expr.children ? !expr.children.every(child => evaluateExpression(child, values)) : false;
    case 'nor':
      return expr.children ? !expr.children.some(child => evaluateExpression(child, values)) : false;
    case 'xor':
      if (expr.children && expr.children.length === 2) {
        const a = evaluateExpression(expr.children[0], values);
        const b = evaluateExpression(expr.children[1], values);
        return (a && !b) || (!a && b);
      }
      return false;
    case 'xnor':
      if (expr.children && expr.children.length === 2) {
        const a = evaluateExpression(expr.children[0], values);
        const b = evaluateExpression(expr.children[1], values);
        return (a && b) || (!a && !b);
      }
      return false;
    default:
      return false;
  }
}

// Generate truth table for the expression
export function generateTruthTable(parsedExpr: ParsedExpression): TruthTableRow[] {
  const variables = getVariables(parsedExpr);
  const numRows = Math.pow(2, variables.length);
  const truthTable: TruthTableRow[] = [];
  
  for (let i = 0; i < numRows; i++) {
    const inputs: { [key: string]: boolean } = {};
    
    variables.forEach((variable, index) => {
      const bitPosition = variables.length - 1 - index;
      inputs[variable] = (i & (1 << bitPosition)) !== 0;
    });
    
    const output = evaluateExpression(parsedExpr, inputs);
    truthTable.push({ inputs, output });
  }
  
  return truthTable;
}

// Check if two expressions are equivalent
function expressionsEqual(expr1: ParsedExpression, expr2: ParsedExpression): boolean {
  if (expr1.type !== expr2.type) return false;
  if (expr1.value !== expr2.value) return false;
  
  if (expr1.children && expr2.children) {
    if (expr1.children.length !== expr2.children.length) return false;
    return expr1.children.every((child, index) => 
      expressionsEqual(child, expr2.children![index])
    );
  }
  
  return !expr1.children && !expr2.children;
}

// Enhanced simplification rules
function applySimplificationRules(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  // Try distribution first (important for expressions like X'(X+Y))
  const distributionResult = tryDistribution(expr);
  if (distributionResult.rule) {
    return distributionResult;
  }
  
  // Try identity and null laws (X+0=X, X·1=X, X+1=1, X·0=0)
  const identityResult = tryIdentityLaws(expr);
  if (identityResult.rule) {
    return identityResult;
  }
  
  // Try complement laws (X·X' = 0, X+X' = 1)
  const complementResult = tryComplementLaws(expr);
  if (complementResult.rule) {
    return complementResult;
  }
  
  // Try absorption laws
  const absorptionResult = tryAbsorptionLaws(expr);
  if (absorptionResult.rule) {
    return absorptionResult;
  }
  
  // Try idempotent laws first
  const idempotentResult = tryIdempotentLaws(expr);
  if (idempotentResult.rule) {
    return idempotentResult;
  }

  return { simplified: expr };
}

// Try distribution rules like X'(X+Y) = X'X + X'Y
function tryDistribution(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  if (expr.type === 'and' && expr.children && expr.children.length === 2) {
    const [left, right] = expr.children;
    
    // Check for X'(X+Y) pattern
    if (left.type === 'not' && right.type === 'or' && 
        left.children && left.children[0].type === 'variable' &&
        right.children && right.children.length === 2) {
      
      const notVar = left.children[0].value as string;
      const orChildren = right.children;
      
      // Distribute: X'(X+Y) = X'X + X'Y
      const distributedChildren = orChildren.map(child => ({
        type: 'and' as const,
        children: [left, child]
      }));
      
      return {
        simplified: {
          type: 'or',
          children: distributedChildren
        },
        rule: 'Distribution Law',
        description: `Distribute ${notVar}' over (${expressionToString(right)})`
      };
    }
  }
  
  return { simplified: expr };
}

// Try identity and null laws: X+0=X, X·1=X, X+1=1, X·0=0
function tryIdentityLaws(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  // Handle OR operations with constants
  if (expr.type === 'or' && expr.children) {
    // Check for X + 0 = X
    const nonZeroChildren = expr.children.filter(child => 
      !(child.type === 'constant' && child.value === false)
    );
    
    if (nonZeroChildren.length < expr.children.length) {
      if (nonZeroChildren.length === 1) {
        return {
          simplified: nonZeroChildren[0],
          rule: 'Identity Law',
          description: 'X + 0 = X (removed zero constants)'
        };
      } else if (nonZeroChildren.length > 1) {
        return {
          simplified: { ...expr, children: nonZeroChildren },
          rule: 'Identity Law',
          description: 'X + 0 = X (removed zero constants)'
        };
      }
    }
    
    // Check for X + 1 = 1
    if (expr.children.some(child => child.type === 'constant' && child.value === true)) {
      return {
        simplified: { type: 'constant', value: true },
        rule: 'Null Law',
        description: 'X + 1 = 1 (OR with true always gives true)'
      };
    }
  }
  
  // Handle AND operations with constants
  if (expr.type === 'and' && expr.children) {
    // Check for X · 0 = 0
    if (expr.children.some(child => child.type === 'constant' && child.value === false)) {
      return {
        simplified: { type: 'constant', value: false },
        rule: 'Null Law',
        description: 'X · 0 = 0 (AND with false always gives false)'
      };
    }
    
    // Check for X · 1 = X
    const nonOneChildren = expr.children.filter(child => 
      !(child.type === 'constant' && child.value === true)
    );
    
    if (nonOneChildren.length < expr.children.length) {
      if (nonOneChildren.length === 1) {
        return {
          simplified: nonOneChildren[0],
          rule: 'Identity Law',
          description: 'X · 1 = X (removed one constants)'
        };
      } else if (nonOneChildren.length > 1) {
        return {
          simplified: { ...expr, children: nonOneChildren },
          rule: 'Identity Law',
          description: 'X · 1 = X (removed one constants)'
        };
      }
    }
  }
  
  return { simplified: expr };
}

// Try complement laws: X·X' = 0, X+X' = 1
function tryComplementLaws(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  if (expr.type === 'and' && expr.children) {
    // Look for X and X' in AND operation
    for (let i = 0; i < expr.children.length; i++) {
      for (let j = i + 1; j < expr.children.length; j++) {
        const child1 = expr.children[i];
        const child2 = expr.children[j];
        
        // Check for X and X' pattern
        if (child1.type === 'variable' && child2.type === 'not' &&
            child2.children && child2.children[0].type === 'variable' &&
            child1.value === child2.children[0].value) {
          
          return {
            simplified: { type: 'constant', value: false },
            rule: 'Complement Law',
            description: `${child1.value}·${child1.value}' = 0`
          };
        }
        
        // Check for X' and X pattern
        if (child1.type === 'not' && child2.type === 'variable' &&
            child1.children && child1.children[0].type === 'variable' &&
            child1.children[0].value === child2.value) {
          
          return {
            simplified: { type: 'constant', value: false },
            rule: 'Complement Law',
            description: `${child2.value}'·${child2.value} = 0`
          };
        }
      }
    }
  }
  
  if (expr.type === 'or' && expr.children) {
    // Look for X and X' in OR operation
    for (let i = 0; i < expr.children.length; i++) {
      for (let j = i + 1; j < expr.children.length; j++) {
        const child1 = expr.children[i];
        const child2 = expr.children[j];
        
        // Check for X and X' pattern
        if (child1.type === 'variable' && child2.type === 'not' &&
            child2.children && child2.children[0].type === 'variable' &&
            child1.value === child2.children[0].value) {
          
          return {
            simplified: { type: 'constant', value: true },
            rule: 'Complement Law',
            description: `${child1.value}+${child1.value}' = 1`
          };
        }
        
        // Check for X' and X pattern
        if (child1.type === 'not' && child2.type === 'variable' &&
            child1.children && child1.children[0].type === 'variable' &&
            child1.children[0].value === child2.value) {
          
          return {
            simplified: { type: 'constant', value: true },
            rule: 'Complement Law',
            description: `${child2.value}'+ ${child2.value} = 1`
          };
        }
      }
    }
  }
  
  return { simplified: expr };
}

// Try absorption laws: A + AB = A, A(A + B) = A
function tryAbsorptionLaws(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  if (expr.type === 'or' && expr.children && expr.children.length >= 2) {
    // Check all pairs of OR terms for absorption
    for (let i = 0; i < expr.children.length; i++) {
      for (let j = i + 1; j < expr.children.length; j++) {
        const term1 = expr.children[i];
        const term2 = expr.children[j];
        
        // Get variables from each term
        const vars1 = getVariablesFromTerm(term1);
        const vars2 = getVariablesFromTerm(term2);
        
        // Check if one is a subset of the other
        const vars1IsSubset = vars1.every(v => vars2.includes(v));
        const vars2IsSubset = vars2.every(v => vars1.includes(v));
        
        if (vars1IsSubset && vars1.length < vars2.length) {
          // term1 absorbs term2 (A + AB = A)
          const remainingChildren = expr.children.filter((_, index) => index !== j);
          const result = remainingChildren.length === 1 ? remainingChildren[0] : { ...expr, children: remainingChildren };
          
          return {
            simplified: result,
            rule: 'Absorption Law',
            description: `${vars1.join('')} + ${vars2.join('')} = ${vars1.join('')} (A + AB = A)`
          };
        } else if (vars2IsSubset && vars2.length < vars1.length) {
          // term2 absorbs term1 (AB + A = A)
          const remainingChildren = expr.children.filter((_, index) => index !== i);
          const result = remainingChildren.length === 1 ? remainingChildren[0] : { ...expr, children: remainingChildren };
          
          return {
            simplified: result,
            rule: 'Absorption Law',
            description: `${vars1.join('')} + ${vars2.join('')} = ${vars2.join('')} (AB + A = A)`
          };
        }
      }
    }
  }
  
  return { simplified: expr };
}

// Helper function to get variables from a term (handles both single variables and AND terms)
function getVariablesFromTerm(term: ParsedExpression): string[] {
  if (term.type === 'variable') {
    return [term.value as string];
  } else if (term.type === 'and' && term.children) {
    // Get unique variables from AND term
    const variables = term.children
      .filter(child => child.type === 'variable')
      .map(child => child.value as string);
    return Array.from(new Set(variables)).sort();
  }
  return [];
}

// Try idempotent laws: A·A = A, A+A = A
function tryIdempotentLaws(expr: ParsedExpression): { simplified: ParsedExpression; rule?: string; description?: string } {
  // Handle AND operations - remove duplicate variables
  if (expr.type === 'and' && expr.children) {
    const variableCounts = new Map<string, number>();
    const nonVariableChildren: ParsedExpression[] = [];
    
    for (const child of expr.children) {
      if (child.type === 'variable') {
        const varName = child.value as string;
        variableCounts.set(varName, (variableCounts.get(varName) || 0) + 1);
      } else {
        nonVariableChildren.push(child);
      }
    }
    
    let hasDuplicates = false;
    const simplifiedChildren: ParsedExpression[] = [];
    
    for (const [varName, count] of variableCounts) {
      if (count > 1) hasDuplicates = true;
      simplifiedChildren.push({ type: 'variable', value: varName });
    }
    
    simplifiedChildren.push(...nonVariableChildren);
    
    if (hasDuplicates) {
      return {
        simplified: simplifiedChildren.length === 1 ? simplifiedChildren[0] : { ...expr, children: simplifiedChildren },
        rule: 'Idempotent Law',
        description: 'A·A = A (removed duplicate variables)'
      };
    }
  }

  // Handle OR operations - remove duplicate terms
  if (expr.type === 'or' && expr.children) {
    const termStrings = expr.children.map(child => expressionToString(child));
    const uniqueTerms = new Map<string, ParsedExpression>();
    
    let hasDuplicates = false;
    for (let i = 0; i < expr.children.length; i++) {
      const termStr = termStrings[i];
      if (uniqueTerms.has(termStr)) {
        hasDuplicates = true;
      } else {
        uniqueTerms.set(termStr, expr.children[i]);
      }
    }
    
    if (hasDuplicates) {
      const uniqueChildren = Array.from(uniqueTerms.values());
      return {
        simplified: uniqueChildren.length === 1 ? uniqueChildren[0] : { ...expr, children: uniqueChildren },
        rule: 'Idempotent Law',
        description: 'A+A = A (removed duplicate terms)'
      };
    }
  }
  
  return { simplified: expr };
}

// Check if expression is a tautology (always true)
function isTautology(parsedExpr: ParsedExpression): boolean {
  const truthTable = generateTruthTable(parsedExpr);
  return truthTable.every(row => row.output === true);
}

// Check if expression is a contradiction (always false)
function isContradiction(parsedExpr: ParsedExpression): boolean {
  const truthTable = generateTruthTable(parsedExpr);
  return truthTable.every(row => row.output === false);
}

// Simplify Boolean expression step by step
export function simplifyExpression(parsedExpr: ParsedExpression): SimplificationStep[] {
  const steps: SimplificationStep[] = [];
  let current = JSON.parse(JSON.stringify(parsedExpr));
  const originalExpr = expressionToString(parsedExpr);
  
  steps.push({
    expression: originalExpr,
    rule: 'Start',
    description: 'Original expression'
  });
  
  let changed = true;
  let maxSteps = 10;
  let stepCount = 0;
  
  // Always try to show algebraic steps first, then check for tautology
  while (changed && maxSteps > 0) {
    changed = false;
    maxSteps--;
    stepCount++;
    
    const result = applySimplificationRules(current);
    
    if (result.rule && expressionToString(result.simplified) !== expressionToString(current)) {
      const simplifiedExpr = expressionToString(result.simplified);
      
      steps.push({
        expression: simplifiedExpr,
        rule: result.rule,
        description: result.description || ''
      });
      
      current = result.simplified;
      changed = true;
      
      // Check if simplified expression is now a tautology or contradiction
      if (isTautology(current) && simplifiedExpr !== '1') {
        steps.push({
          expression: '1',
          rule: 'Tautology Reached',
          description: 'All combinations evaluate to true - this is a tautology'
        });
        break;
      }
      
      if (isContradiction(current) && simplifiedExpr !== '0') {
        steps.push({
          expression: '0',
          rule: 'Contradiction Reached', 
          description: 'All combinations evaluate to false - this is a contradiction'
        });
        break;
      }
    }
  }
  
  // If no steps were applied but it's still a tautology/contradiction, detect it
  if (steps.length === 1) {
    if (isTautology(parsedExpr)) {
      steps.push({
        expression: '1',
        rule: 'Tautology Detection',
        description: 'Expression evaluates to 1 (true) for all possible input combinations - this is a tautology'
      });
    } else if (isContradiction(parsedExpr)) {
      steps.push({
        expression: '0',
        rule: 'Contradiction Detection',
        description: 'Expression evaluates to 0 (false) for all possible input combinations - this is a contradiction'
      });
    }
  }
  
  return steps;
}

// Generate Karnaugh Map
export function generateKMap(parsedExpr: ParsedExpression): KMap | null {
  const variables = getVariables(parsedExpr);
  
  if (variables.length < 2 || variables.length > 4) {
    return null;
  }
  
  const truthTable = generateTruthTable(parsedExpr);
  const grayCode2 = ['0', '1'];
  const grayCode4 = ['00', '01', '11', '10'];
  
  let rowLabels: string[];
  let colLabels: string[];
  let rows: number;
  let cols: number;
  
  if (variables.length === 2) {
    rows = 2; cols = 2;
    rowLabels = grayCode2;
    colLabels = grayCode2;
  } else if (variables.length === 3) {
    rows = 2; cols = 4;
    rowLabels = grayCode2;
    colLabels = grayCode4;
  } else {
    rows = 4; cols = 4;
    rowLabels = grayCode4;
    colLabels = grayCode4;
  }
  
  const cells: KMapCell[][] = [];
  
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      const inputs: { [key: string]: boolean } = {};
      
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
      
      const value = evaluateExpression(parsedExpr, inputs);
      
      cells[r][c] = { value, inputs, row: r, col: c };
    }
  }
  
  return { cells, variables, rowLabels, colLabels };
}

// Generate logic circuit representation
export function generateLogicCircuit(parsedExpr: ParsedExpression): LogicCircuit {
  const variables = getVariables(parsedExpr);
  const gates: Gate[] = [];
  const connections: Connection[] = [];
  
  let gateCounter = 0;
  const getNextGateId = () => `gate_${gateCounter++}`;
  
  const INPUT_X = 50;
  const GATE_SPACING_X = 120;
  const INPUT_SPACING_Y = 60;
  
  variables.forEach((variable, index) => {
    gates.push({
      id: `input_${variable}`,
      type: 'input',
      x: INPUT_X,
      y: 100 + index * INPUT_SPACING_Y,
      inputs: [],
      output: variable,
      label: variable
    });
  });
  
  let currentX = INPUT_X + GATE_SPACING_X;
  let currentY = 100;
  
  function buildCircuit(expr: ParsedExpression, level: number = 0): string {
    switch (expr.type) {
      case 'variable':
        return `input_${expr.value}`;
        
      case 'and':
        if (expr.children && expr.children.length >= 2) {
          const inputIds = expr.children.map(child => buildCircuit(child, level + 1));
          const gateId = getNextGateId();
          
          gates.push({
            id: gateId,
            type: 'and',
            x: currentX + level * GATE_SPACING_X,
            y: currentY,
            inputs: inputIds,
            output: gateId + '_out'
          });
          
          currentY += 80;
          return gateId;
        }
        break;
        
      case 'or':
        if (expr.children && expr.children.length >= 2) {
          const inputIds = expr.children.map(child => buildCircuit(child, level + 1));
          const gateId = getNextGateId();
          
          gates.push({
            id: gateId,
            type: 'or',
            x: currentX + level * GATE_SPACING_X,
            y: currentY,
            inputs: inputIds,
            output: gateId + '_out'
          });
          
          currentY += 80;
          return gateId;
        }
        break;
    }
    
    return '';
  }
  
  const outputGateId = buildCircuit(parsedExpr);
  
  const outputGate = gates.find(g => g.id === outputGateId);
  if (outputGate) {
    gates.push({
      id: 'output',
      type: 'output',
      x: outputGate.x + GATE_SPACING_X,
      y: outputGate.y,
      inputs: [outputGateId],
      output: 'Y',
      label: 'Y'
    });
  }
  
  gates.forEach(gate => {
    gate.inputs.forEach((inputId, inputIndex) => {
      const inputGate = gates.find(g => g.id === inputId);
      if (inputGate) {
        connections.push({
          from: inputGate.id,
          to: gate.id,
          fromX: inputGate.x + 30,
          fromY: inputGate.y + 15,
          toX: gate.x,
          toY: gate.y + 8 + inputIndex * 14
        });
      }
    });
  });
  
  const width = Math.max(...gates.map(g => g.x)) + 100;
  const height = Math.max(...gates.map(g => g.y)) + 100;
  
  return { gates, connections, inputs: variables, width, height };
}