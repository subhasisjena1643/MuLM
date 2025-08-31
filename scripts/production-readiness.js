#!/usr/bin/env node
/**
 * µLM Production Readiness Assessment
 * Comprehensive analysis of code quality, security, performance, and scalability
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionReadinessAssessment {
  constructor() {
    this.results = {
      codeQuality: { score: 0, issues: [], recommendations: [] },
      security: { score: 0, vulnerabilities: [], recommendations: [] },
      performance: { score: 0, metrics: {}, recommendations: [] },
      scalability: { score: 0, concerns: [], recommendations: [] },
      reliability: { score: 0, issues: [], recommendations: [] },
      maintainability: { score: 0, metrics: {}, recommendations: [] }
    };
    this.overallScore = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[PROD] ${message}${colors.reset}`);
  }

  // 1. Code Quality Assessment
  async assessCodeQuality() {
    this.log('📊 Assessing code quality...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      // TypeScript configuration check
      const tsConfigPath = './tsconfig.json';
      if (fs.existsSync(tsConfigPath)) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
        
        if (!tsConfig.compilerOptions?.strict) {
          issues.push('TypeScript strict mode not enabled');
          recommendations.push('Enable strict mode in tsconfig.json for better type safety');
          score -= 10;
        }
        
        if (!tsConfig.compilerOptions?.noUnusedLocals) {
          recommendations.push('Consider enabling noUnusedLocals for cleaner code');
          score -= 5;
        }
      } else {
        issues.push('TypeScript configuration missing');
        score -= 20;
      }
      
      // ESLint configuration check
      const eslintConfigPaths = ['.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json'];
      const hasEslintConfig = eslintConfigPaths.some(config => fs.existsSync(config));
      
      if (!hasEslintConfig) {
        issues.push('ESLint configuration missing');
        recommendations.push('Add ESLint configuration for code quality enforcement');
        score -= 15;
      }
      
      // Analyze source files
      const sourceFiles = this.getAllSourceFiles();
      let totalLines = 0;
      let filesWithTodos = 0;
      let filesWithConsoleLog = 0;
      let filesWithAnyType = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n');
          totalLines += lines.length;
          
          if (content.includes('TODO') || content.includes('FIXME')) {
            filesWithTodos++;
          }
          
          if (content.includes('console.log') && !file.includes('test')) {
            filesWithConsoleLog++;
          }
          
          if (content.includes(': any') || content.includes('as any')) {
            filesWithAnyType++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      // Calculate metrics
      const avgLinesPerFile = Math.round(totalLines / sourceFiles.length);
      const todoPercentage = (filesWithTodos / sourceFiles.length) * 100;
      const consoleLogPercentage = (filesWithConsoleLog / sourceFiles.length) * 100;
      const anyTypePercentage = (filesWithAnyType / sourceFiles.length) * 100;
      
      // Apply score penalties
      if (avgLinesPerFile > 300) {
        issues.push(`Large files detected (avg ${avgLinesPerFile} lines per file)`);
        recommendations.push('Consider breaking down large files into smaller modules');
        score -= 10;
      }
      
      if (todoPercentage > 20) {
        issues.push(`High number of TODO comments (${todoPercentage.toFixed(1)}% of files)`);
        recommendations.push('Address outstanding TODO items before production');
        score -= 15;
      }
      
      if (consoleLogPercentage > 10) {
        issues.push(`Console.log statements found in ${consoleLogPercentage.toFixed(1)}% of files`);
        recommendations.push('Replace console.log with proper logging system');
        score -= 10;
      }
      
      if (anyTypePercentage > 15) {
        issues.push(`'any' type usage found in ${anyTypePercentage.toFixed(1)}% of files`);
        recommendations.push('Replace any types with proper TypeScript types');
        score -= 15;
      }
      
      this.results.codeQuality = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          totalFiles: sourceFiles.length,
          totalLines,
          avgLinesPerFile,
          todoPercentage: todoPercentage.toFixed(1) + '%',
          consoleLogPercentage: consoleLogPercentage.toFixed(1) + '%',
          anyTypePercentage: anyTypePercentage.toFixed(1) + '%'
        }
      };
      
    } catch (error) {
      this.log(`Code quality assessment error: ${error.message}`, 'error');
      this.results.codeQuality.score = 50;
      this.results.codeQuality.issues.push('Assessment partially failed');
    }
    
    this.log(`Code Quality Score: ${this.results.codeQuality.score}/100`, 
             this.results.codeQuality.score >= 80 ? 'success' : 'warning');
  }

  // 2. Security Assessment
  async assessSecurity() {
    this.log('🔒 Assessing security...', 'info');
    
    let score = 100;
    const vulnerabilities = [];
    const recommendations = [];
    
    try {
      // Check package.json for known vulnerable packages
      const packageJsonPath = './package.json';
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check for common vulnerable patterns
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for outdated React
        if (dependencies.react && dependencies.react.startsWith('^17')) {
          recommendations.push('Update React to latest version for security patches');
          score -= 5;
        }
        
        // Check for dangerous eval usage
        const sourceFiles = this.getAllSourceFiles();
        let evalUsage = 0;
        let dangerousInnerHTML = 0;
        let httpUsage = 0;
        
        sourceFiles.forEach(file => {
          try {
            const content = fs.readFileSync(file, 'utf8');
            
            if (content.includes('eval(') || content.includes('Function(')) {
              evalUsage++;
            }
            
            if (content.includes('dangerouslySetInnerHTML')) {
              dangerousInnerHTML++;
            }
            
            if (content.includes('http://') && !content.includes('localhost')) {
              httpUsage++;
            }
            
          } catch (error) {
            // Skip files that can't be read
          }
        });
        
        if (evalUsage > 0) {
          vulnerabilities.push(`eval() usage found in ${evalUsage} files`);
          recommendations.push('Replace eval() with safer alternatives');
          score -= 20;
        }
        
        if (dangerousInnerHTML > 0) {
          vulnerabilities.push(`dangerouslySetInnerHTML usage found in ${dangerousInnerHTML} files`);
          recommendations.push('Sanitize HTML content or use safer rendering methods');
          score -= 15;
        }
        
        if (httpUsage > 0) {
          vulnerabilities.push(`Insecure HTTP URLs found in ${httpUsage} files`);
          recommendations.push('Replace HTTP URLs with HTTPS');
          score -= 10;
        }
        
        // Check for environment variable exposure
        if (fs.existsSync('.env')) {
          const envContent = fs.readFileSync('.env', 'utf8');
          if (envContent.includes('API_KEY') || envContent.includes('SECRET')) {
            recommendations.push('Ensure sensitive environment variables are not committed to version control');
          }
        }
      }
      
      this.results.security = {
        score: Math.max(0, score),
        vulnerabilities,
        recommendations,
        checkedItems: [
          'Package vulnerabilities',
          'Code injection patterns',
          'Insecure HTTP usage',
          'Environment variable exposure'
        ]
      };
      
    } catch (error) {
      this.log(`Security assessment error: ${error.message}`, 'error');
      this.results.security.score = 70;
      this.results.security.vulnerabilities.push('Assessment partially failed');
    }
    
    this.log(`Security Score: ${this.results.security.score}/100`, 
             this.results.security.score >= 85 ? 'success' : 'warning');
  }

  // 3. Performance Assessment
  async assessPerformance() {
    this.log('⚡ Assessing performance...', 'info');
    
    let score = 100;
    const recommendations = [];
    const metrics = {};
    
    try {
      // Bundle size analysis
      const distPath = './dist';
      if (fs.existsSync(distPath)) {
        const distFiles = fs.readdirSync(distPath, { recursive: true })
          .filter(file => typeof file === 'string' && file.endsWith('.js'));
        
        let totalBundleSize = 0;
        distFiles.forEach(file => {
          try {
            const filePath = path.join(distPath, file);
            const stats = fs.statSync(filePath);
            totalBundleSize += stats.size;
          } catch (error) {
            // Skip files that can't be read
          }
        });
        
        const bundleSizeMB = totalBundleSize / (1024 * 1024);
        metrics.bundleSizeMB = bundleSizeMB.toFixed(2);
        
        if (bundleSizeMB > 2) {
          recommendations.push(`Bundle size is large (${bundleSizeMB.toFixed(2)}MB) - consider code splitting`);
          score -= 15;
        } else if (bundleSizeMB > 1) {
          recommendations.push('Consider optimizing bundle size for better performance');
          score -= 5;
        }
      } else {
        metrics.bundleSizeMB = 'Not built';
        recommendations.push('Build the application to analyze bundle size');
      }
      
      // Source code performance analysis
      const sourceFiles = this.getAllSourceFiles();
      let largeFiles = 0;
      let filesWithInlineStyles = 0;
      let filesWithUnoptimizedImages = 0;
      
      sourceFiles.forEach(file => {
        try {
          const stats = fs.statSync(file);
          const content = fs.readFileSync(file, 'utf8');
          
          if (stats.size > 100000) { // > 100KB
            largeFiles++;
          }
          
          if (content.includes('style={{') && content.split('style={{').length > 10) {
            filesWithInlineStyles++;
          }
          
          if (content.includes('.png') || content.includes('.jpg') || content.includes('.jpeg')) {
            if (!content.includes('lazy') && !content.includes('loading=')) {
              filesWithUnoptimizedImages++;
            }
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      metrics.largeFiles = largeFiles;
      metrics.inlineStyleFiles = filesWithInlineStyles;
      metrics.unoptimizedImageFiles = filesWithUnoptimizedImages;
      
      if (largeFiles > sourceFiles.length * 0.1) {
        recommendations.push(`${largeFiles} large files detected - consider code splitting`);
        score -= 10;
      }
      
      if (filesWithInlineStyles > 5) {
        recommendations.push('Excessive inline styles detected - consider CSS modules or styled-components');
        score -= 5;
      }
      
      if (filesWithUnoptimizedImages > 0) {
        recommendations.push('Add lazy loading to images for better performance');
        score -= 5;
      }
      
      // Check for performance optimization patterns
      const hasReactMemo = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('React.memo') || content.includes('useMemo') || content.includes('useCallback');
        } catch (error) {
          return false;
        }
      });
      
      if (hasReactMemo) {
        metrics.hasOptimizations = 'Yes';
      } else {
        metrics.hasOptimizations = 'No';
        recommendations.push('Consider using React.memo, useMemo, and useCallback for optimization');
        score -= 10;
      }
      
      this.results.performance = {
        score: Math.max(0, score),
        metrics,
        recommendations
      };
      
    } catch (error) {
      this.log(`Performance assessment error: ${error.message}`, 'error');
      this.results.performance.score = 60;
      this.results.performance.recommendations.push('Assessment partially failed');
    }
    
    this.log(`Performance Score: ${this.results.performance.score}/100`, 
             this.results.performance.score >= 75 ? 'success' : 'warning');
  }

  // 4. Scalability Assessment
  async assessScalability() {
    this.log('📈 Assessing scalability...', 'info');
    
    let score = 100;
    const concerns = [];
    const recommendations = [];
    
    try {
      // Architecture analysis
      const hasStateManagement = fs.existsSync('./src/store') || 
                                fs.existsSync('./src/context') ||
                                this.hasPackageDependency('redux') ||
                                this.hasPackageDependency('zustand');
      
      if (!hasStateManagement) {
        concerns.push('No centralized state management detected');
        recommendations.push('Consider implementing Redux, Zustand, or Context API for state management');
        score -= 15;
      }
      
      // Component structure analysis
      const componentFiles = this.getAllSourceFiles()
        .filter(file => file.includes('/components/') && file.endsWith('.tsx'));
      
      if (componentFiles.length > 50) {
        recommendations.push('Large number of components - ensure proper organization and lazy loading');
        score -= 5;
      }
      
      // API handling
      const hasApiLayer = this.getAllSourceFiles().some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('fetch(') || content.includes('axios') || content.includes('api');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasApiLayer) {
        concerns.push('Limited API integration detected');
        recommendations.push('Implement proper API layer with error handling and caching');
        score -= 10;
      }
      
      // Error boundary check
      const hasErrorBoundary = this.getAllSourceFiles().some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('ErrorBoundary') || content.includes('componentDidCatch');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasErrorBoundary) {
        concerns.push('No error boundaries detected');
        recommendations.push('Implement error boundaries for better user experience');
        score -= 10;
      }
      
      // Testing infrastructure
      const hasTests = fs.existsSync('./src/test') || 
                      fs.existsSync('./tests') ||
                      this.hasPackageDependency('jest') ||
                      this.hasPackageDependency('vitest');
      
      if (!hasTests) {
        concerns.push('Limited testing infrastructure');
        recommendations.push('Implement comprehensive testing strategy');
        score -= 20;
      }
      
      this.results.scalability = {
        score: Math.max(0, score),
        concerns,
        recommendations,
        checkedAspects: [
          'State management',
          'Component organization',
          'API integration',
          'Error handling',
          'Testing infrastructure'
        ]
      };
      
    } catch (error) {
      this.log(`Scalability assessment error: ${error.message}`, 'error');
      this.results.scalability.score = 60;
      this.results.scalability.concerns.push('Assessment partially failed');
    }
    
    this.log(`Scalability Score: ${this.results.scalability.score}/100`, 
             this.results.scalability.score >= 70 ? 'success' : 'warning');
  }

  // 5. Reliability Assessment
  async assessReliability() {
    this.log('🛡️ Assessing reliability...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      // Error handling analysis
      const sourceFiles = this.getAllSourceFiles();
      let filesWithTryCatch = 0;
      let filesWithErrorHandling = 0;
      let totalAsyncFunctions = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          if (content.includes('try {') && content.includes('catch')) {
            filesWithTryCatch++;
          }
          
          if (content.includes('.catch(') || content.includes('onError') || content.includes('error')) {
            filesWithErrorHandling++;
          }
          
          const asyncMatches = content.match(/async\s+function|async\s+\(/g);
          if (asyncMatches) {
            totalAsyncFunctions += asyncMatches.length;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      const errorHandlingPercentage = (filesWithErrorHandling / sourceFiles.length) * 100;
      
      if (errorHandlingPercentage < 30) {
        issues.push(`Low error handling coverage (${errorHandlingPercentage.toFixed(1)}%)`);
        recommendations.push('Implement comprehensive error handling across components');
        score -= 20;
      }
      
      // Logging infrastructure
      const hasLogging = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('logger') || content.includes('log.') || content.includes('winston');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasLogging) {
        issues.push('No structured logging system detected');
        recommendations.push('Implement proper logging for debugging and monitoring');
        score -= 15;
      }
      
      // Graceful degradation
      const hasLoadingStates = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('loading') || content.includes('isLoading') || content.includes('Spinner');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasLoadingStates) {
        issues.push('Limited loading state management');
        recommendations.push('Add loading states and skeleton components');
        score -= 10;
      }
      
      this.results.reliability = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          errorHandlingPercentage: errorHandlingPercentage.toFixed(1) + '%',
          asyncFunctions: totalAsyncFunctions,
          hasLogging,
          hasLoadingStates
        }
      };
      
    } catch (error) {
      this.log(`Reliability assessment error: ${error.message}`, 'error');
      this.results.reliability.score = 60;
      this.results.reliability.issues.push('Assessment partially failed');
    }
    
    this.log(`Reliability Score: ${this.results.reliability.score}/100`, 
             this.results.reliability.score >= 75 ? 'success' : 'warning');
  }

  // 6. Maintainability Assessment
  async assessMaintainability() {
    this.log('🔧 Assessing maintainability...', 'info');
    
    let score = 100;
    const recommendations = [];
    const metrics = {};
    
    try {
      // Documentation analysis
      const hasReadme = fs.existsSync('./README.md');
      const hasChangelog = fs.existsSync('./CHANGELOG.md');
      const hasContributing = fs.existsSync('./CONTRIBUTING.md');
      
      metrics.documentation = {
        readme: hasReadme,
        changelog: hasChangelog,
        contributing: hasContributing
      };
      
      if (!hasReadme) {
        recommendations.push('Add comprehensive README.md');
        score -= 10;
      }
      
      // Code organization
      const srcStructure = this.analyzeSrcStructure();
      metrics.srcStructure = srcStructure;
      
      if (!srcStructure.hasComponents) {
        recommendations.push('Organize components in dedicated folder');
        score -= 15;
      }
      
      if (!srcStructure.hasServices) {
        recommendations.push('Extract business logic into service files');
        score -= 10;
      }
      
      // Comment density
      const sourceFiles = this.getAllSourceFiles();
      let totalLines = 0;
      let commentLines = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n');
          totalLines += lines.length;
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
              commentLines++;
            }
          });
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      const commentDensity = (commentLines / totalLines) * 100;
      metrics.commentDensity = commentDensity.toFixed(1) + '%';
      
      if (commentDensity < 5) {
        recommendations.push('Add more code comments for better maintainability');
        score -= 10;
      }
      
      // TypeScript usage
      const tsFiles = sourceFiles.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
      const jsFiles = sourceFiles.filter(file => file.endsWith('.js') || file.endsWith('.jsx'));
      const tsPercentage = (tsFiles.length / (tsFiles.length + jsFiles.length)) * 100;
      
      metrics.typeScriptUsage = tsPercentage.toFixed(1) + '%';
      
      if (tsPercentage < 80) {
        recommendations.push('Migrate more files to TypeScript for better type safety');
        score -= 15;
      }
      
      this.results.maintainability = {
        score: Math.max(0, score),
        metrics,
        recommendations
      };
      
    } catch (error) {
      this.log(`Maintainability assessment error: ${error.message}`, 'error');
      this.results.maintainability.score = 60;
      this.results.maintainability.recommendations.push('Assessment partially failed');
    }
    
    this.log(`Maintainability Score: ${this.results.maintainability.score}/100`, 
             this.results.maintainability.score >= 75 ? 'success' : 'warning');
  }

  // Helper Methods
  getAllSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files = [];
    
    const scanDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
            scanDir(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Ignore permission errors
      }
    };
    
    scanDir('./src');
    return files;
  }

  hasPackageDependency(packageName) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return !!dependencies[packageName];
    } catch (error) {
      return false;
    }
  }

  analyzeSrcStructure() {
    const structure = {
      hasComponents: false,
      hasServices: false,
      hasUtils: false,
      hasTypes: false,
      hasTests: false
    };
    
    try {
      if (fs.existsSync('./src/components')) structure.hasComponents = true;
      if (fs.existsSync('./src/services')) structure.hasServices = true;
      if (fs.existsSync('./src/utils')) structure.hasUtils = true;
      if (fs.existsSync('./src/types')) structure.hasTypes = true;
      if (fs.existsSync('./src/test') || fs.existsSync('./src/__tests__')) structure.hasTests = true;
    } catch (error) {
      // Ignore errors
    }
    
    return structure;
  }

  calculateOverallScore() {
    const scores = [
      this.results.codeQuality.score,
      this.results.security.score,
      this.results.performance.score,
      this.results.scalability.score,
      this.results.reliability.score,
      this.results.maintainability.score
    ];
    
    this.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    return this.overallScore;
  }

  getRecommendation() {
    if (this.overallScore >= 85) {
      return 'GO: Excellent production readiness';
    } else if (this.overallScore >= 75) {
      return 'GO: Good production readiness with minor improvements needed';
    } else if (this.overallScore >= 65) {
      return 'CAUTION: Moderate production readiness - address key issues';
    } else {
      return 'NO-GO: Significant production readiness issues detected';
    }
  }

  async generateReport() {
    const overallScore = this.calculateOverallScore();
    
    const report = {
      timestamp: new Date().toISOString(),
      overallScore,
      recommendation: this.getRecommendation(),
      summary: {
        codeQuality: this.results.codeQuality.score,
        security: this.results.security.score,
        performance: this.results.performance.score,
        scalability: this.results.scalability.score,
        reliability: this.results.reliability.score,
        maintainability: this.results.maintainability.score
      },
      details: this.results,
      priorityActions: this.generatePriorityActions()
    };
    
    fs.writeFileSync('production-readiness-report.json', JSON.stringify(report, null, 2));
    
    this.log(`📊 Overall Production Readiness Score: ${overallScore}/100`, 
             overallScore >= 75 ? 'success' : 'warning');
    this.log(`Recommendation: ${report.recommendation}`, 
             report.recommendation.startsWith('GO') ? 'success' : 'warning');
    
    return report;
  }

  generatePriorityActions() {
    const actions = [];
    
    // Collect high-priority actions from all assessments
    if (this.results.security.score < 80) {
      actions.push({
        category: 'Security',
        priority: 'HIGH',
        action: 'Address security vulnerabilities',
        impact: 'Critical for production deployment'
      });
    }
    
    if (this.results.performance.score < 70) {
      actions.push({
        category: 'Performance',
        priority: 'HIGH',
        action: 'Optimize application performance',
        impact: 'User experience and demo success'
      });
    }
    
    if (this.results.reliability.score < 70) {
      actions.push({
        category: 'Reliability',
        priority: 'MEDIUM',
        action: 'Improve error handling and logging',
        impact: 'Application stability'
      });
    }
    
    return actions;
  }

  async runAssessment() {
    this.log('🎯 Starting Production Readiness Assessment...', 'info');
    
    await this.assessCodeQuality();
    await this.assessSecurity();
    await this.assessPerformance();
    await this.assessScalability();
    await this.assessReliability();
    await this.assessMaintainability();
    
    const report = await this.generateReport();
    
    this.log('✅ Production readiness assessment completed!', 'success');
    return report;
  }
}

// Run assessment if called directly
if (require.main === module) {
  const assessment = new ProductionReadinessAssessment();
  assessment.runAssessment().catch(console.error);
}

module.exports = ProductionReadinessAssessment;
