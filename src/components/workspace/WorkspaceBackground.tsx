import React from 'react';

export const WorkspaceBackground: React.FC = () => {
  return (
    <>
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 transition-colors duration-500" />
      
      {/* Animated grid pattern */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(156 163 175)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating elements for workspace ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Circuit-like patterns */}
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20 dark:opacity-30">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20,20 L80,20 L80,50 L50,50 L50,80 L80,80"
              stroke="rgb(59 130 246)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
            <circle cx="50" cy="50" r="3" fill="rgb(59 130 246)" className="animate-pulse" />
          </svg>
        </div>

        <div className="absolute bottom-20 right-10 w-40 h-40 opacity-20 dark:opacity-30">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M10,80 L30,80 L30,60 L70,60 L70,40 L90,40"
              stroke="rgb(139 92 246)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <circle cx="30" cy="60" r="3" fill="rgb(139 92 246)" className="animate-pulse" />
            <circle cx="70" cy="40" r="3" fill="rgb(139 92 246)" className="animate-pulse" />
          </svg>
        </div>

        {/* Data flow indicators */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};
