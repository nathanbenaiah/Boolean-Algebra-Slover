import { evaluateAST } from './booleanParser.js';

/**
 * Comprehensive Truth Table Generator
 * Supports multiple formats and analysis features
 */

export class TruthTableRow {
  constructor(inputs, output, minterm = null, maxterm = null) {
    this.inputs = inputs;
    this.output = output;
    this.minterm = minterm;
    this.maxterm = maxterm;
    this.binaryInput = this.toBinaryString();
    this.decimalInput = this.toDecimal();
  }

  toBinaryString() {
    return Object.values(this.inputs).map(val => val ? '1' : '0').join('');
  }

  toDecimal() {
    const binary = this.toBinaryString();
    return parseInt(binary, 2);
  }
}

export class TruthTable {
  constructor(expression, variables, rows) {
    this.expression = expression;
    this.variables = variables;
    this.rows = rows;
    this.minterms = this.getMinterms();
    this.maxterms = this.getMaxterms();
    this.analysis = this.analyzeTable();
  }

  getMinterms() {
    return this.rows
      .filter(row => row.output === true)
      .map(row => row.decimalInput);
  }

  getMaxterms() {
    return this.rows
      .filter(row => row.output === false)
      .map(row => row.decimalInput);
  }

  analyzeTable() {
    const totalRows = this.rows.length;
    const trueRows = this.minterms.length;
    const falseRows = this.maxterms.length;
    
    return {
      totalCombinations: totalRows,
      trueCombinations: trueRows,
      falseCombinations: falseRows,
      percentageTrue: Math.round((trueRows / totalRows) * 100),
      percentageFalse: Math.round((falseRows / totalRows) * 100),
      isTautology: trueRows === totalRows,
      isContradiction: trueRows === 0,
      isContingency: trueRows > 0 && trueRows < totalRows,
      complexity: this.calculateComplexity()
    };
  }

  calculateComplexity() {
    const variableCount = this.variables.length;
    const trueCount = this.minterms.length;
    const falseCount = this.maxterms.length;
    
    // Complex expressions tend to have more balanced truth/false distribution
    const balance = Math.abs(trueCount - falseCount) / this.rows.length;
    
    if (variableCount <= 2) return 'Basic';
    if (variableCount <= 4 && balance < 0.5) return 'Intermediate';
    return 'Advanced';
  }

  // Convert to Sum of Products (SOP) canonical form
  toCanonicalSOP() {
    if (this.minterms.length === 0) return '0';
    if (this.minterms.length === this.rows.length) return '1';
    
    const terms = this.minterms.map(minterm => {
      const binary = minterm.toString(2).padStart(this.variables.length, '0');
      const literals = binary.split('').map((bit, index) => {
        const variable = this.variables[index];
        return bit === '1' ? variable : variable + '̄';
      });
      return literals.join('');
    });
    
    return terms.join(' + ');
  }

  // Convert to Product of Sums (POS) canonical form
  toCanonicalPOS() {
    if (this.maxterms.length === 0) return '1';
    if (this.maxterms.length === this.rows.length) return '0';
    
    const terms = this.maxterms.map(maxterm => {
      const binary = maxterm.toString(2).padStart(this.variables.length, '0');
      const literals = binary.split('').map((bit, index) => {
        const variable = this.variables[index];
        return bit === '0' ? variable : variable + '̄';
      });
      return '(' + literals.join(' + ') + ')';
    });
    
    return terms.join('');
  }

  // Export to different formats
  toCSV() {
    const header = [...this.variables, 'Output'].join(',');
    const rows = this.rows.map(row => {
      const inputValues = this.variables.map(variable => row.inputs[variable] ? '1' : '0');
      return [...inputValues, row.output ? '1' : '0'].join(',');
    });
    return [header, ...rows].join('\n');
  }

  toJSON() {
    return {
      expression: this.expression,
      variables: this.variables,
      rows: this.rows.map(row => ({
        inputs: row.inputs,
        output: row.output,
        binary: row.binaryInput,
        decimal: row.decimalInput
      })),
      minterms: this.minterms,
      maxterms: this.maxterms,
      canonicalSOP: this.toCanonicalSOP(),
      canonicalPOS: this.toCanonicalPOS(),
      analysis: this.analysis
    };
  }

  // Generate LaTeX table format
  toLaTeX() {
    const variableHeaders = this.variables.join(' & ');
    const header = `${variableHeaders} & Output \\\\`;
    
    const rows = this.rows.map(row => {
      const inputValues = this.variables.map(variable => row.inputs[variable] ? '1' : '0');
      const outputValue = row.output ? '1' : '0';
      return [...inputValues, outputValue].join(' & ') + ' \\\\';
    });
    
    return `\\begin{array}{${'c'.repeat(this.variables.length + 1)}}\n${header}\n\\hline\n${rows.join('\n')}\n\\end{array}`;
  }

  // Generate HTML table
  toHTML() {
    const headerRow = '<tr><th>' + this.variables.join('</th><th>') + '</th><th>Output</th></tr>';
    
    const bodyRows = this.rows.map(row => {
      const inputCells = this.variables.map(variable => 
        `<td>${row.inputs[variable] ? '1' : '0'}</td>`
      ).join('');
      const outputCell = `<td>${row.output ? '1' : '0'}</td>`;
      return `<tr>${inputCells}${outputCell}</tr>`;
    });
    
    return `<table class="truth-table">\n<thead>\n${headerRow}\n</thead>\n<tbody>\n${bodyRows.join('\n')}\n</tbody>\n</table>`;
  }
}

/**
 * Generate comprehensive truth table
 */
export async function generateTruthTable(parsedExpr, options = {}) {
  try {
    const {
      includeIntermediateSteps = false,
      groupByOutput = false,
      includeAnalysis = true
    } = options;

    const variables = parsedExpr.variables;
    const numCombinations = Math.pow(2, variables.length);
    
    if (numCombinations > 1024) {
      throw new Error(`Too many variables (${variables.length}). Maximum supported is 10 variables.`);
    }

    const rows = [];
    
    // Generate all possible input combinations using Gray code ordering if requested
    for (let i = 0; i < numCombinations; i++) {
      const inputs = {};
      
      // Generate binary representation for this combination
      variables.forEach((variable, index) => {
        const bitPosition = variables.length - 1 - index;
        inputs[variable] = (i & (1 << bitPosition)) !== 0;
      });
      
      // Evaluate the expression
      const output = evaluateAST(parsedExpr.ast, inputs);
      
      // Create truth table row
      const row = new TruthTableRow(
        inputs,
        output,
        output ? i : null,
        !output ? i : null
      );
      
      rows.push(row);
    }
    
    // Create truth table object
    const truthTable = new TruthTable(
      parsedExpr.originalExpression,
      variables,
      rows
    );
    
    // Group by output if requested
    if (groupByOutput) {
      const trueRows = rows.filter(row => row.output === true);
      const falseRows = rows.filter(row => row.output === false);
      
      return {
        ...truthTable.toJSON(),
        groupedByOutput: {
          trueRows,
          falseRows
        }
      };
    }
    
    // Include intermediate steps for complex expressions if requested
    if (includeIntermediateSteps && parsedExpr.ast.type !== 'VARIABLE') {
      const intermediateSteps = await generateIntermediateSteps(parsedExpr.ast, variables);
      return {
        ...truthTable.toJSON(),
        intermediateSteps
      };
    }
    
    return truthTable.toJSON();
    
  } catch (error) {
    throw new Error(`Truth table generation failed: ${error.message}`);
  }
}

/**
 * Generate intermediate evaluation steps for complex expressions
 */
async function generateIntermediateSteps(ast, variables) {
  const steps = [];
  const subExpressions = extractSubExpressions(ast);
  
  for (const subExpr of subExpressions) {
    const subExprString = astToString(subExpr);
    const subRows = [];
    
    const numCombinations = Math.pow(2, variables.length);
    for (let i = 0; i < numCombinations; i++) {
      const inputs = {};
      variables.forEach((variable, index) => {
        const bitPosition = variables.length - 1 - index;
        inputs[variable] = (i & (1 << bitPosition)) !== 0;
      });
      
      const output = evaluateAST(subExpr, inputs);
      subRows.push(new TruthTableRow(inputs, output));
    }
    
    steps.push({
      expression: subExprString,
      rows: subRows
    });
  }
  
  return steps;
}

/**
 * Extract all sub-expressions from AST for intermediate steps
 */
function extractSubExpressions(ast, expressions = []) {
  if (!ast || ast.type === 'VARIABLE' || ast.type === 'CONSTANT') {
    return expressions;
  }
  
  expressions.push(ast);
  
  if (ast.left) {
    extractSubExpressions(ast.left, expressions);
  }
  if (ast.right) {
    extractSubExpressions(ast.right, expressions);
  }
  if (ast.operand) {
    extractSubExpressions(ast.operand, expressions);
  }
  
  return expressions;
}

// Import astToString function
function astToString(ast) {
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
 * Compare two truth tables for equivalence
 */
export function compareTruthTables(table1, table2) {
  if (table1.variables.length !== table2.variables.length) {
    return {
      equivalent: false,
      reason: 'Different number of variables'
    };
  }
  
  // Check if variables are the same (order doesn't matter)
  const vars1 = [...table1.variables].sort();
  const vars2 = [...table2.variables].sort();
  
  if (vars1.join('') !== vars2.join('')) {
    return {
      equivalent: false,
      reason: 'Different variables'
    };
  }
  
  // Compare outputs for each input combination
  for (let i = 0; i < table1.rows.length; i++) {
    const row1 = table1.rows[i];
    const row2 = table2.rows[i];
    
    if (row1.output !== row2.output) {
      return {
        equivalent: false,
        reason: `Different outputs for input ${row1.binaryInput}`,
        differingRow: i
      };
    }
  }
  
  return {
    equivalent: true,
    reason: 'Truth tables are equivalent'
  };
}

/**
 * Generate truth table from minterms
 */
export function generateFromMinterms(variables, minterms) {
  const numCombinations = Math.pow(2, variables.length);
  const rows = [];
  
  for (let i = 0; i < numCombinations; i++) {
    const inputs = {};
    variables.forEach((variable, index) => {
      const bitPosition = variables.length - 1 - index;
      inputs[variable] = (i & (1 << bitPosition)) !== 0;
    });
    
    const output = minterms.includes(i);
    rows.push(new TruthTableRow(inputs, output, output ? i : null, !output ? i : null));
  }
  
  return new TruthTable('Generated from minterms', variables, rows);
}

/**
 * Generate truth table from maxterms
 */
export function generateFromMaxterms(variables, maxterms) {
  const numCombinations = Math.pow(2, variables.length);
  const rows = [];
  
  for (let i = 0; i < numCombinations; i++) {
    const inputs = {};
    variables.forEach((variable, index) => {
      const bitPosition = variables.length - 1 - index;
      inputs[variable] = (i & (1 << bitPosition)) !== 0;
    });
    
    const output = !maxterms.includes(i);
    rows.push(new TruthTableRow(inputs, output, output ? i : null, !output ? i : null));
  }
  
  return new TruthTable('Generated from maxterms', variables, rows);
}

export default {
  generateTruthTable,
  compareTruthTables,
  generateFromMinterms,
  generateFromMaxterms,
  TruthTable,
  TruthTableRow
}; 