// Intelligent Workflow Simulator Component
// UI integration for AI-powered workflow testing and error detection

import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { workflowSimulationEngine, SimulationOptions } from '../simulation/WorkflowSimulationEngine';
import { SimulationResult, WorkflowError } from '../services/OpenAIEfficiencyService';
import { openAIEfficiencyService } from '../services/OpenAIEfficiencyService';

interface SimulationProps {
  nodes: Node[];
  edges: Edge[];
  onSimulationComplete?: (result: SimulationResult) => void;
}

export const WorkflowSimulator: React.FC<SimulationProps> = ({ 
  nodes, 
  edges, 
  onSimulationComplete 
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [simulationOptions, setSimulationOptions] = useState<SimulationOptions>({
    enableAIReview: true,
    performanceAnalysis: true,
    deepCodeAnalysis: true,
    communityPatternMatching: true,
    budgetLimit: 2.0
  });

  const runSimulation = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add blocks to your workflow before simulating');
      return;
    }

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      console.log('🚀 Starting workflow simulation...');
      const result = await workflowSimulationEngine.simulateWorkflow(nodes, edges, simulationOptions);
      
      setSimulationResult(result);
      onSimulationComplete?.(result);

      // Show success/failure notification
      if (result.success) {
        console.log('✅ Simulation completed successfully!');
      } else {
        console.log('❌ Simulation found issues that need attention');
      }

    } catch (error) {
      console.error('💥 Simulation failed:', error);
      alert(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges, simulationOptions, onSimulationComplete]);

  const getBudgetInfo = () => {
    const stats = openAIEfficiencyService.getUsageStats();
    return {
      used: stats.totalCost,
      remaining: stats.remainingBudget,
      percentage: (stats.totalCost / (stats.totalCost + stats.remainingBudget)) * 100
    };
  };

  const budgetInfo = getBudgetInfo();

  return (
    <div className="workflow-simulator p-4 bg-white rounded-lg shadow-lg">
      {/* Simulation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">
            🧠 Intelligent Workflow Simulator
          </h3>
          <div className="text-sm text-gray-600">
            {nodes.length} blocks • {edges.length} connections
          </div>
        </div>
        
        {/* Budget Display */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="text-gray-600">Budget:</div>
          <div className={`font-medium ${budgetInfo.remaining > 5 ? 'text-green-600' : 'text-orange-600'}`}>
            ${budgetInfo.used.toFixed(2)} / ${(budgetInfo.used + budgetInfo.remaining).toFixed(2)}
          </div>
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${budgetInfo.percentage < 80 ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(budgetInfo.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Simulation Options */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Simulation Options</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={simulationOptions.enableAIReview}
              onChange={(e) => setSimulationOptions(prev => ({ ...prev, enableAIReview: e.target.checked }))}
              className="rounded"
            />
            <span>AI Code Review</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={simulationOptions.performanceAnalysis}
              onChange={(e) => setSimulationOptions(prev => ({ ...prev, performanceAnalysis: e.target.checked }))}
              className="rounded"
            />
            <span>Performance Analysis</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={simulationOptions.deepCodeAnalysis}
              onChange={(e) => setSimulationOptions(prev => ({ ...prev, deepCodeAnalysis: e.target.checked }))}
              className="rounded"
            />
            <span>Deep Code Analysis</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={simulationOptions.communityPatternMatching}
              onChange={(e) => setSimulationOptions(prev => ({ ...prev, communityPatternMatching: e.target.checked }))}
              className="rounded"
            />
            <span>Pattern Matching</span>
          </label>
        </div>
      </div>

      {/* Simulate Button */}
      <button
        onClick={runSimulation}
        disabled={isSimulating || nodes.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          isSimulating 
            ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
            : nodes.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
        }`}
      >
        {isSimulating ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Running AI Simulation...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>🧪</span>
            <span>Simulate Workflow</span>
          </div>
        )}
      </button>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="mt-6 space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-l-4 ${
            simulationResult.success 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{simulationResult.success ? '✅' : '❌'}</span>
                <div>
                  <div className="font-semibold">
                    {simulationResult.success ? 'Simulation Passed!' : 'Issues Found'}
                  </div>
                  <div className="text-sm opacity-75">
                    Score: {simulationResult.aiReview.overallScore}/100 • 
                    {simulationResult.errors.length} errors • 
                    {simulationResult.warnings.length} warnings
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm underline hover:no-underline"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {simulationResult.performance.estimatedRuntime.toFixed(1)}s
              </div>
              <div className="text-sm text-blue-800">Est. Runtime</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {simulationResult.performance.memoryUsage.toFixed(0)}MB
              </div>
              <div className="text-sm text-purple-800">Memory Usage</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {simulationResult.performance.cpuIntensity.toFixed(0)}%
              </div>
              <div className="text-sm text-orange-800">CPU Intensity</div>
            </div>
          </div>

          {/* Detailed Results */}
          {showDetails && (
            <div className="space-y-4">
              {/* Errors */}
              {simulationResult.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">🚨 Errors Found:</h4>
                  <div className="space-y-3">
                    {simulationResult.errors.map((error, index) => (
                      <ErrorDisplay key={index} error={error} />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {simulationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Warnings:</h4>
                  <div className="space-y-2">
                    {simulationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-yellow-700 text-sm">
                        <strong>{warning.blockId}:</strong> {warning.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {simulationResult.aiReview.suggestions.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">💡 AI Suggestions:</h4>
                  <ul className="space-y-1">
                    {simulationResult.aiReview.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optimizations */}
              {simulationResult.aiReview.optimizations.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">🚀 Optimizations:</h4>
                  <ul className="space-y-1">
                    {simulationResult.aiReview.optimizations.map((optimization, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{optimization}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Error Display Component with Code Context
const ErrorDisplay: React.FC<{ error: WorkflowError }> = ({ error }) => {
  return (
    <div className="border border-red-200 rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-red-800">
            Block: {error.blockId} {error.line && `(Line ${error.line})`}
          </div>
          <div className="text-sm text-red-600">{error.message}</div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          error.severity === 'error' ? 'bg-red-100 text-red-800' :
          error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {error.severity}
        </span>
      </div>
      
      {/* Code Context */}
      {error.codeContext && (
        <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre-wrap mb-2">
          {error.codeContext}
        </div>
      )}
      
      {/* AI Suggestion */}
      <div className="bg-blue-50 p-2 rounded">
        <div className="text-xs font-medium text-blue-800 mb-1">💡 AI Suggestion:</div>
        <div className="text-sm text-blue-700">{error.aiSuggestion}</div>
      </div>
    </div>
  );
};

export default WorkflowSimulator;
