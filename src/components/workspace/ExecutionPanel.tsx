// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { workflowExecutionService } from '../../execution/services/WorkflowExecutionService';
import { ExecutionProgress, OptimizationSuggestion } from '../../execution/types/ExecutionTypes';

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData?: any;
  isDark?: boolean;
  onExecutionStart?: (executionId: string) => void;
  onExecutionComplete?: (executionId: string, result: any) => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  isOpen,
  onClose,
  workflowData,
  isDark = false,
  onExecutionStart,
  onExecutionComplete
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  // Monitor execution progress
  useEffect(() => {
    if (!currentExecution) return;

    const interval = setInterval(async () => {
      try {
        const executionProgress = workflowExecutionService.getExecutionProgress(currentExecution);
        setProgress(executionProgress);
        
        if (executionProgress && executionProgress.progress >= 100) {
          setIsExecuting(false);
          setCurrentExecution(null);
          if (onExecutionComplete) {
            onExecutionComplete(currentExecution, executionProgress);
          }
        }
      } catch (error) {
        console.error('Error monitoring progress:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentExecution, onExecutionComplete]);

  const executeWorkflow = async () => {
    if (!workflowData) {
      alert('No workflow data available for execution');
      return;
    }

    try {
      const validation = workflowExecutionService.validateWorkflow(workflowData);
      if (!validation.valid) {
        alert(`Workflow validation failed:\n${validation.errors.join('\n')}`);
        return;
      }

      setIsExecuting(true);
      const executionId = await workflowExecutionService.executeWorkflow(workflowData);
      setCurrentExecution(executionId);
      
      if (onExecutionStart) {
        onExecutionStart(executionId);
      }

      // Add to execution history
      setExecutionHistory(prev => [...prev, {
        id: executionId,
        startedAt: new Date(),
        status: 'running'
      }]);

    } catch (error) {
      console.error('Execution failed:', error);
      alert(`Execution failed: ${error.message}`);
      setIsExecuting(false);
    }
  };

  const cancelExecution = async () => {
    if (currentExecution) {
      try {
        await workflowExecutionService.cancelExecution(currentExecution);
        setIsExecuting(false);
        setCurrentExecution(null);
      } catch (error) {
        console.error('Failed to cancel execution:', error);
      }
    }
  };

  const getOptimizations = async () => {
    if (!workflowData) return;
    
    try {
      const suggestions = await workflowExecutionService.getOptimizationSuggestions(workflowData);
      setOptimizations(suggestions);
    } catch (error) {
      console.error('Failed to get optimizations:', error);
    }
  };

  const applyOptimization = async (optimizationId: string) => {
    if (!currentExecution) return;
    
    try {
      await workflowExecutionService.applyOptimization(currentExecution, optimizationId);
      alert('Optimization applied successfully!');
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      alert(`Failed to apply optimization: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🚀 Elastic Workflow Execution Engine
          </h3>
          <div className="flex gap-2">
            <button
              onClick={getOptimizations}
              disabled={!workflowData}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md transition-colors disabled:opacity-50"
            >
              💡 Optimize
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-full">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Elastic Execution Engine Active
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Auto-scaling • Resource optimization • Error recovery • Real-time streaming
              </p>
            </div>
          </div>
        </div>

        {/* Execution Controls */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={executeWorkflow}
            disabled={!workflowData || isExecuting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? '⏳ Executing...' : '🚀 Execute Workflow'}
          </button>

          {isExecuting && (
            <button
              onClick={cancelExecution}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
            >
              🛑 Cancel
            </button>
          )}
        </div>

        {/* Progress Display */}
        {progress && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Execution Progress
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress.completedNodes / progress.totalNodes * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completedNodes / progress.totalNodes * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {progress.completedNodes} of {progress.totalNodes} nodes completed
            </div>
            {progress.currentPhase && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Currently executing: {progress.currentPhase}
              </div>
            )}
          </div>
        )}

        {/* Feature Showcase */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600 dark:text-green-400">🔄</span>
              <h5 className="text-sm font-medium text-green-900 dark:text-green-100">Auto-Scaling</h5>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Dynamic resource allocation based on workload complexity
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-purple-600 dark:text-purple-400">📊</span>
              <h5 className="text-sm font-medium text-purple-900 dark:text-purple-100">Real-time Streaming</h5>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Live execution progress and intermediate results
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-orange-600 dark:text-orange-400">🛡️</span>
              <h5 className="text-sm font-medium text-orange-900 dark:text-orange-100">Error Recovery</h5>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              AI-assisted failure analysis and automatic retry mechanisms
            </p>
          </div>
          
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-cyan-600 dark:text-cyan-400">⚡</span>
              <h5 className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Optimization</h5>
            </div>
            <p className="text-xs text-cyan-700 dark:text-cyan-300">
              Intelligent workflow optimization and performance tuning
            </p>
          </div>
        </div>

        {/* Optimization Suggestions */}
        {optimizations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              💡 Optimization Suggestions
            </h4>
            <div className="space-y-2">
              {optimizations.map((opt, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {opt.type}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {opt.description}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Expected improvement: {opt.estimatedImprovement}%
                      </div>
                    </div>
                    <button
                      onClick={() => applyOptimization(opt.type)}
                      disabled={!currentExecution}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution History */}
        {executionHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📊 Recent Executions
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {executionHistory.slice(-5).reverse().map((execution, index) => (
                <div key={execution.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {execution.id.split('_')[1]}...
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {execution.startedAt.toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    execution.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    execution.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {execution.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
