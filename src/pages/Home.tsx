import React, { useState } from 'react';
import { Calculator, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExpressionInput from '../components/ExpressionInput';
import TruthTable from '../components/TruthTable';
import SimplificationSteps from '../components/SimplificationSteps';
import KarnaughMap from '../components/KarnaughMap';
import LogicGates from '../components/LogicGates';

// Import our comprehensive Boolean algebra functions
import { comprehensiveSimplify, type ComprehensiveResult } from '../utils/comprehensiveBooleanSolver';

const Home: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [results, setResults] = useState<ComprehensiveResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExpressionChange = (newExpression: string) => {
    setExpression(newExpression);
    
    if (newExpression.trim()) {
      setIsProcessing(true);
      try {
        // Use comprehensive processing with advanced Boolean laws
        const result = comprehensiveSimplify(newExpression);
        setResults(result);
      } catch (error) {
        console.error('Processing error:', error);
        setResults(null);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setResults(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-full">
              <Calculator className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Boolean Algebra
            <span className="block text-blue-600">Solver</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced Boolean expression simplification with step-by-step solutions
          </p>
          
          {/* Quick Guide Link */}
          <div className="mb-8">
            <Link 
              to="/guide"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Need help? View Complete Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          {/* Expression Input */}
          <div className="max-w-4xl mx-auto mb-8">
            <ExpressionInput 
              expression={expression} 
              onChange={handleExpressionChange} 
            />
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600 font-medium">Processing expression...</span>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {results && !isProcessing && (
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Simplification Steps */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Simplification Steps
                </h2>
                <SimplificationSteps 
                  steps={results.steps} 
                  expression={expression} 
                  lawsApplied={results.lawsApplied}
                  complexity={results.complexity}
                />
              </div>

              {/* Truth Table */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Truth Table
                </h2>
                <TruthTable 
                  truthTable={results.truthTable || []} 
                  expression={expression}
                />
              </div>

              {/* Karnaugh Map */}
              {results.karnaughMap && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Karnaugh Map
                  </h2>
                  <KarnaughMap kMap={results.karnaughMap} expression={expression} />
                </div>
              )}

              {/* Logic Circuit */}
              {results.logicCircuit && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Logic Circuit
                  </h2>
                  <LogicGates 
                    parsedExpression={results.parsed}
                    expression={expression}
                    logicCircuit={results.logicCircuit}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 