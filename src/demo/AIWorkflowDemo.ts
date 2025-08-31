// Comprehensive Demo for µLM AI-Powered Workflow Simulation
// Demonstrates all features with $25 budget optimization

import { Node, Edge } from 'reactflow';
import { workflowSimulationEngine } from '../simulation/WorkflowSimulationEngine';
import { openAIEfficiencyService } from '../services/OpenAIEfficiencyService';
import { budgetOptimizationService } from '../services/BudgetOptimizationService';

export class AIWorkflowDemo {
  
  async runComprehensiveDemo(): Promise<void> {
    console.log('🚀 µLM AI-Powered Workflow Simulation Demo');
    console.log('==========================================');
    console.log('💰 Budget: $40 OpenAI Credits - Optimized for Maximum Efficiency\n');

    // Demo 1: Simple Data Processing Workflow
    await this.demoSimpleWorkflow();

    // Demo 2: Complex ML Pipeline with Errors
    await this.demoComplexWorkflowWithErrors();

    // Demo 3: Budget Optimization Features
    await this.demoBudgetOptimization();

    // Demo 4: Community Pattern Matching
    await this.demoCommunityPatterns();

    // Demo 5: Real-time Error Detection
    await this.demoRealTimeErrorDetection();

    console.log('\n🎉 Demo Complete! All AI features working efficiently within budget.');
    this.showFinalStats();
  }

  /**
   * Demo 1: Simple data processing workflow
   */
  private async demoSimpleWorkflow(): Promise<void> {
    console.log('\n📊 Demo 1: Simple Data Processing Workflow');
    console.log('===========================================');

    const nodes: Node[] = [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { 
          label: 'CSV Data Input',
          code: `import pandas as pd\ndata = pd.read_csv('customer_data.csv')\nprint(f"Loaded {len(data)} records")`,
          config: { source: 'csv', path: 'customer_data.csv' }
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 200, y: 0 },
        data: { 
          label: 'Data Cleaning',
          code: `# Clean and preprocess data\ndata = data.dropna()\ndata['age'] = data['age'].astype(int)\ndata = data[data['age'] > 0]`,
          config: { operations: ['dropna', 'type_conversion'] }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 400, y: 0 },
        data: { 
          label: 'Export Results',
          code: `data.to_csv('cleaned_data.csv', index=False)\nprint("Data exported successfully")`,
          config: { format: 'csv', destination: 'cleaned_data.csv' }
        }
      }
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: 'input-1', target: 'transform-1' },
      { id: 'e2-3', source: 'transform-1', target: 'output-1' }
    ];

    const result = await workflowSimulationEngine.simulateWorkflow(nodes, edges);
    
    console.log(`✅ Status: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
    console.log(`⚡ Performance: ${result.performance.estimatedRuntime.toFixed(1)}s runtime, ${result.performance.memoryUsage}MB memory`);
    console.log(`🧠 AI Score: ${result.aiReview.overallScore}/100`);

    if (result.aiReview.suggestions.length > 0) {
      console.log('💡 AI Suggestions:');
      result.aiReview.suggestions.slice(0, 2).forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
    }
  }

  /**
   * Demo 2: Complex ML workflow with intentional errors
   */
  private async demoComplexWorkflowWithErrors(): Promise<void> {
    console.log('\n🤖 Demo 2: Complex ML Workflow with Error Detection');
    console.log('==================================================');

    const nodes: Node[] = [
      {
        id: 'input-2',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { 
          label: 'Dataset Input',
          code: `import pandas as pd\ndata = pd.read_csv('training_data.csv')\nX = data.drop('target', axis=1)\ny = data['target']`,
          config: { source: 'csv' }
        }
      },
      {
        id: 'preprocess-2',
        type: 'transform',
        position: { x: 200, y: 0 },
        data: { 
          label: 'Preprocessing',
          // Intentional error: missing import
          code: `scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nprint("Data scaled")`,
          config: { scaler: 'StandardScaler' }
        }
      },
      {
        id: 'model-2',
        type: 'mlAlgorithm',
        position: { x: 400, y: 0 },
        data: { 
          label: 'Random Forest',
          // Intentional error: wrong parameter name
          code: `from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimator=100)\nmodel.fit(X_scaled, y)`,
          config: { algorithm: 'RandomForest' }
        }
      },
      {
        id: 'evaluate-2',
        type: 'utility',
        position: { x: 600, y: 0 },
        data: { 
          label: 'Model Evaluation',
          code: `from sklearn.metrics import accuracy_score\npredictions = model.predict(X_test)\naccuracy = accuracy_score(y_test, predictions)`,
          config: { metrics: ['accuracy'] }
        }
      }
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: 'input-2', target: 'preprocess-2' },
      { id: 'e2-3', source: 'preprocess-2', target: 'model-2' },
      { id: 'e3-4', source: 'model-2', target: 'evaluate-2' }
    ];

    const result = await workflowSimulationEngine.simulateWorkflow(nodes, edges, {
      enableAIReview: true,
      performanceAnalysis: true,
      deepCodeAnalysis: true,
      communityPatternMatching: true,
      budgetLimit: 1.5
    });

    console.log(`📋 Status: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`🐛 Errors Found: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 Error Details:');
      result.errors.slice(0, 3).forEach(error => {
        console.log(`   Block: ${error.blockId}`);
        console.log(`   Issue: ${error.message}`);
        if (error.line) console.log(`   Line: ${error.line}`);
        console.log(`   🤖 AI Fix: ${error.aiSuggestion}`);
        console.log('');
      });
    }

    console.log(`🧠 AI Recommendations: ${result.aiReview.suggestions.length} suggestions provided`);
  }

  /**
   * Demo 3: Budget optimization features
   */
  private async demoBudgetOptimization(): Promise<void> {
    console.log('\n💰 Demo 3: Budget Optimization & Monitoring');
    console.log('===========================================');

    const budgetHealth = budgetOptimizationService.checkBudgetHealth();
    const budgetStatus = budgetOptimizationService.getBudgetStatus();
    const analytics = budgetOptimizationService.exportBudgetAnalytics();

    console.log(`💳 Budget Status: ${budgetStatus.message}`);
    console.log(`📊 Usage: ${budgetStatus.percentage.toFixed(1)}% ($${analytics.usedBudget.toFixed(2)}/$${analytics.totalBudget})`);
    console.log(`⚡ Efficiency Score: ${analytics.efficiencyScore.toFixed(0)}/100`);

    if (budgetHealth.projectedBurnout) {
      console.log(`⏰ Projected Burnout: ${budgetHealth.projectedBurnout.toLocaleDateString()}`);
    }

    console.log('\n🔧 Top Budget Optimizations:');
    budgetHealth.optimizations.slice(0, 3).forEach(opt => {
      console.log(`   • ${opt.action} (Save: $${opt.potentialSavings.toFixed(2)})`);
      console.log(`     ${opt.description}`);
    });

    // Apply automatic optimizations
    const autoOptimizations = await budgetOptimizationService.applyAutomaticOptimizations();
    if (autoOptimizations.length > 0) {
      console.log('\n🤖 Auto-Applied Optimizations:');
      autoOptimizations.forEach(opt => console.log(`   • ${opt}`));
    }
  }

  /**
   * Demo 4: Community pattern matching
   */
  private async demoCommunityPatterns(): Promise<void> {
    console.log('\n🌐 Demo 4: Community Pattern Matching');
    console.log('====================================');

    // Create a standard ML pipeline pattern
    const mlPipelineNodes: Node[] = [
      { id: 'data', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Data Input' } },
      { id: 'clean', type: 'transform', position: { x: 100, y: 0 }, data: { label: 'Data Cleaning' } },
      { id: 'ml', type: 'mlAlgorithm', position: { x: 200, y: 0 }, data: { label: 'ML Model' } },
      { id: 'out', type: 'output', position: { x: 300, y: 0 }, data: { label: 'Results' } }
    ];

    const mlPipelineEdges: Edge[] = [
      { id: 'e1', source: 'data', target: 'clean' },
      { id: 'e2', source: 'clean', target: 'ml' },
      { id: 'e3', source: 'ml', target: 'out' }
    ];

    const result = await workflowSimulationEngine.simulateWorkflow(mlPipelineNodes, mlPipelineEdges);

    console.log('🔍 Pattern Analysis Results:');
    console.log(`   Matched known patterns: ${result.aiReview.optimizations.length > 0 ? 'Yes' : 'No'}`);
    
    if (result.aiReview.optimizations.length > 0) {
      console.log('   📋 Pattern-based optimizations:');
      result.aiReview.optimizations.slice(0, 2).forEach(opt => {
        console.log(`      • ${opt}`);
      });
    }

    // Demonstrate adding new pattern to community library
    workflowSimulationEngine.addCommunityPattern('demo-ml-pipeline', {
      nodeTypes: ['input', 'transform', 'mlAlgorithm', 'output'],
      optimizations: [
        'Add data validation step after input',
        'Include feature engineering before ML',
        'Add model evaluation metrics'
      ]
    });

    console.log('✅ Added new pattern to community library');
  }

  /**
   * Demo 5: Real-time error detection with line numbers
   */
  private async demoRealTimeErrorDetection(): Promise<void> {
    console.log('\n🔍 Demo 5: Real-time Error Detection (Like Copilot)');
    console.log('===================================================');

    const problematicNode: Node = {
      id: 'buggy-code',
      type: 'transform',
      position: { x: 0, y: 0 },
      data: {
        label: 'Buggy Code Block',
        code: `import pandas as pd
import numpy as np

def process_data(df):
    # Error 1: Missing return statement
    df = df.dropna()
    df['new_column'] = df['age'] * 2
    # Error 2: Undefined variable
    result = df.merge(other_df, on='id')
    # Error 3: Syntax error
    if len(result > 0:
        print("Processing complete")
    
    # Error 4: Logic error - division by zero potential
    df['ratio'] = df['value'] / df['count']`
      }
    };

    console.log('🔍 Analyzing code for errors...');
    
    // Simulate the workflow with this problematic node
    const result = await workflowSimulationEngine.simulateWorkflow([problematicNode], [], {
      enableAIReview: true,
      performanceAnalysis: true,
      deepCodeAnalysis: true,
      communityPatternMatching: false,
      budgetLimit: 1.0
    });

    console.log('\n🐛 Detected Issues (Copilot-style):');
    result.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.errorType.toUpperCase()} in ${error.blockId}:`);
      console.log(`   Line ${error.line || 'unknown'}: ${error.message}`);
      console.log(`   🤖 AI Fix: ${error.aiSuggestion}`);
      
      if (error.codeContext) {
        console.log('   📝 Code Context:');
        console.log(error.codeContext.split('\n').map(line => `      ${line}`).join('\n'));
      }
    });

    console.log(`\n✅ Found ${result.errors.length} issues with AI-powered suggestions`);
  }

  /**
   * Show final statistics and budget usage
   */
  private showFinalStats(): void {
    console.log('\n📊 Final Demo Statistics');
    console.log('========================');

    const stats = openAIEfficiencyService.getUsageStats();
    const cacheStats = openAIEfficiencyService.getCacheStats();
    const budgetAnalytics = budgetOptimizationService.exportBudgetAnalytics();

    console.log(`💰 Budget Usage:`);
    console.log(`   Total Budget: $${budgetAnalytics.totalBudget}`);
    console.log(`   Used: $${budgetAnalytics.usedBudget.toFixed(4)} (${budgetAnalytics.usagePercentage.toFixed(1)}%)`);
    console.log(`   Remaining: $${budgetAnalytics.remainingBudget.toFixed(2)}`);

    console.log(`\n⚡ API Efficiency:`);
    console.log(`   Total Requests: ${stats.requestCount}`);
    console.log(`   Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   Avg Tokens/Request: ${stats.avgTokensPerRequest.toFixed(0)}`);
    console.log(`   Efficiency Score: ${budgetAnalytics.efficiencyScore.toFixed(0)}/100`);

    console.log(`\n🗄️ Cache Performance:`);
    console.log(`   Cache Entries: ${cacheStats.totalEntries}`);
    console.log(`   Memory Usage: ${(cacheStats.memoryUsage / 1024).toFixed(1)} KB`);
    console.log(`   Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);

    console.log(`\n🎯 Features Demonstrated:`);
    console.log(`   ✅ Smart caching with similarity matching`);
    console.log(`   ✅ Token optimization and compression`);
    console.log(`   ✅ AI-powered error detection with line numbers`);
    console.log(`   ✅ Real-time budget monitoring and optimization`);
    console.log(`   ✅ Community pattern matching`);
    console.log(`   ✅ Fallback strategies for budget preservation`);
    console.log(`   ✅ Copilot-style error suggestions`);

    const remainingCapacity = Math.floor(budgetAnalytics.remainingBudget / (budgetAnalytics.usedBudget / stats.requestCount));
    console.log(`\n🚀 Remaining Capacity: ~${remainingCapacity} more workflow simulations`);
    
    console.log('\n💡 The µLM AI system is optimized for maximum efficiency!');
    console.log('   Your $40 budget will support extensive workflow development.');
  }

  /**
   * Quick test to verify system is working
   */
  async quickTest(): Promise<boolean> {
    try {
      console.log('🔥 Quick System Test...');

      const testNode: Node = {
        id: 'test',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node', code: 'print("Hello, µLM!")' }
      };

      const result = await workflowSimulationEngine.simulateWorkflow([testNode], []);
      
      console.log(`✅ System test: ${result.success ? 'PASSED' : 'FAILED'}`);
      return result.success;

    } catch (error) {
      console.error(`❌ System test failed: ${error}`);
      return false;
    }
  }
}

// Export for use in the application
export const aiWorkflowDemo = new AIWorkflowDemo();

// Demo execution functions for manual testing
export const runDemo = async () => {
  try {
    const demo = new AIWorkflowDemo();
    
    // Run quick test first
    const testPassed = await demo.quickTest();
    if (!testPassed) {
      console.error('💥 System test failed - stopping demo');
      return;
    }

    // Run comprehensive demo
    await demo.runComprehensiveDemo();

  } catch (error) {
    console.error('💥 Demo failed:', error);
  }
};

export const runQuickTest = async () => {
  const demo = new AIWorkflowDemo();
  return await demo.quickTest();
};
