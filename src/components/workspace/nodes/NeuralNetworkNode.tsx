import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Layers, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface NeuralNetworkData {
  label: string;
  architecture?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  layers?: number;
  parameters?: number;
  trainingProgress?: number;
}

export const NeuralNetworkNode: React.FC<NodeProps<NeuralNetworkData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running': return <Play className="w-4 h-4 text-orange-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatParameters = (params: number) => {
    if (params >= 1000000) return `${(params / 1000000).toFixed(1)}M`;
    if (params >= 1000) return `${(params / 1000).toFixed(1)}K`;
    return params.toString();
  };

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 min-w-[220px]
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
      hover:shadow-md cursor-pointer
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {data.label}
            </h3>
            {getStatusIcon()}
          </div>
          
          {data.architecture && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.architecture.toUpperCase()}
            </p>
          )}
          
          {/* Network specs */}
          <div className="mt-2 space-y-1">
            {data.layers && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">Layers</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.layers}
                </span>
              </div>
            )}
            
            {data.parameters && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">Parameters</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatParameters(data.parameters)}
                </span>
              </div>
            )}
          </div>
          
          {/* Training progress */}
          {data.trainingProgress !== undefined && data.status === 'running' && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">Training</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(data.trainingProgress * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${data.trainingProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Neural activity visualization */}
          {data.status === 'running' && (
            <div className="mt-2">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-orange-500 rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.random() * 8 + 4}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: `${800 + Math.random() * 400}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    </div>
  );
};
