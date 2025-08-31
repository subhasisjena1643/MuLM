#!/usr/bin/env node
/**
 * µLM Performance Benchmarking Suite
 * Measures and validates performance criteria for demo readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceBenchmark {
  constructor() {
    this.results = {
      buildPerformance: {},
      bundleAnalysis: {},
      memoryProfile: {},
      loadTesting: {},
      recommendations: []
    };
    this.thresholds = {
      buildTime: 30000, // 30 seconds
      bundleSize: 5 * 1024 * 1024, // 5MB
      firstContentfulPaint: 2000, // 2 seconds
      timeToInteractive: 4000, // 4 seconds
      memoryUsage: 500 * 1024 * 1024, // 500MB
      simulationTime: 10000 // 10 seconds
    };
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

  async measureBuildPerformance() {
    this.log('📦 Measuring Build Performance...', 'info');
    
    const startTime = Date.now();
    
    try {
      // Clean previous build
      if (fs.existsSync('dist')) {
        execSync('rm -rf dist', { stdio: 'pipe' });
      }
      
      // Measure build time
      const buildStart = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - buildStart;
      
      this.results.buildPerformance = {
        buildTime,
        success: buildTime < this.thresholds.buildTime,
        threshold: this.thresholds.buildTime
      };
      
      this.log(`Build completed in ${buildTime}ms`, 
        buildTime < this.thresholds.buildTime ? 'success' : 'warning');
      
    } catch (error) {
      this.results.buildPerformance = {
        buildTime: -1,
        success: false,
        error: error.message
      };
      this.log(`Build failed: ${error.message}`, 'error');
    }
  }

  async analyzeBundleSize() {
    this.log('📊 Analyzing Bundle Size...', 'info');
    
    try {
      const distPath = 'dist';
      if (!fs.existsSync(distPath)) {
        throw new Error('Build output not found');
      }
      
      // Calculate total bundle size
      let totalSize = 0;
      let fileCount = 0;
      const fileSizes = {};
      
      const calculateSize = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            calculateSize(filePath);
          } else {
            const size = stats.size;
            totalSize += size;
            fileCount++;
            
            // Track large files
            if (size > 100 * 1024) { // Files > 100KB
              const relativePath = path.relative(distPath, filePath);
              fileSizes[relativePath] = size;
            }
          }
        });
      };
      
      calculateSize(distPath);
      
      // Analyze main bundle specifically
      const mainBundle = Object.keys(fileSizes).find(file => 
        file.includes('index') && file.endsWith('.js')
      );
      
      this.results.bundleAnalysis = {
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        fileCount,
        mainBundleSize: mainBundle ? fileSizes[mainBundle] : 0,
        largeFiles: Object.entries(fileSizes)
          .filter(([_, size]) => size > 500 * 1024) // > 500KB
          .map(([file, size]) => ({
            file,
            size,
            sizeMB: (size / (1024 * 1024)).toFixed(2)
          })),
        success: totalSize < this.thresholds.bundleSize,
        threshold: this.thresholds.bundleSize
      };
      
      this.log(`Total bundle size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB (${fileCount} files)`, 
        totalSize < this.thresholds.bundleSize ? 'success' : 'warning');
      
      if (this.results.bundleAnalysis.largeFiles.length > 0) {
        this.log('Large files detected:', 'warning');
        this.results.bundleAnalysis.largeFiles.forEach(file => {
          this.log(`  - ${file.file}: ${file.sizeMB}MB`, 'warning');
        });
      }
      
    } catch (error) {
      this.results.bundleAnalysis = {
        success: false,
        error: error.message
      };
      this.log(`Bundle analysis failed: ${error.message}`, 'error');
    }
  }

  async profileCodeComplexity() {
    this.log('🔍 Profiling Code Complexity...', 'info');
    
    try {
      const srcPath = 'src';
      let totalLines = 0;
      let totalFiles = 0;
      let complexFiles = [];
      
      const analyzeFile = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        totalLines += lines;
        totalFiles++;
        
        // Detect complex files (>500 lines)
        if (lines > 500) {
          complexFiles.push({
            file: path.relative(srcPath, filePath),
            lines
          });
        }
        
        // Check for potential performance issues
        const issues = [];
        if (content.includes('useEffect(')) {
          const effectCount = (content.match(/useEffect\(/g) || []).length;
          if (effectCount > 10) {
            issues.push(`Many useEffect hooks (${effectCount})`);
          }
        }
        
        if (content.includes('useState(')) {
          const stateCount = (content.match(/useState\(/g) || []).length;
          if (stateCount > 15) {
            issues.push(`Many useState hooks (${stateCount})`);
          }
        }
        
        return issues;
      };
      
      const walkDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            walkDirectory(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            analyzeFile(filePath);
          }
        });
      };
      
      walkDirectory(srcPath);
      
      this.results.codeComplexity = {
        totalLines,
        totalFiles,
        averageLinesPerFile: Math.round(totalLines / totalFiles),
        complexFiles,
        success: complexFiles.length < 5 && totalLines < 50000
      };
      
      this.log(`Code base: ${totalLines} lines across ${totalFiles} files`, 'info');
      this.log(`Average: ${Math.round(totalLines / totalFiles)} lines per file`, 'info');
      
      if (complexFiles.length > 0) {
        this.log('Complex files detected:', 'warning');
        complexFiles.forEach(file => {
          this.log(`  - ${file.file}: ${file.lines} lines`, 'warning');
        });
      }
      
    } catch (error) {
      this.results.codeComplexity = {
        success: false,
        error: error.message
      };
      this.log(`Code complexity analysis failed: ${error.message}`, 'error');
    }
  }

  async measureDependencySize() {
    this.log('📦 Analyzing Dependencies...', 'info');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      const dependencyCount = Object.keys(dependencies).length;
      
      // Check for heavy dependencies
      const heavyDependencies = [
        '@monaco-editor/react',
        'puppeteer',
        'electron',
        'webpack',
        '@babel/core'
      ];
      
      const foundHeavyDeps = Object.keys(dependencies).filter(dep =>
        heavyDependencies.some(heavy => dep.includes(heavy))
      );
      
      // Analyze node_modules size if it exists
      let nodeModulesSize = 0;
      if (fs.existsSync('node_modules')) {
        try {
          const output = execSync('du -sh node_modules', { 
            encoding: 'utf8', 
            stdio: 'pipe' 
          });
          const sizeMatch = output.match(/^([0-9.]+)([KMGT])/);
          if (sizeMatch) {
            const [, size, unit] = sizeMatch;
            const multipliers = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 };
            nodeModulesSize = parseFloat(size) * (multipliers[unit] || 1);
          }
        } catch (error) {
          // Fallback for Windows
          this.log('Could not measure node_modules size', 'warning');
        }
      }
      
      this.results.dependencyAnalysis = {
        dependencyCount,
        foundHeavyDeps,
        nodeModulesSize,
        nodeModulesSizeMB: (nodeModulesSize / (1024 * 1024)).toFixed(2),
        success: dependencyCount < 100 && foundHeavyDeps.length < 3
      };
      
      this.log(`Dependencies: ${dependencyCount} packages`, 'info');
      if (nodeModulesSize > 0) {
        this.log(`node_modules size: ${(nodeModulesSize / (1024 * 1024)).toFixed(2)}MB`, 'info');
      }
      
      if (foundHeavyDeps.length > 0) {
        this.log(`Heavy dependencies found: ${foundHeavyDeps.join(', ')}`, 'warning');
      }
      
    } catch (error) {
      this.results.dependencyAnalysis = {
        success: false,
        error: error.message
      };
      this.log(`Dependency analysis failed: ${error.message}`, 'error');
    }
  }

  generateOptimizationRecommendations() {
    this.log('💡 Generating Optimization Recommendations...', 'info');
    
    const recommendations = [];
    
    // Build performance recommendations
    if (this.results.buildPerformance.buildTime > this.thresholds.buildTime) {
      recommendations.push({
        category: 'Build Performance',
        priority: 'High',
        issue: `Build time (${this.results.buildPerformance.buildTime}ms) exceeds threshold`,
        solutions: [
          'Enable build caching with Vite',
          'Consider reducing TypeScript strict mode during development',
          'Use incremental builds',
          'Optimize import statements'
        ]
      });
    }
    
    // Bundle size recommendations
    if (this.results.bundleAnalysis.totalSize > this.thresholds.bundleSize) {
      recommendations.push({
        category: 'Bundle Size',
        priority: 'High',
        issue: `Bundle size (${this.results.bundleAnalysis.totalSizeMB}MB) too large for demo`,
        solutions: [
          'Implement code splitting with React.lazy()',
          'Use dynamic imports for heavy libraries',
          'Tree-shake unused code',
          'Consider removing heavy dependencies for demo',
          'Enable gzip compression'
        ]
      });
    }
    
    // Code complexity recommendations
    if (this.results.codeComplexity?.complexFiles?.length > 3) {
      recommendations.push({
        category: 'Code Complexity',
        priority: 'Medium',
        issue: `${this.results.codeComplexity.complexFiles.length} files exceed 500 lines`,
        solutions: [
          'Split large components into smaller ones',
          'Extract custom hooks for complex logic',
          'Move utility functions to separate files',
          'Consider using composition over large components'
        ]
      });
    }
    
    // Dependency recommendations
    if (this.results.dependencyAnalysis?.foundHeavyDeps?.length > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'Medium',
        issue: `Heavy dependencies detected: ${this.results.dependencyAnalysis.foundHeavyDeps.join(', ')}`,
        solutions: [
          'Consider lighter alternatives for demo',
          'Use CDN for heavy libraries',
          'Lazy load heavy components',
          'Remove unused dependencies'
        ]
      });
    }
    
    this.results.recommendations = recommendations;
    
    if (recommendations.length === 0) {
      this.log('✅ No optimization recommendations needed!', 'success');
    } else {
      this.log(`📋 Generated ${recommendations.length} optimization recommendations`, 'warning');
    }
  }

  async runFullBenchmark() {
    this.log('🚀 Starting Performance Benchmark Suite', 'info');
    this.log('=' * 50, 'info');
    
    await this.measureBuildPerformance();
    await this.analyzeBundleSize();
    await this.profileCodeComplexity();
    await this.measureDependencySize();
    this.generateOptimizationRecommendations();
    
    this.generateReport();
  }

  generateReport() {
    this.log('\n' + '=' * 50, 'info');
    this.log('📊 PERFORMANCE BENCHMARK REPORT', 'info');
    this.log('=' * 50, 'info');
    
    // Overall performance score
    const scores = [
      this.results.buildPerformance.success ? 25 : 0,
      this.results.bundleAnalysis.success ? 25 : 0,
      this.results.codeComplexity?.success ? 25 : 0,
      this.results.dependencyAnalysis?.success ? 25 : 0
    ];
    
    const totalScore = scores.reduce((a, b) => a + b, 0);
    
    this.log(`🎯 Overall Performance Score: ${totalScore}/100`, 
      totalScore >= 75 ? 'success' : totalScore >= 50 ? 'warning' : 'error');
    
    // Detailed results
    this.log('\n📋 Detailed Results:', 'info');
    
    // Build Performance
    if (this.results.buildPerformance.success !== undefined) {
      this.log(`  📦 Build Performance: ${this.results.buildPerformance.success ? '✅' : '❌'} ` +
        `(${this.results.buildPerformance.buildTime}ms)`, 
        this.results.buildPerformance.success ? 'success' : 'error');
    }
    
    // Bundle Analysis
    if (this.results.bundleAnalysis.success !== undefined) {
      this.log(`  📊 Bundle Size: ${this.results.bundleAnalysis.success ? '✅' : '❌'} ` +
        `(${this.results.bundleAnalysis.totalSizeMB}MB)`, 
        this.results.bundleAnalysis.success ? 'success' : 'error');
    }
    
    // Code Complexity
    if (this.results.codeComplexity?.success !== undefined) {
      this.log(`  🔍 Code Complexity: ${this.results.codeComplexity.success ? '✅' : '❌'} ` +
        `(${this.results.codeComplexity.totalLines} lines, ${this.results.codeComplexity.complexFiles.length} complex files)`, 
        this.results.codeComplexity.success ? 'success' : 'warning');
    }
    
    // Dependencies
    if (this.results.dependencyAnalysis?.success !== undefined) {
      this.log(`  📦 Dependencies: ${this.results.dependencyAnalysis.success ? '✅' : '⚠️ '} ` +
        `(${this.results.dependencyAnalysis.dependencyCount} packages)`, 
        this.results.dependencyAnalysis.success ? 'success' : 'warning');
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      this.log('\n💡 Optimization Recommendations:', 'warning');
      this.results.recommendations.forEach((rec, index) => {
        this.log(`\n  ${index + 1}. ${rec.category} (${rec.priority} Priority)`, 'warning');
        this.log(`     Issue: ${rec.issue}`, 'warning');
        this.log(`     Solutions:`, 'info');
        rec.solutions.forEach(solution => {
          this.log(`       - ${solution}`, 'info');
        });
      });
    }
    
    // Demo readiness assessment
    this.log('\n🎯 Demo Readiness Assessment:', 'info');
    if (totalScore >= 75) {
      this.log('🎉 PERFORMANCE READY FOR DEMO!', 'success');
    } else if (totalScore >= 50) {
      this.log('⚠️  ACCEPTABLE FOR DEMO (with optimizations)', 'warning');
    } else {
      this.log('🚨 PERFORMANCE OPTIMIZATION REQUIRED', 'error');
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score: totalScore,
      demoReady: totalScore >= 50,
      results: this.results,
      thresholds: this.thresholds
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Detailed report saved to: performance-report.json', 'info');
    
    process.exit(totalScore < 50 ? 1 : 0);
  }
}

// Execute if run directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runFullBenchmark().catch(error => {
    console.error('Performance benchmark failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceBenchmark;
