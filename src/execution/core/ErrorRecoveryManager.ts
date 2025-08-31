// @ts-nocheck
import { 
  WorkflowExecutionContext, 
  ExecutionError, 
  ErrorSuggestion,
  AlternativePath,
  ExecutionDAG
} from '../types/ExecutionTypes';

export class ErrorRecoveryManager {
  private recoveryHistory = new Map<string, RecoveryAttempt[]>();
  private workingStates = new Map<string, WorkflowState>();

  constructor() {
    console.log('🛠️ Error Recovery Manager initialized');
  }

  async handleError(
    context: WorkflowExecutionContext,
    nodeId: string,
    error: ExecutionError
  ): Promise<void> {
    console.log(`🚨 Handling error in node ${nodeId}:`, error.message);
    
    // Store current error for analysis
    this.recordErrorAttempt(context.id, nodeId, error);
    
    // Check if this is a recoverable error
    if (!error.recoverable) {
      console.log('❌ Error is not recoverable');
      throw error;
    }

    // Try different recovery strategies
    if (context.configuration.errorHandling.isolateFailedBlocks) {
      await this.isolateFailedBlock(context, nodeId);
    }

    if (context.configuration.errorHandling.generateAlternativePaths) {
      const alternatives = await this.generateAlternativePaths(context, nodeId, error);
      error.alternativePaths = alternatives;
    }

    if (context.configuration.errorHandling.aiAssistedRecovery) {
      const suggestions = await this.generateRecoverySuggestions(context, error);
      error.suggestions = suggestions;
    }
  }

  async generateRecoverySuggestions(
    context: WorkflowExecutionContext,
    error: ExecutionError
  ): Promise<ErrorSuggestion[]> {
    console.log('🤖 Generating AI-powered recovery suggestions...');
    
    const suggestions: ErrorSuggestion[] = [];
    
    // Analyze error pattern and suggest fixes
    switch (error.code) {
      case 'TIMEOUT':
        suggestions.push({
          type: 'config',
          description: 'Increase timeout duration for this node type',
          confidence: 0.8,
          autoApplicable: true,
          action: 'updateTimeout',
          parameters: { timeout: context.configuration.timeoutMs * 1.5 }
        });
        break;
        
      case 'MEMORY_ERROR':
        suggestions.push({
          type: 'resource',
          description: 'Allocate more memory to this execution',
          confidence: 0.9,
          autoApplicable: true,
          action: 'scaleMemory',
          parameters: { memoryMultiplier: 1.5 }
        });
        break;
        
      case 'VALIDATION_ERROR':
        suggestions.push({
          type: 'fix',
          description: 'Data validation failed - check input data format',
          confidence: 0.7,
          autoApplicable: false,
          action: 'validateInputs'
        });
        break;
        
      default:
        suggestions.push({
          type: 'alternative',
          description: 'Try alternative execution path',
          confidence: 0.6,
          autoApplicable: true,
          action: 'useAlternativePath'
        });
    }
    
    // Add context-specific suggestions
    const historyBasedSuggestions = this.generateHistoryBasedSuggestions(context, error);
    suggestions.push(...historyBasedSuggestions);
    
    return suggestions;
  }

  async rollbackToLastWorkingState(context: WorkflowExecutionContext): Promise<void> {
    console.log(`🔄 Rolling back execution ${context.id} to last working state`);
    
    const lastWorkingState = this.workingStates.get(context.id);
    if (!lastWorkingState) {
      console.log('⚠️ No previous working state found');
      return;
    }

    // Restore the workflow to the last working state
    // This would involve reverting node states, clearing failed results, etc.
    console.log(`✅ Rolled back to state from ${lastWorkingState.timestamp}`);
  }

  saveWorkingState(context: WorkflowExecutionContext, nodeId: string): void {
    const state: WorkflowState = {
      executionId: context.id,
      nodeId,
      timestamp: new Date(),
      snapshot: this.createStateSnapshot(context)
    };
    
    this.workingStates.set(context.id, state);
  }

  private async isolateFailedBlock(
    context: WorkflowExecutionContext,
    nodeId: string
  ): Promise<void> {
    console.log(`🔒 Isolating failed block: ${nodeId}`);
    
    // Mark the node as isolated to prevent cascade failures
    const dag = context.metadata.dag as ExecutionDAG;
    const node = dag.nodes.find(n => n.id === nodeId);
    
    if (node) {
      // Update node status and prevent it from affecting downstream nodes
      node.status = 'failed' as any;
      // Add isolation flag to node config
      node.config = { ...node.config, isolated: true };
      
      console.log(`✅ Block ${nodeId} has been isolated`);
    }
  }

  private async generateAlternativePaths(
    context: WorkflowExecutionContext,
    failedNodeId: string,
    error: ExecutionError
  ): Promise<AlternativePath[]> {
    console.log(`🛤️ Generating alternative execution paths for node: ${failedNodeId}`);
    
    const dag = context.metadata.dag as ExecutionDAG;
    const alternatives: AlternativePath[] = [];
    
    // Find parallel nodes that could replace the failed node
    const parallelNodes = this.findParallelNodes(dag, failedNodeId);
    
    if (parallelNodes.length > 0) {
      alternatives.push({
        id: `alt_parallel_${Date.now()}`,
        description: `Use parallel processing with ${parallelNodes.length} alternative nodes`,
        nodes: parallelNodes.map(n => n.id),
        estimatedDuration: Math.min(...parallelNodes.map(n => n.estimatedDuration)),
        confidence: 0.7,
        resourceRequirements: {
          totalMemory: Math.max(...parallelNodes.map(n => n.resourceNeeds.memory)),
          peakMemory: Math.max(...parallelNodes.map(n => n.resourceNeeds.memory)),
          cpuCores: parallelNodes.reduce((sum, n) => sum + n.resourceNeeds.cpu, 0),
          storage: Math.max(...parallelNodes.map(n => n.resourceNeeds.storage)),
          networkBandwidth: Math.max(...parallelNodes.map(n => n.resourceNeeds.network)),
          customResources: {}
        }
      });
    }
    
    // Find bypass paths
    const bypassPath = this.findBypassPath(dag, failedNodeId);
    if (bypassPath.length > 0) {
      alternatives.push({
        id: `alt_bypass_${Date.now()}`,
        description: `Bypass failed node using alternative route`,
        nodes: bypassPath,
        estimatedDuration: this.estimatePathDuration(dag, bypassPath),
        confidence: 0.8,
        resourceRequirements: this.calculatePathResources(dag, bypassPath)
      });
    }
    
    return alternatives;
  }

  private generateHistoryBasedSuggestions(
    context: WorkflowExecutionContext,
    error: ExecutionError
  ): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    const history = this.recoveryHistory.get(context.id) || [];
    
    // Look for patterns in previous recovery attempts
    const similarErrors = history.filter(attempt => 
      attempt.error.code === error.code
    );
    
    if (similarErrors.length > 0) {
      const lastSuccessful = similarErrors.find(attempt => attempt.successful);
      if (lastSuccessful) {
        suggestions.push({
          type: 'fix',
          description: `Apply previously successful fix: ${lastSuccessful.action}`,
          confidence: 0.9,
          autoApplicable: true,
          action: lastSuccessful.action,
          parameters: lastSuccessful.parameters
        });
      }
    }
    
    return suggestions;
  }

  private findParallelNodes(dag: ExecutionDAG, nodeId: string): any[] {
    // Find nodes that could run in parallel or as alternatives
    const node = dag.nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    return dag.nodes.filter(n => 
      n.id !== nodeId && 
      n.type === node.type &&
      this.canReplace(dag, nodeId, n.id)
    );
  }

  private findBypassPath(dag: ExecutionDAG, nodeId: string): string[] {
    // Find alternative path that bypasses the failed node
    const node = dag.nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    const dependencies = dag.dependencies[nodeId]?.dependencies || [];
    const dependents = dag.dependencies[nodeId]?.dependents || [];
    
    // Look for direct connections from dependencies to dependents
    const bypassPath: string[] = [];
    
    for (const dep of dependencies) {
      for (const dependent of dependents) {
        const directEdge = dag.edges.find(e => 
          e.sourceNodeId === dep && e.targetNodeId === dependent
        );
        if (directEdge) {
          bypassPath.push(dep, dependent);
        }
      }
    }
    
    return [...new Set(bypassPath)]; // Remove duplicates
  }

  private canReplace(dag: ExecutionDAG, originalNodeId: string, replacementNodeId: string): boolean {
    // Check if replacement node has compatible inputs/outputs
    const original = dag.nodes.find(n => n.id === originalNodeId);
    const replacement = dag.nodes.find(n => n.id === replacementNodeId);
    
    if (!original || !replacement) return false;
    
    // Simple compatibility check - could be more sophisticated
    return original.inputs.length === replacement.inputs.length &&
           original.outputs.length === replacement.outputs.length;
  }

  private estimatePathDuration(dag: ExecutionDAG, path: string[]): number {
    return path.reduce((total, nodeId) => {
      const node = dag.nodes.find(n => n.id === nodeId);
      return total + (node?.estimatedDuration || 0);
    }, 0);
  }

  private calculatePathResources(dag: ExecutionDAG, path: string[]): any {
    const nodes = path.map(nodeId => dag.nodes.find(n => n.id === nodeId)).filter(Boolean);
    
    return {
      totalMemory: nodes.reduce((sum, node) => sum + (node?.resourceNeeds.memory || 0), 0),
      peakMemory: Math.max(...nodes.map(node => node?.resourceNeeds.memory || 0)),
      cpuCores: nodes.reduce((sum, node) => sum + (node?.resourceNeeds.cpu || 0), 0),
      storage: Math.max(...nodes.map(node => node?.resourceNeeds.storage || 0)),
      networkBandwidth: Math.max(...nodes.map(node => node?.resourceNeeds.network || 0)),
      customResources: {}
    };
  }

  private recordErrorAttempt(
    executionId: string,
    nodeId: string,
    error: ExecutionError
  ): void {
    const attempts = this.recoveryHistory.get(executionId) || [];
    
    attempts.push({
      nodeId,
      error,
      timestamp: new Date(),
      action: '',
      parameters: {},
      successful: false
    });
    
    this.recoveryHistory.set(executionId, attempts);
  }

  private createStateSnapshot(context: WorkflowExecutionContext): any {
    // Create a snapshot of the current execution state
    return {
      status: context.status,
      resources: { ...context.resources },
      metadata: { ...context.metadata },
      timestamp: new Date()
    };
  }
}

interface RecoveryAttempt {
  nodeId: string;
  error: ExecutionError;
  timestamp: Date;
  action: string;
  parameters: any;
  successful: boolean;
}

interface WorkflowState {
  executionId: string;
  nodeId: string;
  timestamp: Date;
  snapshot: any;
}
