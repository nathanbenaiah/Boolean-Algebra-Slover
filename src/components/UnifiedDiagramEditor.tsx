import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Database, Users, Cpu, Download, Upload, RotateCcw, MousePointer, 
  Info, Copy, Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Grid3X3, Move,
  Settings, X, ChevronRight, ChevronLeft, Save, FileText, GitBranch
} from 'lucide-react';
import type { 
  DiagramMode, DFDNode, DFDConnection, EREntity, ERRelationship, 
  ERAttribute, SidePanelMode, CanvasState, HistoryState, AttributeType, DataType 
} from '../types/diagram';
import { generateRelationshipLine, getRelationshipTypeLabel } from '../utils/crowsFootNotation';
import EntityNode from './diagram/EntityNode';
import RelationshipLine from './diagram/RelationshipLine';
import SidePanel from './diagram/SidePanel';

const UnifiedDiagramEditor: React.FC = () => {
  // Mode and diagram state
  const [mode, setMode] = useState<DiagramMode>('dfd');
  const [dfdNodes, setDfdNodes] = useState<DFDNode[]>([]);
  const [dfdConnections, setDfdConnections] = useState<DFDConnection[]>([]);
  const [erEntities, setErEntities] = useState<EREntity[]>([]);
  const [erRelationships, setErRelationships] = useState<ERRelationship[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationGeneralization[]>([]);
  
  // Canvas state
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [canvasState, setCanvasState] = useState<CanvasState>({
    selectedNodeId: null,
    selectedConnectionId: null,
    connectingFrom: null,
    dragOffset: null,
    isDragging: false,
    resizingNodeId: null,
    resizeHandle: null,
    showGrid: true,
    snapToGrid: false
  });
  
  // Side panel state
  const [sidePanel, setSidePanel] = useState<{ isOpen: boolean; mode: SidePanelMode; selectedId: string | null }>({
    isOpen: false,
    mode: null,
    selectedId: null
  });
  
  // Viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // History state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Save to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      nodes: mode === 'dfd' ? [...dfdNodes] : [...erEntities],
      connections: mode === 'dfd' ? [...dfdConnections] : [...erRelationships],
      timestamp: Date.now()
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    else setHistoryIndex(prev => prev + 1);
    setHistory(newHistory);
  }, [mode, dfdNodes, dfdConnections, erEntities, erRelationships, history, historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      if (mode === 'dfd') {
        setDfdNodes(prevState.nodes as DFDNode[]);
        setDfdConnections(prevState.connections as DFDConnection[]);
      } else {
        setErEntities(prevState.nodes as EREntity[]);
        setErRelationships(prevState.connections as ERRelationship[]);
      }
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, mode]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (mode === 'dfd') {
        setDfdNodes(nextState.nodes as DFDNode[]);
        setDfdConnections(nextState.connections as DFDConnection[]);
      } else {
        setErEntities(nextState.nodes as EREntity[]);
        setErRelationships(nextState.connections as ERRelationship[]);
      }
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, mode]);

  // Handle node click
  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (selectedTool === 'connect') {
      if (!canvasState.connectingFrom) {
        setCanvasState(prev => ({ ...prev, connectingFrom: nodeId }));
      } else if (canvasState.connectingFrom !== nodeId) {
        if (mode === 'dfd') {
          const newConnection: DFDConnection = {
            id: `conn-${Date.now()}`,
            from: canvasState.connectingFrom,
            to: nodeId,
            label: 'data flow',
            color: '#6b7280'
          };
          setDfdConnections(prev => [...prev, newConnection]);
        } else {
          const newRelationship: ERRelationship = {
            id: `rel-${Date.now()}`,
            name: 'Relationship',
            type: 'one-to-many',
            fromEntity: canvasState.connectingFrom,
            toEntity: nodeId,
            fromCardinality: '1',
            toCardinality: 'many',
            fromOptionality: 'mandatory',
            toOptionality: 'optional',
            isIdentifying: false
          };
          setErRelationships(prev => [...prev, newRelationship]);
        }
        setCanvasState(prev => ({ ...prev, connectingFrom: null }));
        saveToHistory();
      }
    } else {
      setCanvasState(prev => ({ ...prev, selectedNodeId: nodeId, selectedConnectionId: null }));
      // Open side panel
      if (mode === 'dfd') {
        const node = dfdNodes.find(n => n.id === nodeId);
        if (node) {
          setSidePanel({
            isOpen: true,
            mode: node.type === 'process' ? 'process' : node.type === 'data-store' ? 'data-store' : 'external-entity',
            selectedId: nodeId
          });
        }
      } else {
        setSidePanel({
          isOpen: true,
          mode: 'entity',
          selectedId: nodeId
        });
      }
    }
  }, [selectedTool, canvasState.connectingFrom, mode, dfdNodes, saveToHistory]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'select' || selectedTool === 'connect') {
      setCanvasState(prev => ({ ...prev, selectedNodeId: null }));
      setSidePanel(prev => ({ ...prev, isOpen: false, mode: null, selectedId: null }));
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (mode === 'dfd') {
      // DFD node creation
      const nodeTypes: Record<string, { type: DFDNode['type']; color: string }> = {
        'external-entity': { type: 'external-entity', color: '#8b5cf6' },
        'process': { type: 'process', color: '#10b981' },
        'data-store': { type: 'data-store', color: '#f59e0b' }
      };

      const config = nodeTypes[selectedTool];
      if (config) {
        const newNode: DFDNode = {
          id: `node-${Date.now()}`,
          type: config.type,
          label: `New ${config.type}`,
          x: x - 60,
          y: y - 30,
          width: 120,
          height: 60,
          color: config.color
        };
        setDfdNodes(prev => [...prev, newNode]);
        saveToHistory();
        setSelectedTool('select');
      }
    } else if (mode === 'er' || mode === 'err') {
      // ER/ERR entity creation
      if (selectedTool === 'entity') {
        const newEntity: EREntity = {
          id: `entity-${Date.now()}`,
          name: 'New Entity',
          x: x - 80,
          y: y - 40,
          width: 160,
          height: 80,
          attributes: [],
          primaryKeys: [],
          isWeak: false,
          color: '#3b82f6'
        };
        setErEntities(prev => [...prev, newEntity]);
        saveToHistory();
        setSelectedTool('select');
      }
    }
  }, [selectedTool, mode, pan, zoom, saveToHistory]);

  // Export diagram
  const exportDiagram = useCallback(() => {
    const data = {
      mode,
      dfd: mode === 'dfd' ? { nodes: dfdNodes, connections: dfdConnections } : undefined,
      er: (mode === 'er' || mode === 'err') ? { entities: erEntities, relationships: erRelationships } : undefined,
      metadata: { created: new Date().toISOString(), version: '1.0' }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mode, dfdNodes, dfdConnections, erEntities, erRelationships]);

  // Import diagram
  const importDiagram = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.mode) setMode(data.mode);
        if (data.dfd) {
          setDfdNodes(data.dfd.nodes || []);
          setDfdConnections(data.dfd.connections || []);
        }
        if (data.er) {
          setErEntities(data.er.entities || []);
          setErRelationships(data.er.relationships || []);
        }
        saveToHistory();
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [saveToHistory]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (mode === 'dfd') {
      setDfdNodes([]);
      setDfdConnections([]);
    } else {
      setErEntities([]);
      setErRelationships([]);
    }
    setCanvasState(prev => ({ ...prev, selectedNodeId: null, selectedConnectionId: null }));
    saveToHistory();
  }, [mode, saveToHistory]);

  // Get DFD node config
  const getDFDNodeConfig = (type: DFDNode['type']) => {
    const configs = {
      'external-entity': { icon: Users, color: '#8b5cf6', label: 'External Entity' },
      'process': { icon: Cpu, color: '#10b981', label: 'Process' },
      'data-store': { icon: Database, color: '#f59e0b', label: 'Data Store' }
    };
    return configs[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            {/* Mode Switcher */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Diagram Type:</span>
              {(['dfd', 'er', 'err'] as DiagramMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setSelectedTool('select');
                    setCanvasState(prev => ({ ...prev, selectedNodeId: null }));
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mode === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tool Selection */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTool('select')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  selectedTool === 'select'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <MousePointer size={18} />
                <span>Select</span>
              </button>

              {mode === 'dfd' && (
                <>
                  <button
                    onClick={() => setSelectedTool('external-entity')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      selectedTool === 'external-entity'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Users size={18} />
                    <span>External Entity</span>
                  </button>
                  <button
                    onClick={() => setSelectedTool('process')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      selectedTool === 'process'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Cpu size={18} />
                    <span>Process</span>
                  </button>
                  <button
                    onClick={() => setSelectedTool('data-store')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      selectedTool === 'data-store'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Database size={18} />
                    <span>Data Store</span>
                  </button>
                </>
              )}

              {(mode === 'er' || mode === 'err') && (
                <>
                  <button
                    onClick={() => setSelectedTool('entity')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                      selectedTool === 'entity'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Database size={18} />
                    <span>Entity</span>
                  </button>
                  {mode === 'err' && (
                    <button
                      onClick={() => setSelectedTool('weak-entity')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                        selectedTool === 'weak-entity'
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <Database size={18} />
                      <span>Weak Entity</span>
                    </button>
                  )}
                  {mode === 'err' && (
                    <button
                      onClick={() => setSelectedTool('specialization')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                        selectedTool === 'specialization'
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <GitBranch size={18} />
                      <span>Specialization</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setSelectedTool('connect')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  selectedTool === 'connect'
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Move size={18} />
                <span>Connect</span>
              </button>

              <div className="w-px h-8 bg-gray-300 mx-2"></div>

              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                <Redo2 size={18} />
              </button>

              <div className="w-px h-8 bg-gray-300 mx-2"></div>

              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                <ZoomIn size={18} />
              </button>
              <span className="px-2 text-sm text-gray-700">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                className={`px-3 py-2 rounded-lg border ${
                  canvasState.showGrid
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Grid3X3 size={18} />
              </button>

              <div className="w-px h-8 bg-gray-300 mx-2"></div>

              <button
                onClick={clearCanvas}
                className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={exportDiagram}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                <Download size={18} />
              </button>
              <label className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 cursor-pointer">
                <Upload size={18} />
                <input type="file" accept=".json" onChange={importDiagram} className="hidden" />
              </label>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative bg-white overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className="cursor-crosshair"
              onClick={handleCanvasClick}
            >
              {/* Grid */}
              {canvasState.showGrid && (
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  </pattern>
                </defs>
              )}
              {canvasState.showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* DFD Mode Rendering */}
                {mode === 'dfd' && (
                  <>
                    {/* DFD Connections */}
                    {dfdConnections.map((conn) => {
                      const fromNode = dfdNodes.find(n => n.id === conn.from);
                      const toNode = dfdNodes.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;

                      const fromX = fromNode.x + fromNode.width / 2;
                      const fromY = fromNode.y + fromNode.height / 2;
                      const toX = toNode.x + toNode.width / 2;
                      const toY = toNode.y + toNode.height / 2;

                      return (
                        <g key={conn.id}>
                          <path
                            d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                            stroke="#6b7280"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                          />
                          <text
                            x={(fromX + toX) / 2}
                            y={(fromY + toY) / 2 - 5}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                          >
                            {conn.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* DFD Nodes */}
                    {dfdNodes.map((node) => {
                      const isSelected = canvasState.selectedNodeId === node.id;
                      const config = getDFDNodeConfig(node.type);
                      const IconComponent = config.icon;

                      return (
                        <g key={node.id}>
                          {/* External Entity: Double rectangle */}
                          {node.type === 'external-entity' && (
                            <>
                              <rect
                                x={node.x}
                                y={node.y}
                                width={node.width}
                                height={node.height}
                                fill={node.color || config.color}
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 3 : 1}
                                rx="0"
                              />
                              <rect
                                x={node.x + 5}
                                y={node.y + 5}
                                width={node.width - 10}
                                height={node.height - 10}
                                fill="none"
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 2 : 1}
                              />
                            </>
                          )}

                          {/* Process: Rounded rectangle with process number */}
                          {node.type === 'process' && (
                            <>
                              <rect
                                x={node.x}
                                y={node.y}
                                width={node.width}
                                height={node.height}
                                fill={node.color || config.color}
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 3 : 1}
                                rx="8"
                              />
                              {node.processNumber && (
                                <text
                                  x={node.x + 8}
                                  y={node.y + 18}
                                  className="text-xs font-bold fill-white pointer-events-none"
                                >
                                  {node.processNumber}
                                </text>
                              )}
                            </>
                          )}

                          {/* Data Store: Open rectangle */}
                          {node.type === 'data-store' && (
                            <>
                              <rect
                                x={node.x}
                                y={node.y}
                                width={node.width}
                                height={node.height}
                                fill={node.color || config.color}
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 3 : 1}
                                rx="0"
                              />
                              <line
                                x1={node.x}
                                y1={node.y + 10}
                                x2={node.x + node.width}
                                y2={node.y + 10}
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 2 : 1}
                              />
                              <line
                                x1={node.x}
                                y1={node.y + node.height - 10}
                                x2={node.x + node.width}
                                y2={node.y + node.height - 10}
                                stroke={isSelected ? '#3b82f6' : '#6b7280'}
                                strokeWidth={isSelected ? 2 : 1}
                              />
                            </>
                          )}

                          <foreignObject x={node.x + 5} y={node.y + 5} width="20" height="20">
                            <IconComponent size={16} className="text-white" />
                          </foreignObject>

                          <text
                            x={node.x + node.width / 2}
                            y={node.y + node.height / 2 + 4}
                            textAnchor="middle"
                            className="text-sm font-medium fill-white pointer-events-none"
                          >
                            {node.label}
                          </text>
                          <rect
                            x={node.x}
                            y={node.y}
                            width={node.width}
                            height={node.height}
                            fill="transparent"
                            stroke="none"
                            className="cursor-pointer"
                            onClick={(e) => handleNodeClick(e, node.id)}
                          />
                        </g>
                      );
                    })}
                  </>
                )}

                {/* ER/ERR Mode Rendering */}
                {(mode === 'er' || mode === 'err') && (
                  <>
                    {/* ER Relationships */}
                    {erRelationships.map((rel) => {
                      const fromEntity = erEntities.find(e => e.id === rel.fromEntity);
                      const toEntity = erEntities.find(e => e.id === rel.toEntity);
                      if (!fromEntity || !toEntity) return null;

                      const fromX = fromEntity.x + fromEntity.width / 2;
                      const fromY = fromEntity.y + fromEntity.height / 2;
                      const toX = toEntity.x + toEntity.width / 2;
                      const toY = toEntity.y + toEntity.height / 2;

                      return (
                        <g key={rel.id}>
                          <path
                            d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                            stroke={rel.isIdentifying ? '#ef4444' : '#6b7280'}
                            strokeWidth={rel.isIdentifying ? 3 : 2}
                            fill="none"
                            strokeDasharray={rel.fromOptionality === 'optional' || rel.toOptionality === 'optional' ? '5,5' : 'none'}
                          />
                          <text
                            x={(fromX + toX) / 2}
                            y={(fromY + toY) / 2 - 5}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                          >
                            {rel.name} ({getRelationshipTypeLabel(rel.fromCardinality, rel.toCardinality)})
                          </text>
                        </g>
                      );
                    })}

                    {/* ER Entities */}
                    {erEntities.map((entity) => {
                      const isSelected = canvasState.selectedNodeId === entity.id;
                      if (entity.isWeak && mode === 'err') {
                        return (
                          <WeakEntityNode
                            key={entity.id}
                            entity={entity}
                            isSelected={isSelected}
                            onClick={(e) => handleNodeClick(e, entity.id)}
                          />
                        );
                      }
                      return (
                        <EntityNode
                          key={entity.id}
                          entity={entity}
                          isSelected={isSelected}
                          onClick={(e) => handleNodeClick(e, entity.id)}
                        />
                      );
                    })}

                    {/* Specializations (ERR only) */}
                    {mode === 'err' && specializations.map((spec) => {
                      const superEntity = erEntities.find(e => e.id === spec.superEntity);
                      const subEntities = spec.subEntities.map(id => erEntities.find(e => e.id === id)).filter(Boolean) as EREntity[];
                      if (!superEntity || subEntities.length === 0) return null;

                      return (
                        <SpecializationNode
                          key={spec.id}
                          specialization={spec}
                          superEntity={superEntity}
                          subEntities={subEntities}
                          isSelected={canvasState.selectedNodeId === spec.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasState(prev => ({ ...prev, selectedNodeId: spec.id }));
                            setSidePanel({
                              isOpen: true,
                              mode: 'specialization',
                              selectedId: spec.id
                            });
                          }}
                        />
                      );
                    })}

                    {/* ER Relationships */}
                    {erRelationships.map((rel) => {
                      const fromEntity = erEntities.find(e => e.id === rel.fromEntity);
                      const toEntity = erEntities.find(e => e.id === rel.toEntity);
                      if (!fromEntity || !toEntity) return null;

                      return (
                        <RelationshipLine
                          key={rel.id}
                          relationship={rel}
                          fromEntity={fromEntity}
                          toEntity={toEntity}
                          isSelected={canvasState.selectedConnectionId === rel.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCanvasState(prev => ({ ...prev, selectedConnectionId: rel.id, selectedNodeId: null }));
                            setSidePanel({
                              isOpen: true,
                              mode: 'relationship',
                              selectedId: rel.id
                            });
                          }}
                        />
                      );
                    })}
                  </>
                )}

                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
              </g>
            </svg>
          </div>
        </div>

        {/* Side Panel Toggle Button */}
        <button
          onClick={() => setSidePanel(prev => ({ ...prev, isOpen: !prev.isOpen }))}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-lg shadow-lg z-10"
        >
          {sidePanel.isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Side Panel */}
        <SidePanel
          isOpen={sidePanel.isOpen}
          mode={sidePanel.mode}
          selectedId={sidePanel.selectedId}
          getEntity={(id) => erEntities.find(e => e.id === id)}
          getDFDNode={(id) => dfdNodes.find(n => n.id === id)}
          getRelationship={(id) => erRelationships.find(r => r.id === id)}
          updateEntity={(id, updates) => {
            setErEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
            saveToHistory();
          }}
          updateDFDNode={(id, updates) => {
            setDfdNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
            saveToHistory();
          }}
          updateRelationship={(id, updates) => {
            setErRelationships(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
            saveToHistory();
          }}
          deleteEntity={(id) => {
            setErEntities(prev => prev.filter(e => e.id !== id));
            setErRelationships(prev => prev.filter(r => r.fromEntity !== id && r.toEntity !== id));
            saveToHistory();
          }}
          deleteDFDNode={(id) => {
            setDfdNodes(prev => prev.filter(n => n.id !== id));
            setDfdConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
            saveToHistory();
          }}
          deleteRelationship={(id) => {
            setErRelationships(prev => prev.filter(r => r.id !== id));
            saveToHistory();
          }}
          addAttribute={(entityId, attribute) => {
            setErEntities(prev => prev.map(e => 
              e.id === entityId 
                ? { ...e, attributes: [...e.attributes, attribute] }
                : e
            ));
            if (attribute.type === 'primary-key') {
              setErEntities(prev => prev.map(e => 
                e.id === entityId 
                  ? { ...e, primaryKeys: [...e.primaryKeys, attribute.id] }
                  : e
              ));
            }
            saveToHistory();
          }}
          updateAttribute={(entityId, attributeId, updates) => {
            setErEntities(prev => prev.map(e => 
              e.id === entityId
                ? {
                    ...e,
                    attributes: e.attributes.map(a => a.id === attributeId ? { ...a, ...updates } : a),
                    primaryKeys: updates.type === 'primary-key' && !e.primaryKeys.includes(attributeId)
                      ? [...e.primaryKeys, attributeId]
                      : updates.type !== 'primary-key' && e.primaryKeys.includes(attributeId)
                      ? e.primaryKeys.filter(id => id !== attributeId)
                      : e.primaryKeys
                  }
                : e
            ));
            saveToHistory();
          }}
          deleteAttribute={(entityId, attributeId) => {
            setErEntities(prev => prev.map(e => 
              e.id === entityId
                ? {
                    ...e,
                    attributes: e.attributes.filter(a => a.id !== attributeId),
                    primaryKeys: e.primaryKeys.filter(id => id !== attributeId)
                  }
                : e
            ));
            saveToHistory();
          }}
          getEntities={() => erEntities}
          onClose={() => setSidePanel({ isOpen: false, mode: null, selectedId: null })}
        />
      </div>
    </div>
  );
};

export default UnifiedDiagramEditor;

