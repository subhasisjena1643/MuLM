// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Library, Zap, BarChart3 } from 'lucide-react';
import BlockPalette from '../BlockPalette';
import AIBlockGenerator from '../AIBlockGenerator';
import { SmoothGridStats } from './SmoothGridStats';

interface EnhancedLeftPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onBlockSelect?: (block: any) => void;
  onBlockDrag?: (block: any, event: React.DragEvent) => void;
  onBlockGenerated?: (block: any) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  isDark?: boolean;
  existingBlocks?: any[];
  workflowContext?: any;
}

type TabType = 'library' | 'ai-generator' | 'stats';

export const EnhancedLeftPanel: React.FC<EnhancedLeftPanelProps> = ({
  isVisible,
  onToggle,
  onBlockSelect = () => {},
  onBlockDrag = () => {},
  onBlockGenerated = () => {},
  width = 320,
  onWidthChange = () => {},
  isDark = false,
  existingBlocks = [],
  workflowContext
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  // Handle background click to close
  useEffect(() => {
    const handleBackgroundClick = (e: MouseEvent) => {
      if (isVisible && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only close if clicking outside and not on a UI element
        const target = e.target as HTMLElement;
        if (!target.closest('.enhanced-left-panel') && !target.closest('.block-palette') && !target.closest('.ai-generator')) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleBackgroundClick);
    return () => document.removeEventListener('mousedown', handleBackgroundClick);
  }, [isVisible, onToggle]);

  const tabs = [
    { id: 'library' as TabType, label: 'Library', icon: Library, description: 'Browse AI blocks' },
    { id: 'ai-generator' as TabType, label: 'AI Generator', icon: Zap, description: 'Generate custom blocks' },
    { id: 'stats' as TabType, label: 'Statistics', icon: BarChart3, description: 'Grid analytics' }
  ];

  if (!isVisible) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Open Enhanced Panel"
        >
          <Library className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay for minimization */}
      {isVisible && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-10"
          onClick={() => setIsMinimized(true)}
        />
      )}
      
      <div 
        ref={panelRef}
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 z-20 ${
          isMinimized ? 'w-12' : 'w-80'
        }`}
      >
        {/* Minimized View */}
        {isMinimized && (
          <div className="p-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
              title="Expand panel"
            >
              →
            </button>
            <div className="mt-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMinimized(false);
                  }}
                  className={`w-8 h-8 rounded text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center ${
                    activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Full View */}
        {!isMinimized && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                µLM Workspace
              </h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-6 h-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs flex items-center justify-center transition-colors"
                  title="Minimize panel"
                >
                  ←
                </button>
                <button
                  onClick={onToggle}
                  className="w-6 h-6 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded text-xs flex items-center justify-center transition-colors"
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'library' && (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      🔍 Block Library
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Search and drag blocks to your workspace
                    </p>
                  </div>
                  <BlockPalette 
                    onBlockSelect={onBlockSelect}
                    onBlockDrag={onBlockDrag}
                  />
                </div>
              )}

              {activeTab === 'ai-generator' && (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      🧠 AI Block Generator
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generate custom blocks using AI
                    </p>
                  </div>
                  <AIBlockGenerator 
                    onBlockGenerated={onBlockGenerated}
                    existingBlocks={existingBlocks}
                    workflowContext={workflowContext}
                  />
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      📊 Workspace Statistics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Real-time workspace metrics
                    </p>
                  </div>
                  <SmoothGridStats />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                µLM v2.0 • AI-Powered Workflow Builder
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EnhancedLeftPanel;
