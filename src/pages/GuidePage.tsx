import React from 'react';
import { BookOpen, Calculator, Binary, Grid3X3, Lightbulb } from 'lucide-react';

const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-600 rounded-full">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Complete Guide
          </h1>
          <p className="text-xl text-gray-600">
            Master Boolean algebra, number systems, and Karnaugh maps
          </p>
        </div>

        {/* Boolean Algebra Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Calculator className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Boolean Algebra</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Basic Laws & Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Identity Laws</h4>
                  <p className="text-blue-600 text-sm">A + 0 = A</p>
                  <p className="text-blue-600 text-sm">A · 1 = A</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Null Laws</h4>
                  <p className="text-blue-600 text-sm">A + 1 = 1</p>
                  <p className="text-blue-600 text-sm">A · 0 = 0</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Idempotent Laws</h4>
                  <p className="text-blue-600 text-sm">A + A = A</p>
                  <p className="text-blue-600 text-sm">A · A = A</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Complement Laws</h4>
                  <p className="text-blue-600 text-sm">A + Ā = 1</p>
                  <p className="text-blue-600 text-sm">A · Ā = 0</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Absorption Laws</h4>
                  <p className="text-blue-600 text-sm">A + AB = A</p>
                  <p className="text-blue-600 text-sm">A(A + B) = A</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">De Morgan's Laws</h4>
                  <p className="text-blue-600 text-sm">(A + B)̄ = Ā · B̄</p>
                  <p className="text-blue-600 text-sm">(A · B)̄ = Ā + B̄</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Expression Formats Supported</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>AND operations:</strong> AB, A·B, A*B, A AND B, A&B, A&&B</p>
                <p className="text-gray-700 mb-2"><strong>OR operations:</strong> A+B, A OR B, A|B, A||B</p>
                <p className="text-gray-700 mb-2"><strong>NOT operations:</strong> Ā, A', !A, NOT A</p>
                <p className="text-gray-700"><strong>Parentheses:</strong> Use () to group expressions</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Step-by-Step Example</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="font-semibold text-yellow-800 mb-2">Simplify: A + AB</p>
                <div className="space-y-1 text-yellow-700">
                  <p>Step 1: A + AB (Original expression)</p>
                  <p>Step 2: A(1 + B) (Factor out A)</p>
                  <p>Step 3: A(1) (Apply Null Law: 1 + B = 1)</p>
                  <p>Step 4: A (Apply Identity Law: A · 1 = A)</p>
                  <p className="font-semibold">Result: A (Absorption Law)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Number Systems Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Binary className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Number Systems</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Binary (Base 2)</h4>
                <p className="text-purple-600 text-sm mb-2">Uses digits: 0, 1</p>
                <p className="text-purple-600 text-sm">Example: 1010₂ = 10₁₀</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Octal (Base 8)</h4>
                <p className="text-purple-600 text-sm mb-2">Uses digits: 0-7</p>
                <p className="text-purple-600 text-sm">Example: 12₈ = 10₁₀</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Decimal (Base 10)</h4>
                <p className="text-purple-600 text-sm mb-2">Uses digits: 0-9</p>
                <p className="text-purple-600 text-sm">Example: 10₁₀</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Hexadecimal (Base 16)</h4>
                <p className="text-purple-600 text-sm mb-2">Uses: 0-9, A-F</p>
                <p className="text-purple-600 text-sm">Example: A₁₆ = 10₁₀</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Conversion Methods</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>To Decimal:</strong> Multiply each digit by base raised to position power</p>
                <p className="text-gray-700 mb-2"><strong>From Decimal:</strong> Repeatedly divide by target base, collect remainders</p>
                <p className="text-gray-700"><strong>Binary ↔ Hex:</strong> Group binary digits by 4 (each hex digit = 4 binary digits)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Karnaugh Maps Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Grid3X3 className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Karnaugh Maps</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">What are K-Maps?</h3>
              <p className="text-gray-700 mb-4">
                Karnaugh Maps are visual tools for simplifying Boolean expressions. They help identify patterns 
                and group terms for optimal minimization.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">K-Map Sizes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">2 Variables</h4>
                  <p className="text-green-600 text-sm">2×2 grid (4 cells)</p>
                  <p className="text-green-600 text-sm">Variables: A, B</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">3 Variables</h4>
                  <p className="text-green-600 text-sm">2×4 grid (8 cells)</p>
                  <p className="text-green-600 text-sm">Variables: A, B, C</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">4 Variables</h4>
                  <p className="text-green-600 text-sm">4×4 grid (16 cells)</p>
                  <p className="text-green-600 text-sm">Variables: A, B, C, D</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Grouping Rules</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-gray-700">• Groups must contain 1, 2, 4, 8, or 16 adjacent cells</p>
                <p className="text-gray-700">• Groups can wrap around edges (cylinder effect)</p>
                <p className="text-gray-700">• Larger groups lead to simpler expressions</p>
                <p className="text-gray-700">• All 1s must be covered by at least one group</p>
                <p className="text-gray-700">• Minimize the number of groups needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Best Practices */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Tips & Best Practices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Boolean Algebra Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Start with basic laws before complex algorithms</li>
                <li>• Look for absorption opportunities first</li>
                <li>• Use De Morgan's laws for NOT distributions</li>
                <li>• Factor common terms when possible</li>
                <li>• Check your work with truth tables</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">K-Map Tips</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Always use Gray code ordering</li>
                <li>• Start with the largest possible groups</li>
                <li>• Don't forget corner and edge wrapping</li>
                <li>• Overlapping groups are allowed</li>
                <li>• Verify with the original truth table</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage; 