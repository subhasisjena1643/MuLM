import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react';
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
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Components
import BlockPalette from '../components/BlockPalette';
import BlockNode from '../components/BlockNode';

// Enhanced styles for smoother animations
const smoothTransition = 'transition-all duration-300 ease-out';
const glassEffect = 'backdrop-blur-sm bg-opacity-80 border border-gray-200 dark:border-gray-700';

// Initial setup
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  aiBlock: memo(BlockNode),
};

// Optimized connection settings
const connectionLineStyle = { 
  stroke: '#3b82f6', 
  strokeWidth: 3,
  strokeDasharray: '5,5',
};

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: '#3b82f6' },
  type: 'smoothstep',
  animated: true,
  animationDuration: 2000,
};

interface UltraWorkspaceProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

// Enhanced floating toolbar
const FloatingToolbar = memo(({ 
  onSidebarToggle, 
  onClear,
  onSave,
  isDark, 
  onThemeToggle 
}: {
  onSidebarToggle: () => void;
  onClear: () => void;
  onSave: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}) => (
  <div className={`
    absolute top-6 left-6 z-50 flex items-center gap-3
    ${glassEffect} ${smoothTransition}
    bg-white dark:bg-gray-800 shadow-xl rounded-xl p-3
    hover:shadow-2xl hover:scale-105
  `}>
    <button
      onClick={onSidebarToggle}
      className={`
        px-4 py-2 rounded-lg ${smoothTransition}
        bg-blue-500 hover:bg-blue-600 text-white
        shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
        font-medium text-sm
      `}
    >
      📦 Blocks
    </button>
    
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
    
    <button
      onClick={onClear}
      className={`
        px-3 py-2 rounded-lg ${smoothTransition}
        text-gray-600 dark:text-gray-300 hover:text-red-500
        hover:bg-red-50 dark:hover:bg-red-900/20
      `}
      title="Clear All"
    >
      🗑️
    </button>
    
    <button
      onClick={onSave}
      className={`
        px-3 py-2 rounded-lg ${smoothTransition}
        text-gray-600 dark:text-gray-300 hover:text-green-500
        hover:bg-green-50 dark:hover:bg-green-900/20
      `}
      title="Save Workflow"
    >
      💾
    </button>
    
    <button
      onClick={onThemeToggle}
      className={`
        px-3 py-2 rounded-lg ${smoothTransition}
        text-gray-600 dark:text-gray-300 hover:text-amber-500
        hover:bg-amber-50 dark:hover:bg-amber-900/20
      `}
      title="Toggle Theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  </div>
));

// Enhanced sidebar with better UX
const EnhancedSidebar = memo(({ 
  isOpen, 
  onToggle, 
  onBlockDrag
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  onBlockDrag: (block: any, event: React.DragEvent) => void;
}) => (
  <>
    <div className={`
      fixed left-0 top-0 h-full z-50 ${smoothTransition}
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      w-96 max-w-[90vw]
    `}>
      <div className={`
        h-full ${glassEffect} ${smoothTransition}
        bg-white dark:bg-gray-900 shadow-2xl
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Block Library
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag blocks to canvas
              </p>
            </div>
            <button
              onClick={onToggle}
              className={`
                p-2 rounded-lg ${smoothTransition}
                text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                transform hover:scale-110
              `}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <BlockPalette 
            onBlockSelect={() => {}}
            onBlockDrag={onBlockDrag}
          />
        </div>
      </div>
    </div>
    
    {/* Overlay */}
    {isOpen && (
      <div 
        className={`
          fixed inset-0 bg-black z-40 ${smoothTransition}
          ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
      />
    )}
  </>
));

// Status bar
const StatusBar = memo(({ 
  nodeCount, 
  edgeCount
}: { 
  nodeCount: number; 
  edgeCount: number;
}) => (
  <div className={`
    absolute bottom-6 right-6 z-40
    ${glassEffect} ${smoothTransition}
    bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2
    hover:shadow-xl
  `}>
    <div className="flex items-center gap-4 text-sm">
      <span className="text-gray-600 dark:text-gray-300">
        📊 {nodeCount} blocks
      </span>
      <span className="text-gray-600 dark:text-gray-300">
        🔗 {edgeCount} connections
      </span>
    </div>
  </div>
));

// Main workspace component
const UltraWorkspaceContent = memo(({ isDark, onThemeToggle }: UltraWorkspaceProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Enhanced callbacks
  const onConnect = useCallback(
    (params: Connection) => {
      const edge = { 
        ...params, 
        id: `edge-${Date.now()}`,
        animated: true,
        style: { strokeWidth: 3, stroke: '#3b82f6' }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
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

      if (!blockData || !reactFlowBounds || !reactFlowInstance) return;

      try {
        const block = JSON.parse(blockData);
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

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
    [setNodes, reactFlowInstance]
  );

  const onBlockDrag = useCallback((block: any, event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const clearWorkspace = useCallback(() => {
    if (window.confirm('Clear all blocks and connections?')) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const saveWorkspace = useCallback(() => {
    const workflow = { nodes, edges };
    localStorage.setItem('workspace-data', JSON.stringify(workflow));
    // Show a temporary notification
    const notification = document.createElement('div');
    notification.textContent = '✅ Workspace saved!';
    notification.className = 'fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }, [nodes, edges]);

  // Load saved workspace on mount
  useEffect(() => {
    const saved = localStorage.getItem('workspace-data');
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        if (savedNodes?.length || savedEdges?.length) {
          setNodes(savedNodes || []);
          setEdges(savedEdges || []);
        }
      } catch (error) {
        console.error('Failed to load saved workspace:', error);
      }
    }
  }, [setNodes, setEdges]);

  // Optimized ReactFlow props
  const reactFlowProps = useMemo(() => ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onInit: setReactFlowInstance,
    nodeTypes,
    connectionLineStyle,
    defaultEdgeOptions,
    fitView: true,
    fitViewOptions: { padding: 0.1, maxZoom: 1.2 },
    minZoom: 0.1,
    maxZoom: 4,
    snapToGrid: true,
    snapGrid: [20, 20] as [number, number],
    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    selectNodesOnDrag: false,
    className: `${smoothTransition} ${
      isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'
    }`,
  }), [
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    onDrop, onDragOver, isDark
  ]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Enhanced sidebar */}
      <EnhancedSidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        onBlockDrag={onBlockDrag}
      />

      {/* Main workspace */}
      <div className="w-full h-full">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow {...reactFlowProps}>
              {/* Enhanced controls */}
              <Controls 
                className={`${glassEffect} ${smoothTransition} bg-white dark:bg-gray-800 shadow-xl`}
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              
              {/* Enhanced minimap */}
              <MiniMap 
                className={`${glassEffect} ${smoothTransition} bg-white dark:bg-gray-800 shadow-xl`}
                nodeColor={(node) => {
                  const colors: { [key: string]: string } = {
                    'aiBlock': '#3b82f6',
                    'mlAlgorithm': '#8b5cf6',
                    'dataProcessor': '#10b981',
                    'output': '#f59e0b',
                  };
                  return colors[node.type || 'aiBlock'] || '#6b7280';
                }}
                maskColor={isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
                pannable={true}
                zoomable={true}
              />
              
              {/* Enhanced background */}
              <Background 
                variant={"dots" as BackgroundVariant}
                gap={24}
                size={2}
                color={isDark ? '#374151' : '#d1d5db'}
                className={smoothTransition}
              />
              
              {/* Floating toolbar */}
              <Panel position="top-left">
                <FloatingToolbar 
                  onSidebarToggle={toggleSidebar}
                  onClear={clearWorkspace}
                  onSave={saveWorkspace}
                  isDark={isDark}
                  onThemeToggle={onThemeToggle}
                />
              </Panel>
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>

      {/* Status bar */}
      <StatusBar 
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />
    </div>
  );
});

// Main component wrapper
export const UltraWorkspacePage: React.FC<UltraWorkspaceProps> = (props) => {
  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900">
      <UltraWorkspaceContent {...props} />
    </div>
  );
};

export default UltraWorkspacePage;
