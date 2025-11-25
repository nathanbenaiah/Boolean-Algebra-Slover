import React from 'react';
import { Zap, Calculator, Binary, Grid3X3, Brain, TrendingUp, Shield, Smartphone } from 'lucide-react';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-purple-600 rounded-full">
              <Zap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-600">
            Professional-grade Boolean algebra tools with advanced algorithms
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Boolean Algebra Solver */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Calculator className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Boolean Algebra Solver</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Advanced expression simplification with step-by-step explanations using multiple algorithms.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Multiple notation support (A', Ā, NOT A)</li>
              <li>• Step-by-step simplification</li>
              <li>• Boolean law explanations</li>
              <li>• Truth table generation</li>
              <li>• SOP/POS conversion</li>
            </ul>
          </div>

          {/* Number System Converter */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Binary className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Number Systems</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Convert between Binary, Decimal, Octal, and Hexadecimal number systems instantly.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Real-time conversion</li>
              <li>• All major number bases</li>
              <li>• Input validation</li>
              <li>• Clear visual display</li>
              <li>• Educational explanations</li>
            </ul>
          </div>

          {/* Karnaugh Map Tool */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Grid3X3 className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">K-Map Simplifier</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Interactive Karnaugh Map tool for visual Boolean expression minimization.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 2-4 variable support</li>
              <li>• Click-to-toggle interface</li>
              <li>• Automatic grouping detection</li>
              <li>• Visual simplification</li>
              <li>• Expression generation</li>
            </ul>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Advanced Capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Intelligent Algorithm Selection</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Simple Expressions</h4>
                  <p className="text-indigo-600 text-sm">Basic Boolean laws for quick results</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Medium Complexity</h4>
                  <p className="text-indigo-600 text-sm">De Morgan's laws + absorption rules</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Complex Expressions</h4>
                  <p className="text-indigo-600 text-sm">Quine-McCluskey algorithm for optimal minimization</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Analysis & Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800">Truth Table Analysis</h4>
                  <p className="text-green-600 text-sm">Minterms, maxterms, and satisfiability analysis</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800">Expression Complexity</h4>
                  <p className="text-green-600 text-sm">Automatic complexity classification and metrics</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800">Logic Circuit Generation</h4>
                  <p className="text-green-600 text-sm">Visual logic gate diagrams from expressions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Backend API Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Expression Processing</h4>
              <p className="text-blue-600 text-sm">Complete Boolean expression analysis with multiple algorithms</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">SAT Solving</h4>
              <p className="text-blue-600 text-sm">Boolean satisfiability solving with DPLL algorithm</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Batch Processing</h4>
              <p className="text-blue-600 text-sm">Process multiple expressions simultaneously</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Advanced Minimization</h4>
              <p className="text-blue-600 text-sm">Compare different minimization algorithms</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Export Formats</h4>
              <p className="text-blue-600 text-sm">CSV, JSON, LaTeX, and HTML output formats</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">RESTful API</h4>
              <p className="text-blue-600 text-sm">Clean REST endpoints for integration</p>
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Security & Performance</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Rate limiting protection</li>
              <li>• Input validation and sanitization</li>
              <li>• CORS and helmet security</li>
              <li>• Compression optimization</li>
              <li>• Error handling and logging</li>
              <li>• Production-ready architecture</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Smartphone className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">User Experience</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Responsive design for all devices</li>
              <li>• Real-time expression validation</li>
              <li>• Interactive visualizations</li>
              <li>• Intuitive user interface</li>
              <li>• Fast processing and feedback</li>
              <li>• Comprehensive error messages</li>
            </ul>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-8 mt-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">API Endpoints</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/process-expression</code>
                <p className="text-gray-300 text-sm mt-1">Complete Boolean expression analysis</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/simplify</code>
                <p className="text-gray-300 text-sm mt-1">Advanced expression simplification</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/truth-table</code>
                <p className="text-gray-300 text-sm mt-1">Truth table generation</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/karnaugh-map</code>
                <p className="text-gray-300 text-sm mt-1">K-map generation and simplification</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/logic-circuit</code>
                <p className="text-gray-300 text-sm mt-1">Logic gate circuit generation</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/sat-solve</code>
                <p className="text-gray-300 text-sm mt-1">Boolean satisfiability solving</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/convert</code>
                <p className="text-gray-300 text-sm mt-1">SOP/POS form conversion</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <code className="text-green-400">POST /api/batch-process</code>
                <p className="text-gray-300 text-sm mt-1">Batch expression processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 