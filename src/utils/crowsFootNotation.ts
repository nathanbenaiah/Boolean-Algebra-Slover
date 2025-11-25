/**
 * Crow's Foot Notation Utilities
 * Generates SVG paths for Crow's foot notation symbols
 */

export type Cardinality = '0' | '1' | 'many';
export type Optionality = 'mandatory' | 'optional';

export interface CrowFootConfig {
  cardinality: Cardinality;
  optionality: Optionality;
  size?: number;
  color?: string;
}

/**
 * Generate SVG path for Crow's foot notation
 * @param config Configuration for the Crow's foot symbol
 * @param position Position on the line ('start' | 'end')
 * @param angle Angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
 */
export function generateCrowsFoot(
  config: CrowFootConfig,
  position: 'start' | 'end' = 'end',
  angle: number = 0
): string {
  const size = config.size || 20;
  const color = config.color || '#000000';
  const { cardinality, optionality } = config;

  // Convert angle to radians
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Base coordinates (before rotation)
  let paths: string[] = [];

  if (cardinality === '0') {
    // Zero: Small circle
    const radius = size * 0.15;
    paths.push(`M ${-size * 0.5} 0 A ${radius} ${radius} 0 1 1 ${size * 0.5} 0`);
    paths.push(`M ${-size * 0.5} 0 A ${radius} ${radius} 0 1 0 ${size * 0.5} 0`);
  } else if (cardinality === '1') {
    // One: Single line perpendicular
    paths.push(`M 0 ${-size * 0.3} L 0 ${size * 0.3}`);
  } else if (cardinality === 'many') {
    // Many: Crow's foot (three lines)
    const footSize = size * 0.4;
    paths.push(`M ${-footSize} ${-footSize} L 0 0 L ${footSize} ${-footSize}`);
    paths.push(`M ${-footSize} ${footSize} L 0 0 L ${footSize} ${footSize}`);
    paths.push(`M 0 0 L 0 ${size * 0.3}`);
  }

  // Apply rotation transformation
  const rotatedPaths = paths.map(path => {
    // Simple rotation - for complex paths, we'd need to parse and transform each coordinate
    return path;
  });

  // If optional, make the line dashed
  const strokeDasharray = optionality === 'optional' ? '5,5' : 'none';

  return `<g transform="rotate(${angle})">
    ${rotatedPaths.map(p => `<path d="${p}" stroke="${color}" stroke-width="2" fill="none" stroke-dasharray="${strokeDasharray}"/>`).join('\n')}
  </g>`;
}

/**
 * Generate relationship line with Crow's foot notation at both ends
 */
export function generateRelationshipLine(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  fromConfig: CrowFootConfig,
  toConfig: CrowFootConfig
): string {
  // Calculate angle for from end
  const fromAngle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
  // Calculate angle for to end (opposite direction)
  const toAngle = fromAngle + 180;

  const fromSymbol = generateCrowsFoot(fromConfig, 'start', fromAngle);
  const toSymbol = generateCrowsFoot(toConfig, 'end', toAngle);

  // Generate line path
  const linePath = `M ${fromX} ${fromY} L ${toX} ${toY}`;
  const lineStyle = fromConfig.optionality === 'optional' || toConfig.optionality === 'optional' 
    ? 'stroke-dasharray="5,5"' 
    : '';

  return `
    <path d="${linePath}" stroke="#6b7280" stroke-width="2" fill="none" ${lineStyle}/>
    ${fromSymbol}
    ${toSymbol}
  `;
}

/**
 * Get cardinality symbol for display
 */
export function getCardinalitySymbol(cardinality: Cardinality): string {
  switch (cardinality) {
    case '0':
      return 'O';
    case '1':
      return '|';
    case 'many':
      return '>';
    default:
      return '';
  }
}

/**
 * Get relationship type label
 */
export function getRelationshipTypeLabel(
  fromCardinality: Cardinality,
  toCardinality: Cardinality
): string {
  if (fromCardinality === '1' && toCardinality === '1') {
    return '1:1';
  } else if (fromCardinality === '1' && toCardinality === 'many') {
    return '1:M';
  } else if (fromCardinality === 'many' && toCardinality === '1') {
    return 'M:1';
  } else if (fromCardinality === 'many' && toCardinality === 'many') {
    return 'M:M';
  }
  return `${fromCardinality}:${toCardinality}`;
}

