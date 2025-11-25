/**
 * Comprehensive type definitions for Unified Diagram Editor
 * Supports DFD, ER, ERR, and Flowchart diagram types
 */

// Diagram Modes
export type DiagramMode = 'dfd' | 'er' | 'err' | 'flowchart';

// DFD Types
export type DFDNodeType = 'external-entity' | 'process' | 'data-store';
export type DFDLevel = '0' | '1' | '2';

export interface DFDNode {
  id: string;
  type: DFDNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  processNumber?: number; // For process nodes
}

export interface DFDConnection {
  id: string;
  from: string;
  to: string;
  label: string;
  color?: string;
}

export interface DFDDiagram {
  level: DFDLevel;
  nodes: DFDNode[];
  connections: DFDConnection[];
  metadata?: {
    created?: string;
    modified?: string;
    version?: string;
  };
}

// ER/ERR Types
export type AttributeType = 'normal' | 'primary-key' | 'foreign-key' | 'composite' | 'multi-valued' | 'derived';
export type DataType = 'VARCHAR' | 'INT' | 'BIGINT' | 'DECIMAL' | 'DATE' | 'DATETIME' | 'BOOLEAN' | 'TEXT' | 'BLOB' | 'CUSTOM';
export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';
export type Cardinality = '0' | '1' | 'many';
export type Optionality = 'mandatory' | 'optional';

export interface ERAttribute {
  id: string;
  name: string;
  type: AttributeType;
  dataType: DataType;
  size?: number;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string;
  foreignKeyRef?: string; // Reference to another entity.attribute
  compositeAttributes?: ERAttribute[]; // For composite attributes
  description?: string;
}

export interface EREntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  attributes: ERAttribute[];
  primaryKeys: string[]; // Array of attribute IDs
  isWeak: boolean; // For ERR diagrams
  partialKey?: string[]; // For weak entities
  description?: string;
  color?: string;
}

export interface ERRelationship {
  id: string;
  name: string;
  type: RelationshipType;
  fromEntity: string; // Entity ID
  toEntity: string; // Entity ID
  fromCardinality: Cardinality;
  toCardinality: Cardinality;
  fromOptionality: Optionality;
  toOptionality: Optionality;
  isIdentifying: boolean; // For weak entity relationships
  description?: string;
  color?: string;
}

// ERR Specific Types
export interface SpecializationGeneralization {
  id: string;
  name: string;
  superEntity: string; // Entity ID
  subEntities: string[]; // Array of Entity IDs
  isTotal: boolean; // Total vs Partial
  isDisjoint: boolean; // Disjoint vs Overlapping
  x: number;
  y: number;
}

export interface ERDiagram {
  entities: EREntity[];
  relationships: ERRelationship[];
  specializations?: SpecializationGeneralization[]; // For ERR diagrams
  metadata?: {
    created?: string;
    modified?: string;
    version?: string;
  };
}

// Flowchart Types
export type FlowchartNodeType = 'start' | 'end' | 'process' | 'decision' | 'input-output' | 'connector' | 'predefined-process';

export interface FlowchartNode {
  id: string;
  type: FlowchartNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface FlowchartConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface FlowchartDiagram {
  nodes: FlowchartNode[];
  connections: FlowchartConnection[];
  metadata?: {
    created?: string;
    modified?: string;
    version?: string;
  };
}

// Unified Diagram Data
export interface UnifiedDiagram {
  mode: DiagramMode;
  dfd?: DFDDiagram;
  er?: ERDiagram;
  flowchart?: FlowchartDiagram;
  viewport?: {
    zoom: number;
    panX: number;
    panY: number;
  };
}

// Canvas State
export interface CanvasState {
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  connectingFrom: string | null;
  dragOffset: { x: number; y: number } | null;
  isDragging: boolean;
  resizingNodeId: string | null;
  resizeHandle: 'se' | 'sw' | 'ne' | 'nw' | null;
  showGrid: boolean;
  snapToGrid: boolean;
}

// History State
export interface HistoryState {
  nodes?: DFDNode[] | EREntity[] | FlowchartNode[];
  connections?: DFDConnection[] | ERRelationship[] | FlowchartConnection[];
  timestamp: number;
}

// Export/Import Types
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'sql';
export type ImportFormat = 'json' | 'sql';

// Validation Types
export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  elementId?: string;
  elementType?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Side Panel Types
export type SidePanelMode = 'entity' | 'attribute' | 'relationship' | 'process' | 'data-store' | 'external-entity' | 'specialization' | 'flowchart-node' | 'flowchart-connection' | null;

export interface SidePanelState {
  isOpen: boolean;
  mode: SidePanelMode;
  selectedId: string | null;
}

