// @ts-nocheck
/**
 * OpenAI Workflow Intelligence Service
 * Comprehensive AI service for µLM workflow generation, block creation, and optimization
 */

import { BlockDefinition, BlockCategory } from '../storage/types/GridTypes';
import { Node, Edge } from 'reactflow';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface WorkflowStructure {
  workflow: {
    name: string;
    description: string;
    complexity: 'simple' | 'medium' | 'complex';
    architecture: 'linear' | 'parallel' | 'branched' | 'hybrid';
    estimatedTime: number;
    requiredResources: string[];
  };
  blocks: Array<{
    id: string;
    name: string;
    type: BlockCategory;
    purpose: string;
    inputs: Array<{ name: string; type: string; description: string }>;
    outputs: Array<{ name: string; type: string; description: string }>;
    position: { x: number; y: number };
    dependencies: string[];
    configuration: Record<string, any>;
  }>;
  connections: Array<{
    from: string;
    to: string;
    fromPort: string;
    toPort: string;
    dataType: string;
    reasoning: string;
  }>;
  optimizations: string[];
  testingStrategy: string[];
}

interface BlockGenerationRequest {
  prompt: string;
  context: {
    existingBlocks: BlockDefinition[];
    workflowPurpose: string;
    expectedInputs: string[];
    expectedOutputs: string[];
    performanceRequirements: string[];
  };
}

interface GeneratedBlock {
  block: BlockDefinition;
  implementation: {
    pythonCode: string;
    imports: string[];
    dependencies: string[];
    configuration: Record<string, any>;
  };
  documentation: {
    description: string;
    usage: string;
    examples: string[];
  };
  testing: {
    unitTests: string;
    integrationTests: string;
    sampleData: any;
  };
}

export class OpenAIWorkflowIntelligence {
  private config: OpenAIConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000,
      temperature: 0.7
    };

    if (!this.config.apiKey) {
      console.warn('⚠️ OpenAI API key not found. AI features will be limited.');
    }
  }

  /**
   * Main workflow generation from natural language prompt
   */
  async generateWorkflowStructure(prompt: string, existingBlocks: BlockDefinition[] = []): Promise<WorkflowStructure> {
    const systemPrompt = `You are an expert AI workflow architect for µLM (Micro Language Models). Your job is to analyze user prompts and generate comprehensive workflow structures.

AVAILABLE BLOCK TYPES:
- input: Data loading, file reading, API connections
- expert: AI/ML models, transformers, neural networks, classifiers
- utility: Data processing, filtering, transformation, validation
- output: Visualization, saving, API responses, notifications

EXISTING BLOCKS IN LIBRARY:
${existingBlocks.map(block => `- ${block.name}: ${block.description}`).join('\n')}

Generate a complete workflow structure as JSON with this exact format:
{
  "workflow": {
    "name": "descriptive workflow name",
    "description": "what this workflow accomplishes",
    "complexity": "simple|medium|complex",
    "architecture": "linear|parallel|branched|hybrid", 
    "estimatedTime": number_in_seconds,
    "requiredResources": ["list", "of", "requirements"]
  },
  "blocks": [
    {
      "id": "unique_block_id",
      "name": "Block Display Name", 
      "type": "input|expert|utility|output",
      "purpose": "what this block does",
      "inputs": [{"name": "input_name", "type": "data_type", "description": "purpose"}],
      "outputs": [{"name": "output_name", "type": "data_type", "description": "purpose"}],
      "position": {"x": number, "y": number},
      "dependencies": ["required", "python", "packages"],
      "configuration": {"key": "value"}
    }
  ],
  "connections": [
    {
      "from": "source_block_id",
      "to": "target_block_id", 
      "fromPort": "output_name",
      "toPort": "input_name",
      "dataType": "data_type",
      "reasoning": "why this connection makes sense"
    }
  ],
  "optimizations": ["list", "of", "optimization", "suggestions"],
  "testingStrategy": ["testing", "approaches", "for", "validation"]
}

Requirements:
- Use existing blocks when possible, create new ones only when needed
- Ensure logical data flow between blocks
- Position blocks for optimal visual layout (x: 0-900, y: 0-600)
- Include proper error handling and validation
- Provide realistic performance estimates`;

    const userPrompt = `Generate a complete workflow structure for: "${prompt}"

Consider:
- What data inputs are needed
- What processing steps are required  
- What AI/ML capabilities are needed
- How data flows between components
- What outputs should be generated
- Performance and scalability requirements

Respond with ONLY the JSON structure, no additional text.`;

    try {
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const workflowStructure = JSON.parse(response);
      
      // Validate and enhance the structure
      this.validateWorkflowStructure(workflowStructure);
      
      console.log('✅ Generated workflow structure:', workflowStructure.workflow.name);
      return workflowStructure;

    } catch (error) {
      console.error('❌ Failed to generate workflow structure:', error);
      throw error;
    }
  }

  /**
   * Generate a custom AI block from requirements
   */
  async generateCustomBlock(request: BlockGenerationRequest): Promise<GeneratedBlock> {
    const systemPrompt = `You are an expert Python developer specializing in AI/ML block creation for µLM workflows. Generate complete, production-ready blocks.

BLOCK REQUIREMENTS:
- Must be self-contained and reusable
- Include proper error handling and logging
- Use standard Python libraries and ML frameworks
- Follow clean code principles
- Include comprehensive documentation

Generate a complete block definition as JSON:
{
  "block": {
    "id": "unique_block_id",
    "name": "Block Display Name",
    "description": "detailed description",
    "category": "input|expert|utility|output",
    "version": "1.0.0",
    "inputs": [{"id": "id", "name": "display", "type": "type", "description": "purpose", "required": true}],
    "outputs": [{"id": "id", "name": "display", "type": "type", "description": "purpose", "required": true}],
    "tags": ["relevant", "tags"],
    "performance": {"avgExecutionTime": ms, "memoryUsage": "low|medium|high"},
    "errorHandling": {"retryable": true, "timeout": ms},
    "config": {"param": {"type": "text|number|select", "label": "Label", "default": "value"}},
    "metadata": {
      "author": "AI Generated",
      "documentation": "detailed docs",
      "dependencies": ["package1", "package2"],
      "isGenerated": true,
      "tags": ["tags"],
      "category": "category"
    }
  },
  "implementation": {
    "pythonCode": "complete Python class implementation",
    "imports": ["import statements"],
    "dependencies": ["pip packages"],
    "configuration": {"runtime": "config"}
  },
  "documentation": {
    "description": "detailed description",
    "usage": "how to use this block",
    "examples": ["example1", "example2"]
  },
  "testing": {
    "unitTests": "Python unittest code",
    "integrationTests": "integration test code", 
    "sampleData": "test data"
  }
}`;

    const userPrompt = `Generate a custom block for: "${request.prompt}"

Context:
- Workflow Purpose: ${request.context.workflowPurpose}
- Expected Inputs: ${request.context.expectedInputs.join(', ')}
- Expected Outputs: ${request.context.expectedOutputs.join(', ')}
- Performance Requirements: ${request.context.performanceRequirements.join(', ')}

Existing blocks in workflow:
${request.context.existingBlocks.map(b => `- ${b.name}: ${b.description}`).join('\n')}

Create a block that integrates seamlessly with existing blocks and fulfills the specific requirements.

Respond with ONLY the JSON structure, no additional text.`;

    try {
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const generatedBlock = JSON.parse(response);
      
      // Validate the generated block
      this.validateGeneratedBlock(generatedBlock);
      
      console.log('✅ Generated custom block:', generatedBlock.block.name);
      return generatedBlock;

    } catch (error) {
      console.error('❌ Failed to generate custom block:', error);
      throw error;
    }
  }

  /**
   * Analyze existing workflow and suggest optimizations with detailed code validation
   */
  async analyzeWorkflow(nodes: Node[], edges: Edge[]): Promise<{
    analysis: string;
    optimizations: string[];
    potentialIssues: string[];
    performanceImprovements: string[];
    codeQuality: number;
    codeErrors: Array<{
      nodeId: string;
      blockName: string;
      errorType: 'syntax' | 'logic' | 'compatibility' | 'performance';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      suggestion: string;
    }>;
  }> {
    const workflowDescription = this.describeWorkflow(nodes, edges);
    
    // Extract and validate all code blocks
    const codeBlocks = nodes.map(node => ({
      id: node.id,
      name: node.data?.label || 'Unknown',
      implementation: node.data?.block?.implementation || '',
      config: node.data?.block?.config || {},
      inputs: node.data?.block?.inputs || [],
      outputs: node.data?.block?.outputs || []
    }));
    
    const systemPrompt = `You are an expert code analyst and AI workflow auditor. Analyze workflow structures for performance, reliability, code quality, and potential errors.

CRITICAL: You must thoroughly examine ALL code implementations and identify REAL errors, syntax issues, logic problems, and compatibility issues. Do not provide false positives.

For each code block, check for:
1. Python syntax errors (indentation, missing imports, undefined variables)
2. Logic errors (incorrect algorithms, wrong data flow)
3. Compatibility issues (mismatched data types, wrong function signatures)
4. Performance problems (inefficient algorithms, memory leaks)
5. Missing error handling
6. Security vulnerabilities

Provide analysis in this JSON format:
{
  "analysis": "comprehensive workflow analysis with specific details about found issues",
  "optimizations": ["specific optimization suggestions with code examples"],
  "potentialIssues": ["actual problems found in the code with line references"],
  "performanceImprovements": ["concrete performance enhancement suggestions"],
  "codeQuality": score_0_to_100_based_on_actual_code_quality,
  "codeErrors": [
    {
      "nodeId": "node_id",
      "blockName": "block_name",
      "errorType": "syntax|logic|compatibility|performance",
      "severity": "low|medium|high|critical",
      "message": "specific error description",
      "suggestion": "how to fix this error"
    }
  ]
}`;

    const codeAnalysisPrompt = `Analyze this AI workflow with ${nodes.length} nodes and ${edges.length} connections:

WORKFLOW DESCRIPTION:
${workflowDescription}

CODE IMPLEMENTATIONS TO ANALYZE:
${codeBlocks.map((block, i) => `
=== BLOCK ${i + 1}: ${block.name} (ID: ${block.id}) ===
INPUTS: ${JSON.stringify(block.inputs)}
OUTPUTS: ${JSON.stringify(block.outputs)}
CONFIG: ${JSON.stringify(block.config)}

IMPLEMENTATION CODE:
${block.implementation}

`).join('\n')}

CONNECTIONS:
${edges.map(edge => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  return `${sourceNode?.data?.label || edge.source} → ${targetNode?.data?.label || edge.target}`;
}).join('\n')}

Perform thorough code analysis focusing on:
1. Actual syntax errors in Python code
2. Import statement issues
3. Variable definition problems
4. Function signature mismatches
5. Data type compatibility between connected blocks
6. Error handling completeness
7. Performance bottlenecks
8. Security vulnerabilities

Be extremely thorough and accurate. Only report REAL issues that exist in the code.

Respond with ONLY the JSON analysis, no additional text.`;

    try {
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: codeAnalysisPrompt }
      ]);

      const analysis = JSON.parse(response);
      
      // Log detailed analysis to terminal/console
      console.log('\n' + '='.repeat(80));
      console.log('🔍 DETAILED WORKFLOW ANALYSIS REPORT');
      console.log('='.repeat(80));
      console.log(`📊 Overall Code Quality Score: ${analysis.codeQuality}/100`);
      console.log(`🏗️  Workflow Complexity: ${nodes.length} blocks, ${edges.length} connections`);
      console.log('\n📝 ANALYSIS:');
      console.log(analysis.analysis);
      
      if (analysis.codeErrors && analysis.codeErrors.length > 0) {
        console.log('\n🚨 CODE ERRORS FOUND:');
        analysis.codeErrors.forEach((error, i) => {
          const severityIcon = {
            low: '🟡',
            medium: '🟠', 
            high: '🔴',
            critical: '🆘'
          }[error.severity];
          
          console.log(`\n${i + 1}. ${severityIcon} ${error.severity.toUpperCase()} ${error.errorType.toUpperCase()} ERROR`);
          console.log(`   Block: ${error.blockName} (${error.nodeId})`);
          console.log(`   Issue: ${error.message}`);
          console.log(`   Fix: ${error.suggestion}`);
        });
      } else {
        console.log('\n✅ NO CODE ERRORS DETECTED');
      }
      
      if (analysis.potentialIssues && analysis.potentialIssues.length > 0) {
        console.log('\n⚠️  POTENTIAL ISSUES:');
        analysis.potentialIssues.forEach((issue, i) => {
          console.log(`   ${i + 1}. ${issue}`);
        });
      }
      
      if (analysis.optimizations && analysis.optimizations.length > 0) {
        console.log('\n💡 OPTIMIZATION SUGGESTIONS:');
        analysis.optimizations.forEach((opt, i) => {
          console.log(`   ${i + 1}. ${opt}`);
        });
      }
      
      if (analysis.performanceImprovements && analysis.performanceImprovements.length > 0) {
        console.log('\n🚀 PERFORMANCE IMPROVEMENTS:');
        analysis.performanceImprovements.forEach((perf, i) => {
          console.log(`   ${i + 1}. ${perf}`);
        });
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('📊 ANALYSIS COMPLETE');
      console.log('='.repeat(80) + '\n');
      
      return analysis;

    } catch (error) {
      console.error('❌ Workflow analysis failed:', error);
      
      // Fallback basic analysis
      const basicAnalysis = {
        analysis: 'Analysis failed due to AI service error. Performing basic validation.',
        optimizations: ['Review code implementations manually', 'Check for syntax errors'],
        potentialIssues: ['AI analysis unavailable - manual review required'],
        performanceImprovements: ['Optimize data flow between blocks'],
        codeQuality: 50,
        codeErrors: []
      };
      
      // Basic syntax check
      codeBlocks.forEach(block => {
        if (block.implementation) {
          // Basic Python syntax validation
          if (!block.implementation.includes('def ') && !block.implementation.includes('class ')) {
            basicAnalysis.codeErrors.push({
              nodeId: block.id,
              blockName: block.name,
              errorType: 'syntax',
              severity: 'medium',
              message: 'Implementation appears to be missing function or class definition',
              suggestion: 'Add proper function or class structure to the implementation'
            });
          }
          
          if (block.implementation.includes('import ') && !block.implementation.trim().startsWith('import') && !block.implementation.includes('\nimport')) {
            basicAnalysis.codeErrors.push({
              nodeId: block.id,
              blockName: block.name,
              errorType: 'syntax',
              severity: 'low',
              message: 'Import statements should be at the top of the code',
              suggestion: 'Move import statements to the beginning of the implementation'
            });
          }
        }
      });
      
      return basicAnalysis;
    }
  }

  /**
   * Generate intelligent block suggestions based on current workflow state
   */
  async suggestNextBlocks(currentWorkflow: { nodes: Node[], edges: Edge[] }, userIntent?: string): Promise<{
    suggestions: Array<{
      blockType: BlockCategory;
      name: string;
      reasoning: string;
      priority: number;
      estimatedImpact: string;
    }>;
    reasoning: string;
  }> {
    const workflowDescription = this.describeWorkflow(currentWorkflow.nodes, currentWorkflow.edges);
    
    const systemPrompt = `You are an AI workflow completion assistant. Suggest the most logical next blocks for incomplete workflows.

Respond with JSON:
{
  "suggestions": [
    {
      "blockType": "input|expert|utility|output",
      "name": "suggested block name",
      "reasoning": "why this block is needed",
      "priority": 1-10,
      "estimatedImpact": "high|medium|low"
    }
  ],
  "reasoning": "overall analysis of what the workflow needs"
}`;

    const userPrompt = `Current workflow state:
${workflowDescription}

${userIntent ? `User Intent: ${userIntent}` : ''}

Suggest the most logical next blocks to complete or improve this workflow. Consider:
- Missing data inputs or outputs
- Gaps in processing pipeline
- Error handling needs
- Monitoring and logging requirements
- Optimization opportunities

Respond with ONLY the JSON suggestions, no additional text.`;

    try {
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      return JSON.parse(response);

    } catch (error) {
      console.error('❌ Failed to generate block suggestions:', error);
      return {
        suggestions: [],
        reasoning: 'AI suggestions unavailable'
      };
    }
  }

  /**
   * Core OpenAI API call with proper error handling and rate limiting
   */
  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody = {
      model: this.config.model,
      messages: messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'text' }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Track conversation for context
    this.conversationHistory.push(...messages);
    this.conversationHistory.push({
      role: 'assistant',
      content: data.choices[0].message.content
    });

    // Keep conversation history manageable
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return data.choices[0].message.content;
  }

  /**
   * Helper methods
   */
  private validateWorkflowStructure(structure: WorkflowStructure): void {
    if (!structure.workflow || !structure.blocks || !structure.connections) {
      throw new Error('Invalid workflow structure');
    }
    
    // Ensure all blocks have valid positions
    structure.blocks.forEach(block => {
      if (!block.position || typeof block.position.x !== 'number' || typeof block.position.y !== 'number') {
        block.position = { x: Math.random() * 800, y: Math.random() * 400 };
      }
    });
  }

  private validateGeneratedBlock(generated: GeneratedBlock): void {
    if (!generated.block || !generated.implementation || !generated.documentation) {
      throw new Error('Invalid generated block structure');
    }
    
    // Ensure required fields exist
    if (!generated.block.id || !generated.block.name || !generated.implementation.pythonCode) {
      throw new Error('Generated block missing required fields');
    }
  }

  private describeWorkflow(nodes: Node[], edges: Edge[]): string {
    let description = `Workflow with ${nodes.length} blocks and ${edges.length} connections:\n\n`;
    
    // Describe nodes
    description += 'BLOCKS:\n';
    nodes.forEach(node => {
      description += `- ${node.data?.label || node.id}: ${node.data?.block?.description || 'Custom block'}\n`;
    });
    
    // Describe connections
    if (edges.length > 0) {
      description += '\nCONNECTIONS:\n';
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        description += `- ${sourceNode?.data?.label || edge.source} → ${targetNode?.data?.label || edge.target}\n`;
      });
    }
    
    return description;
  }

  /**
   * Get service status and usage statistics
   */
  getServiceStatus(): {
    configured: boolean;
    conversationLength: number;
    model: string;
    lastActivity: Date | null;
  } {
    return {
      configured: !!this.config.apiKey,
      conversationLength: this.conversationHistory.length,
      model: this.config.model,
      lastActivity: this.conversationHistory.length > 0 ? new Date() : null
    };
  }

  /**
   * Reset conversation context
   */
  resetContext(): void {
    this.conversationHistory = [];
    console.log('🧹 OpenAI conversation context reset');
  }
}

// Export singleton instance
export const openaiWorkflowIntelligence = new OpenAIWorkflowIntelligence();
