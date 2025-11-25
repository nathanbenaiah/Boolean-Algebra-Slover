import React from 'react';
import type { ERRelationship, EREntity } from '../../types/diagram';
import { generateCrowsFoot, getRelationshipTypeLabel } from '../../utils/crowsFootNotation';

interface RelationshipLineProps {
  relationship: ERRelationship;
  fromEntity: EREntity;
  toEntity: EREntity;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

/**
 * Relationship Line Component with Crow's Foot Notation
 * Displays relationships between entities with proper cardinality indicators
 */
const RelationshipLine: React.FC<RelationshipLineProps> = ({
  relationship,
  fromEntity,
  toEntity,
  isSelected,
  onClick
}) => {
  // Calculate connection points
  const fromX = fromEntity.x + fromEntity.width / 2;
  const fromY = fromEntity.y + fromEntity.height / 2;
  const toX = toEntity.x + toEntity.width / 2;
  const toY = toEntity.y + toEntity.height / 2;

  // Calculate angle for Crow's foot notation
  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
  const fromAngle = angle + 180;
  const toAngle = angle;

  // Generate Crow's foot symbols
  const fromSymbol = generateCrowsFoot(
    {
      cardinality: relationship.fromCardinality,
      optionality: relationship.fromOptionality,
      size: 20,
      color: relationship.isIdentifying ? '#ef4444' : '#6b7280'
    },
    'start',
    fromAngle
  );

  const toSymbol = generateCrowsFoot(
    {
      cardinality: relationship.toCardinality,
      optionality: relationship.toOptionality,
      size: 20,
      color: relationship.isIdentifying ? '#ef4444' : '#6b7280'
    },
    'end',
    toAngle
  );

  // Line style
  const strokeColor = relationship.isIdentifying ? '#ef4444' : (isSelected ? '#3b82f6' : '#6b7280');
  const strokeWidth = relationship.isIdentifying ? 3 : (isSelected ? 3 : 2);
  const strokeDasharray = 
    relationship.fromOptionality === 'optional' || relationship.toOptionality === 'optional'
      ? '5,5'
      : 'none';

  // Midpoint for label
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <g>
      {/* Relationship Line */}
      <path
        d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={strokeDasharray}
        className="cursor-pointer"
        onClick={onClick}
        style={{ markerEnd: 'url(#arrowhead)' }}
      />

      {/* Crow's Foot Notation at From End */}
      <g transform={`translate(${fromX}, ${fromY}) rotate(${fromAngle})`}>
        {relationship.fromCardinality === '0' && (
          <circle cx="0" cy="0" r="3" fill="none" stroke={strokeColor} strokeWidth="2" />
        )}
        {relationship.fromCardinality === '1' && (
          <line x1="0" y1="-8" x2="0" y2="8" stroke={strokeColor} strokeWidth="2" />
        )}
        {relationship.fromCardinality === 'many' && (
          <>
            <line x1="-6" y1="-6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="6" y1="-6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="-6" y1="6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="6" y1="6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="10" stroke={strokeColor} strokeWidth="2" />
          </>
        )}
      </g>

      {/* Crow's Foot Notation at To End */}
      <g transform={`translate(${toX}, ${toY}) rotate(${toAngle})`}>
        {relationship.toCardinality === '0' && (
          <circle cx="0" cy="0" r="3" fill="none" stroke={strokeColor} strokeWidth="2" />
        )}
        {relationship.toCardinality === '1' && (
          <line x1="0" y1="-8" x2="0" y2="8" stroke={strokeColor} strokeWidth="2" />
        )}
        {relationship.toCardinality === 'many' && (
          <>
            <line x1="-6" y1="-6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="6" y1="-6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="-6" y1="6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="6" y1="6" x2="0" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="10" stroke={strokeColor} strokeWidth="2" />
          </>
        )}
      </g>

      {/* Relationship Label */}
      <g>
        <rect
          x={midX - 40}
          y={midY - 12}
          width="80"
          height="24"
          fill="white"
          stroke={strokeColor}
          strokeWidth="1"
          rx="4"
          className="cursor-pointer"
          onClick={onClick}
        />
        <text
          x={midX}
          y={midY + 4}
          textAnchor="middle"
          className="text-xs font-medium fill-gray-700 pointer-events-none"
        >
          {relationship.name}
        </text>
        <text
          x={midX}
          y={midY + 16}
          textAnchor="middle"
          className="text-[10px] fill-gray-500 pointer-events-none"
        >
          {getRelationshipTypeLabel(relationship.fromCardinality, relationship.toCardinality)}
        </text>
      </g>

      {/* Optionality indicators */}
      {relationship.fromOptionality === 'optional' && (
        <circle cx={fromX} cy={fromY} r="4" fill="white" stroke={strokeColor} strokeWidth="2" />
      )}
      {relationship.toOptionality === 'optional' && (
        <circle cx={toX} cy={toY} r="4" fill="white" stroke={strokeColor} strokeWidth="2" />
      )}
    </g>
  );
};

export default RelationshipLine;

