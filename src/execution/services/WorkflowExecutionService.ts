// @ts-nocheck
import { ElasticWorkflowExecutionEngine } from '../core/ElasticWorkflowExecutionEngine';
import { GridStorage } from '../../storage/GridStorage';
import { 
  ExecutionConfiguration, 
  ExecutionProgress,
  WorkflowExecutionContext,
  OptimizationSuggestion 
} from '../types/ExecutionTypes';

export class WorkflowExecutionService {
  private executionEngine: ElasticWorkflowExecutionEngine;
  private gridStorage: GridStorage;

  constructor() {
    this.gridStorage = new GridStorage('execution-grid');
    this.executionEngine = new ElasticWorkflowExecutionEngine(this.gridStorage);
    
    console.log('🎯 Workflow Execution Service initialized');
  }

  /**
   * Execute a µLM workflow from React Flow data
   */
  async executeWorkflow(
    reactFlowData: any,
    userId: string = 'anonymous',
    config?: Partial<ExecutionConfiguration>
  ): Promise<string> {
    try {
      console.log('🚀 Starting workflow execution from React Flow data');
      
      // Convert React Flow data to workflow JSON
      const workflowJson = this.convertReactFlowToWorkflow(reactFlowData);
      
      // Merge with default configuration
      const executionConfig = this.mergeWithDefaultConfig(config);
      
      // Start execution
      const executionId = await this.executionEngine.executeWorkflow(
        workflowJson,
        executionConfig,
        userId
      );
      
      console.log(`✅ Workflow execution started: ${executionId}`);
      return executionId;
      
    } catch (error) {
      console.error('❌ Failed to execute workflow:', error);
      throw new Error(`Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get real-time execution progress
   */
  getExecutionProgress(executionId: string): ExecutionProgress | null {
    return this.executionEngine.getExecutionProgress(executionId);
  }

  /**
   * Get execution context details
   */
  getExecutionContext(executionId: string): WorkflowExecutionContext | null {
    return this.executionEngine.getExecutionContext(executionId);
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    await this.executionEngine.cancelExecution(executionId);
  }

  /**
   * Pause a running execution
   */
  async pauseExecution(executionId: string): Promise<void> {
    await this.executionEngine.pauseExecution(executionId);
  }

  /**
   * Resume a paused execution
   */
  async resumeExecution(executionId: string): Promise<void> {
    await this.executionEngine.resumeExecution(executionId);
  }

  /**
   * Get optimization suggestions for a workflow
   */
  async getOptimizationSuggestions(reactFlowData: any): Promise<OptimizationSuggestion[]> {
    const workflowJson = this.convertReactFlowToWorkflow(reactFlowData);
    return await this.executionEngine.getOptimizationSuggestions(workflowJson);
  }

  /**
   * Apply an optimization to a running execution
   */
  async applyOptimization(executionId: string, optimizationId: string): Promise<void> {
    await this.executionEngine.applyOptimization(executionId, optimizationId);
  }

  /**
   * Get available block types for workflow building
   */
  async getAvailableBlocks(): Promise<any[]> {
    try {
      // Get all blocks from storage - iterate through grid
      const blocks: any[] = [];
      
      // For now, return a basic set of available blocks
      // In a full implementation, this would iterate through the grid
      return [
        {
          id: 'input-text',
          name: 'Text Input',
          category: 'input',
          description: 'Input text data',
          inputs: [],
          outputs: [{ name: 'text', type: 'text' }],
          config: {}
        },
        {
          id: 'ml-classifier',
          name: 'ML Classifier',
          category: 'mlAlgorithm',
          description: 'Machine learning classification',
          inputs: [{ name: 'data', type: 'text' }],
          outputs: [{ name: 'prediction', type: 'text' }],
          config: {}
        },
        {
          id: 'output-display',
          name: 'Output Display',
          category: 'output',
          description: 'Display results',
          inputs: [{ name: 'data', type: 'text' }],
          outputs: [],
          config: {}
        }
      ];
    } catch (error) {
      console.error('Failed to get available blocks:', error);
      return [];
    }
  }

  /**
   * Validate workflow before execution
   */
  validateWorkflow(reactFlowData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Check basic structure
      if (!reactFlowData.nodes || !Array.isArray(reactFlowData.nodes)) {
        errors.push('Workflow must contain nodes array');
      }
      
      if (!reactFlowData.edges || !Array.isArray(reactFlowData.edges)) {
        errors.push('Workflow must contain edges array');
      }
      
      // Check for orphaned nodes
      const nodeIds = new Set(reactFlowData.nodes.map((n: any) => n.id));
      const connectedNodes = new Set();
      
      for (const edge of reactFlowData.edges || []) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }
      
      const orphanedNodes = [...nodeIds].filter(id => !connectedNodes.has(id));
      if (orphanedNodes.length > 0 && reactFlowData.nodes.length > 1) {
        errors.push(`Found ${orphanedNodes.length} orphaned nodes: ${orphanedNodes.join(', ')}`);
      }
      
      // Check for cycles
      if (this.hasCycles(reactFlowData)) {
        errors.push('Workflow contains cycles - infinite loops detected');
      }
      
      // Check for missing entry points
      const entryNodes = reactFlowData.nodes.filter((node: any) => {
        return !reactFlowData.edges.some((edge: any) => edge.target === node.id);
      });
      
      if (entryNodes.length === 0) {
        errors.push('Workflow must have at least one entry point (node with no incoming connections)');
      }
      
      // Check for missing exit points
      const exitNodes = reactFlowData.nodes.filter((node: any) => {
        return !reactFlowData.edges.some((edge: any) => edge.source === node.id);
      });
      
      if (exitNodes.length === 0) {
        errors.push('Workflow must have at least one exit point (node with no outgoing connections)');
      }
      
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Private methods

  private convertReactFlowToWorkflow(reactFlowData: any): any {
    console.log('🔄 Converting React Flow data to workflow JSON');
    
    return {
      id: `workflow_${Date.now()}`,
      name: 'µLM Workflow',
      description: 'Generated from React Flow editor',
      nodes: reactFlowData.nodes.map((node: any) => ({
        id: node.id,
        blockId: node.data?.blockId || node.type || 'unknown',
        config: node.data?.config || {},
        position: node.position,
        dependencies: this.findNodeDependencies(node.id, reactFlowData.edges)
      })),
      edges: reactFlowData.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceOutput: edge.sourceHandle || 'output',
        targetInput: edge.targetHandle || 'input',
        bufferSize: 1024,
        compression: false
      })),
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        reactFlowVersion: reactFlowData.version || 'unknown'
      }
    };
  }

  private findNodeDependencies(nodeId: string, edges: any[]): string[] {
    return edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
  }

  private mergeWithDefaultConfig(config?: Partial<ExecutionConfiguration>): ExecutionConfiguration {
    const defaultConfig: ExecutionConfiguration = {
      maxParallelBlocks: 4,
      memoryLimit: 2048,
      timeoutMs: 30 * 60 * 1000, // 30 minutes
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'TEMPORARY_FAILURE']
      },
      optimizationLevel: 'basic' as any,
      resourceScaling: {
        enabled: true,
        minMemory: 256,
        maxMemory: 4096,
        scaleThreshold: 0.8,
        scaleUpDelay: 30000,
        scaleDownDelay: 60000
      },
      errorHandling: {
        isolateFailedBlocks: true,
        enableRollback: true,
        generateAlternativePaths: true,
        aiAssistedRecovery: true,
        cascadeFailurePrevention: true
      }
    };

    return { ...defaultConfig, ...config };
  }

  private hasCycles(reactFlowData: any): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Cycle detected
      }
      
      if (visited.has(nodeId)) {
        return false; // Already processed
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // Find all nodes that this node connects to
      const outgoingEdges = reactFlowData.edges.filter((edge: any) => edge.source === nodeId);
      
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) {
          return true; // Cycle found in child
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // Check each node as a potential starting point
    for (const node of reactFlowData.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

// Create singleton instance for global use
export const workflowExecutionService = new WorkflowExecutionService();
