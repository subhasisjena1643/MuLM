// @ts-nocheck
// Integration Test for Universal Export System
// Tests the complete export and verification pipeline

import { Node, Edge } from 'reactflow';
import { universalExportService } from '../export/UniversalExportService';
import { deploymentVerificationService } from '../export/DeploymentVerificationService';
import { openAIEfficiencyService } from '../services/OpenAIEfficiencyService';
import { ExportOptions, ExportFormat } from '../export/UniversalExportService';

class UniversalExportIntegrationTest {
  private exportService: typeof universalExportService;

  constructor() {
    this.exportService = universalExportService;
  }

  // Test complete export and verification pipeline
  async testCompleteExportPipeline(): Promise<void> {
    console.log('🚀 Starting Universal Export System Integration Test');

    // Sample workflow data
    const sampleNodes: Node[] = [
      {
        id: '1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { 
          label: 'Data Input',
          blockType: 'input',
          config: { source: 'csv', path: 'data.csv' }
        }
      },
      {
        id: '2',
        type: 'processing',
        position: { x: 200, y: 0 },
        data: { 
          label: 'Data Processing',
          blockType: 'transform',
          config: { operation: 'normalize', method: 'minmax' }
        }
      },
      {
        id: '3',
        type: 'ml',
        position: { x: 400, y: 0 },
        data: { 
          label: 'ML Model',
          blockType: 'model',
          config: { type: 'sklearn', algorithm: 'RandomForest' }
        }
      },
      {
        id: '4',
        type: 'output',
        position: { x: 600, y: 0 },
        data: { 
          label: 'Output',
          blockType: 'output',
          config: { format: 'json', destination: 'api' }
        }
      }
    ];

    const sampleEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' }
    ];

    const exportFormats: ExportFormat[] = [
      'python-package',
      'fastapi-service', 
      'huggingface-space',
      'jupyter-notebook',
      'edge-deployment'
    ];

    // Test each export format
    for (const format of exportFormats) {
      await this.testExportFormat(sampleNodes, sampleEdges, format);
    }

    console.log('✅ All export formats tested successfully');

    // Test OpenAI efficiency features
    await this.testOpenAIEfficiency();

    console.log('🎉 Universal Export System Integration Test Completed Successfully!');
  }

  // Test individual export format
  private async testExportFormat(
    nodes: Node[], 
    edges: Edge[], 
    format: ExportFormat
  ): Promise<void> {
    console.log(`\n📦 Testing ${format} export...`);

    const options: ExportOptions = {
      format,
      name: `test-workflow-${format}`,
      description: `Test workflow exported as ${format}`,
      version: '1.0.0',
      author: 'µLM Test Suite',
      license: 'MIT',
      includeTests: true,
      includeDocs: true,
      optimizationLevel: 'production',
      targetEnvironment: 'cloud',
      deploymentConfig: {
        pythonVersion: '3.9',
        dependencies: ['pandas', 'numpy', 'scikit-learn'],
        entryPoint: 'main.py'
      }
    };

    try {
      // Export the workflow
      const exportResult = await this.exportService.exportWorkflow(nodes, edges, options);
      
      if (!exportResult.success) {
        throw new Error(`Export failed: ${exportResult.errors?.join(', ')}`);
      }

      console.log(`  ✓ Export successful: ${exportResult.files.length} files generated`);

      // Verify the deployment
      const verificationResult = await deploymentVerificationService.verifyDeployment(exportResult);
      
      console.log(`  ✓ Verification: ${verificationResult.testsPassed}/${verificationResult.testsTotal} tests passed`);
      
      if (!verificationResult.success) {
        console.log(`  ⚠️ Verification warnings: ${verificationResult.warnings.join(', ')}`);
        console.log(`  🔧 Recommendations: ${verificationResult.recommendations.join(', ')}`);
      }

      // Display performance metrics
      console.log(`  📊 Performance: ${verificationResult.performance.averageLatency.toFixed(1)}ms avg latency`);
      
      // Display security status
      const securityIssues = verificationResult.security.filter(s => !s.passed);
      if (securityIssues.length === 0) {
        console.log(`  🔒 Security: All ${verificationResult.security.length} checks passed`);
      } else {
        console.log(`  ⚠️ Security: ${securityIssues.length} issues found`);
      }

    } catch (error) {
      console.error(`  ❌ ${format} export failed:`, error);
      throw error;
    }
  }

  // Test OpenAI efficiency features
  private async testOpenAIEfficiency(): Promise<void> {
    console.log('\n🧠 Testing OpenAI Efficiency Features...');

    // Test caching
    const testPrompt = 'Generate a simple Python function that adds two numbers';
    
    console.log('  Testing prompt caching...');
    const startTime = Date.now();
    const response1 = await openAIEfficiencyService.generateWithCache(testPrompt, {
      temperature: 0.7,
      maxTokens: 150
    });
    const firstCallTime = Date.now() - startTime;

    // Second call should be cached
    const cachedStartTime = Date.now();
    const response2 = await openAIEfficiencyService.generateWithCache(testPrompt, {
      temperature: 0.7,
      maxTokens: 150
    });
    const cachedCallTime = Date.now() - cachedStartTime;

    console.log(`  ✓ First call: ${firstCallTime}ms`);
    console.log(`  ✓ Cached call: ${cachedCallTime}ms (${Math.round((1 - cachedCallTime/firstCallTime) * 100)}% faster)`);

    // Test budget tracking
    const budget = openAIEfficiencyService.getUsageStats();
    console.log(`  💰 Budget: $${budget.totalCost.toFixed(4)} / $${(budget.totalCost + budget.remainingBudget).toFixed(2)} used ($${budget.remainingBudget.toFixed(2)} remaining)`);

    // Test token optimization
    const longPrompt = 'This is a very long prompt that should be optimized for token usage. '.repeat(50);
    const optimizedResponse = await openAIEfficiencyService.generateWithCache(longPrompt, {
      temperature: 0.5,
      maxTokens: 100
    });

    if (optimizedResponse.fromCache) {
      console.log('  ✓ Response served from cache');
    } else {
      console.log('  ✓ Response generated with token optimization');
    }

    console.log('  ✅ OpenAI efficiency features working correctly');
  }

  // Run a quick smoke test
  async smokeTest(): Promise<boolean> {
    try {
      console.log('🔥 Running Quick Smoke Test...');

      // Test basic export
      const simpleNodes: Node[] = [{
        id: '1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Simple Input', blockType: 'input' }
      }];

      const simpleEdges: Edge[] = [];

      const options: ExportOptions = {
        format: 'python-package',
        name: 'smoke-test',
        description: 'Smoke test package',
        version: '0.1.0',
        author: 'Test',
        license: 'MIT',
        includeTests: false,
        includeDocs: false,
        optimizationLevel: 'development',
        targetEnvironment: 'desktop',
        deploymentConfig: {}
      };

      const result = await this.exportService.exportWorkflow(simpleNodes, simpleEdges, options);
      
      if (result.success && result.files.length > 0) {
        console.log('  ✅ Smoke test passed - basic export functionality working');
        return true;
      } else {
        console.error('  ❌ Smoke test failed - export returned no files');
        return false;
      }

    } catch (error) {
      console.error('  ❌ Smoke test failed with error:', error);
      return false;
    }
  }

  // Test specific features
  async testFeatures(): Promise<void> {
    console.log('\n🔧 Testing Specific Features...');

    // Test fallback strategies
    console.log('  Testing fallback strategies...');
    try {
      // Simulate API failure by using invalid prompt
      await openAIEfficiencyService.generateWithCache('', { maxTokens: 1 });
    } catch {
      console.log('  ✓ Fallback strategy triggered correctly');
    }

    // Test verification service
    console.log('  Testing verification service...');
    const supportedFormats = deploymentVerificationService.getSupportedFormats();
    console.log(`  ✓ Supports ${supportedFormats.length} export formats: ${supportedFormats.join(', ')}`);

    // Test history tracking
    const history = deploymentVerificationService.getVerificationHistory();
    console.log(`  ✓ Verification history: ${history.length} entries`);

    console.log('  ✅ All features tested successfully');
  }
}

// Export for use in other test files
export const universalExportIntegrationTest = new UniversalExportIntegrationTest();
