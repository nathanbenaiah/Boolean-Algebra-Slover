import React, { useState } from 'react';
import { Binary, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NumberConversionResult {
  decimal?: string;
  binary?: string;
  octal?: string;
  hexadecimal?: string;
  error?: string;
}

const NumberSystemPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState('10');
  const [results, setResults] = useState<NumberConversionResult | null>(null);

  const convertNumber = (value: string, fromBase: string) => {
    if (!value.trim()) {
      setResults(null);
      return;
    }

    try {
      const decimal = parseInt(value, parseInt(fromBase));
      if (isNaN(decimal)) {
        setResults({ error: 'Invalid number for selected base' });
        return;
      }

      setResults({
        decimal: decimal.toString(10),
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        hexadecimal: decimal.toString(16).toUpperCase()
      });
    } catch (error) {
      setResults({ error: 'Invalid input' });
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    convertNumber(value, inputBase);
  };

  const handleBaseChange = (base: string) => {
    setInputBase(base);
    convertNumber(inputValue, base);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-purple-600 rounded-full">
              <Binary className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Number System
            <span className="block text-purple-600">Converter</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Convert between Binary, Decimal, Octal, and Hexadecimal
          </p>
          
          {/* Quick Guide Link */}
          <Link 
            to="/guide"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Learn about Number Systems
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>

        {/* Converter */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Number:
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter a number..."
              />
              <select
                value={inputBase}
                onChange={(e) => handleBaseChange(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="2">Binary (Base 2)</option>
                <option value="8">Octal (Base 8)</option>
                <option value="10">Decimal (Base 10)</option>
                <option value="16">Hexadecimal (Base 16)</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {results && !results.error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Binary</h3>
                <p className="text-blue-600 font-mono text-lg">{results.binary}</p>
                <span className="text-xs text-blue-500">Base 2</span>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Octal</h3>
                <p className="text-green-600 font-mono text-lg">{results.octal}</p>
                <span className="text-xs text-green-500">Base 8</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Decimal</h3>
                <p className="text-purple-600 font-mono text-lg">{results.decimal}</p>
                <span className="text-xs text-purple-500">Base 10</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Hexadecimal</h3>
                <p className="text-orange-600 font-mono text-lg">{results.hexadecimal}</p>
                <span className="text-xs text-orange-500">Base 16</span>
              </div>
            </div>
          )}

          {results?.error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-600">{results.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberSystemPage; 