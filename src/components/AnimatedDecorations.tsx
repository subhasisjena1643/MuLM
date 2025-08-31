import React from 'react';

export const AnimatedDecorations: React.FC = () => {
  return (
    <>
      {/* Floating geometric shapes around content */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top decorations */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: '0s' }} />
        <div className="absolute top-32 right-16 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg rotate-45 animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute top-48 left-1/4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-breathe opacity-50" style={{ animationDelay: '2s' }} />
        
        {/* Middle decorations */}
        <div className="absolute top-1/2 left-8 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-float opacity-35" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-12 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg rotate-12 animate-pulse opacity-40" style={{ animationDelay: '4s' }} />
        
        {/* Bottom decorations */}
        <div className="absolute bottom-32 left-20 w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-breathe opacity-30" style={{ animationDelay: '5s' }} />
        <div className="absolute bottom-20 right-1/4 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg rotate-45 animate-float opacity-45" style={{ animationDelay: '6s' }} />
        <div className="absolute bottom-48 right-8 w-5 h-5 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-pulse opacity-35" style={{ animationDelay: '7s' }} />
        
        {/* Corner accents */}
        <div className="absolute top-1/3 left-8 w-2 h-20 bg-gradient-to-b from-purple-400/20 to-transparent rounded-full animate-shimmer" />
        <div className="absolute bottom-16 right-8 w-20 h-2 bg-gradient-to-r from-cyan-400/20 to-transparent rounded-full animate-shimmer" style={{ animationDelay: '3s' }} />
      </div>

      {/* Subtle animated lines */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="rgb(34, 197, 94)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Curved lines */}
          <path
            d="M0,100 Q200,50 400,100 T800,100"
            stroke="url(#lineGradient1)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <path
            d="M0,200 Q300,150 600,200 T1200,200"
            stroke="url(#lineGradient2)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '1s' }}
          />
          <path
            d="M0,300 Q150,250 300,300 T600,300"
            stroke="url(#lineGradient1)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '2s' }}
          />
        </svg>
      </div>

      {/* Data stream effect */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-shimmer"
            style={{
              width: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </>
  );
};
