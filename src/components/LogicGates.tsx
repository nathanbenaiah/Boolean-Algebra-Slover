import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background,
  ConnectionLineType,
  NodeTypes,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap } from 'lucide-react';
import { parseExpression as parseBooleanExpression } from '../utils/booleanAlgebra';

interface ParsedExpression {
  type: 'variable' | 'not' | 'and' | 'or' | 'constant' | 'nand' | 'nor' | 'xor' | 'xnor';
  value?: string | boolean;
  children?: ParsedExpression[];
}

interface LogicGatesProps {
  parsedExpression: ParsedExpression | null;
  expression: string;
  logicCircuit: unknown;
}

interface NodeData {
  label: string;
}

// Enhanced Custom Node Components with Professional Gate Designs
const VariableNode = ({ data }: { data: NodeData }) => (
  <div className="relative">
    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 rounded-lg text-blue-800 font-bold text-lg min-w-[50px] text-center shadow-lg hover:shadow-xl transition-shadow">
      <div>{data.label}</div>
    </div>
    <Handle 
      type="source" 
      position={Position.Right} 
      className="w-3 h-3 bg-blue-600 border-2 border-white rounded-full shadow-sm" 
      style={{ right: '-6px' }}
    />
  </div>
);

const NotGateNode = ({ data }: { data: NodeData }) => (
  <div className="relative">
    <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow">
      <svg width="90" height="60" viewBox="0 0 90 60">
        {/* NOT gate triangle */}
        <polygon 
          points="15,15 15,45 55,30" 
          fill="#fef2f2" 
          stroke="#dc2626" 
          strokeWidth="2.5"
          className="drop-shadow-sm"
        />
        {/* Inversion bubble */}
        <circle 
          cx="60" 
          cy="30" 
          r="5" 
          fill="#fef2f2" 
          stroke="#dc2626" 
          strokeWidth="2.5"
          className="drop-shadow-sm"
        />
        {/* Input line */}
        <line x1="5" y1="30" x2="15" y2="30" stroke="#dc2626" strokeWidth="2"/>
        {/* Output line */}
        <line x1="65" y1="30" x2="80" y2="30" stroke="#dc2626" strokeWidth="2"/>
      </svg>
    </div>
    <Handle 
      type="target" 
      position={Position.Left} 
      className="w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-sm" 
      style={{ left: '-6px' }}
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      className="w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-sm" 
      style={{ right: '-6px' }}
    />
  </div>
);

const AndGateNode = ({ data }: { data: NodeData }) => (
  <div className="relative">
    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-500 rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow">
      <svg width="100" height="70" viewBox="0 0 100 70">
        {/* AND gate shape - more accurate IEEE standard */}
        <path 
          d="M 15 15 L 15 55 L 45 55 Q 75 55 75 35 Q 75 15 45 15 Z" 
          fill="#faf5ff" 
          stroke="#7c3aed" 
          strokeWidth="2.5"
          className="drop-shadow-sm"
        />
        {/* Input lines */}
        <line x1="5" y1="25" x2="15" y2="25" stroke="#7c3aed" strokeWidth="2"/>
        <line x1="5" y1="45" x2="15" y2="45" stroke="#7c3aed" strokeWidth="2"/>
        {/* Output line */}
        <line x1="75" y1="35" x2="90" y2="35" stroke="#7c3aed" strokeWidth="2"/>
        {/* Gate label */}
        <text x="45" y="38" textAnchor="middle" className="text-xs font-bold fill-purple-700">&</text>
      </svg>
    </div>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ top: '30%', left: '-6px' }} 
      className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm" 
    />
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ top: '70%', left: '-6px' }} 
      className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm" 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm" 
      style={{ right: '-6px' }}
    />
  </div>
);

const OrGateNode = ({ data }: { data: NodeData }) => (
  <div className="relative">
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-500 rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow">
      <svg width="100" height="70" viewBox="0 0 100 70">
        {/* OR gate shape - more accurate IEEE standard */}
        <path 
          d="M 15 15 Q 25 35 15 55 Q 50 55 75 35 Q 50 15 15 15" 
          fill="#fff7ed" 
          stroke="#ea580c" 
          strokeWidth="2.5"
          className="drop-shadow-sm"
        />
        {/* Input arc */}
        <path 
          d="M 15 15 Q 25 35 15 55" 
          fill="none" 
          stroke="#ea580c" 
          strokeWidth="2.5"
        />
        {/* Input lines */}
        <line x1="5" y1="25" x2="18" y2="25" stroke="#ea580c" strokeWidth="2"/>
        <line x1="5" y1="45" x2="18" y2="45" stroke="#ea580c" strokeWidth="2"/>
        {/* Output line */}
        <line x1="75" y1="35" x2="90" y2="35" stroke="#ea580c" strokeWidth="2"/>
        {/* Gate label */}
        <text x="45" y="38" textAnchor="middle" className="text-xs font-bold fill-orange-700">≥1</text>
      </svg>
    </div>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ top: '30%', left: '-6px' }} 
      className="w-3 h-3 bg-orange-600 border-2 border-white rounded-full shadow-sm" 
    />
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ top: '70%', left: '-6px' }} 
      className="w-3 h-3 bg-orange-600 border-2 border-white rounded-full shadow-sm" 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      className="w-3 h-3 bg-orange-600 border-2 border-white rounded-full shadow-sm" 
      style={{ right: '-6px' }}
    />
  </div>
);

const OutputNode = ({ data }: { data: NodeData }) => (
  <div className="relative">
    <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg text-green-800 font-bold text-lg min-w-[50px] text-center shadow-lg hover:shadow-xl transition-shadow">
      <div>{data.label}</div>
    </div>
    <Handle 
      type="target" 
      position={Position.Left} 
      className="w-3 h-3 bg-green-600 border-2 border-white rounded-full shadow-sm" 
      style={{ left: '-6px' }}
    />
  </div>
);

const nodeTypes: NodeTypes = {
  variable: VariableNode,
  not: NotGateNode,
  and: AndGateNode,
  or: OrGateNode,
  output: OutputNode,
};

const LogicGates: React.FC<LogicGatesProps> = ({ parsedExpression, expression }) => {
  
  if (!expression.trim()) {
    return (
      <div className="text-center py-12">
        <Zap className="mx-auto text-blue-400 mb-4" size={48} />
        <p className="text-blue-500">Enter a Boolean expression to see logic gate diagram</p>
      </div>
    );
  }

  const { nodes, edges } = useMemo(() => {
    // Use provided parsedExpression or parse the expression string as fallback
    let exprToUse: ParsedExpression | null = parsedExpression;
    
    if (!exprToUse && expression.trim()) {
      try {
        exprToUse = parseBooleanExpression(expression);
      } catch (error) {
        console.error('Failed to parse expression for logic circuit:', error);
        return { nodes: [], edges: [] };
      }
    }
    
    if (!exprToUse) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeIdCounter = 0;

    // Extract unique variables
    const variables = new Set<string>();
    const extractVariables = (expr: ParsedExpression) => {
      if (expr.type === 'variable') {
        variables.add(expr.value as string);
      } else if (expr.children) {
        expr.children.forEach(extractVariables);
      }
    };
    extractVariables(exprToUse);

    // Create variable nodes with better spacing
    const varArray = Array.from(variables).sort();
    const variableNodes: { [key: string]: string } = {};
    varArray.forEach((variable, index) => {
      const id = `var-${variable}`;
      variableNodes[variable] = id;
      nodes.push({
        id,
        type: 'variable',
        position: { x: 80, y: 120 + index * 100 },
        data: { label: variable },
      });
    });

    // Build logic circuit with enhanced spacing and positioning
    const buildCircuit = (expr: ParsedExpression, level: number = 0): string => {
      if (!expr) return '';
      const currentId = `node-${nodeIdCounter++}`;
      const baseX = 150 + level * 250; // Increased spacing between levels
      
      switch (expr.type) {
        case 'variable':
          return variableNodes[expr.value as string];
          
        case 'not':
          if (expr.children && expr.children.length > 0) {
            const inputId = buildCircuit(expr.children[0], level + 1);
            const yPos = 200 + (nodeIdCounter % 3) * 120; // Better vertical distribution
            nodes.push({
              id: currentId,
              type: 'not',
              position: { x: baseX, y: yPos },
              data: { label: 'NOT' },
            });
            edges.push({
              id: `edge-${inputId}-${currentId}`,
              source: inputId,
              target: currentId,
              type: 'smoothstep',
              style: { stroke: '#dc2626', strokeWidth: 2 },
              animated: false,
            });
            return currentId;
          }
          break;
          
        case 'and':
          if (expr.children && expr.children.length >= 2) {
            const inputIds = expr.children.map((child) => {
              return buildCircuit(child, level + 1);
            });
            const yPos = 200 + (nodeIdCounter % 4) * 100; // Improved spacing
            nodes.push({
              id: currentId,
              type: 'and',
              position: { x: baseX, y: yPos },
              data: { label: 'AND' },
            });
            inputIds.forEach((inputId) => {
              edges.push({
                id: `edge-${inputId}-${currentId}`,
                source: inputId,
                target: currentId,
                type: 'smoothstep',
                style: { stroke: '#7c3aed', strokeWidth: 2 },
                animated: false,
              });
            });
            return currentId;
          }
          break;
          
        case 'or':
          if (expr.children && expr.children.length >= 2) {
            const inputIds = expr.children.map((child) => {
              return buildCircuit(child, level + 1);
            });
            const yPos = 200 + (nodeIdCounter % 4) * 100; // Improved spacing
            nodes.push({
              id: currentId,
              type: 'or',
              position: { x: baseX, y: yPos },
              data: { label: 'OR' },
            });
            inputIds.forEach((inputId) => {
              edges.push({
                id: `edge-${inputId}-${currentId}`,
                source: inputId,
                target: currentId,
                type: 'smoothstep',
                style: { stroke: '#ea580c', strokeWidth: 2 },
                animated: false,
              });
            });
            return currentId;
          }
          break;
          
        case 'constant':
          const yPos = 200 + (nodeIdCounter % 3) * 120;
          nodes.push({
            id: currentId,
            type: 'variable',
            position: { x: baseX, y: yPos },
            data: { label: expr.value ? '1' : '0' },
          });
          return currentId;
      }
      
      return currentId;
    };

    const outputGateId = buildCircuit(exprToUse);
    
    // Add output node with optimal positioning
    const outputId = 'output';
    const maxX = Math.max(...nodes.map(n => n.position.x));
    const avgY = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length : 300;
    nodes.push({
      id: outputId,
      type: 'output',
      position: { x: maxX + 250, y: avgY },
      data: { label: 'Y' },
    });
    
    edges.push({
      id: `edge-${outputGateId}-${outputId}`,
      source: outputGateId,
      target: outputId,
      type: 'smoothstep',
      style: { stroke: '#16a34a', strokeWidth: 3 },
      animated: false,
    });

    return { nodes, edges };
  }, [parsedExpression, expression]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-800 mb-6">Logic Gate Diagram</h3>
      
      <div className="mb-4">
        <p className="text-sm text-blue-600">
          Expression: <span className="font-mono font-semibold bg-blue-100 px-2 py-1 rounded">{expression}</span>
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-blue-300 p-4 shadow-inner" style={{ height: '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2 },
            animated: false,
          }}
        >
          <Background 
            color="#e2e8f0" 
            gap={20} 
            size={1}
            variant="dots"
          />
          <Controls 
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            position="top-right"
          />
        </ReactFlow>
      </div>


    </div>
  );
};

export default LogicGates;