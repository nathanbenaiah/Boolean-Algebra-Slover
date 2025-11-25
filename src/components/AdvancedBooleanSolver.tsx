import React, { useState, useEffect } from 'react';
import { comprehensiveSimplify, type ComprehensiveResult } from '../utils/comprehensiveBooleanSolver';

interface Props {
  className?: string;
}

const SAMPLE_EXPRESSIONS = [
  {
    name: "XOR-XNOR Product (Complex Gate Problem)",
    expression: "(A ⊕ B) · (A ⊙ B)",
    expected: "0",
    explanation: "The product of XOR and XNOR gates always equals 0 because they are complements"
  },
  {
    name: "NAND-NOR-XOR-XNOR Tautology (All Gates)",
    expression: "(A ↑ B) + (A ↓ B) + (A ⊕ B) + (A ⊙ B)",
    expected: "1",
    explanation: "Combination of NAND, NOR, XOR, and XNOR covers all possible input combinations"
  },
  {
    name: "Complex De Morgan with Multiple Gates",
    expression: "((A ↑ B) + (C ⊕ D))'",
    expected: "(AB) · (C ⊙ D)",
    explanation: "De Morgan's law applied to complex gate combinations"
  },
  {
    name: "Advanced Absorption with XOR",
    expression: "A + (A ⊕ B) · A",
    expected: "A",
    explanation: "Advanced absorption law with XOR gates"
  },
  {
    name: "NAND-NOR Dual Expression",
    expression: "(A ↑ B) · (A ↓ B)",
    expected: "A' · B'",
    explanation: "NAND AND NOR combination simplifies to complement intersection"
  },
  {
    name: "Triple Gate Combination",
    expression: "(A ⊕ B) + (B ↑ C) + (A ↓ C)",
    expected: "Complex multi-gate expression",
    explanation: "XOR, NAND, and NOR gates in combination"
  },
  {
    name: "Basic Absorption Law",
    expression: "A + AB + ABC",
    expected: "A",
    explanation: "Absorption law cascade demonstration"
  },
  {
    name: "De Morgan's with NOT",
    expression: "(A + B)'",
    expected: "A' · B'",
    explanation: "De Morgan's law application"
  },
  {
    name: "XOR Expansion",
    expression: "A ⊕ B",
    expected: "A'B + AB'",
    explanation: "XOR gate expansion to basic gates"
  },
  {
    name: "XNOR Expansion",
    expression: "A ⊙ B",
    expected: "AB + A'B'",
    explanation: "XNOR gate expansion to basic gates"
  },
  {
    name: "Complex Complement Pattern",
    expression: "(A + B) · (A + B)'",
    expected: "0",
    explanation: "Complement law with OR expressions"
  },
  {
    name: "Advanced Distributive Law",
    expression: "A · (B + C) + A' · (B + C)",
    expected: "B + C",
    explanation: "Distributive law with complement terms"
  }
];

const GATE_SYMBOLS = {
  OR: 'A + B',
  AND: 'A · B or AB',
  NAND: 'A ↑ B or (AB)\'',
  NOR: 'A ↓ B or (A + B)\'',
  XOR: 'A ⊕ B',
  XNOR: 'A ⊙ B',
  NOT: 'A\''
};

const BOOLEAN_LAWS_REFERENCE = [
  {
    name: 'Identity',
    laws: ['A + 0 = A', 'A · 1 = A']
  },
  {
    name: 'Null',
    laws: ['A + 1 = 1', 'A · 0 = 0']
  },
  {
    name: 'Idempotent',
    laws: ['A + A = A', 'A · A = A']
  },
  {
    name: 'Complement',
    laws: ['A + A\' = 1', 'A · A\' = 0']
  },
  {
    name: 'De Morgan\'s',
    laws: ['(A + B)\' = A\' · B\'', '(A · B)\' = A\' + B\'']
  },
  {
    name: 'Absorption',
    laws: ['A + AB = A', 'A(A + B) = A']
  },
  {
    name: 'Distributive',
    laws: ['A(B + C) = AB + AC', 'A + BC = (A + B)(A + C)']
  }
];

export const AdvancedBooleanSolver: React.FC<Props> = ({ className = '' }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<ComprehensiveResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState('');

  const handleSimplify = async () => {
    if (!expression.trim()) {
      setError('Please enter a Boolean expression');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const simplificationResult = comprehensiveSimplify(expression);
      setResult(simplificationResult);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
      // Keep console.error for actual error handling
      console.error('Simplification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelect = (sampleExpression: string) => {
    setExpression(sampleExpression);
    setSelectedSample(sampleExpression);
    setResult(null);
    setError(null);
  };

  const renderTruthTable = () => {
    if (!result || !result.truthTable) return null;

    const variables = [...new Set(result.truthTable.flatMap(row => Object.keys(row.inputs)))].sort();
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Truth Table</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {variables.map(variable => (
                  <th key={variable} className="border border-gray-300 px-3 py-2 text-center font-semibold">
                    {variable}
                  </th>
                ))}
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold bg-blue-50">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {result.truthTable.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {variables.map(variable => (
                    <td key={variable} className="border border-gray-300 px-3 py-2 text-center">
                      {row.inputs[variable] ? '1' : '0'}
                    </td>
                  ))}
                  <td className={`border border-gray-300 px-3 py-2 text-center font-semibold ${
                    row.output ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {row.output ? '1' : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Total combinations: {result.truthTable.length}</p>
          <p>Variables: {variables.join(', ')}</p>
        </div>
      </div>
    );
  };

  const renderLogicCircuit = () => {
    if (!result || !result.logicCircuit) return null;
    
    const circuit = result.logicCircuit;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🔌 Logic Circuit</h3>
        
        {/* Circuit Overview */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-600 font-semibold">Total Gates</p>
            <p className="text-lg font-bold text-blue-800">{circuit.nodes.filter(n => n.type === 'gate').length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-600 font-semibold">Circuit Levels</p>
            <p className="text-lg font-bold text-green-800">{circuit.levels}</p>
          </div>
        </div>

        {/* Gate Types Used */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Gate Types Used:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(circuit.gateCount).map(([gateType, count]) => (
              <span key={gateType} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {gateType}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Circuit Diagram */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Logic Gate Diagram</h4>
          <p className="text-sm text-gray-600 mb-3">Expression: <span className="font-mono">{result.originalExpression}</span></p>
          
          {/* Simple text-based circuit representation */}
          <div className="bg-white p-4 rounded border font-mono text-sm">
            <div className="mb-3">
              <strong>Inputs:</strong> {circuit.inputs.join(', ')}
            </div>
            <div className="mb-3">
              <strong>Gates:</strong>
              <div className="ml-4 space-y-1">
                {circuit.nodes
                  .filter(node => node.type === 'gate')
                  .map(gate => (
                    <div key={gate.id} className="text-gray-700">
                      {gate.label} ({gate.gateType}) - Level {gate.level}
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <strong>Output:</strong> {circuit.outputs.join(', ')}
            </div>
          </div>
          
          {/* Note about visualization */}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-800">
              <strong>📋 Circuit Analysis:</strong> This circuit contains {circuit.nodes.length} nodes and {circuit.edges.length} connections.
              The circuit has a complexity score of {circuit.complexity}.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderKarnaughMap = () => {
    if (!result || !result.karnaughMap || result.karnaughMap.variables.length < 2 || result.karnaughMap.variables.length > 4) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">🗺️ Karnaugh Map</h3>
          <p className="text-gray-600">Karnaugh maps are only supported for 2-4 variables.</p>
        </div>
      );
    }

    const kmap = result.karnaughMap;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🗺️ Karnaugh Map</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Variables: {kmap.variables.join(', ')}</p>
          <p className="text-sm text-gray-600">Size: {kmap.cells.length}×{kmap.cells[0]?.length || 0}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="border-collapse border border-gray-300 mx-auto">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100"></th>
                {kmap.colLabels.map((label, index) => (
                  <th key={index} className="border border-gray-300 p-2 bg-gray-100 text-center min-w-12">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kmap.cells.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 p-2 bg-gray-100 text-center font-semibold">
                    {kmap.rowLabels[rowIndex]}
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className={`border border-gray-300 p-2 text-center font-semibold ${
                      cell.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cell.value ? '1' : '0'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {kmap.simplifiedSOP && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-semibold text-blue-800">Simplified SOP:</p>
            <p className="text-blue-700 font-mono">{kmap.simplifiedSOP}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSimplificationSteps = () => {
    if (!result) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">📝 Steps</h3>
          <p className="text-gray-500 text-center py-8">Enter a Boolean expression to see step-by-step simplification</p>
        </div>
      );
    }

    if (!result.steps || result.steps.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">📝 Steps</h3>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="text-gray-600 mb-1">Start</p>
              <p className="text-lg font-mono text-gray-800">{result.originalExpression}</p>
            </div>
            <div className="text-blue-600">
              <p className="font-medium">✅ Already in simplest form</p>
              <p className="text-sm text-gray-600">No further simplification possible</p>
            </div>
          </div>
        </div>
      );
    }

    // Format law names properly
    const formatLawName = (rule: string) => {
      const lawMappings: { [key: string]: string } = {
        'Identity Law': 'Identity Law',
        'Null Law': 'Null Law', 
        'Idempotent Law': 'Idempotent Law: AA = A',
        'Complement Law': 'Complement Law',
        'Absorption Law': 'Absorption Law: A+AB = A',
        'Distributive Law': 'Distribution',
        'De Morgan\'s Law': 'De Morgan\'s Law',
        'Associative Law': 'Associative Law',
        'Commutative Law': 'Commutative Law',
        'Consensus Law': 'Consensus Law',
        'XOR Expansion': 'XOR Expansion',
        'NAND Expansion': 'NAND Expansion',
        'NOR Expansion': 'NOR Expansion',
        'XNOR Expansion': 'XNOR Expansion',
        'Double Negation': 'Double Negation',
        'Advanced Pattern Recognition': 'Advanced Pattern Recognition',
        'Start': 'Start'
      };
      
      return lawMappings[rule] || rule;
    };

    const formatStepTitle = (rule: string, isFirst: boolean) => {
      if (isFirst || rule === 'Start') {
        return 'Start';
      }
      
      const lawName = formatLawName(rule);
      if (lawName.includes(':')) {
        return `Apply the ${lawName}`;
      } else {
        return `Apply: ${lawName}`;
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">📝 Steps</h3>
        
        <div className="space-y-4">
          {/* Start step */}
          <div className="border-b pb-3">
            <p className="text-gray-600 mb-1">Start</p>
            <p className="text-lg font-mono text-gray-800">{result.originalExpression}</p>
          </div>

          {/* Simplification steps */}
          {result.steps.map((step, index) => {
            // Skip if this is just the starting expression
            if (step.rule === 'Start' || step.expression === result.originalExpression) {
              return null;
            }

            return (
              <div key={index} className="border-b pb-3">
                <p className="text-gray-600 mb-1">
                  {formatStepTitle(step.rule, false)}
                </p>
                <p className="text-lg font-mono text-gray-800">{step.expression}</p>
                {step.description && (
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            );
          })}

          {/* Final result indicator if we have steps */}
          {result.steps.length > 0 && (
            <div className="mt-4 text-green-600">
              <p className="font-medium">✅ Simplification complete</p>
              <p className="text-sm text-gray-600">
                Final result: <span className="font-mono font-semibold">{result.simplifiedExpression}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`comprehensive-boolean-solver ${className}`}>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🧮 Comprehensive Boolean Algebra Solver
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-gray-600 mb-4">
            Advanced Boolean expression simplifier supporting all gate types with step-by-step solutions,
            truth tables, and Karnaugh maps.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🚪 Supported Gates:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(GATE_SYMBOLS).map(([gate, symbol]) => (
                <div key={gate} className="text-yellow-700">
                  <strong>{gate}:</strong> {symbol}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Expressions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📝 Sample Expressions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_EXPRESSIONS.map((sample, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                <h4 className="font-semibold text-gray-800 mb-2">{sample.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{sample.explanation}</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">{sample.expression}</p>
                <p className="text-xs text-green-600 mb-3">Expected: {sample.expected}</p>
                <button
                  onClick={() => handleSampleSelect(sample.expression)}
                  className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Try This Expression
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">🔍 Expression Input</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="expression" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Boolean Expression:
              </label>
              <input
                id="expression"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., (A + B) · (A + B)' + (A'B + AB') · (AB + A'B')"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleSimplify()}
              />
            </div>
            <button
              onClick={handleSimplify}
              disabled={isLoading || !expression.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? '🔄 Simplifying...' : '⚡ Simplify Expression'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📋 Simplification Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Original Expression:</p>
                  <p className="font-mono bg-gray-100 p-3 rounded">{result.originalExpression}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Simplified Expression:</p>
                  <p className="font-mono bg-green-100 p-3 rounded text-green-800 font-semibold">
                    {result.simplifiedExpression}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold">Complexity Reduction</p>
                  <p className="text-2xl font-bold text-blue-800">{result.complexity.reduction}%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-semibold">Steps Applied</p>
                  <p className="text-2xl font-bold text-green-800">{result.steps.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-semibold">Laws Used</p>
                  <p className="text-2xl font-bold text-purple-800">{result.lawsApplied.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-semibold">Gates Detected</p>
                  <p className="text-2xl font-bold text-orange-800">{result.gatesUsed.length}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Boolean Laws Applied:</p>
                <div className="flex flex-wrap gap-2">
                  {result.lawsApplied.map((law, index) => (
                    <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {law}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Gates Used:</p>
                <div className="flex flex-wrap gap-2">
                  {result.gatesUsed.map((gate, index) => (
                    <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                      {gate}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {renderSimplificationSteps()}
              {renderTruthTable()}
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {renderKarnaughMap()}
              {renderLogicCircuit()}
            </div>
            
            {/* Boolean Laws Reference */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📚 Boolean Laws Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BOOLEAN_LAWS_REFERENCE.map((lawGroup, index) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-4">
                    <h4 className="font-semibold text-gray-800">{lawGroup.name} Law</h4>
                    {lawGroup.laws.map((law, lawIndex) => (
                      <p key={lawIndex} className="text-sm text-gray-600 font-mono">{law}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedBooleanSolver; 