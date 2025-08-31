// @ts-nocheck
// Auto-Build AI Assistant for µLM Workflows
// Intelligent workflow builder with natural language processing and auto-generation

import { Node, Edge, Position } from 'reactflow';
import { aiCodeAssistant } from './AICodeAssistantService';

export interface WorkflowRequirements {
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  constraints: {
    performance?: string;
    budget?: string;
    latency?: string;
    accuracy?: string;
  };
  preferences: {
    complexity: 'simple' | 'moderate' | 'complex';
    reliability: 'basic' | 'high' | 'enterprise';
    scalability: 'single' | 'distributed' | 'cloud';
  };
}

export interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  useCase: string;
  blocks: string[];
  complexity: number;
  performance: {
    throughput: string;
    latency: string;
    memory: string;
  };
  pros: string[];
  cons: string[];
}

export interface BlockSuggestion {
  type: string;
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  reasoning: string;
  alternatives: string[];
}

export interface WorkflowArchitecture {
  pattern: WorkflowPattern;
  blocks: BlockSuggestion[];
  connections: Array<{
    from: string;
    to: string;
    type: string;
    reasoning: string;
  }>;
  errorHandling: {
    blocks: BlockSuggestion[];
    strategies: string[];
  };
  monitoring: {
    blocks: BlockSuggestion[];
    metrics: string[];
  };
  documentation: {
    overview: string;
    dataFlow: string;
    requirements: string;
    deployment: string;
  };
}

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  content: string;
  metadata?: {
    suggestions?: any[];
    attachments?: any[];
    actions?: any[];
  };
}

class AutoBuildAIAssistant {
  private conversationHistory: ConversationTurn[] = [];
  private currentWorkflow: WorkflowArchitecture | null = null;
  private userPreferences: Record<string, any> = {};
  private learningData: Record<string, any> = {};

  // Workflow patterns database
  private workflowPatterns: WorkflowPattern[] = [
    {
      id: 'smart-document-analyzer',
      name: 'Smart Document Analyzer',
      description: 'Comprehensive document intelligence pipeline with multi-stage AI processing',
      useCase: 'PDF analysis, content extraction, sentiment analysis, insight generation',
      blocks: ['fileUpload', 'pdfExtractor', 'textCleaner', 'summarizer', 'sentimentAnalyzer', 'insightGenerator', 'dashboard'],
      complexity: 8,
      performance: {
        throughput: '50-100 docs/min',
        latency: '2-5 seconds per document',
        memory: '512MB - 2GB'
      },
      pros: ['End-to-end automation', 'Rich insights', 'Scalable processing', 'Visual analytics'],
      cons: ['Higher resource usage', 'Complex setup']
    },
    {
      id: 'multimodal-search-engine',
      name: 'Multimodal Search Engine',
      description: 'Advanced search system combining image and text understanding',
      useCase: 'Visual search, content discovery, semantic matching, cross-modal retrieval',
      blocks: ['dualInput', 'imageEncoder', 'textEncoder', 'embeddingFusion', 'similarityMatcher', 'ranker', 'resultsAggregator'],
      complexity: 9,
      performance: {
        throughput: '1000+ queries/sec',
        latency: '<100ms per query',
        memory: '1-4GB'
      },
      pros: ['Cutting-edge AI', 'Multi-modal capability', 'High accuracy', 'Real-time search'],
      cons: ['GPU requirements', 'Complex embeddings']
    },
    {
      id: 'ai-content-moderator',
      name: 'AI Content Moderator',
      description: 'Intelligent content safety system with automated response workflows',
      useCase: 'Content moderation, toxicity detection, automated actions, safety compliance',
      blocks: ['contentInput', 'textClassifier', 'imageClassifier', 'toxicityDetector', 'actionRouter', 'alertSystem', 'dashboard'],
      complexity: 7,
      performance: {
        throughput: '10k+ items/min',
        latency: '<50ms per item',
        memory: '256MB - 1GB'
      },
      pros: ['Real-time protection', 'Multi-format support', 'Automated actions', 'Compliance ready'],
      cons: ['False positives', 'Continuous training needed']
    },
    {
      id: 'simple-transformation',
      name: 'Simple Data Transformation',
      description: 'Linear pipeline for basic data processing',
      useCase: 'Data cleaning, format conversion, simple ML inference',
      blocks: ['input', 'transformer', 'output'],
      complexity: 1,
      performance: {
        throughput: 'High',
        latency: 'Low',
        memory: 'Low'
      },
      pros: ['Simple to understand', 'Fast execution', 'Easy debugging'],
      cons: ['Limited flexibility', 'No error recovery', 'Single point of failure']
    },
    {
      id: 'ml-pipeline',
      name: 'Machine Learning Pipeline',
      description: 'End-to-end ML workflow with training and inference',
      useCase: 'Model training, hyperparameter tuning, batch inference',
      blocks: ['dataLoader', 'preprocessor', 'mlAlgorithm', 'evaluator', 'deployer'],
      complexity: 3,
      performance: {
        throughput: 'Medium',
        latency: 'Medium',
        memory: 'High'
      },
      pros: ['Complete ML workflow', 'Model versioning', 'Automated evaluation'],
      cons: ['Complex setup', 'Resource intensive', 'Longer development time']
    },
    {
      id: 'rag-system',
      name: 'Retrieval-Augmented Generation',
      description: 'RAG system with vector search and LLM generation',
      useCase: 'Question answering, document search, knowledge systems',
      blocks: ['ragTool', 'vectorStore', 'llm', 'contextManager', 'responseGenerator'],
      complexity: 4,
      performance: {
        throughput: 'Medium',
        latency: 'Medium-High',
        memory: 'High'
      },
      pros: ['Rich contextual responses', 'Up-to-date information', 'Scalable knowledge'],
      cons: ['Complex architecture', 'High latency', 'Expensive to run']
    },
    {
      id: 'multi-agent',
      name: 'Multi-Agent Orchestration',
      description: 'Coordinated system with multiple specialized agents',
      useCase: 'Complex reasoning, multi-step workflows, collaborative AI',
      blocks: ['agentCoordinator', 'moeExpert', 'taskRouter', 'resultAggregator'],
      complexity: 5,
      performance: {
        throughput: 'Low-Medium',
        latency: 'High',
        memory: 'Very High'
      },
      pros: ['Sophisticated reasoning', 'Parallel processing', 'Specialized expertise'],
      cons: ['Very complex', 'Hard to debug', 'Expensive resources']
    },
    {
      id: 'real-time-stream',
      name: 'Real-time Stream Processing',
      description: 'High-throughput streaming data processing',
      useCase: 'Live monitoring, real-time analytics, event processing',
      blocks: ['streamInput', 'bufferManager', 'streamProcessor', 'alertManager', 'streamOutput'],
      complexity: 3,
      performance: {
        throughput: 'Very High',
        latency: 'Very Low',
        memory: 'Medium'
      },
      pros: ['Real-time processing', 'High throughput', 'Event-driven'],
      cons: ['Complex state management', 'Requires streaming infrastructure', 'Debugging challenges']
    }
  ];

  // Block templates for different types
  private blockTemplates = {
    input: {
      name: 'Data Input',
      description: 'Receives and validates input data',
      defaultConfig: {
        format: 'json',
        validation: true,
        batch_size: 1
      }
    },
    output: {
      name: 'Data Output',
      description: 'Formats and sends output data',
      defaultConfig: {
        format: 'json',
        compression: false
      }
    },
    transformer: {
      name: 'Data Transformer',
      description: 'Transforms data between formats',
      defaultConfig: {
        model_name: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000
      }
    },
    llm: {
      name: 'Language Model',
      description: 'Large language model for text processing',
      defaultConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000
      }
    },
    mlAlgorithm: {
      name: 'ML Algorithm',
      description: 'Machine learning model for prediction',
      defaultConfig: {
        algorithm_type: 'neural_network',
        learning_rate: 0.001,
        epochs: 100
      }
    },
    ragTool: {
      name: 'RAG Tool',
      description: 'Retrieval-augmented generation system',
      defaultConfig: {
        vector_store: 'faiss',
        embedding_model: 'text-embedding-ada-002',
        top_k: 5
      }
    },
    moeExpert: {
      name: 'Mixture of Experts',
      description: 'Multiple specialized expert models',
      defaultConfig: {
        num_experts: 4,
        gating_mechanism: 'learned',
        expert_capacity: 1024
      }
    },
    dataProcessor: {
      name: 'Data Processor',
      description: 'Advanced data processing and analysis',
      defaultConfig: {
        operations: ['clean', 'normalize', 'validate'],
        output_format: 'structured'
      }
    },
    errorHandler: {
      name: 'Error Handler',
      description: 'Manages errors and recovery strategies',
      defaultConfig: {
        retry_count: 3,
        fallback_strategy: 'default_response',
        log_errors: true
      }
    },
    monitor: {
      name: 'Performance Monitor',
      description: 'Tracks performance metrics and alerts',
      defaultConfig: {
        metrics: ['latency', 'throughput', 'accuracy'],
        alert_thresholds: {},
        logging_level: 'info'
      }
    }
  };

  /**
   * Parse natural language requirements into structured format
   */
  async parseRequirements(prompt: string): Promise<WorkflowRequirements> {
    try {
      // Use AI to analyze the prompt
      const analysis = await aiCodeAssistant.analyzeRequirements(prompt);
      
      // Extract key information with fallback parsing
      const requirements: WorkflowRequirements = {
        description: prompt,
        inputTypes: this.extractInputTypes(prompt, analysis),
        outputTypes: this.extractOutputTypes(prompt, analysis),
        constraints: {
          performance: this.extractConstraint(prompt, 'performance'),
          budget: this.extractConstraint(prompt, 'budget'),
          latency: this.extractConstraint(prompt, 'latency'),
          accuracy: this.extractConstraint(prompt, 'accuracy')
        },
        preferences: {
          complexity: this.inferComplexity(prompt),
          reliability: this.inferReliability(prompt),
          scalability: this.inferScalability(prompt)
        }
      };

      return requirements;
    } catch (error) {
      console.warn('AI analysis failed, using fallback parsing:', error);
      return this.fallbackParseRequirements(prompt);
    }
  }

  /**
   * Suggest optimal workflow architecture pattern
   */
  suggestWorkflowPattern(requirements: WorkflowRequirements): WorkflowPattern[] {
    const patterns = this.workflowPatterns.filter(pattern => {
      // Score patterns based on requirements
      let score = 0;
      
      // Complexity matching
      const complexityMap = { simple: 1, moderate: 3, complex: 5 };
      const targetComplexity = complexityMap[requirements.preferences.complexity];
      score += Math.max(0, 5 - Math.abs(pattern.complexity - targetComplexity));
      
      // Use case matching
      const description = requirements.description.toLowerCase();
      if (pattern.useCase.toLowerCase().split(',').some(useCase => 
        description.includes(useCase.trim()))) {
        score += 10;
      }
      
      return score > 5;
    });

    // Sort by relevance score
    return patterns.sort((a, b) => {
      const scoreA = this.calculatePatternScore(a, requirements);
      const scoreB = this.calculatePatternScore(b, requirements);
      return scoreB - scoreA;
    });
  }

  /**
   * Generate complete workflow architecture
   */
  async generateWorkflowArchitecture(
    requirements: WorkflowRequirements,
    selectedPattern?: WorkflowPattern
  ): Promise<WorkflowArchitecture> {
    const pattern = selectedPattern || this.suggestWorkflowPattern(requirements)[0];
    
    if (!pattern) {
      throw new Error('No suitable workflow pattern found');
    }

    // Generate blocks with intelligent positioning
    const blocks = await this.generateBlocks(pattern, requirements);
    
    // Generate connections based on data flow
    const connections = this.generateConnections(blocks, requirements);
    
    // Add error handling blocks
    const errorHandling = this.generateErrorHandling(blocks, requirements);
    
    // Add monitoring blocks
    const monitoring = this.generateMonitoring(blocks, requirements);
    
    // Generate documentation
    const documentation = await this.generateDocumentation(
      pattern, blocks, connections, requirements
    );

    const architecture: WorkflowArchitecture = {
      pattern,
      blocks,
      connections,
      errorHandling,
      monitoring,
      documentation
    };

    this.currentWorkflow = architecture;
    return architecture;
  }

  /**
   * Generate blocks with optimal positioning
   */
  private async generateBlocks(
    pattern: WorkflowPattern,
    requirements: WorkflowRequirements
  ): Promise<BlockSuggestion[]> {
    const blocks: BlockSuggestion[] = [];
    const blockSpacing = 300;
    let xPosition = 100;
    let yPosition = 100;

    for (const blockType of pattern.blocks) {
      const template = this.blockTemplates[blockType] || this.blockTemplates.dataProcessor;
      
      // Configure block based on requirements
      const config = await this.configureBlock(blockType, requirements, template);
      
      const block: BlockSuggestion = {
        type: blockType,
        name: template.name,
        description: template.description,
        config,
        position: { x: xPosition, y: yPosition },
        reasoning: this.generateBlockReasoning(blockType, requirements),
        alternatives: this.suggestAlternatives(blockType)
      };

      blocks.push(block);
      
      // Update position for next block
      xPosition += blockSpacing;
      if (xPosition > 1000) {
        xPosition = 100;
        yPosition += 200;
      }
    }

    return blocks;
  }

  /**
   * Generate intelligent block connections
   */
  private generateConnections(
    blocks: BlockSuggestion[],
    requirements: WorkflowRequirements
  ): Array<{ from: string; to: string; type: string; reasoning: string }> {
    const connections: Array<{ from: string; to: string; type: string; reasoning: string }> = [];
    
    for (let i = 0; i < blocks.length - 1; i++) {
      const fromBlock = blocks[i];
      const toBlock = blocks[i + 1];
      
      connections.push({
        from: fromBlock.type,
        to: toBlock.type,
        type: this.inferConnectionType(fromBlock, toBlock),
        reasoning: `Data flows from ${fromBlock.name} to ${toBlock.name} for processing`
      });
    }

    return connections;
  }

  /**
   * Configure block parameters intelligently
   */
  private async configureBlock(
    blockType: string,
    requirements: WorkflowRequirements,
    template: any
  ): Promise<Record<string, any>> {
    const baseConfig = { ...template.defaultConfig };
    
    // Apply intelligent configuration based on requirements
    if (blockType === 'llm') {
      if (requirements.constraints.performance === 'high') {
        baseConfig.model = 'gpt-3.5-turbo';
        baseConfig.max_tokens = 500;
      } else if (requirements.constraints.accuracy === 'high') {
        baseConfig.model = 'gpt-4';
        baseConfig.temperature = 0.1;
      }
    }
    
    if (blockType === 'mlAlgorithm') {
      if (requirements.preferences.complexity === 'simple') {
        baseConfig.algorithm_type = 'linear_regression';
      } else if (requirements.preferences.complexity === 'complex') {
        baseConfig.algorithm_type = 'neural_network';
        baseConfig.layers = [512, 256, 128];
      }
    }

    return baseConfig;
  }

  /**
   * Add conversation turn and maintain history
   */
  addConversationTurn(type: 'user' | 'assistant', content: string, metadata?: any): void {
    const turn: ConversationTurn = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      content,
      metadata
    };
    
    this.conversationHistory.push(turn);
    
    // Keep last 50 turns
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Generate follow-up questions for refinement
   */
  generateFollowUpQuestions(requirements: WorkflowRequirements): string[] {
    const questions: string[] = [];
    
    if (!requirements.constraints.performance) {
      questions.push("What are your performance requirements? (high throughput, low latency, etc.)");
    }
    
    if (!requirements.constraints.budget) {
      questions.push("Do you have any budget constraints for API usage or compute resources?");
    }
    
    if (requirements.inputTypes.length === 0) {
      questions.push("What type of input data will your workflow process? (text, images, structured data, etc.)");
    }
    
    if (requirements.outputTypes.length === 0) {
      questions.push("What format should the output be in? (JSON, text, visualizations, etc.)");
    }
    
    if (requirements.preferences.scalability === 'single') {
      questions.push("Do you need this workflow to handle multiple users or scale horizontally?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  }

  /**
   * Learn from user feedback
   */
  learnFromFeedback(feedback: {
    architecture: WorkflowArchitecture;
    rating: number;
    comments: string;
    modifications: any[];
  }): void {
    // Store learning data
    const learningEntry = {
      timestamp: new Date(),
      pattern: feedback.architecture.pattern.id,
      rating: feedback.rating,
      comments: feedback.comments,
      modifications: feedback.modifications,
      requirements: this.conversationHistory
    };
    
    this.learningData[Date.now().toString()] = learningEntry;
    
    // Update user preferences
    if (feedback.rating >= 4) {
      this.updateUserPreferences(feedback.architecture, true);
    } else if (feedback.rating <= 2) {
      this.updateUserPreferences(feedback.architecture, false);
    }
  }

  /**
   * Suggest optimizations for existing workflow
   */
  async suggestOptimizations(architecture: WorkflowArchitecture): Promise<{
    performance: string[];
    cost: string[];
    reliability: string[];
    maintainability: string[];
  }> {
    const optimizations = {
      performance: [] as string[],
      cost: [] as string[],
      reliability: [] as string[],
      maintainability: [] as string[]
    };

    // Analyze blocks for optimization opportunities
    for (const block of architecture.blocks) {
      if (block.type === 'llm' && block.config.model === 'gpt-4') {
        optimizations.cost.push(
          `Consider using GPT-3.5-turbo for ${block.name} if high accuracy isn't critical`
        );
      }
      
      if (block.type === 'mlAlgorithm' && !block.config.batch_processing) {
        optimizations.performance.push(
          `Enable batch processing for ${block.name} to improve throughput`
        );
      }
    }

    // Analyze architecture for patterns
    if (architecture.blocks.length > 5 && !architecture.errorHandling.blocks.length) {
      optimizations.reliability.push(
        'Add error handling blocks for better fault tolerance'
      );
    }

    if (!architecture.monitoring.blocks.length) {
      optimizations.maintainability.push(
        'Add monitoring blocks for better observability'
      );
    }

    return optimizations;
  }

  // Helper methods
  private extractInputTypes(prompt: string, analysis?: any): string[] {
    const types: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('text') || lowerPrompt.includes('document')) types.push('text');
    if (lowerPrompt.includes('image') || lowerPrompt.includes('photo')) types.push('image');
    if (lowerPrompt.includes('json') || lowerPrompt.includes('data')) types.push('structured');
    if (lowerPrompt.includes('csv') || lowerPrompt.includes('table')) types.push('tabular');
    
    return types.length > 0 ? types : ['text']; // Default to text
  }

  private extractOutputTypes(prompt: string, analysis?: any): string[] {
    const types: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('report') || lowerPrompt.includes('summary')) types.push('report');
    if (lowerPrompt.includes('json') || lowerPrompt.includes('structured')) types.push('structured');
    if (lowerPrompt.includes('visualization') || lowerPrompt.includes('chart')) types.push('visualization');
    if (lowerPrompt.includes('response') || lowerPrompt.includes('answer')) types.push('text');
    
    return types.length > 0 ? types : ['text']; // Default to text
  }

  private extractConstraint(prompt: string, constraintType: string): string | undefined {
    const lowerPrompt = prompt.toLowerCase();
    
    switch (constraintType) {
      case 'performance':
        if (lowerPrompt.includes('fast') || lowerPrompt.includes('real-time')) return 'high';
        if (lowerPrompt.includes('slow') || lowerPrompt.includes('batch')) return 'low';
        break;
      case 'budget':
        if (lowerPrompt.includes('cheap') || lowerPrompt.includes('low cost')) return 'low';
        if (lowerPrompt.includes('expensive') || lowerPrompt.includes('premium')) return 'high';
        break;
      case 'latency':
        if (lowerPrompt.includes('instant') || lowerPrompt.includes('immediate')) return 'low';
        if (lowerPrompt.includes('delay') || lowerPrompt.includes('eventual')) return 'high';
        break;
      case 'accuracy':
        if (lowerPrompt.includes('precise') || lowerPrompt.includes('accurate')) return 'high';
        if (lowerPrompt.includes('approximate') || lowerPrompt.includes('rough')) return 'low';
        break;
    }
    
    return undefined;
  }

  private inferComplexity(prompt: string): 'simple' | 'moderate' | 'complex' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('simple') || lowerPrompt.includes('basic') || lowerPrompt.includes('easy')) {
      return 'simple';
    }
    
    if (lowerPrompt.includes('complex') || lowerPrompt.includes('advanced') || lowerPrompt.includes('sophisticated')) {
      return 'complex';
    }
    
    return 'moderate';
  }

  private inferReliability(prompt: string): 'basic' | 'high' | 'enterprise' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('enterprise') || lowerPrompt.includes('mission-critical')) {
      return 'enterprise';
    }
    
    if (lowerPrompt.includes('reliable') || lowerPrompt.includes('stable') || lowerPrompt.includes('production')) {
      return 'high';
    }
    
    return 'basic';
  }

  private inferScalability(prompt: string): 'single' | 'distributed' | 'cloud' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('cloud') || lowerPrompt.includes('scale') || lowerPrompt.includes('distributed')) {
      return 'cloud';
    }
    
    if (lowerPrompt.includes('multiple users') || lowerPrompt.includes('concurrent')) {
      return 'distributed';
    }
    
    return 'single';
  }

  private fallbackParseRequirements(prompt: string): WorkflowRequirements {
    return {
      description: prompt,
      inputTypes: this.extractInputTypes(prompt),
      outputTypes: this.extractOutputTypes(prompt),
      constraints: {
        performance: this.extractConstraint(prompt, 'performance'),
        budget: this.extractConstraint(prompt, 'budget'),
        latency: this.extractConstraint(prompt, 'latency'),
        accuracy: this.extractConstraint(prompt, 'accuracy')
      },
      preferences: {
        complexity: this.inferComplexity(prompt),
        reliability: this.inferReliability(prompt),
        scalability: this.inferScalability(prompt)
      }
    };
  }

  private calculatePatternScore(pattern: WorkflowPattern, requirements: WorkflowRequirements): number {
    let score = 0;
    
    // Base score from pattern complexity vs requirements
    const complexityMap = { simple: 1, moderate: 3, complex: 5 };
    const targetComplexity = complexityMap[requirements.preferences.complexity];
    score += Math.max(0, 10 - Math.abs(pattern.complexity - targetComplexity) * 2);
    
    // Bonus for use case matching
    const description = requirements.description.toLowerCase();
    if (pattern.useCase.toLowerCase().split(',').some(useCase => 
      description.includes(useCase.trim()))) {
      score += 20;
    }
    
    return score;
  }

  private generateBlockReasoning(blockType: string, requirements: WorkflowRequirements): string {
    const reasoningMap = {
      input: 'Essential for receiving and validating input data',
      transformer: 'Required for data transformation and format conversion',
      llm: 'Provides natural language understanding and generation capabilities',
      mlAlgorithm: 'Enables machine learning predictions and analysis',
      ragTool: 'Combines retrieval and generation for enhanced responses',
      output: 'Formats and delivers final results',
      errorHandler: 'Ensures robust error handling and recovery',
      monitor: 'Provides observability and performance tracking'
    };
    
    return reasoningMap[blockType] || 'Provides specialized processing capabilities';
  }

  private suggestAlternatives(blockType: string): string[] {
    const alternativesMap = {
      llm: ['transformer', 'ragTool'],
      mlAlgorithm: ['neuralNetwork', 'moeExpert'],
      transformer: ['llm', 'dataProcessor'],
      ragTool: ['llm', 'vectorSearch'],
      moeExpert: ['mlAlgorithm', 'ensembleModel']
    };
    
    return alternativesMap[blockType] || [];
  }

  private inferConnectionType(fromBlock: BlockSuggestion, toBlock: BlockSuggestion): string {
    if (fromBlock.type === 'input' || toBlock.type === 'output') {
      return 'data';
    }
    
    if (fromBlock.type.includes('ml') || toBlock.type.includes('ml')) {
      return 'prediction';
    }
    
    if (fromBlock.type === 'llm' || toBlock.type === 'llm') {
      return 'text';
    }
    
    return 'data';
  }

  private generateErrorHandling(
    blocks: BlockSuggestion[],
    requirements: WorkflowRequirements
  ): { blocks: BlockSuggestion[]; strategies: string[] } {
    const errorBlocks: BlockSuggestion[] = [];
    const strategies: string[] = [];

    if (requirements.preferences.reliability !== 'basic') {
      errorBlocks.push({
        type: 'errorHandler',
        name: 'Error Handler',
        description: 'Handles and recovers from errors',
        config: {
          retry_count: requirements.preferences.reliability === 'enterprise' ? 5 : 3,
          fallback_strategy: 'graceful_degradation'
        },
        position: { x: 800, y: 300 },
        reasoning: 'Provides fault tolerance and error recovery',
        alternatives: ['circuitBreaker', 'retryHandler']
      });

      strategies.push('Automatic retry with exponential backoff');
      strategies.push('Graceful degradation for non-critical failures');
      
      if (requirements.preferences.reliability === 'enterprise') {
        strategies.push('Circuit breaker pattern for external dependencies');
        strategies.push('Dead letter queue for failed messages');
      }
    }

    return { blocks: errorBlocks, strategies };
  }

  private generateMonitoring(
    blocks: BlockSuggestion[],
    requirements: WorkflowRequirements
  ): { blocks: BlockSuggestion[]; metrics: string[] } {
    const monitoringBlocks: BlockSuggestion[] = [];
    const metrics: string[] = ['execution_time', 'throughput', 'error_rate'];

    if (requirements.preferences.reliability !== 'basic') {
      monitoringBlocks.push({
        type: 'monitor',
        name: 'Performance Monitor',
        description: 'Tracks workflow performance and health',
        config: {
          metrics: metrics,
          alert_thresholds: {
            error_rate: 0.05,
            latency_p99: 5000
          }
        },
        position: { x: 800, y: 100 },
        reasoning: 'Provides observability and performance insights',
        alternatives: ['logger', 'metricsCollector']
      });

      if (requirements.constraints.performance === 'high') {
        metrics.push('memory_usage', 'cpu_utilization', 'queue_depth');
      }
    }

    return { blocks: monitoringBlocks, metrics };
  }

  private async generateDocumentation(
    pattern: WorkflowPattern,
    blocks: BlockSuggestion[],
    connections: any[],
    requirements: WorkflowRequirements
  ): Promise<{
    overview: string;
    dataFlow: string;
    requirements: string;
    deployment: string;
  }> {
    const overview = `
# ${pattern.name} Workflow

${pattern.description}

This workflow implements a ${requirements.preferences.complexity} solution for ${requirements.description}.

## Architecture Pattern
${pattern.name} provides ${pattern.pros.join(', ')} while managing trade-offs like ${pattern.cons.join(', ')}.

## Performance Characteristics
- **Throughput**: ${pattern.performance.throughput}
- **Latency**: ${pattern.performance.latency}
- **Memory Usage**: ${pattern.performance.memory}
    `;

    const dataFlow = `
## Data Flow

${blocks.map((block, index) => 
  `${index + 1}. **${block.name}**: ${block.description}`
).join('\n')}

## Connections
${connections.map(conn => 
  `- ${conn.from} → ${conn.to}: ${conn.reasoning}`
).join('\n')}
    `;

    const requirementsDoc = `
## Requirements Analysis

- **Input Types**: ${requirements.inputTypes.join(', ')}
- **Output Types**: ${requirements.outputTypes.join(', ')}
- **Complexity**: ${requirements.preferences.complexity}
- **Reliability**: ${requirements.preferences.reliability}
- **Scalability**: ${requirements.preferences.scalability}

### Constraints
${Object.entries(requirements.constraints)
  .filter(([_, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}
    `;

    const deployment = `
## Deployment Guide

1. **Setup**: Configure block parameters according to requirements
2. **Testing**: Validate workflow with sample data
3. **Monitoring**: Enable performance tracking and alerting
4. **Scaling**: Adjust resources based on load requirements

### Resource Requirements
- **Compute**: ${this.estimateCompute(blocks)}
- **Memory**: ${this.estimateMemory(blocks)}
- **Storage**: ${this.estimateStorage(blocks)}
    `;

    return {
      overview,
      dataFlow,
      requirements: requirementsDoc,
      deployment
    };
  }

  private estimateCompute(blocks: BlockSuggestion[]): string {
    const computeIntensive = ['llm', 'mlAlgorithm', 'moeExpert', 'neuralNetwork'];
    const intensiveCount = blocks.filter(b => computeIntensive.includes(b.type)).length;
    
    if (intensiveCount === 0) return 'Low (1-2 CPU cores)';
    if (intensiveCount <= 2) return 'Medium (4-8 CPU cores)';
    return 'High (8+ CPU cores or GPU acceleration)';
  }

  private estimateMemory(blocks: BlockSuggestion[]): string {
    const memoryIntensive = ['llm', 'mlAlgorithm', 'moeExpert', 'ragTool'];
    const intensiveCount = blocks.filter(b => memoryIntensive.includes(b.type)).length;
    
    if (intensiveCount === 0) return 'Low (2-4 GB RAM)';
    if (intensiveCount <= 2) return 'Medium (8-16 GB RAM)';
    return 'High (32+ GB RAM)';
  }

  private estimateStorage(blocks: BlockSuggestion[]): string {
    const storageIntensive = ['ragTool', 'mlAlgorithm', 'dataProcessor'];
    const hasStorage = blocks.some(b => storageIntensive.includes(b.type));
    
    return hasStorage ? 'Medium (10-100 GB)' : 'Low (1-10 GB)';
  }

  private updateUserPreferences(architecture: WorkflowArchitecture, positive: boolean): void {
    const weight = positive ? 1 : -1;
    
    // Update pattern preferences
    const patternId = architecture.pattern.id;
    this.userPreferences[`pattern_${patternId}`] = 
      (this.userPreferences[`pattern_${patternId}`] || 0) + weight;
    
    // Update block preferences
    architecture.blocks.forEach(block => {
      this.userPreferences[`block_${block.type}`] = 
        (this.userPreferences[`block_${block.type}`] || 0) + weight;
    });
  }

  // Public getter methods
  getConversationHistory(): ConversationTurn[] {
    return [...this.conversationHistory];
  }

  getCurrentWorkflow(): WorkflowArchitecture | null {
    return this.currentWorkflow;
  }

  getUserPreferences(): Record<string, any> {
    return { ...this.userPreferences };
  }

  getLearningData(): Record<string, any> {
    return { ...this.learningData };
  }
}

// Export singleton instance
export const autoBuildAI = new AutoBuildAIAssistant();
