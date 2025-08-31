// @ts-nocheck
/**
 * Performance Dashboard
 * Real-time performance metrics and analytics for workflows
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  X,
  Maximize,
  Minimize,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
  history: number[];
}

interface WorkflowStats {
  totalExecutions: number;
  avgExecutionTime: number;
  successRate: number;
  activeWorkflows: number;
  queuedJobs: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
  isDark = false,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = (): { metrics: PerformanceMetric[], stats: WorkflowStats } => {
      const now = Date.now();
      const baseMetrics = [
        {
          id: 'execution-time',
          name: 'Avg Execution Time',
          value: 2.3 + Math.random() * 0.5,
          unit: 's',
          trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down',
          change: Math.random() * 10 - 5,
          status: 'good' as const,
          history: Array.from({ length: 20 }, () => 2 + Math.random() * 2)
        },
        {
          id: 'throughput',
          name: 'Throughput',
          value: 145 + Math.random() * 20,
          unit: 'ops/min',
          trend: 'up' as const,
          change: Math.random() * 15,
          status: 'good' as const,
          history: Array.from({ length: 20 }, () => 140 + Math.random() * 30)
        },
        {
          id: 'error-rate',
          name: 'Error Rate',
          value: Math.random() * 2,
          unit: '%',
          trend: (Math.random() > 0.7 ? 'up' : 'down') as 'up' | 'down',
          change: Math.random() * 0.5 - 0.25,
          status: (Math.random() > 0.9 ? 'warning' : 'good') as 'warning' | 'good',
          history: Array.from({ length: 20 }, () => Math.random() * 3)
        },
        {
          id: 'cpu-usage',
          name: 'CPU Usage',
          value: 45 + Math.random() * 20,
          unit: '%',
          trend: 'stable' as const,
          change: Math.random() * 5 - 2.5,
          status: 'good' as const,
          history: Array.from({ length: 20 }, () => 40 + Math.random() * 30)
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: 60 + Math.random() * 15,
          unit: '%',
          trend: 'up' as const,
          change: Math.random() * 8,
          status: (Math.random() > 0.8 ? 'warning' : 'good') as 'warning' | 'good',
          history: Array.from({ length: 20 }, () => 55 + Math.random() * 25)
        },
        {
          id: 'queue-size',
          name: 'Queue Size',
          value: Math.floor(Math.random() * 10),
          unit: 'jobs',
          trend: (Math.random() > 0.6 ? 'down' : 'stable') as 'down' | 'stable',
          change: Math.random() * 3 - 1.5,
          status: 'good' as const,
          history: Array.from({ length: 20 }, () => Math.random() * 15)
        }
      ];

      const stats: WorkflowStats = {
        totalExecutions: 1247 + Math.floor(Math.random() * 10),
        avgExecutionTime: 2.3 + Math.random() * 0.3,
        successRate: 97.5 + Math.random() * 2,
        activeWorkflows: 8 + Math.floor(Math.random() * 4),
        queuedJobs: Math.floor(Math.random() * 5),
        resourceUsage: {
          cpu: 45 + Math.random() * 20,
          memory: 60 + Math.random() * 15,
          storage: 25 + Math.random() * 10
        }
      };

      return { metrics: baseMetrics, stats };
    };

    const updateData = () => {
      const { metrics: newMetrics, stats: newStats } = generateMockData();
      setMetrics(newMetrics);
      setWorkflowStats(newStats);
    };

    // Initial data load
    updateData();

    // Update every 2 seconds for demo
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } p-4 min-w-[300px]`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onToggleMinimize}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
              <div className="font-medium text-gray-600 dark:text-gray-400">CPU</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {workflowStats?.resourceUsage.cpu.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
              <div className="font-medium text-gray-600 dark:text-gray-400">Queue</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {workflowStats?.queuedJobs || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
        isDark ? 'border border-gray-700' : 'border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time workflow analytics and system metrics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['1h', '24h', '7d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Minimize className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Cards */}
          {workflowStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <span className="text-xs text-blue-600 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowStats.totalExecutions.toLocaleString()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Total Executions</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowStats.successRate.toFixed(1)}%
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowStats.avgExecutionTime.toFixed(1)}s
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Avg Execution Time</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Monitor className="w-8 h-8 text-orange-600" />
                  <span className="text-xs text-orange-600 bg-orange-200 dark:bg-orange-800 px-2 py-1 rounded-full">
                    {workflowStats.activeWorkflows} Active
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowStats.queuedJobs}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Queued Jobs</p>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{metric.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value.toFixed(metric.unit === '%' || metric.unit === 's' ? 1 : 0)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">{metric.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${
                        metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                </div>

                {/* Simple Chart */}
                <div className="h-16 flex items-end space-x-1">
                  {metric.history.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm opacity-70"
                      style={{
                        height: `${(value / Math.max(...metric.history)) * 100}%`,
                        minHeight: '2px'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resource Usage */}
          {workflowStats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-6">System Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">CPU Usage</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {workflowStats.resourceUsage.cpu.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${workflowStats.resourceUsage.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Memory</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {workflowStats.resourceUsage.memory.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${workflowStats.resourceUsage.memory}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Storage</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {workflowStats.resourceUsage.storage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${workflowStats.resourceUsage.storage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
