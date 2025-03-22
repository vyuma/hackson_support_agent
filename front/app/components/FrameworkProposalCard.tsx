import React from 'react';
import { Check } from 'lucide-react';

type FrameworkProposal = {
  name: string;
  priority: number;
  reason: string;
};

type FrameworkProposalCardProps = {
  framework: FrameworkProposal;
  selected: boolean;
  onSelect: () => void;
  isDark?: boolean; // ダークモード状態
  variant?: 'frontend' | 'backend'; // フロントエンドかバックエンドか
};

const FrameworkProposalCard: React.FC<FrameworkProposalCardProps> = ({
  framework,
  selected,
  onSelect,
  isDark = true,
  variant = 'frontend'
}) => {
  const isFrontend = variant === 'frontend';
  
  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg transition-all cursor-pointer border-l-4 ${
        selected
          ? isDark
            ? isFrontend
              ? 'bg-gray-700 border-cyan-500 shadow-lg shadow-cyan-500/10'
              : 'bg-gray-700 border-pink-500 shadow-lg shadow-pink-500/10'
            : isFrontend
              ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-white border-purple-500 shadow-lg shadow-purple-500/10'
          : isDark
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
            : 'bg-gray-50 border-gray-200 hover:bg-white'
      }`}
    >
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div className={`font-bold text-lg ${
          isFrontend
            ? isDark ? 'text-cyan-300' : 'text-blue-700'
            : isDark ? 'text-pink-300' : 'text-purple-700'
        }`}>
          {framework.name}
          {selected && (
            <Check className="inline-block ml-2" size={18} />
          )}
        </div>
        <div className={`px-2 py-0.5 rounded text-sm ${
          isFrontend
            ? isDark 
              ? 'bg-pink-900 text-pink-300' 
              : 'bg-purple-100 text-purple-800'
            : isDark
              ? 'bg-cyan-900 text-cyan-300' 
              : 'bg-blue-100 text-blue-800'
        }`}>
          優先度: {framework.priority}
        </div>
      </div>
      <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {framework.reason}
      </p>
    </div>
  );
};

export default FrameworkProposalCard;