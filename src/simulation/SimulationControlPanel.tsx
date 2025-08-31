// @ts-nocheck
// LabVIEW-Style Simulation Control Panel
// Professional controls for workflow simulation testing

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  RotateCcw,
  Zap,
  Settings,
  BarChart3,
  Bug,
  FlaskConical,
  Users,
  Download,
  Upload
} from 'lucide-react';
import { RealTimeSimulationEngine, SimulationState } from './RealTimeSimulationEngine';

interface SimulationControlPanelProps {
  simulationEngine: RealTimeSimulationEngine;
  workflowData?: any;
  isDark?: boolean;
  onInputDataChange?: (data: any[]) => void;
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  simulationEngine,
  workflowData,
  isDark = false,
  onInputDataChange
}) => {
  const [simulationState, setSimulationState] = useState<SimulationState>(simulationEngine.getState());
  const [inputData, setInputData] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchInputs, setBatchInputs] = useState<any[]>([]);
  const [loadTestSettings, setLoadTestSettings] = useState({
    concurrentUsers: 10,
    duration: 60000,
    rampUpTime: 5000
  });

  useEffect(() => {
    const updateState = () => {
      setSimulationState(simulationEngine.getState());
    };

    simulationEngine.on('simulation_started', updateState);
    simulationEngine.on('simulation_paused', updateState);
    simulationEngine.on('simulation_resumed', updateState);
    simulationEngine.on('simulation_stopped', updateState);
    simulationEngine.on('simulation_stepped', updateState);
    simulationEngine.on('speed_changed', updateState);

    return () => {
      simulationEngine.off('simulation_started', updateState);
      simulationEngine.off('simulation_paused', updateState);
      simulationEngine.off('simulation_resumed', updateState);
      simulationEngine.off('simulation_stopped', updateState);
      simulationEngine.off('simulation_stepped', updateState);
      simulationEngine.off('speed_changed', updateState);
    };
  }, [simulationEngine]);

  const handlePlayPause = () => {
    if (simulationState.status === 'running') {
      simulationEngine.pauseSimulation();
    } else if (simulationState.status === 'paused') {
      simulationEngine.resumeSimulation();
    } else {
      simulationEngine.startSimulation(workflowData, inputData);
    }
  };

  const handleStop = () => {
    simulationEngine.stopSimulation();
  };

  const handleStep = () => {
    simulationEngine.stepSimulation();
  };

  const handleReset = () => {
    simulationEngine.stopSimulation();
    setInputData([]);
    setBatchInputs([]);
  };

  const handleSpeedChange = (speed: number) => {
    simulationEngine.setSimulationSpeed(speed);
  };

  const handleInputDataAdd = () => {
    const newInput = { timestamp: Date.now(), data: {} };
    const updatedInputs = [...inputData, newInput];
    setInputData(updatedInputs);
    onInputDataChange?.(updatedInputs);
  };

  const handleInputDataRemove = (index: number) => {
    const updatedInputs = inputData.filter((_, i) => i !== index);
    setInputData(updatedInputs);
    onInputDataChange?.(updatedInputs);
  };

  const handleBatchTest = async () => {
    if (batchInputs.length === 0) return;
    
    try {
      const results = await simulationEngine.runBatchTest(batchInputs);
      console.log('Batch test results:', results);
      // Handle results display
    } catch (error) {
      console.error('Batch test failed:', error);
    }
  };

  const handleLoadTest = async () => {
    try {
      const results = await simulationEngine.runLoadTest(
        loadTestSettings.concurrentUsers,
        loadTestSettings.duration
      );
      console.log('Load test results:', results);
      // Handle results display
    } catch (error) {
      console.error('Load test failed:', error);
    }
  };

  const handleStressTest = async () => {
    // Generate edge case inputs
    const edgeCases = [
      { type: 'empty', data: {} },
      { type: 'null', data: null },
      { type: 'large', data: { content: 'x'.repeat(10000) } },
      { type: 'malformed', data: { invalid: Symbol('test') } }
    ];
    
    try {
      const results = await simulationEngine.runStressTest(edgeCases);
      console.log('Stress test results:', results);
      // Handle results display
    } catch (error) {
      console.error('Stress test failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (simulationState.status) {
      case 'running': return 'text-green-600 dark:text-green-400';
      case 'paused': return 'text-yellow-600 dark:text-yellow-400';
      case 'stopped': return 'text-gray-600 dark:text-gray-400';
      case 'stepping': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Simulation Control
        </h3>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-medium capitalize">
            {simulationState.status}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Primary Controls */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <button
              onClick={handlePlayPause}
              disabled={!workflowData}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                simulationState.status === 'running'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {simulationState.status === 'running' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleStop}
              disabled={simulationState.status === 'stopped'}
              className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleStep}
              disabled={simulationState.status !== 'paused'}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              <span>Step</span>
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Simulation Speed: {simulationState.speed}x
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={simulationState.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0.1x</span>
            <span>1x</span>
            <span>10x</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(simulationState.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${simulationState.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Step {simulationState.currentStep} of {simulationState.totalSteps}</span>
          <span>{Math.round(simulationState.elapsedTime / 1000)}s</span>
        </div>
      </div>

      {/* Input Data Management */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Input Data ({inputData.length})
          </h4>
          <button
            onClick={handleInputDataAdd}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Add Input
          </button>
        </div>
        
        <div className="max-h-32 overflow-y-auto space-y-2">
          {inputData.map((input, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
              <span className="text-gray-600 dark:text-gray-300">Input #{index + 1}</span>
              <button
                onClick={() => handleInputDataRemove(index)}
                className="text-red-600 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Testing Controls */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-3"
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Testing</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            {/* Testing Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBatchTest}
                disabled={batchInputs.length === 0}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors disabled:opacity-50"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Batch Test</span>
              </button>
              
              <button
                onClick={handleLoadTest}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Load Test</span>
              </button>
              
              <button
                onClick={handleStressTest}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Stress Test</span>
              </button>
              
              <button
                onClick={() => console.log('Export report')}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Load Test Settings */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Load Test Settings
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1">
                    Concurrent Users
                  </label>
                  <input
                    type="number"
                    value={loadTestSettings.concurrentUsers}
                    onChange={(e) => setLoadTestSettings(prev => ({
                      ...prev,
                      concurrentUsers: parseInt(e.target.value) || 10
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1">
                    Duration (ms)
                  </label>
                  <input
                    type="number"
                    value={loadTestSettings.duration}
                    onChange={(e) => setLoadTestSettings(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 60000
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
