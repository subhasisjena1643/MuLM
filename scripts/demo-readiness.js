#!/usr/bin/env node
/**
 * µLM Demo Readiness Checklist
 * Comprehensive demo preparation and validation tool
 */

const fs = require('fs');
const { execSync } = require('child_process');

class DemoReadinessChecker {
  constructor() {
    this.results = {
      demoScript: { status: 'unknown', issues: [], recommendations: [] },
      demoScenarios: { status: 'unknown', tested: [], failed: [] },
      backupPlans: { status: 'unknown', prepared: [], missing: [] },
      preloadedData: { status: 'unknown', datasets: [], issues: [] },
      performance: { status: 'unknown', metrics: {}, issues: [] },
      dependencies: { status: 'unknown', external: [], risks: [] }
    };
    this.demoScore = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[DEMO] ${message}${colors.reset}`);
  }

  // 1. Demo Script Validation
  async validateDemoScript() {
    this.log('📜 Validating demo script...', 'info');
    
    const issues = [];
    const recommendations = [];
    let status = 'pass';
    
    try {
      // Check for demo documentation
      const demoFiles = ['DEMO.md', 'demo.md', 'Demo.md', 'DEMO_SCRIPT.md'];
      const demoFile = demoFiles.find(file => fs.existsSync(file));
      
      if (!demoFile) {
        issues.push('No demo script documentation found');
        recommendations.push('Create a detailed demo script with timing and steps');
        status = 'fail';
      } else {
        const content = fs.readFileSync(demoFile, 'utf8');
        
        // Check script completeness
        const hasSteps = content.includes('step') || content.includes('Step') || content.includes('1.');
        const hasTiming = content.includes('minute') || content.includes('second') || content.includes('time');
        const hasBackup = content.includes('backup') || content.includes('fallback') || content.includes('alternative');
        const hasDemo = content.includes('demo') || content.includes('Demo');
        
        if (!hasSteps) {
          issues.push('Demo script lacks clear steps');
          recommendations.push('Add numbered steps with clear actions');
        }
        
        if (!hasTiming) {
          issues.push('Demo script lacks timing information');
          recommendations.push('Add timing estimates for each demo section');
        }
        
        if (!hasBackup) {
          issues.push('Demo script lacks backup plans');
          recommendations.push('Add contingency plans for potential failures');
        }
        
        // Check for 5-minute constraint
        if (content.includes('5 minute') || content.includes('5-minute')) {
          this.log('✅ Demo script targets 5-minute format', 'success');
        } else {
          recommendations.push('Ensure demo script fits 5-minute time limit');
        }
        
        if (issues.length === 0) {
          status = 'pass';
        } else if (issues.length <= 2) {
          status = 'warning';
        } else {
          status = 'fail';
        }
      }
      
      this.results.demoScript = { status, issues, recommendations };
      
    } catch (error) {
      this.log(`Demo script validation error: ${error.message}`, 'error');
      this.results.demoScript = { 
        status: 'fail', 
        issues: ['Validation failed'], 
        recommendations: ['Check demo script accessibility'] 
      };
    }
    
    this.log(`Demo Script: ${status.toUpperCase()}`, 
             status === 'pass' ? 'success' : status === 'warning' ? 'warning' : 'error');
  }

  // 2. Demo Scenarios Testing
  async testDemoScenarios() {
    this.log('🎬 Testing demo scenarios...', 'info');
    
    const tested = [];
    const failed = [];
    
    try {
      // Define critical demo scenarios
      const scenarios = [
        {
          name: 'Homepage Load',
          test: () => this.testHomepageLoad(),
          critical: true
        },
        {
          name: 'Workspace Navigation',
          test: () => this.testWorkspaceNavigation(),
          critical: true
        },
        {
          name: 'Prompt Input Flow',
          test: () => this.testPromptFlow(),
          critical: true
        },
        {
          name: 'Block Interaction',
          test: () => this.testBlockInteraction(),
          critical: true
        },
        {
          name: 'Export Functionality',
          test: () => this.testExportFunctionality(),
          critical: false
        }
      ];
      
      for (const scenario of scenarios) {
        try {
          await scenario.test();
          tested.push(scenario.name);
          this.log(`✅ ${scenario.name}`, 'success');
        } catch (error) {
          failed.push({ name: scenario.name, error: error.message, critical: scenario.critical });
          this.log(`❌ ${scenario.name}: ${error.message}`, 'error');
        }
      }
      
      const criticalFailures = failed.filter(f => f.critical).length;
      const status = criticalFailures === 0 ? (failed.length === 0 ? 'pass' : 'warning') : 'fail';
      
      this.results.demoScenarios = { status, tested, failed };
      
    } catch (error) {
      this.log(`Demo scenarios testing error: ${error.message}`, 'error');
      this.results.demoScenarios = { 
        status: 'fail', 
        tested: [], 
        failed: [{ name: 'Testing system', error: error.message, critical: true }] 
      };
    }
    
    this.log(`Demo Scenarios: ${this.results.demoScenarios.status.toUpperCase()} (${tested.length} passed, ${failed.length} failed)`, 
             this.results.demoScenarios.status === 'pass' ? 'success' : 
             this.results.demoScenarios.status === 'warning' ? 'warning' : 'error');
  }

  // 3. Backup Plans Assessment
  async assessBackupPlans() {
    this.log('🛡️ Assessing backup plans...', 'info');
    
    const prepared = [];
    const missing = [];
    
    try {
      // Check for backup data
      const backupPaths = [
        'src/data/demo',
        'demo/data',
        'assets/demo',
        'public/demo-data'
      ];
      
      backupPaths.forEach(path => {
        if (fs.existsSync(path)) {
          prepared.push(`Demo data available at ${path}`);
        }
      });
      
      // Check for fallback components
      const fallbackComponents = [
        'src/components/demo',
        'src/demo',
        'demo'
      ];
      
      fallbackComponents.forEach(path => {
        if (fs.existsSync(path)) {
          prepared.push(`Demo components available at ${path}`);
        }
      });
      
      // Check for offline capabilities
      const sourceFiles = this.getAllSourceFiles();
      const hasOfflineSupport = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('offline') || content.includes('cache') || content.includes('localStorage');
        } catch (error) {
          return false;
        }
      });
      
      if (hasOfflineSupport) {
        prepared.push('Offline functionality for network failures');
      } else {
        missing.push('Offline/cache fallback for network issues');
      }
      
      // Check for error recovery
      const hasErrorRecovery = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('retry') || content.includes('recovery') || content.includes('fallback');
        } catch (error) {
          return false;
        }
      });
      
      if (hasErrorRecovery) {
        prepared.push('Error recovery mechanisms');
      } else {
        missing.push('Automatic error recovery');
      }
      
      // Assess backup completeness
      const status = missing.length === 0 ? 'pass' : missing.length <= 2 ? 'warning' : 'fail';
      
      this.results.backupPlans = { status, prepared, missing };
      
    } catch (error) {
      this.log(`Backup plans assessment error: ${error.message}`, 'error');
      this.results.backupPlans = { 
        status: 'fail', 
        prepared: [], 
        missing: ['Assessment failed'] 
      };
    }
    
    this.log(`Backup Plans: ${this.results.backupPlans.status.toUpperCase()}`, 
             this.results.backupPlans.status === 'pass' ? 'success' : 
             this.results.backupPlans.status === 'warning' ? 'warning' : 'error');
  }

  // 4. Preloaded Data Validation
  async validatePreloadedData() {
    this.log('💾 Validating preloaded data...', 'info');
    
    const datasets = [];
    const issues = [];
    
    try {
      // Check for demo data files
      const dataFiles = this.findDemoDataFiles();
      
      dataFiles.forEach(file => {
        try {
          const stats = fs.statSync(file);
          const content = fs.readFileSync(file, 'utf8');
          
          datasets.push({
            file: file.replace(process.cwd() + '\\\\', ''),
            size: `${(stats.size / 1024).toFixed(1)}KB`,
            type: this.detectDataType(content),
            valid: this.validateDataFormat(content)
          });
          
        } catch (error) {
          issues.push(`Error reading ${file}: ${error.message}`);
        }
      });
      
      // Check for realistic demo data
      const hasRealisticData = datasets.some(dataset => 
        dataset.type === 'JSON' && dataset.size !== '0.0KB'
      );
      
      if (!hasRealisticData) {
        issues.push('No realistic demo datasets found');
      }
      
      // Check for diverse data types
      const dataTypes = [...new Set(datasets.map(d => d.type))];
      if (dataTypes.length < 2) {
        issues.push('Limited diversity in demo data formats');
      }
      
      const status = issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warning' : 'fail';
      
      this.results.preloadedData = { status, datasets, issues };
      
    } catch (error) {
      this.log(`Preloaded data validation error: ${error.message}`, 'error');
      this.results.preloadedData = { 
        status: 'fail', 
        datasets: [], 
        issues: ['Validation failed'] 
      };
    }
    
    this.log(`Preloaded Data: ${this.results.preloadedData.status.toUpperCase()} (${datasets.length} datasets)`, 
             this.results.preloadedData.status === 'pass' ? 'success' : 
             this.results.preloadedData.status === 'warning' ? 'warning' : 'error');
  }

  // 5. Performance Optimization Check
  async checkPerformanceOptimization() {
    this.log('⚡ Checking performance optimization...', 'info');
    
    const metrics = {};
    const issues = [];
    
    try {
      // Check build output
      if (fs.existsSync('./dist')) {
        const distFiles = fs.readdirSync('./dist', { recursive: true })
          .filter(file => typeof file === 'string');
        
        let totalSize = 0;
        let jsFiles = 0;
        let cssFiles = 0;
        
        distFiles.forEach(file => {
          try {
            const filePath = `./dist/${file}`;
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            
            if (file.endsWith('.js')) jsFiles++;
            if (file.endsWith('.css')) cssFiles++;
          } catch (error) {
            // Skip files that can't be read
          }
        });
        
        metrics.bundleSize = `${(totalSize / 1024 / 1024).toFixed(2)}MB`;
        metrics.jsFiles = jsFiles;
        metrics.cssFiles = cssFiles;
        
        if (totalSize > 5 * 1024 * 1024) { // 5MB
          issues.push('Large bundle size may affect demo loading time');
        }
        
      } else {
        metrics.bundleSize = 'Not built';
        issues.push('Application not built - run build command before demo');
      }
      
      // Check for performance features
      const sourceFiles = this.getAllSourceFiles();
      const hasLazyLoading = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('lazy') || content.includes('Suspense') || content.includes('dynamic');
        } catch (error) {
          return false;
        }
      });
      
      metrics.hasLazyLoading = hasLazyLoading;
      if (!hasLazyLoading) {
        issues.push('No lazy loading detected - may slow initial load');
      }
      
      // Check for caching
      const hasCaching = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('cache') || content.includes('memoiz') || content.includes('useMemo');
        } catch (error) {
          return false;
        }
      });
      
      metrics.hasCaching = hasCaching;
      if (!hasCaching) {
        issues.push('Limited caching implementation');
      }
      
      const status = issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warning' : 'fail';
      
      this.results.performance = { status, metrics, issues };
      
    } catch (error) {
      this.log(`Performance check error: ${error.message}`, 'error');
      this.results.performance = { 
        status: 'fail', 
        metrics: {}, 
        issues: ['Performance check failed'] 
      };
    }
    
    this.log(`Performance: ${this.results.performance.status.toUpperCase()}`, 
             this.results.performance.status === 'pass' ? 'success' : 
             this.results.performance.status === 'warning' ? 'warning' : 'error');
  }

  // 6. External Dependencies Assessment
  async assessExternalDependencies() {
    this.log('🌐 Assessing external dependencies...', 'info');
    
    const external = [];
    const risks = [];
    
    try {
      // Check package.json for external services
      if (fs.existsSync('./package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Identify risky external dependencies
        const riskyDeps = {
          'openai': 'OpenAI API - requires internet and API key',
          'axios': 'HTTP requests - may fail without internet',
          'react-query': 'Data fetching - needs network connectivity'
        };
        
        Object.keys(dependencies).forEach(dep => {
          if (riskyDeps[dep]) {
            external.push(dep);
            risks.push(riskyDeps[dep]);
          }
        });
      }
      
      // Check for hardcoded API URLs
      const sourceFiles = this.getAllSourceFiles();
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Look for external API calls
          const apiMatches = content.match(/https?:\/\/[^\s'"]+/g);
          if (apiMatches) {
            apiMatches.forEach(url => {
              if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
                external.push(`External API: ${url}`);
                risks.push(`Demo depends on external service: ${url}`);
              }
            });
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      // Check for environment variables
      if (fs.existsSync('.env') || fs.existsSync('.env.example')) {
        external.push('Environment variables required');
        risks.push('Demo may fail if environment variables not properly configured');
      }
      
      const status = risks.length === 0 ? 'pass' : risks.length <= 3 ? 'warning' : 'fail';
      
      this.results.dependencies = { status, external, risks };
      
    } catch (error) {
      this.log(`Dependencies assessment error: ${error.message}`, 'error');
      this.results.dependencies = { 
        status: 'fail', 
        external: [], 
        risks: ['Assessment failed'] 
      };
    }
    
    this.log(`Dependencies: ${this.results.dependencies.status.toUpperCase()} (${risks.length} risks)`, 
             this.results.dependencies.status === 'pass' ? 'success' : 
             this.results.dependencies.status === 'warning' ? 'warning' : 'error');
  }

  // Demo Scenario Test Methods
  async testHomepageLoad() {
    // Check if homepage components exist
    const homepageFiles = ['src/pages/Homepage.tsx', 'src/components/Homepage.tsx', 'src/Homepage.tsx'];
    const exists = homepageFiles.some(file => fs.existsSync(file));
    if (!exists) throw new Error('Homepage component not found');
    
    // Check for basic homepage elements
    const file = homepageFiles.find(f => fs.existsSync(f));
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('export') || !content.includes('return')) {
      throw new Error('Homepage component appears invalid');
    }
  }

  async testWorkspaceNavigation() {
    // Check if workspace page exists
    const workspaceFiles = ['src/pages/UltraWorkspacePage.tsx', 'src/pages/WorkspacePage.tsx'];
    const exists = workspaceFiles.some(file => fs.existsSync(file));
    if (!exists) throw new Error('Workspace page not found');
  }

  async testPromptFlow() {
    // Check if prompt input component exists
    const promptFiles = ['src/components/PremiumPromptInput.tsx', 'src/components/PromptInput.tsx'];
    const exists = promptFiles.some(file => fs.existsSync(file));
    if (!exists) throw new Error('Prompt input component not found');
  }

  async testBlockInteraction() {
    // Check if block components exist
    const blockFiles = ['src/components/BlockPalette.tsx', 'src/components/BlockNode.tsx'];
    const exists = blockFiles.every(file => fs.existsSync(file));
    if (!exists) throw new Error('Block interaction components missing');
  }

  async testExportFunctionality() {
    // Check if export service exists
    const exportFiles = ['src/export/UniversalExportService.ts', 'src/services/ExportService.ts'];
    const exists = exportFiles.some(file => fs.existsSync(file));
    if (!exists) throw new Error('Export functionality not found');
  }

  // Helper Methods
  getAllSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files = [];
    
    const scanDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = `${dir}/${item}`;
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
              scanDir(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
              files.push(fullPath);
            }
          } catch (error) {
            // Skip files that can't be accessed
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    };
    
    scanDir('./src');
    return files;
  }

  findDemoDataFiles() {
    const files = [];
    const dataPaths = ['src/data', 'data', 'demo', 'assets'];
    const dataExtensions = ['.json', '.csv', '.txt', '.js', '.ts'];
    
    dataPaths.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          const items = fs.readdirSync(dir, { recursive: true });
          items.forEach(item => {
            if (typeof item === 'string' && dataExtensions.some(ext => item.endsWith(ext))) {
              files.push(`${dir}/${item}`);
            }
          });
        } catch (error) {
          // Skip directories that can't be read
        }
      }
    });
    
    return files;
  }

  detectDataType(content) {
    try {
      JSON.parse(content);
      return 'JSON';
    } catch (error) {
      if (content.includes(',') && content.includes('\\n')) {
        return 'CSV';
      } else if (content.includes('export') || content.includes('const')) {
        return 'JS/TS';
      } else {
        return 'Text';
      }
    }
  }

  validateDataFormat(content) {
    try {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        JSON.parse(content);
        return true;
      }
      return content.length > 0;
    } catch (error) {
      return false;
    }
  }

  calculateDemoScore() {
    const statusScores = { pass: 100, warning: 70, fail: 0 };
    
    const scores = [
      statusScores[this.results.demoScript.status] || 0,
      statusScores[this.results.demoScenarios.status] || 0,
      statusScores[this.results.backupPlans.status] || 0,
      statusScores[this.results.preloadedData.status] || 0,
      statusScores[this.results.performance.status] || 0,
      statusScores[this.results.dependencies.status] || 0
    ];
    
    this.demoScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    return this.demoScore;
  }

  getRecommendation() {
    if (this.demoScore >= 90) {
      return 'GO: Demo is fully ready for hackathon presentation';
    } else if (this.demoScore >= 75) {
      return 'GO: Demo is ready with minor risks - prepare backup plans';
    } else if (this.demoScore >= 60) {
      return 'CAUTION: Demo has moderate risks - address critical issues first';
    } else {
      return 'NO-GO: Demo has major risks that could cause failure';
    }
  }

  async generateReport() {
    const demoScore = this.calculateDemoScore();
    
    const report = {
      timestamp: new Date().toISOString(),
      demoScore,
      recommendation: this.getRecommendation(),
      summary: {
        demoScript: this.results.demoScript.status,
        demoScenarios: this.results.demoScenarios.status,
        backupPlans: this.results.backupPlans.status,
        preloadedData: this.results.preloadedData.status,
        performance: this.results.performance.status,
        dependencies: this.results.dependencies.status
      },
      details: this.results,
      criticalActions: this.generateCriticalActions(),
      demoChecklist: this.generateDemoChecklist()
    };
    
    fs.writeFileSync('demo-readiness-report.json', JSON.stringify(report, null, 2));
    
    this.log(`📊 Demo Readiness Score: ${demoScore}/100`, 
             demoScore >= 75 ? 'success' : 'warning');
    this.log(`Recommendation: ${report.recommendation}`, 
             report.recommendation.startsWith('GO') ? 'success' : 'warning');
    
    return report;
  }

  generateCriticalActions() {
    const actions = [];
    
    Object.entries(this.results).forEach(([category, result]) => {
      if (result.status === 'fail') {
        actions.push({
          category: category.replace(/([A-Z])/g, ' $1').toLowerCase(),
          priority: 'CRITICAL',
          issues: result.issues || result.failed || result.missing || result.risks || [],
          recommendations: result.recommendations || []
        });
      }
    });
    
    return actions;
  }

  generateDemoChecklist() {
    return [
      '☐ Build application (npm run build)',
      '☐ Test demo flow end-to-end',
      '☐ Prepare backup data files',
      '☐ Check internet connectivity requirements',
      '☐ Verify all demo scenarios work',
      '☐ Practice demo timing (5 minutes)',
      '☐ Prepare answers for common questions',
      '☐ Have backup plans ready for failures',
      '☐ Test on demo environment/hardware',
      '☐ Validate all external dependencies work'
    ];
  }

  async runCheck() {
    this.log('🎯 Starting Demo Readiness Check...', 'info');
    
    await this.validateDemoScript();
    await this.testDemoScenarios();
    await this.assessBackupPlans();
    await this.validatePreloadedData();
    await this.checkPerformanceOptimization();
    await this.assessExternalDependencies();
    
    const report = await this.generateReport();
    
    this.log('✅ Demo readiness check completed!', 'success');
    return report;
  }
}

// Run check if called directly
if (require.main === module) {
  const checker = new DemoReadinessChecker();
  checker.runCheck().catch(console.error);
}

module.exports = DemoReadinessChecker;
