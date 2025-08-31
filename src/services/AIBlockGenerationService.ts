// @ts-nocheck
/**
 * AI Block Generation Service
 * Intelligent service for generating custom µLM blocks from natural language
 */

import { BlockDefinition, BlockCategory, Port, ConfigParameter } from '../storage/types/GridTypes';

export interface BlockGenerationRequest {
  prompt: string;
  existingBlocks?: BlockDefinition[];
  workflowContext?: {
    workflowName?: string;
    totalBlocks?: number;
    connections?: number;
    prompt?: string;
  };
  preferences?: {
    category?: BlockCategory;
    complexity?: 'simple' | 'intermediate' | 'advanced';
    performance?: 'speed' | 'accuracy' | 'balanced';
  };
}

export interface BlockGenerationResult {
  block: BlockDefinition;
  confidence: number;
  alternatives: BlockDefinition[];
  implementation: {
    pythonCode: string;
    dependencies: string[];
    imports: string[];
  };
  optimization: {
    suggestions: string[];
    performanceHints: string[];
    compatibilityNotes: string[];
  };
  documentation: {
    readme: string;
    examples: string[];
    apiReference: string;
  };
  validation: {
    syntaxValid: boolean;
    compatibilityScore: number;
    performanceEstimate: {
      executionTime: number;
      memoryUsage: 'low' | 'medium' | 'high';
      cpuIntensive: boolean;
    };
  };
}

export class AIBlockGenerationService {
  private static instance: AIBlockGenerationService;
  
  private nlpPatterns = {
    categories: {
      input: ['load', 'read', 'input', 'upload', 'import', 'fetch', 'get'],
      mlAlgorithm: ['classify', 'predict', 'cluster', 'regression', 'algorithm', 'model', 'train'],
      neuralNetwork: ['neural', 'network', 'deep', 'cnn', 'rnn', 'lstm', 'transformer'],
      expert: ['expert', 'pretrained', 'huggingface', 'bert', 'gpt', 'llama'],
      utility: ['transform', 'filter', 'clean', 'process', 'validate', 'convert'],
      output: ['save', 'export', 'output', 'write', 'display', 'visualize', 'plot']
    },
    dataTypes: {
      text: ['text', 'string', 'document', 'sentence', 'word'],
      number: ['number', 'numeric', 'float', 'integer', 'value'],
      array: ['list', 'array', 'collection', 'sequence'],
      dataframe: ['dataframe', 'table', 'csv', 'dataset', 'data'],
      image: ['image', 'picture', 'photo', 'pixel', 'visual'],
      audio: ['audio', 'sound', 'speech', 'voice', 'music']
    },
    operations: {
      filter: ['filter', 'select', 'choose', 'pick', 'exclude'],
      transform: ['transform', 'convert', 'change', 'modify', 'alter'],
      analyze: ['analyze', 'examine', 'study', 'investigate', 'evaluate'],
      generate: ['generate', 'create', 'produce', 'make', 'build']
    }
  };

  public static getInstance(): AIBlockGenerationService {
    if (!AIBlockGenerationService.instance) {
      AIBlockGenerationService.instance = new AIBlockGenerationService();
    }
    return AIBlockGenerationService.instance;
  }

  public async generateBlock(request: BlockGenerationRequest): Promise<BlockGenerationResult> {
    try {
      // Step 1: Analyze the prompt
      const analysis = this.analyzePrompt(request.prompt);
      
      // Step 2: Detect context from existing blocks
      const context = this.analyzeWorkflowContext(request.existingBlocks || [], request.workflowContext);
      
      // Step 3: Generate base block definition
      const baseBlock = this.generateBaseBlock(analysis, context, request.preferences);
      
      // Step 4: Generate implementation code
      const implementation = this.generateImplementation(baseBlock, analysis);
      
      // Step 5: Create alternatives
      const alternatives = this.generateAlternatives(baseBlock, analysis);
      
      // Step 6: Generate optimization suggestions
      const optimization = this.generateOptimizationSuggestions(baseBlock, context);
      
      // Step 7: Create documentation
      const documentation = this.generateDocumentation(baseBlock, implementation, request.prompt);
      
      // Step 8: Validate the generated block
      const validation = this.validateBlock(baseBlock, implementation);
      
      return {
        block: baseBlock,
        confidence: analysis.confidence,
        alternatives,
        implementation,
        optimization,
        documentation,
        validation
      };
      
    } catch (error) {
      console.error('Block generation failed:', error);
      throw new Error(`Failed to generate block: ${error}`);
    }
  }

  private analyzePrompt(prompt: string): {
    category: BlockCategory;
    confidence: number;
    intent: string;
    dataTypes: string[];
    operations: string[];
    complexity: 'simple' | 'intermediate' | 'advanced';
  } {
    const text = prompt.toLowerCase();
    const words = text.split(/\s+/);
    
    // Detect category
    let categoryScores: Record<BlockCategory, number> = {
      input: 0,
      mlAlgorithm: 0,
      neuralNetwork: 0,
      expert: 0,
      utility: 0,
      output: 0,
      custom: 0
    };
    
    // Score each category based on keyword matches
    Object.entries(this.nlpPatterns.categories).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          categoryScores[category as BlockCategory] += 1;
        }
      });
    });
    
    const category = Object.entries(categoryScores)
      .reduce((a, b) => categoryScores[a[0] as BlockCategory] > categoryScores[b[0] as BlockCategory] ? a : b)[0] as BlockCategory;
    
    // Detect data types
    const dataTypes: string[] = [];
    Object.entries(this.nlpPatterns.dataTypes).forEach(([type, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        dataTypes.push(type);
      }
    });
    
    // Detect operations
    const operations: string[] = [];
    Object.entries(this.nlpPatterns.operations).forEach(([operation, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        operations.push(operation);
      }
    });
    
    // Estimate complexity
    let complexity: 'simple' | 'intermediate' | 'advanced' = 'simple';
    if (text.includes('advanced') || text.includes('complex') || text.includes('neural') || text.includes('deep')) {
      complexity = 'advanced';
    } else if (text.includes('model') || text.includes('algorithm') || text.includes('train')) {
      complexity = 'intermediate';
    }
    
    const confidence = Math.max(...Object.values(categoryScores)) / words.length;
    
    return {
      category,
      confidence: Math.min(confidence * 10, 1), // Normalize to 0-1
      intent: this.extractIntent(prompt),
      dataTypes,
      operations,
      complexity
    };
  }

  private extractIntent(prompt: string): string {
    const sentences = prompt.split(/[.!?]+/);
    return sentences[0]?.trim() || prompt;
  }

  private analyzeWorkflowContext(existingBlocks: BlockDefinition[], context?: any): {
    suggestedConnections: string[];
    compatibleBlocks: string[];
    dataFlow: string[];
  } {
    const blockTypes = existingBlocks.map(block => block.category);
    const suggestedConnections: string[] = [];
    const compatibleBlocks: string[] = [];
    const dataFlow: string[] = [];
    
    // Analyze existing block patterns
    if (blockTypes.includes('input') && !blockTypes.includes('output')) {
      suggestedConnections.push('Consider adding an output block to complete the workflow');
    }
    
    if (blockTypes.includes('mlAlgorithm') && !blockTypes.includes('utility')) {
      suggestedConnections.push('Add data preprocessing utilities before ML algorithms');
    }
    
    // Find compatible blocks
    existingBlocks.forEach(block => {
      if (block.outputs.some(output => ['dataframe', 'array', 'text'].includes(output.type))) {
        compatibleBlocks.push(block.name);
      }
    });
    
    return { suggestedConnections, compatibleBlocks, dataFlow };
  }

  private generateBaseBlock(
    analysis: any,
    context: any,
    preferences?: any
  ): BlockDefinition {
    const blockId = `ai_generated_${Date.now()}`;
    const blockName = this.generateBlockName(analysis);
    
    // Generate input/output ports based on analysis
    const inputs = this.generatePorts(analysis.dataTypes, 'input');
    const outputs = this.generatePorts(analysis.dataTypes, 'output');
    
    // Generate configuration parameters
    const config = this.generateConfiguration(analysis);
    
    return {
      id: blockId,
      name: blockName,
      category: analysis.category,
      description: `AI-generated ${analysis.category} block for: ${analysis.intent}`,
      version: '1.0.0',
      inputs,
      outputs,
      config,
      implementation: 'AIGeneratedProcessor',
      tags: ['ai-generated', 'custom', analysis.category, ...analysis.operations],
      performance: {
        avgExecutionTime: this.estimateExecutionTime(analysis.complexity),
        memoryUsage: this.estimateMemoryUsage(analysis.complexity)
      },
      errorHandling: {
        retryable: true,
        timeout: 30000
      }
    };
  }

  private generateBlockName(analysis: any): string {
    const { category, operations, intent } = analysis;
    
    if (operations.length > 0) {
      const primaryOperation = operations[0];
      return `${primaryOperation.charAt(0).toUpperCase() + primaryOperation.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }
    
    // Extract key words from intent
    const words = intent.split(' ').filter(word => word.length > 3);
    if (words.length > 0) {
      return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} Block`;
    }
    
    return `Custom ${category.charAt(0).toUpperCase() + category.slice(1)} Block`;
  }

  private generatePorts(dataTypes: string[], direction: 'input' | 'output'): Port[] {
    const basePorts: Port[] = [
      {
        id: direction === 'input' ? 'data' : 'result',
        name: direction === 'input' ? 'Data' : 'Result',
        type: 'any',
        description: direction === 'input' ? 'Input data' : 'Processed result'
      }
    ];
    
    // Add specific ports based on detected data types
    dataTypes.forEach(dataType => {
      if (dataType !== 'any') {
        basePorts.push({
          id: `${dataType}_${direction}`,
          name: dataType.charAt(0).toUpperCase() + dataType.slice(1),
          type: dataType as Port['type'],
          description: `${direction === 'input' ? 'Input' : 'Output'} ${dataType} data`
        });
      }
    });
    
    return basePorts;
  }

  private generateConfiguration(analysis: any): Record<string, ConfigParameter> {
    const baseConfig: Record<string, ConfigParameter> = {
      enabled: {
        type: 'boolean',
        label: 'Enabled',
        default: true
      }
    };
    
    // Add configuration based on category and complexity
    if (analysis.category === 'mlAlgorithm') {
      baseConfig.threshold = {
        type: 'number',
        label: 'Threshold',
        default: 0.5,
        min: 0,
        max: 1
      };
    }
    
    if (analysis.complexity === 'advanced') {
      baseConfig.batchSize = {
        type: 'number',
        label: 'Batch Size',
        default: 32,
        min: 1,
        max: 1000
      };
    }
    
    baseConfig.verbose = {
      type: 'boolean',
      label: 'Verbose Output',
      default: false
    };
    
    return baseConfig;
  }

  private estimateExecutionTime(complexity: string): number {
    switch (complexity) {
      case 'simple': return 50;
      case 'intermediate': return 200;
      case 'advanced': return 1000;
      default: return 100;
    }
  }

  private estimateMemoryUsage(complexity: string): 'low' | 'medium' | 'high' {
    switch (complexity) {
      case 'simple': return 'low';
      case 'intermediate': return 'medium';
      case 'advanced': return 'high';
      default: return 'medium';
    }
  }

  private generateImplementation(block: BlockDefinition, analysis: any): {
    pythonCode: string;
    dependencies: string[];
    imports: string[];
  } {
    const className = block.name.replace(/\s+/g, '');
    const dependencies = this.generateDependencies(analysis);
    const imports = this.generateImports(analysis);
    
    const pythonCode = `
"""
${block.name} - AI Generated Block
${block.description}

Auto-generated by µLM AI Block Generator
"""

${imports.join('\n')}

class ${className}:
    """
    ${block.description}
    
    Category: ${block.category}
    Complexity: ${analysis.complexity}
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the ${block.name} block with configuration"""
        self.config = config
        ${Object.keys(block.config || {}).map(key => 
          `self.${key} = config.get('${key}', ${JSON.stringify(block.config?.[key]?.default || null)})`
        ).join('\n        ')}
        
        # Initialize any required models or resources
        self._initialize_resources()
    
    def _initialize_resources(self):
        """Initialize any required resources, models, or connections"""
        # TODO: Add initialization logic here
        pass
    
    def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method for the block
        
        Args:
            inputs: Dictionary containing input data from connected blocks
            
        Returns:
            Dictionary containing output data for connected blocks
        """
        try:
            # Validate inputs
            if not self._validate_inputs(inputs):
                return {"success": False, "error": "Invalid input data"}
            
            # Extract primary input data
            data = inputs.get('data')
            
            # Process the data based on block logic
            result = self._process_data(data)
            
            # Prepare outputs
            outputs = {
                "success": True,
                "${block.outputs[0]?.id || 'result'}": result
            }
            
            # Add metadata if verbose mode is enabled
            if self.verbose:
                outputs["metadata"] = {
                    "processed_items": len(data) if hasattr(data, '__len__') else 1,
                    "execution_time": time.time(),
                    "block_name": "${block.name}"
                }
            
            return outputs
            
        except Exception as e:
            error_msg = f"Error in ${block.name}: {str(e)}"
            if self.verbose:
                import traceback
                error_msg += f"\\nTraceback: {traceback.format_exc()}"
            
            return {
                "success": False,
                "error": error_msg
            }
    
    def _validate_inputs(self, inputs: Dict[str, Any]) -> bool:
        """Validate input data"""
        required_inputs = [${block.inputs.map(input => `"${input.id}"`).join(', ')}]
        
        for input_id in required_inputs:
            if input_id not in inputs:
                return False
        
        return True
    
    def _process_data(self, data: Any) -> Any:
        """
        Core data processing logic
        
        Override this method to implement your specific processing logic
        """
        # TODO: Implement your processing logic here
        
        ${this.generateProcessingLogic(analysis)}
        
        return data
    
    def get_info(self) -> Dict[str, Any]:
        """Get block information and metadata"""
        return {
            "name": "${block.name}",
            "category": "${block.category}",
            "description": "${block.description}",
            "version": "${block.version}",
            "inputs": ${JSON.stringify(block.inputs, null, 8)},
            "outputs": ${JSON.stringify(block.outputs, null, 8)},
            "config": self.config,
            "ai_generated": True
        }

# Example usage:
if __name__ == "__main__":
    # Initialize the block
    config = {
        ${Object.entries(block.config || {}).map(([key, config]) => 
          `"${key}": ${JSON.stringify(config.default)}`
        ).join(',\n        ')}
    }
    
    block = ${className}(config)
    
    # Test data
    test_inputs = {
        "data": "sample input data"  # Replace with appropriate test data
    }
    
    # Execute the block
    result = block.execute(test_inputs)
    
    if result["success"]:
        print(f"Block executed successfully: {result}")
    else:
        print(f"Block execution failed: {result['error']}")
`;

    return { pythonCode, dependencies, imports };
  }

  private generateDependencies(analysis: any): string[] {
    const dependencies = ['numpy', 'pandas'];
    
    if (analysis.category === 'mlAlgorithm') {
      dependencies.push('scikit-learn');
    }
    
    if (analysis.category === 'neuralNetwork') {
      dependencies.push('torch', 'tensorflow');
    }
    
    if (analysis.category === 'expert') {
      dependencies.push('transformers', 'huggingface-hub');
    }
    
    if (analysis.dataTypes.includes('text')) {
      dependencies.push('nltk', 'spacy');
    }
    
    if (analysis.dataTypes.includes('image')) {
      dependencies.push('pillow', 'opencv-python');
    }
    
    return dependencies;
  }

  private generateImports(analysis: any): string[] {
    const imports = [
      'import time',
      'import numpy as np',
      'import pandas as pd',
      'from typing import Dict, Any, List, Optional, Union'
    ];
    
    if (analysis.category === 'mlAlgorithm') {
      imports.push('from sklearn.base import BaseEstimator, TransformerMixin');
    }
    
    if (analysis.category === 'neuralNetwork') {
      imports.push('import torch', 'import torch.nn as nn');
    }
    
    if (analysis.dataTypes.includes('text')) {
      imports.push('import re', 'from collections import Counter');
    }
    
    return imports;
  }

  private generateProcessingLogic(analysis: any): string {
    const { category, operations } = analysis;
    
    if (operations.includes('filter')) {
      return `
        # Filter data based on criteria
        if isinstance(data, (list, np.ndarray)):
            # Filter array/list data
            return [item for item in data if self._filter_condition(item)]
        elif isinstance(data, pd.DataFrame):
            # Filter DataFrame
            return data[data.apply(self._filter_condition, axis=1)]
        else:
            # Filter single item
            return data if self._filter_condition(data) else None
    
    def _filter_condition(self, item: Any) -> bool:
        """Define your filter condition here"""
        # TODO: Implement filter logic
        return True`;
    }
    
    if (operations.includes('transform')) {
      return `
        # Transform data
        if isinstance(data, (list, np.ndarray)):
            return [self._transform_item(item) for item in data]
        elif isinstance(data, pd.DataFrame):
            return data.apply(self._transform_item, axis=1)
        else:
            return self._transform_item(data)
    
    def _transform_item(self, item: Any) -> Any:
        """Transform individual items"""
        # TODO: Implement transformation logic
        return item`;
    }
    
    if (category === 'mlAlgorithm') {
      return `
        # Machine Learning processing
        if hasattr(data, 'shape'):
            # Numerical data processing
            features = np.array(data)
            # TODO: Apply your ML model here
            predictions = features  # Placeholder
            return predictions
        else:
            # Handle non-numerical data
            return str(data)`;
    }
    
    return `
        # Basic data processing
        if isinstance(data, str):
            # Text processing
            return data.strip().lower()
        elif isinstance(data, (int, float)):
            # Numerical processing
            return float(data)
        else:
            # Generic processing
            return str(data)`;
  }

  private generateAlternatives(block: BlockDefinition, analysis: any): BlockDefinition[] {
    const alternatives: BlockDefinition[] = [];
    
    // Simple version
    alternatives.push({
      ...block,
      id: `${block.id}_simple`,
      name: `${block.name} (Simple)`,
      description: `Simplified version of ${block.name} with basic functionality`,
      config: {
        enabled: block.config?.enabled || { type: 'boolean', label: 'Enabled', default: true }
      }
    });
    
    // Advanced version
    if (analysis.complexity !== 'advanced') {
      alternatives.push({
        ...block,
        id: `${block.id}_advanced`,
        name: `${block.name} (Advanced)`,
        description: `Advanced version of ${block.name} with additional features`,
        config: {
          ...block.config,
          batchProcessing: { type: 'boolean', label: 'Batch Processing', default: true },
          parallelExecution: { type: 'boolean', label: 'Parallel Execution', default: false },
          caching: { type: 'boolean', label: 'Enable Caching', default: true }
        }
      });
    }
    
    return alternatives;
  }

  private generateOptimizationSuggestions(block: BlockDefinition, context: any): {
    suggestions: string[];
    performanceHints: string[];
    compatibilityNotes: string[];
  } {
    const suggestions = [
      'Consider implementing input validation for better error handling',
      'Add progress tracking for long-running operations',
      'Implement result caching for repeated operations'
    ];
    
    const performanceHints = [
      'Use vectorized operations when processing arrays',
      'Consider batch processing for large datasets',
      'Implement lazy evaluation for memory efficiency'
    ];
    
    const compatibilityNotes = [
      'Ensure output format matches expected input types of downstream blocks',
      'Test with various input sizes and data types',
      'Consider adding fallback methods for edge cases'
    ];
    
    if (context.compatibleBlocks.length > 0) {
      compatibilityNotes.push(`Compatible with existing blocks: ${context.compatibleBlocks.join(', ')}`);
    }
    
    return { suggestions, performanceHints, compatibilityNotes };
  }

  private generateDocumentation(
    block: BlockDefinition,
    implementation: any,
    originalPrompt: string
  ): {
    readme: string;
    examples: string[];
    apiReference: string;
  } {
    const readme = `
# ${block.name}

## Overview
${block.description}

**Generated from prompt:** "${originalPrompt}"

## Category
${block.category.charAt(0).toUpperCase() + block.category.slice(1)}

## Inputs
${block.inputs.map(input => `- **${input.name}** (\`${input.type}\`): ${input.description}`).join('\n')}

## Outputs
${block.outputs.map(output => `- **${output.name}** (\`${output.type}\`): ${output.description}`).join('\n')}

## Configuration
${Object.entries(block.config || {}).map(([key, config]: [string, any]) => 
  `- **${key}**: ${config.label} (\`${config.type}\`) - ${config.description || 'No description'}`
).join('\n')}

## Dependencies
${implementation.dependencies.map((dep: string) => `- ${dep}`).join('\n')}

## Performance
- **Estimated execution time:** ${block.performance?.avgExecutionTime}ms
- **Memory usage:** ${block.performance?.memoryUsage}
- **Retryable:** ${block.errorHandling?.retryable ? 'Yes' : 'No'}

## Installation
\`\`\`bash
pip install ${implementation.dependencies.join(' ')}
\`\`\`
`;

    const examples = [
      `
# Basic Usage Example
from ${block.name.replace(/\s+/g, '').toLowerCase()} import ${block.name.replace(/\s+/g, '')}

# Initialize the block
config = {
    ${Object.entries(block.config || {}).map(([key, config]) => 
      `"${key}": ${JSON.stringify(config.default)}`
    ).join(',\n    ')}
}

block = ${block.name.replace(/\s+/g, '')}(config)

# Prepare input data
inputs = {
    "${block.inputs[0]?.id || 'data'}": "your_input_data_here"
}

# Execute the block
result = block.execute(inputs)

if result["success"]:
    output = result["${block.outputs[0]?.id || 'result'}"]
    print(f"Block output: {output}")
else:
    print(f"Error: {result['error']}")
`
    ];

    const apiReference = `
## API Reference

### Class: ${block.name.replace(/\s+/g, '')}

#### Constructor
\`\`\`python
__init__(self, config: Dict[str, Any])
\`\`\`

Initialize the block with configuration parameters.

**Parameters:**
${Object.entries(block.config || {}).map(([key, config]: [string, any]) => 
  `- \`${key}\` (${config.type}): ${config.description || config.label}`
).join('\n')}

#### Methods

##### execute(inputs: Dict[str, Any]) -> Dict[str, Any]
Execute the block with provided inputs.

**Parameters:**
${block.inputs.map(input => `- \`${input.id}\` (${input.type}): ${input.description}`).join('\n')}

**Returns:**
${block.outputs.map(output => `- \`${output.id}\` (${output.type}): ${output.description}`).join('\n')}

##### get_info() -> Dict[str, Any]
Get block metadata and information.

**Returns:**
- Dictionary containing block information, configuration, and capabilities.
`;

    return { readme, examples, apiReference };
  }

  private validateBlock(block: BlockDefinition, implementation: any): {
    syntaxValid: boolean;
    compatibilityScore: number;
    performanceEstimate: {
      executionTime: number;
      memoryUsage: 'low' | 'medium' | 'high';
      cpuIntensive: boolean;
    };
  } {
    // Basic syntax validation
    const syntaxValid = this.validatePythonSyntax(implementation.pythonCode);
    
    // Compatibility scoring (0-1)
    let compatibilityScore = 0.8; // Base score
    
    if (block.inputs.length > 0 && block.outputs.length > 0) {
      compatibilityScore += 0.1;
    }
    
    if (block.config && Object.keys(block.config).length > 0) {
      compatibilityScore += 0.1;
    }
    
    return {
      syntaxValid,
      compatibilityScore: Math.min(compatibilityScore, 1),
      performanceEstimate: {
        executionTime: block.performance?.avgExecutionTime || 100,
        memoryUsage: (block.performance?.memoryUsage === 'very_high' ? 'high' : block.performance?.memoryUsage) || 'medium',
        cpuIntensive: block.category === 'neuralNetwork' || block.category === 'mlAlgorithm'
      }
    };
  }

  private validatePythonSyntax(code: string): boolean {
    // Basic Python syntax validation
    // In a real implementation, you might use a Python AST parser or similar tool
    
    const syntaxChecks = [
      // Check for basic Python structure
      /class\s+\w+.*:/,
      /def\s+\w+.*:/,
      /import\s+\w+/,
    ];
    
    return syntaxChecks.every(check => check.test(code));
  }

  public async analyzeWorkflow(blocks: BlockDefinition[]): Promise<{
    suggestions: string[];
    optimizations: string[];
    missingComponents: string[];
  }> {
    const categories = blocks.map(block => block.category);
    const suggestions: string[] = [];
    const optimizations: string[] = [];
    const missingComponents: string[] = [];
    
    // Analyze workflow completeness
    if (!categories.includes('input')) {
      missingComponents.push('Input block - Add a data source to your workflow');
    }
    
    if (!categories.includes('output')) {
      missingComponents.push('Output block - Add a way to save or display results');
    }
    
    if (categories.includes('mlAlgorithm') && !categories.includes('utility')) {
      suggestions.push('Consider adding data preprocessing blocks before ML algorithms');
    }
    
    if (categories.includes('neuralNetwork') && blocks.length < 3) {
      suggestions.push('Neural network workflows typically benefit from data preprocessing and postprocessing blocks');
    }
    
    // Performance optimizations
    if (blocks.length > 5) {
      optimizations.push('Consider grouping related operations into composite blocks for better performance');
    }
    
    if (categories.filter(cat => cat === 'mlAlgorithm').length > 1) {
      optimizations.push('Multiple ML algorithms detected - consider ensemble methods or model selection blocks');
    }
    
    return { suggestions, optimizations, missingComponents };
  }
}

// Export singleton instance
export const aiBlockGenerationService = AIBlockGenerationService.getInstance();
