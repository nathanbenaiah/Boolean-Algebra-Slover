import React, { useState } from 'react';
import { Grid3X3, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const KMapSimplifierPage: React.FC = () => {
  const [variables, setVariables] = useState(3);
  const [cells, setCells] = useState<number[]>(new Array(8).fill(0));
  const [result, setResult] = useState<string>('');

  const variableNames = ['A', 'B', 'C', 'D', 'E', 'F'];

  const updateVariables = (newCount: number) => {
    setVariables(newCount);
    const newSize = Math.pow(2, newCount);
    setCells(new Array(newSize).fill(0));
    setResult('');
  };

  const toggleCell = (index: number) => {
    const newCells = [...cells];
    newCells[index] = newCells[index] === 0 ? 1 : 0;
    setCells(newCells);
    generateExpression(newCells);
  };

  const generateExpression = (cellValues: number[]) => {
    const minterms = cellValues
      .map((value, index) => value === 1 ? index : -1)
      .filter(index => index !== -1);
    
    if (minterms.length === 0) {
      setResult('0');
      return;
    }
    
    if (minterms.length === cellValues.length) {
      setResult('1');
      return;
    }

    // Basic minterm generation
    const expressions = minterms.map(minterm => {
      let expr = '';
      for (let i = 0; i < variables; i++) {
        const bit = (minterm >> (variables - 1 - i)) & 1;
        if (expr) expr += '';
        expr += bit === 1 ? variableNames[i] : variableNames[i] + '̄';
      }
      return expr;
    });

    setResult(expressions.join(' + '));
  };

  const getKMapLayout = () => {
    if (variables === 2) {
      return {
        rows: 2,
        cols: 2,
        rowLabels: ['0', '1'],
        colLabels: ['0', '1'],
        cellOrder: [0, 1, 2, 3]
      };
    } else if (variables === 3) {
      return {
        rows: 2,
        cols: 4,
        rowLabels: ['0', '1'],
        colLabels: ['00', '01', '11', '10'],
        cellOrder: [0, 1, 3, 2, 4, 5, 7, 6]
      };
    } else {
      return {
        rows: 4,
        cols: 4,
        rowLabels: ['00', '01', '11', '10'],
        colLabels: ['00', '01', '11', '10'],
        cellOrder: [0, 1, 3, 2, 4, 5, 7, 6, 12, 13, 15, 14, 8, 9, 11, 10]
      };
    }
  };

  const layout = getKMapLayout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-600 rounded-full">
              <Grid3X3 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Karnaugh Map
            <span className="block text-green-600">Simplifier</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Interactive K-Map tool for Boolean expression minimization
          </p>
          
          {/* Quick Guide Link */}
          <Link 
            to="/guide"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Learn about K-Maps
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* K-Map Interface */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive K-Map</h2>
            
            {/* Variable Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Variables:
              </label>
              <select
                value={variables}
                onChange={(e) => updateVariables(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={2}>2 Variables (A, B)</option>
                <option value={3}>3 Variables (A, B, C)</option>
                <option value={4}>4 Variables (A, B, C, D)</option>
              </select>
            </div>

            {/* K-Map Grid */}
            <div className="mb-6">
              <div className="inline-block border-2 border-gray-300 rounded-lg overflow-hidden">
                {/* Column headers */}
                <div className="flex">
                  <div className="w-12 h-12 bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                    {variables === 2 ? 'A\\B' : variables === 3 ? 'A\\BC' : 'AB\\CD'}
                  </div>
                  {layout.colLabels.map((label, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-center text-sm font-medium"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                
                {/* K-Map cells */}
                {Array.from({ length: layout.rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {/* Row header */}
                    <div className="w-12 h-12 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium">
                      {layout.rowLabels[rowIndex]}
                    </div>
                    
                    {/* Row cells */}
                    {Array.from({ length: layout.cols }).map((_, colIndex) => {
                      const cellIndex = layout.cellOrder[rowIndex * layout.cols + colIndex];
                      return (
                        <div
                          key={colIndex}
                          onClick={() => toggleCell(cellIndex)}
                          className={`w-12 h-12 border border-gray-300 flex items-center justify-center cursor-pointer text-lg font-bold transition-colors ${
                            cells[cellIndex] === 1
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-white text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {cells[cellIndex]}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCells(new Array(cells.length).fill(0));
                  setResult('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  setCells(new Array(cells.length).fill(1));
                  generateExpression(new Array(cells.length).fill(1));
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Fill All
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simplified Expression</h2>
            
            {result && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Sum of Products (SOP):</h3>
                  <p className="text-green-700 text-lg font-mono">{result}</p>
                </div>
              </div>
            )}

            {/* Current State */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Current State:</h3>
              <div className="grid grid-cols-4 gap-2">
                {cells.map((value, index) => (
                  <div
                    key={index}
                    className={`p-2 text-center rounded ${
                      value === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className="text-xs">Cell {index}</div>
                    <div className="font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMapSimplifierPage; 