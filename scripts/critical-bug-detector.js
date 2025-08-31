#!/usr/bin/env node
/**
 * µLM Critical Bug Detection Suite
 * Automated detection of demo-breaking issues
 */

const fs = require('fs');
const { execSync } = require('child_process');

class CriticalBugDetector {
  constructor() {
    this.results = {
      runtimeErrors: { critical: [], warnings: [], info: [] },
      apiFailures: { failed: [], working: [], unreachable: [] },
      uiIssues: { blocking: [], cosmetic: [], accessibility: [] },
      dataIssues: { corruption: [], missing: [], invalid: [] },
      memoryLeaks: { detected: [], potential: [], clean: [] },
      compatibility: { issues: [], supported: [], untested: [] }
    };
    this.bugSeverity = 'unknown';
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[BUG] ${message}${colors.reset}`);
  }

  // 1. Runtime Error Detection
  async detectRuntimeErrors() {
    this.log('🔍 Detecting runtime errors...', 'info');
    
    const critical = [];
    const warnings = [];
    const info = [];
    
    try {
      // Check for TypeScript compilation errors
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe', timeout: 30000 });
        info.push('TypeScript compilation clean');
      } catch (error) {
        const output = error.stdout?.toString() || error.stderr?.toString() || '';
        
        // Parse TypeScript errors
        const errorLines = output.split('\\n').filter(line => line.includes('error'));
        errorLines.forEach(line => {
          if (line.includes('Cannot find module') || line.includes('Module not found')) {
            critical.push(`Missing module: ${line.substring(line.indexOf('error') + 5)}`);
          } else if (line.includes('Property') && line.includes('does not exist')) {
            warnings.push(`Type error: ${line.substring(line.indexOf('error') + 5)}`);
          } else if (line.includes('Type') && line.includes('is not assignable')) {
            warnings.push(`Type mismatch: ${line.substring(line.indexOf('error') + 5)}`);
          }
        });
        
        if (errorLines.length > 0) {
          this.log(`Found ${errorLines.length} TypeScript errors`, 'warning');
        }
      }
      
      // Check for common runtime error patterns in source
      const sourceFiles = this.getAllSourceFiles();
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check for undefined property access
          const undefinedAccess = content.match(/\\.[a-zA-Z]+(?=\\s*[^\\w])/g);
          if (undefinedAccess && content.includes('undefined')) {
            warnings.push(`Potential undefined access in ${fileName}`);
          }
          
          // Check for unhandled promises
          if (content.includes('async') && !content.includes('catch') && !content.includes('.catch')) {
            warnings.push(`Unhandled async operations in ${fileName}`);
          }
          
          // Check for React key warnings
          if (content.includes('.map(') && !content.includes('key=')) {
            warnings.push(`Missing React keys in ${fileName}`);
          }
          
          // Check for console errors
          if (content.includes('console.error') || content.includes('throw new Error')) {
            info.push(`Error handling found in ${fileName}`);
          }
          
          // Check for null/undefined checks
          const nullChecks = (content.match(/!== null|!== undefined|\\?\\./g) || []).length;
          const propertyAccess = (content.match(/\\.[a-zA-Z]/g) || []).length;
          
          if (propertyAccess > 10 && nullChecks < propertyAccess * 0.1) {
            warnings.push(`Insufficient null checking in ${fileName}`);
          }
          
        } catch (error) {
          warnings.push(`Could not analyze ${file}: ${error.message}`);
        }
      });
      
      this.results.runtimeErrors = { critical, warnings, info };
      
    } catch (error) {
      critical.push(`Runtime error detection failed: ${error.message}`);
      this.results.runtimeErrors = { critical, warnings, info };
    }
    
    this.log(`Runtime Errors: ${critical.length} critical, ${warnings.length} warnings`, 
             critical.length === 0 ? 'success' : 'error');
  }

  // 2. API Endpoint Failure Detection
  async detectApiFailures() {
    this.log('🌐 Detecting API failures...', 'info');
    
    const failed = [];
    const working = [];
    const unreachable = [];
    
    try {
      // Find API service files
      const apiFiles = this.getAllSourceFiles().filter(file => 
        file.includes('Service') && (file.includes('AI') || file.includes('api') || file.includes('export'))
      );
      
      apiFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check for API key requirements
          if (content.includes('API_KEY') || content.includes('apiKey')) {
            if (content.includes('process.env') && !fs.existsSync('.env')) {
              failed.push(`${fileName}: Missing .env file for API keys`);
            } else {
              working.push(`${fileName}: API key configuration found`);
            }
          }
          
          // Check for error handling in API calls
          if (content.includes('fetch(') || content.includes('axios')) {
            if (!content.includes('catch') && !content.includes('.catch')) {
              failed.push(`${fileName}: API calls without error handling`);
            } else {
              working.push(`${fileName}: API calls with error handling`);
            }
          }
          
          // Check for timeout handling
          if (content.includes('fetch(') && !content.includes('timeout')) {
            unreachable.push(`${fileName}: No timeout handling for API calls`);
          }
          
          // Check for retry logic
          if (content.includes('fetch(') && !content.includes('retry')) {
            unreachable.push(`${fileName}: No retry logic for failed requests`);
          }
          
        } catch (error) {
          failed.push(`Could not analyze ${file}: ${error.message}`);
        }
      });
      
      this.results.apiFailures = { failed, working, unreachable };
      
    } catch (error) {
      failed.push(`API failure detection failed: ${error.message}`);
      this.results.apiFailures = { failed, working, unreachable };
    }
    
    this.log(`API Endpoints: ${working.length} working, ${failed.length} failed`, 
             failed.length === 0 ? 'success' : 'error');
  }

  // 3. UI Rendering Issue Detection
  async detectUiIssues() {
    this.log('🎨 Detecting UI issues...', 'info');
    
    const blocking = [];
    const cosmetic = [];
    const accessibility = [];
    
    try {
      const componentFiles = this.getAllSourceFiles().filter(file => 
        file.includes('/components/') && file.endsWith('.tsx')
      );
      
      componentFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check for missing return statements
          if (content.includes('const ') && content.includes('= () => {') && !content.includes('return')) {
            blocking.push(`${fileName}: Component missing return statement`);
          }
          
          // Check for unmatched JSX tags
          const openTags = (content.match(/<[a-zA-Z][^/>]*[^/]>/g) || []).length;
          const closeTags = (content.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
          const selfClosing = (content.match(/<[a-zA-Z][^>]*\/>/g) || []).length;
          
          if (openTags !== closeTags + selfClosing) {
            blocking.push(`${fileName}: Potential unmatched JSX tags`);
          }
          
          // Check for inline styles that might break
          const inlineStyles = (content.match(/style={{[^}]*}}/g) || []).length;
          if (inlineStyles > 5) {
            cosmetic.push(`${fileName}: Excessive inline styles (${inlineStyles})`);
          }
          
          // Check for accessibility issues
          if (content.includes('<img') && !content.includes('alt=')) {
            accessibility.push(`${fileName}: Images without alt text`);
          }
          
          if (content.includes('<button') && !content.includes('aria-label') && !content.includes('title')) {
            accessibility.push(`${fileName}: Buttons without accessible labels`);
          }
          
          // Check for potential hydration issues
          if (content.includes('useEffect') && content.includes('useState') && content.includes('Math.random')) {
            blocking.push(`${fileName}: Potential hydration mismatch with random values`);
          }
          
          // Check for missing error boundaries
          if (content.includes('useState') || content.includes('useEffect')) {
            if (!content.includes('try') && !content.includes('ErrorBoundary')) {
              cosmetic.push(`${fileName}: No error boundary protection`);
            }
          }
          
        } catch (error) {
          blocking.push(`Could not analyze ${file}: ${error.message}`);
        }
      });
      
      this.results.uiIssues = { blocking, cosmetic, accessibility };
      
    } catch (error) {
      blocking.push(`UI issue detection failed: ${error.message}`);
      this.results.uiIssues = { blocking, cosmetic, accessibility };
    }
    
    this.log(`UI Issues: ${blocking.length} blocking, ${accessibility.length} accessibility`, 
             blocking.length === 0 ? 'success' : 'error');
  }

  // 4. Data Corruption Detection
  async detectDataIssues() {
    this.log('💾 Detecting data issues...', 'info');
    
    const corruption = [];
    const missing = [];
    const invalid = [];
    
    try {
      // Check data files
      const dataFiles = this.findDataFiles();
      
      dataFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check JSON validity
          if (file.endsWith('.json')) {
            try {
              const data = JSON.parse(content);
              if (Object.keys(data).length === 0) {
                missing.push(`${fileName}: Empty JSON file`);
              }
            } catch (error) {
              corruption.push(`${fileName}: Invalid JSON format`);
            }
          }
          
          // Check for data consistency
          if (content.includes('id') && content.includes('name')) {
            const lines = content.split('\n');
            const inconsistentLines = lines.filter(line => 
              line.includes('id') && line.includes('null')
            );
            if (inconsistentLines.length > 0) {
              invalid.push(`${fileName}: Null IDs detected`);
            }
          }
          
          // Check file size
          const stats = fs.statSync(file);
          if (stats.size === 0) {
            missing.push(`${fileName}: Empty file`);
          } else if (stats.size > 1024 * 1024) { // 1MB
            invalid.push(`${fileName}: Large file may impact performance`);
          }
          
        } catch (error) {
          corruption.push(`Could not read ${file}: ${error.message}`);
        }
      });
      
      // Check for required data files
      const requiredDataPaths = [
        'src/data/AIBlockExamples.ts',
        'src/data/DemoWorkflows.ts'
      ];
      
      requiredDataPaths.forEach(path => {
        if (!fs.existsSync(path)) {
          missing.push(`Required data file missing: ${path}`);
        }
      });
      
      this.results.dataIssues = { corruption, missing, invalid };
      
    } catch (error) {
      corruption.push(`Data issue detection failed: ${error.message}`);
      this.results.dataIssues = { corruption, missing, invalid };
    }
    
    this.log(`Data Issues: ${corruption.length} corruption, ${missing.length} missing`, 
             corruption.length === 0 && missing.length === 0 ? 'success' : 'error');
  }

  // 5. Memory Leak Detection
  async detectMemoryLeaks() {
    this.log('🧠 Detecting memory leaks...', 'info');
    
    const detected = [];
    const potential = [];
    const clean = [];
    
    try {
      const sourceFiles = this.getAllSourceFiles();
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check for uncleared intervals/timeouts
          const setIntervals = (content.match(/setInterval/g) || []).length;
          const clearIntervals = (content.match(/clearInterval/g) || []).length;
          
          if (setIntervals > clearIntervals) {
            detected.push(`${fileName}: Uncleared intervals (${setIntervals - clearIntervals})`);
          }
          
          const setTimeouts = (content.match(/setTimeout/g) || []).length;
          const clearTimeouts = (content.match(/clearTimeout/g) || []).length;
          
          if (setTimeouts > clearTimeouts && setTimeouts > 2) {
            potential.push(`${fileName}: Many timeouts without explicit clearing`);
          }
          
          // Check for event listener cleanup
          if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
            potential.push(`${fileName}: Event listeners without cleanup`);
          }
          
          // Check for useEffect cleanup
          const useEffects = (content.match(/useEffect/g) || []).length;
          const cleanupFunctions = (content.match(/return\\s*\\(\\)\\s*=>/g) || []).length;
          
          if (useEffects > 2 && cleanupFunctions === 0) {
            potential.push(`${fileName}: useEffect without cleanup functions`);
          }
          
          // Check for global variable pollution
          if (content.includes('window.') && !content.includes('delete window.')) {
            potential.push(`${fileName}: Global variable usage without cleanup`);
          }
          
          // Check for proper dependency arrays
          if (content.includes('useEffect') && !content.includes('],')) {
            potential.push(`${fileName}: useEffect without dependency array`);
          }
          
          if (detected.length === 0 && potential.length === 0) {
            clean.push(`${fileName}: No memory leak indicators`);
          }
          
        } catch (error) {
          detected.push(`Could not analyze ${file}: ${error.message}`);
        }
      });
      
      this.results.memoryLeaks = { detected, potential, clean };
      
    } catch (error) {
      detected.push(`Memory leak detection failed: ${error.message}`);
      this.results.memoryLeaks = { detected, potential, clean };
    }
    
    this.log(`Memory Leaks: ${detected.length} detected, ${potential.length} potential`, 
             detected.length === 0 ? 'success' : 'error');
  }

  // 6. Cross-Browser Compatibility
  async detectCompatibilityIssues() {
    this.log('🌍 Detecting compatibility issues...', 'info');
    
    const issues = [];
    const supported = [];
    const untested = [];
    
    try {
      const sourceFiles = this.getAllSourceFiles();
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const fileName = file.replace(process.cwd() + '\\\\', '');
          
          // Check for modern JavaScript features
          if (content.includes('?.') || content.includes('??')) {
            supported.push(`${fileName}: Uses modern optional chaining/nullish coalescing`);
          }
          
          // Check for ES6+ features that might not work in older browsers
          if (content.includes('const ') || content.includes('let ') || content.includes('=>')) {
            supported.push(`${fileName}: Uses ES6+ features`);
          }
          
          // Check for experimental CSS features
          if (content.includes('backdrop-filter') || content.includes('clip-path')) {
            untested.push(`${fileName}: Uses experimental CSS features`);
          }
          
          // Check for browser-specific code
          if (content.includes('webkit') || content.includes('moz') || content.includes('ms-')) {
            issues.push(`${fileName}: Browser-specific CSS prefixes`);
          }
          
          // Check for IE compatibility issues
          if (content.includes('Array.from') || content.includes('Object.assign')) {
            untested.push(`${fileName}: Uses features not supported in IE`);
          }
          
          // Check for fetch API usage
          if (content.includes('fetch(')) {
            untested.push(`${fileName}: Uses fetch API (polyfill may be needed)`);
          }
          
        } catch (error) {
          issues.push(`Could not analyze ${file}: ${error.message}`);
        }
      });
      
      this.results.compatibility = { issues, supported, untested };
      
    } catch (error) {
      issues.push(`Compatibility detection failed: ${error.message}`);
      this.results.compatibility = { issues, supported, untested };
    }
    
    this.log(`Compatibility: ${issues.length} issues, ${untested.length} untested features`, 
             issues.length === 0 ? 'success' : 'warning');
  }

  // Helper Methods
  getAllSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css'];
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

  findDataFiles() {
    const files = [];
    const dataPaths = ['src/data', 'data', 'public', 'assets'];
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

  calculateBugSeverity() {
    const criticalCount = this.results.runtimeErrors.critical.length + 
                         this.results.apiFailures.failed.length + 
                         this.results.uiIssues.blocking.length + 
                         this.results.dataIssues.corruption.length + 
                         this.results.memoryLeaks.detected.length;
    
    const warningCount = this.results.runtimeErrors.warnings.length + 
                        this.results.uiIssues.cosmetic.length + 
                        this.results.dataIssues.invalid.length + 
                        this.results.memoryLeaks.potential.length + 
                        this.results.compatibility.issues.length;
    
    if (criticalCount > 0) {
      this.bugSeverity = 'CRITICAL';
    } else if (warningCount > 5) {
      this.bugSeverity = 'HIGH';
    } else if (warningCount > 0) {
      this.bugSeverity = 'MEDIUM';
    } else {
      this.bugSeverity = 'LOW';
    }
    
    return { criticalCount, warningCount, severity: this.bugSeverity };
  }

  getRecommendation() {
    const { criticalCount, warningCount } = this.calculateBugSeverity();
    
    if (criticalCount > 0) {
      return 'NO-GO: Critical bugs detected that will break demo';
    } else if (warningCount > 10) {
      return 'CAUTION: Many issues detected - test thoroughly before demo';
    } else if (warningCount > 0) {
      return 'GO: Minor issues detected but demo should work';
    } else {
      return 'GO: No critical bugs detected - ready for demo';
    }
  }

  async generateReport() {
    const { criticalCount, warningCount, severity } = this.calculateBugSeverity();
    
    const report = {
      timestamp: new Date().toISOString(),
      severity,
      criticalCount,
      warningCount,
      recommendation: this.getRecommendation(),
      summary: {
        runtimeErrors: this.results.runtimeErrors.critical.length,
        apiFailures: this.results.apiFailures.failed.length,
        uiIssues: this.results.uiIssues.blocking.length,
        dataIssues: this.results.dataIssues.corruption.length,
        memoryLeaks: this.results.memoryLeaks.detected.length,
        compatibilityIssues: this.results.compatibility.issues.length
      },
      details: this.results,
      immediateActions: this.generateImmediateActions(),
      testPriority: this.generateTestPriority()
    };
    
    fs.writeFileSync('critical-bug-report.json', JSON.stringify(report, null, 2));
    
    this.log(`🐛 Bug Severity: ${severity} (${criticalCount} critical, ${warningCount} warnings)`, 
             severity === 'LOW' ? 'success' : severity === 'MEDIUM' ? 'warning' : 'error');
    this.log(`Recommendation: ${report.recommendation}`, 
             report.recommendation.startsWith('GO') ? 'success' : 'error');
    
    return report;
  }

  generateImmediateActions() {
    const actions = [];
    
    if (this.results.runtimeErrors.critical.length > 0) {
      actions.push({
        priority: 'IMMEDIATE',
        action: 'Fix TypeScript compilation errors',
        impact: 'Application will not build or run',
        items: this.results.runtimeErrors.critical
      });
    }
    
    if (this.results.apiFailures.failed.length > 0) {
      actions.push({
        priority: 'IMMEDIATE',
        action: 'Fix API configuration and error handling',
        impact: 'Core functionality will fail during demo',
        items: this.results.apiFailures.failed
      });
    }
    
    if (this.results.uiIssues.blocking.length > 0) {
      actions.push({
        priority: 'HIGH',
        action: 'Fix UI rendering issues',
        impact: 'Interface may not display correctly',
        items: this.results.uiIssues.blocking
      });
    }
    
    return actions;
  }

  generateTestPriority() {
    return [
      'Test TypeScript compilation with: npx tsc --noEmit',
      'Test application build with: npm run build',
      'Test development server with: npm run dev',
      'Test all critical user flows manually',
      'Test error scenarios and recovery',
      'Test on different screen sizes',
      'Test with network disconnected',
      'Test with slow internet connection',
      'Verify all demo scenarios work end-to-end'
    ];
  }

  async runDetection() {
    this.log('🎯 Starting Critical Bug Detection...', 'info');
    
    await this.detectRuntimeErrors();
    await this.detectApiFailures();
    await this.detectUiIssues();
    await this.detectDataIssues();
    await this.detectMemoryLeaks();
    await this.detectCompatibilityIssues();
    
    const report = await this.generateReport();
    
    this.log('✅ Critical bug detection completed!', 'success');
    return report;
  }
}

// Run detection if called directly
if (require.main === module) {
  const detector = new CriticalBugDetector();
  detector.runDetection().catch(console.error);
}

module.exports = CriticalBugDetector;
