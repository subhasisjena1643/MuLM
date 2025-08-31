#!/usr/bin/env node
/**
 * µLM Master Verification & Final Audit Report - ENHANCED VERSION
 * Comprehensive analysis consolidating all assessment tools
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Import assessment modules
class MasterVerification {
  constructor() {
    this.results = {
      featureCompleteness: null,
      productionReadiness: null,
      userExperience: null,
      demoReadiness: null,
      criticalBugs: null,
      overallScore: 0,
      recommendation: 'UNKNOWN',
      criticalIssues: [],
      quickWins: [],
      readyForDemo: false
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      title: '\x1b[35m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[MASTER] ${message}${colors.reset}`);
  }

  async runCompleteAudit() {
    this.log('🎯 STARTING COMPREHENSIVE HACKATHON AUDIT', 'title');
    this.log('═'.repeat(60), 'title');
    
    try {
      // 1. Feature Completeness Audit
      this.log('\n1️⃣ Running Feature Completeness Audit...', 'info');
      await this.runFeatureAudit();
      
      // 2. Production Readiness Assessment
      this.log('\n2️⃣ Running Production Readiness Assessment...', 'info');
      await this.runProductionAssessment();
      
      // 3. UX Validation
      this.log('\n3️⃣ Running UX Validation Suite...', 'info');
      await this.runUXValidation();
      
      // 4. Demo Readiness Check
      this.log('\n4️⃣ Running Demo Readiness Check...', 'info');
      await this.runDemoCheck();
      
      // 5. Critical Bug Detection
      this.log('\n5️⃣ Running Critical Bug Detection...', 'info');
      await this.runBugDetection();
      
      // 6. Comprehensive Analysis
      this.log('\n6️⃣ Performing Final Analysis...', 'info');
      await this.performFinalAnalysis();
      
      // 7. Generate Master Report
      const masterReport = await this.generateMasterReport();
      
      this.log('\n' + '═'.repeat(60), 'title');
      this.displayFinalResults();
      this.log('═'.repeat(60), 'title');
      
      return masterReport;
      
    } catch (error) {
      this.log(`Master audit failed: ${error.message}`, 'error');
      throw error;
    }
  }
      
      return true;
    } catch (error) {
      this.log(`System verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runPerformanceBenchmark() {
    this.log('\n⚡ RUNNING PERFORMANCE BENCHMARK...', 'bold');
    
    try {
      const benchmark = new PerformanceBenchmark();
      await benchmark.runFullBenchmark();
      
      // Load results from generated report
      if (fs.existsSync('performance-report.json')) {
        this.results.performance = JSON.parse(fs.readFileSync('performance-report.json', 'utf8'));
      }
      
      return true;
    } catch (error) {
      this.log(`Performance benchmark failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runDemoVerification() {
    this.log('\n🎯 RUNNING DEMO VERIFICATION...', 'bold');
    
    try {
      // Check if dev server is running
      const isDevServerRunning = await this.checkDevServer();
      
      if (!isDevServerRunning) {
        this.log('Starting development server...', 'info');
        
        // Start dev server in background
        const { spawn } = require('child_process');
        const devServer = spawn('npm', ['run', 'dev'], {
          detached: true,
          stdio: 'ignore'
        });
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      // Run demo verification
      const DemoVerificationSuite = require('./demo-verification');
      const demoSuite = new DemoVerificationSuite();
      await demoSuite.runCompleteDemo();
      
      // Load results from generated report
      if (fs.existsSync('demo-verification-report.json')) {
        this.results.demo = JSON.parse(fs.readFileSync('demo-verification-report.json', 'utf8'));
      }
      
      return true;
    } catch (error) {
      this.log(`Demo verification failed: ${error.message}`, 'error');
      this.log('Note: Demo verification requires running dev server', 'warning');
      return false;
    }
  }

  async checkDevServer() {
    try {
      const http = require('http');
      return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
          resolve(res.statusCode === 200);
        });
        
        req.on('error', () => {
          resolve(false);
        });
        
        req.setTimeout(3000, () => {
          req.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  calculateOverallScore() {
    let totalScore = 0;
    let maxScore = 0;
    const criticalIssues = [];
    
    // System verification (40% weight)
    if (this.results.system) {
      const systemPassRate = this.results.system.summary.passRate || 0;
      totalScore += systemPassRate * 0.4;
      maxScore += 40;
      
      if (systemPassRate < 80) {
        criticalIssues.push(`System verification pass rate too low: ${systemPassRate}%`);
      }
    }
    
    // Performance (30% weight)
    if (this.results.performance) {
      const perfScore = this.results.performance.score || 0;
      totalScore += perfScore * 0.3;
      maxScore += 30;
      
      if (perfScore < 50) {
        criticalIssues.push(`Performance score too low: ${perfScore}/100`);
      }
    }
    
    // Demo verification (30% weight)
    if (this.results.demo) {
      const demoPassRate = this.results.demo.summary.passRate || 0;
      totalScore += demoPassRate * 0.3;
      maxScore += 30;
      
      if (demoPassRate < 70) {
        criticalIssues.push(`Demo verification pass rate too low: ${demoPassRate}%`);
      }
    }
    
    const finalScore = maxScore > 0 ? (totalScore / maxScore * 100) : 0;
    
    this.results.overall = {
      score: Math.round(finalScore),
      demoReady: finalScore >= 75 && criticalIssues.length === 0,
      criticalIssues
    };
  }

  generateMasterReport() {
    this.calculateOverallScore();
    
    this.log('\n' + '='.repeat(60), 'bold');
    this.log('🏆 µLM MASTER VERIFICATION REPORT', 'bold');
    this.log('='.repeat(60), 'bold');
    
    // Overall status
    const score = this.results.overall.score;
    this.log(`\n🎯 OVERALL SCORE: ${score}/100`, 
      score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error');
    
    if (this.results.overall.demoReady) {
      this.log('🎉 DEMO READY FOR HACKATHON!', 'success');
    } else {
      this.log('🚨 DEMO NOT READY - ISSUES NEED RESOLUTION', 'error');
    }
    
    // Individual scores
    this.log('\n📊 Component Scores:', 'info');
    
    if (this.results.system) {
      const systemScore = this.results.system.summary.passRate;
      this.log(`  🔧 System Verification: ${systemScore}% ` +
        `(${this.results.system.summary.passed}/${this.results.system.summary.passed + this.results.system.summary.failed})`, 
        systemScore >= 80 ? 'success' : 'error');
    }
    
    if (this.results.performance) {
      const perfScore = this.results.performance.score;
      this.log(`  ⚡ Performance: ${perfScore}/100`, 
        perfScore >= 75 ? 'success' : perfScore >= 50 ? 'warning' : 'error');
    }
    
    if (this.results.demo) {
      const demoScore = this.results.demo.summary.passRate;
      this.log(`  🎯 Demo Verification: ${demoScore}% ` +
        `(${this.results.demo.summary.passed}/${this.results.demo.summary.passed + this.results.demo.summary.failed})`, 
        demoScore >= 70 ? 'success' : 'error');
    }
    
    // Critical issues
    if (this.results.overall.criticalIssues.length > 0) {
      this.log('\n🚨 CRITICAL ISSUES TO RESOLVE:', 'error');
      this.results.overall.criticalIssues.forEach((issue, index) => {
        this.log(`  ${index + 1}. ${issue}`, 'error');
      });
    }
    
    // Recommendations
    this.log('\n💡 NEXT STEPS:', 'info');
    
    if (this.results.overall.demoReady) {
      this.log('  ✅ Run final pre-demo checklist', 'success');
      this.log('  ✅ Practice demo scenario 2-3 times', 'success');
      this.log('  ✅ Prepare backup slides in case of technical issues', 'success');
    } else {
      this.log('  🔧 Fix critical system issues first', 'warning');
      this.log('  ⚡ Optimize performance if score < 75', 'warning');
      this.log('  🎯 Ensure core demo flow works end-to-end', 'warning');
      this.log('  🔄 Re-run verification after fixes', 'warning');
    }
    
    // Time estimates
    this.log('\n⏰ TIME ESTIMATES:', 'info');
    if (score >= 75) {
      this.log('  🚀 Demo preparation: 30-60 minutes', 'success');
    } else if (score >= 50) {
      this.log('  🔧 Issue resolution: 2-4 hours', 'warning');
      this.log('  🚀 Demo preparation: 30-60 minutes', 'warning');
    } else {
      this.log('  🔧 Major fixes needed: 4-8 hours', 'error');
      this.log('  🚀 Demo preparation: 1-2 hours', 'error');
    }
    
    // Export comprehensive report
    const masterReport = {
      timestamp: new Date().toISOString(),
      overall: this.results.overall,
      system: this.results.system,
      performance: this.results.performance,
      demo: this.results.demo,
      recommendations: this.generateActionableRecommendations()
    };
    
    fs.writeFileSync('master-verification-report.json', JSON.stringify(masterReport, null, 2));
    this.log('\n📄 Master report saved to: master-verification-report.json', 'info');
    
    return this.results.overall.demoReady;
  }

  generateActionableRecommendations() {
    const recommendations = [];
    
    // System issues
    if (this.results.system && this.results.system.summary.passRate < 80) {
      recommendations.push({
        category: 'System',
        priority: 'Critical',
        action: 'Fix failing system tests',
        details: 'Review verification-report.json for specific failures'
      });
    }
    
    // Performance issues
    if (this.results.performance && this.results.performance.score < 75) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        action: 'Optimize application performance',
        details: 'Review performance-report.json for specific optimizations'
      });
    }
    
    // Demo issues
    if (this.results.demo && this.results.demo.summary.passRate < 70) {
      recommendations.push({
        category: 'Demo',
        priority: 'Critical',
        action: 'Fix demo flow issues',
        details: 'Review demo-verification-report.json for specific failures'
      });
    }
    
    return recommendations;
  }

  async runComplete() {
    this.log('🚀 Starting Complete µLM Verification Suite', 'bold');
    this.log('This will take 5-15 minutes depending on your system...', 'info');
    
    const startTime = Date.now();
    
    // Run all verification suites
    await this.runSystemVerification();
    await this.runPerformanceBenchmark();
    
    // Demo verification is optional (requires running server)
    const runDemo = process.argv.includes('--demo') || process.argv.includes('--full');
    if (runDemo) {
      await this.runDemoVerification();
    } else {
      this.log('\nSkipping demo verification (use --demo flag to include)', 'warning');
      this.log('Demo verification requires a running development server', 'info');
    }
    
    // Generate master report
    const isReady = this.generateMasterReport();
    
    const duration = (Date.now() - startTime) / 1000;
    this.log(`\n⏱️  Total verification time: ${duration.toFixed(1)}s`, 'info');
    
    // Exit with appropriate code
    process.exit(isReady ? 0 : 1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
µLM Master Verification Suite

Usage:
  node scripts/master-verification.js [options]

Options:
  --demo, --full    Include demo verification (requires running dev server)
  --help, -h        Show this help message

Examples:
  node scripts/master-verification.js              # System + Performance only
  node scripts/master-verification.js --demo       # Full verification suite
  npm run verify                                   # System + Performance only
  npm run verify:full                             # Full verification suite
    `);
    process.exit(0);
  }
  
  const master = new MasterVerification();
  master.runComplete().catch(error => {
    console.error('Master verification failed:', error);
    process.exit(1);
  });
}

module.exports = MasterVerification;
