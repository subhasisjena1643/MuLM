// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Zap, MousePointer, Link } from 'lucide-react';

interface WorkflowGuideProps {
  isVisible: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({
  isVisible,
  onClose,
  isDark
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`relative max-w-2xl w-full rounded-2xl shadow-2xl border ${
        isDark 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">🎯 Workflow Demo Guide</h2>
              <p className="text-sm opacity-70">Master the µLM workspace in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h3 className="font-semibold">Generate Workflow</h3>
              </div>
              <p className="text-sm opacity-70 mb-3">
                Click examples on homepage or type keywords like "document analyzer"
              </p>
              <div className="flex space-x-1">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                  document analyzer
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                  multimodal search
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h3 className="font-semibold">Execute Demo</h3>
              </div>
              <p className="text-sm opacity-70 mb-3">
                Click the gradient "Demo Run" button to see realistic AI execution
              </p>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Demo Run
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <h3 className="font-semibold">Connect Blocks</h3>
              </div>
              <p className="text-sm opacity-70 mb-3">
                Drag from colored circles to connect workflow blocks
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Link className="w-4 h-4 text-gray-500" />
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className={`p-4 rounded-xl border-2 border-dashed ${
            isDark ? 'border-gray-600 bg-gray-900/30' : 'border-gray-300 bg-gray-50/50'
          }`}>
            <h3 className="font-semibold mb-3 flex items-center">
              💡 Pro Tips for Demo Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <MousePointer className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>Double-click nodes to configure or upload files</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 mt-0.5 text-green-500" />
                <span>Watch progress bars during execution</span>
              </div>
              <div className="flex items-start space-x-2">
                <Link className="w-4 h-4 mt-0.5 text-purple-500" />
                <span>Animated edges show data flow direction</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 mt-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                <span>Color-coded ports for different data types</span>
              </div>
            </div>
          </div>

          {/* Demo Workflows Preview */}
          <div>
            <h3 className="font-semibold mb-3">🚀 Ready-to-Demo Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                <div className="font-medium text-blue-800 dark:text-blue-200">📄 Document Analyzer</div>
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">6-node intelligent pipeline</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                <div className="font-medium text-purple-800 dark:text-purple-200">🔍 Multimodal Search</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">CLIP-powered fusion engine</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                <div className="font-medium text-green-800 dark:text-green-200">🛡️ Content Moderator</div>
                <div className="text-xs text-green-600 dark:text-green-300 mt-1">Real-time safety analysis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t rounded-b-2xl ${
          isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-70">
              Ready to create stunning AI workflows! 🎯
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
            >
              Start Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
