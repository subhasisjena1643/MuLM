import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`relative rounded-2xl transition-all duration-300 ${
            isFocused 
              ? 'glass dark:glass-dark ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-xl' 
              : 'glass dark:glass-dark shadow-lg hover:shadow-xl'
          }`}
        >
          <div className="flex items-center p-6">
            <div className="flex-shrink-0 mr-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe the AI system you want to build..."
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none text-lg leading-relaxed min-h-[60px] max-h-[200px]"
                rows={3}
              />
            </div>
            
            <motion.button
              type="submit"
              disabled={!value.trim()}
              className={`flex-shrink-0 ml-4 p-3 rounded-xl transition-all duration-300 ${
                value.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              whileHover={value.trim() ? { scale: 1.05 } : {}}
              whileTap={value.trim() ? { scale: 0.95 } : {}}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
          
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-8 left-0 right-0 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Press Enter to submit or click the arrow
              </p>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  );
};
