import React from 'react';
import type { SpecializationGeneralization, EREntity } from '../../types/diagram';

interface SpecializationNodeProps {
  specialization: SpecializationGeneralization;
  superEntity: EREntity;
  subEntities: EREntity[];
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

/**
 * Specialization/Generalization Node Component for ERR Diagrams
 * Displays ISA (is-a) relationships with triangle connector
 */
const SpecializationNode: React.FC<SpecializationNodeProps> = ({
  specialization,
  superEntity,
  subEntities,
  isSelected,
  onClick
}) => {
  // Calculate triangle position (centered above/below super entity)
  const triangleSize = 20;
  const triangleX = superEntity.x + superEntity.width / 2;
  const triangleY = specialization.y;

  // Calculate connection points
  const superY = superEntity.y + superEntity.height;
  const triangleBottomY = triangleY + triangleSize;

  return (
    <g>
      {/* Triangle (ISA connector) */}
      <polygon
        points={`
          ${triangleX},${triangleY} 
          ${triangleX - triangleSize},${triangleY + triangleSize} 
          ${triangleX + triangleSize},${triangleY + triangleSize}
        `}
        fill={isSelected ? '#3b82f6' : '#6b7280'}
        stroke={isSelected ? '#1e40af' : '#4b5563'}
        strokeWidth={isSelected ? 2 : 1}
        className="cursor-pointer"
        onClick={onClick}
      />

      {/* Connection from super entity to triangle */}
      <line
        x1={triangleX}
        y1={superY}
        x2={triangleX}
        y2={triangleBottomY}
        stroke={isSelected ? '#3b82f6' : '#6b7280'}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={specialization.isTotal ? 'none' : '5,5'}
      />

      {/* Connections from triangle to sub entities */}
      {subEntities.map((subEntity, idx) => {
        const subX = subEntity.x + subEntity.width / 2;
        const subY = subEntity.y;
        
        // Calculate angle for connection
        const angle = Math.atan2(subY - triangleBottomY, subX - triangleX) * (180 / Math.PI);
        const distance = Math.sqrt(Math.pow(subX - triangleX, 2) + Math.pow(subY - triangleBottomY, 2));
        
        // Adjust connection point on triangle edge
        const triangleEdgeX = triangleX + (subX > triangleX ? triangleSize : -triangleSize) * Math.cos(angle * Math.PI / 180);
        const triangleEdgeY = triangleBottomY + triangleSize * Math.sin(angle * Math.PI / 180);

        return (
          <g key={subEntity.id}>
            <line
              x1={triangleEdgeX}
              y1={triangleEdgeY}
              x2={subX}
              y2={subY}
              stroke={isSelected ? '#3b82f6' : '#6b7280'}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray={specialization.isDisjoint ? 'none' : '3,3'}
            />
            
            {/* Disjoint/Overlapping indicator */}
            {!specialization.isDisjoint && (
              <circle
                cx={(triangleEdgeX + subX) / 2}
                cy={(triangleEdgeY + subY) / 2}
                r="3"
                fill="#6b7280"
              />
            )}
          </g>
        );
      })}

      {/* Specialization Label */}
      <text
        x={triangleX}
        y={triangleY - 5}
        textAnchor="middle"
        className="text-xs font-medium fill-gray-700 pointer-events-none"
      >
        {specialization.name || 'ISA'}
      </text>

      {/* Constraints Label */}
      <text
        x={triangleX}
        y={triangleY + triangleSize + 15}
        textAnchor="middle"
        className="text-[10px] fill-gray-500 pointer-events-none"
      >
        {specialization.isTotal ? 'Total' : 'Partial'} / {specialization.isDisjoint ? 'Disjoint' : 'Overlapping'}
      </text>
    </g>
  );
};

export default SpecializationNode;

