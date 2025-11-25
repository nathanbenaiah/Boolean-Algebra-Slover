import React, { useState } from 'react';
import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { BOOLEAN_RULE_EXAMPLES } from '../utils/testCases';

const ExamplesShowcase: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState('idempotent');
  const [currentExample, setCurrentExample] = useState(0);

  const ruleCategories = {
    identity: { name: "Identity Laws", color: "blue", icon: "🔢" },
    null: { name: "Null Laws", color: "red", icon: "🚫" },
    idempotent: { name: "Idempotent Laws", color: "green", icon: "🔄" },
    complement: { name: "Complement Laws", color: "purple", icon: "⚡" },
    commutative: { name: "Commutative Laws", color: "orange", icon: "🔄" },
    associative: { name: "Associative Laws", color: "pink", icon: "📐" },
    distributive: { name: "Distributive Laws", color: "cyan", icon: "📊" },
    absorption: { name: "Absorption Laws", color: "yellow", icon: "🧽" },
    demorgan: { name: "De Morgan's Laws", color: "indigo", icon: "🔀" }
  };

  const currentExamples = BOOLEAN_RULE_EXAMPLES[selectedRule];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="mr-3 text-blue-600" />
          Boolean Algebra Rules Explorer
        </h2>
        <p className="text-gray-600">
          Explore all 9 fundamental Boolean algebra rules with interactive examples
        </p>
      </div>

      {/* Rule Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(ruleCategories).map(([key, rule]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedRule(key);
              setCurrentExample(0);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedRule === key
                ? `border-${rule.color}-500 bg-${rule.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{rule.icon}</div>
            <div className={`font-semibold ${
              selectedRule === key ? `text-${rule.color}-800` : 'text-gray-700'
            }`}>
              {rule.name}
            </div>
          </button>
        ))}
      </div>

      {/* Current Example Display */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {ruleCategories[selectedRule].name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Example {currentExample + 1} of {currentExamples.length}
            </span>
            <button
              onClick={() => setCurrentExample((prev) => 
                prev < currentExamples.length - 1 ? prev + 1 : 0
              )}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Input */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2">Input Expression</h4>
            <div className="text-2xl font-mono text-blue-900">
              {currentExamples[currentExample].input}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="text-4xl text-gray-400">→</div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">Simplified Result</h4>
            <div className="text-2xl font-mono text-green-900">
              {currentExamples[currentExample].expected}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">
            <strong>Rule:</strong> {currentExamples[currentExample].description}
          </p>
        </div>
      </div>

      {/* All Examples Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {currentExamples.map((example, index) => (
          <div
            key={index}
            onClick={() => setCurrentExample(index)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              currentExample === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg">{example.input}</span>
              <span className="text-gray-400">→</span>
              <span className="font-mono text-lg text-green-600">{example.expected}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{example.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesShowcase; 