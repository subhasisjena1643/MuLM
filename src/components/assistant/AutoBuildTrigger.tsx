// @ts-nocheck
// Auto-Build Assistant Trigger Button
// Floating action button to open the AI workflow builder

import React, { useState } from 'react';
import { Brain, Wand2, Sparkles, Zap } from 'lucide-react';

interface AutoBuildTriggerProps {
  onClick: () => void;
  isDark: boolean;
  isAssistantOpen: boolean;
}

export const AutoBuildTrigger: React.FC<AutoBuildTriggerProps> = ({
  onClick,
  isDark,
  isAssistantOpen
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isAssistantOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Auto-Build AI Assistant</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Generate workflows from natural language
          </div>
          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
          relative group
          w-16 h-16 
          bg-gradient-to-r from-blue-500 to-purple-600 
          hover:from-blue-600 hover:to-purple-700
          text-white 
          rounded-full 
          shadow-lg hover:shadow-xl 
          transition-all duration-300 
          transform hover:scale-110
          flex items-center justify-center
          border-2 border-white/20
        "
      >
        {/* Animated Background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain className="w-7 h-7" />
        </div>

        {/* Floating Sparkles */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-2.5 h-2.5 text-yellow-900" />
        </div>

        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30"></div>
      </button>

      {/* Quick Access Mini Buttons */}
      <div className="absolute bottom-full right-0 mb-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
            // You could add specific actions here for different types of workflows
          }}
          className="
            w-12 h-12 
            bg-blue-500 hover:bg-blue-600 
            text-white 
            rounded-full 
            shadow-md hover:shadow-lg 
            transition-all duration-200 
            transform hover:scale-105
            flex items-center justify-center
          "
          title="Quick ML Pipeline"
        >
          <Zap className="w-5 h-5" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="
            w-12 h-12 
            bg-purple-500 hover:bg-purple-600 
            text-white 
            rounded-full 
            shadow-md hover:shadow-lg 
            transition-all duration-200 
            transform hover:scale-105
            flex items-center justify-center
          "
          title="Quick RAG System"
        >
          <Wand2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
