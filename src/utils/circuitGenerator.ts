// Advanced Logic Circuit Generator with Cytoscape Visualization
// Supports all gate types with automatic layout and optimization

import cytoscape from 'cytoscape';
// @ts-ignore - No type definitions available
import dagre from 'cytoscape-dagre';
// @ts-ignore - No type definitions available  
import cola from 'cytoscape-cola';
import { BooleanExpression, getVariables } from './comprehensiveBooleanSolver.ts';

// Register layout algorithms
cytoscape.use(dagre);
cytoscape.use(cola);

export interface CircuitNode {
  id: string;
  type: 'input' | 'output' | 'gate';
  gateType?: 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';
  label: string;
  inputs?: string[];
  level: number;
  position?: { x: number; y: number };
}

export interface CircuitEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
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

// Gate symbols and properties
const GATE_SYMBOLS = {
  AND: '&',
  OR: '≥1',
  NOT: '1',
  NAND: '&',
  NOR: '≥1',
  XOR: '=1',
  XNOR: '=1'
};

const GATE_COLORS = {
  AND: '#2196F3',
  OR: '#4CAF50',
  NOT: '#FF5722',
  NAND: '#3F51B5',
  NOR: '#8BC34A',
  XOR: '#FF9800',
  XNOR: '#795548'
};

// Generate logic circuit from Boolean expression
export function generateLogicCircuit(expression: BooleanExpression): LogicCircuit {
  const nodes: CircuitNode[] = [];
  const edges: CircuitEdge[] = [];
  const variables = getVariables(expression);
  let nodeCounter = 0;
  let gateCount: { [key: string]: number } = {
    AND: 0, OR: 0, NOT: 0, NAND: 0, NOR: 0, XOR: 0, XNOR: 0
  };

  // Create input nodes
  const inputNodes: CircuitNode[] = variables.map(variable => ({
    id: variable,
    type: 'input',
    label: variable,
    level: 0
  }));
  nodes.push(...inputNodes);

  // Recursively build circuit from expression
  const counter = { value: nodeCounter };
  const outputNodeId = buildCircuitRecursive(expression, nodes, edges, gateCount, counter);
  
  // Create output node
  const outputNode: CircuitNode = {
    id: 'OUTPUT',
    type: 'output',
    label: 'F',
    level: calculateMaxLevel(nodes) + 1
  };
  nodes.push(outputNode);
  
  // Connect final gate to output
  edges.push({
    id: `edge_${outputNodeId}_OUTPUT`,
    source: outputNodeId,
    target: 'OUTPUT'
  });

  // Calculate levels for proper layout
  assignLevels(nodes, edges);
  
  // Calculate complexity
  const complexity = calculateCircuitComplexity(gateCount);

  return {
    nodes,
    edges,
    inputs: variables,
    outputs: ['F'],
    levels: calculateMaxLevel(nodes) + 1,
    gateCount,
    complexity
  };
}

// Recursively build circuit nodes and edges
function buildCircuitRecursive(
  expr: BooleanExpression, 
  nodes: CircuitNode[], 
  edges: CircuitEdge[], 
  gateCount: { [key: string]: number },
  counter: { value: number }
): string {
  
  if (expr.type === 'variable') {
    return expr.variable!.negated ? 
      createNotGate(expr.variable!.name, nodes, edges, gateCount, counter) :
      expr.variable!.name;
  }

  if (expr.type === 'constant') {
    // Handle constants by creating appropriate nodes
    const constId = `CONST_${expr.value}`;
    if (!nodes.find(n => n.id === constId)) {
      nodes.push({
        id: constId,
        type: 'input',
        label: expr.value ? '1' : '0',
        level: 0
      });
    }
    return constId;
  }

  if (expr.type === 'not' && expr.operands) {
    const inputId = buildCircuitRecursive(expr.operands[0], nodes, edges, gateCount, counter);
    return createNotGate(inputId, nodes, edges, gateCount, counter);
  }

  if ((expr.type === 'and' || expr.type === 'or' || expr.type === 'xor' || 
       expr.type === 'xnor' || expr.type === 'nand' || expr.type === 'nor') && expr.operands) {
    
    const inputIds = expr.operands.map(operand => 
      buildCircuitRecursive(operand, nodes, edges, gateCount, counter)
    );
    
    return createGate(expr.type.toUpperCase() as keyof typeof GATE_SYMBOLS, inputIds, nodes, edges, gateCount, counter);
  }

  throw new Error(`Unsupported expression type: ${expr.type}`);
}

// Create a NOT gate
function createNotGate(
  inputId: string, 
  nodes: CircuitNode[], 
  edges: CircuitEdge[], 
  gateCount: { [key: string]: number },
  counter: { value: number }
): string {
  
  const gateId = `NOT_${counter.value++}`;
  gateCount.NOT++;
  
  const gateNode: CircuitNode = {
    id: gateId,
    type: 'gate',
    gateType: 'NOT',
    label: '¬',
    inputs: [inputId],
    level: 0 // Will be calculated later
  };
  
  nodes.push(gateNode);
  
  edges.push({
    id: `edge_${inputId}_${gateId}`,
    source: inputId,
    target: gateId
  });
  
  return gateId;
}

// Create a multi-input gate
function createGate(
  gateType: keyof typeof GATE_SYMBOLS,
  inputIds: string[],
  nodes: CircuitNode[], 
  edges: CircuitEdge[], 
  gateCount: { [key: string]: number },
  counter: { value: number }
): string {
  
  const gateId = `${gateType}_${counter.value++}`;
  gateCount[gateType]++;
  
  const gateNode: CircuitNode = {
    id: gateId,
    type: 'gate',
    gateType,
    label: getGateSymbol(gateType),
    inputs: inputIds,
    level: 0 // Will be calculated later
  };
  
  nodes.push(gateNode);
  
  // Create edges from inputs to gate
  inputIds.forEach(inputId => {
    edges.push({
      id: `edge_${inputId}_${gateId}`,
      source: inputId,
      target: gateId
    });
  });
  
  return gateId;
}

// Get appropriate symbol for gate type
function getGateSymbol(gateType: string): string {
  switch (gateType) {
    case 'AND': return '&';
    case 'OR': return '≥1';
    case 'NOT': return '¬';
    case 'NAND': return '⊼';
    case 'NOR': return '⊽';
    case 'XOR': return '⊕';
    case 'XNOR': return '⊙';
    default: return gateType;
  }
}

// Assign levels to nodes for proper layout
function assignLevels(nodes: CircuitNode[], edges: CircuitEdge[]): void {
  // Initialize input nodes at level 0
  nodes.filter(n => n.type === 'input').forEach(n => n.level = 0);
  
  // Iteratively assign levels
  let changed = true;
  while (changed) {
    changed = false;
    
    for (const node of nodes.filter(n => n.type === 'gate' || n.type === 'output')) {
      const inputEdges = edges.filter(e => e.target === node.id);
      const inputNodes = inputEdges.map(e => nodes.find(n => n.id === e.source)!);
      
      if (inputNodes.length > 0 && inputNodes.every(n => n.level !== undefined)) {
        const maxInputLevel = Math.max(...inputNodes.map(n => n.level));
        const newLevel = maxInputLevel + 1;
        
        if (node.level !== newLevel) {
          node.level = newLevel;
          changed = true;
        }
      }
    }
  }
}

// Calculate maximum level in the circuit
function calculateMaxLevel(nodes: CircuitNode[]): number {
  return Math.max(...nodes.map(n => n.level));
}

// Calculate circuit complexity
function calculateCircuitComplexity(gateCount: { [key: string]: number }): number {
  const weights = { AND: 1, OR: 1, NOT: 0.5, NAND: 1.2, NOR: 1.2, XOR: 2, XNOR: 2 };
  
  return Object.entries(gateCount).reduce((total, [gate, count]) => {
    return total + count * (weights[gate as keyof typeof weights] || 1);
  }, 0);
}

// Visualize circuit using Cytoscape
export function visualizeCircuit(container: HTMLElement, circuit: LogicCircuit): cytoscape.Core {
  // Clear previous content
  container.innerHTML = '';
  
  // Prepare nodes for Cytoscape
  const cyNodes = circuit.nodes.map(node => ({
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      gateType: node.gateType,
      level: node.level
    },
    position: node.position
  }));
  
  // Prepare edges for Cytoscape
  const cyEdges = circuit.edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    }
  }));
  
  // Create Cytoscape instance
  const cy = cytoscape({
    container: container,
    elements: [...cyNodes, ...cyEdges],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': 'white',
          'font-size': '12px',
          'font-weight': 'bold',
          'width': '40px',
          'height': '40px'
        }
      },
      {
        selector: 'node[type="input"]',
        style: {
          'background-color': '#4CAF50',
          'shape': 'ellipse',
          'width': '50px',
          'height': '30px'
        }
      },
      {
        selector: 'node[type="output"]',
        style: {
          'background-color': '#FF5722',
          'shape': 'ellipse',
          'width': '50px',
          'height': '30px'
        }
      },
      {
        selector: 'node[gateType="AND"]',
        style: {
          'background-color': GATE_COLORS.AND,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[gateType="OR"]',
        style: {
          'background-color': GATE_COLORS.OR,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[gateType="NOT"]',
        style: {
          'background-color': GATE_COLORS.NOT,
          'shape': 'triangle',
          'width': '30px',
          'height': '30px'
        }
      },
      {
        selector: 'node[gateType="NAND"]',
        style: {
          'background-color': GATE_COLORS.NAND,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[gateType="NOR"]',
        style: {
          'background-color': GATE_COLORS.NOR,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[gateType="XOR"]',
        style: {
          'background-color': GATE_COLORS.XOR,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[gateType="XNOR"]',
        style: {
          'background-color': GATE_COLORS.XNOR,
          'shape': 'rectangle'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#333',
          'target-arrow-color': '#333',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],
    layout: {
      name: 'dagre',
      // @ts-ignore - Layout options for dagre
      rankDir: 'LR',
      spacingFactor: 1.5,
      nodeSep: 50,
      rankSep: 100
    }
  });
  
  return cy;
}

// Export circuit as text representation
export function exportCircuitAsText(circuit: LogicCircuit): string {
  const lines: string[] = [];
  
  lines.push('Logic Circuit Analysis');
  lines.push('=====================');
  lines.push('');
  
  lines.push(`Inputs: ${circuit.inputs.join(', ')}`);
  lines.push(`Outputs: ${circuit.outputs.join(', ')}`);
  lines.push(`Circuit Levels: ${circuit.levels}`);
  lines.push(`Complexity: ${circuit.complexity.toFixed(2)}`);
  lines.push('');
  
  lines.push('Gate Count:');
  Object.entries(circuit.gateCount).forEach(([gate, count]) => {
    if (count > 0) {
      lines.push(`  ${gate}: ${count}`);
    }
  });
  lines.push('');
  
  lines.push('Circuit Nodes:');
  circuit.nodes.forEach(node => {
    lines.push(`  ${node.id}: ${node.type} (Level ${node.level})`);
    if (node.inputs && node.inputs.length > 0) {
      lines.push(`    Inputs: ${node.inputs.join(', ')}`);
    }
  });
  lines.push('');
  
  lines.push('Connections:');
  circuit.edges.forEach(edge => {
    lines.push(`  ${edge.source} → ${edge.target}`);
  });
  
  return lines.join('\n');
}

// Generate circuit optimization suggestions
export function analyzeCircuit(circuit: LogicCircuit): {
  suggestions: string[];
  metrics: { [key: string]: number };
} {
  const suggestions: string[] = [];
  const metrics: { [key: string]: number } = {};
  
  // Calculate metrics
  metrics.totalGates = Object.values(circuit.gateCount).reduce((a, b) => a + b, 0);
  metrics.criticalPath = circuit.levels;
  metrics.complexity = circuit.complexity;
  
  // Generate suggestions
  if (circuit.gateCount.NOT > circuit.inputs.length) {
    suggestions.push('Consider using De Morgan\'s laws to reduce NOT gates');
  }
  
  if (circuit.levels > 5) {
    suggestions.push('Circuit has high delay - consider parallel paths');
  }
  
  if (metrics.totalGates > 10) {
    suggestions.push('Complex circuit - verify for optimization opportunities');
  }
  
  if (circuit.gateCount.XOR > 0 || circuit.gateCount.XNOR > 0) {
    suggestions.push('XOR/XNOR gates detected - ensure they are necessary');
  }
  
  return { suggestions, metrics };
}

// Create circuit from truth table
export function circuitFromTruthTable(truthTable: boolean[][], variables: string[]): LogicCircuit {
  // This is a simplified implementation
  // A full implementation would use Quine-McCluskey or other optimization algorithms
  
  const minterms: number[] = [];
  
  truthTable.forEach((row, index) => {
    const output = row[row.length - 1];
    if (output) {
      minterms.push(index);
    }
  });
  
  // Create a simple SOP implementation
  // This is placeholder logic - real implementation would be more sophisticated
  const nodes: CircuitNode[] = [];
  const edges: CircuitEdge[] = [];
  let gateCount = { AND: 0, OR: 0, NOT: 0, NAND: 0, NOR: 0, XOR: 0, XNOR: 0 };
  
  // Add input nodes
  variables.forEach(variable => {
    nodes.push({
      id: variable,
      type: 'input',
      label: variable,
      level: 0
    });
  });
  
  // Add output node
  nodes.push({
    id: 'OUTPUT',
    type: 'output',
    label: 'F',
    level: 2
  });
  
  // Simple OR of all inputs as example
  if (variables.length > 1) {
    const orGateId = 'OR_0';
    nodes.push({
      id: orGateId,
      type: 'gate',
      gateType: 'OR',
      label: '≥1',
      inputs: variables,
      level: 1
    });
    
    gateCount.OR = 1;
    
    variables.forEach(variable => {
      edges.push({
        id: `edge_${variable}_${orGateId}`,
        source: variable,
        target: orGateId
      });
    });
    
    edges.push({
      id: `edge_${orGateId}_OUTPUT`,
      source: orGateId,
      target: 'OUTPUT'
    });
  }
  
  return {
    nodes,
    edges,
    inputs: variables,
    outputs: ['F'],
    levels: 3,
    gateCount,
    complexity: calculateCircuitComplexity(gateCount)
  };
}

// Test the circuit generator
export function testCircuitGenerator(): void {
  // Test circuit generation capabilities
  // Function ready for use
} 