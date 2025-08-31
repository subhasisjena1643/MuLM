// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Terminal, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';

interface WorkspaceBottomPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  height: number;
  onHeightChange: (height: number) => void;
  isSimulating: boolean;
  isDark: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}

interface SimulationResult {
  nodeId: string;
  status: 'running' | 'completed' | 'error';
  duration: number;
  output?: any;
  error?: string;
}

export const WorkspaceBottomPanel: React.FC<WorkspaceBottomPanelProps> = ({
  isOpen,
  onToggle,
  height,
  onHeightChange,
  isSimulating,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'results' | 'metrics'>('console');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);

  // Simulate log entries during simulation
  useEffect(() => {
    if (isSimulating) {
      const logMessages = [
        { level: 'info' as const, message: 'Starting workflow simulation...' },
        { level: 'info' as const, message: 'Initializing ML Algorithm node...' },
        { level: 'success' as const, message: 'Data preprocessing completed successfully' },
        { level: 'info' as const, message: 'Running neural network inference...' },
        { level: 'warning' as const, message: 'High memory usage detected in MoE Expert' },
        { level: 'success' as const, message: 'RAG tool retrieved 5 relevant documents' },
        { level: 'info' as const, message: 'Generating final output...' },
        { level: 'success' as const, message: 'Workflow simulation completed successfully' },
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < logMessages.length) {
          const newLog: LogEntry = {
            id: `log-${Date.now()}-${currentIndex}`,
            timestamp: new Date().toLocaleTimeString(),
            ...logMessages[currentIndex]
          };
          setLogs(prev => [...prev, newLog]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  const tabs = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'results', label: 'Results', icon: Activity },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  ];

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResults([]);
  };

  return (
    <>
      {/* Panel */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-30
          bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
          shadow-lg transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ height: `${height}px` }}
      >
        {/* Header */}
        <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {/* Tabs */}
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'console' | 'results' | 'metrics')}
                  className={`
                    flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors
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

            {isSimulating && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Simulation Running</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Console output will appear here during simulation...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0">
                          {log.timestamp}
                        </span>
                        <div className="flex-shrink-0 mt-0.5">
                          {getLogIcon(log.level)}
                        </div>
                        <span className="text-gray-900 dark:text-gray-100 flex-1">
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Input Processing', status: 'completed', duration: '1.2s', output: '{"records": 1000, "features": 15}' },
                  { title: 'ML Algorithm', status: 'completed', duration: '2.8s', output: '{"accuracy": 0.94, "precision": 0.91}' },
                  { title: 'Neural Network', status: 'running', duration: '4.1s', output: null },
                ].map((result, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{result.title}</h4>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${result.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }
                      `}>
                        {result.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Duration: {result.duration}
                    </div>
                    {result.output && (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded border overflow-x-auto">
                        {result.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Execution Time', value: '8.3s', change: '+2.1s' },
                  { label: 'Memory Usage', value: '2.4 GB', change: '+0.3 GB' },
                  { label: 'Success Rate', value: '94.2%', change: '+1.8%' },
                  { label: 'Throughput', value: '120 req/s', change: '+15 req/s' },
                ].map((metric, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{metric.label}</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">{metric.value}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">{metric.change}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Performance Graph</h4>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Performance visualization would appear here</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`
          fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40
          p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          shadow-lg rounded-t-lg transition-all duration-300 ease-in-out
          hover:bg-gray-50 dark:hover:bg-gray-700
          ${isOpen ? `bottom-${height}px` : 'bottom-0'}
        `}
        style={{ bottom: isOpen ? `${height}px` : '0px' }}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </>
  );
};
