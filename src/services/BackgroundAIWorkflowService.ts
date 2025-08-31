import { openaiWorkflowIntelligence } from './OpenAIWorkflowIntelligence';
import { GridStorage } from '../storage/GridStorage';
import { BlockDefinition } from '../storage/types/GridTypes';
import { Node, Edge } from 'reactflow';

export interface BackgroundWorkflowResult {
  success: boolean;
  workflowId?: string;
  nodes?: Node[];
  edges?: Edge[];
  error?: string;
  generationSteps?: string[];
}

export class BackgroundAIWorkflowService {
  private static instance: BackgroundAIWorkflowService;
  private storage: GridStorage | null = null;
  private isGenerating: boolean = false;
  private currentProgress: string = '';

  private constructor() {
    // Storage will be initialized when needed
  }

  public static getInstance(): BackgroundAIWorkflowService {
    if (!BackgroundAIWorkflowService.instance) {
      BackgroundAIWorkflowService.instance = new BackgroundAIWorkflowService();
    }
    return BackgroundAIWorkflowService.instance;
  }

  /**
   * Generate workflow in background from homepage prompt
   */
  public async generateWorkflowFromPrompt(
    prompt: string,
    progressCallback?: (step: string) => void
  ): Promise<BackgroundWorkflowResult> {
    if (this.isGenerating) {
      return {
        success: false,
        error: 'Another workflow generation is already in progress'
      };
    }

    this.isGenerating = true;
    const generationSteps: string[] = [];

    try {
      // Step 1: Analyze prompt
      this.updateProgress('🧠 Analyzing prompt requirements...', progressCallback, generationSteps);
      
      // Step 2: Generate workflow structure
      this.updateProgress('🔧 Designing workflow architecture...', progressCallback, generationSteps);
      
      const workflowStructure = await openaiWorkflowIntelligence.generateWorkflowStructure(prompt, []);

      if (!workflowStructure || !workflowStructure.blocks) {
        throw new Error('Failed to generate workflow structure');
      }

      // Step 3: Create blocks
      this.updateProgress('🧱 Creating AI-optimized blocks...', progressCallback, generationSteps);
      
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      const blockPositions = this.calculateOptimalBlockPositions(workflowStructure.blocks);

      // Create nodes from generated blocks
      for (let i = 0; i < workflowStructure.blocks.length; i++) {
        const block = workflowStructure.blocks[i];
        const position = blockPositions[i];
        
        const node: Node = {
          id: block.id,
          type: 'blockNode',
          position,
          data: {
            label: block.name,
            description: block.purpose,
            category: block.type || 'ai-generated',
            inputs: block.inputs || [],
            outputs: block.outputs || [],
            implementation: '',
            version: '1.0.0',
            isAIGenerated: true,
            sourcePrompt: prompt
          }
        };
        
        nodes.push(node);
      }

      // Step 4: Create connections
      this.updateProgress('🔗 Establishing intelligent connections...', progressCallback, generationSteps);
      
      if (workflowStructure.connections) {
        for (const connection of workflowStructure.connections) {
          const edge: Edge = {
            id: `edge-${connection.from}-${connection.to}`,
            source: connection.from,
            target: connection.to,
            sourceHandle: connection.fromPort || 'output',
            targetHandle: connection.toPort || 'input',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          };
          edges.push(edge);
        }
      }

      // Step 5: Store workflow (simplified for now)
      this.updateProgress('💾 Preparing workflow data...', progressCallback, generationSteps);
      
      const workflowId = `workflow-${Date.now()}`;

      // Step 6: Complete
      this.updateProgress('✅ Workflow generated successfully!', progressCallback, generationSteps);

      this.isGenerating = false;
      
      return {
        success: true,
        workflowId,
        nodes,
        edges,
        generationSteps
      };

    } catch (error) {
      this.isGenerating = false;
      console.error('❌ Background workflow generation failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        generationSteps
      };
    }
  }

  /**
   * Generate workflow from demo prompt with predefined templates
   */
  public async generateFromDemoPrompt(
    demoPrompt: string,
    progressCallback?: (step: string) => void
  ): Promise<BackgroundWorkflowResult> {
    // Demo prompts are optimized for faster generation
    this.updateProgress('🚀 Fast-tracking demo workflow...', progressCallback);
    
    // Use cached templates for common demo patterns
    const template = this.getDemoTemplate(demoPrompt);
    
    if (template) {
      this.updateProgress('📋 Using optimized demo template...', progressCallback);
      return this.generateFromTemplate(template, demoPrompt, progressCallback);
    }
    
    // Fallback to regular generation
    return this.generateWorkflowFromPrompt(demoPrompt, progressCallback);
  }

  /**
   * Check if background generation is in progress
   */
  public isGenerationInProgress(): boolean {
    return this.isGenerating;
  }

  /**
   * Get current generation progress
   */
  public getCurrentProgress(): string {
    return this.currentProgress;
  }

  private updateProgress(
    step: string, 
    callback?: (step: string) => void, 
    steps?: string[]
  ): void {
    this.currentProgress = step;
    if (steps) steps.push(step);
    if (callback) callback(step);
    console.log(`🔄 ${step}`);
  }

  private calculateOptimalBlockPositions(blocks: any[]): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    const cols = Math.ceil(Math.sqrt(blocks.length));
    const spacing = { x: 300, y: 200 };
    
    for (let i = 0; i < blocks.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      positions.push({
        x: col * spacing.x + 100,
        y: row * spacing.y + 100
      });
    }
    
    return positions;
  }

  private getDemoTemplate(prompt: string): any | null {
    const lowerPrompt = prompt.toLowerCase();
    
    // Image processing demo
    if (lowerPrompt.includes('image') || lowerPrompt.includes('vision')) {
      return {
        type: 'image-processing',
        blocks: ['image-input', 'vision-analyzer', 'result-display'],
        connections: [
          { from: 'image-input', to: 'vision-analyzer' },
          { from: 'vision-analyzer', to: 'result-display' }
        ]
      };
    }
    
    // Text processing demo
    if (lowerPrompt.includes('text') || lowerPrompt.includes('nlp')) {
      return {
        type: 'text-processing',
        blocks: ['text-input', 'nlp-processor', 'sentiment-analyzer', 'output'],
        connections: [
          { from: 'text-input', to: 'nlp-processor' },
          { from: 'nlp-processor', to: 'sentiment-analyzer' },
          { from: 'sentiment-analyzer', to: 'output' }
        ]
      };
    }
    
    // Data analysis demo
    if (lowerPrompt.includes('data') || lowerPrompt.includes('analysis')) {
      return {
        type: 'data-analysis',
        blocks: ['data-loader', 'preprocessor', 'analyzer', 'visualizer'],
        connections: [
          { from: 'data-loader', to: 'preprocessor' },
          { from: 'preprocessor', to: 'analyzer' },
          { from: 'analyzer', to: 'visualizer' }
        ]
      };
    }
    
    return null;
  }

  private async generateFromTemplate(
    template: any, 
    prompt: string, 
    progressCallback?: (step: string) => void
  ): Promise<BackgroundWorkflowResult> {
    const generationSteps: string[] = [];
    
    try {
      this.updateProgress('📋 Loading optimized template...', progressCallback, generationSteps);
      
      // Create nodes from template
      const nodes: Node[] = template.blocks.map((blockId: string, index: number) => ({
        id: blockId,
        type: 'blockNode',
        position: { x: index * 250 + 100, y: 200 },
        data: {
          label: blockId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `Demo block for ${blockId}`,
          category: 'demo',
          isAIGenerated: true,
          sourcePrompt: prompt
        }
      }));
      
      // Create edges from template
      const edges: Edge[] = template.connections.map((conn: any, index: number) => ({
        id: `edge-${index}`,
        source: conn.from,
        target: conn.to,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }));
      
      this.updateProgress('✅ Demo workflow ready!', progressCallback, generationSteps);
      
      return {
        success: true,
        workflowId: `demo-${Date.now()}`,
        nodes,
        edges,
        generationSteps
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template generation failed',
        generationSteps
      };
    }
  }
}

export const backgroundAIWorkflowService = BackgroundAIWorkflowService.getInstance();
