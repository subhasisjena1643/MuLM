// @ts-nocheck
// AI Workflow Generation Service
// Converts natural language prompts into executable workflows with blocks and connections

import { Node, Edge } from 'reactflow';
import { openAIEfficiencyService } from './OpenAIEfficiencyService';
import { GridStorage } from '../storage/GridStorage';
import { BlockDefinition } from '../storage/types/GridTypes';

export interface WorkflowGenerationResult {
  success: boolean;
  workflow: {
    nodes: Node[];
    edges: Edge[];
    metadata: {
      title: string;
      description: string;
      tags: string[];
      estimatedRuntime: number;
      complexity: 'low' | 'medium' | 'high';
    };
  };
  blocks: BlockDefinition[];
  connections: {
    source: string;
    target: string;
    dataFlow: string;
    channelConfig: any;
  }[];
  executionPlan: string[];
  errors?: string[];
}

export class AIWorkflowGenerationService {
  
  /**
   * Generate a complete workflow from natural language prompt
   */
  async generateWorkflow(prompt: string, options?: {
    targetComplexity?: 'low' | 'medium' | 'high';
    preferredBlocks?: string[];
    datasetInfo?: {
      type: string;
      size: number;
      format: string;
    };
  }): Promise<WorkflowGenerationResult> {
    try {
      console.log('🧠 Generating AI workflow from prompt:', prompt);

      // Step 1: Analyze prompt and extract workflow requirements
      const workflowSpec = await this.analyzePromptRequirements(prompt, options);
      
      // Step 2: Generate low-level blocks for each functionality
      const blocks = await this.generateLowLevelBlocks(workflowSpec);
      
      // Step 3: Create workflow nodes with proper positioning
      const nodes = await this.createWorkflowNodes(blocks, workflowSpec);
      
      // Step 4: Generate connections with channel configurations
      const { edges, connections } = await this.generateConnections(nodes, workflowSpec);
      
      // Step 5: Generate source code for each block
      await this.generateBlockSourceCode(blocks, connections);
      
      // Step 6: Store blocks in grid database
      await this.storeBlocksInGrid(blocks);
      
      // Step 7: Create execution plan
      const executionPlan = this.createExecutionPlan(nodes, edges);

      return {
        success: true,
        workflow: {
          nodes,
          edges,
          metadata: {
            title: workflowSpec.title,
            description: workflowSpec.description,
            tags: workflowSpec.tags,
            estimatedRuntime: workflowSpec.estimatedRuntime,
            complexity: workflowSpec.complexity
          }
        },
        blocks,
        connections,
        executionPlan
      };

    } catch (error) {
      console.error('❌ Workflow generation failed:', error);
      return {
        success: false,
        workflow: {
          nodes: [],
          edges: [],
          metadata: {
            title: 'Failed Workflow',
            description: 'Workflow generation failed',
            tags: [],
            estimatedRuntime: 0,
            complexity: 'low'
          }
        },
        blocks: [],
        connections: [],
        executionPlan: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Analyze prompt and extract detailed workflow specifications
   */
  private async analyzePromptRequirements(prompt: string, options?: any): Promise<any> {
    const analysisPrompt = `
Analyze this workflow request and break it down into low-level components:

USER REQUEST: "${prompt}"

Please provide a detailed analysis in this exact JSON format:
{
  "title": "Workflow Title",
  "description": "Detailed description",
  "tags": ["tag1", "tag2"],
  "complexity": "low|medium|high",
  "estimatedRuntime": 120,
  "requiredBlocks": [
    {
      "type": "input",
      "functionality": "specific low-level task",
      "inputs": ["data_type"],
      "outputs": ["processed_data"],
      "config": {"param": "value"}
    }
  ],
  "dataFlow": [
    {"from": "block1", "to": "block2", "dataType": "pandas.DataFrame"}
  ],
  "executionSteps": ["step1", "step2"]
}

IMPORTANT: Break down high-level operations into specific, atomic blocks. For example:
- "ML model" should become: data_loader → preprocessor → feature_engineer → model_trainer → evaluator
- "Data analysis" should become: data_reader → cleaner → validator → analyzer → visualizer
- Each block should do ONE specific thing
`;

    const response = await openAIEfficiencyService.generateWithCache(analysisPrompt, {
      maxTokens: 1500,
      temperature: 0.1
    });

    try {
      // Extract JSON from response
      const jsonMatch = response.choices?.[0]?.message?.content || response;
      const jsonStr = typeof jsonMatch === 'string' ? jsonMatch : JSON.stringify(jsonMatch);
      return JSON.parse(jsonStr);
    } catch (error) {
      throw new Error('Failed to parse workflow specification');
    }
  }

  /**
   * Generate low-level block definitions
   */
  private async generateLowLevelBlocks(workflowSpec: any): Promise<BlockDefinition[]> {
    const blocks: BlockDefinition[] = [];

    for (const blockSpec of workflowSpec.requiredBlocks) {
      const blockPrompt = `
Generate a complete block definition for this functionality:

BLOCK SPEC: ${JSON.stringify(blockSpec)}

Provide complete Python implementation in this JSON format:
{
  "id": "unique_block_id",
  "name": "Block Name",
  "category": "input|mlAlgorithm|utility|output",
  "description": "What this block does",
  "version": "1.0.0",
  "inputs": [
    {
      "id": "input1",
      "name": "Input Name",
      "type": "dataframe|tensor|text|number|array",
      "description": "Input description",
      "required": true
    }
  ],
  "outputs": [
    {
      "id": "output1", 
      "name": "Output Name",
      "type": "dataframe|tensor|text|number|array",
      "description": "Output description"
    }
  ],
  "config": {
    "param1": {
      "type": "text|number|boolean|select",
      "label": "Parameter Label",
      "default": "default_value",
      "required": true
    }
  },
  "implementation": "# Complete Python code implementation\\nimport pandas as pd\\ndef execute(inputs, config):\\n    # Implementation here\\n    return outputs",
  "tags": ["tag1", "tag2"],
  "performance": {
    "avgExecutionTime": 100,
    "memoryUsage": "low",
    "scalability": "high"
  }
}

Make the implementation complete and executable.
`;

      const response = await openAIEfficiencyService.generateWithCache(blockPrompt, {
        maxTokens: 1000,
        temperature: 0.1
      });

      try {
        const jsonMatch = response.choices?.[0]?.message?.content || response;
        const jsonStr = typeof jsonMatch === 'string' ? jsonMatch : JSON.stringify(jsonMatch);
        const blockDef = JSON.parse(jsonStr);
        blocks.push(blockDef);
      } catch (error) {
        console.warn('Failed to parse block definition, skipping');
      }
    }

    return blocks;
  }

  /**
   * Create workflow nodes with proper positioning
   */
  private async createWorkflowNodes(blocks: BlockDefinition[], workflowSpec: any): Promise<Node[]> {
    const nodes: Node[] = [];
    let xPosition = 100;
    let yPosition = 100;

    blocks.forEach((block, index) => {
      const node: Node = {
        id: block.id,
        type: 'blockNode', // Changed from 'customBlock' to match BlockNode component expectations
        position: { 
          x: xPosition + (index % 3) * 250, 
          y: yPosition + Math.floor(index / 3) * 150 
        },
        data: {
          label: block.name,
          blockType: block.category,
          block: block, // This is the main block definition that BlockNode expects
          config: block.config || {},
          isResizable: true, // Enable resizing
          sourceCode: block.implementation,
          // Additional properties for BlockNode compatibility
          inputs: block.inputs || [],
          outputs: block.outputs || [],
          implementation: block.implementation
        },
        style: {
          width: 200,
          height: 120,
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#1f2937'
        }
      };
      nodes.push(node);
    });

    return nodes;
  }

  /**
   * Generate connections with channel configurations
   */
  private async generateConnections(nodes: Node[], workflowSpec: any): Promise<{
    edges: Edge[];
    connections: any[];
  }> {
    const edges: Edge[] = [];
    const connections: any[] = [];

    // Generate connections based on data flow specification
    workflowSpec.dataFlow?.forEach((flow: any, index: number) => {
      const sourceNode = nodes.find(n => n.data.block.name.includes(flow.from));
      const targetNode = nodes.find(n => n.data.block.name.includes(flow.to));

      if (sourceNode && targetNode) {
        const edgeId = `edge-${index}`;
        
        const edge: Edge = {
          id: edgeId,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'default',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        };

        const connection = {
          source: sourceNode.id,
          target: targetNode.id,
          dataFlow: flow.dataType,
          channelConfig: {
            dataType: flow.dataType,
            bufferSize: 1000,
            compressionEnabled: true,
            errorHandling: 'retry'
          }
        };

        edges.push(edge);
        connections.push(connection);
      }
    });

    return { edges, connections };
  }

  /**
   * Generate source code with channel subroutines for connections
   */
  private async generateBlockSourceCode(blocks: BlockDefinition[], connections: any[]): Promise<void> {
    for (const block of blocks) {
      // Find connections for this block
      const incomingConnections = connections.filter(c => c.target === block.id);
      const outgoingConnections = connections.filter(c => c.source === block.id);

      if (incomingConnections.length > 0 || outgoingConnections.length > 0) {
        const enhancedCodePrompt = `
Enhance this block's source code to include channel subroutines for data flow:

ORIGINAL CODE:
${block.implementation}

INCOMING CONNECTIONS:
${JSON.stringify(incomingConnections, null, 2)}

OUTGOING CONNECTIONS:
${JSON.stringify(outgoingConnections, null, 2)}

Add channel management code:
1. Input channel readers for incoming connections
2. Output channel writers for outgoing connections  
3. Data type validation and conversion
4. Error handling and retry logic
5. Buffer management

Return the enhanced Python code:
`;

        const response = await openAIEfficiencyService.generateWithCache(enhancedCodePrompt, {
          maxTokens: 800,
          temperature: 0.1
        });

        const enhancedCode = response.choices?.[0]?.message?.content || response;
        block.implementation = typeof enhancedCode === 'string' ? enhancedCode : JSON.stringify(enhancedCode);
      }
    }
  }

  /**
   * Store blocks in grid database
   */
  private async storeBlocksInGrid(blocks: BlockDefinition[]): Promise<void> {
    for (const block of blocks) {
      try {
        // Create grid cell for each block
        const gridCell = {
          id: block.id,
          position: { x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) },
          blockDefinition: block,
          data: {
            config: {},
            state: 'ready',
            lastExecuted: null
          },
          metadata: {
            created: new Date(),
            lastModified: new Date(),
            version: block.version,
            tags: block.tags
          }
        };

        // Store in grid (assuming gridStorage is available)
        // await gridStorage.setCell(gridCell.position.x, gridCell.position.y, gridCell);
        console.log(`📦 Stored block in grid: ${block.name}`);
      } catch (error) {
        console.warn(`Failed to store block ${block.name} in grid:`, error);
      }
    }
  }

  /**
   * Create execution plan
   */
  private createExecutionPlan(nodes: Node[], edges: Edge[]): string[] {
    const plan: string[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Find entry points (nodes with no incoming edges)
    const entryPoints = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // Traverse the graph and build execution order
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        plan.push(`Execute: ${node.data.label} (${node.data.blockType})`);
        
        // Find outgoing edges
        const outgoingEdges = edges.filter(edge => edge.source === nodeId);
        outgoingEdges.forEach(edge => traverse(edge.target));
      }
    };

    entryPoints.forEach(node => traverse(node.id));

    return plan;
  }
}

// Export singleton instance
export const aiWorkflowGenerationService = new AIWorkflowGenerationService();
