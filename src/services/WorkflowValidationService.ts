// @ts-nocheck
/**
 * Workflow Validation Service
 * Tests workflow integrity, block configurations, and identifies errors
 */

import { Node, Edge } from 'reactflow';
import { BlockDefinition } from '../storage/types/GridTypes';

export interface ValidationError {
  id: string;
  blockId: string;
  blockName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  autoFixAvailable: boolean;
  autoFix?: () => Promise<Node>;
  category: 'configuration' | 'connection' | 'implementation' | 'performance';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  performance: {
    estimatedExecutionTime: number;
    memoryUsage: number;
    complexity: 'low' | 'medium' | 'high';
  };
  suggestions: string[];
}

export class WorkflowValidationService {
  /**
   * Validate entire workflow
   */
  static async validateWorkflow(nodes: Node[], edges: Edge[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Validate individual blocks
    for (const node of nodes) {
      const blockErrors = await this.validateBlock(node);
      errors.push(...blockErrors.filter(e => e.severity === 'error'));
      warnings.push(...blockErrors.filter(e => e.severity === 'warning'));
    }

    // 2. Validate connections
    const connectionErrors = await this.validateConnections(nodes, edges);
    errors.push(...connectionErrors.filter(e => e.severity === 'error'));
    warnings.push(...connectionErrors.filter(e => e.severity === 'warning'));

    // 3. Validate workflow logic
    const logicErrors = await this.validateWorkflowLogic(nodes, edges);
    errors.push(...logicErrors.filter(e => e.severity === 'error'));
    warnings.push(...logicErrors.filter(e => e.severity === 'warning'));

    // 4. Performance analysis
    const performance = this.analyzePerformance(nodes, edges);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance,
      suggestions: this.generateSuggestions(nodes, edges, errors, warnings)
    };
  }

  /**
   * Validate individual block
   */
  private static async validateBlock(node: Node): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const block = node.data.block as BlockDefinition;

    if (!block) {
      errors.push({
        id: `${node.id}-missing-block`,
        blockId: node.id,
        blockName: 'Unknown Block',
        severity: 'error',
        message: 'Block definition is missing',
        suggestion: 'Remove this node or assign a valid block definition',
        autoFixAvailable: false,
        category: 'implementation'
      });
      return errors;
    }

    // Check required configuration
    if (block.config) {
      for (const [key, configDef] of Object.entries(block.config)) {
        if (typeof configDef === 'object' && configDef.required) {
          const userConfig = node.data.config || {};
          if (!userConfig[key] && !configDef.default) {
            errors.push({
              id: `${node.id}-missing-config-${key}`,
              blockId: node.id,
              blockName: block.name,
              severity: 'error',
              message: `Required configuration '${key}' is missing`,
              suggestion: `Set a value for '${key}' in the block configuration`,
              autoFixAvailable: !!configDef.default,
              autoFix: async () => {
                const updatedNode = { ...node };
                updatedNode.data.config = {
                  ...updatedNode.data.config,
                  [key]: configDef.default
                };
                return updatedNode;
              },
              category: 'configuration'
            });
          }
        }
      }
    }

    // Validate implementation
    if (block.implementation) {
      try {
        // Check if implementation is valid JavaScript/TypeScript
        new Function(block.implementation);
      } catch (syntaxError) {
        errors.push({
          id: `${node.id}-syntax-error`,
          blockId: node.id,
          blockName: block.name,
          severity: 'error',
          message: `Syntax error in block implementation: ${syntaxError instanceof Error ? syntaxError.message : String(syntaxError)}`,
          suggestion: 'Fix the syntax error in the block implementation code',
          autoFixAvailable: false,
          category: 'implementation'
        });
      }
    }

    // Check for missing required ports
    const requiredInputs = block.inputs?.filter(input => input.required !== false) || [];
    const requiredOutputs = block.outputs?.filter(output => output.required !== false) || [];

    if (requiredInputs.length === 0 && block.category !== 'input') {
      errors.push({
        id: `${node.id}-no-inputs`,
        blockId: node.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Block has no input ports but is not an input block',
        suggestion: 'Consider adding input ports or changing block category to "input"',
        autoFixAvailable: false,
        category: 'configuration'
      });
    }

    if (requiredOutputs.length === 0 && block.category !== 'output') {
      errors.push({
        id: `${node.id}-no-outputs`,
        blockId: node.id,
        blockName: block.name,
        severity: 'warning',
        message: 'Block has no output ports but is not an output block',
        suggestion: 'Consider adding output ports or changing block category to "output"',
        autoFixAvailable: false,
        category: 'configuration'
      });
    }

    return errors;
  }

  /**
   * Validate connections between blocks
   */
  private static async validateConnections(nodes: Node[], edges: Edge[]): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    for (const edge of edges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode) {
        errors.push({
          id: `${edge.id}-missing-source`,
          blockId: edge.source,
          blockName: 'Missing Source',
          severity: 'error',
          message: `Connection source node '${edge.source}' not found`,
          suggestion: 'Remove this connection or fix the source node reference',
          autoFixAvailable: false,
          category: 'connection'
        });
        continue;
      }

      if (!targetNode) {
        errors.push({
          id: `${edge.id}-missing-target`,
          blockId: edge.target,
          blockName: 'Missing Target',
          severity: 'error',
          message: `Connection target node '${edge.target}' not found`,
          suggestion: 'Remove this connection or fix the target node reference',
          autoFixAvailable: false,
          category: 'connection'
        });
        continue;
      }

      // Validate port compatibility
      const sourceBlock = sourceNode.data.block as BlockDefinition;
      const targetBlock = targetNode.data.block as BlockDefinition;

      if (sourceBlock && targetBlock) {
        const sourcePort = sourceBlock.outputs?.find(output => output.id === edge.sourceHandle);
        const targetPort = targetBlock.inputs?.find(input => input.id === edge.targetHandle);

        if (edge.sourceHandle && !sourcePort) {
          errors.push({
            id: `${edge.id}-invalid-source-port`,
            blockId: edge.source,
            blockName: sourceBlock.name,
            severity: 'error',
            message: `Source port '${edge.sourceHandle}' does not exist`,
            suggestion: 'Select a valid output port for this connection',
            autoFixAvailable: false,
            category: 'connection'
          });
        }

        if (edge.targetHandle && !targetPort) {
          errors.push({
            id: `${edge.id}-invalid-target-port`,
            blockId: edge.target,
            blockName: targetBlock.name,
            severity: 'error',
            message: `Target port '${edge.targetHandle}' does not exist`,
            suggestion: 'Select a valid input port for this connection',
            autoFixAvailable: false,
            category: 'connection'
          });
        }

        // Check data type compatibility
        if (sourcePort && targetPort) {
          if (sourcePort.dataType !== targetPort.dataType && 
              sourcePort.dataType !== 'any' && targetPort.dataType !== 'any') {
            errors.push({
              id: `${edge.id}-type-mismatch`,
              blockId: edge.target,
              blockName: targetBlock.name,
              severity: 'warning',
              message: `Data type mismatch: ${sourcePort.dataType} → ${targetPort.dataType}`,
              suggestion: 'Add a type converter block or modify the connection',
              autoFixAvailable: false,
              category: 'connection'
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate overall workflow logic
   */
  private static async validateWorkflowLogic(nodes: Node[], edges: Edge[]): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check for circular dependencies
    const cycles = this.detectCycles(nodes, edges);
    for (const cycle of cycles) {
      errors.push({
        id: `cycle-${cycle.join('-')}`,
        blockId: cycle[0],
        blockName: nodes.find(n => n.id === cycle[0])?.data.block?.name || 'Unknown',
        severity: 'error',
        message: `Circular dependency detected: ${cycle.join(' → ')}`,
        suggestion: 'Break the circular dependency by removing or reordering connections',
        autoFixAvailable: false,
        category: 'connection'
      });
    }

    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(nodes, edges);
    const unreachableNodes = nodes.filter(node => !reachableNodes.has(node.id));
    
    for (const node of unreachableNodes) {
      if (node.data.block?.category !== 'input') {
        errors.push({
          id: `${node.id}-unreachable`,
          blockId: node.id,
          blockName: node.data.block?.name || 'Unknown',
          severity: 'warning',
          message: 'Block is not reachable from any input block',
          suggestion: 'Connect this block to the workflow or remove it if not needed',
          autoFixAvailable: false,
          category: 'connection'
        });
      }
    }

    // Check for missing input/output blocks
    const hasInputBlock = nodes.some(node => node.data.block?.category === 'input');
    const hasOutputBlock = nodes.some(node => node.data.block?.category === 'output');

    if (!hasInputBlock && nodes.length > 0) {
      errors.push({
        id: 'missing-input-block',
        blockId: 'workflow',
        blockName: 'Workflow',
        severity: 'warning',
        message: 'Workflow has no input blocks',
        suggestion: 'Add an input block to provide data to the workflow',
        autoFixAvailable: false,
        category: 'configuration'
      });
    }

    if (!hasOutputBlock && nodes.length > 0) {
      errors.push({
        id: 'missing-output-block',
        blockId: 'workflow',
        blockName: 'Workflow',
        severity: 'warning',
        message: 'Workflow has no output blocks',
        suggestion: 'Add an output block to capture workflow results',
        autoFixAvailable: false,
        category: 'configuration'
      });
    }

    return errors;
  }

  /**
   * Analyze workflow performance
   */
  private static analyzePerformance(nodes: Node[], edges: Edge[]): {
    estimatedExecutionTime: number;
    memoryUsage: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    const complexity: 'low' | 'medium' | 'high' = nodes.length > 20 ? 'high' : nodes.length > 10 ? 'medium' : 'low';
    const estimatedExecutionTime = nodes.length * 100; // ms per block estimate
    const memoryUsage = nodes.length * 10; // MB per block estimate

    return {
      estimatedExecutionTime,
      memoryUsage,
      complexity
    };
  }

  /**
   * Generate workflow suggestions
   */
  private static generateSuggestions(nodes: Node[], edges: Edge[], errors: ValidationError[], warnings: ValidationError[]): string[] {
    const suggestions: string[] = [];

    if (errors.length > 0) {
      suggestions.push(`Fix ${errors.length} critical error(s) before running the workflow`);
    }

    if (warnings.length > 0) {
      suggestions.push(`Consider addressing ${warnings.length} warning(s) to improve workflow quality`);
    }

    if (nodes.length === 0) {
      suggestions.push('Add blocks to create a workflow');
    }

    if (edges.length === 0 && nodes.length > 1) {
      suggestions.push('Connect blocks to define data flow');
    }

    const performance = this.analyzePerformance(nodes, edges);
    if (performance.complexity === 'high') {
      suggestions.push('Consider breaking this workflow into smaller sub-workflows for better performance');
    }

    return suggestions;
  }

  /**
   * Detect cycles in the workflow graph
   */
  private static detectCycles(nodes: Node[], edges: Edge[]): string[][] {
    const graph = new Map<string, string[]>();
    const cycles: string[][] = [];

    // Build adjacency list
    for (const node of nodes) {
      graph.set(node.id, []);
    }

    for (const edge of edges) {
      const targets = graph.get(edge.source) || [];
      targets.push(edge.target);
      graph.set(edge.source, targets);
    }

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat(nodeId));
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }

  /**
   * Find all reachable nodes from input blocks
   */
  private static findReachableNodes(nodes: Node[], edges: Edge[]): Set<string> {
    const reachable = new Set<string>();
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const node of nodes) {
      graph.set(node.id, []);
    }

    for (const edge of edges) {
      const targets = graph.get(edge.source) || [];
      targets.push(edge.target);
      graph.set(edge.source, targets);
    }

    // Start DFS from input blocks
    const inputBlocks = nodes.filter(node => node.data.block?.category === 'input');
    
    const dfs = (nodeId: string) => {
      if (reachable.has(nodeId)) return;
      
      reachable.add(nodeId);
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }
    };

    for (const inputBlock of inputBlocks) {
      dfs(inputBlock.id);
    }

    return reachable;
  }

  /**
   * Auto-fix workflow errors where possible
   */
  static async autoFixWorkflow(nodes: Node[], errors: ValidationError[]): Promise<Node[]> {
    const fixedNodes = [...nodes];
    const autoFixableErrors = errors.filter(error => error.autoFixAvailable && error.autoFix);

    for (const error of autoFixableErrors) {
      try {
        const nodeIndex = fixedNodes.findIndex(node => node.id === error.blockId);
        if (nodeIndex !== -1 && error.autoFix) {
          fixedNodes[nodeIndex] = await error.autoFix();
        }
      } catch (fixError) {
        console.error(`Failed to auto-fix error ${error.id}:`, fixError);
      }
    }

    return fixedNodes;
  }
}
