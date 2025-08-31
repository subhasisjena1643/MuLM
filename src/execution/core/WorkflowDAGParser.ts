// @ts-nocheck
import { GridStorage } from '../../storage/GridStorage';
import { BlockDefinition } from '../../storage/types/GridTypes';
import { 
  WorkflowExecutionContext, 
  ExecutionDAG, 
  ExecutionNode, 
  ExecutionEdge,
  ExecutionStatus,
  NodeExecutionStatus,
  ExecutionConfiguration,
  ExecutionProgress,
  ExecutionError,
  DataContract,
  ParallelGroup,
  ResourceAllocation,
  ExecutionMetrics
} from '../types/ExecutionTypes';

export class WorkflowDAGParser {
  private gridStorage: GridStorage;

  constructor(gridStorage: GridStorage) {
    this.gridStorage = gridStorage;
  }

  async parseWorkflow(workflowJson: any, config: ExecutionConfiguration): Promise<ExecutionDAG> {
    try {
      console.log('🔍 Parsing workflow JSON into execution DAG...');
      
      const nodes = await this.parseNodes(workflowJson.nodes || []);
      const edges = this.parseEdges(workflowJson.edges || [], nodes);
      const parallelGroups = this.identifyParallelGroups(nodes, edges);
      const dependencies = this.buildDependencyMap(nodes, edges);
      
      const dag: ExecutionDAG = {
        nodes,
        edges,
        entryPoints: this.findEntryPoints(nodes, edges),
        exitPoints: this.findExitPoints(nodes, edges),
        parallelGroups,
        dependencies,
        estimatedDuration: this.estimateExecutionTime(nodes, dependencies),
        resourceRequirements: this.calculateResourceRequirements(nodes)
      };

      console.log(`✅ DAG parsed: ${nodes.length} nodes, ${edges.length} edges, ${parallelGroups.length} parallel groups`);
      return dag;
    } catch (error) {
      console.error('❌ Failed to parse workflow:', error);
      throw new Error(`Workflow parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async parseNodes(nodeConfigs: any[]): Promise<ExecutionNode[]> {
    const nodes: ExecutionNode[] = [];
    
    for (const nodeConfig of nodeConfigs) {
      try {
        // Load block definition from grid storage
        const gridCell = await this.gridStorage.getBlock(nodeConfig.blockId);
        if (!gridCell) {
          throw new Error(`Block not found: ${nodeConfig.blockId}`);
        }

        const blockDef = gridCell.block;
        const node: ExecutionNode = {
          id: nodeConfig.id || this.generateNodeId(),
          blockId: nodeConfig.blockId,
          type: blockDef.category,
          config: nodeConfig.config || {},
          inputs: this.parseDataContracts(blockDef.inputs || []),
          outputs: this.parseDataContracts(blockDef.outputs || []),
          dependencies: nodeConfig.dependencies || [],
          resourceNeeds: this.calculateNodeResourceNeeds(blockDef, gridCell),
          estimatedDuration: this.estimateNodeDuration(blockDef, gridCell, nodeConfig.config),
          status: NodeExecutionStatus.PENDING,
          metrics: this.initializeMetrics()
        };

        nodes.push(node);
      } catch (error) {
        console.error(`Failed to parse node ${nodeConfig.id}:`, error);
        throw error;
      }
    }

    return nodes;
  }

  private parseEdges(edgeConfigs: any[], nodes: ExecutionNode[]): ExecutionEdge[] {
    return edgeConfigs.map(edgeConfig => ({
      id: edgeConfig.id || this.generateEdgeId(),
      sourceNodeId: edgeConfig.source,
      targetNodeId: edgeConfig.target,
      sourceOutput: edgeConfig.sourceOutput,
      targetInput: edgeConfig.targetInput,
      dataContract: this.resolveDataContract(
        nodes.find(n => n.id === edgeConfig.source)!,
        nodes.find(n => n.id === edgeConfig.target)!,
        edgeConfig.sourceOutput,
        edgeConfig.targetInput
      ),
      streamConfig: {
        bufferSize: edgeConfig.bufferSize || 1024,
        flushInterval: edgeConfig.flushInterval || 100,
        compression: edgeConfig.compression || false,
        backpressure: edgeConfig.backpressure || true
      }
    }));
  }

  private identifyParallelGroups(nodes: ExecutionNode[], edges: ExecutionEdge[]): ParallelGroup[] {
    const groups: ParallelGroup[] = [];
    const visited = new Set<string>();
    
    for (const node of nodes) {
      if (visited.has(node.id)) continue;
      
      const parallelNodes = this.findParallelNodes(node, nodes, edges, visited);
      if (parallelNodes.length > 1) {
        groups.push({
          id: `group_${groups.length}`,
          nodeIds: parallelNodes.map(n => n.id),
          maxConcurrency: Math.min(parallelNodes.length, 4), // Default max concurrency
          resourcePool: 'default',
          coordinationStrategy: 'independent'
        });
      }
    }
    
    return groups;
  }

  private findParallelNodes(
    startNode: ExecutionNode, 
    allNodes: ExecutionNode[], 
    edges: ExecutionEdge[],
    visited: Set<string>
  ): ExecutionNode[] {
    const parallelNodes = [startNode];
    visited.add(startNode.id);
    
    // Find nodes at the same dependency level that can run in parallel
    const startDependencies = this.getNodeDependencies(startNode.id, edges);
    
    for (const node of allNodes) {
      if (visited.has(node.id)) continue;
      
      const nodeDependencies = this.getNodeDependencies(node.id, edges);
      
      // Check if nodes can run in parallel (no direct dependencies)
      if (this.canRunInParallel(startDependencies, nodeDependencies, edges)) {
        parallelNodes.push(node);
        visited.add(node.id);
      }
    }
    
    return parallelNodes;
  }

  private buildDependencyMap(nodes: ExecutionNode[], edges: ExecutionEdge[]) {
    const dependencyMap: any = {};
    
    for (const node of nodes) {
      const dependencies = edges
        .filter(edge => edge.targetNodeId === node.id)
        .map(edge => edge.sourceNodeId);
      
      const dependents = edges
        .filter(edge => edge.sourceNodeId === node.id)
        .map(edge => edge.targetNodeId);
      
      dependencyMap[node.id] = {
        dependencies,
        dependents,
        criticalPath: this.isOnCriticalPath(node.id, nodes, edges),
        depth: this.calculateNodeDepth(node.id, edges)
      };
    }
    
    return dependencyMap;
  }

  private findEntryPoints(nodes: ExecutionNode[], edges: ExecutionEdge[]): string[] {
    return nodes
      .filter(node => !edges.some(edge => edge.targetNodeId === node.id))
      .map(node => node.id);
  }

  private findExitPoints(nodes: ExecutionNode[], edges: ExecutionEdge[]): string[] {
    return nodes
      .filter(node => !edges.some(edge => edge.sourceNodeId === node.id))
      .map(node => node.id);
  }

  private parseDataContracts(contractConfigs: any[]): DataContract[] {
    return contractConfigs.map(config => ({
      name: config.name,
      type: config.type,
      schema: config.schema || {},
      validation: config.validation || [],
      serialization: {
        format: config.format || 'json',
        compression: config.compression || false,
        encryption: config.encryption || false
      },
      streaming: config.streaming || false,
      optional: config.optional || false
    }));
  }

  private calculateNodeResourceNeeds(blockDef: BlockDefinition, gridCell: any) {
    // Estimate resource needs based on block type and configuration
    const baseMemory = 128; // MB
    const baseCPU = 0.5;
    
    let memory = baseMemory;
    let cpu = baseCPU;
    
    // Adjust based on block type
    switch (blockDef.category) {
      case 'neuralNetwork':
        memory *= 4;
        cpu *= 2;
        break;
      case 'mlAlgorithm':
        memory *= 3;
        cpu *= 2;
        break;
      default:
        memory *= 1;
        cpu *= 1;
        break;
    }
    
    // Use grid cell performance data if available
    const performanceData = gridCell.metadata?.performance;
    if (performanceData) {
      // Adjust based on historical performance
      const avgTime = performanceData.avgExecutionTime || 1000;
      if (avgTime > 5000) {
        memory *= 1.5;
        cpu *= 1.3;
      }
    }
    
    return {
      memory,
      cpu,
      storage: 100, // Default storage MB
      network: 10,  // Default network MB/s
      customRequirements: {}
    };
  }

  private estimateNodeDuration(blockDef: BlockDefinition, gridCell: any, config: any): number {
    // Use historical data from grid cell if available
    const performanceData = gridCell.metadata?.performance;
    const baseDuration = performanceData?.avgExecutionTime || 1000;
    
    const complexityMultiplier = this.calculateComplexityMultiplier(blockDef, config);
    return baseDuration * complexityMultiplier;
  }

  private calculateComplexityMultiplier(blockDef: BlockDefinition, config: any): number {
    let multiplier = 1;
    
    // Adjust based on configuration complexity
    if (config.iterations && config.iterations > 1) {
      multiplier *= config.iterations * 0.8; // Slight efficiency gain in iterations
    }
    
    if (config.dataSize) {
      multiplier *= Math.log10(config.dataSize / 1000 + 1);
    }
    
    return Math.max(0.1, multiplier);
  }

  private estimateExecutionTime(nodes: ExecutionNode[], dependencies: any): number {
    // Calculate critical path duration
    const criticalPathNodes = nodes.filter(node => 
      dependencies[node.id]?.criticalPath
    );
    
    return criticalPathNodes.reduce((total, node) => 
      total + node.estimatedDuration, 0
    );
  }

  private calculateResourceRequirements(nodes: ExecutionNode[]) {
    const total = nodes.reduce((acc, node) => ({
      totalMemory: acc.totalMemory + node.resourceNeeds.memory,
      peakMemory: Math.max(acc.peakMemory, node.resourceNeeds.memory),
      cpuCores: acc.cpuCores + node.resourceNeeds.cpu,
      storage: acc.storage + node.resourceNeeds.storage,
      networkBandwidth: Math.max(acc.networkBandwidth, node.resourceNeeds.network),
      customResources: acc.customResources
    }), {
      totalMemory: 0,
      peakMemory: 0,
      cpuCores: 0,
      storage: 0,
      networkBandwidth: 0,
      customResources: {}
    });
    
    return total;
  }

  // Helper methods
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEdgeId(): string {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private resolveDataContract(
    sourceNode: ExecutionNode, 
    targetNode: ExecutionNode,
    sourceOutput: string,
    targetInput: string
  ): DataContract {
    const sourceContract = sourceNode?.outputs.find(o => o.name === sourceOutput);
    const targetContract = targetNode?.inputs.find(i => i.name === targetInput);
    
    if (!sourceContract || !targetContract) {
      throw new Error(`Data contract mismatch: ${sourceOutput} -> ${targetInput}`);
    }
    
    // Validate compatibility
    if (sourceContract.type !== targetContract.type) {
      console.warn(`Type mismatch: ${sourceContract.type} -> ${targetContract.type}`);
    }
    
    return sourceContract;
  }

  private getNodeDependencies(nodeId: string, edges: ExecutionEdge[]): string[] {
    return edges
      .filter(edge => edge.targetNodeId === nodeId)
      .map(edge => edge.sourceNodeId);
  }

  private canRunInParallel(
    deps1: string[], 
    deps2: string[], 
    edges: ExecutionEdge[]
  ): boolean {
    // Nodes can run in parallel if they don't depend on each other
    // and have similar dependency structures
    const intersection = deps1.filter(dep => deps2.includes(dep));
    return intersection.length === Math.min(deps1.length, deps2.length);
  }

  private isOnCriticalPath(nodeId: string, nodes: ExecutionNode[], edges: ExecutionEdge[]): boolean {
    // Simplified critical path calculation
    // In reality, this would use more sophisticated algorithms
    const depth = this.calculateNodeDepth(nodeId, edges);
    const maxDepth = Math.max(...nodes.map(n => this.calculateNodeDepth(n.id, edges)));
    return depth / maxDepth > 0.8; // Nodes in top 80% of depth are considered critical
  }

  private calculateNodeDepth(nodeId: string, edges: ExecutionEdge[]): number {
    const dependencies = this.getNodeDependencies(nodeId, edges);
    if (dependencies.length === 0) return 0;
    
    return 1 + Math.max(...dependencies.map(dep => 
      this.calculateNodeDepth(dep, edges)
    ));
  }

  private initializeMetrics(): ExecutionMetrics {
    return {
      memoryUsage: {
        peak: 0,
        average: 0,
        allocated: 0,
        freed: 0,
        leaks: 0
      },
      cpuUsage: [],
      throughput: {
        itemsProcessed: 0,
        bytesProcessed: 0,
        itemsPerSecond: 0,
        bytesPerSecond: 0
      },
      errorCount: 0,
      retryCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}
