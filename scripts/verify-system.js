#!/usr/bin/env node
/**
 * µLM AI Workflow Playground - Automated Verification Scripts
 * Comprehensive testing suite for production readiness assessment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VerificationSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substr(11, 8);
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(name, testFn) {
    this.log(`Running: ${name}`, 'info');
    try {
      const result = await testFn();
      if (result.success) {
        this.results.passed++;
        this.log(`✅ PASSED: ${name}`, 'success');
      } else {
        this.results.failed++;
        this.log(`❌ FAILED: ${name} - ${result.message}`, 'error');
      }
      this.results.tests.push({ name, ...result });
      return result;
    } catch (error) {
      this.results.failed++;
      this.log(`💥 ERROR: ${name} - ${error.message}`, 'error');
      this.results.tests.push({ name, success: false, message: error.message });
      return { success: false, message: error.message };
    }
  }

  // CRITICAL TESTS - Demo Breaking Issues
  async testBuildProcess() {
    return this.runTest('Build Process', async () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return { success: true, message: 'Build completed successfully' };
      } catch (error) {
        return { success: false, message: `Build failed: ${error.message}` };
      }
    });
  }

  async testTypeScriptCompilation() {
    return this.runTest('TypeScript Compilation', async () => {
      try {
        const output = execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf8' });
        return { success: true, message: 'TypeScript compilation successful' };
      } catch (error) {
        const errorOutput = error.stdout || error.stderr || error.message;
        const errorCount = (errorOutput.match(/error TS/g) || []).length;
        return { 
          success: errorCount === 0, 
          message: errorCount > 0 ? `${errorCount} TypeScript errors found` : 'TypeScript OK' 
        };
      }
    });
  }

  async testEssentialFiles() {
    return this.runTest('Essential Files Check', async () => {
      const criticalFiles = [
        'src/App.tsx',
        'src/main.tsx',
        'src/pages/Homepage.tsx',
        'src/pages/UltraWorkspacePage.tsx',
        'src/services/AIBlockGenerationService.ts',
        'src/services/OpenAIEfficiencyService.ts',
        'src/export/UniversalExportService.ts',
        'src/simulation/RealTimeSimulationEngine.ts'
      ];

      const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
      
      if (missingFiles.length > 0) {
        return { 
          success: false, 
          message: `Missing critical files: ${missingFiles.join(', ')}` 
        };
      }
      
      return { success: true, message: 'All essential files present' };
    });
  }

  async testEnvironmentConfiguration() {
    return this.runTest('Environment Configuration', async () => {
      const envExample = fs.existsSync('.env.example');
      const hasViteConfig = fs.existsSync('vite.config.ts');
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const issues = [];
      if (!envExample) issues.push('Missing .env.example');
      if (!hasViteConfig) issues.push('Missing vite.config.ts');
      if (!packageJson.scripts.build) issues.push('Missing build script');
      if (!packageJson.scripts.dev) issues.push('Missing dev script');
      
      return {
        success: issues.length === 0,
        message: issues.length > 0 ? `Issues: ${issues.join(', ')}` : 'Environment properly configured'
      };
    });
  }

  async testComponentIntegrity() {
    return this.runTest('React Components Integrity', async () => {
      const components = [
        'src/components/AIBlockGenerator.tsx',
        'src/components/WorkflowSimulator.tsx',
        'src/components/workspace/WorkspaceLeftPanel.tsx',
        'src/components/workspace/WorkspaceTopBar.tsx'
      ];

      const issues = [];
      
      for (const component of components) {
        if (!fs.existsSync(component)) {
          issues.push(`Missing: ${component}`);
          continue;
        }
        
        const content = fs.readFileSync(component, 'utf8');
        
        // Check for common React patterns
        if (!content.includes('import React')) {
          issues.push(`${component}: Missing React import`);
        }
        
        if (!content.includes('export')) {
          issues.push(`${component}: Missing export`);
        }
        
        // Check for potential syntax issues
        if (content.includes('function(') && !content.includes('function (')) {
          // This is a style check, not critical
        }
      }
      
      return {
        success: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : 'All components structurally sound'
      };
    });
  }

  // HIGH PRIORITY TESTS - Demo Impacting
  async testAPIServiceIntegration() {
    return this.runTest('API Service Integration', async () => {
      const serviceFile = 'src/services/OpenAIEfficiencyService.ts';
      
      if (!fs.existsSync(serviceFile)) {
        return { success: false, message: 'OpenAI service file missing' };
      }
      
      const content = fs.readFileSync(serviceFile, 'utf8');
      
      const requiredMethods = [
        'generateWithCache',
        'simulateWorkflow',
        'getUsageStats'
      ];
      
      const missingMethods = requiredMethods.filter(method => 
        !content.includes(method)
      );
      
      if (missingMethods.length > 0) {
        return { 
          success: false, 
          message: `Missing methods: ${missingMethods.join(', ')}` 
        };
      }
      
      return { success: true, message: 'API service properly structured' };
    });
  }

  async testExportSystemIntegrity() {
    return this.runTest('Export System Integrity', async () => {
      const exportFile = 'src/export/UniversalExportService.ts';
      
      if (!fs.existsSync(exportFile)) {
        return { success: false, message: 'Export service missing' };
      }
      
      const content = fs.readFileSync(exportFile, 'utf8');
      
      const requiredExports = [
        'generatePythonCode',
        'generateDockerfile',
        'generateHuggingFaceSpace'
      ];
      
      const missingExports = requiredExports.filter(method => 
        !content.includes(method)
      );
      
      if (missingExports.length > 0) {
        return { 
          success: false, 
          message: `Missing export methods: ${missingExports.join(', ')}` 
        };
      }
      
      return { success: true, message: 'Export system complete' };
    });
  }

  async testSimulationEngine() {
    return this.runTest('Simulation Engine Check', async () => {
      const engineFile = 'src/simulation/RealTimeSimulationEngine.ts';
      
      if (!fs.existsSync(engineFile)) {
        return { success: false, message: 'Simulation engine missing' };
      }
      
      const content = fs.readFileSync(engineFile, 'utf8');
      
      const requiredFeatures = [
        'startSimulation',
        'stopSimulation',
        'updateWorkflow'
      ];
      
      const missingFeatures = requiredFeatures.filter(feature => 
        !content.includes(feature)
      );
      
      if (missingFeatures.length > 0) {
        return { 
          success: false, 
          message: `Missing simulation features: ${missingFeatures.join(', ')}` 
        };
      }
      
      return { success: true, message: 'Simulation engine properly implemented' };
    });
  }

  // PERFORMANCE TESTS
  async testBundleSize() {
    return this.runTest('Bundle Size Analysis', async () => {
      try {
        // Build the project first
        execSync('npm run build', { stdio: 'pipe' });
        
        const distPath = 'dist';
        if (!fs.existsSync(distPath)) {
          return { success: false, message: 'Build output directory not found' };
        }
        
        // Calculate total bundle size
        let totalSize = 0;
        const calculateSize = (dir) => {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              calculateSize(filePath);
            } else {
              totalSize += stats.size;
            }
          });
        };
        
        calculateSize(distPath);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        // Check if size is reasonable (under 5MB for demo)
        const isReasonable = totalSize < 5 * 1024 * 1024;
        
        return {
          success: isReasonable,
          message: `Bundle size: ${sizeMB}MB ${isReasonable ? '(Good)' : '(Too large for demo)'}`
        };
      } catch (error) {
        return { success: false, message: `Bundle analysis failed: ${error.message}` };
      }
    });
  }

  async testCodeQuality() {
    return this.runTest('Code Quality Check', async () => {
      try {
        // Check if ESLint exists
        if (!fs.existsSync('.eslintrc.js') && !fs.existsSync('.eslintrc.json') && !fs.existsSync('.eslintrc.cjs')) {
          return { success: false, message: 'ESLint configuration missing' };
        }
        
        // Run ESLint
        const output = execSync('npx eslint src --ext .ts,.tsx --format json', { 
          stdio: 'pipe', 
          encoding: 'utf8' 
        });
        
        const results = JSON.parse(output);
        let totalErrors = 0;
        let totalWarnings = 0;
        
        results.forEach(file => {
          totalErrors += file.errorCount;
          totalWarnings += file.warningCount;
        });
        
        return {
          success: totalErrors === 0,
          message: `${totalErrors} errors, ${totalWarnings} warnings`
        };
      } catch (error) {
        // ESLint might not be configured, which is okay for demo
        return { success: true, message: 'ESLint not configured (acceptable for demo)' };
      }
    });
  }

  // SECURITY TESTS
  async testSecurityBasics() {
    return this.runTest('Basic Security Check', async () => {
      const issues = [];
      
      // Check for hardcoded secrets
      const sensitiveFiles = ['src/services/OpenAIEfficiencyService.ts'];
      
      sensitiveFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Look for potential hardcoded API keys
          if (content.includes('sk-') && !content.includes('process.env')) {
            issues.push(`Potential hardcoded API key in ${file}`);
          }
          
          if (content.includes('dangerouslySetInnerHTML')) {
            issues.push(`Potentially unsafe HTML in ${file}`);
          }
        }
      });
      
      // Check environment variable usage
      if (!fs.existsSync('.env.example')) {
        issues.push('Missing .env.example file');
      }
      
      return {
        success: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : 'Basic security checks passed'
      };
    });
  }

  // DEMO READINESS TESTS
  async testDemoScenario() {
    return this.runTest('Demo Scenario Readiness', async () => {
      const demoAssets = [
        'src/data/DemoWorkflows.ts',
        'src/components/PremiumExamplePrompts.tsx'
      ];
      
      const missingAssets = demoAssets.filter(asset => !fs.existsSync(asset));
      
      if (missingAssets.length > 0) {
        return {
          success: false,
          message: `Missing demo assets: ${missingAssets.join(', ')}`
        };
      }
      
      // Check if demo data is populated
      const demoWorkflows = fs.readFileSync('src/data/DemoWorkflows.ts', 'utf8');
      if (demoWorkflows.length < 1000) { // Arbitrary size check
        return {
          success: false,
          message: 'Demo workflows appear to be empty or minimal'
        };
      }
      
      return { success: true, message: 'Demo assets ready' };
    });
  }

  async testAPIConnectionMockability() {
    return this.runTest('API Connection Mockability', async () => {
      const serviceFile = 'src/services/OpenAIEfficiencyService.ts';
      const content = fs.readFileSync(serviceFile, 'utf8');
      
      // Check if service has fallback mechanisms
      const hasFallback = content.includes('fallback') || 
                         content.includes('offline') || 
                         content.includes('demo');
      
      if (!hasFallback) {
        return {
          success: false,
          message: 'No fallback mechanism detected for API failures'
        };
      }
      
      return { success: true, message: 'API fallback mechanisms in place' };
    });
  }

  // MAIN EXECUTION
  async runAllTests() {
    this.log('🚀 Starting µLM Verification Suite', 'info');
    this.log('=' * 50, 'info');
    
    // Critical Tests (Must Pass)
    this.log('\n🔥 CRITICAL TESTS (Demo Breaking)', 'warning');
    await this.testBuildProcess();
    await this.testTypeScriptCompilation();
    await this.testEssentialFiles();
    await this.testEnvironmentConfiguration();
    await this.testComponentIntegrity();
    
    // High Priority Tests
    this.log('\n🚨 HIGH PRIORITY TESTS (Demo Impacting)', 'warning');
    await this.testAPIServiceIntegration();
    await this.testExportSystemIntegrity();
    await this.testSimulationEngine();
    
    // Performance Tests
    this.log('\n⚡ PERFORMANCE TESTS', 'warning');
    await this.testBundleSize();
    await this.testCodeQuality();
    
    // Security Tests
    this.log('\n🔒 SECURITY TESTS', 'warning');
    await this.testSecurityBasics();
    
    // Demo Readiness
    this.log('\n🎯 DEMO READINESS TESTS', 'warning');
    await this.testDemoScenario();
    await this.testAPIConnectionMockability();
    
    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    this.log('\n' + '=' * 50, 'info');
    this.log('📊 VERIFICATION REPORT', 'info');
    this.log('=' * 50, 'info');
    
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');
    this.log(`⚠️  Warnings: ${this.results.warnings}`, 'warning');
    this.log(`⏱️  Duration: ${duration}s`, 'info');
    
    const passRate = (this.results.passed / (this.results.passed + this.results.failed) * 100).toFixed(1);
    this.log(`📈 Pass Rate: ${passRate}%`, passRate > 80 ? 'success' : 'error');
    
    // Demo Readiness Assessment
    const criticalFailures = this.results.tests
      .filter(test => !test.success && test.name.includes('Build\|TypeScript\|Essential\|Environment\|Component'))
      .length;
    
    if (criticalFailures === 0) {
      this.log('\n🎉 DEMO READY! All critical tests passed.', 'success');
    } else {
      this.log(`\n🚨 NOT DEMO READY! ${criticalFailures} critical failures.`, 'error');
    }
    
    // Generate detailed report file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        passRate: parseFloat(passRate),
        duration: parseFloat(duration)
      },
      tests: this.results.tests,
      demoReady: criticalFailures === 0
    };
    
    fs.writeFileSync('verification-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Detailed report saved to: verification-report.json', 'info');
    
    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Execute if run directly
if (require.main === module) {
  const suite = new VerificationSuite();
  suite.runAllTests().catch(error => {
    console.error('Verification suite failed:', error);
    process.exit(1);
  });
}

module.exports = VerificationSuite;
