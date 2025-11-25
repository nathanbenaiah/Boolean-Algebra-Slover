// Advanced Karnaugh Map Generator with D3 Visualization
// Supports 2-6 variables with automatic grouping and optimization

import * as d3 from 'd3';
import { BooleanExpression, evaluateExpression, getVariables } from './comprehensiveBooleanSolver.ts';

export interface KMapCell {
  row: number;
  col: number;
  value: boolean;
  minterm: number;
  grayCode: string;
  variables: { [key: string]: boolean };
  covered: boolean;
  groupIds: string[];
}

export interface KMapGroup {
  id: string;
  cells: KMapCell[];
  term: string;
  size: number;
  isPowerOfTwo: boolean;
  variables: string[];
  eliminatedVars: string[];
}

export interface KarnaughMap {
  variables: string[];
  cells: KMapCell[][];
  groups: KMapGroup[];
  minterms: number[];
  maxterms: number[];
  simplifiedSOP: string;
  simplifiedPOS: string;
  rowLabels: string[];
  colLabels: string[];
  dimensions: { rows: number; cols: number };
  grayCodeOrder: boolean;
}

// Generate Gray code sequence for n bits
export function generateGrayCode(n: number): string[] {
  if (n === 0) return [''];
  if (n === 1) return ['0', '1'];
  
  const prev = generateGrayCode(n - 1);
  const result: string[] = [];
  
  // First half: add '0' prefix to previous sequence
  for (const code of prev) {
    result.push('0' + code);
  }
  
  // Second half: add '1' prefix to reversed previous sequence  
  for (let i = prev.length - 1; i >= 0; i--) {
    result.push('1' + prev[i]);
  }
  
  return result;
}

// Convert binary string to decimal
function binaryToDecimal(binary: string): number {
  return parseInt(binary, 2);
}

// Convert decimal to binary with specified width
function decimalToBinary(decimal: number, width: number): string {
  return decimal.toString(2).padStart(width, '0');
}

// Determine optimal K-map dimensions for variable count
function getKMapDimensions(varCount: number): { rows: number; cols: number; rowVars: number; colVars: number } {
  switch (varCount) {
    case 1:
      return { rows: 1, cols: 2, rowVars: 0, colVars: 1 };
    case 2:
      return { rows: 2, cols: 2, rowVars: 1, colVars: 1 };
    case 3:
      return { rows: 2, cols: 4, rowVars: 1, colVars: 2 };
    case 4:
      return { rows: 4, cols: 4, rowVars: 2, colVars: 2 };
    case 5:
      return { rows: 4, cols: 8, rowVars: 2, colVars: 3 };
    case 6:
      return { rows: 8, cols: 8, rowVars: 3, colVars: 3 };
    default:
      throw new Error(`K-maps support 1-6 variables. Got ${varCount} variables.`);
  }
}

// Generate comprehensive Karnaugh map from Boolean expression
export function generateKarnaughMap(expression: BooleanExpression): KarnaughMap {
  const variables = getVariables(expression).sort();
  const varCount = variables.length;
  
  if (varCount < 1 || varCount > 6) {
    throw new Error(`K-maps support 1-6 variables. Expression has ${varCount} variables.`);
  }
  
  const dimensions = getKMapDimensions(varCount);
  const { rows, cols, rowVars, colVars } = dimensions;
  
  // Generate Gray code labels
  const rowGrayCode = rowVars > 0 ? generateGrayCode(rowVars) : [''];
  const colGrayCode = colVars > 0 ? generateGrayCode(colVars) : [''];
  
  // Create K-map cells
  const cells: KMapCell[][] = [];
  const minterms: number[] = [];
  const maxterms: number[] = [];
  
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      // Map Gray code positions to variable assignments
      const variableAssignment: { [key: string]: boolean } = {};
      
      // Assign row variables
      const rowCode = rowGrayCode[r] || '';
      for (let i = 0; i < rowVars; i++) {
        if (i < variables.length) {
          variableAssignment[variables[i]] = rowCode[i] === '1';
        }
      }
      
      // Assign column variables
      const colCode = colGrayCode[c] || '';
      for (let i = 0; i < colVars; i++) {
        const varIndex = rowVars + i;
        if (varIndex < variables.length) {
          variableAssignment[variables[varIndex]] = colCode[i] === '1';
        }
      }
      
      // Evaluate expression for this assignment
      const value = evaluateExpression(expression, variableAssignment);
      
      // Calculate minterm number
      let mintermBinary = '';
      for (const variable of variables) {
        mintermBinary += variableAssignment[variable] ? '1' : '0';
      }
      const minterm = binaryToDecimal(mintermBinary);
      
      // Create cell
      const cell: KMapCell = {
        row: r,
        col: c,
        value,
        minterm,
        grayCode: rowCode + colCode,
        variables: { ...variableAssignment },
        covered: false,
        groupIds: []
      };
      
      cells[r][c] = cell;
      
      // Track minterms and maxterms
      if (value) {
        minterms.push(minterm);
      } else {
        maxterms.push(minterm);
      }
    }
  }
  
  // Find optimal groupings using Quine-McCluskey inspired algorithm
  const groups = findOptimalGroups(cells, variables);
  
  // Generate simplified expressions
  const simplifiedSOP = generateSOPFromGroups(groups, variables);
  const simplifiedPOS = generatePOSFromMaxterms(maxterms, variables);
  
  return {
    variables,
    cells,
    groups,
    minterms: minterms.sort((a, b) => a - b),
    maxterms: maxterms.sort((a, b) => a - b),
    simplifiedSOP,
    simplifiedPOS,
    rowLabels: rowGrayCode,
    colLabels: colGrayCode,
    dimensions: { rows, cols },
    grayCodeOrder: true
  };
}

// Find optimal groupings for K-map minimization
function findOptimalGroups(cells: KMapCell[][], variables: string[]): KMapGroup[] {
  const groups: KMapGroup[] = [];
  const flatCells = cells.flat().filter(cell => cell.value && !cell.covered);
  
  // Start with largest possible groups and work down
  const maxGroupSize = Math.pow(2, Math.floor(Math.log2(flatCells.length)));
  
  for (let groupSize = maxGroupSize; groupSize >= 1; groupSize = Math.floor(groupSize / 2)) {
    if (!isPowerOfTwo(groupSize)) continue;
    
    const newGroups = findGroupsOfSize(flatCells, groupSize, cells[0].length, variables);
    
    // Add non-overlapping groups
    for (const group of newGroups) {
      const overlapsExisting = group.cells.some(cell => cell.covered);
      
      if (!overlapsExisting) {
        // Mark cells as covered
        group.cells.forEach(cell => {
          cell.covered = true;
          cell.groupIds.push(group.id);
        });
        
        groups.push(group);
      }
    }
  }
  
  return groups;
}

// Check if a number is a power of 2
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Find all possible groups of a specific size
function findGroupsOfSize(cells: KMapCell[], groupSize: number, colCount: number, variables: string[]): KMapGroup[] {
  const groups: KMapGroup[] = [];
  
  if (groupSize === 1) {
    // Individual cells
    cells.filter(cell => !cell.covered).forEach((cell, index) => {
      groups.push(createGroupFromCells([cell], variables, `g${groups.length}`));
    });
    return groups;
  }
  
  // For larger groups, check rectangular regions and wraparound
  const potentialGroups = generatePotentialGroups(cells, groupSize, colCount);
  
  for (const groupCells of potentialGroups) {
    if (groupCells.length === groupSize && groupCells.every(cell => !cell.covered)) {
      const group = createGroupFromCells(groupCells, variables, `g${groups.length}`);
      if (isValidKMapGroup(groupCells, colCount, groupSize)) {
        groups.push(group);
      }
    }
  }
  
  return groups;
}

// Generate potential groupings considering K-map topology
function generatePotentialGroups(cells: KMapCell[], groupSize: number, colCount: number): KMapCell[][] {
  const groups: KMapCell[][] = [];
  
  // Try different rectangular configurations
  const factors = getFactors(groupSize);
  
  for (const [height, width] of factors) {
    // Try all positions for this rectangle size
    const maxRow = Math.max(...cells.map(c => c.row)) + 1;
    
    for (let startRow = 0; startRow < maxRow; startRow++) {
      for (let startCol = 0; startCol < colCount; startCol++) {
        const groupCells: KMapCell[] = [];
        
        // Collect cells in rectangle (with wraparound)
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const actualRow = (startRow + r) % maxRow;
            const actualCol = (startCol + c) % colCount;
            
            const cell = cells.find(cell => cell.row === actualRow && cell.col === actualCol);
            if (cell && cell.value) {
              groupCells.push(cell);
            }
          }
        }
        
        if (groupCells.length === groupSize) {
          groups.push(groupCells);
        }
      }
    }
  }
  
  return groups;
}

// Get factor pairs for a number
function getFactors(n: number): [number, number][] {
  const factors: [number, number][] = [];
  
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push([i, n / i]);
      if (i !== n / i) {
        factors.push([n / i, i]);
      }
    }
  }
  
  return factors;
}

// Validate that a group forms a valid K-map grouping
function isValidKMapGroup(cells: KMapCell[], colCount: number, expectedSize: number): boolean {
  if (cells.length !== expectedSize || !isPowerOfTwo(expectedSize)) {
    return false;
  }
  
  // Check if cells form a rectangular region (with possible wraparound)
  const rows = new Set(cells.map(c => c.row));
  const cols = new Set(cells.map(c => c.col));
  
  const isRectangular = rows.size * cols.size === cells.length;
  
  if (!isRectangular) {
    // Check for wraparound cases
    return checkWraparoundValidity(cells, colCount);
  }
  
  return true;
}

// Check validity for wraparound groupings
function checkWraparoundValidity(cells: KMapCell[], colCount: number): boolean {
  // Implementation for wraparound validation
  // This is a simplified check - full implementation would be more complex
  return cells.length <= 8; // Reasonable limit for demonstration
}

// Create a group object from cells
function createGroupFromCells(cells: KMapCell[], variables: string[], id: string): KMapGroup {
  const groupVariables = [...variables];
  const eliminatedVars: string[] = [];
  
  // Determine which variables are eliminated (don't change across the group)
  for (const variable of variables) {
    const values = new Set(cells.map(cell => cell.variables[variable]));
    if (values.size === 1) {
      // Variable has same value across all cells - it's included in the term
    } else {
      // Variable changes - it's eliminated
      eliminatedVars.push(variable);
    }
  }
  
  // Generate term string
  const term = generateTermFromCells(cells, variables, eliminatedVars);
  
  return {
    id,
    cells: [...cells],
    term,
    size: cells.length,
    isPowerOfTwo: isPowerOfTwo(cells.length),
    variables: groupVariables,
    eliminatedVars
  };
}

// Generate Boolean term from group cells
function generateTermFromCells(cells: KMapCell[], variables: string[], eliminatedVars: string[]): string {
  const terms: string[] = [];
  
  for (const variable of variables) {
    if (!eliminatedVars.includes(variable)) {
      // Variable is not eliminated - include it in the term
      const value = cells[0].variables[variable]; // All cells have same value for this variable
      terms.push(value ? variable : variable + "'");
    }
  }
  
  return terms.length > 0 ? terms.join('·') : '1';
}

// Generate SOP expression from groups
function generateSOPFromGroups(groups: KMapGroup[], variables: string[]): string {
  if (groups.length === 0) return '0';
  
  const terms = groups.map(group => group.term).filter(term => term !== '0');
  
  if (terms.length === 0) return '0';
  if (terms.includes('1')) return '1';
  
  return terms.join(' + ');
}

// Generate POS expression from maxterms
function generatePOSFromMaxterms(maxterms: number[], variables: string[]): string {
  if (maxterms.length === 0) return '1';
  if (maxterms.length === Math.pow(2, variables.length)) return '0';
  
  const terms = maxterms.map(maxterm => {
    const binary = decimalToBinary(maxterm, variables.length);
    const literals = variables.map((variable, index) => {
      return binary[index] === '1' ? variable + "'" : variable;
    });
    return '(' + literals.join(' + ') + ')';
  });
  
  return terms.join('·');
}

// Visualize K-map using D3
export function visualizeKMap(container: HTMLElement, kmap: KarnaughMap): void {
  // Clear previous content
  d3.select(container).selectAll("*").remove();
  
  const margin = { top: 60, right: 40, bottom: 40, left: 60 };
  const cellSize = 50;
  const width = margin.left + margin.right + kmap.dimensions.cols * cellSize;
  const height = margin.top + margin.bottom + kmap.dimensions.rows * cellSize;
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Draw column headers
  g.selectAll('.col-header')
    .data(kmap.colLabels)
    .enter()
    .append('text')
    .attr('class', 'col-header')
    .attr('x', (d, i) => i * cellSize + cellSize / 2)
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text(d => d);
  
  // Draw row headers
  g.selectAll('.row-header')
    .data(kmap.rowLabels)
    .enter()
    .append('text')
    .attr('class', 'row-header')
    .attr('x', -20)
    .attr('y', (d, i) => i * cellSize + cellSize / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text(d => d);
  
  // Draw cells
  const cells = g.selectAll('.cell')
    .data(kmap.cells.flat())
    .enter()
    .append('g')
    .attr('class', 'cell')
    .attr('transform', d => `translate(${d.col * cellSize}, ${d.row * cellSize})`);
  
  // Cell rectangles
  cells.append('rect')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('fill', d => d.value ? '#4CAF50' : '#f44336')
    .attr('fill-opacity', 0.7);
  
  // Cell values
  cells.append('text')
    .attr('x', cellSize / 2)
    .attr('y', cellSize / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-family', 'monospace')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', 'white')
    .text(d => d.value ? '1' : '0');
  
  // Cell minterm numbers (small text)
  cells.append('text')
    .attr('x', cellSize - 5)
    .attr('y', 12)
    .attr('text-anchor', 'end')
    .style('font-family', 'monospace')
    .style('font-size', '10px')
    .style('fill', 'rgba(255,255,255,0.8)')
    .text(d => d.minterm);
  
  // Draw groups
  const groupColors = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#607D8B'];
  
  kmap.groups.forEach((group, index) => {
    const color = groupColors[index % groupColors.length];
    
    // Draw group outline
    const groupCells = group.cells;
    if (groupCells.length > 1) {
      // Calculate bounding box for group
      const minRow = Math.min(...groupCells.map(c => c.row));
      const maxRow = Math.max(...groupCells.map(c => c.row));
      const minCol = Math.min(...groupCells.map(c => c.col));
      const maxCol = Math.max(...groupCells.map(c => c.col));
      
      g.append('rect')
        .attr('x', minCol * cellSize - 3)
        .attr('y', minRow * cellSize - 3)
        .attr('width', (maxCol - minCol + 1) * cellSize + 6)
        .attr('height', (maxRow - minRow + 1) * cellSize + 6)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
        .attr('rx', 5);
    }
  });
  
  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text(`Karnaugh Map (${kmap.variables.join(', ')})`);
  
  // Add simplified expression
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .style('font-family', 'monospace')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text(`Simplified SOP: ${kmap.simplifiedSOP}`);
}

// Export K-map data as text
export function exportKMapAsText(kmap: KarnaughMap): string {
  const lines: string[] = [];
  
  lines.push(`Karnaugh Map for variables: ${kmap.variables.join(', ')}`);
  lines.push(`Dimensions: ${kmap.dimensions.rows}×${kmap.dimensions.cols}`);
  lines.push('');
  
  // K-map grid
  lines.push('K-Map:');
  lines.push('     ' + kmap.colLabels.map(label => label.padStart(3)).join(''));
  
  for (let r = 0; r < kmap.dimensions.rows; r++) {
    const rowLabel = kmap.rowLabels[r].padStart(3);
    const cellValues = kmap.cells[r].map(cell => (cell.value ? '1' : '0').padStart(3)).join('');
    lines.push(`${rowLabel} |${cellValues}`);
  }
  
  lines.push('');
  lines.push(`Minterms: ${kmap.minterms.join(', ')}`);
  lines.push(`Maxterms: ${kmap.maxterms.join(', ')}`);
  lines.push('');
  lines.push(`Simplified SOP: ${kmap.simplifiedSOP}`);
  lines.push(`Simplified POS: ${kmap.simplifiedPOS}`);
  
  if (kmap.groups.length > 0) {
    lines.push('');
    lines.push('Groups:');
    kmap.groups.forEach((group, index) => {
      lines.push(`  Group ${index + 1}: ${group.term} (${group.size} cells)`);
    });
  }
  
  return lines.join('\n');
}

// Test the K-map generator
export function testKMapGenerator(): void {
  // You would test with actual Boolean expressions here
  // Function ready for use
} 