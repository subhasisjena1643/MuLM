import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface PremiumThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const PremiumThemeToggle: React.FC<PremiumThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className={`
        fixed top-8 right-8 z-50 group
        w-14 h-14 rounded-2xl
        lovable-card hover:scale-105
        transition-all duration-500 ease-out
        ${isDark ? 'hover:shadow-purple-500/25' : 'hover:shadow-blue-500/25'}
      `}
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon */}
        <Sun 
          className={`
            absolute w-6 h-6 text-amber-500 
            transition-all duration-500 ease-out
            ${isDark 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100 group-hover:rotate-12'
            }
          `}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`
            absolute w-6 h-6 text-indigo-400
            transition-all duration-500 ease-out
            ${isDark 
              ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12' 
              : '-rotate-90 scale-0 opacity-0'
            }
          `}
        />
        
        {/* Animated ring */}
        <div className={`
          absolute inset-0 rounded-2xl border-2 
          transition-all duration-500 ease-out
          ${isDark 
            ? 'border-indigo-400/30 group-hover:border-indigo-400/60' 
            : 'border-amber-400/30 group-hover:border-amber-400/60'
          }
          scale-0 group-hover:scale-110
        `} />
      </div>
    </button>
  );
};
