import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Database, Users, Cpu, Download, Upload, RotateCcw, MousePointer, Info,
  Copy, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Grid3X3, Move
} from 'lucide-react';

type NodeType = 'external-entity' | 'process' | 'data-store';
type DFDLevel = '0' | '1' | '2';

interface DFDNode {
  id: string; type: NodeType; label: string; description?: string;
  x: number; y: number; width: number; height: number; color?: string;
}

interface DFDConnection {
  id: string; from: string; to: string; label: string; color?: string;
}

interface HistoryState { nodes: DFDNode[]; connections: DFDConnection[]; }

const NODE_CONFIGS = {
  'external-entity': { icon: Users, color: '#8b5cf6', label: 'External Entity' },
  'process': { icon: Cpu, color: '#10b981', label: 'Process' },
  'data-store': { icon: Database, color: '#f59e0b', label: 'Data Store' }
};

const LEVEL_DESCRIPTIONS = {
  '0': 'Context Diagram - Overall system view',
  '1': 'Data Flow Diagram - Major processes', 
  '2': 'Detailed DFD - Process breakdown'
};

const DEFAULT_NODE_SIZE = { width: 120, height: 60 };

const DataFlowDiagramPage: React.FC = () => {
  const [dfdLevel, setDfdLevel] = useState<DFDLevel>('0');
  const [selectedTool, setSelectedTool] = useState<NodeType | 'select' | 'connect'>('select');
  const [nodes, setNodes] = useState<DFDNode[]>([]);
  const [connections, setConnections] = useState<DFDConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<DFDNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections))
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    else setHistoryIndex(prev => prev + 1);
    setHistory(newHistory);
  }, [nodes, connections, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const copyNode = useCallback(() => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) setClipboard(node);
    }
  }, [selectedNode, nodes]);

  const pasteNode = useCallback(() => {
    if (clipboard) {
      const newNode: DFDNode = {
        ...clipboard, id: `node-${Date.now()}`, x: clipboard.x + 20, y: clipboard.y + 20
      };
      setNodes(prev => [...prev, newNode]);
      saveToHistory();
    }
  }, [clipboard, saveToHistory]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'select') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (selectedTool !== 'connect') {
      const newNode: DFDNode = {
        id: `node-${Date.now()}`, type: selectedTool, label: NODE_CONFIGS[selectedTool].label,
        x: x - DEFAULT_NODE_SIZE.width / 2, y: y - DEFAULT_NODE_SIZE.height / 2,
        width: DEFAULT_NODE_SIZE.width, height: DEFAULT_NODE_SIZE.height,
        color: NODE_CONFIGS[selectedTool].color
      };
      setNodes(prev => [...prev, newNode]);
      saveToHistory();
      setSelectedTool('select');
    }
  }, [selectedTool, pan, zoom, saveToHistory]);

  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (selectedTool === 'connect') {
      if (connectingFrom === null) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        const newConnection: DFDConnection = {
          id: `conn-${Date.now()}`, from: connectingFrom, to: nodeId,
          label: 'data flow', color: '#6b7280'
        };
        setConnections(prev => [...prev, newConnection]);
        setConnectingFrom(null);
        saveToHistory();
      }
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
    }
  }, [selectedTool, connectingFrom, saveToHistory]);

  const clearCanvas = useCallback(() => {
    setNodes([]); setConnections([]); setSelectedNode(null);
    setSelectedConnection(null); setConnectingFrom(null); saveToHistory();
  }, [saveToHistory]);

  const exportDiagram = useCallback(() => {
    const data = { level: dfdLevel, nodes, connections, metadata: { created: new Date().toISOString(), version: '1.0' } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dfd-level-${dfdLevel}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [dfdLevel, nodes, connections]);

  const importDiagram = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.connections) {
          setNodes(data.nodes); setConnections(data.connections);
          if (data.level) setDfdLevel(data.level); saveToHistory();
        }
      } catch (error) { alert('Invalid file format'); }
    };
    reader.readAsText(file);
  }, [saveToHistory]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, nodeId: string, handle: 'se' | 'sw' | 'ne' | 'nw') => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setResizingNode(nodeId);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: node.width,
      height: node.height
    });
  }, [nodes]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (resizingNode && resizeStart && resizeHandle) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeHandle.includes('e')) newWidth = Math.max(80, resizeStart.width + deltaX / zoom);
      if (resizeHandle.includes('w')) newWidth = Math.max(80, resizeStart.width - deltaX / zoom);
      if (resizeHandle.includes('s')) newHeight = Math.max(40, resizeStart.height + deltaY / zoom);
      if (resizeHandle.includes('n')) newHeight = Math.max(40, resizeStart.height - deltaY / zoom);
      
      setNodes(prev => prev.map(node => 
        node.id === resizingNode 
          ? { ...node, width: newWidth, height: newHeight }
          : node
      ));
    }
  }, [resizingNode, resizeStart, resizeHandle, zoom]);

  // Handle mouse up for resizing
  const handleMouseUp = useCallback(() => {
    if (resizingNode) {
      setResizingNode(null);
      setResizeHandle(null);
      setResizeStart(null);
      saveToHistory();
    }
  }, [resizingNode, saveToHistory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Data Flow Diagram Editor</h1>
            <p className="text-blue-100">Create professional DFD diagrams with multiple levels</p>
          </div>

          <div className="bg-gray-100 p-4 border-b">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">DFD Level Selection:</span>
              {(['0', '1', '2'] as DFDLevel[]).map(level => (
                <button key={level} onClick={() => setDfdLevel(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dfdLevel === level ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}>
                  Level {level}
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-4">{LEVEL_DESCRIPTIONS[dfdLevel]}</span>
            </div>
          </div>

          <div className="bg-white p-4 border-b flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Available Actions:</span>
              <button onClick={clearCanvas} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">Clear</button>
              <label className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer">
                Import <input type="file" accept=".json" onChange={importDiagram} className="hidden" />
              </label>
              <button onClick={exportDiagram} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">Export</button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Element Types:</span>
              {(Object.keys(NODE_CONFIGS) as NodeType[]).map(nodeType => {
                const config = NODE_CONFIGS[nodeType];
                const IconComponent = config.icon;
                return (
                  <button key={nodeType} onClick={() => setSelectedTool(nodeType)}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                      selectedTool === nodeType ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}>
                    <IconComponent size={16} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Basic Functions:</span>
              <button onClick={() => setSelectedTool('select')}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                  selectedTool === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                <MousePointer size={16} /> <span>Select</span>
              </button>
              <button onClick={() => setSelectedTool('connect')}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                  selectedTool === 'connect' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                <Move size={16} /> <span>Connect</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Canvas Controls:</span>
              <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                <ZoomIn size={16} />
              </button>
              <span className="text-xs px-2">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                <ZoomOut size={16} />
              </button>
              <button onClick={() => setShowGrid(!showGrid)}
                className={`p-1 rounded ${showGrid ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={undo} disabled={historyIndex <= 0} className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                <Undo2 size={16} />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">
                <Redo2 size={16} />
              </button>
            </div>
          </div>

          <div className="relative bg-white overflow-hidden" style={{ height: '600px' }}>
            <svg ref={svgRef} width="100%" height="100%" className="cursor-crosshair" onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              {showGrid && (
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
              )}
              {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>

                {connections.map(connection => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  if (!fromNode || !toNode) return null;
                  
                  const path = `M ${fromNode.x + fromNode.width/2} ${fromNode.y + fromNode.height/2} L ${toNode.x + toNode.width/2} ${toNode.y + toNode.height/2}`;
                  const isSelected = selectedConnection === connection.id;
                  
                  return (
                    <g key={connection.id}>
                      <path d={path} stroke={isSelected ? '#3b82f6' : connection.color} strokeWidth={isSelected ? 3 : 2}
                        fill="none" markerEnd="url(#arrowhead)" className="cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setSelectedConnection(connection.id); setSelectedNode(null); }} />
                      <text x={(fromNode.x + toNode.x)/2 + 60} y={(fromNode.y + toNode.y)/2 + 30}
                        textAnchor="middle" className="text-xs fill-gray-600 cursor-pointer">
                        {connection.label}
                      </text>
                    </g>
                  );
                })}

                {nodes.map(node => {
                  const isSelected = selectedNode === node.id;
                  const isConnecting = connectingFrom === node.id;
                  const config = NODE_CONFIGS[node.type];
                  const IconComponent = config.icon;

                  return (
                    <g key={node.id}>
                      <rect x={node.x} y={node.y} width={node.width} height={node.height}
                        fill={isConnecting ? '#fbbf24' : (node.color || config.color)}
                        stroke={isSelected ? '#3b82f6' : '#6b7280'} strokeWidth={isSelected ? 3 : 1}
                        rx={node.type === 'external-entity' ? 0 : 8} className="cursor-pointer"
                        onClick={(e) => handleNodeClick(e, node.id)} />

                      {node.type === 'external-entity' && (
                        <rect x={node.x + 5} y={node.y + 5} width={node.width - 10} height={node.height - 10}
                          fill="none" stroke={isSelected ? '#3b82f6' : '#6b7280'} strokeWidth={isSelected ? 2 : 1} />
                      )}

                      {node.type === 'data-store' && (
                        <>
                          <line x1={node.x} y1={node.y + 10} x2={node.x + node.width} y2={node.y + 10}
                            stroke={isSelected ? '#3b82f6' : '#6b7280'} strokeWidth={isSelected ? 2 : 1} />
                          <line x1={node.x} y1={node.y + node.height - 10} x2={node.x + node.width} y2={node.y + node.height - 10}
                            stroke={isSelected ? '#3b82f6' : '#6b7280'} strokeWidth={isSelected ? 2 : 1} />
                        </>
                      )}

                      <foreignObject x={node.x + 5} y={node.y + 5} width="20" height="20">
                        <IconComponent size={16} className="text-white" />
                      </foreignObject>

                      <text x={node.x + node.width/2} y={node.y + node.height/2 + 4} textAnchor="middle"
                        className="text-sm font-medium fill-white cursor-pointer select-none">
                        {node.label}
                      </text>

                      {/* Resize handles for selected elements */}
                      {isSelected && (
                        <>
                          {/* Southeast handle */}
                          <rect
                            x={node.x + node.width - 4}
                            y={node.y + node.height - 4}
                            width="8"
                            height="8"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="1"
                            className="cursor-se-resize"
                            onMouseDown={(e) => handleResizeStart(e, node.id, 'se')}
                          />
                          {/* Southwest handle */}
                          <rect
                            x={node.x - 4}
                            y={node.y + node.height - 4}
                            width="8"
                            height="8"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="1"
                            className="cursor-sw-resize"
                            onMouseDown={(e) => handleResizeStart(e, node.id, 'sw')}
                          />
                          {/* Northeast handle */}
                          <rect
                            x={node.x + node.width - 4}
                            y={node.y - 4}
                            width="8"
                            height="8"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="1"
                            className="cursor-ne-resize"
                            onMouseDown={(e) => handleResizeStart(e, node.id, 'ne')}
                          />
                          {/* Northwest handle */}
                          <rect
                            x={node.x - 4}
                            y={node.y - 4}
                            width="8"
                            height="8"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="1"
                            className="cursor-nw-resize"
                            onMouseDown={(e) => handleResizeStart(e, node.id, 'nw')}
                          />
                        </>
                      )}
                    </g>
                  );
                })}

                {nodes.length === 0 && (
                  <g>
                    <text x="50%" y="45%" textAnchor="middle" className="text-lg font-medium fill-gray-400">
                      Click element types above to add DFD components
                    </text>
                    <text x="50%" y="55%" textAnchor="middle" className="text-sm fill-gray-400">
                      Select an element type, then click on the canvas
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 m-4">
            <div className="flex items-start space-x-3">
              <Info className="text-blue-600 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use the DFD Editor</h3>
                
                {/* Element Customization */}
                <div className="mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">📝 Renaming Elements:</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800 mb-3">
                    <div>
                      <strong>External Entity:</strong><br/>
                      "Customer", "Supplier", "Bank", "Government Agency"
                    </div>
                    <div>
                      <strong>Process:</strong><br/>
                      "Process Order", "Validate Payment", "Generate Report"
                    </div>
                    <div>
                      <strong>Data Store:</strong><br/>
                      "Customer Database", "Order History", "Product Catalog"
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">💡 <strong>To rename:</strong> Click on any element text to edit it directly</p>
                </div>

                {/* Resizing Elements */}
                <div className="mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">📏 Resizing Elements (Width & Height):</h4>
                  <p className="text-sm text-blue-700 mb-2">💡 <strong>To resize:</strong> Select an element, then drag the blue corner handles to adjust width and height</p>
                  <div className="text-xs text-blue-600">
                    • <strong>Corner handles:</strong> Drag to resize both width and height<br/>
                    • <strong>Minimum size:</strong> 80px width, 40px height<br/>
                    • <strong>Visual feedback:</strong> Blue handles appear on selected elements
                  </div>
                </div>

                {/* Quick Instructions */}
                <div className="bg-blue-100 rounded p-3 text-sm text-blue-800">
                  <h4 className="font-medium mb-2">🚀 Quick Start Guide:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <strong>Adding Elements:</strong><br/>
                      1. Click element type button<br/>
                      2. Click on canvas to place<br/>
                      3. Click text to rename
                    </div>
                    <div>
                      <strong>Connecting Elements:</strong><br/>
                      1. Click "Connect" tool<br/>
                      2. Click first element<br/>
                      3. Click second element
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <strong>Keyboard Shortcuts:</strong> Ctrl+Z (Undo) • Ctrl+Y (Redo) • Delete (Remove) • Ctrl+C (Copy) • Ctrl+V (Paste)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowDiagramPage;
