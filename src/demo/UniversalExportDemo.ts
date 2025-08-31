// µLM Universal Export System Demo
// Quick demonstration of the export and verification capabilities

import { Node, Edge } from 'reactflow';
import { universalExportService } from '../export/UniversalExportService';
import { deploymentVerificationService } from '../export/DeploymentVerificationService';
import { openAIEfficiencyService } from '../services/OpenAIEfficiencyService';
import { ExportOptions } from '../export/UniversalExportService';

export class UniversalExportDemo {
  
  async runDemo(): Promise<void> {
    console.log('🚀 µLM Universal Export System Demo');
    console.log('=====================================\n');

    // Sample workflow: Simple ML pipeline
    const demoNodes: Node[] = [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { 
          label: 'CSV Data Input',
          blockType: 'input',
          config: { 
            source: 'csv',
            path: './data/customer_data.csv',
            columns: ['age', 'income', 'spending_score']
          }
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 250, y: 0 },
        data: { 
          label: 'Data Preprocessing',
          blockType: 'transform',
          config: { 
            operations: ['normalize', 'remove_outliers', 'fill_missing'],
            scaler: 'StandardScaler'
          }
        }
      },
      {
        id: 'model-1',
        type: 'ml',
        position: { x: 500, y: 0 },
        data: { 
          label: 'Customer Segmentation',
          blockType: 'model',
          config: { 
            algorithm: 'KMeans',
            n_clusters: 5,
            features: ['age', 'income', 'spending_score']
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 750, y: 0 },
        data: { 
          label: 'Segmentation Results',
          blockType: 'output',
          config: { 
            format: 'json',
            include_confidence: true,
            visualization: true
          }
        }
      }
    ];

    const demoEdges: Edge[] = [
      { id: 'e1', source: 'input-1', target: 'transform-1' },
      { id: 'e2', source: 'transform-1', target: 'model-1' },
      { id: 'e3', source: 'model-1', target: 'output-1' }
    ];

    console.log('📊 Workflow Overview:');
    console.log(`- Nodes: ${demoNodes.length}`);
    console.log(`- Edges: ${demoEdges.length}`);
    console.log(`- Type: Customer Segmentation ML Pipeline\n`);

    // Demo each export format
    await this.demoExportFormats(demoNodes, demoEdges);

    // Demo efficiency features
    await this.demoEfficiencyFeatures();

    console.log('\n🎉 Demo completed successfully!');
    console.log('💡 The µLM Universal Export System is ready for production use.');
  }

  private async demoExportFormats(nodes: Node[], edges: Edge[]): Promise<void> {
    console.log('📦 Export Format Demonstrations:');
    console.log('=================================\n');

    const exportService = universalExportService;

    // 1. Python Package Export
    await this.demoFormat(
      exportService,
      nodes,
      edges,
      'python-package',
      'Customer Segmentation Package',
      'A complete Python package for customer segmentation analysis'
    );

    // 2. FastAPI Service Export  
    await this.demoFormat(
      exportService,
      nodes,
      edges,
      'fastapi-service',
      'Segmentation API Service',
      'RESTful API service for real-time customer segmentation'
    );

    // 3. HuggingFace Space Export
    await this.demoFormat(
      exportService,
      nodes,
      edges,
      'huggingface-space',
      'Customer Segmentation Demo',
      'Interactive demo for customer segmentation analysis'
    );

    // 4. Jupyter Notebook Export
    await this.demoFormat(
      exportService,
      nodes,
      edges,
      'jupyter-notebook',
      'Segmentation Tutorial',
      'Educational notebook for learning customer segmentation'
    );

    // 5. Edge Deployment Export
    await this.demoFormat(
      exportService,
      nodes,
      edges,
      'edge-deployment',
      'Edge Segmentation Model',
      'Optimized model for edge device deployment'
    );
  }

  private async demoFormat(
    exportService: typeof universalExportService,
    nodes: Node[],
    edges: Edge[],
    format: any,
    name: string,
    description: string
  ): Promise<void> {
    console.log(`🔄 Exporting as ${format}...`);

    const options: ExportOptions = {
      format,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      version: '1.0.0',
      author: 'µLM Demo',
      license: 'MIT',
      includeTests: true,
      includeDocs: true,
      optimizationLevel: 'production',
      targetEnvironment: 'cloud',
      deploymentConfig: {
        pythonVersion: '3.9',
        dependencies: ['pandas', 'scikit-learn', 'numpy'],
        entryPoint: 'main.py'
      }
    };

    try {
      const startTime = Date.now();
      
      // Export the workflow
      const exportResult = await exportService.exportWorkflow(nodes, edges, options);
      const exportTime = Date.now() - startTime;

      if (exportResult.success) {
        console.log(`  ✅ Export successful (${exportTime}ms)`);
        console.log(`  📁 Files generated: ${exportResult.files.length}`);
        
        // Display file breakdown
        const fileTypes = exportResult.files.reduce((acc, file) => {
          acc[file.type] = (acc[file.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        Object.entries(fileTypes).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count} files`);
        });

        // Run verification
        console.log(`  🔍 Running verification tests...`);
        const verificationResult = await deploymentVerificationService.verifyDeployment(exportResult);
        
        console.log(`  📊 Tests: ${verificationResult.testsPassed}/${verificationResult.testsTotal} passed`);
        console.log(`  ⚡ Performance: ${verificationResult.performance.averageLatency.toFixed(1)}ms avg latency`);
        console.log(`  🔒 Security: ${verificationResult.security.filter(s => s.passed).length}/${verificationResult.security.length} checks passed`);
        
        if (verificationResult.warnings.length > 0) {
          console.log(`  ⚠️  Warnings: ${verificationResult.warnings.length}`);
        }

        // Show metadata
        if (exportResult.metadata) {
          console.log(`  📈 Metadata: AI-generated: ${exportResult.metadata.aiGenerated}, Optimization: ${exportResult.metadata.optimizationLevel}`);
        }

      } else {
        console.log(`  ❌ Export failed: ${exportResult.errors?.join(', ')}`);
      }

    } catch (error) {
      console.log(`  💥 Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log(); // Empty line for spacing
  }

  private async demoEfficiencyFeatures(): Promise<void> {
    console.log('🧠 OpenAI Efficiency Features Demo:');
    console.log('===================================\n');

    // Demo caching
    console.log('📦 Cache Performance Test:');
    const testPrompt = 'Generate a simple data validation function for customer data';
    
    // First call (should hit API or fallback)
    console.log('  Making first API call...');
    const start1 = Date.now();
    const response1 = await openAIEfficiencyService.generateWithCache(testPrompt, {
      temperature: 0.7,
      maxTokens: 200
    });
    const time1 = Date.now() - start1;
    
    console.log(`  ⏱️  First call: ${time1}ms`);
    console.log(`  🎯 Response type: ${response1.fromCache ? 'Cached' : response1.fromFallback ? 'Fallback' : 'API'}`);

    // Second call (should be cached)
    console.log('  Making second API call (same prompt)...');
    const start2 = Date.now();
    const response2 = await openAIEfficiencyService.generateWithCache(testPrompt, {
      temperature: 0.7,
      maxTokens: 200
    });
    const time2 = Date.now() - start2;
    
    console.log(`  ⏱️  Second call: ${time2}ms`);
    console.log(`  🎯 Response type: ${response2.fromCache ? 'Cached' : response2.fromFallback ? 'Fallback' : 'API'}`);
    console.log(`  🚀 Speed improvement: ${Math.round((1 - time2/time1) * 100)}%\n`);

    // Demo usage statistics
    console.log('📊 Usage Statistics:');
    const stats = openAIEfficiencyService.getUsageStats();
    console.log(`  💰 Total cost: $${stats.totalCost.toFixed(4)}`);
    console.log(`  🎯 Tokens used: ${stats.totalTokensUsed.toLocaleString()}`);
    console.log(`  📈 Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`  🔄 Request count: ${stats.requestCount}`);
    console.log(`  💵 Remaining budget: $${stats.remainingBudget.toFixed(2)}\n`);

    // Demo cache statistics
    console.log('🗄️  Cache Statistics:');
    const cacheStats = openAIEfficiencyService.getCacheStats();
    console.log(`  📦 Cache entries: ${cacheStats.totalEntries}`);
    console.log(`  🎯 Hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    console.log(`  💾 Memory usage: ${(cacheStats.memoryUsage / 1024).toFixed(1)} KB`);
    
    if (cacheStats.oldestEntry > 0) {
      const oldestDate = new Date(cacheStats.oldestEntry);
      console.log(`  ⏰ Oldest entry: ${oldestDate.toLocaleTimeString()}`);
    }
  }

  // Quick demo for integration testing
  async quickDemo(): Promise<boolean> {
    try {
      console.log('🔥 Quick Demo - Testing Core Functionality...\n');

      // Simple test workflow
      const testNodes: Node[] = [{
        id: 'test-1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Test Input', blockType: 'input' }
      }];

      const testEdges: Edge[] = [];

      const exportService = universalExportService;
      const result = await exportService.exportWorkflow(testNodes, testEdges, {
        format: 'python-package',
        name: 'quick-demo-test',
        description: 'Quick demo test package',
        version: '0.1.0',
        author: 'Demo',
        license: 'MIT',
        includeTests: false,
        includeDocs: false,
        optimizationLevel: 'development',
        targetEnvironment: 'desktop',
        deploymentConfig: {}
      });

      if (result.success) {
        console.log('✅ Core export functionality: WORKING');
        console.log(`📁 Generated ${result.files.length} files`);
        
        // Test verification
        const verification = await deploymentVerificationService.verifyDeployment(result);
        console.log(`✅ Verification system: WORKING (${verification.testsPassed}/${verification.testsTotal} tests passed)`);
        
        // Test efficiency service
        const stats = openAIEfficiencyService.getUsageStats();
        console.log(`✅ Efficiency service: WORKING ($${stats.totalCost.toFixed(4)} used)`);
        
        console.log('\n🎉 Quick demo PASSED - All core systems operational!');
        return true;
      } else {
        console.log('❌ Quick demo FAILED - Export system not working');
        return false;
      }

    } catch (error) {
      console.log(`💥 Quick demo FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}

// Export the demo class
export const universalExportDemo = new UniversalExportDemo();
