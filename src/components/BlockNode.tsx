// @ts-nocheck
/**
 * Visual Block Renderer Component
 * Renders specific AI workflow blocks on the canvas
 * Similar to nodes in n8n, Blender, or After Effects
 */

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Play, Pause, AlertCircle, CheckCircle, Clock, Info, X, Maximize, Minimize } from 'lucide-react';
import { BlockDefinition, Port } from '../storage/types/GridTypes';

interface BlockNodeData {
  block: BlockDefinition;
  isExecuting?: boolean;
  executionStatus?: 'idle' | 'ready' | 'executing' | 'running' | 'success' | 'error' | 'warning';
  progress?: number;
  outputPreview?: any;
  executionTime?: number;
  lastResult?: any;
  error?: string;
  config?: Record<string, any>;
  onDelete?: (nodeId: string) => void;
  onResize?: (nodeId: string, isExpanded: boolean) => void;
  onMinimize?: (nodeId: string, isMinimized: boolean) => void;
  isResizable?: boolean;
  isMinimized?: boolean;
  isExpanded?: boolean;
  width?: number;
  height?: number;
}

interface BlockPortProps {
  port: Port;
  position: Position;
  isConnected?: boolean;
  value?: any;
  isExpanded?: boolean;
  isMinimized?: boolean;
}

const BlockPortComponent: React.FC<BlockPortProps> = ({ port, position, isConnected, value, isExpanded = false, isMinimized = false }) => {
  const getPortColor = (dataType: string, type: string) => {
    if (type === 'control') return '#6B7280'; // Gray
    if (type === 'event') return '#EF4444'; // Red
    
    switch (dataType) {
      case 'string': return '#10B981'; // Green
      case 'number': return '#3B82F6'; // Blue
      case 'boolean': return '#8B5CF6'; // Purple
      case 'array': return '#F59E0B'; // Amber
      case 'object': return '#EC4899'; // Pink
      case 'file': return '#6366F1'; // Indigo
      case 'any': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  return (
    <div className="relative group">
      <Handle
        type={position === Position.Left ? 'target' : 'source'}
        position={position}
        id={port.id}
        className="transition-all duration-200 hover:scale-125 hover:shadow-lg"
        style={{
          background: getPortColor(port.dataType || port.type, port.type),
          border: isConnected ? '3px solid #ffffff' : '2px solid #E5E7EB',
          width: isMinimized ? 8 : 12,
          height: isMinimized ? 8 : 12,
          minWidth: isMinimized ? 8 : 12,
          minHeight: isMinimized ? 8 : 12,
          boxShadow: isConnected 
            ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
        }}
      />
      
      {/* Port Label with Connection Hint */}
      {!isMinimized && (
        <div className={`absolute top-1/2 transform -translate-y-1/2 whitespace-nowrap pointer-events-none z-10
          ${position === Position.Left ? 'left-3' : 'right-3 text-right'}`}>
          <span className={`text-gray-700 bg-white/90 px-2 py-1 rounded-lg backdrop-blur-sm font-medium border border-gray-200 shadow-sm transition-all duration-200
            ${isExpanded ? 'text-sm' : 'text-xs'}`}>
            {port.name}
            {port.required && <span className="text-red-500 ml-1">*</span>}
            {!isConnected && (
              <span className="text-blue-500 ml-1 animate-pulse">⚡</span>
            )}
          </span>
        </div>
      )}

      {/* Port Tooltip */}
      <div className={`absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700
        ${position === Position.Left ? 'left-4 top-6' : 'right-4 top-6'}`}>
        <div className="font-medium">{port.name}</div>
        <div className="text-gray-300 capitalize">{port.dataType || port.type} {port.type}</div>
        {port.defaultValue !== undefined && (
          <div className="text-blue-300 text-xs">
            Default: {String(port.defaultValue)}
          </div>
        )}
        {value !== undefined && (
          <div className="text-green-300 text-xs truncate max-w-32">
            Value: {String(value).substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
};

const BlockNode: React.FC<NodeProps<BlockNodeData>> = ({ data, selected, id }) => {
  // Process blockData FIRST, before any hooks
  let blockData = null;
  
  if (data) {
    blockData = data.block;
    
    // If no block property, try to construct it from the data itself (backward compatibility)
    if (!blockData && data.label) {
      console.log('BlockNode: Converting legacy data structure for node:', id);
      blockData = {
        id: id,
        name: data.label,
        description: data.description || 'AI Generated Block',
        category: data.category || data.blockType || 'custom',
        version: '1.0.0',
        inputs: data.inputs || [],
        outputs: data.outputs || [],
        config: data.config || {},
        implementation: data.sourceCode || data.implementation || '',
        tags: ['converted'],
        performance: {
          avgExecutionTime: 100,
          memoryUsage: 'medium' as const
        },
        errorHandling: {
          retryable: true,
          timeout: 30000
        },
        metadata: {
          author: 'System',
          documentation: data.description || '',
          isGenerated: true
        }
      };
    }
  }

  // NOW we can call hooks safely with blockData available
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [blockSize, setBlockSize] = useState({ width: 240, height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const [localConfig, setLocalConfig] = useState(() => {
    return data?.config || (blockData && blockData.config) || {};
  });
  const nodeRef = useRef<HTMLDivElement>(null);

  // Early returns AFTER all hooks
  if (!data) {
    console.error('BlockNode: No data provided for node:', id);
    return (
      <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 min-w-[200px]">
        <div className="text-red-600 font-semibold">Error: No Data</div>
        <div className="text-red-500 text-sm">Node ID: {id}</div>
      </div>
    );
  }
  
  if (!blockData) {
    console.error('BlockNode: No block definition found for node:', id, 'Data keys:', Object.keys(data));
    return (
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 min-w-[200px]">
        <div className="text-yellow-600 font-semibold">Warning: Legacy Node Format</div>
        <div className="text-yellow-500 text-sm">Node ID: {id}</div>
        <div className="text-yellow-500 text-xs">Data keys: {Object.keys(data).join(', ')}</div>
        <div className="text-yellow-500 text-xs">Please regenerate this workflow for full compatibility</div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (data.executionStatus) {
      case 'ready':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'executing':
        return <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'running':
        return <Clock className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'mlAlgorithm': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100';
      case 'neuralNetwork': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100';
      case 'ragTool': return 'border-green-400 bg-gradient-to-br from-green-50 to-green-100';
      case 'custom': return 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100';
      default: return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Input': return '📥';
      case 'Data Preprocessing': return '🔧';
      case 'Neural Networks': return '🧠';
      case 'Output Processing': return '📤';
      case 'Utilities': return '⚙️';
      default: return '🔗';
    }
  };

  // Calculate port positions with better spacing - with safe access
  const inputPorts = (blockData.inputs || []).map((input, index) => ({
    ...input,
    top: isMinimized ? 20 + (index * 8) : 45 + (index * (isExpanded ? 35 : 28))
  }));

  const outputPorts = (blockData.outputs || []).map((output, index) => ({
    ...output,
    top: isMinimized ? 20 + (index * 8) : 45 + (index * (isExpanded ? 35 : 28))
  }));

  const baseHeight = isMinimized ? 40 : (isExpanded ? 120 : 90);
  const portSpacing = isMinimized ? 8 : (isExpanded ? 35 : 28);
  const nodeHeight = isMinimized ? 
    Math.max(40, 20 + Math.max(inputPorts.length, outputPorts.length) * 8 + 10) :
    Math.max(baseHeight, 45 + Math.max(inputPorts.length, outputPorts.length) * portSpacing + 15);
  const nodeWidth = isMinimized ? 120 : (isExpanded ? 320 : 260);

  const handleDelete = () => {
    if (data.onDelete && id) {
      data.onDelete(id);
    }
  };

  const handleResize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsExpanded(false);
    } else if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
    
    if (data.onResize && id) {
      data.onResize(id, !isMinimized && !isExpanded);
    }
  };

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    if (newMinimized) {
      setIsExpanded(false);
      setIsConfigOpen(false);
    }
    
    if (data.onMinimize && id) {
      data.onMinimize(id, newMinimized);
    }
  };

  // Handle double-click for input blocks to trigger file upload, for other blocks to select for right panel editing
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Handle file upload blocks first
    if (blockData?.category === 'input' && fileInputRef.current) {
      const hasFileConfig = Object.values(blockData?.config || {}).some(
        config => typeof config === 'object' && config.type === 'file'
      );
      
      if (hasFileConfig) {
        fileInputRef.current.click();
        return;
      }
    }
    
    // For all other blocks, trigger selection to open in right panel
    // This will be handled by the parent workspace component
    console.log('Block double-clicked for code editing:', blockData.name);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`📁 File selected for block ${blockData?.name}:`, file.name);
      
      // Update block config with file information
      if (data.config) {
        data.config.file = file;
        data.config.fileName = file.name;
        data.config.fileSize = file.size;
        data.config.lastModified = new Date(file.lastModified);
      }
      
      // Trigger visual feedback
      const nodeElement = nodeRef.current;
      if (nodeElement) {
        nodeElement.style.borderColor = '#10b981';
        nodeElement.style.borderWidth = '3px';
        setTimeout(() => {
          nodeElement.style.borderColor = '';
          nodeElement.style.borderWidth = '';
        }, 2000);
      }
    }
    
    // Clear the input for future selections
    event.target.value = '';
  };

  // Handle block resizing
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = blockSize.width;
    const startHeight = typeof blockSize.height === 'number' ? blockSize.height : 200;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction.includes('right')) {
        newWidth = Math.max(180, startWidth + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(180, startWidth - deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(120, startHeight + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(120, startHeight - deltaY);
      }
      
      setBlockSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selected) return;
      
      // M key for minimize/restore
      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        handleMinimize();
      }
      // E key for expand/collapse
      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        if (!isMinimized) {
          handleResize();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, isMinimized, isExpanded]);

  return (
    <div
      ref={nodeRef}
      className={`group relative bg-white rounded-lg shadow-md border-2 transition-all duration-200 select-none
        ${selected ? 'border-blue-400 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
        ${data.isExecuting ? 'animate-pulse' : ''}
        ${isResizing ? 'cursor-nw-resize' : ''}`}
      style={{ 
        width: isMinimized ? 180 : blockSize.width,
        height: isMinimized ? 'auto' : blockSize.height,
        minHeight: 60,
        minWidth: 180
      }}
      onDoubleClick={handleDoubleClick}
      title={blockData?.category === 'input' ? 'Double-click to upload file' : undefined}
    >
      {/* Hidden file input for upload functionality */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".csv,.json,.txt,.xlsx,.tsv"
      />
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg
        ${isMinimized ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${isMinimized ? 'text-sm' : 'text-base'}`}>
              {isMinimized ? blockData.name.substring(0, 12) + '...' : blockData.name}
            </h3>
            {!isMinimized && (
              <p className="text-blue-100 text-xs opacity-90">
                {blockData.category}
              </p>
            )}
          </div>
          
          <div className={`flex items-center ${isMinimized ? 'space-x-1' : 'space-x-2'}`}>
            {!isMinimized && getStatusIcon()}
            <button
              onClick={handleMinimize}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minimize className={isMinimized ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>
            {!isMinimized && (
              <>
                <button
                  onClick={() => console.log('Opening in right panel:', blockData.name)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
                  title="View Code in Panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar for Demo Execution */}
      {data.executionStatus === 'executing' && data.progress !== undefined && (
        <div className="bg-gray-100 h-1 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${data.progress}%` }}
          />
          {data.progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform translate-x-[-100%] animate-[shimmer_2s_infinite]" />
          )}
        </div>
      )}

      {/* Success Completion Animation */}
      {data.executionStatus === 'success' && (
        <div className="bg-green-100 border-b border-green-200 px-3 py-1 text-xs text-green-800 animate-[fadeIn_0.5s_ease-in]">
          ✅ Execution completed successfully
        </div>
      )}

      {/* Body */}
      {!isMinimized && (
        <div className="p-3">
          <p className="text-gray-600 text-sm mb-3">
            {blockData.description}
          </p>
          
          {/* Status Messages */}
          {data.error && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 mb-2">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {data.error}
            </div>
          )}

          {data.lastResult && !data.error && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 mb-2">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Completed
              {data.executionTime && (
                <span className="ml-1 text-gray-500">({data.executionTime}ms)</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Ports */}
      {inputPorts.map((port, index) => (
        <div
          key={port.id}
          style={{ 
            position: 'absolute', 
            left: -8, 
            top: isMinimized ? 25 + (index * 12) : 55 + (index * 20)
          }}
        >
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            style={{
              background: '#3B82F6',
              border: '2px solid white',
              width: 12,
              height: 12,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          {!isMinimized && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 whitespace-nowrap">
              <span className="text-xs text-gray-600 bg-white px-1 py-0.5 rounded shadow-sm border">
                {port.name}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Output Ports */}
      {outputPorts.map((port, index) => (
        <div
          key={port.id}
          style={{ 
            position: 'absolute', 
            right: -8, 
            top: isMinimized ? 25 + (index * 12) : 55 + (index * 20)
          }}
        >
          <Handle
            type="source"
            position={Position.Right}
            id={port.id}
            style={{
              background: '#10B981',
              border: '2px solid white',
              width: 12,
              height: 12,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          {!isMinimized && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 whitespace-nowrap">
              <span className="text-xs text-gray-600 bg-white px-1 py-0.5 rounded shadow-sm border">
                {port.name}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Resize Handles */}
      {!isMinimized && (
        <>
          {/* Bottom-right corner resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-gray-300 hover:bg-gray-400 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
            title="Drag to resize"
          >
            <div className="absolute bottom-1 right-1 w-2 h-2">
              <div className="w-full h-px bg-gray-600"></div>
              <div className="w-px h-full bg-gray-600 ml-auto"></div>
            </div>
          </div>
          
          {/* Right edge resize handle */}
          <div
            className="absolute top-1/2 right-0 w-2 h-8 cursor-ew-resize bg-gray-300 hover:bg-gray-400 rounded-l opacity-0 hover:opacity-100 transition-opacity transform -translate-y-1/2"
            onMouseDown={(e) => handleMouseDown(e, 'right')}
            title="Drag to resize width"
          />
          
          {/* Bottom edge resize handle */}
          <div
            className="absolute bottom-0 left-1/2 w-8 h-2 cursor-ns-resize bg-gray-300 hover:bg-gray-400 rounded-t opacity-0 hover:opacity-100 transition-opacity transform -translate-x-1/2"
            onMouseDown={(e) => handleMouseDown(e, 'bottom')}
            title="Drag to resize height"
          />
        </>
      )}

    </div>
  );
};

export default BlockNode;
