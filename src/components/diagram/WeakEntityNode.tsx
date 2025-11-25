import React from 'react';
import type { EREntity } from '../../types/diagram';

interface WeakEntityNodeProps {
  entity: EREntity;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onAttributeClick?: (attributeId: string) => void;
}

/**
 * Weak Entity Node Component for ERR Diagrams
 * Displays weak entities with double border and partial key support
 */
const WeakEntityNode: React.FC<WeakEntityNodeProps> = ({
  entity,
  isSelected,
  onClick,
  onAttributeClick
}) => {
  // Weak entities are rendered similar to regular entities but with double border
  // This component is mainly for type distinction and can use EntityNode with isWeak=true
  
  // Calculate height based on attributes
  const minHeight = 80;
  const attributeHeight = 18;
  const headerHeight = 30;
  const padding = 10;
  const calculatedHeight = Math.max(
    minHeight,
    headerHeight + entity.attributes.length * attributeHeight + padding * 2
  );

  return (
    <g>
      {/* Outer Rectangle (Double border effect) */}
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={calculatedHeight}
        fill={entity.color || '#dc2626'}
        stroke={isSelected ? '#ef4444' : '#991b1b'}
        strokeWidth={isSelected ? 4 : 2}
        rx="4"
        className="cursor-pointer"
        onClick={onClick}
      />

      {/* Inner Rectangle (Double border effect) */}
      <rect
        x={entity.x + 4}
        y={entity.y + 4}
        width={entity.width - 8}
        height={calculatedHeight - 8}
        fill="none"
        stroke={isSelected ? '#ef4444' : '#991b1b'}
        strokeWidth="1"
      />

      {/* Entity Name Header */}
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={headerHeight}
        fill="rgba(0, 0, 0, 0.3)"
        rx="4"
      />
      <text
        x={entity.x + entity.width / 2}
        y={entity.y + headerHeight / 2 + 4}
        textAnchor="middle"
        className="text-sm font-bold fill-white pointer-events-none"
      >
        {entity.name} (Weak)
      </text>

      {/* Attributes */}
      {entity.attributes.map((attr, idx) => {
        const attrY = entity.y + headerHeight + 5 + idx * attributeHeight;
        const isPartialKey = entity.partialKey?.includes(attr.id);
        const isPrimaryKey = entity.primaryKeys.includes(attr.id);
        
        return (
          <g key={attr.id}>
            {/* Partial key indicator */}
            {isPartialKey && (
              <rect
                x={entity.x + 2}
                y={attrY - 2}
                width={entity.width - 4}
                height={attributeHeight - 2}
                fill="#fbbf24"
                fillOpacity="0.3"
                rx="2"
              />
            )}
            
            <text
              x={entity.x + 5}
              y={attrY + 12}
              className="text-xs fill-white pointer-events-none"
            >
              {isPrimaryKey ? 'PK ' : isPartialKey ? 'PPK ' : ''}
              {attr.name}
            </text>
          </g>
        );
      })}

      {/* Clickable area */}
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={calculatedHeight}
        fill="transparent"
        stroke="none"
        className="cursor-pointer"
        onClick={onClick}
      />
    </g>
  );
};

export default WeakEntityNode;

