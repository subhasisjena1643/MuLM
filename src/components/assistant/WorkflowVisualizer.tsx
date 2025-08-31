// @ts-nocheck
// Workflow Architecture Visualizer
// Interactive visualization of generated workflow architectures

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3, 
  Clock,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Eye,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Info,
  Zap,
  Target
} from 'lucide-react';
import { WorkflowArchitecture, BlockSuggestion } from '../../services/AutoBuildAIService';

interface WorkflowVisualizerProps {
  architecture: WorkflowArchitecture;
  onApplyToCanvas: () => void;
  onExportArchitecture: () => void;
  isDark: boolean;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  architecture,
  onApplyToCanvas,
  onExportArchitecture,
  isDark
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'blocks' | 'flow' | 'resources'>('overview');

  const getBlockIcon = (blockType: string) => {
    const iconMap = {
      input: '📥',
      output: '📤',
      transformer: '🔄',
      llm: '🧠',
      mlAlgorithm: '🤖',
      ragTool: '🔍',
      moeExpert: '👥',
      dataProcessor: '⚙️',
      errorHandler: '🛡️',
      monitor: '📊'
    };
    return iconMap[blockType] || '📦';
  };

  const getBlockColor = (blockType: string) => {
    const colorMap = {
      input: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
      output: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
      transformer: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
      llm: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200',
      mlAlgorithm: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-200',
      ragTool: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
      moeExpert: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
      dataProcessor: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
      errorHandler: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200',
      monitor: 'bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-200'
    };
    return colorMap[blockType] || 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'blocks', label: 'Blocks', icon: Layers },
    { id: 'flow', label: 'Data Flow', icon: Network },
    { id: 'resources', label: 'Resources', icon: BarChart3 }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {architecture.pattern.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {architecture.pattern.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <div>Complexity: {architecture.pattern.complexity}/5</div>
              <div>Blocks: {architecture.blocks.length}</div>
            </div>
            <button
              onClick={onApplyToCanvas}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Apply to Canvas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pattern Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Throughput: {architecture.pattern.performance.throughput}</div>
                  <div>Latency: {architecture.pattern.performance.latency}</div>
                  <div>Memory: {architecture.pattern.performance.memory}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Advantages</h4>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {architecture.pattern.pros.slice(0, 3).map((pro, index) => (
                    <div key={index}>• {pro}</div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Considerations</h4>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {architecture.pattern.cons.slice(0, 3).map((con, index) => (
                    <div key={index}>• {con}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Architecture Diagram</h4>
              <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                {architecture.blocks.map((block, index) => (
                  <React.Fragment key={block.type}>
                    <div
                      className={`
                        relative px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                        ${getBlockColor(block.type)}
                        ${selectedBlock?.type === block.type ? 'ring-2 ring-blue-500' : ''}
                      `}
                      onClick={() => setSelectedBlock(selectedBlock?.type === block.type ? null : block)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{getBlockIcon(block.type)}</div>
                        <div className="text-xs font-medium">{block.name}</div>
                      </div>
                    </div>
                    {index < architecture.blocks.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Selected Block Details */}
            {selectedBlock && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <span className="text-xl">{getBlockIcon(selectedBlock.type)}</span>
                  <span>{selectedBlock.name}</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {selectedBlock.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Reasoning</h5>
                    <p className="text-gray-600 dark:text-gray-400">{selectedBlock.reasoning}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Configuration</h5>
                    <div className="space-y-1">
                      {Object.entries(selectedBlock.config).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-gray-600 dark:text-gray-400">
                          <span className="font-mono text-xs">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Blocks */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Processing Blocks ({architecture.blocks.length})</span>
                </h4>
                <div className="space-y-2">
                  {architecture.blocks.map((block, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${getBlockColor(block.type)}`}
                      onClick={() => setSelectedBlock(selectedBlock?.type === block.type ? null : block)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getBlockIcon(block.type)}</span>
                        <div className="flex-1">
                          <h5 className="font-medium">{block.name}</h5>
                          <p className="text-xs opacity-75">{block.description}</p>
                        </div>
                        <Info className="w-4 h-4 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Blocks */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Support Systems</span>
                </h4>
                <div className="space-y-2">
                  {/* Error Handling */}
                  {architecture.errorHandling.blocks.length > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Error Handling</h5>
                      {architecture.errorHandling.strategies.map((strategy, index) => (
                        <div key={index} className="text-sm text-orange-700 dark:text-orange-300">
                          • {strategy}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Monitoring */}
                  {architecture.monitoring.blocks.length > 0 && (
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                      <h5 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Monitoring</h5>
                      {architecture.monitoring.metrics.map((metric, index) => (
                        <div key={index} className="text-sm text-teal-700 dark:text-teal-300">
                          • {metric}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span>Data Flow Connections</span>
            </h4>
            <div className="space-y-3">
              {architecture.connections.map((connection, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {connection.from}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      {connection.to}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-white dark:bg-gray-700 rounded">
                    {connection.type}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Connection Details */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Connection Analysis</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Data Types</h6>
                  <div className="space-y-1">
                    {[...new Set(architecture.connections.map(c => c.type))].map((type, index) => (
                      <div key={index} className="text-gray-600 dark:text-gray-400">• {type}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Flow Characteristics</h6>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div>• Sequential processing pipeline</div>
                    <div>• {architecture.connections.length} connection points</div>
                    <div>• End-to-end data transformation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Resource Requirements</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">Compute</h5>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {architecture.pattern.performance.throughput}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Processing power needed
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <HardDrive className="w-5 h-5 text-green-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">Memory</h5>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {architecture.pattern.performance.memory}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  RAM requirements
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">Latency</h5>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {architecture.pattern.performance.latency}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Response time
                </div>
              </div>
            </div>

            {/* Deployment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Deployment Recommendations</h5>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <div dangerouslySetInnerHTML={{ __html: architecture.documentation.deployment.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Generated workflow ready for deployment
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onExportArchitecture}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(architecture, null, 2))}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
