/**
 * Type definitions for µLM Elastic Grid Storage System
 */

export interface Position {
  x: number;
  y: number;
}

// Block Categories
export type BlockCategory = 'input' | 'mlAlgorithm' | 'neuralNetwork' | 'expert' | 'utility' | 'output' | 'custom';

// Port Types
export interface Port {
  id: string;
  name: string;
  type: 'text' | 'number' | 'array' | 'object' | 'tensor' | 'image' | 'audio' | 'dataframe' | 'model' | 'file' | 'html' | 'visualization' | 'any' | 'data' | 'control' | 'event';
  description: string;
  required?: boolean;
  defaultValue?: any;
  dataType?: string; // For backward compatibility
}

// Configuration Parameter Types
export interface ConfigParameter {
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'file' | 'password';
  label: string;
  options?: string[];
  default?: any;
  required?: boolean;
  accept?: string; // for file types
  min?: number;
  max?: number;
}

export interface BlockDefinition {
  id: string;
  name: string;
  category: BlockCategory;
  type?: string; // For backward compatibility
  description: string;
  version: string;
  inputs: Port[];
  outputs: Port[];
  config: Record<string, ConfigParameter>;
  implementation: string;
  tags: string[];
  performance: {
    avgExecutionTime: number;
    memoryUsage: 'low' | 'medium' | 'high' | 'very_high';
  };
  errorHandling: {
    retryable: boolean;
    timeout: number;
  };
  metadata?: {
    author?: string;
    documentation?: string;
    dependencies?: string[];
    isGenerated?: boolean;
    tags?: string[];
    category?: string;
  };
}

export interface BlockPort {
  id: string;
  name: string;
  type: 'data' | 'control' | 'event';
  dataType: string;
  required: boolean;
  defaultValue?: any;
}

export interface GridCell {
  id: string;
  position: Position;
  block: BlockDefinition;
  version: number;
  created: Date;
  lastModified: Date;
  lastAccessed: Date;
  accessCount: number;
  metadata: {
    tags: string[];
    category: string;
    isGenerated: boolean;
    dependencies: string[];
    performance: {
      avgExecutionTime: number;
      successRate: number;
      lastExecuted: Date | null;
    };
  };
}

export interface GridMetadata {
  id: string;
  created: Date;
  lastModified: Date;
  version: string;
  dimensions: {
    width: number;
    height: number;
  };
  totalBlocks: number;
  activeWorkflows: number;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  type: string;
  workflowId?: string;
  created: Date;
  metadata: {
    dataType: string;
    isActive: boolean;
    weight: number;
  };
}

export interface GridExport {
  metadata: GridMetadata;
  cells: GridCell[];
  connections: WorkflowConnection[];
  version: string;
  exportedAt: Date;
  signature: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalSize: number;
  maxSize: number;
  evictions: number;
}

export interface VersionHistory {
  cellId: string;
  version: number;
  data: GridCell;
  timestamp: Date;
  changeType: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
}

export interface BackupMetadata {
  id: string;
  workspaceId: string;
  created: Date;
  size: number;
  description?: string;
}

export interface GridVisualizationData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  clusters: VisualizationCluster[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    density: number;
    avgConnections: number;
  };
}

export interface VisualizationNode {
  id: string;
  position: Position;
  type: string;
  label: string;
  category: string;
  status: 'active' | 'idle' | 'error';
  performance: {
    usage: number;
    responseTime: number;
  };
  connections: number;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  status: 'active' | 'inactive';
}

export interface VisualizationCluster {
  id: string;
  nodes: string[];
  centroid: Position;
  density: number;
  category: string;
}

export interface GridSearchQuery {
  text?: string;
  type?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  performance?: {
    minSuccessRate?: number;
    maxExecutionTime?: number;
  };
}

export interface GridSearchResult {
  cells: GridCell[];
  total: number;
  took: number;
  aggregations: {
    categories: Record<string, number>;
    types: Record<string, number>;
    tags: Record<string, number>;
  };
}

export interface GarbageCollectionConfig {
  maxAge: number; // milliseconds
  minAccessCount: number;
  maxUnusedCells: number;
  preserveConnected: boolean;
}

export interface GarbageCollectionResult {
  cellsRemoved: number;
  connectionsRemoved: number;
  memoryFreed: number;
  duration: number;
}
