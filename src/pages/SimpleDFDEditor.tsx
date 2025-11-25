import React, { useState, useCallback } from 'react';
import { Database, Users, Cpu, Download, Upload, RotateCcw, MousePointer, ArrowRight, Trash2, Menu, X } from 'lucide-react';

type NodeType = 'outside-source' | 'action-box' | 'storage-box' | 'input' | 'output';

interface DFDNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

interface DFDConnection {
  id: string;
  from: string;
  to: string;
  label: string;
}

const NODE_CONFIGS = {
  'outside-source': { icon: Users, color: '#8b5cf6', label: 'Outside Source' },
  'action-box': { icon: Cpu, color: '#10b981', label: 'Action Box' },
  'storage-box': { icon: Database, color: '#f59e0b', label: 'Storage Box' },
  'input': { icon: ArrowRight, color: '#3b82f6', label: 'Input' },
  'output': { icon: ArrowRight, color: '#ef4444', label: 'Output' }
};

const SimpleDFDEditor: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<NodeType | 'select' | 'connect'>('select');
  const [nodes, setNodes] = useState<DFDNode[]>([]);
  const [connections, setConnections] = useState<DFDConnection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'select' || selectedTool === 'connect') {
      setSelectedNode(null);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newNode: DFDNode = {
      id: `node-${Date.now()}`,
      type: selectedTool,
      label: `New ${NODE_CONFIGS[selectedTool]?.label || selectedTool}`,
      x: x - 50,
      y: y - 30,
      width: 100,
      height: 60,
      color: NODE_CONFIGS[selectedTool]?.color || '#3b82f6'
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedTool('select');
  }, [selectedTool]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (selectedTool === 'connect') {
      if (!connectingFrom) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        const newConnection: DFDConnection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: nodeId,
          label: 'Data Flow'
        };
        setConnections(prev => [...prev, newConnection]);
        setConnectingFrom(null);
      }
      return;
    }
    
    setSelectedNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    }
  }, [selectedTool, connectingFrom, nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (selectedNode && dragOffset && selectedTool === 'select') {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setNodes(prev => prev.map(node => 
        node.id === selectedNode 
          ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
          : node
      ));
    }
  }, [selectedNode, dragOffset, selectedTool]);

  const handleMouseUp = useCallback(() => {
    setDragOffset(null);
  }, []);

  const getConnectionPath = useCallback((conn: DFDConnection) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (!fromNode || !toNode) return '';
    
    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y + toNode.height / 2;
    
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }, [nodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setConnectingFrom(null);
  }, []);

  const exportDiagram = useCallback(() => {
    const data = { nodes, connections, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dfd-diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections]);

  const importDiagram = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">DFD Editor</h1>
                <p className="text-sm sm:text-base text-gray-600">Create diagrams with simplified elements</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-b border-gray-200 p-4`}>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => {setSelectedTool('select'); setIsMobileMenuOpen(false);}}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm ${
                  selectedTool === 'select' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <MousePointer size={16} />
                <span>Select</span>
              </button>
              
              <button
                onClick={() => {setSelectedTool('connect'); setIsMobileMenuOpen(false);}}
                className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm ${
                  selectedTool === 'connect' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <ArrowRight size={16} />
                <span>Connect</span>
              </button>

              {Object.entries(NODE_CONFIGS).map(([type, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => {setSelectedTool(type as NodeType); setIsMobileMenuOpen(false);}}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-sm ${
                      selectedTool === type ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span className="truncate">{config.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSelectedNode(null)} className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              <button onClick={clearCanvas} className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">
                <RotateCcw size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Desktop Toolbar */}
          <div className="hidden md:block border-b border-gray-200 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedTool('select')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  selectedTool === 'select' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <MousePointer size={20} />
                <span>Select</span>
              </button>
              
              <button
                onClick={() => setSelectedTool('connect')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  selectedTool === 'connect' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <ArrowRight size={20} />
                <span>Connect</span>
              </button>

              <div className="w-px h-8 bg-gray-300 mx-2"></div>

              {Object.entries(NODE_CONFIGS).map(([type, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTool(type as NodeType)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                      selectedTool === type ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={clearCanvas} className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700">
                <RotateCcw size={16} />
                <span>Clear</span>
              </button>
              <button onClick={exportDiagram} className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700">
                <Download size={16} />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 cursor-pointer">
                <Upload size={16} />
                <span>Import</span>
                <input type="file" accept=".json" onChange={importDiagram} className="hidden" />
              </label>
            </div>
          </div>

          {/* Canvas */}
          <div className="p-2 sm:p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <svg
                width="100%"
                height="400"
                viewBox="0 0 800 400"
                className="bg-white cursor-crosshair min-h-[300px] sm:min-h-[400px]"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Connections */}
                {connections.map((conn) => {
                  const path = getConnectionPath(conn);
                  if (!path) return null;

                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const midX = (fromNode.x + fromNode.width / 2 + toNode.x + toNode.width / 2) / 2;
                  const midY = (fromNode.y + fromNode.height / 2 + toNode.y + toNode.height / 2) / 2;

                  return (
                    <g key={conn.id}>
                      <path d={path} stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                      <rect
                        x={midX - conn.label.length * 3}
                        y={midY - 10}
                        width={conn.label.length * 6}
                        height={20}
                        fill="white"
                        stroke="#d1d5db"
                        rx="3"
                        className="cursor-pointer"
                      />
                      <text x={midX} y={midY + 4} textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">
                        {conn.label}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  const IconComponent = NODE_CONFIGS[node.type]?.icon || Database;
                  
                  return (
                    <g key={node.id}>
                      <rect
                        x={node.x}
                        y={node.y}
                        width={node.width}
                        height={node.height}
                        fill={node.color || NODE_CONFIGS[node.type]?.color || '#3b82f6'}
                        stroke={isSelected ? '#4f46e5' : '#d1d5db'}
                        strokeWidth={isSelected ? 3 : 1}
                        rx="8"
                        className="cursor-move hover:stroke-blue-400"
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      />
                      
                      <foreignObject x={node.x + 8} y={node.y + 8} width="24" height="24" className="pointer-events-none">
                        <IconComponent size={20} className="text-white" />
                      </foreignObject>
                      
                      <text x={node.x + node.width / 2} y={node.y + node.height / 2 + 4} textAnchor="middle" className="text-sm font-medium fill-white pointer-events-none">
                        {node.label}
                      </text>
                    </g>
                  );
                })}

                {nodes.length === 0 && (
                  <g>
                    <text x="50%" y="45%" textAnchor="middle" className="text-lg font-medium fill-gray-400">
                      Click the buttons above to add diagram elements
                    </text>
                    <text x="50%" y="55%" textAnchor="middle" className="text-sm fill-gray-400">
                      Use simplified names: Outside Source, Action Box, Storage Box, Input, Output
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDFDEditor;
