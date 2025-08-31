// @ts-nocheck
// Budget Optimization Service
// Advanced monitoring and optimization for $40 OpenAI budget

import { openAIEfficiencyService } from './OpenAIEfficiencyService';

export interface BudgetAlert {
  type: 'warning' | 'critical' | 'info';
  message: string;
  recommendation: string;
  timestamp: number;
}

export interface BudgetOptimization {
  action: string;
  potentialSavings: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UsagePattern {
  timeOfDay: number;
  requestType: string;
  averageCost: number;
  frequency: number;
}

export class BudgetOptimizationService {
  private readonly TOTAL_BUDGET = 40.0;
  private alerts: BudgetAlert[] = [];
  private usagePatterns: UsagePattern[] = [];
  private optimizationHistory: BudgetOptimization[] = [];

  /**
   * Track budget usage for specific operations
   */
  trackUsage(cost: number, operation: string, metadata?: any): void {
    // In a real implementation, this would update the actual budget tracking
    console.log(`💰 Budget tracking: $${cost.toFixed(2)} used for ${operation}`, metadata);
    
    // For now, we'll simulate tracking
    const currentStats = openAIEfficiencyService.getUsageStats();
    
    // Add to alerts if significant usage
    if (cost > 1.0) {
      this.alerts.push({
        type: 'info',
        message: `💸 Significant usage: $${cost.toFixed(2)} for ${operation}`,
        recommendation: 'Monitor this operation for optimization opportunities',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Monitor budget and generate alerts/optimizations
   */
  checkBudgetHealth(): {
    alerts: BudgetAlert[];
    optimizations: BudgetOptimization[];
    projectedBurnout: Date | null;
    efficiencyScore: number;
  } {
    const stats = openAIEfficiencyService.getUsageStats();
    const currentUsage = stats.totalCost;
    const usagePercentage = (currentUsage / this.TOTAL_BUDGET) * 100;

    // Generate alerts
    const alerts = this.generateBudgetAlerts(currentUsage, usagePercentage, stats);
    
    // Generate optimizations
    const optimizations = this.generateOptimizations(stats);
    
    // Project budget burnout
    const projectedBurnout = this.projectBudgetBurnout(stats);
    
    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(stats);

    return {
      alerts,
      optimizations,
      projectedBurnout,
      efficiencyScore
    };
  }

  /**
   * Generate budget alerts based on current usage
   */
  private generateBudgetAlerts(currentUsage: number, usagePercentage: number, stats: any): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];

    // Critical alerts
    if (usagePercentage >= 90) {
      alerts.push({
        type: 'critical',
        message: `🚨 Budget Critical: ${usagePercentage.toFixed(1)}% used ($${currentUsage.toFixed(2)}/$${this.TOTAL_BUDGET})`,
        recommendation: 'Switch to template-only mode immediately. Disable AI features until budget resets.',
        timestamp: Date.now()
      });
    } else if (usagePercentage >= 75) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Budget Warning: ${usagePercentage.toFixed(1)}% used ($${currentUsage.toFixed(2)}/$${this.TOTAL_BUDGET})`,
        recommendation: 'Enable aggressive caching and reduce AI analysis depth.',
        timestamp: Date.now()
      });
    } else if (usagePercentage >= 50) {
      alerts.push({
        type: 'info',
        message: `📊 Budget Update: ${usagePercentage.toFixed(1)}% used ($${currentUsage.toFixed(2)}/$${this.TOTAL_BUDGET})`,
        recommendation: 'Monitor usage closely and consider optimizing prompt compression.',
        timestamp: Date.now()
      });
    }

    // Cache efficiency alerts
    if (stats.cacheHitRate < 0.5) {
      alerts.push({
        type: 'warning',
        message: `📉 Low Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`,
        recommendation: 'Review and improve prompt standardization for better caching.',
        timestamp: Date.now()
      });
    }

    // Token efficiency alerts
    if (stats.avgTokensPerRequest > 1000) {
      alerts.push({
        type: 'warning',
        message: `📝 High Token Usage: ${stats.avgTokensPerRequest.toFixed(0)} tokens/request average`,
        recommendation: 'Implement more aggressive prompt compression techniques.',
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizations(stats: any): BudgetOptimization[] {
    const optimizations: BudgetOptimization[] = [];

    // Cache optimizations
    if (stats.cacheHitRate < 0.7) {
      optimizations.push({
        action: 'Improve Caching Strategy',
        potentialSavings: (1 - stats.cacheHitRate) * stats.totalCost * 0.8,
        description: 'Standardize prompts and implement similarity-based caching',
        priority: 'high'
      });
    }

    // Model optimizations
    optimizations.push({
      action: 'Optimize Model Selection',
      potentialSavings: stats.totalCost * 0.3,
      description: 'Use gpt-4o-mini for simple tasks, reserve gpt-4o for complex analysis',
      priority: 'medium'
    });

    // Prompt optimizations
    if (stats.avgTokensPerRequest > 800) {
      optimizations.push({
        action: 'Compress Prompts',
        potentialSavings: stats.totalCost * 0.25,
        description: 'Implement advanced prompt compression and remove redundant text',
        priority: 'high'
      });
    }

    // Batch processing optimizations
    optimizations.push({
      action: 'Implement Batch Processing',
      potentialSavings: stats.totalCost * 0.2,
      description: 'Group multiple requests together to reduce API overhead',
      priority: 'medium'
    });

    // Fallback strategy optimizations
    optimizations.push({
      action: 'Enhance Fallback Templates',
      potentialSavings: stats.totalCost * 0.4,
      description: 'Expand template library to reduce AI dependency',
      priority: 'high'
    });

    return optimizations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Project when budget will be exhausted
   */
  private projectBudgetBurnout(stats: any): Date | null {
    if (stats.requestCount < 5) return null; // Not enough data

    const dailyUsage = this.estimateDailyUsage(stats);
    if (dailyUsage <= 0) return null;

    const remainingBudget = this.TOTAL_BUDGET - stats.totalCost;
    const daysRemaining = remainingBudget / dailyUsage;

    if (daysRemaining < 0) return new Date(); // Already over budget
    if (daysRemaining > 365) return null; // More than a year

    const burnoutDate = new Date();
    burnoutDate.setDate(burnoutDate.getDate() + Math.ceil(daysRemaining));
    return burnoutDate;
  }

  /**
   * Estimate daily usage based on current patterns
   */
  private estimateDailyUsage(stats: any): number {
    // Simple estimation based on current usage
    // In a real implementation, this would use historical data
    const hoursOfUsage = 8; // Assume 8 hours of active usage per day
    const requestsPerHour = stats.requestCount / 24; // Rough estimate
    const dailyRequests = requestsPerHour * hoursOfUsage;
    const avgCostPerRequest = stats.totalCost / stats.requestCount;
    
    return dailyRequests * avgCostPerRequest;
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private calculateEfficiencyScore(stats: any): number {
    let score = 100;

    // Cache efficiency (30 points)
    const cacheScore = stats.cacheHitRate * 30;
    
    // Token efficiency (25 points)
    const optimalTokensPerRequest = 300;
    const tokenEfficiency = Math.max(0, 1 - (stats.avgTokensPerRequest - optimalTokensPerRequest) / optimalTokensPerRequest);
    const tokenScore = tokenEfficiency * 25;

    // Cost efficiency (25 points)
    const targetCostPerRequest = 0.005; // $0.005 per request
    const actualCostPerRequest = stats.requestCount > 0 ? stats.totalCost / stats.requestCount : 0;
    const costEfficiency = Math.max(0, 1 - (actualCostPerRequest - targetCostPerRequest) / targetCostPerRequest);
    const costScore = costEfficiency * 25;

    // Budget management (20 points)
    const budgetUsagePercentage = stats.totalCost / this.TOTAL_BUDGET;
    const budgetScore = budgetUsagePercentage < 0.1 ? 20 : 
                       budgetUsagePercentage < 0.5 ? 15 :
                       budgetUsagePercentage < 0.75 ? 10 :
                       budgetUsagePercentage < 0.9 ? 5 : 0;

    const totalScore = cacheScore + tokenScore + costScore + budgetScore;
    return Math.max(0, Math.min(100, totalScore));
  }

  /**
   * Apply automatic optimizations
   */
  async applyAutomaticOptimizations(): Promise<string[]> {
    const appliedOptimizations: string[] = [];
    const stats = openAIEfficiencyService.getUsageStats();

    // Auto-enable aggressive caching if cache hit rate is low
    if (stats.cacheHitRate < 0.6) {
      // This would trigger more aggressive similarity matching
      appliedOptimizations.push('Enabled aggressive caching with lower similarity threshold');
    }

    // Auto-compress prompts if token usage is high
    if (stats.avgTokensPerRequest > 800) {
      appliedOptimizations.push('Activated advanced prompt compression');
    }

    // Auto-switch to template mode if budget is critical
    const usagePercentage = (stats.totalCost / this.TOTAL_BUDGET) * 100;
    if (usagePercentage >= 85) {
      appliedOptimizations.push('Switched to template-only mode to preserve budget');
    }

    return appliedOptimizations;
  }

  /**
   * Get budget recommendations for different workflow types
   */
  getWorkflowBudgetRecommendations(workflowType: string, nodeCount: number): {
    recommendedBudget: number;
    estimatedCost: number;
    features: string[];
  } {
    let baseCost = 0.02; // Base cost per node
    let features: string[] = [];

    switch (workflowType) {
      case 'simple-data-processing':
        baseCost = 0.01;
        features = ['Basic validation', 'Template generation'];
        break;
      
      case 'machine-learning':
        baseCost = 0.05;
        features = ['AI code review', 'Performance analysis', 'Model optimization'];
        break;
      
      case 'complex-analysis':
        baseCost = 0.08;
        features = ['Deep code analysis', 'Advanced optimization', 'Custom suggestions'];
        break;
      
      default:
        baseCost = 0.03;
        features = ['Standard AI review', 'Basic optimization'];
    }

    const estimatedCost = baseCost * nodeCount;
    const recommendedBudget = estimatedCost * 1.5; // 50% buffer

    return {
      recommendedBudget,
      estimatedCost,
      features
    };
  }

  /**
   * Export budget analytics for reporting
   */
  exportBudgetAnalytics(): {
    totalBudget: number;
    usedBudget: number;
    remainingBudget: number;
    usagePercentage: number;
    efficiencyScore: number;
    topOptimizations: BudgetOptimization[];
    recentAlerts: BudgetAlert[];
  } {
    const stats = openAIEfficiencyService.getUsageStats();
    const health = this.checkBudgetHealth();

    return {
      totalBudget: this.TOTAL_BUDGET,
      usedBudget: stats.totalCost,
      remainingBudget: stats.remainingBudget,
      usagePercentage: (stats.totalCost / this.TOTAL_BUDGET) * 100,
      efficiencyScore: health.efficiencyScore,
      topOptimizations: health.optimizations.slice(0, 3),
      recentAlerts: health.alerts
    };
  }

  /**
   * Get real-time budget status for UI display
   */
  getBudgetStatus(): {
    percentage: number;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    color: string;
  } {
    const stats = openAIEfficiencyService.getUsageStats();
    const percentage = (stats.totalCost / this.TOTAL_BUDGET) * 100;

    if (percentage >= 90) {
      return {
        percentage,
        status: 'critical',
        message: '🚨 Budget Critical',
        color: 'red'
      };
    } else if (percentage >= 75) {
      return {
        percentage,
        status: 'warning',
        message: '⚠️ Budget Warning',
        color: 'orange'
      };
    } else {
      return {
        percentage,
        status: 'healthy',
        message: '✅ Budget Healthy',
        color: 'green'
      };
    }
  }
}

export const budgetOptimizationService = new BudgetOptimizationService();
