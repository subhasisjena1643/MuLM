// @ts-nocheck
/**
 * Workflow Test Panel Component
 * Displays validation results, errors, and auto-fix options
 */

import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  Play, 
  RefreshCw,
  Eye,
  Settings,
  Bug,
  Zap,
  Clock,
  MemoryStick,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { WorkflowValidationService, ValidationResult, ValidationError } from '../services/WorkflowValidationService';

interface WorkflowTestPanelProps {
  nodes: Node[];
  edges: Edge[];
  onNodesUpdate: (nodes: Node[]) => void;
  onSimulationUnlock: (canSimulate: boolean) => void;
  isDark?: boolean;
  isVisible?: boolean;
  onToggle?: () => void;
}

export const WorkflowTestPanel: React.FC<WorkflowTestPanelProps> = ({
  nodes,
  edges,
  onNodesUpdate,
  onSimulationUnlock,
  isDark = false,
  isVisible = true,
  onToggle
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['errors']));
  const [isAutoFixing, setIsAutoFixing] = useState(false);

  // Auto-validate when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      validateWorkflow();
    } else {
      setValidationResult(null);
      onSimulationUnlock(false);
    }
  }, [nodes, edges]);

  // Update simulation lock based on validation
  useEffect(() => {
    if (validationResult) {
      // Only lock simulation for critical errors, allow warnings
      const hasCriticalErrors = validationResult.errors.some(error => 
        error.severity === 'error' && error.category !== 'performance'
      );
      onSimulationUnlock(!hasCriticalErrors);
    }
  }, [validationResult, onSimulationUnlock]);

  const validateWorkflow = async () => {
    setIsValidating(true);
    try {
      const result = await WorkflowValidationService.validateWorkflow(nodes, edges);
      setValidationResult(result);
      setLastValidation(new Date());
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoFix = async () => {
    if (!validationResult || validationResult.errors.length === 0) return;

    setIsAutoFixing(true);
    try {
      const autoFixableErrors = validationResult.errors.filter(error => error.autoFixAvailable);
      if (autoFixableErrors.length > 0) {
        const fixedNodes = await WorkflowValidationService.autoFixWorkflow(nodes, autoFixableErrors);
        onNodesUpdate(fixedNodes);
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setIsAutoFixing(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getErrorIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'configuration':
        return <Settings className="w-4 h-4" />;
      case 'connection':
        return <Zap className="w-4 h-4" />;
      case 'implementation':
        return <Bug className="w-4 h-4" />;
      case 'performance':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 z-50"
        title="Open Test Panel"
      >
        <TestTube className="w-5 h-5 inline mr-2" />
        Test Workflow
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    } transition-transform duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <TestTube className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workflow Test Panel
          </h3>
          {validationResult && (
            <div className="flex items-center space-x-2">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                validationResult.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResult.isValid ? 'All Tests Passed' : `${validationResult.errors.length} Error(s)`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {lastValidation && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last test: {lastValidation.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={validateWorkflow}
            disabled={isValidating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
            title="Run Tests"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
          </button>

          {validationResult && validationResult.errors.some(e => e.autoFixAvailable) && (
            <button
              onClick={handleAutoFix}
              disabled={isAutoFixing}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
              title="Auto-Fix Errors"
            >
              {isAutoFixing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="Close Test Panel"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isValidating ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Running workflow tests...</span>
          </div>
        ) : validationResult ? (
          <div className="p-4 space-y-4">
            {/* Performance Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Execution Time:</span>
                  <span className="font-mono">{validationResult.performance.estimatedExecutionTime}ms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MemoryStick className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                  <span className="font-mono">{validationResult.performance.memoryUsage}MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                  <span className={`font-semibold capitalize ${
                    validationResult.performance.complexity === 'high' ? 'text-red-600' :
                    validationResult.performance.complexity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {validationResult.performance.complexity}
                  </span>
                </div>
              </div>
            </div>

            {/* Errors Section */}
            {validationResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg">
                <button
                  onClick={() => toggleSection('errors')}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h4 className="font-medium text-red-900 dark:text-red-100">
                      Errors ({validationResult.errors.length})
                    </h4>
                  </div>
                  {expandedSections.has('errors') ? (
                    <ChevronDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-red-500" />
                  )}
                </button>
                
                {expandedSections.has('errors') && (
                  <div className="px-4 pb-4 space-y-2">
                    {validationResult.errors.map((error) => (
                      <div key={error.id} className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-red-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getCategoryIcon(error.category)}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {error.blockName}
                              </span>
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {error.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {error.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              💡 {error.suggestion}
                            </p>
                          </div>
                          {error.autoFixAvailable && (
                            <button
                              onClick={() => handleAutoFix()}
                              className="ml-3 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              title="Auto-fix this error"
                            >
                              <Wrench className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Warnings Section */}
            {validationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <button
                  onClick={() => toggleSection('warnings')}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      Warnings ({validationResult.warnings.length})
                    </h4>
                  </div>
                  {expandedSections.has('warnings') ? (
                    <ChevronDown className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  )}
                </button>
                
                {expandedSections.has('warnings') && (
                  <div className="px-4 pb-4 space-y-2">
                    {validationResult.warnings.map((warning) => (
                      <div key={warning.id} className="bg-white dark:bg-gray-800 rounded p-3 border-l-4 border-yellow-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getCategoryIcon(warning.category)}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {warning.blockName}
                              </span>
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {warning.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {warning.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              💡 {warning.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                      <span className="mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success State */}
            {validationResult.isValid && validationResult.errors.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  All Tests Passed! 🎉
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Your workflow is ready for simulation
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <Play className="w-4 h-4" />
                  <span>Simulation unlocked</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Add blocks to your workflow to run tests
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
