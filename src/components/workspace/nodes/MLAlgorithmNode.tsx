import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface MLAlgorithmData {
  label: string;
  algorithm?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  accuracy?: number;
}

export const MLAlgorithmNode: React.FC<NodeProps<MLAlgorithmData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running': return <Play className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 min-w-[200px]
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      hover:shadow-md cursor-pointer
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {data.label}
            </h3>
            {getStatusIcon()}
          </div>
          
          {data.algorithm && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.algorithm.replace('_', ' ').toUpperCase()}
            </p>
          )}
          
          {data.accuracy && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">Accuracy</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(data.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${data.accuracy * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
