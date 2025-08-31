import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGridStorage } from '../../storage/GridStorageIntegration';

interface SmoothGridStatsProps {
  refreshInterval?: number;
  enableSmoothTransitions?: boolean;
}

export const SmoothGridStats: React.FC<SmoothGridStatsProps> = ({
  refreshInterval = 1000,
  enableSmoothTransitions = true
}) => {
  const { gridStorage } = useGridStorage();
  const [stats, setStats] = useState({
    totalBlocks: 0,
    activeWorkflows: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    gridDimensions: { width: 0, height: 0 },
    lastUpdate: new Date(),
    smoothTransition: true
  });
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const updateStats = useCallback(() => {
    if (gridStorage) {
      const newStats = gridStorage.getStorageStats();
      setStats(prevStats => ({
        ...newStats,
        // Smooth transition for numeric values during dragging
        totalBlocks: enableSmoothTransitions && isDragging ? 
          Math.round((prevStats.totalBlocks + newStats.totalBlocks) / 2) : 
          newStats.totalBlocks,
        memoryUsage: enableSmoothTransitions && isDragging ?
          Math.round((prevStats.memoryUsage + newStats.memoryUsage) * 50) / 100 :
          newStats.memoryUsage
      }));
    }
  }, [gridStorage, enableSmoothTransitions, isDragging]);

  // Enhanced update frequency during dragging
  useEffect(() => {
    const interval = isDragging ? 100 : refreshInterval; // 10fps during drag, 1fps normally
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(updateStats, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateStats, refreshInterval, isDragging]);

  // Listen for drag events from the workspace
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);
    
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('mouseup', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  // Initial load
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  return (
    <div className={`grid-stats-display transition-all duration-300 ${
      isDragging ? 'opacity-90 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📊 Grid Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Total Blocks */}
          <div className={`transition-all duration-200 ${isDragging ? 'animate-pulse' : ''}`}>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Blocks</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalBlocks}
            </div>
          </div>

          {/* Active Workflows */}
          <div className={`transition-all duration-200 ${isDragging ? 'animate-pulse' : ''}`}>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.activeWorkflows}
            </div>
          </div>

          {/* Memory Usage */}
          <div className={`transition-all duration-200 ${isDragging ? 'animate-pulse' : ''}`}>
            <div className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {stats.memoryUsage.toFixed(2)} MB
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className={`transition-all duration-200 ${isDragging ? 'animate-pulse' : ''}`}>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {(stats.cacheHitRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Grid Dimensions */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Grid Size</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.gridDimensions.width} × {stats.gridDimensions.height}
          </div>
        </div>

        {/* Last Update Time */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {stats.lastUpdate.toLocaleTimeString()}
          {isDragging && (
            <span className="ml-2 text-blue-500 animate-pulse">
              🔄 Live updating...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmoothGridStats;
