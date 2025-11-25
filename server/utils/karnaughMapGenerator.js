import { evaluateAST } from './booleanParser.js';

/**
 * Comprehensive Karnaugh Map Generator
 * Supports 2-6 variables with automatic grouping and minimization
 */

export class KarnaughMap {
  constructor(expression, variables, cells, groups = [], simplifiedSOP = '', simplifiedPOS = '') {
    this.expression = expression;
    this.variables = variables;
    this.cells = cells;
    this.groups = groups;
    this.simplifiedSOP = simplifiedSOP;
    this.simplifiedPOS = simplifiedPOS;
    this.dimensions = this.calculateDimensions();
    this.grayCodeLabels = this.generateGrayCodeLabels();
    this.analysis = this.analyzeMap();
  }

  calculateDimensions() {
    const varCount = this.variables.length;
    if (varCount <= 2) return { rows: 2, cols: 2 };
    if (varCount <= 3) return { rows: 2, cols: 4 };
    if (varCount <= 4) return { rows: 4, cols: 4 };
    if (varCount <= 5) return { rows: 4, cols: 8 };
    if (varCount <= 6) return { rows: 8, cols: 8 };
    throw new Error('Too many variables for K-map visualization (max 6)');
  }

  generateGrayCodeLabels() {
    const { rows, cols } = this.dimensions;
    const rowBits = Math.log2(rows);
    const colBits = Math.log2(cols);
    
    return {
      rowLabels: this.generateGrayCode(rowBits),
      colLabels: this.generateGrayCode(colBits),
      rowVariables: this.variables.slice(0, rowBits),
      colVariables: this.variables.slice(rowBits)
    };
  }

  generateGrayCode(bits) {
    if (bits === 1) return ['0', '1'];
    if (bits === 2) return ['00', '01', '11', '10'];
    if (bits === 3) return ['000', '001', '011', '010', '110', '111', '101', '100'];
    
    // For higher order Gray codes
    const prev = this.generateGrayCode(bits - 1);
    const result = [];
    
    // Add 0 prefix to existing codes
    prev.forEach(code => result.push('0' + code));
    
    // Add 1 prefix to reversed existing codes
    for (let i = prev.length - 1; i >= 0; i--) {
      result.push('1' + prev[i]);
    }
    
    return result;
  }

  analyzeMap() {
    const totalCells = this.cells.flat().length;
    const oneCells = this.cells.flat().filter(cell => cell.value === true).length;
    const zeroCells = totalCells - oneCells;
    
    return {
      totalCells,
      oneCells,
      zeroCells,
      density: Math.round((oneCells / totalCells) * 100),
      complexity: this.calculateComplexity(),
      hasAdjacentOnes: this.hasAdjacentOnes(),
      groupCount: this.groups.length,
      minimizationEfficiency: this.calculateMinimizationEfficiency()
    };
  }

  calculateComplexity() {
    const varCount = this.variables.length;
    const groupCount = this.groups.length;
    
    if (varCount <= 2) return 'Basic';
    if (varCount <= 4 && groupCount <= 4) return 'Intermediate';
    return 'Advanced';
  }

  hasAdjacentOnes() {
    const { rows, cols } = this.dimensions;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.cells[r][c].value) {
          // Check all adjacent cells (with wraparound)
          const adjacent = [
            [r, (c + 1) % cols], // right
            [r, (c - 1 + cols) % cols], // left
            [(r + 1) % rows, c], // down
            [(r - 1 + rows) % rows, c] // up
          ];
          
          if (adjacent.some(([ar, ac]) => this.cells[ar][ac].value)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  calculateMinimizationEfficiency() {
    const originalTerms = this.cells.flat().filter(cell => cell.value).length;
    const minimizedTerms = this.groups.reduce((sum, group) => sum + group.terms.length, 0);
    
    if (originalTerms === 0) return 100;
    return Math.round(((originalTerms - minimizedTerms) / originalTerms) * 100);
  }

  // Export to different formats
  toASCII() {
    const { rows, cols } = this.dimensions;
    const { rowLabels, colLabels, rowVariables, colVariables } = this.grayCodeLabels;
    
    let result = '\n';
    
    // Column header with variables
    result += '     ' + colVariables.join('') + '\n';
    result += '    ';
    for (let c = 0; c < cols; c++) {
      result += ` ${colLabels[c]}`;
    }
    result += '\n';
    
    // Top border
    result += '   ┌' + '───┬'.repeat(cols - 1) + '───┐\n';
    
    // Data rows
    for (let r = 0; r < rows; r++) {
      if (r === 0) {
        result += `${rowVariables.join('')} `;
      } else {
        result += '   ';
      }
      result += `${rowLabels[r]}│`;
      
      for (let c = 0; c < cols; c++) {
        result += ` ${this.cells[r][c].value ? '1' : '0'} `;
        if (c < cols - 1) result += '│';
      }
      result += '│\n';
      
      // Row separator (except for last row)
      if (r < rows - 1) {
        result += '   ├' + '───┼'.repeat(cols - 1) + '───┤\n';
      }
    }
    
    // Bottom border
    result += '   └' + '───┴'.repeat(cols - 1) + '───┘\n';
    
    return result;
  }

  toHTML() {
    const { rows, cols } = this.dimensions;
    const { rowLabels, colLabels, rowVariables, colVariables } = this.grayCodeLabels;
    
    let html = '<table class="karnaugh-map">\n';
    
    // Header row with column variables and labels
    html += '  <thead>\n';
    html += '    <tr>\n';
    html += `      <th rowspan="2">${rowVariables.join('')}\\${colVariables.join('')}</th>\n`;
    html += `      <th colspan="${cols}">${colVariables.join('')}</th>\n`;
    html += '    </tr>\n';
    html += '    <tr>\n';
    for (let c = 0; c < cols; c++) {
      html += `      <th>${colLabels[c]}</th>\n`;
    }
    html += '    </tr>\n';
    html += '  </thead>\n';
    
    // Data rows
    html += '  <tbody>\n';
    for (let r = 0; r < rows; r++) {
      html += '    <tr>\n';
      html += `      <th>${rowLabels[r]}</th>\n`;
      
      for (let c = 0; c < cols; c++) {
        const cell = this.cells[r][c];
        const value = cell.value ? '1' : '0';
        const classes = ['kmap-cell'];
        
        // Add group classes for styling
        cell.groups?.forEach(groupId => {
          classes.push(`group-${groupId}`);
        });
        
        html += `      <td class="${classes.join(' ')}" data-row="${r}" data-col="${c}">${value}</td>\n`;
      }
      html += '    </tr>\n';
    }
    html += '  </tbody>\n';
    html += '</table>\n';
    
    return html;
  }

  toJSON() {
    return {
      expression: this.expression,
      variables: this.variables,
      dimensions: this.dimensions,
      cells: this.cells,
      groups: this.groups,
      simplifiedSOP: this.simplifiedSOP,
      simplifiedPOS: this.simplifiedPOS,
      grayCodeLabels: this.grayCodeLabels,
      analysis: this.analysis
    };
  }
}

export class KMapCell {
  constructor(row, col, value, inputs, groups = []) {
    this.row = row;
    this.col = col;
    this.value = value;
    this.inputs = inputs;
    this.groups = groups;
    this.binary = this.toBinary();
    this.decimal = this.toDecimal();
  }

  toBinary() {
    return Object.values(this.inputs).map(val => val ? '1' : '0').join('');
  }

  toDecimal() {
    return parseInt(this.toBinary(), 2);
  }
}

export class KMapGroup {
  constructor(id, cells, size, terms, literal) {
    this.id = id;
    this.cells = cells; // Array of {row, col} coordinates
    this.size = size; // Power of 2 (1, 2, 4, 8, etc.)
    this.terms = terms; // Minterms covered by this group
    this.literal = literal; // Simplified literal (e.g., "AB̄", "C")
    this.isPrimeImplicant = this.checkIfPrimeImplicant();
    this.isEssential = false; // Will be determined during minimization
  }

  checkIfPrimeImplicant() {
    // A prime implicant cannot be combined with other groups to form a larger group
    // This is a simplified check - full implementation would require adjacency analysis
    return this.size > 1;
  }
}

/**
 * Generate Karnaugh Map from parsed expression
 */
export async function generateKarnaughMap(parsedExpr, options = {}) {
  try {
    const { 
      autoGroup = true, 
      findMinimizedForm = true,
      includeVisualization = true 
    } = options;

    const variables = parsedExpr.variables;
    const varCount = variables.length;
    
    if (varCount < 2 || varCount > 6) {
      throw new Error(`Karnaugh maps support 2-6 variables. Expression has ${varCount} variables.`);
    }
    
    // Calculate dimensions
    let rows, cols;
    if (varCount <= 2) {
      rows = 2; cols = 2;
    } else if (varCount <= 3) {
      rows = 2; cols = 4;
    } else if (varCount <= 4) {
      rows = 4; cols = 4;
    } else if (varCount <= 5) {
      rows = 4; cols = 8;
    } else {
      rows = 8; cols = 8;
    }
    
    // Generate Gray code for row and column labels
    const rowBits = Math.log2(rows);
    const colBits = Math.log2(cols);
    const rowLabels = generateGrayCode(rowBits);
    const colLabels = generateGrayCode(colBits);
    
    // Create cells array
    const cells = [];
    for (let r = 0; r < rows; r++) {
      cells[r] = [];
      for (let c = 0; c < cols; c++) {
        // Map Gray code to variable values
        const inputs = {};
        
        // Row variables
        for (let i = 0; i < rowBits; i++) {
          const varIndex = i;
          inputs[variables[varIndex]] = rowLabels[r][i] === '1';
        }
        
        // Column variables
        for (let i = 0; i < colBits; i++) {
          const varIndex = rowBits + i;
          if (varIndex < variables.length) {
            inputs[variables[varIndex]] = colLabels[c][i] === '1';
          }
        }
        
        // Evaluate expression for this combination
        const value = evaluateAST(parsedExpr.ast, inputs);
        
        cells[r][c] = new KMapCell(r, c, value, inputs);
      }
    }
    
    // Create Karnaugh map
    let kmap = new KarnaughMap(parsedExpr.originalExpression, variables, cells);
    
    // Perform automatic grouping if requested
    if (autoGroup) {
      const groups = findOptimalGroups(cells, rows, cols);
      kmap.groups = groups;
      
      // Mark cells with their group memberships
      groups.forEach(group => {
        group.cells.forEach(({row, col}) => {
          if (!cells[row][col].groups) {
            cells[row][col].groups = [];
          }
          cells[row][col].groups.push(group.id);
        });
      });
    }
    
    // Find minimized form if requested
    if (findMinimizedForm) {
      const minimized = minimizeFromGroups(kmap.groups, variables);
      kmap.simplifiedSOP = minimized.sop;
      kmap.simplifiedPOS = minimized.pos;
    }
    
    return kmap.toJSON();
    
  } catch (error) {
    throw new Error(`Karnaugh map generation failed: ${error.message}`);
  }
}

/**
 * Generate Gray code sequence
 */
function generateGrayCode(bits) {
  if (bits === 1) return ['0', '1'];
  if (bits === 2) return ['00', '01', '11', '10'];
  if (bits === 3) return ['000', '001', '011', '010', '110', '111', '101', '100'];
  
  const prev = generateGrayCode(bits - 1);
  const result = [];
  
  prev.forEach(code => result.push('0' + code));
  for (let i = prev.length - 1; i >= 0; i--) {
    result.push('1' + prev[i]);
  }
  
  return result;
}

/**
 * Find optimal groups in K-map using advanced grouping algorithm
 */
function findOptimalGroups(cells, rows, cols) {
  const groups = [];
  let groupId = 0;
  
  // Find all 1-cells (minterms)
  const oneCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].value) {
        oneCells.push({row: r, col: c});
      }
    }
  }
  
  if (oneCells.length === 0) return groups;
  
  // Track which cells are already grouped
  const grouped = new Set();
  
  // Try to find largest groups first (powers of 2: 8, 4, 2, 1)
  const groupSizes = [8, 4, 2, 1];
  
  for (const size of groupSizes) {
    findGroupsOfSize(cells, rows, cols, size, oneCells, grouped, groups, groupId);
    groupId += groups.length;
  }
  
  return groups;
}

/**
 * Find groups of specific size
 */
function findGroupsOfSize(cells, rows, cols, size, oneCells, grouped, groups, startGroupId) {
  const patterns = getGroupPatterns(size, rows, cols);
  
  for (const pattern of patterns) {
    // Check if this pattern can form a valid group
    if (isValidGroup(pattern, cells, grouped)) {
      // Create group
      const group = new KMapGroup(
        startGroupId + groups.length,
        pattern,
        size,
        pattern.map(({row, col}) => cells[row][col].decimal),
        generateGroupLiteral(pattern, cells)
      );
      
      groups.push(group);
      
      // Mark cells as grouped
      pattern.forEach(({row, col}) => {
        grouped.add(`${row}-${col}`);
      });
    }
  }
}

/**
 * Get all possible group patterns for a given size
 */
function getGroupPatterns(size, rows, cols) {
  const patterns = [];
  
  switch (size) {
    case 1:
      // Single cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          patterns.push([{row: r, col: c}]);
        }
      }
      break;
      
    case 2:
      // Horizontal pairs
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nextCol = (c + 1) % cols;
          patterns.push([
            {row: r, col: c},
            {row: r, col: nextCol}
          ]);
        }
      }
      
      // Vertical pairs
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nextRow = (r + 1) % rows;
          patterns.push([
            {row: r, col: c},
            {row: nextRow, col: c}
          ]);
        }
      }
      break;
      
    case 4:
      // 2x2 squares
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const r1 = (r + 1) % rows;
          const c1 = (c + 1) % cols;
          patterns.push([
            {row: r, col: c},
            {row: r, col: c1},
            {row: r1, col: c},
            {row: r1, col: c1}
          ]);
        }
      }
      
      // 1x4 horizontal rectangles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rect = [];
          for (let i = 0; i < 4; i++) {
            rect.push({row: r, col: (c + i) % cols});
          }
          patterns.push(rect);
        }
      }
      
      // 4x1 vertical rectangles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rect = [];
          for (let i = 0; i < 4; i++) {
            rect.push({row: (r + i) % rows, col: c});
          }
          patterns.push(rect);
        }
      }
      break;
      
    case 8:
      // 2x4 rectangles and other 8-cell patterns
      // This is a simplified version - full implementation would include all valid 8-cell patterns
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (cols >= 4) {
            const rect = [];
            for (let i = 0; i < 2; i++) {
              for (let j = 0; j < 4; j++) {
                rect.push({row: (r + i) % rows, col: (c + j) % cols});
              }
            }
            patterns.push(rect);
          }
        }
      }
      break;
  }
  
  return patterns;
}

/**
 * Check if a pattern forms a valid group
 */
function isValidGroup(pattern, cells, grouped) {
  // All cells in pattern must be 1 and not already grouped
  return pattern.every(({row, col}) => {
    return cells[row][col].value && !grouped.has(`${row}-${col}`);
  });
}

/**
 * Generate the literal representation for a group
 */
function generateGroupLiteral(pattern, cells) {
  if (pattern.length === 0) return '';
  
  // Find which variables remain constant across all cells in the group
  const firstCell = cells[pattern[0].row][pattern[0].col];
  const constantVariables = {};
  
  // Check each variable
  Object.keys(firstCell.inputs).forEach(variable => {
    const firstValue = firstCell.inputs[variable];
    const isConstant = pattern.every(({row, col}) => {
      return cells[row][col].inputs[variable] === firstValue;
    });
    
    if (isConstant) {
      constantVariables[variable] = firstValue;
    }
  });
  
  // Build literal from constant variables
  const literals = Object.entries(constantVariables).map(([variable, value]) => {
    return value ? variable : variable + '̄';
  });
  
  return literals.join('');
}

/**
 * Minimize expression from groups
 */
function minimizeFromGroups(groups, variables) {
  if (groups.length === 0) {
    return { sop: '0', pos: '1' };
  }
  
  // Generate SOP form
  const sopTerms = groups.map(group => group.literal).filter(literal => literal);
  const sop = sopTerms.length > 0 ? sopTerms.join(' + ') : '1';
  
  // Generate POS form (simplified approach)
  // In practice, this would require more complex analysis
  const pos = sop; // Placeholder - would need De Morgan's and distribution
  
  return { sop, pos };
}

/**
 * Solve K-map step by step
 */
export function solveKMapStepByStep(parsedExpr) {
  const steps = [];
  
  try {
    // Step 1: Generate K-map
    steps.push({
      step: 1,
      description: 'Generate Karnaugh Map from expression',
      action: 'Fill K-map cells with truth table values'
    });
    
    const kmap = generateKarnaughMap(parsedExpr);
    
    // Step 2: Identify minterms
    const minterms = [];
    kmap.cells.flat().forEach(cell => {
      if (cell.value) minterms.push(cell.decimal);
    });
    
    steps.push({
      step: 2,
      description: 'Identify minterms (cells with value 1)',
      action: `Found minterms: ${minterms.join(', ')}`
    });
    
    // Step 3: Find groups
    steps.push({
      step: 3,
      description: 'Find optimal groups of adjacent 1s',
      action: `Found ${kmap.groups.length} groups`
    });
    
    // Step 4: Generate simplified expression
    steps.push({
      step: 4,
      description: 'Generate simplified SOP expression from groups',
      action: `Simplified form: ${kmap.simplifiedSOP}`
    });
    
    return {
      kmap,
      steps,
      minterms,
      simplifiedSOP: kmap.simplifiedSOP
    };
    
  } catch (error) {
    throw new Error(`K-map step-by-step solution failed: ${error.message}`);
  }
}

export default {
  generateKarnaughMap,
  solveKMapStepByStep,
  KarnaughMap,
  KMapCell,
  KMapGroup
}; 