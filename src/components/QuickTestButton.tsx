import React from 'react';
import { Play } from 'lucide-react';

interface QuickTestButtonProps {
  expression: string;
  description: string;
  onTest: (expression: string) => void;
}

const QuickTestButton: React.FC<QuickTestButtonProps> = ({ expression, description, onTest }) => {
  return (
    <button
      onClick={() => onTest(expression)}
      className="group p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <div className="font-mono text-lg text-gray-800">{expression}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
        <Play className="text-blue-500 group-hover:text-blue-600" size={20} />
      </div>
    </button>
  );
};

export default QuickTestButton; 