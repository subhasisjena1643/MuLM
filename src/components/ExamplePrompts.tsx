import React from 'react';
import { motion } from 'framer-motion';

interface ExamplePrompt {
  text: string;
  description: string;
  category: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTime: string;
  demoHighlight: boolean;
}

const examplePrompts: ExamplePrompt[] = [
  {
    text: "Create a Smart Document Analyzer: PDF → Text Extraction → Summarization → Sentiment → Insights",
    description: "🏆 Smart Document Analyzer",
    category: "Document Processing",
    complexity: "Advanced",
    estimatedTime: "2-3 minutes",
    demoHighlight: true
  },
  {
    text: "Build a Multimodal Search Engine: Image + Text → Embedding → Similarity → Ranking → Results",
    description: "🔍 Multimodal Search Engine", 
    category: "Search & Retrieval",
    complexity: "Expert",
    estimatedTime: "3-4 minutes",
    demoHighlight: true
  },
  {
    text: "Design an AI Content Moderator: Text/Image → Classification → Toxicity Detection → Action Router",
    description: "🛡️ AI Content Moderator",
    category: "Safety & Compliance", 
    complexity: "Advanced",
    estimatedTime: "2-3 minutes",
    demoHighlight: true
  },
  {
    text: "Build a real-time data processing pipeline with ML predictions",
    description: "⚡ Real-time ML Pipeline",
    category: "Data Processing",
    complexity: "Intermediate",
    estimatedTime: "1-2 minutes",
    demoHighlight: false
  },
  {
    text: "Create a personalized recommendation system with collaborative filtering",
    description: "🎯 Recommendation Engine",
    category: "Machine Learning",
    complexity: "Intermediate", 
    estimatedTime: "2-3 minutes",
    demoHighlight: false
  },
  {
    text: "Design a fraud detection system with anomaly detection and alerts",
    description: "🔒 Fraud Detection System",
    category: "Security",
    complexity: "Advanced",
    estimatedTime: "3-4 minutes",
    demoHighlight: false
  }
];

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelectPrompt }) => {
  const demoHighlights = examplePrompts.filter(p => p.demoHighlight);
  const otherPrompts = examplePrompts.filter(p => !p.demoHighlight);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Intermediate': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'Advanced': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'Expert': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Demo Highlights Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            🏆 Demo-Winning Workflows
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Show-stopping AI workflows designed to impress hackathon judges
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {demoHighlights.map((prompt, index) => (
            <motion.button
              key={`demo-${index}`}
              onClick={() => onSelectPrompt(prompt.text)}
              className="group relative p-6 text-left rounded-2xl bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 hover:from-yellow-100 hover:via-orange-100 hover:to-red-100 dark:hover:from-yellow-900/30 dark:hover:via-orange-900/30 dark:hover:to-red-900/30 transition-all duration-500 border-2 border-gradient-to-r from-yellow-300 to-red-300 hover:border-yellow-400 hover:to-red-400 shadow-lg hover:shadow-2xl"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.15 + 0.2, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.03, y: -8 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Trophy Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">🏆</span>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-yellow-100 transition-colors duration-300">
                    {prompt.description}
                  </h4>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                  {prompt.text}
                </p>
                
                <div className="flex items-center justify-between text-xs space-x-2">
                  <span className={`px-2 py-1 rounded-full font-medium ${getComplexityColor(prompt.complexity)}`}>
                    {prompt.complexity}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-1">⏱️</span>
                    {prompt.estimatedTime}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
                  📂 {prompt.category}
                </div>
              </div>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Other Workflows Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            More AI Workflows
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Additional powerful workflows for various use cases
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherPrompts.map((prompt, index) => (
            <motion.button
              key={`other-${index}`}
              onClick={() => onSelectPrompt(prompt.text)}
              className="group p-5 text-left rounded-xl glass dark:glass-dark hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 border-2 border-transparent hover:border-blue-300/50 dark:hover:border-blue-400/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + demoHighlights.length) * 0.1 + 0.5, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {prompt.description}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {prompt.text}
                </p>
                
                <div className="flex items-center justify-between text-xs space-x-2">
                  <span className={`px-2 py-1 rounded-full font-medium ${getComplexityColor(prompt.complexity)}`}>
                    {prompt.complexity}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-1">⏱️</span>
                    {prompt.estimatedTime}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  📂 {prompt.category}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
