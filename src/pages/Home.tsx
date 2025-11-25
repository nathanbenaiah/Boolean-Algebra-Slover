import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, BookOpen, Server, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExpressionInput from '../components/ExpressionInput';
import TruthTable from '../components/TruthTable';
import SimplificationSteps from '../components/SimplificationSteps';
import KarnaughMap from '../components/KarnaughMap';
import LogicGates from '../components/LogicGates';

// Import our comprehensive Boolean algebra functions
import { comprehensiveSimplify, type ComprehensiveResult } from '../utils/comprehensiveBooleanSolver';
import { processExpression, checkBackendHealth } from '../services/api';

const Home: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [results, setResults] = useState<ComprehensiveResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check backend availability on mount
  useEffect(() => {
    checkBackendHealth().then(available => {
      setBackendAvailable(available);
      setUseBackend(available);
    });
  }, []);

  const handleExpressionChange = async (newExpression: string) => {
    setExpression(newExpression);
    setError(null);
    
    if (newExpression.trim()) {
      setIsProcessing(true);
      try {
        let result: ComprehensiveResult;
        
        if (useBackend && backendAvailable) {
          // Try backend first
          const apiResponse = await processExpression(newExpression);
          
          if (apiResponse.error) {
            throw new Error(apiResponse.error.message || 'Backend processing failed');
          }
          
          if (apiResponse.data) {
            // Convert backend response to ComprehensiveResult format
            const backendData = apiResponse.data;
            result = {
              originalExpression: backendData.original || newExpression,
              simplifiedExpression: backendData.simplified?.simplifiedExpression || backendData.simplified?.simplified || newExpression,
              steps: backendData.simplified?.steps?.map((step: any, index: number) => ({
                step: index + 1,
                expression: step.expression || step.after || '',
                rule: step.rule || 'Unknown',
                description: step.description || '',
                lawApplied: step.rule || 'Unknown',
                beforeExpression: step.before || '',
                afterExpression: step.after || step.expression || ''
              })) || [],
              truthTable: backendData.truthTable?.table?.map((row: any) => ({
                inputs: row.inputs || {},
                output: row.output || false,
                minterm: row.minterm,
                maxterm: row.maxterm
              })) || [],
              karnaughMap: backendData.karnaughMap?.karnaughMap || null,
              logicCircuit: backendData.logicCircuit?.circuit ? {
                nodes: backendData.logicCircuit.circuit.gates || [],
                edges: backendData.logicCircuit.circuit.connections || [],
                inputs: backendData.parsed?.variables || [],
                outputs: ['Y'],
                levels: backendData.logicCircuit.circuit.optimization?.depth || 0,
                gateCount: {},
                complexity: backendData.logicCircuit.circuit.optimization?.complexity || 0
              } : null,
              lawsApplied: backendData.simplified?.rules || [],
              complexity: {
                original: newExpression.length,
                simplified: (backendData.simplified?.simplifiedExpression || backendData.simplified?.simplified || '').length,
                reduction: backendData.simplified?.metadata?.reductionPercentage || 0
              },
              gatesUsed: [],
              visualizations: {}
            };
          } else {
            throw new Error('No data received from backend');
          }
        } else {
          // Use client-side processing
          result = comprehensiveSimplify(newExpression);
        }
        
        setResults(result);
      } catch (error) {
        console.error('Processing error:', error);
        setError(error instanceof Error ? error.message : 'Failed to process expression');
        setResults(null);
        
        // Fallback to client-side if backend fails
        if (useBackend && backendAvailable) {
          try {
            const fallbackResult = comprehensiveSimplify(newExpression);
            setResults(fallbackResult);
            setError('Backend unavailable, using client-side processing');
          } catch (fallbackError) {
            setError('Both backend and client-side processing failed');
          }
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      setResults(null);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-full">
              <Calculator className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Boolean Algebra
            <span className="block text-blue-600">Solver</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8">
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
          
          {/* Backend Toggle */}
          {backendAvailable && (
            <div className="mb-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {useBackend ? (
                    <Server className="w-5 h-5 text-green-600" />
                  ) : (
                    <Monitor className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Processing Mode: {useBackend ? 'Backend Server' : 'Client-Side'}
                  </span>
                </div>
                <button
                  onClick={() => setUseBackend(!useBackend)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    useBackend
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {useBackend ? 'Switch to Client-Side' : 'Switch to Backend'}
                </button>
              </div>
            </div>
          )}

          {/* Expression Input */}
          <div className="mb-6 sm:mb-8">
            <ExpressionInput 
              expression={expression} 
              onChange={handleExpressionChange} 
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-yellow-800 font-medium mb-1">Processing Notice</p>
                    <p className="text-yellow-700 text-sm">{error}</p>
                    {error.includes('Backend unavailable') && (
                      <button
                        onClick={() => {
                          setUseBackend(false);
                          setError(null);
                          if (expression.trim()) {
                            handleExpressionChange(expression);
                          }
                        }}
                        className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                      >
                        Continue with client-side processing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-300">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-blue-600 font-semibold text-base sm:text-lg text-center">
                    Processing expression{useBackend && backendAvailable ? ' (Backend)' : ' (Client-Side)'}...
                  </p>
                  <p className="text-gray-500 text-sm mt-2 text-center">
                    Analyzing Boolean expression and generating results
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {results && !isProcessing && (
        <section className="pb-8 sm:pb-12">
          <div>
            {/* Success Message */}
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 font-medium text-sm sm:text-base">
                  Expression processed successfully! Complexity reduced by {results.complexity.reduction}%.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Simplification Steps */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
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
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Truth Table
                </h2>
                <TruthTable 
                  truthTable={results.truthTable || []} 
                  expression={expression}
                />
              </div>

              {/* Karnaugh Map */}
              {results.karnaughMap && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Karnaugh Map
                  </h2>
                  <KarnaughMap kMap={results.karnaughMap} expression={expression} />
                </div>
              )}

              {/* Logic Circuit */}
              {results.logicCircuit && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
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