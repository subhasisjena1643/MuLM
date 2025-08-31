// @ts-nocheck
// Intelligent Workflow Simulation Engine
// AI-powered workflow testing and error detection with $25 budget optimization

import { Node, Edge } from 'reactflow';
import { openAIEfficiencyService, SimulationResult, WorkflowError } from '../services/OpenAIEfficiencyService';

export interface SimulationOptions {
  enableAIReview: boolean;
  performanceAnalysis: boolean;
  deepCodeAnalysis: boolean;
  communityPatternMatching: boolean;
  budgetLimit: number;
}

export interface CodeAnalysisResult {
  blockId: string;
  sourceCode: string;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    aiSuggestion: string;
  }>;
  suggestions: string[];
  qualityScore: number;
}

export class WorkflowSimulationEngine {
  private simulationHistory: Map<string, SimulationResult> = new Map();
  private patternLibrary: Map<string, any> = new Map();

  /**
   * Main simulation entry point - this is what gets activated from the UI
   */
  async simulateWorkflow(
    nodes: Node[], 
    edges: Edge[], 
    options: SimulationOptions = {
      enableAIReview: true,
      performanceAnalysis: true,
      deepCodeAnalysis: true,
      communityPatternMatching: true,
      budgetLimit: 2.0 // Reserve $2 from $25 budget for simulation
    }
  ): Promise<SimulationResult> {
    console.log('🚀 Starting intelligent workflow simulation...');
    console.log(`📊 Analyzing ${nodes.length} blocks and ${edges.length} connections`);

    try {
      // Generate unique simulation ID for tracking
      const simulationId = this.generateSimulationId(nodes, edges);
      
      // Check if we have a cached result
      const cachedResult = this.simulationHistory.get(simulationId);
      if (cachedResult) {
        console.log('⚡ Using cached simulation result');
        return cachedResult;
      }

      // Perform comprehensive simulation
      const result = await openAIEfficiencyService.simulateWorkflow(nodes, edges);

      // Enhanced analysis if budget allows
      if (options.deepCodeAnalysis && openAIEfficiencyService.getUsageStats().remainingBudget > options.budgetLimit) {
        await this.performDeepCodeAnalysis(nodes, result);
      }

      // Pattern matching against community library
      if (options.communityPatternMatching) {
        await this.matchCommunityPatterns(nodes, edges, result);
      }

      // Cache the result
      this.simulationHistory.set(simulationId, result);

      // Log summary
      this.logSimulationSummary(result);

      return result;

    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  }

  /**
   * Deep code analysis with line-by-line AI review
   */
  private async performDeepCodeAnalysis(nodes: Node[], result: SimulationResult): Promise<void> {
    console.log('🔍 Performing deep code analysis...');

    for (const node of nodes) {
      try {
        const sourceCode = this.extractSourceCode(node);
        if (!sourceCode) continue;

        const analysis = await this.analyzeBlockCode(node.id, sourceCode);
        
        // Convert analysis results to workflow errors
        analysis.errors.forEach(error => {
          result.errors.push({
            blockId: node.id,
            blockType: node.type || 'unknown',
            errorType: 'syntax',
            line: error.line,
            column: error.column,
            message: error.message,
            severity: error.severity,
            aiSuggestion: error.aiSuggestion,
            codeContext: this.getCodeContext(sourceCode, error.line)
          });
        });

        // Add AI suggestions
        result.aiReview.suggestions.push(...analysis.suggestions);

      } catch (error) {
        console.warn(`Failed to analyze block ${node.id}:`, error);
      }
    }
  }

  /**
   * AI-powered code analysis for individual blocks
   */
  private async analyzeBlockCode(blockId: string, sourceCode: string): Promise<CodeAnalysisResult> {
    const prompt = `Analyze this µLM workflow block code for errors and improvements:

\`\`\`
${sourceCode.slice(0, 1000)} // Truncated for token efficiency
\`\`\`

Find:
1. Syntax errors with line numbers
2. Logic issues
3. Performance problems
4. Security concerns

Format: JSON
{
  "errors": [{"line": 1, "column": 1, "message": "...", "severity": "error", "suggestion": "..."}],
  "suggestions": ["..."],
  "score": 85
}`;

    try {
      const response = await openAIEfficiencyService.generateWithCache(prompt, {
        temperature: 0.1,
        maxTokens: 400,
        model: 'gpt-4o-mini'
      });

      const analysis = JSON.parse(response.content);
      
      return {
        blockId,
        sourceCode,
        errors: analysis.errors || [],
        suggestions: analysis.suggestions || [],
        qualityScore: analysis.score || 50
      };

    } catch (error) {
      console.warn(`AI code analysis failed for ${blockId}, using fallback`);
      return {
        blockId,
        sourceCode,
        errors: [],
        suggestions: ['Consider adding error handling and input validation'],
        qualityScore: 70
      };
    }
  }

  /**
   * Match workflow patterns against community library
   */
  private async matchCommunityPatterns(nodes: Node[], edges: Edge[], result: SimulationResult): Promise<void> {
    console.log('🔍 Matching against community patterns...');

    const workflowPattern = this.generateWorkflowPattern(nodes, edges);
    
    // Check against known patterns
    for (const [patternId, pattern] of this.patternLibrary) {
      const similarity = this.calculatePatternSimilarity(workflowPattern, pattern);
      
      if (similarity > 0.8) {
        result.aiReview.suggestions.push(
          `Similar workflow pattern found: ${patternId}. Consider using optimizations from this pattern.`
        );
        
        if (pattern.optimizations) {
          result.aiReview.optimizations.push(...pattern.optimizations);
        }
      }
    }

    // Use AI to find patterns in minimal tokens
    if (this.patternLibrary.size < 50) { // Only if library is small
      try {
        const patternPrompt = `Workflow pattern: ${nodes.length} nodes, ${edges.length} edges.
Types: ${nodes.map(n => n.type).join(',')}
Common pattern? Optimizations?`;

        const response = await openAIEfficiencyService.generateWithCache(patternPrompt, {
          temperature: 0.2,
          maxTokens: 150,
          model: 'gpt-4o-mini'
        });

        const suggestions = response.content.split('\n').filter(line => line.trim());
        result.aiReview.optimizations.push(...suggestions);

      } catch (error) {
        console.warn('Pattern matching failed, using cached patterns only');
      }
    }
  }

  /**
   * Extract source code from workflow blocks
   */
  private extractSourceCode(node: Node): string | null {
    // Try different ways to extract code from the node
    const data = node.data;
    
    if (data?.code) return data.code;
    if (data?.sourceCode) return data.sourceCode;
    if (data?.config?.code) return data.config.code;
    if (data?.block?.code) return data.block.code;
    
    // Generate basic code template if no code found
    if (node.type) {
      return this.generateCodeTemplate(node.type, data);
    }
    
    return null;
  }

  /**
   * Generate basic code template for block types
   */
  private generateCodeTemplate(blockType: string, data: any): string {
    switch (blockType) {
      case 'input':
        return `# Data input block\nimport pandas as pd\ndata = pd.read_csv('${data?.path || 'input.csv'}')\n`;
      
      case 'transform':
        return `# Data transformation block\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ndata_scaled = scaler.fit_transform(data)\n`;
      
      case 'ml':
      case 'mlAlgorithm':
        return `# Machine learning block\nfrom sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\n`;
      
      case 'output':
        return `# Output block\nimport json\nwith open('output.json', 'w') as f:\n    json.dump(results, f)\n`;
      
      default:
        return `# ${blockType} block\n# TODO: Implement ${blockType} functionality\npass\n`;
    }
  }

  /**
   * Get code context around a specific line for error reporting
   */
  private getCodeContext(sourceCode: string, errorLine: number): string {
    const lines = sourceCode.split('\n');
    const start = Math.max(0, errorLine - 3);
    const end = Math.min(lines.length, errorLine + 2);
    
    return lines.slice(start, end)
      .map((line, index) => {
        const lineNum = start + index + 1;
        const marker = lineNum === errorLine ? '❌' : '  ';
        return `${marker} ${lineNum}: ${line}`;
      })
      .join('\n');
  }

  /**
   * Generate a pattern signature for workflow matching
   */
  private generateWorkflowPattern(nodes: Node[], edges: Edge[]): any {
    const nodeTypes = nodes.map(n => n.type).sort();
    const connections = edges.map(e => ({ 
      from: nodes.find(n => n.id === e.source)?.type || 'unknown',
      to: nodes.find(n => n.id === e.target)?.type || 'unknown'
    }));

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes,
      connections,
      complexity: this.calculateComplexity(nodes, edges)
    };
  }

  /**
   * Calculate pattern similarity between workflows
   */
  private calculatePatternSimilarity(pattern1: any, pattern2: any): number {
    // Simple similarity based on structure
    const nodeCountSim = 1 - Math.abs(pattern1.nodeCount - pattern2.nodeCount) / Math.max(pattern1.nodeCount, pattern2.nodeCount);
    const typesSim = this.calculateArraySimilarity(pattern1.nodeTypes, pattern2.nodeTypes);
    const complexitySim = 1 - Math.abs(pattern1.complexity - pattern2.complexity) / Math.max(pattern1.complexity, pattern2.complexity);
    
    return (nodeCountSim + typesSim + complexitySim) / 3;
  }

  /**
   * Calculate array similarity for pattern matching
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate workflow complexity score
   */
  private calculateComplexity(nodes: Node[], edges: Edge[]): number {
    let complexity = 0;
    
    // Node complexity
    nodes.forEach(node => {
      const type = node.type || '';
      if (type.includes('ml') || type.includes('neural')) complexity += 5;
      else if (type.includes('transform') || type.includes('data')) complexity += 2;
      else complexity += 1;
    });
    
    // Connection complexity
    complexity += edges.length * 0.5;
    
    // Branching complexity
    const nodeConnections = new Map<string, number>();
    edges.forEach(edge => {
      nodeConnections.set(edge.source, (nodeConnections.get(edge.source) || 0) + 1);
    });
    
    nodeConnections.forEach(count => {
      if (count > 2) complexity += count - 2; // Penalty for high branching
    });
    
    return complexity;
  }

  /**
   * Generate unique simulation ID for caching
   */
  private generateSimulationId(nodes: Node[], edges: Edge[]): string {
    const nodeHash = nodes.map(n => `${n.id}:${n.type}`).sort().join('|');
    const edgeHash = edges.map(e => `${e.source}->${e.target}`).sort().join('|');
    return btoa(`${nodeHash}:${edgeHash}`).slice(0, 16);
  }

  /**
   * Log simulation summary
   */
  private logSimulationSummary(result: SimulationResult): void {
    console.log('\n📊 Simulation Summary:');
    console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    console.log(`Overall Score: ${result.aiReview.overallScore}/100`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 Critical Issues:');
      result.errors.slice(0, 3).forEach(error => {
        console.log(`  • ${error.blockId}: ${error.message}`);
        if (error.line) console.log(`    Line ${error.line}: ${error.aiSuggestion}`);
      });
    }
    
    if (result.aiReview.suggestions.length > 0) {
      console.log('\n💡 AI Suggestions:');
      result.aiReview.suggestions.slice(0, 3).forEach(suggestion => {
        console.log(`  • ${suggestion}`);
      });
    }

    // Budget tracking
    const stats = openAIEfficiencyService.getUsageStats();
    console.log(`\n💰 Budget: $${stats.totalCost.toFixed(4)} used, $${stats.remainingBudget.toFixed(2)} remaining`);
  }

  /**
   * Add community patterns to improve future simulations
   */
  addCommunityPattern(patternId: string, pattern: any): void {
    this.patternLibrary.set(patternId, pattern);
  }

  /**
   * Get simulation history for analytics
   */
  getSimulationHistory(): Array<{ id: string; result: SimulationResult }> {
    return Array.from(this.simulationHistory.entries()).map(([id, result]) => ({ id, result }));
  }

  /**
   * Clear simulation cache to free memory
   */
  clearCache(): void {
    this.simulationHistory.clear();
    console.log('🧹 Simulation cache cleared');
  }
}

export const workflowSimulationEngine = new WorkflowSimulationEngine();

// Initialize with common patterns
workflowSimulationEngine.addCommunityPattern('data-ml-pipeline', {
  nodeTypes: ['input', 'transform', 'mlAlgorithm', 'output'],
  optimizations: [
    'Add data validation between input and transform',
    'Consider feature engineering before ML',
    'Add model evaluation metrics'
  ]
});

workflowSimulationEngine.addCommunityPattern('nlp-processing', {
  nodeTypes: ['input', 'text-preprocessing', 'nlp', 'output'],
  optimizations: [
    'Add text cleaning and tokenization',
    'Consider using pre-trained embeddings',
    'Add sentiment analysis validation'
  ]
});

workflowSimulationEngine.addCommunityPattern('computer-vision', {
  nodeTypes: ['input', 'image-preprocessing', 'cnn', 'output'],
  optimizations: [
    'Add image augmentation for better training',
    'Consider transfer learning',
    'Add visualization of predictions'
  ]
});
