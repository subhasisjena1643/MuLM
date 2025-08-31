import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface PremiumPromptInputProps {
  onSubmit: (prompt: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export const PremiumPromptInput: React.FC<PremiumPromptInputProps> = ({ 
  onSubmit, 
  value, 
  onChange 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const isActive = isFocused || isHovered || value.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`
            relative rounded-3xl transition-all duration-700 ease-out
            ${isActive 
              ? 'lovable-card shadow-2xl scale-[1.02]' 
              : 'lovable-card shadow-lg hover:shadow-xl'
            }
            ${isFocused ? 'ring-2 ring-indigo-500/30 dark:ring-indigo-400/30' : ''}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated border gradient */}
          <div className={`
            absolute inset-0 rounded-3xl transition-opacity duration-700
            ${isActive ? 'opacity-100' : 'opacity-0'}
            bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20
            animate-shimmer
          `} />
          
          <div className="relative p-8">
            <div className="flex items-start gap-6">
              {/* Premium icon */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center
                transition-all duration-500 ease-out
                ${isActive 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg scale-110' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }
              `}>
                <div className="relative">
                  <Sparkles className={`
                    w-6 h-6 text-white transition-all duration-500
                    ${isActive ? 'animate-pulse' : ''}
                  `} />
                  {isActive && (
                    <div className="absolute inset-0 animate-ping">
                      <Zap className="w-6 h-6 text-white opacity-75" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input area */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value); // Debug log
                    onChange(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      console.log('Enter pressed, submitting:', value); // Debug log
                      handleSubmit(e);
                    }
                  }}
                  onFocus={() => {
                    console.log('Input focused'); // Debug log
                    setIsFocused(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  onClick={() => {
                    console.log('Input clicked'); // Debug log
                  }}
                  placeholder="Describe the AI system you want to build..."
                  autoComplete="off"
                  spellCheck="false"
                  className={`
                    w-full bg-transparent resize-none outline-none
                    transition-all duration-500 ease-out
                    text-xl leading-relaxed min-h-[64px] max-h-[200px]
                    font-sans relative z-10
                    ${isActive 
                      ? 'text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400' 
                      : 'text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400'
                    }
                  `}
                  style={{ 
                    fontSize: '1.125rem',
                    lineHeight: '1.6',
                    fontWeight: '400',
                    fontFamily: 'Space Grotesk, system-ui, sans-serif'
                  }}
                  rows={1}
                />
                
                {/* Character count indicator */}
                {value.length > 0 && (
                  <div className="absolute bottom-0 right-0 text-xs text-gray-400 dark:text-gray-500">
                    {value.length} characters
                  </div>
                )}
              </div>
              
              {/* Submit button */}
              <div className="flex-shrink-0">
                <button
                  type="submit"
                  disabled={!value.trim()}
                  onClick={() => {
                    console.log('Submit button clicked, value:', value); // Debug log
                  }}
                  className={`
                    group relative w-14 h-14 rounded-2xl
                    transition-all duration-500 ease-out
                    ${value.trim()
                      ? 'btn-premium shadow-lg hover:shadow-2xl scale-100 hover:scale-105 cursor-pointer'
                      : 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed scale-95'
                    }
                  `}
                >
                  <div className="relative flex items-center justify-center">
                    <ArrowRight className={`
                      w-6 h-6 transition-all duration-300
                      ${value.trim() 
                        ? 'text-white group-hover:translate-x-0.5' 
                        : 'text-gray-400 dark:text-gray-500'
                      }
                    `} />
                  </div>
                  
                  {/* Ripple effect */}
                  {value.trim() && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Subtle glow effect */}
          {isActive && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
          )}
        </div>
        
        {/* Helper text */}
        <div className={`
          mt-6 text-center transition-all duration-500
          ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2'}
        `}>
          <p className="text-sm text-gradient-secondary font-medium font-mono tracking-wide">
            {isFocused 
              ? 'Press Enter or click the arrow to start building →' 
              : 'Powered by advanced AI • Zero coding required'
            }
          </p>
        </div>
      </form>
    </div>
  );
};
