import React from 'react';
import { Grid3X3 } from 'lucide-react';

interface KMapCell {
  value: boolean;
  inputs: { [key: string]: boolean };
  row: number;
  col: number;
}

interface KMapProps {
  kMap: {
    cells: KMapCell[][];
    variables: string[];
    rowLabels: string[];
    colLabels: string[];
  } | null;
  expression: string;
}

const KarnaughMap: React.FC<KMapProps> = ({ kMap, expression }) => {
  if (!expression.trim()) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="mx-auto text-blue-400 mb-4" size={48} />
        <p className="text-blue-500">Enter a Boolean expression to generate Karnaugh Map</p>
      </div>
    );
  }

  if (!kMap || kMap.variables.length > 4) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">K-Map Not Available</h3>
        <p className="text-yellow-700">
          Karnaugh Maps are only supported for expressions with 2-4 variables. 
          Your expression has {kMap ? kMap.variables.length : 'too many'} variables.
        </p>
      </div>
    );
  }

  const getCellColor = (cell: KMapCell) => {
    if (cell.value) {
      return 'bg-green-100 border-green-400 text-green-800';
    }
    return 'bg-red-100 border-red-400 text-red-800';
  };

  const renderVariableLabels = () => {
    if (kMap.variables.length === 2) {
      return (
        <div className="mb-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Variable Assignment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="font-mono font-bold">{kMap.variables[0]}</span> controls rows (vertical)
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span className="font-mono font-bold">{kMap.variables[1]}</span> controls columns (horizontal)
            </div>
          </div>
        </div>
      );
    } else if (kMap.variables.length === 3) {
      return (
        <div className="mb-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Variable Assignment</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="font-mono font-bold">{kMap.variables[0]}</span> controls rows (vertical)
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span className="font-mono font-bold">{kMap.variables[1]}, {kMap.variables[2]}</span> control columns (horizontal)
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-800 mb-6">Karnaugh Map Visualization</h3>
      
      <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
        <div className="mb-4">
          <p className="text-sm text-blue-600 mb-2">
            Variables: <span className="font-mono font-semibold text-blue-800">{kMap.variables.join(', ')}</span>
          </p>
        </div>

        {renderVariableLabels()}

        {/* Enhanced K-Map Grid */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
            {/* Variable labels on the sides */}
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90">
              <span className="text-blue-600 font-bold text-lg">{kMap.variables[0]}</span>
            </div>
            
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <span className="text-purple-600 font-bold text-lg">
                {kMap.variables.length === 2 ? kMap.variables[1] : `${kMap.variables[1]}, ${kMap.variables[2]}`}
              </span>
            </div>

            {/* Column headers with enhanced styling */}
            <div className="flex mb-2">
              <div className="w-16"></div> {/* Empty space for row headers */}
              {kMap.colLabels.map((label, index) => (
                <div key={index} className="w-20 h-12 flex items-center justify-center bg-purple-100 border-2 border-purple-300 rounded text-sm font-bold text-purple-800 mr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* K-Map rows with enhanced styling */}
            {kMap.cells.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center mb-1">
                {/* Row header */}
                <div className="w-16 h-20 flex items-center justify-center bg-blue-100 border-2 border-blue-300 rounded text-sm font-bold text-blue-800 mr-2">
                  {kMap.rowLabels[rowIndex]}
                </div>
                
                {/* Row cells */}
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-20 h-20 border-3 flex items-center justify-center text-2xl font-bold transition-all duration-200 hover:scale-105 mr-1 rounded-lg shadow-sm ${getCellColor(cell)}`}
                  >
                    {cell.value ? '1' : '0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-4 mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Legend</h4>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
              <span className="text-sm"><strong>1</strong> - Expression is TRUE</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded mr-2"></div>
              <span className="text-sm"><strong>0</strong> - Expression is FALSE</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default KarnaughMap;