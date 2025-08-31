import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Search, FileText, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface RAGToolData {
  label: string;
  toolType?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  documentsRetrieved?: number;
  vectorCount?: number;
}

export const RAGToolNode: React.FC<NodeProps<RAGToolData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running': return <Play className="w-4 h-4 text-green-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const getToolIcon = () => {
    switch (data.toolType) {
      case 'vector_db': return <Database className="w-4 h-4 text-white" />;
      case 'search': return <Search className="w-4 h-4 text-white" />;
      case 'document': return <FileText className="w-4 h-4 text-white" />;
      default: return <Database className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 min-w-[200px]
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-green-500 ring-offset-2' : ''}
      hover:shadow-md cursor-pointer
    `}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          {getToolIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {data.label}
            </h3>
            {getStatusIcon()}
          </div>
          
          {data.toolType && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.toolType.replace('_', ' ').toUpperCase()}
            </p>
          )}
          
          {/* RAG specific metrics */}
          <div className="mt-2 space-y-1">
            {data.documentsRetrieved !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">Documents</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.documentsRetrieved}
                </span>
              </div>
            )}
            
            {data.vectorCount !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">Vectors</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.vectorCount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          {/* Retrieval indicator */}
          {data.status === 'running' && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-green-600">Retrieving...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </div>
  );
};
