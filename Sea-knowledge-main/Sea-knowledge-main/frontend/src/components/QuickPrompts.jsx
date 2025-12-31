import React from 'react';
import { Sparkles } from 'lucide-react';

const QuickPrompts = ({ prompts, onPromptClick }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-300">Quick prompts</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-white/10 hover:border-white/30"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;