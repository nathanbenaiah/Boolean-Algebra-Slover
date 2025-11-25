import React from 'react';
import type { EREntity, ERAttribute } from '../../types/diagram';

interface EntityNodeProps {
  entity: EREntity;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onAttributeClick?: (attributeId: string) => void;
}

/**
 * Entity Node Component for ER/ERR Diagrams
 * Displays entity with attributes, primary keys, and visual indicators
 */
const EntityNode: React.FC<EntityNodeProps> = ({ 
  entity, 
  isSelected, 
  onClick,
  onAttributeClick 
}) => {
  const getAttributeDisplay = (attr: ERAttribute): string => {
    let prefix = '';
    if (attr.type === 'primary-key') prefix = 'PK ';
    else if (attr.type === 'foreign-key') prefix = 'FK ';
    else if (attr.type === 'multi-valued') prefix = '{';
    else if (attr.type === 'derived') prefix = '/';
    
    let suffix = '';
    if (attr.type === 'multi-valued') suffix = '}';
    if (!attr.isNullable) suffix += ' *';
    
    return `${prefix}${attr.name}${suffix}`;
  };

  const getAttributeColor = (attr: ERAttribute): string => {
    if (attr.type === 'primary-key') return '#fbbf24';
    if (attr.type === 'foreign-key') return '#60a5fa';
    if (attr.type === 'multi-valued') return '#a78bfa';
    if (attr.type === 'derived') return '#34d399';
    if (attr.type === 'composite') return '#f472b6';
    return '#ffffff';
  };

  // Calculate height based on number of attributes
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
      {/* Entity Rectangle */}
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={calculatedHeight}
        fill={entity.color || '#3b82f6'}
        stroke={isSelected ? '#ef4444' : entity.isWeak ? '#dc2626' : '#6b7280'}
        strokeWidth={isSelected ? 3 : entity.isWeak ? 2 : 1}
        rx="4"
        className="cursor-pointer"
        onClick={onClick}
      />
      
      {/* Weak Entity: Double border */}
      {entity.isWeak && (
        <rect
          x={entity.x + 3}
          y={entity.y + 3}
          width={entity.width - 6}
          height={calculatedHeight - 6}
          fill="none"
          stroke="#dc2626"
          strokeWidth="1"
        />
      )}

      {/* Entity Name Header */}
      <rect
        x={entity.x}
        y={entity.y}
        width={entity.width}
        height={headerHeight}
        fill="rgba(0, 0, 0, 0.2)"
        rx="4"
      />
      <text
        x={entity.x + entity.width / 2}
        y={entity.y + headerHeight / 2 + 4}
        textAnchor="middle"
        className="text-sm font-bold fill-white pointer-events-none"
      >
        {entity.name}
      </text>

      {/* Attributes */}
      {entity.attributes.map((attr, idx) => {
        const attrY = entity.y + headerHeight + 5 + idx * attributeHeight;
        const attrColor = getAttributeColor(attr);
        const isPrimaryKey = entity.primaryKeys.includes(attr.id);
        
        return (
          <g key={attr.id}>
            {/* Attribute background highlight for PK/FK */}
            {(isPrimaryKey || attr.type === 'foreign-key') && (
              <rect
                x={entity.x + 2}
                y={attrY - 2}
                width={entity.width - 4}
                height={attributeHeight - 2}
                fill={attrColor}
                fillOpacity="0.3"
                rx="2"
              />
            )}
            
            {/* Composite attribute indicator */}
            {attr.type === 'composite' && attr.compositeAttributes && (
              <line
                x1={entity.x + 10}
                y1={attrY + 8}
                x2={entity.x + entity.width - 10}
                y2={attrY + 8}
                stroke="#f472b6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )}
            
            <text
              x={entity.x + 5}
              y={attrY + 12}
              className="text-xs fill-white pointer-events-none"
              style={{ 
                textDecoration: attr.type === 'derived' ? 'underline' : 'none',
                fontStyle: attr.type === 'derived' ? 'italic' : 'normal'
              }}
            >
              {getAttributeDisplay(attr)}
            </text>
            
            {/* Multi-valued attribute indicator (double oval) */}
            {attr.type === 'multi-valued' && (
              <>
                <ellipse
                  cx={entity.x + entity.width - 15}
                  cy={attrY + 8}
                  rx="8"
                  ry="6"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={entity.x + entity.width - 15}
                  cy={attrY + 8}
                  rx="6"
                  ry="4"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
              </>
            )}
          </g>
        );
      })}

      {/* Clickable area for selection */}
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

export default EntityNode;

