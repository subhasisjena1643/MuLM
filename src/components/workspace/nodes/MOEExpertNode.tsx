import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Network, Users, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface MOEExpertData {
  label: string;
  expertCount?: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  activeExperts?: number[];
}

export const MOEExpertNode: React.FC<NodeProps<MOEExpertData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running': return <Play className="w-4 h-4 text-purple-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const expertCount = data.expertCount || 4;
  const activeExperts = data.activeExperts || [];

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 min-w-[220px]
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
      hover:shadow-md cursor-pointer
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Network className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {data.label}
            </h3>
            {getStatusIcon()}
          </div>
          
          <div className="flex items-center space-x-1 mt-1">
            <Users className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {expertCount} Experts
            </span>
          </div>
          
          {/* Expert indicators */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-300">Expert Status</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: expertCount }).map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-4 h-4 rounded border text-xs flex items-center justify-center font-mono
                    ${activeExperts.includes(index)
                      ? 'bg-purple-500 border-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
                    }
                    ${data.status === 'running' && activeExperts.includes(index) ? 'animate-pulse' : ''}
                  `}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};
