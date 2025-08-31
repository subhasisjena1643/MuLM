// @ts-nocheck
// Real-Time Performance Metrics Dashboard
// Professional monitoring interface with charts and alerts

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';
import { RealTimeSimulationEngine, SimulationMetrics, NodeMetrics } from './RealTimeSimulationEngine';

interface PerformanceMetricsDashboardProps {
  simulationEngine: RealTimeSimulationEngine;
  isDark?: boolean;
}

interface MetricHistory {
  timestamp: number;
  value: number;
}

export const PerformanceMetricsDashboard: React.FC<PerformanceMetricsDashboardProps> = ({
  simulationEngine,
  isDark = false
}) => {
  const [metrics, setMetrics] = useState<SimulationMetrics>(simulationEngine.getMetrics());
  const [nodeMetrics, setNodeMetrics] = useState<Map<string, NodeMetrics>>(new Map());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<{
    cpu: MetricHistory[];
    memory: MetricHistory[];
    throughput: MetricHistory[];
    latency: MetricHistory[];
  }>({
    cpu: [],
    memory: [],
    throughput: [],
    latency: []
  });

  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = simulationEngine.getMetrics();
      setMetrics(currentMetrics);
      
      // Update metrics history
      const timestamp = Date.now();
      setMetricsHistory(prev => ({
        cpu: [...prev.cpu.slice(-50), { timestamp, value: currentMetrics.averageCpuUsage }],
        memory: [...prev.memory.slice(-50), { timestamp, value: currentMetrics.peakMemoryUsage / 1024 / 1024 }], // MB
        throughput: [...prev.throughput.slice(-50), { timestamp, value: currentMetrics.totalDataProcessed }],
        latency: [...prev.latency.slice(-50), { timestamp, value: currentMetrics.averageLatency }]
      }));

      // Update node metrics
      const state = simulationEngine.getState();
      setNodeMetrics(new Map(
        Array.from(state.nodes.entries()).map(([id, node]) => [id, node.metrics])
      ));
    };

    const interval = setInterval(updateMetrics, 1000);
    
    simulationEngine.on('metrics_updated', updateMetrics);
    simulationEngine.on('simulation_started', updateMetrics);
    simulationEngine.on('simulation_stopped', updateMetrics);

    return () => {
      clearInterval(interval);
      simulationEngine.off('metrics_updated', updateMetrics);
      simulationEngine.off('simulation_started', updateMetrics);
      simulationEngine.off('simulation_stopped', updateMetrics);
    };
  }, [simulationEngine]);

  useEffect(() => {
    drawChart();
  }, [metricsHistory, selectedNode]);

  const drawChart = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    drawGrid(ctx, width, height);

    // Draw metrics lines
    if (selectedNode) {
      drawNodeMetrics(ctx, width, height);
    } else {
      drawGlobalMetrics(ctx, width, height);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const drawGlobalMetrics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const metrics = [
      { data: metricsHistory.cpu, color: '#ef4444', max: 100 },
      { data: metricsHistory.memory, color: '#3b82f6', max: 1000 },
      { data: metricsHistory.latency, color: '#10b981', max: 1000 }
    ];

    metrics.forEach(({ data, color, max }) => {
      if (data.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (point.value / max) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });
  };

  const drawNodeMetrics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const nodeData = nodeMetrics.get(selectedNode!);
    if (!nodeData) return;

    // Draw node-specific metrics visualization
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.font = '12px Arial';
    ctx.fillText(`Node: ${selectedNode}`, 10, 20);
    ctx.fillText(`CPU: ${nodeData.cpuUsage.toFixed(1)}%`, 10, 40);
    ctx.fillText(`Memory: ${(nodeData.memoryUsage / 1024 / 1024).toFixed(1)}MB`, 10, 60);
    ctx.fillText(`Latency: ${nodeData.executionTime}ms`, 10, 80);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getPerformanceRating = (value: number, type: 'cpu' | 'memory' | 'latency'): {
    rating: 'excellent' | 'good' | 'warning' | 'critical';
    color: string;
  } => {
    switch (type) {
      case 'cpu':
        if (value < 30) return { rating: 'excellent', color: 'text-green-600' };
        if (value < 60) return { rating: 'good', color: 'text-blue-600' };
        if (value < 80) return { rating: 'warning', color: 'text-yellow-600' };
        return { rating: 'critical', color: 'text-red-600' };
      
      case 'memory':
        const memoryMB = value / 1024 / 1024;
        if (memoryMB < 50) return { rating: 'excellent', color: 'text-green-600' };
        if (memoryMB < 100) return { rating: 'good', color: 'text-blue-600' };
        if (memoryMB < 200) return { rating: 'warning', color: 'text-yellow-600' };
        return { rating: 'critical', color: 'text-red-600' };
      
      case 'latency':
        if (value < 100) return { rating: 'excellent', color: 'text-green-600' };
        if (value < 500) return { rating: 'good', color: 'text-blue-600' };
        if (value < 1000) return { rating: 'warning', color: 'text-yellow-600' };
        return { rating: 'critical', color: 'text-red-600' };
      
      default:
        return { rating: 'good', color: 'text-gray-600' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Global Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">CPU</span>
          </div>
          <div className={`text-lg font-bold ${getPerformanceRating(metrics.averageCpuUsage, 'cpu').color}`}>
            {metrics.averageCpuUsage.toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <HardDrive className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Memory</span>
          </div>
          <div className={`text-lg font-bold ${getPerformanceRating(metrics.peakMemoryUsage, 'memory').color}`}>
            {formatBytes(metrics.peakMemoryUsage)}
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Latency</span>
          </div>
          <div className={`text-lg font-bold ${getPerformanceRating(metrics.averageLatency, 'latency').color}`}>
            {formatDuration(metrics.averageLatency)}
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Throughput</span>
          </div>
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {metrics.totalDataProcessed}
          </div>
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Real-time Performance
          </h4>
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">CPU</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Memory</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Latency</span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-600 rounded">
          <canvas
            ref={chartCanvasRef}
            width={400}
            height={200}
            className="w-full h-48"
          />
        </div>
      </div>

      {/* Bottlenecks and Alerts */}
      {metrics.bottlenecks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span>Performance Bottlenecks</span>
          </h4>
          <div className="space-y-2">
            {metrics.bottlenecks.map((bottleneck, index) => (
              <div
                key={index}
                className="p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200"
              >
                {bottleneck}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node-specific Metrics */}
      {nodeMetrics.size > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Node Performance
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
            {Array.from(nodeMetrics.entries()).map(([nodeId, metrics]) => (
              <div
                key={nodeId}
                onClick={() => setSelectedNode(selectedNode === nodeId ? null : nodeId)}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedNode === nodeId
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {nodeId}
                  </span>
                  <Eye className="w-3 h-3 text-gray-500" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">CPU</span>
                    <div className={`font-medium ${getPerformanceRating(metrics.cpuUsage, 'cpu').color}`}>
                      {metrics.cpuUsage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Memory</span>
                    <div className={`font-medium ${getPerformanceRating(metrics.memoryUsage, 'memory').color}`}>
                      {formatBytes(metrics.memoryUsage)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Time</span>
                    <div className={`font-medium ${getPerformanceRating(metrics.executionTime, 'latency').color}`}>
                      {formatDuration(metrics.executionTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Rate Indicator */}
      {metrics.errorRate > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Error Rate: {metrics.errorRate.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
