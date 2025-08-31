import React, { useState, useCallback, useRef, useMemo, memo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Optimized imports
import BlockPalette from '../components/BlockPalette';
import BlockNode from '../components/BlockNode';

// Initial minimal setup for performance
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Memoized node types to prevent re-creation
const nodeTypes = {
  aiBlock: memo(BlockNode),
};

// Optimized connection settings
const connectionLineStyle = { stroke: '#3b82f6', strokeWidth: 2 };
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#3b82f6' },
  type: 'smoothstep',
  animated: false, // Disable animation for performance
};

interface OptimizedWorkspaceProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

// Memoized sidebar component
const Sidebar = memo(({ isOpen, onToggle, onBlockDrag }: { 
  isOpen: boolean; 
  onToggle: () => void;
  onBlockDrag: (block: any, event: React.DragEvent) => void;
}) => (
  <div className={`
    absolute left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 
    transform transition-transform duration-200 ease-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    w-80
  `}>
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Block Palette</h2>
        <button
          onClick={onToggle}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
    <div className="p-4">
      <BlockPalette 
        onBlockSelect={() => {}}
        onBlockDrag={onBlockDrag}
      />
    </div>
  </div>
));

// Memoized toolbar
const Toolbar = memo(({ onSidebarToggle, isDark, onThemeToggle }: {
  onSidebarToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}) => (
  <div className="absolute top-4 left-4 z-30 flex gap-2">
    <button
      onClick={onSidebarToggle}
      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
                 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
    >
      ☰ Blocks
    </button>
    <button
      onClick={onThemeToggle}
      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
                 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  </div>
));

// Main workspace content component
const WorkspaceContent = memo(({ isDark, onThemeToggle }: OptimizedWorkspaceProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Memoized callbacks to prevent unnecessary re-renders
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const blockData = event.dataTransfer.getData('application/reactflow');

      if (typeof blockData === 'undefined' || !blockData || !reactFlowBounds) {
        return;
      }

      try {
        const block = JSON.parse(blockData);
        const position = {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 50,
        };

        const newNode: Node = {
          id: `${block.type}-${Date.now()}`,
          type: 'aiBlock',
          position,
          data: { 
            block: {
              ...block,
              id: `${block.type}-${Date.now()}`,
            }
          },
          dragHandle: '.drag-handle',
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Failed to parse dropped block data:', error);
      }
    },
    [setNodes]
  );

  const onBlockDrag = useCallback((block: any, event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Memoized ReactFlow props
  const reactFlowProps = useMemo(() => ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    nodeTypes,
    connectionLineStyle,
    defaultEdgeOptions,
    fitView: true,
    fitViewOptions: { padding: 0.2 },
    minZoom: 0.1,
    maxZoom: 4,
    snapToGrid: true,
    snapGrid: [20, 20] as [number, number],
    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    selectNodesOnDrag: false,
    className: `transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`,
  }), [
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    onDrop, onDragOver, isDark
  ]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onBlockDrag={onBlockDrag} />
      
      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-25 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Main workspace */}
      <div className="w-full h-full">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow {...reactFlowProps}>
              {/* Optimized controls */}
              <Controls 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              
              {/* Simplified minimap */}
              <MiniMap 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                nodeColor={() => '#3b82f6'}
                maskColor="rgba(0, 0, 0, 0.1)"
                pannable={true}
                zoomable={true}
              />
              
              {/* Optimized background */}
              <Background 
                variant={"dots" as BackgroundVariant}
                gap={24}
                size={1}
                color={isDark ? '#374151' : '#d1d5db'}
              />
              
              {/* Toolbar panel */}
              <Panel position="top-left">
                <Toolbar 
                  onSidebarToggle={toggleSidebar}
                  isDark={isDark}
                  onThemeToggle={onThemeToggle}
                />
              </Panel>
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
});

// Main component with error boundary
export const OptimizedWorkspacePage: React.FC<OptimizedWorkspaceProps> = (props) => {
  return (
    <div className="w-full h-screen">
      <WorkspaceContent {...props} />
    </div>
  );
};

export default OptimizedWorkspacePage;
