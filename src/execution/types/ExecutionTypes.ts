// Types for the Elastic Workflow Execution Engine

export interface WorkflowExecutionContext {
  id: string;
  workflowId: string;
  gridInstanceId: string;
  userId: string;
  startedAt: Date;
  status: ExecutionStatus;
  configuration: ExecutionConfiguration;
  resources: ResourceAllocation;
  metadata: Record<string, any>;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  OPTIMIZING = 'optimizing'
}

export interface ExecutionConfiguration {
  maxParallelBlocks: number;
  memoryLimit: number;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  optimizationLevel: OptimizationLevel;
  resourceScaling: ResourceScalingConfig;
  errorHandling: ErrorHandlingConfig;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

export enum OptimizationLevel {
  NONE = 'none',
  BASIC = 'basic',
  AGGRESSIVE = 'aggressive',
  ADAPTIVE = 'adaptive'
}

export interface ResourceScalingConfig {
  enabled: boolean;
  minMemory: number;
  maxMemory: number;
  scaleThreshold: number;
  scaleUpDelay: number;
  scaleDownDelay: number;
}

export interface ErrorHandlingConfig {
  isolateFailedBlocks: boolean;
  enableRollback: boolean;
  generateAlternativePaths: boolean;
  aiAssistedRecovery: boolean;
  cascadeFailurePrevention: boolean;
}

export interface ExecutionDAG {
  nodes: ExecutionNode[];
  edges: ExecutionEdge[];
  entryPoints: string[];
  exitPoints: string[];
  parallelGroups: ParallelGroup[];
  dependencies: DependencyMap;
  estimatedDuration: number;
  resourceRequirements: ResourceRequirements;
}

export interface ExecutionNode {
  id: string;
  blockId: string;
  type: string;
  config: any;
  inputs: DataContract[];
  outputs: DataContract[];
  dependencies: string[];
  resourceNeeds: ResourceNeeds;
  estimatedDuration: number;
  status: NodeExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  error?: ExecutionError;
  metrics: ExecutionMetrics;
}

export enum NodeExecutionStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  READY = 'ready',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying'
}

export interface ExecutionEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput: string;
  targetInput: string;
  dataContract: DataContract;
  streamConfig: StreamConfig;
}

export interface DataContract {
  name: string;
  type: DataType;
  schema: any;
  validation: ValidationRule[];
  serialization: SerializationConfig;
  streaming: boolean;
  optional: boolean;
}

export enum DataType {
  TEXT = 'text',
  JSON = 'json',
  BINARY = 'binary',
  STREAM = 'stream',
  TENSOR = 'tensor',
  DATAFRAME = 'dataframe',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export interface ValidationRule {
  type: 'required' | 'type' | 'format' | 'range' | 'custom';
  params: any;
  message: string;
}

export interface SerializationConfig {
  format: 'json' | 'msgpack' | 'protobuf' | 'custom';
  compression: boolean;
  encryption: boolean;
}

export interface StreamConfig {
  bufferSize: number;
  flushInterval: number;
  compression: boolean;
  backpressure: boolean;
}

export interface ParallelGroup {
  id: string;
  nodeIds: string[];
  maxConcurrency: number;
  resourcePool: string;
  coordinationStrategy: 'barrier' | 'pipeline' | 'independent';
}

export interface DependencyMap {
  [nodeId: string]: {
    dependencies: string[];
    dependents: string[];
    criticalPath: boolean;
    depth: number;
  };
}

export interface ResourceRequirements {
  totalMemory: number;
  peakMemory: number;
  cpuCores: number;
  storage: number;
  networkBandwidth: number;
  customResources: Record<string, number>;
}

export interface ResourceNeeds {
  memory: number;
  cpu: number;
  storage: number;
  network: number;
  gpu?: boolean;
  customRequirements: Record<string, any>;
}

export interface ResourceAllocation {
  allocated: ResourceNeeds;
  available: ResourceNeeds;
  utilization: ResourceUtilization;
  scaling: ScalingStatus;
}

export interface ResourceUtilization {
  memory: number; // percentage 0-100
  cpu: number;
  storage: number;
  network: number;
  timestamp: Date;
}

export interface ScalingStatus {
  isScaling: boolean;
  direction: 'up' | 'down' | 'none';
  trigger: string;
  nextEvaluation: Date;
}

export interface ExecutionMetrics {
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  memoryUsage: MemoryMetrics;
  cpuUsage: number[];
  throughput: ThroughputMetrics;
  errorCount: number;
  retryCount: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface MemoryMetrics {
  peak: number;
  average: number;
  allocated: number;
  freed: number;
  leaks: number;
}

export interface ThroughputMetrics {
  itemsProcessed: number;
  bytesProcessed: number;
  itemsPerSecond: number;
  bytesPerSecond: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack?: string;
  nodeId: string;
  timestamp: Date;
  context: any;
  recoverable: boolean;
  suggestions: ErrorSuggestion[];
  alternativePaths: AlternativePath[];
}

export interface ErrorSuggestion {
  type: 'fix' | 'config' | 'resource' | 'alternative';
  description: string;
  confidence: number;
  autoApplicable: boolean;
  action?: string;
  parameters?: any;
}

export interface AlternativePath {
  id: string;
  description: string;
  nodes: string[];
  estimatedDuration: number;
  confidence: number;
  resourceRequirements: ResourceRequirements;
}

export interface ExecutionProgress {
  workflowId: string;
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  runningNodes: number;
  progress: number; // 0-100
  estimatedTimeRemaining: number;
  currentPhase: string;
  throughput: ThroughputMetrics;
  errors: ExecutionError[];
}

export interface CacheEntry {
  key: string;
  value: any;
  nodeId: string;
  inputs: any;
  timestamp: Date;
  expiresAt?: Date;
  accessCount: number;
  size: number;
  metadata: Record<string, any>;
}

export interface OptimizationSuggestion {
  type: 'parallelization' | 'caching' | 'resource' | 'algorithm' | 'data';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number; // percentage
  applicableNodes: string[];
  autoApplicable: boolean;
  details: any;
}
