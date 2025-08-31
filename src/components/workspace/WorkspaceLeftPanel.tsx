// @ts-nocheck
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Network, 
  Database,
  Search,
  MessageSquare,
  Code,
  Zap
} from 'lucide-react';

interface WorkspaceLeftPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  isDark: boolean;
}

const nodeCategories = [
  {
    title: 'AI & ML',
    icon: Brain,
    color: 'bg-blue-500',
    nodes: [
      { type: 'mlAlgorithm', label: 'ML Algorithm', description: 'Machine learning models' },
      { type: 'neuralNetwork', label: 'Neural Network', description: 'Deep learning networks' },
      { type: 'moeExpert', label: 'MoE Expert', description: 'Mixture of Experts routing' },
    ]
  },
  {
    title: 'Tools & RAG',
    icon: Database,
    color: 'bg-green-500',
    nodes: [
      { type: 'ragTool', label: 'RAG Tool', description: 'Retrieval augmented generation' },
      { type: 'vectorDb', label: 'Vector DB', description: 'Vector database storage' },
      { type: 'embedding', label: 'Embeddings', description: 'Text embeddings' },
    ]
  },
  {
    title: 'Workflow',
    icon: Network,
    color: 'bg-purple-500',
    nodes: [
      { type: 'input', label: 'Input', description: 'Data input node' },
      { type: 'output', label: 'Output', description: 'Data output node' },
      { type: 'condition', label: 'Condition', description: 'Conditional logic' },
    ]
  }
];

export const WorkspaceLeftPanel: React.FC<WorkspaceLeftPanelProps> = ({
  isOpen,
  onToggle,
  width,
  onWidthChange,
  isDark,
}) => {
  const [activeCategory, setActiveCategory] = useState('AI & ML');
  const [aiPrompt, setAiPrompt] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      {/* Panel */}
      <div
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] z-40
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          shadow-lg transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: `${width}px` }}
      >
        {/* AI Assistant Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the workflow you want to build..."
              className="w-full h-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Generate Workflow</span>
            </button>
          </div>
        </div>

        {/* Block Generator Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Block Generator</h3>
            
            {/* Category tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {nodeCategories.map((category) => (
                <button
                  key={category.title}
                  onClick={() => setActiveCategory(category.title)}
                  className={`
                    flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors
                    ${activeCategory === category.title
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Node blocks */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {nodeCategories
              .find(cat => cat.title === activeCategory)
              ?.nodes.map((node) => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-grab hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${nodeCategories.find(cat => cat.title === activeCategory)?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Code className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{node.label}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{node.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Help section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <MessageSquare className="w-4 h-4" />
            <span>Need Help?</span>
          </button>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`
          fixed top-24 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          shadow-lg rounded-r-lg transition-all duration-300 ease-in-out
          hover:bg-gray-50 dark:hover:bg-gray-700
          ${isOpen ? `left-${width}px` : 'left-0'}
        `}
        style={{ left: isOpen ? `${width}px` : '0px' }}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </>
  );
};
