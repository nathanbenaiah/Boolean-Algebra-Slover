import { astToString } from './booleanParser.js';

/**
 * Logic Circuit Generator
 * Converts Boolean expressions to logic gate circuit representations
 */

export class LogicGate {
  constructor(id, type, x, y, inputs = [], output = '', label = '') {
    this.id = id;
    this.type = type; // 'AND', 'OR', 'NOT', 'INPUT', 'OUTPUT'
    this.x = x;
    this.y = y;
    this.inputs = inputs;
    this.output = output;
    this.label = label;
    this.width = this.getWidth();
    this.height = this.getHeight();
  }

  getWidth() {
    switch (this.type) {
      case 'INPUT':
      case 'OUTPUT':
        return 60;
      case 'NOT':
        return 40;
      case 'AND':
      case 'OR':
        return 60;
      default:
        return 50;
    }
  }

  getHeight() {
    return 30;
  }
}

export class LogicConnection {
  constructor(from, to, fromPin = 'output', toPin = 'input') {
    this.from = from;
    this.to = to;
    this.fromPin = fromPin;
    this.toPin = toPin;
    this.path = this.calculatePath();
  }

  calculatePath() {
    // Simple straight line for now - could be enhanced with routing
    return `M ${this.from.x} ${this.from.y} L ${this.to.x} ${this.to.y}`;
  }
}

export class LogicCircuit {
  constructor(expression, gates = [], connections = []) {
    this.expression = expression;
    this.gates = gates;
    this.connections = connections;
    this.bounds = this.calculateBounds();
    this.optimization = this.analyzeOptimization();
  }

  calculateBounds() {
    if (this.gates.length === 0) {
      return { width: 100, height: 100, minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    const minX = Math.min(...this.gates.map(g => g.x));
    const maxX = Math.max(...this.gates.map(g => g.x + g.width));
    const minY = Math.min(...this.gates.map(g => g.y));
    const maxY = Math.max(...this.gates.map(g => g.y + g.height));

    return {
      width: maxX - minX + 40,
      height: maxY - minY + 40,
      minX,
      minY,
      maxX,
      maxY
    };
  }

  analyzeOptimization() {
    const gateCount = this.gates.filter(g => ['AND', 'OR', 'NOT'].includes(g.type)).length;
    const inputCount = this.gates.filter(g => g.type === 'INPUT').length;
    const depth = this.calculateDepth();
    
    return {
      totalGates: gateCount,
      inputCount,
      depth,
      complexity: this.calculateComplexity(gateCount, inputCount, depth),
      suggestions: this.generateOptimizationSuggestions()
    };
  }

  calculateDepth() {
    // Calculate the maximum depth of the circuit
    const gateMap = new Map(this.gates.map(g => [g.id, g]));
    const visited = new Set();
    
    const getDepth = (gateId) => {
      if (visited.has(gateId)) return 0;
      visited.add(gateId);
      
      const gate = gateMap.get(gateId);
      if (!gate || gate.type === 'INPUT') return 0;
      
      const inputDepths = gate.inputs.map(inputId => getDepth(inputId));
      return Math.max(...inputDepths, 0) + 1;
    };

    const outputGate = this.gates.find(g => g.type === 'OUTPUT');
    return outputGate ? getDepth(outputGate.id) : 0;
  }

  calculateComplexity(gateCount, inputCount, depth) {
    if (gateCount <= 3 && inputCount <= 2) return 'Low';
    if (gateCount <= 8 && inputCount <= 4 && depth <= 3) return 'Medium';
    return 'High';
  }

  generateOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.optimization.totalGates > 10) {
      suggestions.push('Consider simplifying the Boolean expression to reduce gate count');
    }
    
    if (this.optimization.depth > 5) {
      suggestions.push('Circuit has high depth - consider parallel optimization');
    }
    
    // Check for common optimization patterns
    const notGates = this.gates.filter(g => g.type === 'NOT').length;
    if (notGates > this.optimization.inputCount) {
      suggestions.push('High number of NOT gates - consider applying De Morgan\'s laws');
    }

    return suggestions;
  }

  toSVG() {
    const { width, height, minX, minY } = this.bounds;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="${minX-20} ${minY-20} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add styles
    svg += `
      <defs>
        <style>
          .gate { fill: white; stroke: black; stroke-width: 2; }
          .gate-text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; }
          .connection { stroke: black; stroke-width: 2; fill: none; }
          .input-gate { fill: lightblue; }
          .output-gate { fill: lightgreen; }
          .and-gate { fill: lightyellow; }
          .or-gate { fill: lightcoral; }
          .not-gate { fill: lightpink; }
        </style>
      </defs>
    `;
    
    // Draw connections first (so they appear behind gates)
    this.connections.forEach(conn => {
      svg += `<path d="${conn.path}" class="connection"/>`;
    });
    
    // Draw gates
    this.gates.forEach(gate => {
      svg += this.renderGate(gate);
    });
    
    svg += '</svg>';
    return svg;
  }

  renderGate(gate) {
    const className = `gate ${gate.type.toLowerCase()}-gate`;
    let gateShape = '';
    
    switch (gate.type) {
      case 'INPUT':
        gateShape = `<rect x="${gate.x}" y="${gate.y}" width="${gate.width}" height="${gate.height}" class="${className}"/>`;
        break;
      case 'OUTPUT':
        gateShape = `<rect x="${gate.x}" y="${gate.y}" width="${gate.width}" height="${gate.height}" class="${className}"/>`;
        break;
      case 'AND':
        gateShape = this.renderAndGate(gate);
        break;
      case 'OR':
        gateShape = this.renderOrGate(gate);
        break;
      case 'NOT':
        gateShape = this.renderNotGate(gate);
        break;
      default:
        gateShape = `<rect x="${gate.x}" y="${gate.y}" width="${gate.width}" height="${gate.height}" class="${className}"/>`;
    }
    
    const textX = gate.x + gate.width / 2;
    const textY = gate.y + gate.height / 2 + 4;
    const label = gate.label || gate.type;
    
    return gateShape + `<text x="${textX}" y="${textY}" class="gate-text">${label}</text>`;
  }

  renderAndGate(gate) {
    // Draw AND gate shape
    const x = gate.x;
    const y = gate.y;
    const w = gate.width;
    const h = gate.height;
    
    return `<path d="M ${x} ${y} L ${x + w/2} ${y} A ${w/2} ${h/2} 0 0 1 ${x + w/2} ${y + h} L ${x} ${y + h} Z" class="gate and-gate"/>`;
  }

  renderOrGate(gate) {
    // Draw OR gate shape
    const x = gate.x;
    const y = gate.y;
    const w = gate.width;
    const h = gate.height;
    
    return `<path d="M ${x} ${y} Q ${x + w/3} ${y + h/2} ${x} ${y + h} Q ${x + w/2} ${y + h/2} ${x + w} ${y + h/2} Q ${x + w/2} ${y + h/2} ${x} ${y} Z" class="gate or-gate"/>`;
  }

  renderNotGate(gate) {
    // Draw NOT gate (triangle with circle)
    const x = gate.x;
    const y = gate.y;
    const w = gate.width;
    const h = gate.height;
    
    const triangle = `<path d="M ${x} ${y} L ${x} ${y + h} L ${x + w - 5} ${y + h/2} Z" class="gate not-gate"/>`;
    const circle = `<circle cx="${x + w - 3}" cy="${y + h/2}" r="3" class="gate not-gate"/>`;
    
    return triangle + circle;
  }

  toJSON() {
    return {
      expression: this.expression,
      gates: this.gates,
      connections: this.connections,
      bounds: this.bounds,
      optimization: this.optimization,
      svg: this.toSVG()
    };
  }
}

/**
 * Generate logic circuit from parsed Boolean expression
 */
export async function generateLogicCircuit(parsedExpr, options = {}) {
  try {
    const {
      layout = 'horizontal',
      spacing = { x: 100, y: 60 },
      optimize = true
    } = options;

    const gates = [];
    const connections = [];
    let gateCounter = 0;
    let currentX = 50;
    let currentY = 50;

    const getNextGateId = () => `gate_${gateCounter++}`;
    
    // Create input gates for each variable
    const inputGates = new Map();
    parsedExpr.variables.forEach((variable, index) => {
      const gateId = getNextGateId();
      const gate = new LogicGate(
        gateId,
        'INPUT',
        currentX,
        currentY + index * spacing.y,
        [],
        variable,
        variable
      );
      gates.push(gate);
      inputGates.set(variable, gateId);
    });

    currentX += spacing.x;

    // Build circuit recursively from AST
    const outputGateId = await buildCircuitFromAST(
      parsedExpr.ast,
      gates,
      connections,
      inputGates,
      { currentX, currentY, spacing, getNextGateId }
    );

    // Add output gate
    const outputGate = new LogicGate(
      'output',
      'OUTPUT',
      currentX + spacing.x,
      currentY + Math.floor(parsedExpr.variables.length / 2) * spacing.y,
      [outputGateId],
      'Y',
      'Y'
    );
    gates.push(outputGate);

    // Add connection from last gate to output
    if (outputGateId) {
      const lastGate = gates.find(g => g.id === outputGateId);
      connections.push(new LogicConnection(
        { x: lastGate.x + lastGate.width, y: lastGate.y + lastGate.height/2 },
        { x: outputGate.x, y: outputGate.y + outputGate.height/2 }
      ));
    }

    // Generate connections between gates
    generateConnections(gates, connections);

    // Optimize layout if requested
    if (optimize) {
      optimizeLayout(gates, connections, spacing);
    }

    const circuit = new LogicCircuit(parsedExpr.originalExpression, gates, connections);
    return circuit.toJSON();

  } catch (error) {
    throw new Error(`Logic circuit generation failed: ${error.message}`);
  }
}

/**
 * Build circuit from AST recursively
 */
async function buildCircuitFromAST(ast, gates, connections, inputGates, context) {
  const { currentX, currentY, spacing, getNextGateId } = context;

  if (!ast) return null;

  switch (ast.type) {
    case 'VARIABLE':
      return inputGates.get(ast.name);

    case 'CONSTANT':
      // Create a constant gate
      const constGateId = getNextGateId();
      const constGate = new LogicGate(
        constGateId,
        'INPUT',
        context.currentX,
        context.currentY,
        [],
        ast.value ? '1' : '0',
        ast.value ? '1' : '0'
      );
      gates.push(constGate);
      context.currentY += spacing.y;
      return constGateId;

    case 'NOT':
      const operandGateId = await buildCircuitFromAST(
        ast.operand,
        gates,
        connections,
        inputGates,
        context
      );
      
      const notGateId = getNextGateId();
      const notGate = new LogicGate(
        notGateId,
        'NOT',
        context.currentX,
        context.currentY,
        [operandGateId],
        notGateId + '_out',
        'NOT'
      );
      gates.push(notGate);
      context.currentY += spacing.y;
      context.currentX += spacing.x;
      return notGateId;

    case 'AND':
      const leftAndId = await buildCircuitFromAST(
        ast.left,
        gates,
        connections,
        inputGates,
        context
      );
      const rightAndId = await buildCircuitFromAST(
        ast.right,
        gates,
        connections,
        inputGates,
        context
      );
      
      const andGateId = getNextGateId();
      const andGate = new LogicGate(
        andGateId,
        'AND',
        context.currentX,
        context.currentY,
        [leftAndId, rightAndId],
        andGateId + '_out',
        'AND'
      );
      gates.push(andGate);
      context.currentY += spacing.y;
      context.currentX += spacing.x;
      return andGateId;

    case 'OR':
      const leftOrId = await buildCircuitFromAST(
        ast.left,
        gates,
        connections,
        inputGates,
        context
      );
      const rightOrId = await buildCircuitFromAST(
        ast.right,
        gates,
        connections,
        inputGates,
        context
      );
      
      const orGateId = getNextGateId();
      const orGate = new LogicGate(
        orGateId,
        'OR',
        context.currentX,
        context.currentY,
        [leftOrId, rightOrId],
        orGateId + '_out',
        'OR'
      );
      gates.push(orGate);
      context.currentY += spacing.y;
      context.currentX += spacing.x;
      return orGateId;

    default:
      return null;
  }
}

/**
 * Generate connections between gates
 */
function generateConnections(gates, connections) {
  const gateMap = new Map(gates.map(g => [g.id, g]));
  
  gates.forEach(gate => {
    gate.inputs.forEach((inputId, inputIndex) => {
      const inputGate = gateMap.get(inputId);
      if (inputGate) {
        const fromX = inputGate.x + inputGate.width;
        const fromY = inputGate.y + inputGate.height / 2;
        const toX = gate.x;
        const toY = gate.y + (inputIndex + 1) * (gate.height / (gate.inputs.length + 1));
        
        connections.push(new LogicConnection(
          { x: fromX, y: fromY },
          { x: toX, y: toY }
        ));
      }
    });
  });
}

/**
 * Optimize circuit layout
 */
function optimizeLayout(gates, connections, spacing) {
  // Simple optimization: arrange gates in levels
  const levels = new Map();
  const gateMap = new Map(gates.map(g => [g.id, g]));
  
  // Calculate level for each gate
  const calculateLevel = (gateId, visited = new Set()) => {
    if (visited.has(gateId)) return 0;
    visited.add(gateId);
    
    const gate = gateMap.get(gateId);
    if (!gate || gate.type === 'INPUT') return 0;
    
    const inputLevels = gate.inputs.map(inputId => calculateLevel(inputId, visited));
    return Math.max(...inputLevels, 0) + 1;
  };
  
  gates.forEach(gate => {
    const level = calculateLevel(gate.id);
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level).push(gate);
  });
  
  // Arrange gates by level
  let currentX = 50;
  Array.from(levels.keys()).sort().forEach(level => {
    const levelGates = levels.get(level);
    let currentY = 50;
    
    levelGates.forEach(gate => {
      gate.x = currentX;
      gate.y = currentY;
      currentY += spacing.y;
    });
    
    currentX += spacing.x;
  });
  
  // Regenerate connections with new positions
  connections.length = 0;
  generateConnections(gates, connections);
}

/**
 * Generate Verilog HDL code from circuit
 */
export function generateVerilog(circuit) {
  const inputs = circuit.gates.filter(g => g.type === 'INPUT').map(g => g.label);
  const output = circuit.gates.find(g => g.type === 'OUTPUT')?.label || 'Y';
  
  let verilog = `module boolean_circuit(\n`;
  verilog += `  input ${inputs.join(', ')},\n`;
  verilog += `  output ${output}\n`;
  verilog += `);\n\n`;
  
  // Add wire declarations
  const wires = new Set();
  circuit.gates.forEach(gate => {
    if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
      wires.add(gate.output);
    }
  });
  
  if (wires.size > 0) {
    verilog += `  wire ${Array.from(wires).join(', ')};\n\n`;
  }
  
  // Add gate instantiations
  circuit.gates.forEach(gate => {
    switch (gate.type) {
      case 'AND':
        verilog += `  and ${gate.id}(${gate.output}, ${gate.inputs.join(', ')});\n`;
        break;
      case 'OR':
        verilog += `  or ${gate.id}(${gate.output}, ${gate.inputs.join(', ')});\n`;
        break;
      case 'NOT':
        verilog += `  not ${gate.id}(${gate.output}, ${gate.inputs[0]});\n`;
        break;
    }
  });
  
  verilog += `\nendmodule`;
  return verilog;
}

/**
 * Generate VHDL code from circuit
 */
export function generateVHDL(circuit) {
  const inputs = circuit.gates.filter(g => g.type === 'INPUT').map(g => g.label);
  const output = circuit.gates.find(g => g.type === 'OUTPUT')?.label || 'Y';
  
  let vhdl = `library IEEE;\nuse IEEE.STD_LOGIC_1164.ALL;\n\n`;
  vhdl += `entity boolean_circuit is\n`;
  vhdl += `  Port (\n`;
  inputs.forEach(input => {
    vhdl += `    ${input} : in STD_LOGIC;\n`;
  });
  vhdl += `    ${output} : out STD_LOGIC\n`;
  vhdl += `  );\n`;
  vhdl += `end boolean_circuit;\n\n`;
  vhdl += `architecture Behavioral of boolean_circuit is\n`;
  
  // Add signal declarations
  const signals = new Set();
  circuit.gates.forEach(gate => {
    if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
      signals.add(gate.output);
    }
  });
  
  if (signals.size > 0) {
    vhdl += `  signal ${Array.from(signals).join(', ')} : STD_LOGIC;\n`;
  }
  
  vhdl += `begin\n\n`;
  
  // Add gate assignments
  circuit.gates.forEach(gate => {
    switch (gate.type) {
      case 'AND':
        vhdl += `  ${gate.output} <= ${gate.inputs.join(' AND ')};\n`;
        break;
      case 'OR':
        vhdl += `  ${gate.output} <= ${gate.inputs.join(' OR ')};\n`;
        break;
      case 'NOT':
        vhdl += `  ${gate.output} <= NOT ${gate.inputs[0]};\n`;
        break;
    }
  });
  
  vhdl += `\nend Behavioral;`;
  return vhdl;
}

export default {
  generateLogicCircuit,
  generateVerilog,
  generateVHDL,
  LogicCircuit,
  LogicGate,
  LogicConnection
}; 