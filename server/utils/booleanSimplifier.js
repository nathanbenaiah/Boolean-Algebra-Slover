import { astToString, evaluateAST } from './booleanParser.js';

/**
 * Advanced Boolean Expression Simplifier
 * Uses multiple algorithms for optimal results
 */

export class SimplificationResult {
  constructor(originalExpression, simplifiedExpression, steps, method, metadata = {}) {
    this.originalExpression = originalExpression;
    this.simplifiedExpression = simplifiedExpression;
    this.steps = steps;
    this.method = method;
    this.rulesApplied = steps.map(step => step.rule);
    this.metadata = {
      reductionPercentage: this.calculateReduction(),
      gateCount: this.calculateGateCount(),
      ...metadata
    };
  }

  calculateReduction() {
    const originalLength = this.originalExpression.length;
    const simplifiedLength = this.simplifiedExpression.length;
    return Math.round(((originalLength - simplifiedLength) / originalLength) * 100);
  }

  calculateGateCount() {
    const gates = (this.simplifiedExpression.match(/[+·̄]/g) || []).length;
    return gates;
  }
}

export class SimplificationStep {
  constructor(expression, rule, description, before = '', after = '') {
    this.expression = expression;
    this.rule = rule;
    this.description = description;
    this.before = before;
    this.after = after;
    this.timestamp = Date.now();
  }
}

/**
 * Apply basic Boolean algebra laws
 */
function applyBasicLaws(ast) {
  const steps = [];
  let current = JSON.parse(JSON.stringify(ast)); // Deep copy
  let changed = true;
  
  while (changed) {
    changed = false;
    const result = applyLawsRecursive(current);
    
    if (result.changed) {
      steps.push(new SimplificationStep(
        astToString(result.ast),
        result.rule,
        result.description,
        astToString(current),
        astToString(result.ast)
      ));
      current = result.ast;
      changed = true;
    }
  }
  
  return { ast: current, steps };
}

function applyLawsRecursive(ast) {
  if (!ast) return { ast, changed: false };

  // Apply laws to children first (bottom-up approach)
  if (ast.left) {
    const leftResult = applyLawsRecursive(ast.left);
    if (leftResult.changed) {
      ast.left = leftResult.ast;
      return { ast, changed: true, rule: leftResult.rule, description: leftResult.description };
    }
  }
  
  if (ast.right) {
    const rightResult = applyLawsRecursive(ast.right);
    if (rightResult.changed) {
      ast.right = rightResult.ast;
      return { ast, changed: true, rule: rightResult.rule, description: rightResult.description };
    }
  }
  
  if (ast.operand) {
    const operandResult = applyLawsRecursive(ast.operand);
    if (operandResult.changed) {
      ast.operand = operandResult.ast;
      return { ast, changed: true, rule: operandResult.rule, description: operandResult.description };
    }
  }

  // Apply laws to current node
  return applyLawsToNode(ast);
}

function applyLawsToNode(ast) {
  // Identity Laws: A + 0 = A, A · 1 = A
  if (ast.type === 'OR') {
    if (ast.left?.type === 'CONSTANT' && ast.left.value === false) {
      return {
        ast: ast.right,
        changed: true,
        rule: 'Identity Law',
        description: 'A + 0 = A'
      };
    }
    if (ast.right?.type === 'CONSTANT' && ast.right.value === false) {
      return {
        ast: ast.left,
        changed: true,
        rule: 'Identity Law', 
        description: 'A + 0 = A'
      };
    }
  }
  
  if (ast.type === 'AND') {
    if (ast.left?.type === 'CONSTANT' && ast.left.value === true) {
      return {
        ast: ast.right,
        changed: true,
        rule: 'Identity Law',
        description: 'A · 1 = A'
      };
    }
    if (ast.right?.type === 'CONSTANT' && ast.right.value === true) {
      return {
        ast: ast.left,
        changed: true,
        rule: 'Identity Law',
        description: 'A · 1 = A'
      };
    }
  }

  // Null Laws: A + 1 = 1, A · 0 = 0
  if (ast.type === 'OR') {
    if ((ast.left?.type === 'CONSTANT' && ast.left.value === true) ||
        (ast.right?.type === 'CONSTANT' && ast.right.value === true)) {
      return {
        ast: { type: 'CONSTANT', value: true },
        changed: true,
        rule: 'Null Law',
        description: 'A + 1 = 1'
      };
    }
  }
  
  if (ast.type === 'AND') {
    if ((ast.left?.type === 'CONSTANT' && ast.left.value === false) ||
        (ast.right?.type === 'CONSTANT' && ast.right.value === false)) {
      return {
        ast: { type: 'CONSTANT', value: false },
        changed: true,
        rule: 'Null Law',
        description: 'A · 0 = 0'
      };
    }
  }

  // Idempotent Laws: A + A = A, A · A = A
  if ((ast.type === 'OR' || ast.type === 'AND') && nodesEqual(ast.left, ast.right)) {
    return {
      ast: ast.left,
      changed: true,
      rule: 'Idempotent Law',
      description: ast.type === 'OR' ? 'A + A = A' : 'A · A = A'
    };
  }

  // Complement Laws: A + A' = 1, A · A' = 0
  if (ast.type === 'OR' && isComplementPair(ast.left, ast.right)) {
    return {
      ast: { type: 'CONSTANT', value: true },
      changed: true,
      rule: 'Complement Law',
      description: 'A + A\' = 1'
    };
  }
  
  if (ast.type === 'AND' && isComplementPair(ast.left, ast.right)) {
    return {
      ast: { type: 'CONSTANT', value: false },
      changed: true,
      rule: 'Complement Law',
      description: 'A · A\' = 0'
    };
  }

  // Double Negation: (A')' = A
  if (ast.type === 'NOT' && ast.operand?.type === 'NOT') {
    return {
      ast: ast.operand.operand,
      changed: true,
      rule: 'Double Negation',
      description: '(A\')' + '\' = A'
    };
  }

  // Absorption Laws: A + AB = A, A(A + B) = A
  if (ast.type === 'OR' && isAbsorption(ast.left, ast.right)) {
    return {
      ast: ast.left,
      changed: true,
      rule: 'Absorption Law',
      description: 'A + AB = A'
    };
  }
  
  if (ast.type === 'AND' && isAbsorption(ast.left, ast.right)) {
    return {
      ast: ast.left,
      changed: true,
      rule: 'Absorption Law',
      description: 'A(A + B) = A'
    };
  }

  return { ast, changed: false };
}

// Helper functions
function nodesEqual(node1, node2) {
  if (!node1 || !node2) return false;
  if (node1.type !== node2.type) return false;
  
  switch (node1.type) {
    case 'VARIABLE':
      return node1.name === node2.name;
    case 'CONSTANT':
      return node1.value === node2.value;
    case 'NOT':
      return nodesEqual(node1.operand, node2.operand);
    case 'AND':
    case 'OR':
      return (nodesEqual(node1.left, node2.left) && nodesEqual(node1.right, node2.right)) ||
             (nodesEqual(node1.left, node2.right) && nodesEqual(node1.right, node2.left));
    default:
      return false;
  }
}

function isComplementPair(node1, node2) {
  if (!node1 || !node2) return false;
  
  // Check if node2 is NOT of node1
  if (node2.type === 'NOT' && nodesEqual(node1, node2.operand)) {
    return true;
  }
  
  // Check if node1 is NOT of node2
  if (node1.type === 'NOT' && nodesEqual(node2, node1.operand)) {
    return true;
  }
  
  return false;
}

function isAbsorption(node1, node2) {
  if (!node1 || !node2) return false;
  
  // Check for A + AB pattern (node1 = A, node2 = AB where AB contains A)
  if (node2.type === 'AND') {
    return containsNode(node2, node1);
  }
  
  // Check for A(A + B) pattern (node1 = A, node2 = A + B where A + B contains A)
  if (node2.type === 'OR') {
    return containsNode(node2, node1);
  }
  
  return false;
}

function containsNode(container, target) {
  if (nodesEqual(container, target)) return true;
  
  if (container.left && (containsNode(container.left, target) || nodesEqual(container.left, target))) {
    return true;
  }
  
  if (container.right && (containsNode(container.right, target) || nodesEqual(container.right, target))) {
    return true;
  }
  
  return false;
}

/**
 * Custom Quine-McCluskey Algorithm Implementation
 */
async function quineMcCluskeySimplification(parsedExpr) {
  try {
    // Generate truth table
    const variables = parsedExpr.variables;
    const truthTable = [];
    
    for (let i = 0; i < Math.pow(2, variables.length); i++) {
      const values = {};
      variables.forEach((variable, index) => {
        values[variable] = (i & (1 << (variables.length - 1 - index))) !== 0;
      });
      
      const output = evaluateAST(parsedExpr.ast, values);
      if (output) {
        truthTable.push(i);
      }
    }
    
    if (truthTable.length === 0) {
      return {
        expression: '0',
        steps: [new SimplificationStep('0', 'Quine-McCluskey', 'Expression is always false')]
      };
    }
    
    // Apply basic Quine-McCluskey minimization
    const minimized = basicQuineMcCluskey(truthTable, variables);
    
    const steps = [
      new SimplificationStep(
        minimized,
        'Quine-McCluskey',
        'Applied Quine-McCluskey minimization algorithm'
      )
    ];
    
    return { expression: minimized, steps };
    
  } catch (error) {
    console.warn('Quine-McCluskey failed:', error);
    return null;
  }
}

/**
 * Basic Quine-McCluskey implementation
 */
function basicQuineMcCluskey(minterms, variables) {
  if (minterms.length === 0) return '0';
  if (minterms.length === Math.pow(2, variables.length)) return '1';
  
  // Convert minterms to binary groups
  const groups = [];
  for (let i = 0; i <= variables.length; i++) {
    groups[i] = [];
  }
  
  minterms.forEach(minterm => {
    const binary = minterm.toString(2).padStart(variables.length, '0');
    const oneCount = binary.split('1').length - 1;
    groups[oneCount].push({
      binary,
      minterms: [minterm],
      used: false
    });
  });
  
  // Find prime implicants
  const primeImplicants = [];
  let currentGroups = groups;
  
  while (currentGroups.some(group => group.length > 0)) {
    const nextGroups = [];
    for (let i = 0; i <= variables.length; i++) {
      nextGroups[i] = [];
    }
    
    for (let i = 0; i < currentGroups.length - 1; i++) {
      for (const term1 of currentGroups[i]) {
        for (const term2 of currentGroups[i + 1]) {
          const combined = combineBinaryTerms(term1.binary, term2.binary);
          if (combined) {
            term1.used = true;
            term2.used = true;
            const oneCount = combined.split('1').length - 1;
            nextGroups[oneCount].push({
              binary: combined,
              minterms: [...term1.minterms, ...term2.minterms],
              used: false
            });
          }
        }
      }
    }
    
    // Add unused terms as prime implicants
    currentGroups.forEach(group => {
      group.forEach(term => {
        if (!term.used) {
          primeImplicants.push(term);
        }
      });
    });
    
    currentGroups = nextGroups;
  }
  
  // Convert prime implicants to expression
  const terms = primeImplicants.map(pi => binaryToTerm(pi.binary, variables));
  return terms.join(' + ') || '0';
}

function combineBinaryTerms(term1, term2) {
  let differences = 0;
  let diffPosition = -1;
  
  for (let i = 0; i < term1.length; i++) {
    if (term1[i] !== term2[i]) {
      differences++;
      diffPosition = i;
    }
  }
  
  if (differences === 1) {
    return term1.substring(0, diffPosition) + '-' + term1.substring(diffPosition + 1);
  }
  
  return null;
}

function binaryToTerm(binary, variables) {
  const literals = [];
  
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] !== '-') {
      const variable = variables[i];
      if (binary[i] === '1') {
        literals.push(variable);
      } else {
        literals.push(variable + '̄');
      }
    }
  }
  
  return literals.join('');
}

/**
 * Advanced De Morgan's Law application
 */
function applyDeMorganLaws(ast) {
  const steps = [];
  
  function applyDeMorganRecursive(node) {
    if (!node) return node;
    
    // Apply to children first
    if (node.left) {
      node.left = applyDeMorganRecursive(node.left);
    }
    if (node.right) {
      node.right = applyDeMorganRecursive(node.right);
    }
    if (node.operand) {
      node.operand = applyDeMorganRecursive(node.operand);
    }
    
    // Apply De Morgan's laws
    if (node.type === 'NOT') {
      if (node.operand?.type === 'AND') {
        // !(A·B) = !A + !B
        const newNode = {
          type: 'OR',
          left: { type: 'NOT', operand: node.operand.left },
          right: { type: 'NOT', operand: node.operand.right }
        };
        
        steps.push(new SimplificationStep(
          astToString(newNode),
          'De Morgan\'s Law',
          '!(A·B) = !A + !B',
          astToString(node),
          astToString(newNode)
        ));
        
        return newNode;
      }
      
      if (node.operand?.type === 'OR') {
        // !(A+B) = !A · !B
        const newNode = {
          type: 'AND',
          left: { type: 'NOT', operand: node.operand.left },
          right: { type: 'NOT', operand: node.operand.right }
        };
        
        steps.push(new SimplificationStep(
          astToString(newNode),
          'De Morgan\'s Law',
          '!(A+B) = !A · !B',
          astToString(node),
          astToString(newNode)
        ));
        
        return newNode;
      }
    }
    
    return node;
  }
  
  const result = applyDeMorganRecursive(JSON.parse(JSON.stringify(ast)));
  return { ast: result, steps };
}

/**
 * Main simplification function
 */
export async function simplifyExpression(parsedExpr, options = {}) {
  try {
    const { method = 'auto' } = options;
    const originalExpression = astToString(parsedExpr.ast);
    
    let bestResult = {
      expression: originalExpression,
      steps: []
    };
    
    // Try different simplification methods
    const methods = [];
    
    if (method === 'auto' || method === 'basic') {
      // Basic Boolean algebra laws
      const basicResult = applyBasicLaws(parsedExpr.ast);
      methods.push({
        name: 'Basic Laws',
        expression: astToString(basicResult.ast),
        steps: basicResult.steps
      });
    }
    
    if (method === 'auto' || method === 'demorgan') {
      // Apply De Morgan's laws
      const demorganResult = applyDeMorganLaws(parsedExpr.ast);
      const afterDemorgan = applyBasicLaws(demorganResult.ast);
      methods.push({
        name: 'De Morgan + Basic',
        expression: astToString(afterDemorgan.ast),
        steps: [...demorganResult.steps, ...afterDemorgan.steps]
      });
    }
    
    if (method === 'auto' || method === 'quine-mccluskey') {
      // Quine-McCluskey algorithm
      const qmResult = await quineMcCluskeySimplification(parsedExpr);
      if (qmResult) {
        methods.push({
          name: 'Quine-McCluskey',
          expression: qmResult.expression,
          steps: qmResult.steps
        });
      }
    }
    
    // Choose the best result (shortest expression)
    if (methods.length > 0) {
      bestResult = methods.reduce((best, current) => {
        return current.expression.length < best.expression.length ? current : best;
      });
    }
    
    const result = new SimplificationResult(
      originalExpression,
      bestResult.expression,
      bestResult.steps,
      bestResult.name || method,
      {
        methodsAttempted: methods.map(m => m.name),
        alternativeResults: methods.filter(m => m.name !== bestResult.name)
      }
    );
    
    return result;
    
  } catch (error) {
    throw new Error(`Simplification failed: ${error.message}`);
  }
}

export default {
  simplifyExpression,
  SimplificationResult,
  SimplificationStep
}; 