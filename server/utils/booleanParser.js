/**
 * Advanced Boolean expression parser with robust parsing capabilities
 */

export class ParsedExpression {
  constructor(expression, ast, variables, metadata = {}) {
    this.originalExpression = expression;
    this.ast = ast;
    this.variables = variables;
    this.metadata = {
      complexity: this.calculateComplexity(),
      operatorCount: this.countOperators(),
      depth: this.calculateDepth(),
      ...metadata
    };
  }

  calculateComplexity() {
    const varCount = this.variables.length;
    const opCount = this.metadata.operatorCount || this.countOperators();
    
    if (varCount <= 2 && opCount <= 3) return 'basic';
    if (varCount <= 4 && opCount <= 8) return 'intermediate';
    return 'advanced';
  }

  countOperators() {
    const expression = this.originalExpression;
    return (expression.match(/[+·*'̄()]/g) || []).length;
  }

  calculateDepth() {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of this.originalExpression) {
      if (char === '(') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }

  toString() {
    return this.originalExpression;
  }
}

/**
 * Normalize expression notation for consistent processing
 */
function normalizeExpression(expression) {
  return expression
    .trim()
    // Convert various NOT notations to standard form
    .replace(/([A-Z])'/g, '$1̄')           // A' → Ā
    .replace(/NOT\s+([A-Z])/gi, '$1̄')     // NOT A → Ā
    .replace(/!([A-Z])/g, '$1̄')           // !A → Ā
    
    // Convert various AND notations
    .replace(/\*/g, '·')                   // * → ·
    .replace(/AND/gi, '·')                 // AND → ·
    .replace(/\&\&/g, '·')                 // && → ·
    .replace(/\&/g, '·')                   // & → ·
    
    // Convert various OR notations  
    .replace(/OR/gi, '+')                  // OR → +
    .replace(/\|\|/g, '+')                 // || → +
    .replace(/\|/g, '+')                   // | → +
    
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate expression syntax
 */
function validateExpression(expression) {
  const errors = [];
  
  // Check for valid characters
  const validChars = /^[A-Z0-1'̄+·*()\s]*$/;
  if (!validChars.test(expression)) {
    errors.push('Invalid characters found. Use A-Z variables, +, ·, \', (), 0, 1');
  }
  
  // Check parentheses balance
  let parenCount = 0;
  for (const char of expression) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) {
      errors.push('Mismatched parentheses: closing before opening');
      break;
    }
  }
  if (parenCount > 0) {
    errors.push('Mismatched parentheses: unclosed opening parentheses');
  }
  
  // Check for empty parentheses
  if (expression.includes('()')) {
    errors.push('Empty parentheses found');
  }
  
  // Check for invalid operator sequences
  const invalidSequences = [
    /\+\+/, /··/, /\+·/, /·\+/,  // consecutive operators
    /\([\+·]/, /[\+·]\)/,        // operators at parentheses boundaries
    /^[\+·]/, /[\+·]$/           // operators at start/end
  ];
  
  invalidSequences.forEach(pattern => {
    if (pattern.test(expression)) {
      errors.push(`Invalid operator sequence found: ${pattern.source}`);
    }
  });
  
  return errors;
}

/**
 * Extract variables from expression
 */
function extractVariables(expression) {
  const variables = new Set();
  const matches = expression.match(/[A-Z]/g) || [];
  matches.forEach(match => variables.add(match));
  return Array.from(variables).sort();
}

/**
 * Convert expression to AST (Abstract Syntax Tree)
 */
function buildAST(expression) {
  // Tokenize the expression
  const tokens = tokenize(expression);
  
  // Parse using recursive descent parser
  let index = 0;
  
  function parseOr() {
    let left = parseAnd();
    
    while (index < tokens.length && tokens[index] === '+') {
      index++; // consume '+'
      const right = parseAnd();
      left = {
        type: 'OR',
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseAnd() {
    let left = parseNot();
    
    while (index < tokens.length && 
           tokens[index] !== '+' && 
           tokens[index] !== ')' &&
           (tokens[index] === '·' || isVariable(tokens[index]) || tokens[index] === '(')) {
      
      if (tokens[index] === '·') {
        index++; // consume '·'
      }
      
      const right = parseNot();
      left = {
        type: 'AND',
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseNot() {
    return parsePrimary();
  }
  
  function parsePrimary() {
    if (index >= tokens.length) {
      throw new Error('Unexpected end of expression');
    }
    
    const token = tokens[index];
    
    if (token === '(') {
      index++; // consume '('
      const expr = parseOr();
      if (index >= tokens.length || tokens[index] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      index++; // consume ')'
      return expr;
    }
    
    if (token === '0') {
      index++;
      return { type: 'CONSTANT', value: false };
    }
    
    if (token === '1') {
      index++;
      return { type: 'CONSTANT', value: true };
    }
    
    if (isNegatedVariable(token)) {
      index++;
      return {
        type: 'NOT',
        operand: {
          type: 'VARIABLE',
          name: token[0]
        }
      };
    }
    
    if (isVariable(token)) {
      index++;
      return {
        type: 'VARIABLE',
        name: token
      };
    }
    
    throw new Error(`Unexpected token: ${token}`);
  }
  
  const ast = parseOr();
  
  if (index < tokens.length) {
    throw new Error(`Unexpected token at end: ${tokens[index]}`);
  }
  
  return ast;
}

function tokenize(expression) {
  const tokens = [];
  let i = 0;
  
  while (i < expression.length) {
    const char = expression[i];
    
    if (char === ' ') {
      i++;
      continue;
    }
    
    if (/[A-Z]/.test(char)) {
      // Check for negated variable
      if (i + 1 < expression.length && (expression[i + 1] === '̄' || expression[i + 1] === "'")) {
        tokens.push(char + '̄');
        i += 2;
      } else {
        tokens.push(char);
        i++;
      }
    } else if (char === '+' || char === '·' || char === '(' || char === ')' || char === '0' || char === '1') {
      tokens.push(char);
      i++;
    } else {
      i++; // Skip unknown characters
    }
  }
  
  return tokens;
}

function isVariable(token) {
  return /^[A-Z]$/.test(token);
}

function isNegatedVariable(token) {
  return /^[A-Z]̄$/.test(token);
}

/**
 * Main parsing function
 */
export async function parseExpression(expression) {
  try {
    if (!expression || typeof expression !== 'string') {
      throw new Error('Expression must be a non-empty string');
    }
    
    // Normalize the expression
    const normalized = normalizeExpression(expression);
    
    // Validate syntax
    const errors = validateExpression(normalized);
    if (errors.length > 0) {
      throw new Error(`Syntax errors: ${errors.join(', ')}`);
    }
    
    // Extract variables
    const variables = extractVariables(normalized);
    
    // Build AST
    const ast = buildAST(normalized);
    
    // Create and return parsed expression
    const parsed = new ParsedExpression(
      normalized,
      ast,
      variables,
      {
        parseTime: Date.now()
      }
    );
    
    return parsed;
    
  } catch (error) {
    throw new Error(`Failed to parse expression "${expression}": ${error.message}`);
  }
}

/**
 * Convert AST back to string representation
 */
export function astToString(ast) {
  if (!ast) return '';
  
  switch (ast.type) {
    case 'VARIABLE':
      return ast.name;
    case 'CONSTANT':
      return ast.value ? '1' : '0';
    case 'NOT':
      const operand = astToString(ast.operand);
      if (ast.operand.type === 'VARIABLE') {
        return operand + '̄';
      } else {
        return '(' + operand + ')̄';
      }
    case 'AND':
      const leftAnd = astToString(ast.left);
      const rightAnd = astToString(ast.right);
      const leftParenAnd = ast.left.type === 'OR' ? `(${leftAnd})` : leftAnd;
      const rightParenAnd = ast.right.type === 'OR' ? `(${rightAnd})` : rightAnd;
      return leftParenAnd + rightParenAnd;
    case 'OR':
      const leftOr = astToString(ast.left);
      const rightOr = astToString(ast.right);
      return leftOr + ' + ' + rightOr;
    default:
      return '';
  }
}

/**
 * Evaluate AST with given variable values
 */
export function evaluateAST(ast, variableValues) {
  if (!ast) return false;
  
  switch (ast.type) {
    case 'VARIABLE':
      return variableValues[ast.name] || false;
    case 'CONSTANT':
      return ast.value;
    case 'NOT':
      return !evaluateAST(ast.operand, variableValues);
    case 'AND':
      return evaluateAST(ast.left, variableValues) && evaluateAST(ast.right, variableValues);
    case 'OR':
      return evaluateAST(ast.left, variableValues) || evaluateAST(ast.right, variableValues);
    default:
      return false;
  }
}

export default {
  parseExpression,
  astToString,
  evaluateAST,
  ParsedExpression
}; 