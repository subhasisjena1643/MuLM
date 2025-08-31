import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MinimalWorkspaceProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

const MinimalWorkspace: React.FC<MinimalWorkspaceProps> = ({ isDark, onThemeToggle }) => {
  console.log('🟢 MinimalWorkspace component rendered successfully');
  
  const location = useLocation();
  console.log('📍 Location state:', location.state);
  
  const [workflowName, setWorkflowName] = useState('Test Workflow');
  
  // Initialize React Flow with empty state first
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Try to load pre-generated workflow if available
  React.useEffect(() => {
    const locationState = location.state as any;
    if (locationState?.preGeneratedWorkflow) {
      console.log('🔄 Loading pre-generated workflow...');
      try {
        const { nodes: preNodes, edges: preEdges } = locationState.preGeneratedWorkflow;
        if (preNodes && Array.isArray(preNodes)) {
          console.log('📦 Setting nodes:', preNodes.length);
          setNodes(preNodes);
        }
        if (preEdges && Array.isArray(preEdges)) {
          console.log('🔗 Setting edges:', preEdges.length);
          setEdges(preEdges);
        }
      } catch (error) {
        console.error('❌ Error loading pre-generated workflow:', error);
      }
    }
  }, [location.state, setNodes, setEdges]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ReactFlowProvider>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Enhanced MoE Workspace (Minimal + ReactFlow)
          </h1>
          <button 
            onClick={onThemeToggle}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Toggle Theme
          </button>
        </div>

        {/* Main Content */}
        <div className="flex h-screen">
          {/* Left Panel - Info */}
          <div className="w-80 p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Stats */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Workflow Stats
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nodes: {nodes.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edges: {edges.length}
              </p>
            </div>

            {/* Location State Debug */}
            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Debug Information
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Theme: {isDark ? 'Dark' : 'Light'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Location: {location.pathname}
              </p>
              {location.state && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Has State: ✅
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Prompt: {(location.state as any)?.prompt?.substring(0, 50)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - ReactFlow Canvas */}
          <div className="flex-1 h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default MinimalWorkspace;
