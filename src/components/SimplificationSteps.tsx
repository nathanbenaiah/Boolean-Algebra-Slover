import React from 'react';
import { ArrowRight, Book } from 'lucide-react';

interface SimplificationStep {
  expression: string;
  rule: string;
  description: string;
}

interface SimplificationStepsProps {
  expression: string;
  steps: SimplificationStep[];
  lawsApplied?: string[];
  complexity?: {
    original: number;
    simplified: number;
    reduction: number;
  };
}

const SimplificationSteps: React.FC<SimplificationStepsProps> = ({ expression, steps, lawsApplied, complexity }) => {
  // Boolean Laws Reference
  const booleanLaws = {
    'Identity Law': { formula: 'A + 0 = A, A · 1 = A', description: 'Adding 0 or multiplying by 1 leaves the variable unchanged' },
    'Null Law': { formula: 'A + 1 = 1, A · 0 = 0', description: 'Adding 1 always gives 1, multiplying by 0 always gives 0' },
    'Idempotent Law': { formula: 'A + A = A, A · A = A', description: 'A variable combined with itself remains unchanged' },
    'Complement Law': { formula: 'A + A\' = 1, A · A\' = 0', description: 'A variable combined with its complement gives 1 (OR) or 0 (AND)' },
    'Commutative Law': { formula: 'A + B = B + A, A · B = B · A', description: 'Order of variables doesn\'t matter in OR/AND operations' },
    'Associative Law': { formula: '(A + B) + C = A + (B + C)', description: 'Grouping doesn\'t affect the result' },
    'Distributive Law': { formula: 'A · (B + C) = A · B + A · C', description: 'AND distributes over OR, and vice versa' },
    'De Morgan\'s Law': { formula: '(A + B)\' = A\' · B\', (A · B)\' = A\' + B\'', description: 'Complement of OR/AND becomes AND/OR of complements' },
    'Absorption Law': { formula: 'A + A · B = A, A · (A + B) = A', description: 'A variable absorbs terms containing itself' },
    'Consensus Law': { formula: 'A · B + A\' · C + B · C = A · B + A\' · C', description: 'Redundant terms can be eliminated' },
    'Double Negation': { formula: '(A\')\' = A', description: 'Double complement returns the original variable' },
    'NAND Identity': { formula: 'A ↑ B = (A · B)\'', description: 'NAND is the complement of AND' },
    'NOR Identity': { formula: 'A ↓ B = (A + B)\'', description: 'NOR is the complement of OR' },
    'XOR Identity': { formula: 'A ⊕ B = A\' · B + A · B\'', description: 'XOR is true when inputs differ' },
    'XNOR Identity': { formula: 'A ⊙ B = A · B + A\' · B\'', description: 'XNOR is true when inputs are the same' }
  };

  if (!expression.trim()) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Book className="mx-auto text-blue-400 mb-4" size={48} />
          <p className="text-blue-500">Enter a Boolean expression to see step-by-step simplification</p>
        </div>
        
        {/* Boolean Laws Reference */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
            <Book className="w-5 h-5 mr-2" />
            Boolean Algebra Laws Reference
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(booleanLaws).map(([lawName, lawInfo]) => (
              <div key={lawName} className="bg-white rounded-lg p-4 border border-blue-100">
                <h5 className="font-medium text-blue-900 mb-2">{lawName}</h5>
                <p className="font-mono text-sm text-blue-700 mb-2">{lawInfo.formula}</p>
                <p className="text-xs text-blue-600">{lawInfo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Use the steps from the enhanced boolean algebra utility
  const enhancedSteps = steps;

  return (
    <div>
      <h3 className="text-xl font-semibold text-blue-800 mb-6">Step-by-Step Simplification</h3>
      
      {enhancedSteps.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-blue-800">Already Simplified!</h4>
              <p className="text-blue-700 mt-1">
                The expression "<span className="font-mono bg-blue-100 px-2 py-1 rounded">{expression}</span>" is already in its simplest form.
              </p>
              <div className="mt-3 text-sm text-blue-600">
                <p><strong>What this means:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>No further reduction is possible using Boolean algebra laws</li>
                  <li>All terms are essential (cannot be eliminated)</li>
                  <li>This is the minimal form of your expression</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Simplification Steps */}
          {enhancedSteps.map((step, index) => (
            <div key={index}>
              {index > 0 && (
                <div className="flex items-center justify-center mb-4">
                  <ArrowRight className="text-blue-400" size={24} />
                </div>
              )}
              
              <div className={`border-l-4 rounded-lg p-6 ${
                step.rule === 'Start' 
                  ? 'bg-blue-50 border-blue-500' 
                  : step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                    ? 'bg-green-50 border-green-500'
                  : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                    ? 'bg-red-50 border-red-500'
                  : index === enhancedSteps.length - 1
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-blue-300 shadow-sm'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.rule === 'Start'
                        ? 'bg-blue-500'
                        : step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                          ? 'bg-green-500'
                        : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                          ? 'bg-red-500'
                        : index === enhancedSteps.length - 1
                          ? 'bg-green-500'
                          : 'bg-blue-400'
                    }`}>
                      {index === enhancedSteps.length - 1 ? (
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className={`text-lg font-medium mb-2 ${
                      step.rule === 'Start'
                        ? 'text-blue-800'
                        : step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                          ? 'text-green-800'
                        : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                          ? 'text-red-800'
                        : index === enhancedSteps.length - 1
                          ? 'text-green-800'
                          : 'text-blue-800'
                    }`}>
                      {step.rule === 'Start' 
                        ? 'Original Expression'
                        : step.rule === 'Tautology Detection'
                          ? '🎉 Tautology Detected!'
                        : step.rule === 'Tautology Reached'
                          ? '🎉 Simplified to Tautology!'
                        : step.rule === 'Contradiction Detection'
                          ? '⚠️ Contradiction Detected!'
                        : step.rule === 'Contradiction Reached'
                          ? '⚠️ Simplified to Contradiction!'
                        : index === enhancedSteps.length - 1
                          ? 'Final Simplified Expression'
                          : `Apply: ${step.rule}`
                      }
                    </h4>
                    <p className={`text-2xl font-mono mb-3 px-3 py-2 rounded border ${
                      step.rule === 'Start'
                        ? 'text-blue-900 bg-white'
                        : step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                          ? 'text-green-900 bg-white border-green-300'
                        : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                          ? 'text-red-900 bg-white border-red-300'
                        : index === enhancedSteps.length - 1
                          ? 'text-green-900 bg-white'
                          : 'text-gray-800 bg-blue-50'
                    }`}>
                      {step.expression}
                    </p>
                    {step.description && step.rule !== 'Start' && (
                                              <div className={`rounded-lg p-3 ${
                        step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                          ? 'bg-green-100'
                        : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                          ? 'bg-red-100'
                        : index === enhancedSteps.length - 1
                          ? 'bg-green-100'
                          : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${
                          step.rule === 'Tautology Detection' || step.rule === 'Tautology Reached'
                            ? 'text-green-700'
                          : step.rule === 'Contradiction Detection' || step.rule === 'Contradiction Reached'
                            ? 'text-red-700'
                          : index === enhancedSteps.length - 1
                            ? 'text-green-700'
                            : 'text-blue-700'
                        }`}>
                          <strong>
                            {index === enhancedSteps.length - 1
                              ? 'Result:'
                              : 'Rule Explanation:'
                            }
                          </strong> {
                            index === enhancedSteps.length - 1
                              ? 'This is the most simplified form of your Boolean expression.'
                              : step.description
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complexity and Laws Applied Summary */}
      {(complexity || lawsApplied) && enhancedSteps.length > 1 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complexity Analysis */}
          {complexity && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Complexity Analysis
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Original Complexity:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded text-blue-900">{complexity.original}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Simplified Complexity:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded text-blue-900">{complexity.simplified}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Reduction:</span>
                  <span className={`font-bold px-2 py-1 rounded ${
                    complexity.reduction > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {complexity.reduction}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Boolean Laws Applied */}
          {lawsApplied && lawsApplied.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Boolean Laws Applied
              </h4>
              <div className="space-y-2">
                {lawsApplied.map((law, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <span className="text-green-700 font-medium">{law}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimplificationSteps;