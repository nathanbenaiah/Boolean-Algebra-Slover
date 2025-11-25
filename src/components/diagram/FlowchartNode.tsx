import React from 'react';
import { FlowchartNode as FlowchartNodeType } from '../../types/diagram';

interface FlowchartNodeProps {
  node: FlowchartNodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onLabelDoubleClick: (id: string, currentLabel: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string, handle: 'se' | 'sw' | 'ne' | 'nw') => void;
}

const FlowchartNode: React.FC<FlowchartNodeProps> = ({
  node, isSelected, onMouseDown, onLabelDoubleClick, onResizeStart
}) => {
  const renderShape = () => {
    const fillColor = node.color || '#e0f2fe'; // light blue default
    const strokeColor = isSelected ? '#3b82f6' : '#94a3b8';
    const strokeWidth = isSelected ? 3 : 1;

    switch (node.type) {
      case 'start':
      case 'end':
        // Rounded rectangle (oval)
        return (
          <ellipse
            cx={node.x + node.width / 2}
            cy={node.y + node.height / 2}
            rx={node.width / 2}
            ry={node.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="cursor-grab hover:shadow-md transition-shadow"
            onMouseDown={(e) => onMouseDown(e, node.id)}
          />
        );

      case 'process':
        // Rectangle
        return (
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={4}
            className="cursor-grab hover:shadow-md transition-shadow"
            onMouseDown={(e) => onMouseDown(e, node.id)}
          />
        );

      case 'decision':
        // Diamond
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        const halfWidth = node.width / 2;
        const halfHeight = node.height / 2;
        return (
          <polygon
            points={`${centerX},${node.y} ${node.x + node.width},${centerY} ${centerX},${node.y + node.height} ${node.x},${centerY}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="cursor-grab hover:shadow-md transition-shadow"
            onMouseDown={(e) => onMouseDown(e, node.id)}
          />
        );

      case 'input-output':
        // Parallelogram
        const offset = 20;
        return (
          <polygon
            points={`${node.x + offset},${node.y} ${node.x + node.width},${node.y} ${node.x + node.width - offset},${node.y + node.height} ${node.x},${node.y + node.height}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="cursor-grab hover:shadow-md transition-shadow"
            onMouseDown={(e) => onMouseDown(e, node.id)}
          />
        );

      case 'predefined-process':
        // Rectangle with double vertical lines on left
        return (
          <g>
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              rx={4}
              className="cursor-grab hover:shadow-md transition-shadow"
              onMouseDown={(e) => onMouseDown(e, node.id)}
            />
            <line
              x1={node.x + 10}
              y1={node.y}
              x2={node.x + 10}
              y2={node.y + node.height}
              stroke={strokeColor}
              strokeWidth={2}
            />
            <line
              x1={node.x + 15}
              y1={node.y}
              x2={node.x + 15}
              y2={node.y + node.height}
              stroke={strokeColor}
              strokeWidth={2}
            />
          </g>
        );

      case 'connector':
        // Circle
        return (
          <circle
            cx={node.x + node.width / 2}
            cy={node.y + node.height / 2}
            r={Math.min(node.width, node.height) / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="cursor-grab hover:shadow-md transition-shadow"
            onMouseDown={(e) => onMouseDown(e, node.id)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <g>
      {renderShape()}
      
      {/* Label */}
      <text
        x={node.x + node.width / 2}
        y={node.y + node.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-medium fill-gray-900 select-none cursor-text pointer-events-none"
        onDoubleClick={() => onLabelDoubleClick(node.id, node.label)}
        style={{ pointerEvents: 'all' }}
      >
        {node.label}
      </text>

      {/* Resize handles for selected elements */}
      {isSelected && (
        <>
          <rect
            x={node.x + node.width - 4}
            y={node.y + node.height - 4}
            width="8"
            height="8"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1"
            className="cursor-se-resize"
            onMouseDown={(e) => onResizeStart(e, node.id, 'se')}
          />
          <rect
            x={node.x - 4}
            y={node.y + node.height - 4}
            width="8"
            height="8"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1"
            className="cursor-sw-resize"
            onMouseDown={(e) => onResizeStart(e, node.id, 'sw')}
          />
          <rect
            x={node.x + node.width - 4}
            y={node.y - 4}
            width="8"
            height="8"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1"
            className="cursor-ne-resize"
            onMouseDown={(e) => onResizeStart(e, node.id, 'ne')}
          />
          <rect
            x={node.x - 4}
            y={node.y - 4}
            width="8"
            height="8"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1"
            className="cursor-nw-resize"
            onMouseDown={(e) => onResizeStart(e, node.id, 'nw')}
          />
        </>
      )}
    </g>
  );
};

export default FlowchartNode;

