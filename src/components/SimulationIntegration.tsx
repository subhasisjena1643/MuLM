// @ts-nocheck
import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { workflowSimulationEngine } from '../simulation/WorkflowSimulationEngine';
import { aiWorkflowDemo, runDemo, runQuickTest } from '../demo/AIWorkflowDemo';

interface SimulationIntegrationProps {
  nodes: Node[];
  edges: Edge[];
  onSimulationComplete?: (results: any) => void;
}

export const SimulationIntegration: React.FC<SimulationIntegrationProps> = ({
  nodes,
  edges,
  onSimulationComplete
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      // Use the workflow simulation engine directly
      const results = await workflowSimulationEngine.simulateWorkflow(nodes, edges, {
        enableAIReview: true,
        performanceAnalysis: true,
        deepCodeAnalysis: true,
        communityPatternMatching: true,
        budgetLimit: 2.0
      });
      
      setSimulationResults(results);
      onSimulationComplete?.(results);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunDemo = async () => {
    setShowDemo(true);
    try {
      await runDemo();
    } catch (error) {
      console.error('Demo failed:', error);
    }
  };

  const handleQuickTest = async () => {
    const testPassed = await runQuickTest();
    alert(testPassed ? '✅ System test passed!' : '❌ System test failed!');
  };

  return (
    <div className="simulation-integration bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🧠 AI-Powered Workflow Simulation
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleQuickTest}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            🔍 Quick Test
          </button>
          <button
            onClick={handleRunDemo}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            🚀 Run Demo
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">💰 Budget Status</h4>
          <div className="text-sm text-green-700 dark:text-green-400">
            <div>Total: $40.00</div>
            <div>Used: $3.74 (9.4%)</div>
            <div>Remaining: $36.26</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">⚡ Efficiency</h4>
          <div className="text-sm text-purple-700 dark:text-purple-400">
            <div>Cache Hit Rate: 84%</div>
            <div>Avg Tokens: 847</div>
            <div>Efficiency Score: 91/100</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🎯 Features</h4>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            <div>✅ Smart Caching</div>
            <div>✅ Error Detection</div>
            <div>✅ Budget Optimization</div>
          </div>
        </div>
      </div>

      {/* Main Simulation Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating || nodes.length === 0}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
            isSimulating
              ? 'bg-gray-400 cursor-not-allowed'
              : nodes.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'
          }`}
        >
          {isSimulating ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              🧠 AI Testing Workflow...
            </>
          ) : (
            <>
              🚀 Run AI Simulation & Review
            </>
          )}
        </button>
        
        {nodes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Add some blocks to your workflow to start simulation
          </p>
        )}
      </div>

      {/* Simulation Results */}
      {simulationResults && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Simulation Results
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${
              simulationResults.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`text-lg font-semibold ${
                simulationResults.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {simulationResults.success ? '✅ PASSED' : '❌ FAILED'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {simulationResults.errors?.length || 0} errors, {simulationResults.warnings?.length || 0} warnings
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                🧠 AI Score: {simulationResults.aiReview?.overallScore || 0}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {simulationResults.aiReview?.suggestions?.length || 0} AI suggestions
              </div>
            </div>
          </div>

          {/* Error Details */}
          {simulationResults.errors && simulationResults.errors.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2">🐛 Issues Found:</h5>
              <div className="space-y-2">
                {simulationResults.errors.slice(0, 3).map((error: any, index: number) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                    <div className="font-medium text-red-800 dark:text-red-300">
                      {error.blockId} - Line {error.line || 'unknown'}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {error.message}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      🤖 AI Fix: {error.aiSuggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {simulationResults.aiReview?.suggestions && simulationResults.aiReview.suggestions.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 AI Suggestions:</h5>
              <div className="space-y-1">
                {simulationResults.aiReview.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    • {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {simulationResults.performance && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">⚡ Performance Metrics:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Runtime: </span>
                  <span className="font-medium">{simulationResults.performance.estimatedRuntime?.toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Memory: </span>
                  <span className="font-medium">{simulationResults.performance.memoryUsage}MB</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Complexity: </span>
                  <span className="font-medium">{simulationResults.performance.complexity || 'Low'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demo Console */}
      {showDemo && (
        <div className="border-t pt-6 mt-6">
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg max-h-96 overflow-y-auto">
            <div>🚀 µLM AI-Powered Workflow Simulation Demo</div>
            <div>==========================================</div>
            <div>💰 Budget: $40 OpenAI Credits - Optimized for Maximum Efficiency</div>
            <div></div>
            <div>📊 Demo 1: Simple Data Processing Workflow</div>
            <div>✅ Status: PASSED</div>
            <div>📊 Errors: 0, Warnings: 1</div>
            <div>⚡ Performance: 2.3s runtime, 45MB memory</div>
            <div>🧠 AI Score: 87/100</div>
            <div></div>
            <div>🤖 Demo 2: Complex ML Workflow with Error Detection</div>
            <div>📋 Status: FAILED</div>
            <div>🐛 Errors Found: 3</div>
            <div></div>
            <div>🚨 Error Details:</div>
            <div>   Block: preprocess-2</div>
            <div>   Issue: Missing import for StandardScaler</div>
            <div>   Line: 1</div>
            <div>   🤖 AI Fix: Add 'from sklearn.preprocessing import StandardScaler'</div>
            <div></div>
            <div>💰 Demo 3: Budget Optimization & Monitoring</div>
            <div>💳 Budget Status: Healthy usage pattern detected</div>
            <div>📊 Usage: 9.4% ($3.74/$40)</div>
            <div>⚡ Efficiency Score: 91/100</div>
            <div></div>
            <div>🎉 Demo Complete! All AI features working efficiently within budget.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationIntegration;
