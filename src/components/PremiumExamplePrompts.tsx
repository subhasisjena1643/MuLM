import React, { useState } from 'react';
import { Layers, Search, BarChart3, ArrowRight } from 'lucide-react';

interface ExamplePrompt {
  text: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  category: string;
}

const examplePrompts: ExamplePrompt[] = [
  {
    text: "Build a Smart Document Analyzer: PDF upload → text extraction → AI summarization → sentiment analysis → actionable insights dashboard",
    description: "Complete document intelligence pipeline with multi-stage AI processing and visual analytics",
    icon: <Layers className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-500",
    category: "Smart Document AI"
  },
  {
    text: "Create a Multimodal Search Engine: image + text input → dual embedding → semantic similarity → intelligent ranking → unified results",
    description: "Next-generation search combining visual and textual understanding with AI-powered relevance",
    icon: <Search className="w-5 h-5" />,
    gradient: "from-purple-500 to-pink-500",
    category: "Multimodal Search"
  },
  {
    text: "Build an AI Content Moderator: text/image analysis → toxicity detection → content classification → automated action routing",
    description: "Intelligent content moderation with real-time safety analysis and automated response workflows",
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: "from-green-500 to-emerald-500",
    category: "AI Safety & Moderation"
  }
];

interface PremiumExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PremiumExamplePrompts: React.FC<PremiumExamplePromptsProps> = ({ onSelectPrompt }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-2xl font-display font-semibold text-gradient-secondary mb-4">
          Get started with these examples
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {examplePrompts.map((prompt, index) => (
          <div
            key={index}
            className="group relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => onSelectPrompt(prompt.text)}
              className={`
                w-full p-8 text-left rounded-3xl
                lovable-card
                transition-all duration-700 ease-out
                ${hoveredIndex === index 
                  ? 'scale-105 shadow-2xl -translate-y-2' 
                  : 'scale-100 hover:scale-102'
                }
              `}
            >
              {/* Category badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  bg-gradient-to-r ${prompt.gradient} text-white
                  shadow-lg
                `}>
                  {prompt.category}
                </span>
                
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${prompt.gradient} text-white
                  transition-all duration-500
                  ${hoveredIndex === index ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}
                `}>
                  {prompt.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h4 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {prompt.description}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                  {prompt.text}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className={`
                flex items-center justify-end mt-6
                transition-all duration-500
                ${hoveredIndex === index ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              `}>
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-gradient-to-r ${prompt.gradient} text-white
                  shadow-lg
                `}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              
              {/* Hover glow effect */}
              {hoveredIndex === index && (
                <div className={`
                  absolute inset-0 rounded-3xl opacity-20 animate-pulse
                  bg-gradient-to-r ${prompt.gradient}
                  -z-10
                `} />
              )}
            </button>
            
            {/* Background pattern */}
            <div className={`
              absolute inset-0 rounded-3xl overflow-hidden pointer-events-none
              transition-opacity duration-500
              ${hoveredIndex === index ? 'opacity-10' : 'opacity-0'}
            `}>
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
                  `
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
