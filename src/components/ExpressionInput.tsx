import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle, Lightbulb, Smartphone } from 'lucide-react';

interface ExpressionInputProps {
  expression: string;
  onChange: (expression: string) => void;
}

const ExpressionInput: React.FC<ExpressionInputProps> = ({ expression, onChange }) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [complexity, setComplexity] = useState<'Basic' | 'Intermediate' | 'Advanced'>('Basic');
  const inputRef = useRef<HTMLInputElement>(null);

  // Advanced validation with context-aware error messages
  const validateExpression = (expr: string) => {
    if (!expr.trim()) {
      setIsValid(true);
      setErrorMessage('');
      setSuggestions([]);
      return;
    }

    // Calculate complexity
    const variableCount = new Set(expr.match(/[A-Z]/g) || []).size;
    const operatorCount = (expr.match(/[+'·()]/g) || []).length;
    
    if (variableCount <= 2 && operatorCount <= 3) setComplexity('Basic');
    else if (variableCount <= 4 && operatorCount <= 8) setComplexity('Intermediate');
    else setComplexity('Advanced');

    // Enhanced validation patterns - support all logic gates
    const validPattern = /^[A-Z'̄()+·*↑↓⊕⊙\s]*$/;
    
    if (!validPattern.test(expr)) {
      setIsValid(false);
      setErrorMessage('Invalid characters detected. Use variables A-Z, operators +, ·, \', and parentheses');
      generateSuggestions(expr);
      return;
    }

    // Advanced parentheses validation
    let parenCount = 0;
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of expr) {
      if (char === '(') {
        parenCount++;
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      if (char === ')') {
        parenCount--;
        currentDepth--;
        if (parenCount < 0) {
          setIsValid(false);
          setErrorMessage('Unbalanced parentheses: Too many closing brackets');
          setSuggestions(['Check your parentheses placement', 'Every ( needs a matching )']);
          return;
        }
      }
    }

    if (parenCount !== 0) {
      setIsValid(false);
      setErrorMessage(`Unbalanced parentheses: ${parenCount > 0 ? 'Missing closing' : 'Extra closing'} brackets`);
      setSuggestions(['Balance your parentheses', 'Every ( needs a matching )']);
      return;
    }

    // Advanced operator validation
    if (/\+\+|\.\.|''|[+·]\s*[+·]/.test(expr)) {
      setIsValid(false);
      setErrorMessage('Invalid operator sequence detected');
      setSuggestions(['Remove duplicate operators', 'Use single operators between variables']);
      return;
    }

    // Check for empty parentheses
    if (/\(\s*\)/.test(expr)) {
      setIsValid(false);
      setErrorMessage('Empty parentheses are not allowed');
      setSuggestions(['Remove empty ()', 'Put expressions inside parentheses']);
      return;
    }

    // Advanced pattern suggestions
    generateAdvancedSuggestions(expr);
    setIsValid(true);
    setErrorMessage('');
  };

  const generateSuggestions = (expr: string) => {
    const suggestions = [];
    
    // Common mistake patterns and gate suggestions
    if (expr.includes('*')) {
      suggestions.push('Replace * with · for AND operation');
    }
    if (expr.includes('!')) {
      suggestions.push('Replace ! with \' for NOT operation');
    }
    if (expr.includes('&')) {
      suggestions.push('Replace & with · for AND operation');
    }
    if (expr.includes('|')) {
      suggestions.push('Replace | with + for OR operation');
    }
    if (expr.includes('NAND')) {
      suggestions.push('Use ↑ symbol for NAND gate (A↑B)');
    }
    if (expr.includes('NOR')) {
      suggestions.push('Use ↓ symbol for NOR gate (A↓B)');
    }
    if (expr.includes('XOR')) {
      suggestions.push('Use ⊕ symbol for XOR gate (A⊕B)');
    }
    if (expr.includes('XNOR')) {
      suggestions.push('Use ⊙ symbol for XNOR gate (A⊙B)');
    }
    if (/[a-z]/.test(expr)) {
      suggestions.push('Use uppercase letters for variables (A, B, C, etc.)');
    }
    
    setSuggestions(suggestions);
  };

  const generateAdvancedSuggestions = (expr: string) => {
    const suggestions = [];
    const variableCount = new Set(expr.match(/[A-Z]/g) || []).size;
    
    // Smart suggestions based on expression analysis
    if (expr.includes('A + A\'') || expr.includes('A\' + A')) {
      suggestions.push('A + A\' = 1 (Complement Law)');
    }
    if (expr.includes('A · A\'') || expr.includes('A\' · A') || expr.includes('AA\'') || expr.includes('A\'A')) {
      suggestions.push('A · A\' = 0 (Complement Law)');
    }
    if (expr.includes('A + A') && !expr.includes('A\'')) {
      suggestions.push('A + A = A (Idempotent Law)');
    }
    if (expr.includes('A · A') || expr.includes('AA')) {
      suggestions.push('A · A = A (Idempotent Law)');
    }
    if (variableCount >= 3) {
      suggestions.push('Try K-Map for visual simplification');
    }
    if (expr.length > 10 || (expr.match(/[+·]/g) || []).length > 3) {
      suggestions.push('This looks complex - check simplification steps');
    }
    
    setSuggestions(suggestions);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
    validateExpression(value);
    setShowSuggestions(true);
  };

  const insertSymbol = (symbol: string) => {
    const input = inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = expression.substring(0, start) + symbol + expression.substring(end);
    onChange(newValue);
    validateExpression(newValue);
    
    // Restore cursor position with haptic feedback on mobile
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + symbol.length, start + symbol.length);
      
      // Haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }, 0);
  };

  const quickInserts = [
    { symbol: '\'', label: 'NOT (\')', description: 'Negation using apostrophe', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    { symbol: '·', label: 'AND (·)', description: 'Product/conjunction', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
    { symbol: '+', label: 'OR (+)', description: 'Sum/disjunction', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800' },
    { symbol: '↑', label: 'NAND (↑)', description: 'NOT AND gate', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
    { symbol: '↓', label: 'NOR (↓)', description: 'NOT OR gate', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800' },
    { symbol: '⊕', label: 'XOR (⊕)', description: 'Exclusive OR gate', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
    { symbol: '⊙', label: 'XNOR (⊙)', description: 'Exclusive NOR gate', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800' },
    { symbol: '(', label: '(', description: 'Open parenthesis', color: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { symbol: ')', label: ')', description: 'Close parenthesis', color: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
  ];

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Basic': return 'text-blue-600 bg-blue-100';
      case 'Intermediate': return 'text-blue-700 bg-blue-200';
      case 'Advanced': return 'text-blue-800 bg-blue-300';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Input Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="expression-input" className="block text-sm font-medium text-blue-700">
            Boolean Expression
          </label>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-blue-500" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(complexity)}`}>
              {complexity}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <input
            ref={inputRef}
            id="expression-input"
            type="text"
            value={expression}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter Boolean expression (e.g., AB + A'C)"
            className={`w-full px-4 py-4 text-lg font-mono border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-200 ${
              isValid 
                ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                : 'border-red-300 focus:border-red-500 focus:ring-red-500'
            } touch-manipulation`}
            style={{ fontSize: '18px' }} // Prevents zoom on iOS
          />
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              expression.trim() && <CheckCircle className="text-blue-500" size={24} />
            ) : (
              <AlertCircle className="text-red-500" size={24} />
            )}
          </div>
        </div>

        {/* Error Message with Advanced Feedback */}
        {!isValid && errorMessage && (
          <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-start">
              <AlertCircle size={20} className="mr-3 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">{errorMessage}</p>
                {suggestions.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Suggestions */}
        {isValid && suggestions.length > 0 && showSuggestions && (
          <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
            <div className="flex items-start">
              <Lightbulb size={20} className="mr-3 flex-shrink-0 text-blue-500 mt-0.5" />
              <div>
                <p className="text-blue-700 font-medium mb-2">Optimization Tips:</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Quick Insert Buttons */}
      <div>
        <p className="text-sm font-medium text-blue-700 mb-3">Quick Insert (Touch-Optimized):</p>
        <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {quickInserts.map((item) => (
            <button
              key={item.symbol}
              onClick={() => insertSymbol(item.symbol)}
              className={`px-4 py-3 text-sm font-medium rounded-xl border-2 border-blue-300 transition-all duration-200 transform active:scale-95 hover:shadow-lg ${item.color} touch-manipulation`}
              title={item.description}
              style={{ minHeight: '48px' }} // Touch-friendly minimum size
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpressionInput;