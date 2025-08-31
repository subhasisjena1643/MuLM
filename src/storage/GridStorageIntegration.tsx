// @ts-nocheck
/**
 * Grid Storage Integration for µLM Workspace
 * Integrates the elastic grid storage system with the React Flow workspace
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { GridStorage } from '../storage/GridStorage';
import { BlockDefinition, GridCell, GridVisualizationData } from '../storage/types/GridTypes';

interface GridStorageProviderProps {
  workspaceId: string;
  children: React.ReactNode;
}

interface GridStorageContextValue {
  gridStorage: GridStorage | null;
  isInitialized: boolean;
  saveBlock: (position: { x: number; y: number }, block: BlockDefinition) => Promise<void>;
  loadBlock: (position: { x: number; y: number }) => Promise<GridCell | null>;
  removeBlock: (position: { x: number; y: number }) => Promise<boolean>;
  createConnection: (from: { x: number; y: number }, to: { x: number; y: number }, type?: string) => Promise<void>;
  exportWorkspace: () => Promise<string>;
  importWorkspace: (data: string) => Promise<void>;
  getVisualizationData: () => GridVisualizationData | null;
  backupWorkspace: () => Promise<string>;
  restoreWorkspace: (backupId: string) => Promise<void>;
  getStatistics: () => any;
}

const GridStorageContext = React.createContext<GridStorageContextValue | null>(null);

export const GridStorageProvider: React.FC<GridStorageProviderProps> = ({ 
  workspaceId, 
  children 
}) => {
  const [gridStorage, setGridStorage] = useState<GridStorage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const storage = new GridStorage(workspaceId);
        await storage.initialize();
        setGridStorage(storage);
        setIsInitialized(true);
        console.log('Grid storage initialized successfully');
      } catch (error) {
        console.error('Failed to initialize grid storage:', error);
      }
    };

    initializeStorage();

    return () => {
      if (gridStorage) {
        gridStorage.destroy();
      }
    };
  }, [workspaceId]);

  const saveBlock = useCallback(async (
    position: { x: number; y: number }, 
    block: BlockDefinition
  ) => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    await gridStorage.setBlock(position, block);
  }, [gridStorage]);

  const loadBlock = useCallback(async (
    position: { x: number; y: number }
  ): Promise<GridCell | null> => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    return await gridStorage.getBlock(position);
  }, [gridStorage]);

  const removeBlock = useCallback(async (
    position: { x: number; y: number }
  ): Promise<boolean> => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    return await gridStorage.removeBlock(position);
  }, [gridStorage]);

  const createConnection = useCallback(async (
    from: { x: number; y: number },
    to: { x: number; y: number },
    type = 'dataflow'
  ) => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    await gridStorage.createConnection(from, to, type);
  }, [gridStorage]);

  const exportWorkspace = useCallback(async (): Promise<string> => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    const exportData = await gridStorage.exportGrid();
    return JSON.stringify(exportData);
  }, [gridStorage]);

  const importWorkspace = useCallback(async (data: string) => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    const importData = JSON.parse(data);
    await gridStorage.importGrid(importData);
  }, [gridStorage]);

  const getVisualizationData = useCallback((): GridVisualizationData | null => {
    if (!gridStorage) return null;
    return gridStorage.getVisualizationData();
  }, [gridStorage]);

  const backupWorkspace = useCallback(async (): Promise<string> => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    return await gridStorage.backup();
  }, [gridStorage]);

  const restoreWorkspace = useCallback(async (backupId: string) => {
    if (!gridStorage) throw new Error('Grid storage not initialized');
    await gridStorage.restore(backupId);
  }, [gridStorage]);

  const getStatistics = useCallback(() => {
    if (!gridStorage) return null;
    return gridStorage.getStatistics();
  }, [gridStorage]);

  const contextValue: GridStorageContextValue = {
    gridStorage,
    isInitialized,
    saveBlock,
    loadBlock,
    removeBlock,
    createConnection,
    exportWorkspace,
    importWorkspace,
    getVisualizationData,
    backupWorkspace,
    restoreWorkspace,
    getStatistics
  };

  return (
    <GridStorageContext.Provider value={contextValue}>
      {children}
    </GridStorageContext.Provider>
  );
};

export const useGridStorage = () => {
  const context = React.useContext(GridStorageContext);
  if (!context) {
    throw new Error('useGridStorage must be used within a GridStorageProvider');
  }
  return context;
};

/**
 * Hook to convert React Flow nodes/edges to grid storage format
 */
export const useReactFlowGridSync = () => {
  const gridStorage = useGridStorage();

  const syncNodesToGrid = useCallback(async (nodes: Node[]) => {
    if (!gridStorage.isInitialized) return;

    for (const node of nodes) {
      const position = {
        x: Math.floor(node.position.x / 100), // Convert to grid coordinates
        y: Math.floor(node.position.y / 100)
      };

      const blockDefinition: BlockDefinition = {
        id: node.id,
        name: node.data?.name || node.type,
        category: (node.data?.category as any) || 'custom',
        type: node.type,
        description: node.data?.description || '',
        version: '1.0.0',
        inputs: node.data?.inputs || [],
        outputs: node.data?.outputs || [],
        config: node.data?.config || {},
        implementation: node.data?.implementation || 'DefaultProcessor',
        tags: node.data?.tags || [],
        performance: {
          avgExecutionTime: 100,
          memoryUsage: 'medium'
        },
        errorHandling: {
          retryable: true,
          timeout: 30000
        },
        metadata: {
          tags: node.data?.tags || [],
          category: node.data?.category || 'general',
          isGenerated: node.data?.isGenerated || false,
          dependencies: node.data?.dependencies || []
        }
      };

      await gridStorage.saveBlock(position, blockDefinition);
    }
  }, [gridStorage]);

  const syncEdgesToGrid = useCallback(async (edges: Edge[]) => {
    if (!gridStorage.isInitialized) return;

    for (const edge of edges) {
      // Find source and target positions
      // This would need to be coordinated with the node positions
      // For now, this is a placeholder implementation
    }
  }, [gridStorage]);

  const loadGridToReactFlow = useCallback(async (): Promise<{
    nodes: Node[];
    edges: Edge[];
  }> => {
    if (!gridStorage.isInitialized) {
      return { nodes: [], edges: [] };
    }

    // Implementation to load grid data and convert to React Flow format
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    return { nodes, edges };
  }, [gridStorage]);

  return {
    syncNodesToGrid,
    syncEdgesToGrid,
    loadGridToReactFlow
  };
};

/**
 * Component for displaying grid storage statistics with drag and minimize functionality
 */
export const GridStorageStats: React.FC = () => {
  const { getStatistics, isInitialized, gridStorage } = useGridStorage();
  const [stats, setStats] = useState<any>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isInitialized) return;

    const updateStats = () => {
      const currentStats = getStatistics();
      // Add real-time workspace statistics
      const enhancedStats = {
        ...currentStats,
        timestamp: new Date(),
        totalNodes: currentStats?.totalCells || 0,
        activeConnections: currentStats?.totalConnections || 0,
        workspaceHealth: currentStats?.totalCells > 0 ? 'Active' : 'Empty',
        storageStatus: 'Connected',
        lastSync: new Date().toLocaleTimeString()
      };
      setStats(enhancedStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isInitialized, getStatistics]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.stats-controls')) return;
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isInitialized || !stats) {
    return (
      <div 
        className="fixed z-50 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg cursor-move"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Grid storage not initialized
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`fixed z-50 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg cursor-move transition-all duration-200 ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      style={{ left: position.x, top: position.y, width: isMinimized ? '250px' : '320px' }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <h3 className="text-sm font-semibold">
          Grid Storage Statistics
        </h3>
        <div className="stats-controls flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded text-xs"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Nodes</p>
              <p className="font-mono text-lg text-blue-600 dark:text-blue-400">{stats.totalNodes}</p>
            </div>
            
            <div>
              <p className="text-gray-600 dark:text-gray-400">Connections</p>
              <p className="font-mono text-lg text-green-600 dark:text-green-400">{stats.activeConnections}</p>
            </div>
            
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-mono text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  stats.workspaceHealth === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  ●  {stats.workspaceHealth}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-gray-600 dark:text-gray-400">Storage</p>
              <p className="font-mono text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  ●  {stats.storageStatus}
                </span>
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {stats.lastSync}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component for workspace backup/restore controls
 */
export const GridBackupControls: React.FC = () => {
  const { backupWorkspace, restoreWorkspace, exportWorkspace, importWorkspace } = useGridStorage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      const backupId = await backupWorkspace();
      setMessage(`Backup created: ${backupId}`);
    } catch (error) {
      setMessage(`Backup failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const exportData = await exportWorkspace();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mulm-workspace-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Workspace exported successfully');
    } catch (error) {
      setMessage(`Export failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      await importWorkspace(text);
      setMessage('Workspace imported successfully');
    } catch (error) {
      setMessage(`Import failed: ${error}`);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Workspace Management
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={handleBackup}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isProcessing ? 'Creating Backup...' : 'Create Backup'}
        </button>
        
        <button
          onClick={handleExport}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isProcessing ? 'Exporting...' : 'Export Workspace'}
        </button>
        
        <label className="block">
          <span className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Import Workspace
          </span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isProcessing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </label>
      </div>
      
      {message && (
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
};
