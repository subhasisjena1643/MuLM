// @ts-nocheck
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Settings, 
  Share,
  Sun,
  Moon,
  Home,
  ChevronRight,
  Menu,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkspaceTopBarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  isSimulating: boolean;
  onSimulate: () => void;
  canSimulate?: boolean;
  onExecutionPanelToggle?: () => void;
  onSimulationPanelToggle?: () => void;
  onPerformancePanelToggle?: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  isLeftPanelOpen?: boolean;
  onLeftPanelToggle?: () => void;
  onExecuteDemo?: () => void;
  isExecuting?: boolean;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  workflowName,
  onWorkflowNameChange,
  isSimulating,
  onSimulate,
  canSimulate = false,
  onExecutionPanelToggle,
  onSimulationPanelToggle,
  onPerformancePanelToggle,
  isDark,
  onThemeToggle,
  isLeftPanelOpen = true,
  onLeftPanelToggle,
  onExecuteDemo,
  isExecuting = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-50 shadow-sm">
      {/* Left section - Panel toggle, breadcrumb and workflow name */}
      <div className="flex items-center space-x-4">
        {onLeftPanelToggle && (
          <button
            onClick={onLeftPanelToggle}
            className={`p-2 rounded-lg transition-colors ${
              isLeftPanelOpen 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle Block Palette"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">µLM</span>
        </Link>
        
        <ChevronRight className="w-4 h-4 text-gray-400" />
        
        {isEditing ? (
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="px-3 py-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <h1 
            className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {workflowName}
          </h1>
        )}
      </div>

      {/* Center section - Simulation controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onSimulate}
          disabled={isSimulating || !canSimulate}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${!canSimulate
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : isSimulating 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md
          `}
          title={!canSimulate ? 'Fix workflow errors to unlock simulation' : 'Run workflow simulation'}
        >
          {!canSimulate ? (
            <>
              <span className="text-lg">🔒</span>
              <span>Locked</span>
            </>
          ) : isSimulating ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Simulate</span>
            </>
          )}
        </button>

        {/* Demo Execution Button */}
        {onExecuteDemo && (
          <button
            onClick={onExecuteDemo}
            disabled={isExecuting}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isExecuting 
                ? 'bg-amber-500 text-white cursor-wait animate-pulse' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105'
              }
              shadow-sm hover:shadow-lg disabled:opacity-75
            `}
            title="Execute workflow with realistic demo results"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Demo Run</span>
              </>
            )}
          </button>
        )}

        {onExecutionPanelToggle && (
          <button
            onClick={onExecutionPanelToggle}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>Execute</span>
          </button>
        )}

        {onSimulationPanelToggle && (
          <button
            onClick={onSimulationPanelToggle}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>Simulation</span>
          </button>
        )}

        {onPerformancePanelToggle && (
          <button
            onClick={onPerformancePanelToggle}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics</span>
          </button>
        )}

        {isSimulating && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Right section - Actions and theme toggle */}
      <div className="flex items-center space-x-3">
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
          <Save className="w-4 h-4" />
        </button>
        
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
          <Download className="w-4 h-4" />
        </button>
        
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
          <Share className="w-4 h-4" />
        </button>
        
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
          <Settings className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
