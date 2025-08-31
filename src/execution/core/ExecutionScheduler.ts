// @ts-nocheck
import { 
  WorkflowExecutionContext, 
  ExecutionDAG, 
  ExecutionNode,
  NodeExecutionStatus,
  ParallelGroup
} from '../types/ExecutionTypes';

interface SchedulerCallbacks {
  onNodeStart: (nodeId: string) => void;
  onNodeComplete: (nodeId: string, result: any) => void;
  onNodeError: (nodeId: string, error: any) => void;
  onProgress: (progress: any) => void;
}

export class ExecutionScheduler {
  private activeExecutions = new Map<string, ExecutionState>();
  private executionQueues = new Map<string, ExecutionQueue>();

  constructor() {
    console.log('⏰ Execution Scheduler initialized');
  }

  async executeDAG(
    context: WorkflowExecutionContext,
    dag: ExecutionDAG,
    callbacks: SchedulerCallbacks
  ): Promise<any> {
    console.log(`🚀 Starting DAG execution for: ${context.id}`);
    
    const executionState = new ExecutionState(context, dag, callbacks);
    this.activeExecutions.set(context.id, executionState);
    
    try {
      // Initialize execution queue
      const queue = new ExecutionQueue(dag);
      this.executionQueues.set(context.id, queue);
      
      // Start with entry point nodes
      const entryNodes = dag.nodes.filter(node => dag.entryPoints.includes(node.id));
      queue.enqueueNodes(entryNodes);
      
      // Execute nodes in optimal order
      const result = await this.executeNodes(context.id, executionState, queue);
      
      console.log(`✅ DAG execution completed for: ${context.id}`);
      return result;
      
    } catch (error) {
      console.error(`❌ DAG execution failed for: ${context.id}`, error);
      throw error;
    } finally {
      this.activeExecutions.delete(context.id);
      this.executionQueues.delete(context.id);
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.cancelled = true;
      console.log(`🛑 Execution cancelled: ${executionId}`);
    }
  }

  async pauseExecution(executionId: string): Promise<void> {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.paused = true;
      console.log(`⏸️ Execution paused: ${executionId}`);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const state = this.activeExecutions.get(executionId);
    if (state) {
      state.paused = false;
      console.log(`▶️ Execution resumed: ${executionId}`);
    }
  }

  private async executeNodes(
    executionId: string,
    state: ExecutionState,
    queue: ExecutionQueue
  ): Promise<any> {
    const results = new Map<string, any>();
    const maxConcurrency = state.context.configuration.maxParallelBlocks;
    const runningNodes = new Set<string>();
    
    while (!queue.isEmpty() || runningNodes.size > 0) {
      // Check for cancellation or pause
      if (state.cancelled) {
        throw new Error('Execution cancelled');
      }
      
      if (state.paused) {
        await this.waitForResume(state);
      }
      
      // Start new nodes if under concurrency limit
      while (runningNodes.size < maxConcurrency && queue.hasReadyNodes()) {
        const node = queue.getNextNode();
        if (!node) break;
        
        const canStart = this.checkNodeDependencies(node, results, state.dag);
        if (canStart) {
          runningNodes.add(node.id);
          this.executeNodeAsync(executionId, node, state, results, runningNodes);
        } else {
          // Dependencies not ready, put back in queue
          queue.requeueNode(node);
          break;
        }
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.collectFinalResults(results, state.dag);
  }

  private async executeNodeAsync(
    executionId: string,
    node: ExecutionNode,
    state: ExecutionState,
    results: Map<string, any>,
    runningNodes: Set<string>
  ): Promise<void> {
    try {
      console.log(`🔄 Starting node execution: ${node.id}`);
      
      node.status = NodeExecutionStatus.RUNNING;
      node.startTime = new Date();
      state.callbacks.onNodeStart(node.id);
      
      // Simulate node execution
      const result = await this.executeNode(node, results, state);
      
      node.status = NodeExecutionStatus.COMPLETED;
      node.endTime = new Date();
      results.set(node.id, result);
      
      console.log(`✅ Node completed: ${node.id}`);
      state.callbacks.onNodeComplete(node.id, result);
      
      // Update metrics
      this.updateNodeMetrics(node);
      
    } catch (error) {
      console.error(`❌ Node failed: ${node.id}`, error);
      
      node.status = NodeExecutionStatus.FAILED;
      node.error = error as any;
      
      state.callbacks.onNodeError(node.id, error);
      
      // Handle retry logic
      if (this.shouldRetryNode(node, state.context.configuration.retryPolicy)) {
        await this.scheduleNodeRetry(node, state);
      } else {
        throw error;
      }
      
    } finally {
      runningNodes.delete(node.id);
    }
  }

  private async executeNode(
    node: ExecutionNode, 
    results: Map<string, any>,
    state: ExecutionState
  ): Promise<any> {
    // Prepare node inputs from previous results
    const inputs = this.prepareNodeInputs(node, results, state.dag);
    
    // Simulate execution time based on node estimation
    const executionTime = node.estimatedDuration + (Math.random() - 0.5) * 500;
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // Generate mock result based on node type
    const result = this.generateNodeResult(node, inputs);
    
    return result;
  }

  private checkNodeDependencies(
    node: ExecutionNode, 
    results: Map<string, any>,
    dag: ExecutionDAG
  ): boolean {
    const dependencies = dag.dependencies[node.id]?.dependencies || [];
    return dependencies.every(depId => results.has(depId));
  }

  private prepareNodeInputs(
    node: ExecutionNode,
    results: Map<string, any>,
    dag: ExecutionDAG
  ): any {
    const inputs: any = {};
    
    // Get input data from connected nodes
    const inputEdges = dag.edges.filter(edge => edge.targetNodeId === node.id);
    
    for (const edge of inputEdges) {
      const sourceResult = results.get(edge.sourceNodeId);
      if (sourceResult) {
        inputs[edge.targetInput] = sourceResult[edge.sourceOutput] || sourceResult;
      }
    }
    
    return inputs;
  }

  private generateNodeResult(node: ExecutionNode, inputs: any): any {
    // Generate appropriate result based on node type
    switch (node.type) {
      case 'input':
        return { data: `Input data for ${node.id}`, timestamp: new Date() };
      case 'mlAlgorithm':
        return { 
          prediction: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: Math.random(),
          processed: true 
        };
      case 'neuralNetwork':
        return {
          embedding: Array.from({ length: 128 }, () => Math.random()),
          loss: Math.random() * 0.1,
          accuracy: 0.9 + Math.random() * 0.1
        };
      case 'output':
        return { 
          result: `Final output from ${node.id}`,
          inputs: Object.keys(inputs),
          timestamp: new Date()
        };
      default:
        return { 
          processed: true, 
          nodeId: node.id,
          timestamp: new Date(),
          data: inputs 
        };
    }
  }

  private updateNodeMetrics(node: ExecutionNode): void {
    if (node.startTime && node.endTime) {
      const duration = node.endTime.getTime() - node.startTime.getTime();
      node.metrics.duration = duration;
      
      // Simulate other metrics
      node.metrics.memoryUsage.peak = Math.random() * 500 + 100;
      node.metrics.memoryUsage.average = node.metrics.memoryUsage.peak * 0.7;
      node.metrics.cpuUsage = [Math.random() * 80 + 20];
      node.metrics.throughput.itemsProcessed = Math.floor(Math.random() * 1000);
    }
  }

  private shouldRetryNode(node: ExecutionNode, retryPolicy: any): boolean {
    return (node.metrics.retryCount || 0) < retryPolicy.maxRetries;
  }

  private async scheduleNodeRetry(node: ExecutionNode, state: ExecutionState): Promise<void> {
    node.metrics.retryCount = (node.metrics.retryCount || 0) + 1;
    
    const delay = this.calculateRetryDelay(
      node.metrics.retryCount,
      state.context.configuration.retryPolicy
    );
    
    console.log(`🔄 Retrying node ${node.id} in ${delay}ms (attempt ${node.metrics.retryCount})`);
    
    setTimeout(() => {
      node.status = NodeExecutionStatus.PENDING;
    }, delay);
  }

  private calculateRetryDelay(retryCount: number, retryPolicy: any): number {
    switch (retryPolicy.backoffStrategy) {
      case 'exponential':
        return Math.min(
          retryPolicy.baseDelayMs * Math.pow(2, retryCount - 1),
          retryPolicy.maxDelayMs
        );
      case 'linear':
        return Math.min(
          retryPolicy.baseDelayMs * retryCount,
          retryPolicy.maxDelayMs
        );
      default:
        return retryPolicy.baseDelayMs;
    }
  }

  private async waitForResume(state: ExecutionState): Promise<void> {
    while (state.paused && !state.cancelled) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private collectFinalResults(results: Map<string, any>, dag: ExecutionDAG): any {
    const finalResults: any = {};
    
    // Collect results from exit point nodes
    for (const exitNodeId of dag.exitPoints) {
      const result = results.get(exitNodeId);
      if (result) {
        finalResults[exitNodeId] = result;
      }
    }
    
    return finalResults;
  }
}

class ExecutionState {
  public cancelled = false;
  public paused = false;

  constructor(
    public context: WorkflowExecutionContext,
    public dag: ExecutionDAG,
    public callbacks: SchedulerCallbacks
  ) {}
}

class ExecutionQueue {
  private queue: ExecutionNode[] = [];
  private processed = new Set<string>();

  constructor(private dag: ExecutionDAG) {
    this.queue = [...dag.nodes];
  }

  enqueueNodes(nodes: ExecutionNode[]): void {
    for (const node of nodes) {
      if (!this.processed.has(node.id)) {
        this.queue.push(node);
      }
    }
  }

  getNextNode(): ExecutionNode | null {
    return this.queue.shift() || null;
  }

  requeueNode(node: ExecutionNode): void {
    this.queue.push(node);
  }

  hasReadyNodes(): boolean {
    return this.queue.length > 0;
  }

  isEmpty(): boolean {
    return this.queue.length === 0 && this.processed.size === this.dag.nodes.length;
  }
}
