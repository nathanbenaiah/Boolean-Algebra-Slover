import React, { useState } from 'react';
import { Table, ToggleLeft, ToggleRight } from 'lucide-react';

interface TruthTableRow {
  inputs: { [key: string]: boolean };
  output: boolean;
}

interface TruthTableProps {
  truthTable: TruthTableRow[];
  expression: string;
}

const TruthTable: React.FC<TruthTableProps> = ({ truthTable, expression }) => {
  const [showSOP, setShowSOP] = useState(true);
  const [showPOS, setShowPOS] = useState(true);

  if (!expression.trim()) {
    return (
      <div className="text-center py-12">
        <Table className="mx-auto text-blue-400 mb-4" size={48} />
        <p className="text-blue-500">Enter a Boolean expression to generate truth table</p>
      </div>
    );
  }

  if (truthTable.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
        <p className="text-yellow-800">Unable to generate truth table for this expression.</p>
      </div>
    );
  }

  const variables = Object.keys(truthTable[0].inputs).sort();
  
  // Generate SOP and POS forms
  const sopTerms = truthTable
    .filter(row => row.output)
    .map(row => {
      return variables.map(variable => 
        row.inputs[variable] ? variable : `${variable}'`
      ).join('');
    });

  const posTerms = truthTable
    .filter(row => !row.output)
    .map(row => {
      return '(' + variables.map(variable => 
        row.inputs[variable] ? `${variable}'` : variable
      ).join(' + ') + ')';
    });

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-800 mb-6">Truth Table Analysis</h3>
      
      {/* Truth Table */}
      <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden mb-6">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800">Complete Truth Table</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200">
                {variables.map(variable => (
                  <th key={variable} className="px-4 py-3 text-center font-semibold text-blue-800 border-r border-blue-300">
                    {variable}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-blue-800 bg-blue-300">Output</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map((row, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-blue-100 transition-colors hover:bg-blue-50 ${
                    row.output ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50'
                  }`}
                >
                  {variables.map(variable => (
                    <td key={variable} className="px-4 py-3 font-mono text-center text-gray-800 border-r border-blue-100">
                      {row.inputs[variable] ? (
                        <span className="inline-block w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold">1</span>
                      ) : (
                        <span className="inline-block w-8 h-8 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold">0</span>
                      )}
                    </td>
                  ))}
                  <td className={`px-4 py-3 font-mono font-bold text-center ${
                    row.output 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {row.output ? (
                      <span className="inline-block w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">1</span>
                    ) : (
                      <span className="inline-block w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Conversion Options */}
      <div className="bg-white rounded-xl border-2 border-blue-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-blue-800">Boolean Expression Forms</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button
                onClick={() => setShowSOP(!showSOP)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                {showSOP ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span className="text-sm font-medium">SOP</span>
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowPOS(!showPOS)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                {showPOS ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span className="text-sm font-medium">POS</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sum of Products (SOP) */}
          {showSOP && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-green-800 mb-3">Sum of Products (SOP)</h5>
              <div className="mb-3">
                <p className="text-sm text-green-700 mb-2">Canonical SOP Form:</p>
                <div className="bg-white p-4 rounded border border-green-300">
                  {sopTerms.length > 0 ? (
                    <p className="font-mono text-green-800 text-lg">
                      {sopTerms.join(' + ')}
                    </p>
                  ) : (
                    <p className="font-mono text-green-800">0 (Always false)</p>
                  )}
                </div>
              </div>
              <div className="text-xs text-green-600">
                <p><strong>Note:</strong> Each term represents a row where output = 1</p>
                <p>Minterms: {sopTerms.length > 0 ? truthTable.filter(row => row.output).map((_, i) => i).join(', ') : 'None'}</p>
              </div>
            </div>
          )}

          {/* Product of Sums (POS) */}
          {showPOS && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-purple-800 mb-3">Product of Sums (POS)</h5>
              <div className="mb-3">
                <p className="text-sm text-purple-700 mb-2">Canonical POS Form:</p>
                <div className="bg-white p-4 rounded border border-purple-300">
                  {posTerms.length > 0 ? (
                    <p className="font-mono text-purple-800 text-lg">
                      {posTerms.join(' · ')}
                    </p>
                  ) : (
                    <p className="font-mono text-purple-800">1 (Always true)</p>
                  )}
                </div>
              </div>
              <div className="text-xs text-purple-600">
                <p><strong>Note:</strong> Each term represents a row where output = 0</p>
                <p>Maxterms: {posTerms.length > 0 ? truthTable.filter(row => !row.output).map((_, i) => i).join(', ') : 'None'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Analysis Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{variables.length}</p>
            <p className="text-sm text-gray-600">Variables</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{truthTable.length}</p>
            <p className="text-sm text-gray-600">Total Rows</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{truthTable.filter(row => row.output).length}</p>
            <p className="text-sm text-gray-600">True Outputs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{truthTable.filter(row => !row.output).length}</p>
            <p className="text-sm text-gray-600">False Outputs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruthTable;