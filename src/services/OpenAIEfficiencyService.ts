// @ts-nocheck
// OpenAI API Efficiency Service
// Ultra-efficient OpenAI usage for µLM with smart caching and token optimization

import { Node, Edge } from 'reactflow';
import { BlockDefinition } from '../storage/types/GridTypes';

// API Key configuration from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface PromptCacheEntry {
  hash: string;
  prompt: string;
  response: any;
  timestamp: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  similarity?: number;
  sharedAcrossUsers?: boolean;
}

export interface WorkflowError {
  blockId: string;
  blockType: string;
  errorType: 'syntax' | 'logic' | 'connection' | 'data' | 'performance';
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  aiSuggestion: string;
  codeContext?: string;
}

export interface SimulationResult {
  success: boolean;
  errors: WorkflowError[];
  warnings: WorkflowError[];
  performance: {
    estimatedRuntime: number;
    memoryUsage: number;
    cpuIntensity: number;
  };
  dataFlow: {
    [blockId: string]: {
      inputShape?: any;
      outputShape?: any;
      dataType?: string;
    };
  };
  aiReview: {
    overallScore: number;
    suggestions: string[];
    optimizations: string[];
  };
}

export interface TokenOptimizationConfig {
  useCompression: boolean;
  useFunctionCalling: boolean;
  batchRequests: boolean;
  maxPromptLength: number;
  compressionRatio: number;
}

export interface APIUsageStats {
  totalTokensUsed: number;
  totalCost: number;
  requestCount: number;
  cacheHitRate: number;
  avgTokensPerRequest: number;
  remainingBudget: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export class OpenAIEfficiencyService {
  private promptCache: Map<string, PromptCacheEntry> = new Map();
  private similarityThreshold = 0.85;
  private maxCacheSize = 10000;
  private totalBudget = 25.0; // $25 in credits
  private usedBudget = 0;
  private requestQueue: Array<{ prompt: string; resolve: Function; reject: Function }> = [];
  private isProcessingQueue = false;
  
  private readonly PRICING = {
    'gpt-4o-mini': {
      input: 0.00015 / 1000,  // $0.15 per 1M input tokens
      output: 0.0006 / 1000   // $0.60 per 1M output tokens
    },
    'gpt-4o': {
      input: 0.005 / 1000,    // $5.00 per 1M input tokens
      output: 0.015 / 1000    // $15.00 per 1M output tokens
    }
  };

  constructor() {
    this.loadCacheFromStorage();
    this.loadUsageStats();
  }

  // Smart Caching System
  async generateWithCache(prompt: string, options: any = {}): Promise<any> {
    const promptHash = this.hashPrompt(prompt);
    
    // Check exact match first
    const exactMatch = this.promptCache.get(promptHash);
    if (exactMatch) {
      console.log('🎯 Cache hit (exact match)');
      return exactMatch.response;
    }

    // Check similarity matches
    const similarMatch = this.findSimilarPrompt(prompt);
    if (similarMatch && similarMatch.similarity! > this.similarityThreshold) {
      console.log(`🎯 Cache hit (similarity: ${(similarMatch.similarity! * 100).toFixed(1)}%)`);
      return similarMatch.response;
    }

    // Check budget before making API call
    if (this.usedBudget >= this.totalBudget * 0.95) {
      console.warn('⚠️ Budget limit reached, using fallback generation');
      return this.generateFallback(prompt, options);
    }

    // Make API call with optimization
    const optimizedPrompt = this.optimizePrompt(prompt, options);
    return this.queueRequest(optimizedPrompt, options);
  }

  // Prompt Optimization
  private optimizePrompt(prompt: string, options: any): string {
    let optimized = prompt;

    // Remove redundant phrases
    optimized = optimized.replace(/please\s+/gi, '');
    optimized = optimized.replace(/kindly\s+/gi, '');
    optimized = optimized.replace(/\s+/g, ' ');

    // Use abbreviations for common terms
    optimized = optimized.replace(/artificial intelligence/gi, 'AI');
    optimized = optimized.replace(/machine learning/gi, 'ML');
    optimized = optimized.replace(/natural language processing/gi, 'NLP');

    // Compress system prompts
    if (options.systemPrompt) {
      optimized = this.compressSystemPrompt(options.systemPrompt) + '\n' + optimized;
    }

    return optimized.trim();
  }

  private compressSystemPrompt(systemPrompt: string): string {
    // Ultra-compressed system prompt for block generation
    return `Generate µLM workflow block. Output JSON only. Format:
{
  "name": "BlockName",
  "type": "category",
  "description": "Brief desc",
  "config": {parameters},
  "code": "implementation"
}`;
  }

  private compressPrompt(prompt: string): string {
    // Advanced prompt compression for maximum token efficiency
    let compressed = prompt;

    // Remove redundant whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();

    // Remove common filler words
    compressed = compressed.replace(/\b(please|kindly|could you|would you|can you)\b/gi, '');

    // Use abbreviations
    compressed = compressed.replace(/\bmachine learning\b/gi, 'ML');
    compressed = compressed.replace(/\bartificial intelligence\b/gi, 'AI');
    compressed = compressed.replace(/\bnatural language processing\b/gi, 'NLP');
    compressed = compressed.replace(/\bdeep learning\b/gi, 'DL');

    // Simplify instructions
    compressed = compressed.replace(/analyze and provide/gi, 'analyze:');
    compressed = compressed.replace(/check for/gi, 'check:');
    compressed = compressed.replace(/generate/gi, 'gen');
    compressed = compressed.replace(/implement/gi, 'impl');

    // Remove excessive punctuation
    compressed = compressed.replace(/[.]{2,}/g, '.');
    compressed = compressed.replace(/[!]{2,}/g, '!');

    return compressed.trim();
  }

  // Queue Management for Batch Processing
  private async queueRequest(prompt: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ prompt, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    try {
      // Process up to 5 requests in batch
      const batch = this.requestQueue.splice(0, 5);
      
      if (batch.length === 1) {
        // Single request
        const result = await this.makeAPICall(batch[0].prompt, {});
        batch[0].resolve(result);
      } else {
        // Batch requests
        const results = await this.makeBatchAPICall(batch.map(r => r.prompt));
        batch.forEach((request, index) => {
          request.resolve(results[index]);
        });
      }
    } catch (error) {
      // Handle errors for all requests in batch
      this.requestQueue.forEach(req => req.reject(error));
    } finally {
      this.isProcessingQueue = false;
      
      // Process remaining queue
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000); // Rate limiting
      }
    }
  }

  // Optimized API Calls
  private async makeAPICall(prompt: string, options: any): Promise<any> {
    try {
      // Simulate API call (replace with actual OpenAI call)
      const response = await this.simulateOpenAICall(prompt, options);
      
      // Cache the response
      const cacheEntry: PromptCacheEntry = {
        hash: this.hashPrompt(prompt),
        prompt,
        response,
        timestamp: Date.now(),
        usage: response.usage
      };
      
      this.cacheResponse(cacheEntry);
      this.updateUsageStats(response.usage);
      
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      return this.generateFallback(prompt, options);
    }
  }

  private async makeBatchAPICall(prompts: string[]): Promise<any[]> {
    // Batch multiple prompts into a single API call
    const batchPrompt = this.createBatchPrompt(prompts);
    const response = await this.makeAPICall(batchPrompt, { batch: true });
    
    // Parse batch response
    return this.parseBatchResponse(response, prompts.length);
  }

  private createBatchPrompt(prompts: string[]): string {
    return `Generate responses for the following ${prompts.length} requests:

${prompts.map((prompt, index) => `Request ${index + 1}: ${prompt}`).join('\n\n')}

Provide responses in JSON array format with each response corresponding to the request number.`;
  }

  // Fallback Strategies
  private generateFallback(prompt: string, options: any): any {
    console.log('🔄 Using fallback generation');
    
    // Template-based generation
    if (prompt.includes('block') || prompt.includes('component')) {
      return this.generateTemplateBlock(prompt);
    }

    // Community library fallback
    const communityBlock = this.findCommunityBlock(prompt);
    if (communityBlock) {
      return communityBlock;
    }

    // Simple pattern matching
    return this.generatePatternBasedBlock(prompt);
  }

  private generateTemplateBlock(prompt: string): any {
    // Extract block type from prompt
    const blockType = this.extractBlockType(prompt);
    
    const templates = {
      'data-input': {
        name: 'Data Input',
        type: 'input',
        description: 'Handles data input for the workflow',
        config: { inputType: 'text', validation: true },
        code: 'def process_input(data): return data'
      },
      'text-processor': {
        name: 'Text Processor',
        type: 'nlp',
        description: 'Processes text data',
        config: { model: 'default', maxLength: 512 },
        code: 'def process_text(text): return text.lower().strip()'
      },
      'data-output': {
        name: 'Data Output',
        type: 'output',
        description: 'Outputs processed data',
        config: { format: 'json', validation: true },
        code: 'def output_data(data): return {"result": data}'
      }
    };

    return templates[blockType] || templates['text-processor'];
  }

  // Similarity Detection
  private findSimilarPrompt(prompt: string): PromptCacheEntry | null {
    let bestMatch: PromptCacheEntry | null = null;
    let highestSimilarity = 0;

    for (const [hash, entry] of this.promptCache) {
      const similarity = this.calculateSimilarity(prompt, entry.prompt);
      if (similarity > highestSimilarity && similarity > this.similarityThreshold) {
        highestSimilarity = similarity;
        bestMatch = { ...entry, similarity };
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for now (can be enhanced with embeddings)
    const set1 = new Set(text1.toLowerCase().split(/\s+/));
    const set2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  // Cache Management
  private cacheResponse(entry: PromptCacheEntry): void {
    // Implement LRU eviction if cache is full
    if (this.promptCache.size >= this.maxCacheSize) {
      this.evictOldestEntry();
    }

    this.promptCache.set(entry.hash, entry);
    this.saveCacheToStorage();
  }

  private evictOldestEntry(): void {
    let oldestTimestamp = Date.now();
    let oldestHash = '';

    for (const [hash, entry] of this.promptCache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestHash = hash;
      }
    }

    if (oldestHash) {
      this.promptCache.delete(oldestHash);
    }
  }

  // Utility Methods
  private hashPrompt(prompt: string): string {
    // Simple hash function (replace with crypto.subtle.digest in production)
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private extractBlockType(prompt: string): string {
    const prompt_lower = prompt.toLowerCase();
    
    if (prompt_lower.includes('input') || prompt_lower.includes('data source')) {
      return 'data-input';
    }
    if (prompt_lower.includes('output') || prompt_lower.includes('result')) {
      return 'data-output';
    }
    if (prompt_lower.includes('process') || prompt_lower.includes('transform')) {
      return 'text-processor';
    }
    
    return 'text-processor';
  }

  // Storage Management
  private loadCacheFromStorage(): void {
    try {
      const cached = localStorage.getItem('mulm_prompt_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.promptCache = new Map(data);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveCacheToStorage(): void {
    try {
      const data = Array.from(this.promptCache.entries());
      localStorage.setItem('mulm_prompt_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private loadUsageStats(): void {
    try {
      const stats = localStorage.getItem('mulm_usage_stats');
      if (stats) {
        const data = JSON.parse(stats);
        this.usedBudget = data.usedBudget || 0;
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }
  }

  private updateUsageStats(usage: any): void {
    const cost = (usage.promptTokens * this.PRICING['gpt-4o-mini'].input) + 
                 (usage.completionTokens * this.PRICING['gpt-4o-mini'].output);
    
    this.usedBudget += cost;
    
    try {
      localStorage.setItem('mulm_usage_stats', JSON.stringify({
        usedBudget: this.usedBudget,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save usage stats:', error);
    }
  }

  // API Simulation (replace with actual OpenAI integration)
  private async simulateOpenAICall(prompt: string, options: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate token usage
    const promptTokens = Math.floor(prompt.length / 4); // Rough estimation
    const completionTokens = Math.floor(Math.random() * 200) + 50;
    
    return {
      response: this.generateSimulatedResponse(prompt),
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      }
    };
  }

  private generateSimulatedResponse(prompt: string): any {
    // Generate a realistic response based on prompt
    return this.generateTemplateBlock(prompt);
  }

  private parseBatchResponse(response: any, expectedCount: number): any[] {
    // Parse the batch response into individual responses
    const results: any[] = [];
    for (let i = 0; i < expectedCount; i++) {
      results.push(response.response);
    }
    return results;
  }

  private findCommunityBlock(prompt: string): any | null {
    // Simulate community block search
    return null;
  }

  private generatePatternBasedBlock(prompt: string): any {
    return this.generateTemplateBlock(prompt);
  }

  // Public API Methods
  getUsageStats(): APIUsageStats {
    const cacheHitRate = this.promptCache.size > 0 ? 0.75 : 0; // Simulated
    
    return {
      totalTokensUsed: Math.floor(this.usedBudget / this.PRICING['gpt-4o-mini'].input),
      totalCost: this.usedBudget,
      requestCount: this.promptCache.size,
      cacheHitRate,
      avgTokensPerRequest: this.promptCache.size > 0 ? 150 : 0,
      remainingBudget: this.totalBudget - this.usedBudget
    };
  }

  getCacheStats(): CacheStats {
    const entries = Array.from(this.promptCache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      totalEntries: this.promptCache.size,
      hitRate: 0.75, // Simulated
      memoryUsage: this.promptCache.size * 1024, // Rough estimation
      oldestEntry: Math.min(...timestamps) || 0,
      newestEntry: Math.max(...timestamps) || 0
    };
  }

  clearCache(): void {
    this.promptCache.clear();
    localStorage.removeItem('mulm_prompt_cache');
  }

  setBudget(budget: number): void {
    this.totalBudget = budget;
  }

  exportCache(): string {
    return JSON.stringify(Array.from(this.promptCache.entries()));
  }

  importCache(data: string): void {
    try {
      const entries = JSON.parse(data);
      this.promptCache = new Map(entries);
      this.saveCacheToStorage();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }

  // === WORKFLOW SIMULATION & ERROR DETECTION ===

  /**
   * Intelligent workflow simulation with AI-powered error detection
   */
  async simulateWorkflow(nodes: Node[], edges: Edge[]): Promise<SimulationResult> {
    console.log('🔍 Starting intelligent workflow simulation...');
    
    const errors: WorkflowError[] = [];
    const warnings: WorkflowError[] = [];

    try {
      // 1. Validate workflow structure
      const structureErrors = await this.validateWorkflowStructure(nodes, edges);
      errors.push(...structureErrors);

      // 2. Analyze data flow and connections
      const dataFlowResult = await this.analyzeDataFlow(nodes, edges);
      errors.push(...dataFlowResult.errors);
      warnings.push(...dataFlowResult.warnings);

      // 3. Perform AI-powered code review
      const aiReview = await this.performAICodeReview(nodes);

      // 4. Simulate performance characteristics
      const performance = this.estimatePerformance(nodes, edges);

      // 5. Generate AI suggestions for improvements
      const suggestions = await this.generateOptimizationSuggestions(nodes, edges, errors);

      const result: SimulationResult = {
        success: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        warnings,
        performance,
        dataFlow: dataFlowResult.dataFlow,
        aiReview: {
          overallScore: this.calculateOverallScore(errors, warnings),
          suggestions: aiReview.suggestions,
          optimizations: suggestions
        }
      };

      console.log(`✅ Simulation complete: ${result.success ? 'PASSED' : 'FAILED'}`);
      console.log(`📊 Found ${errors.length} errors, ${warnings.length} warnings`);
      
      return result;

    } catch (error) {
      console.error('❌ Simulation failed:', error);
      return {
        success: false,
        errors: [{
          blockId: 'system',
          blockType: 'system',
          errorType: 'logic',
          message: `Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          aiSuggestion: 'Check workflow structure and try again'
        }],
        warnings: [],
        performance: { estimatedRuntime: 0, memoryUsage: 0, cpuIntensity: 0 },
        dataFlow: {},
        aiReview: { overallScore: 0, suggestions: [], optimizations: [] }
      };
    }
  }

  /**
   * Validate workflow structure and connections
   */
  private async validateWorkflowStructure(nodes: Node[], edges: Edge[]): Promise<WorkflowError[]> {
    const errors: WorkflowError[] = [];

    // Check for orphaned nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && nodes.length > 1) {
        errors.push({
          blockId: node.id,
          blockType: node.type || 'unknown',
          errorType: 'connection',
          message: 'Block is not connected to the workflow',
          severity: 'warning',
          aiSuggestion: 'Connect this block to the workflow or remove it if not needed'
        });
      }
    });

    // Check for circular dependencies
    const cycles = this.detectCycles(nodes, edges);
    cycles.forEach(cycle => {
      errors.push({
        blockId: cycle.join('->'),
        blockType: 'workflow',
        errorType: 'logic',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        severity: 'error',
        aiSuggestion: 'Remove circular dependencies by restructuring the workflow'
      });
    });

    // Validate input/output compatibility
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const compatibility = await this.checkNodeCompatibility(sourceNode, targetNode);
        if (!compatibility.compatible) {
          errors.push({
            blockId: edge.target,
            blockType: targetNode.type || 'unknown',
            errorType: 'data',
            message: compatibility.reason,
            severity: 'error',
            aiSuggestion: compatibility.suggestion
          });
        }
      }
    }

    return errors;
  }

  /**
   * Analyze data flow through the workflow
   */
  private async analyzeDataFlow(nodes: Node[], edges: Edge[]): Promise<{
    errors: WorkflowError[];
    warnings: WorkflowError[];
    dataFlow: { [blockId: string]: any };
  }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowError[] = [];
    const dataFlow: { [blockId: string]: any } = {};

    // Use AI to analyze data flow with minimal token usage
    const prompt = this.compressPrompt(`
Analyze data flow for workflow:
Nodes: ${nodes.map(n => `${n.id}:${n.type}`).join(', ')}
Edges: ${edges.map(e => `${e.source}->${e.target}`).join(', ')}

Check for data type mismatches and shape incompatibilities.
Format: {blockId: {inputShape, outputShape, dataType, issues}}
`);

    try {
      const response = await this.generateWithCache(prompt, {
        temperature: 0.1,
        maxTokens: 500,
        model: 'gpt-4o-mini'
      });

      // Parse AI response and convert to structured format
      const analysis = this.parseDataFlowAnalysis(response.content);
      
      analysis.forEach(item => {
        dataFlow[item.blockId] = {
          inputShape: item.inputShape,
          outputShape: item.outputShape,
          dataType: item.dataType
        };

        if (item.issues) {
          item.issues.forEach(issue => {
            errors.push({
              blockId: item.blockId,
              blockType: nodes.find(n => n.id === item.blockId)?.type || 'unknown',
              errorType: 'data',
              message: issue,
              severity: 'error',
              aiSuggestion: 'Ensure data types and shapes are compatible between connected blocks'
            });
          });
        }
      });

    } catch (error) {
      // Fallback to basic analysis if AI fails
      console.warn('AI data flow analysis failed, using fallback');
      nodes.forEach(node => {
        dataFlow[node.id] = {
          inputShape: 'unknown',
          outputShape: 'unknown',
          dataType: 'unknown'
        };
      });
    }

    return { errors, warnings, dataFlow };
  }

  /**
   * AI-powered code review of individual blocks
   */
  private async performAICodeReview(nodes: Node[]): Promise<{ suggestions: string[] }> {
    const suggestions: string[] = [];

    // Batch review multiple nodes to save tokens
    const nodeBatches = this.batchNodes(nodes, 3);

    for (const batch of nodeBatches) {
      const prompt = this.compressPrompt(`
Review these workflow blocks for best practices:
${batch.map(n => `${n.id}: ${JSON.stringify(n.data)}`).join('\n')}

Provide 2-3 optimization suggestions focusing on:
- Performance improvements
- Code quality
- Error handling
- Data efficiency
`);

      try {
        const response = await this.generateWithCache(prompt, {
          temperature: 0.2,
          maxTokens: 300,
          model: 'gpt-4o-mini'
        });

        const batchSuggestions = this.parseSuggestions(response.content);
        suggestions.push(...batchSuggestions);

      } catch (error) {
        console.warn('AI code review failed for batch, using fallback suggestions');
        suggestions.push('Consider adding error handling to workflow blocks');
        suggestions.push('Optimize data processing for better performance');
      }
    }

    return { suggestions };
  }

  /**
   * Generate optimization suggestions based on errors and workflow analysis
   */
  private async generateOptimizationSuggestions(
    nodes: Node[], 
    edges: Edge[], 
    errors: WorkflowError[]
  ): Promise<string[]> {
    if (errors.length === 0) {
      return ['Workflow looks good! Consider adding monitoring and logging.'];
    }

    const errorSummary = errors.map(e => `${e.errorType}: ${e.message}`).slice(0, 3).join('; ');
    
    const prompt = this.compressPrompt(`
Workflow has errors: ${errorSummary}
Generate 3 specific optimization suggestions to fix these issues.
Focus on practical, actionable solutions.
`);

    try {
      const response = await this.generateWithCache(prompt, {
        temperature: 0.3,
        maxTokens: 200,
        model: 'gpt-4o-mini'
      });

      return this.parseSuggestions(response.content);

    } catch (error) {
      // Fallback suggestions based on error types
      const fallbackSuggestions = new Set<string>();
      
      errors.forEach(error => {
        switch (error.errorType) {
          case 'connection':
            fallbackSuggestions.add('Review and fix block connections');
            break;
          case 'data':
            fallbackSuggestions.add('Ensure data types match between connected blocks');
            break;
          case 'logic':
            fallbackSuggestions.add('Simplify workflow logic and remove circular dependencies');
            break;
          default:
            fallbackSuggestions.add('Review workflow structure and block configurations');
        }
      });

      return Array.from(fallbackSuggestions);
    }
  }

  // === HELPER METHODS ===

  private detectCycles(nodes: Node[], edges: Edge[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const adjacencyList: { [key: string]: string[] } = {};
    edges.forEach(edge => {
      if (!adjacencyList[edge.source]) adjacencyList[edge.source] = [];
      adjacencyList[edge.source].push(edge.target);
    });

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat(nodeId));
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const neighbors = adjacencyList[nodeId] || [];
      neighbors.forEach(neighbor => {
        dfs(neighbor, [...path, nodeId]);
      });

      recursionStack.delete(nodeId);
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }

  private async checkNodeCompatibility(sourceNode: Node, targetNode: Node): Promise<{
    compatible: boolean;
    reason: string;
    suggestion: string;
  }> {
    // Basic compatibility check with fallback
    const sourceType = sourceNode.type || 'unknown';
    const targetType = targetNode.type || 'unknown';

    // Define basic compatibility rules
    const incompatiblePairs = [
      ['output', 'input'],  // Output should not feed into input
      ['text', 'image'],    // Type mismatch examples
    ];

    for (const [src, tgt] of incompatiblePairs) {
      if (sourceType.includes(src) && targetType.includes(tgt)) {
        return {
          compatible: false,
          reason: `${sourceType} output is not compatible with ${targetType} input`,
          suggestion: `Add a data transformation block between ${sourceNode.id} and ${targetNode.id}`
        };
      }
    }

    return {
      compatible: true,
      reason: 'Nodes appear compatible',
      suggestion: ''
    };
  }

  private estimatePerformance(nodes: Node[], edges: Edge[]): {
    estimatedRuntime: number;
    memoryUsage: number;
    cpuIntensity: number;
  } {
    // Simple heuristic-based performance estimation
    const nodeComplexity = nodes.reduce((acc, node) => {
      const type = node.type || '';
      if (type.includes('ml') || type.includes('neural')) return acc + 10;
      if (type.includes('data') || type.includes('transform')) return acc + 3;
      return acc + 1;
    }, 0);

    const connectionComplexity = edges.length * 0.5;
    const totalComplexity = nodeComplexity + connectionComplexity;

    return {
      estimatedRuntime: Math.max(1, totalComplexity * 0.1), // seconds
      memoryUsage: Math.max(50, totalComplexity * 10), // MB
      cpuIntensity: Math.min(100, totalComplexity * 5) // percentage
    };
  }

  private calculateOverallScore(errors: WorkflowError[], warnings: WorkflowError[]): number {
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = warnings.length;
    
    const baseScore = 100;
    const errorPenalty = errorCount * 20;
    const warningPenalty = warningCount * 5;
    
    return Math.max(0, baseScore - errorPenalty - warningPenalty);
  }

  private batchNodes(nodes: Node[], batchSize: number): Node[][] {
    const batches: Node[][] = [];
    for (let i = 0; i < nodes.length; i += batchSize) {
      batches.push(nodes.slice(i, i + batchSize));
    }
    return batches;
  }

  private parseDataFlowAnalysis(content: string): Array<{
    blockId: string;
    inputShape?: any;
    outputShape?: any;
    dataType?: string;
    issues?: string[];
  }> {
    // Simple parsing with fallback
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private parseSuggestions(content: string): string[] {
    // Extract suggestions from AI response
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  }

  /**
   * Enhanced community caching system
   */
  shareToCommunityCahe(prompt: string, response: any): void {
    const hash = this.hashPrompt(prompt);
    const entry: PromptCacheEntry = {
      hash,
      prompt,
      response,
      timestamp: Date.now(),
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      sharedAcrossUsers: true
    };

    this.promptCache.set(hash, entry);
    this.saveCacheToStorage();
  }

  searchCommunityCache(prompt: string): PromptCacheEntry | null {
    const hash = this.hashPrompt(prompt);
    
    // First try exact match
    const exactMatch = this.promptCache.get(hash);
    if (exactMatch?.sharedAcrossUsers) return exactMatch;

    // Then try similarity search
    for (const [_, entry] of this.promptCache) {
      if (entry.sharedAcrossUsers && this.calculateSimilarity(prompt, entry.prompt) > 0.9) {
        return entry;
      }
    }

    return null;
  }
}

export const openAIEfficiencyService = new OpenAIEfficiencyService();
