# API Reference

This document describes the APIs and interfaces used in µLM AI Playground.

## Core Interfaces

### BlockDefinition

The main interface for defining AI workflow blocks.

```typescript
interface BlockDefinition {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Brief description
  category: BlockCategory;       // Category for organization
  version: string;               // Version string (semver)
  inputs: Port[];                // Input ports
  outputs: Port[];               // Output ports
  implementation?: string;       // Python/JS implementation code
  dependencies?: string[];       // Required packages
  config?: Record<string, any>;  // Configuration options
  metadata?: BlockMetadata;      // Additional metadata
}
```

### Port Interface

Defines input/output ports for blocks.

```typescript
interface Port {
  id: string;                    // Port identifier
  name: string;                  // Display name
  type: DataType;                // Data type
  description?: string;          // Port description
  required?: boolean;            // Whether port is required
  defaultValue?: any;            // Default value
  validation?: ValidationRule;   // Validation rules
}

type DataType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'image' 
  | 'audio' 
  | 'video' 
  | 'file'
  | 'any';
```

### WorkflowDefinition

Represents a complete workflow.

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: BlockDefinition;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}
```

## Services

### AIBlockGenerationService

Service for generating AI blocks using OpenAI.

```typescript
class AIBlockGenerationService {
  static getInstance(): AIBlockGenerationService;
  
  async generateBlock(prompt: string): Promise<BlockDefinition>;
  async optimizeBlock(block: BlockDefinition): Promise<BlockDefinition>;
  async generateWorkflow(description: string): Promise<WorkflowDefinition>;
}
```

#### Methods

##### `generateBlock(prompt: string)`

Generates a new AI block from natural language description.

**Parameters:**
- `prompt`: Natural language description of the desired block

**Returns:** Promise that resolves to a `BlockDefinition`

**Example:**
```typescript
const service = AIBlockGenerationService.getInstance();
const block = await service.generateBlock(
  "Create a sentiment analysis block that processes text and returns positive/negative/neutral"
);
```

##### `generateWorkflow(description: string)`

Generates a complete workflow from description.

**Parameters:**
- `description`: Natural language description of the workflow

**Returns:** Promise that resolves to a `WorkflowDefinition`

### UniversalExportService

Service for exporting workflows to different formats.

```typescript
class UniversalExportService {
  static getInstance(): UniversalExportService;
  
  exportToPython(workflow: WorkflowDefinition): Promise<string>;
  exportToTypeScript(workflow: WorkflowDefinition): Promise<string>;
  exportToDocker(workflow: WorkflowDefinition): Promise<string>;
  exportToKubernetes(workflow: WorkflowDefinition): Promise<string>;
}
```

#### Methods

##### `exportToPython(workflow: WorkflowDefinition)`

Exports workflow to Python code.

**Returns:** Python code as string

##### `exportToDocker(workflow: WorkflowDefinition)`

Exports workflow to Dockerfile and docker-compose.yml.

**Returns:** Docker configuration as string

### WorkflowSimulationEngine

Engine for real-time workflow simulation.

```typescript
class WorkflowSimulationEngine {
  constructor();
  
  startSimulation(workflow: WorkflowDefinition): Promise<void>;
  stopSimulation(): void;
  getStatus(): SimulationStatus;
  onStatusChange(callback: (status: SimulationStatus) => void): void;
}
```

#### Simulation Status

```typescript
interface SimulationStatus {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  activeNodes: string[];
  performanceMetrics: {
    throughput: number;
    latency: number;
    memoryUsage: number;
    errorRate: number;
  };
  logs: SimulationLog[];
}
```

## Storage System

### GridStorage

Distributed storage system for workflow data.

```typescript
class GridStorage {
  constructor(namespace: string);
  
  async store(key: string, data: any): Promise<void>;
  async retrieve(key: string): Promise<any>;
  async delete(key: string): Promise<void>;
  async list(pattern?: string): Promise<string[]>;
  
  // Grid-specific methods
  async allocateGrid(size: GridSize): Promise<GridAllocation>;
  async deallocateGrid(allocation: GridAllocation): Promise<void>;
}
```

## Component APIs

### BlockNode Component

React component for rendering blocks in the workflow canvas.

```typescript
interface BlockNodeProps {
  data: BlockDefinition;
  selected?: boolean;
  dragging?: boolean;
}

const BlockNode: React.FC<BlockNodeProps>;
```

### BlockPalette Component

Component for the block palette sidebar.

```typescript
interface BlockPaletteProps {
  blocks: BlockDefinition[];
  onBlockSelect: (block: BlockDefinition) => void;
  onBlockDrag: (block: BlockDefinition) => void;
  searchQuery?: string;
  categoryFilter?: BlockCategory;
}

const BlockPalette: React.FC<BlockPaletteProps>;
```

## Event System

### Workflow Events

```typescript
// Event types
type WorkflowEvent = 
  | 'block-added'
  | 'block-removed'
  | 'block-updated'
  | 'edge-added'
  | 'edge-removed'
  | 'simulation-started'
  | 'simulation-stopped'
  | 'export-completed';

// Event listener
interface WorkflowEventListener {
  (event: WorkflowEvent, data: any): void;
}

// Event emitter
class WorkflowEventEmitter {
  on(event: WorkflowEvent, listener: WorkflowEventListener): void;
  off(event: WorkflowEvent, listener: WorkflowEventListener): void;
  emit(event: WorkflowEvent, data: any): void;
}
```

## Configuration

### Block Categories

```typescript
type BlockCategory = 
  | 'input'           // Data input blocks
  | 'processing'      // Data processing blocks
  | 'ai'              // AI/ML blocks
  | 'output'          // Output blocks
  | 'control'         // Control flow blocks
  | 'visualization'   // Visualization blocks
  | 'storage'         // Storage blocks
  | 'network'         // Network/API blocks
  | 'custom';         // Custom blocks
```

### Export Formats

```typescript
type ExportFormat = 
  | 'python'          // Python script
  | 'typescript'      // TypeScript/Node.js
  | 'docker'          // Docker container
  | 'kubernetes'      // Kubernetes deployment
  | 'aws-lambda'      // AWS Lambda function
  | 'vercel'          // Vercel serverless
  | 'github-actions'  // GitHub Actions workflow
  | 'jupyter'         // Jupyter notebook
  | 'colab';          // Google Colab notebook
```

## Error Handling

### Error Types

```typescript
class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Common error codes
const ErrorCodes = {
  INVALID_BLOCK: 'INVALID_BLOCK',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  SIMULATION_ERROR: 'SIMULATION_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  API_ERROR: 'API_ERROR'
} as const;
```

### Error Handling Example

```typescript
try {
  const workflow = await service.generateWorkflow(prompt);
} catch (error) {
  if (error instanceof WorkflowError) {
    switch (error.code) {
      case ErrorCodes.API_ERROR:
        // Handle API errors
        break;
      case ErrorCodes.INVALID_BLOCK:
        // Handle invalid block errors
        break;
      default:
        // Handle other errors
        break;
    }
  }
}
```

## Validation

### Block Validation

```typescript
interface ValidationRule {
  type: 'required' | 'pattern' | 'range' | 'custom';
  value?: any;
  message?: string;
}

function validateBlock(block: BlockDefinition): ValidationResult {
  // Validation logic
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

## Performance Optimization

### Memoization

```typescript
// Use React.memo for expensive components
const BlockNode = React.memo<BlockNodeProps>(({ data, selected }) => {
  // Component implementation
});

// Use useMemo for expensive calculations
const processedBlocks = useMemo(() => {
  return blocks.filter(block => block.category === selectedCategory);
}, [blocks, selectedCategory]);
```

### Lazy Loading

```typescript
// Lazy load components
const WorkflowEditor = React.lazy(() => import('./WorkflowEditor'));
const BlockPalette = React.lazy(() => import('./BlockPalette'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <WorkflowEditor />
</Suspense>
```

## Testing

### Unit Testing

```typescript
// Example test for block validation
describe('BlockValidation', () => {
  it('should validate required fields', () => {
    const block: BlockDefinition = {
      id: 'test-block',
      name: 'Test Block',
      description: 'Test description',
      category: 'processing',
      version: '1.0.0',
      inputs: [],
      outputs: []
    };
    
    const result = validateBlock(block);
    expect(result.valid).toBe(true);
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('WorkflowGeneration', () => {
  it('should generate valid workflow from prompt', async () => {
    const service = AIBlockGenerationService.getInstance();
    const workflow = await service.generateWorkflow(
      'Create a sentiment analysis pipeline'
    );
    
    expect(workflow.nodes).toHaveLength(3);
    expect(workflow.edges).toHaveLength(2);
  });
});
```

## Rate Limiting

### API Rate Limits

```typescript
interface RateLimit {
  requests: number;      // Requests per period
  period: number;        // Period in milliseconds
  burst?: number;        // Burst capacity
}

const rateLimits: Record<string, RateLimit> = {
  'block-generation': { requests: 10, period: 60000 },
  'workflow-simulation': { requests: 5, period: 60000 },
  'export': { requests: 20, period: 60000 }
};
```

This API reference covers the main interfaces and services used in µLM AI Playground. For more specific implementation details, refer to the source code documentation.
