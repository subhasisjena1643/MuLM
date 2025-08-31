#!/usr/bin/env node
/**
 * µLM Master Verification & Final Audit Report - ENHANCED VERSION
 * Comprehensive analysis consolidating all assessment tools
 */

const fs = require('fs');
const { execSync } = require('child_process');

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

  async runFeatureAudit() {
    try {
      const result = execSync('node scripts/feature-audit.js', { 
        encoding: 'utf8', 
        timeout: 60000,
        stdio: 'pipe'
      });
      
      // Parse the output to extract key metrics
      this.results.featureCompleteness = this.parseFeatureAuditOutput(result);
      this.log('✅ Feature audit completed', 'success');
      
    } catch (error) {
      this.log(`Feature audit failed: ${error.message}`, 'warning');
      this.results.featureCompleteness = {
        summary: { todos: 999, score: 0 },
        recommendation: 'NO-GO: Feature audit failed'
      };
    }
  }

  async runProductionAssessment() {
    try {
      const result = execSync('node scripts/production-readiness.js', { 
        encoding: 'utf8', 
        timeout: 60000,
        stdio: 'pipe'
      });
      
      this.results.productionReadiness = this.parseProductionOutput(result);
      this.log('✅ Production assessment completed', 'success');
      
    } catch (error) {
      this.log(`Production assessment failed: ${error.message}`, 'warning');
      this.results.productionReadiness = {
        overallScore: 0,
        recommendation: 'NO-GO: Production assessment failed'
      };
    }
  }

  async runUXValidation() {
    try {
      const result = execSync('node scripts/ux-validation.js', { 
        encoding: 'utf8', 
        timeout: 60000,
        stdio: 'pipe'
      });
      
      this.results.userExperience = this.parseUXOutput(result);
      this.log('✅ UX validation completed', 'success');
      
    } catch (error) {
      this.log(`UX validation failed: ${error.message}`, 'warning');
      this.results.userExperience = {
        overallScore: 0,
        recommendation: 'NO-GO: UX validation failed'
      };
    }
  }

  async runDemoCheck() {
    try {
      const result = execSync('node scripts/demo-readiness.js', { 
        encoding: 'utf8', 
        timeout: 60000,
        stdio: 'pipe'
      });
      
      this.results.demoReadiness = this.parseDemoOutput(result);
      this.log('✅ Demo readiness check completed', 'success');
      
    } catch (error) {
      this.log(`Demo check failed: ${error.message}`, 'warning');
      this.results.demoReadiness = {
        demoScore: 0,
        recommendation: 'NO-GO: Demo check failed'
      };
    }
  }

  async runBugDetection() {
    try {
      const result = execSync('node scripts/critical-bug-detector.js', { 
        encoding: 'utf8', 
        timeout: 60000,
        stdio: 'pipe'
      });
      
      this.results.criticalBugs = this.parseBugOutput(result);
      this.log('✅ Bug detection completed', 'success');
      
    } catch (error) {
      this.log(`Bug detection failed: ${error.message}`, 'warning');
      this.results.criticalBugs = {
        severity: 'CRITICAL',
        recommendation: 'NO-GO: Bug detection failed'
      };
    }
  }

  parseFeatureAuditOutput(output) {
    const todoMatch = output.match(/(\d+)\s+TODOs/i);
    const scoreMatch = output.match(/Score:\s*(\d+)/);
    
    return {
      summary: {
        todos: todoMatch ? parseInt(todoMatch[1]) : 0,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50
      },
      recommendation: output.includes('GO') ? 'GO' : 'CAUTION'
    };
  }

  parseProductionOutput(output) {
    const scoreMatch = output.match(/Overall\s+Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    return {
      overallScore: score,
      recommendation: output.includes('GO:') ? 'GO' : 'CAUTION',
      summary: { performance: score, security: score, quality: score }
    };
  }

  parseUXOutput(output) {
    const scoreMatch = output.match(/Overall\s+Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    return {
      overallScore: score,
      recommendation: output.includes('GOOD:') ? 'GOOD' : 'NEEDS IMPROVEMENT',
      quickWins: this.extractQuickWins(output)
    };
  }

  parseDemoOutput(output) {
    const scoreMatch = output.match(/Demo\s+Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    return {
      demoScore: score,
      recommendation: output.includes('GO:') ? 'GO' : 'CAUTION',
      summary: {
        demoScenarios: output.includes('scenarios') ? 'pass' : 'fail',
        dependencies: output.includes('dependencies') ? 'pass' : 'warning'
      }
    };
  }

  parseBugOutput(output) {
    let severity = 'LOW';
    if (output.includes('CRITICAL')) severity = 'CRITICAL';
    else if (output.includes('HIGH')) severity = 'HIGH';
    else if (output.includes('MEDIUM')) severity = 'MEDIUM';
    
    const criticalMatch = output.match(/(\d+)\s+critical/i);
    const warningMatch = output.match(/(\d+)\s+warnings/i);
    
    return {
      severity,
      criticalBugs: criticalMatch ? parseInt(criticalMatch[1]) : 0,
      warnings: warningMatch ? parseInt(warningMatch[1]) : 0,
      recommendation: severity === 'CRITICAL' ? 'NO-GO' : 'CAUTION'
    };
  }

  extractQuickWins(output) {
    const quickWins = [];
    if (output.includes('loading states')) quickWins.push('Add loading states');
    if (output.includes('error messages')) quickWins.push('Improve error messages');
    if (output.includes('animations')) quickWins.push('Polish animations');
    return quickWins;
  }

  async performFinalAnalysis() {
    // Calculate overall scores
    const scores = [];
    
    if (this.results.featureCompleteness?.summary?.score) {
      scores.push(this.results.featureCompleteness.summary.score);
    }
    
    if (this.results.productionReadiness?.overallScore) {
      scores.push(this.results.productionReadiness.overallScore);
    }
    
    if (this.results.userExperience?.overallScore) {
      scores.push(this.results.userExperience.overallScore);
    }
    
    if (this.results.demoReadiness?.demoScore) {
      scores.push(this.results.demoReadiness.demoScore);
    }
    
    if (this.results.criticalBugs?.severity) {
      const bugScore = this.convertBugSeverityToScore(this.results.criticalBugs.severity);
      scores.push(bugScore);
    }
    
    // Calculate weighted overall score
    this.results.overallScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    
    // Determine critical issues
    this.results.criticalIssues = this.identifyCriticalIssues();
    
    // Identify quick wins
    this.results.quickWins = this.identifyQuickWins();
    
    // Final recommendation
    this.results.recommendation = this.generateFinalRecommendation();
    this.results.readyForDemo = this.isDemoReady();
  }

  convertBugSeverityToScore(severity) {
    switch (severity) {
      case 'LOW': return 90;
      case 'MEDIUM': return 70;
      case 'HIGH': return 40;
      case 'CRITICAL': return 10;
      default: return 50;
    }
  }

  identifyCriticalIssues() {
    const critical = [];
    
    // Check feature completeness
    if (this.results.featureCompleteness?.recommendation?.includes('NO-GO')) {
      critical.push({
        category: 'Feature Completeness',
        issue: 'Critical TODOs or missing functionality',
        impact: 'Core features may not work during demo',
        priority: 'IMMEDIATE'
      });
    }
    
    // Check production readiness
    if (this.results.productionReadiness?.overallScore < 60) {
      critical.push({
        category: 'Production Readiness',
        issue: 'Low production readiness score',
        impact: 'Application may be unstable or insecure',
        priority: 'HIGH'
      });
    }
    
    // Check UX issues
    if (this.results.userExperience?.overallScore < 60) {
      critical.push({
        category: 'User Experience',
        issue: 'Poor user experience metrics',
        impact: 'Demo may not impress judges due to UX issues',
        priority: 'HIGH'
      });
    }
    
    // Check demo readiness
    if (this.results.demoReadiness?.demoScore < 60) {
      critical.push({
        category: 'Demo Readiness',
        issue: 'Demo preparation incomplete',
        impact: 'High risk of demo failure',
        priority: 'IMMEDIATE'
      });
    }
    
    // Check critical bugs
    if (this.results.criticalBugs?.severity === 'CRITICAL') {
      critical.push({
        category: 'Critical Bugs',
        issue: 'Application-breaking bugs detected',
        impact: 'Demo will likely fail',
        priority: 'IMMEDIATE'
      });
    }
    
    return critical;
  }

  identifyQuickWins() {
    const quickWins = [];
    
    // UX Quick Wins
    if (this.results.userExperience?.quickWins) {
      quickWins.push(...this.results.userExperience.quickWins.map(win => ({
        category: 'UX',
        action: win,
        timeEstimate: '5-15 minutes',
        impact: 'Improved perceived quality'
      })));
    }
    
    // Additional quick wins based on scores
    if (this.results.productionReadiness?.overallScore < 80) {
      quickWins.push({
        category: 'Production',
        action: 'Add error boundaries to React components',
        timeEstimate: '15-30 minutes',
        impact: 'Better error handling'
      });
    }
    
    if (this.results.demoReadiness?.demoScore < 80) {
      quickWins.push({
        category: 'Demo',
        action: 'Prepare demo script with fallback scenarios',
        timeEstimate: '20-30 minutes',
        impact: 'Improved demo reliability'
      });
    }
    
    return quickWins;
  }

  generateFinalRecommendation() {
    const criticalCount = this.results.criticalIssues.length;
    const overallScore = this.results.overallScore;
    
    if (criticalCount > 0 && overallScore < 60) {
      return 'NO-GO: Critical issues must be resolved before demo';
    } else if (criticalCount > 0 || overallScore < 70) {
      return 'CAUTION: Address critical issues, demo possible with risks';
    } else if (overallScore >= 85) {
      return 'GO: Excellent readiness for hackathon demo';
    } else {
      return 'GO: Good readiness with minor improvements recommended';
    }
  }

  isDemoReady() {
    return this.results.overallScore >= 70 && 
           this.results.criticalIssues.filter(issue => issue.priority === 'IMMEDIATE').length === 0 &&
           this.results.criticalBugs?.severity !== 'CRITICAL';
  }

  async generateMasterReport() {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: this.results.overallScore,
      recommendation: this.results.recommendation,
      readyForDemo: this.results.readyForDemo,
      summary: {
        featureCompleteness: this.extractSummary(this.results.featureCompleteness),
        productionReadiness: this.extractSummary(this.results.productionReadiness),
        userExperience: this.extractSummary(this.results.userExperience),
        demoReadiness: this.extractSummary(this.results.demoReadiness),
        criticalBugs: this.extractSummary(this.results.criticalBugs)
      },
      criticalIssues: this.results.criticalIssues,
      quickWins: this.results.quickWins,
      detailedResults: this.results,
      actionPlan: this.generateActionPlan(),
      demoStrategy: this.generateDemoStrategy()
    };
    
    // Save comprehensive report
    fs.writeFileSync('MASTER-AUDIT-REPORT.json', JSON.stringify(report, null, 2));
    
    // Generate human-readable summary
    await this.generateHumanReadableReport(report);
    
    return report;
  }

  extractSummary(result) {
    if (!result) return { status: 'not-run', score: 0 };
    
    return {
      status: result.recommendation ? 'completed' : 'partial',
      score: result.overallScore || result.demoScore || result.summary?.score || 0,
      recommendation: result.recommendation || 'Unknown',
      keyMetrics: result.summary || {}
    };
  }

  generateActionPlan() {
    const actions = [];
    
    // Immediate actions (Critical issues)
    this.results.criticalIssues.forEach(issue => {
      if (issue.priority === 'IMMEDIATE') {
        actions.push({
          priority: 'IMMEDIATE',
          timeframe: 'Next 2 hours',
          action: `Resolve ${issue.category}: ${issue.issue}`,
          impact: issue.impact
        });
      }
    });
    
    // High priority actions
    this.results.criticalIssues.forEach(issue => {
      if (issue.priority === 'HIGH') {
        actions.push({
          priority: 'HIGH',
          timeframe: 'Next 4 hours',
          action: `Improve ${issue.category}: ${issue.issue}`,
          impact: issue.impact
        });
      }
    });
    
    // Quick wins
    this.results.quickWins.slice(0, 5).forEach(win => {
      actions.push({
        priority: 'QUICK-WIN',
        timeframe: win.timeEstimate,
        action: win.action,
        impact: win.impact
      });
    });
    
    return actions;
  }

  generateDemoStrategy() {
    const strategy = {
      strengths: [],
      risks: [],
      mitigations: [],
      backupPlans: [],
      focusAreas: []
    };
    
    // Identify strengths
    if (this.results.userExperience?.overallScore >= 80) {
      strategy.strengths.push('Strong user experience and visual design');
    }
    
    if (this.results.productionReadiness?.summary?.performance >= 80) {
      strategy.strengths.push('Good performance optimization');
    }
    
    if (this.results.demoReadiness?.summary?.demoScenarios === 'pass') {
      strategy.strengths.push('All demo scenarios tested and working');
    }
    
    // Identify risks
    this.results.criticalIssues.forEach(issue => {
      strategy.risks.push(`${issue.category}: ${issue.issue}`);
    });
    
    // Generate mitigations
    if (this.results.criticalBugs?.severity === 'CRITICAL') {
      strategy.mitigations.push('Have fallback demo data ready in case of runtime errors');
      strategy.backupPlans.push('Prepare static screenshots of working functionality');
    }
    
    if (this.results.demoReadiness?.summary?.dependencies === 'fail') {
      strategy.mitigations.push('Ensure stable internet connection and API keys are working');
      strategy.backupPlans.push('Have offline demo mode ready');
    }
    
    // Focus areas for improvement
    if (this.results.userExperience?.overallScore < 80) {
      strategy.focusAreas.push('Polish user interface and add loading states');
    }
    
    if (this.results.featureCompleteness?.summary?.todos > 10) {
      strategy.focusAreas.push('Complete high-priority TODO items');
    }
    
    return strategy;
  }

  async generateHumanReadableReport(report) {
    const markdown = `# 🏆 µLM Hackathon Readiness Report

**Generated:** ${new Date().toLocaleString()}
**Overall Score:** ${report.overallScore}/100
**Recommendation:** ${report.recommendation}
**Demo Ready:** ${report.readyForDemo ? '✅ YES' : '❌ NO'}

## 📊 Summary Scores

| Category | Score | Status | Recommendation |
|----------|-------|--------|----------------|
| Feature Completeness | ${report.summary.featureCompleteness.score}/100 | ${this.getStatusEmoji(report.summary.featureCompleteness.score)} | ${report.summary.featureCompleteness.recommendation} |
| Production Readiness | ${report.summary.productionReadiness.score}/100 | ${this.getStatusEmoji(report.summary.productionReadiness.score)} | ${report.summary.productionReadiness.recommendation} |
| User Experience | ${report.summary.userExperience.score}/100 | ${this.getStatusEmoji(report.summary.userExperience.score)} | ${report.summary.userExperience.recommendation} |
| Demo Readiness | ${report.summary.demoReadiness.score}/100 | ${this.getStatusEmoji(report.summary.demoReadiness.score)} | ${report.summary.demoReadiness.recommendation} |
| Bug Severity | ${report.summary.criticalBugs.score}/100 | ${this.getBugStatusEmoji(report.summary.criticalBugs.score)} | ${report.summary.criticalBugs.recommendation} |

## 🚨 Critical Issues (${report.criticalIssues.length})

${report.criticalIssues.length === 0 ? '✅ No critical issues detected!' : 
  report.criticalIssues.map(issue => 
    `### ${issue.priority} - ${issue.category}
**Issue:** ${issue.issue}
**Impact:** ${issue.impact}
`).join('\n')}

## 🎯 Action Plan

### Immediate Actions (Next 2 Hours)
${report.actionPlan.filter(a => a.priority === 'IMMEDIATE').map(action => 
  `- **${action.action}**\n  *Impact:* ${action.impact}`).join('\n') || '✅ No immediate actions required'}

### High Priority (Next 4 Hours)
${report.actionPlan.filter(a => a.priority === 'HIGH').map(action => 
  `- **${action.action}**\n  *Impact:* ${action.impact}`).join('\n') || '✅ No high priority actions required'}

### Quick Wins (${report.quickWins.length} available)
${report.quickWins.slice(0, 5).map(win => 
  `- **${win.action}** (${win.timeEstimate})\n  *Impact:* ${win.impact}`).join('\n')}

## 🎬 Demo Strategy

### Strengths to Highlight
${report.demoStrategy.strengths.map(s => `- ${s}`).join('\n') || 'Focus on core functionality'}

### Risks to Mitigate
${report.demoStrategy.risks.map(r => `- ${r}`).join('\n') || '✅ No major risks identified'}

### Backup Plans
${report.demoStrategy.backupPlans.map(p => `- ${p}`).join('\n') || 'Standard demo fallbacks recommended'}

## 📈 Recommendations

${this.generateDetailedRecommendations(report)}

---
*Report generated by µLM Master Verification System*`;

    fs.writeFileSync('HACKATHON-READINESS-SUMMARY.md', markdown);
    this.log('📋 Human-readable report saved: HACKATHON-READINESS-SUMMARY.md', 'success');
  }

  getStatusEmoji(score) {
    if (score >= 85) return '🟢 Excellent';
    if (score >= 75) return '🟡 Good';
    if (score >= 60) return '🟠 Fair';
    return '🔴 Poor';
  }

  getBugStatusEmoji(score) {
    if (score >= 80) return '🟢 Clean';
    if (score >= 60) return '🟡 Minor Issues';
    if (score >= 40) return '🟠 Moderate Issues';
    return '🔴 Critical Issues';
  }

  generateDetailedRecommendations(report) {
    const recommendations = [];
    
    if (report.readyForDemo) {
      recommendations.push('🎉 **READY FOR DEMO!** Your application shows strong readiness for hackathon presentation.');
      recommendations.push('💡 Focus on practicing your demo script and preparing for Q&A.');
      
      if (report.quickWins.length > 0) {
        recommendations.push(`⚡ Consider implementing ${Math.min(3, report.quickWins.length)} quick wins to further improve demo impact.`);
      }
    } else {
      recommendations.push('⚠️ **DEMO READINESS ISSUES DETECTED** - Address critical items before demo.');
      
      if (report.criticalIssues.length > 0) {
        recommendations.push(`🔧 Prioritize fixing ${report.criticalIssues.filter(i => i.priority === 'IMMEDIATE').length} immediate issues.`);
      }
      
      recommendations.push('🎯 Focus on core demo flow rather than polishing edge cases.');
    }
    
    if (report.overallScore >= 80) {
      recommendations.push('🌟 Excellent work! Your application demonstrates strong technical execution.');
    } else if (report.overallScore >= 70) {
      recommendations.push('👍 Good foundation. Focus on addressing the highest-impact improvements.');
    } else {
      recommendations.push('🔨 Significant improvements needed. Prioritize core functionality and stability.');
    }
    
    return recommendations.join('\n\n');
  }

  displayFinalResults() {
    this.log(`FINAL AUDIT RESULTS`, 'title');
    this.log(`Overall Score: ${this.results.overallScore}/100`, 
             this.results.overallScore >= 75 ? 'success' : 'warning');
    this.log(`Recommendation: ${this.results.recommendation}`, 
             this.results.recommendation.startsWith('GO') ? 'success' : 'error');
    this.log(`Demo Ready: ${this.results.readyForDemo ? 'YES' : 'NO'}`, 
             this.results.readyForDemo ? 'success' : 'error');
    
    if (this.results.criticalIssues.length > 0) {
      this.log(`\n🚨 ${this.results.criticalIssues.length} CRITICAL ISSUES TO ADDRESS:`, 'error');
      this.results.criticalIssues.forEach((issue, index) => {
        this.log(`  ${index + 1}. ${issue.category}: ${issue.issue}`, 'warning');
      });
    } else {
      this.log('\n✅ No critical issues detected!', 'success');
    }
    
    if (this.results.quickWins.length > 0) {
      this.log(`\n⚡ ${Math.min(5, this.results.quickWins.length)} QUICK WINS AVAILABLE:`, 'info');
      this.results.quickWins.slice(0, 5).forEach((win, index) => {
        this.log(`  ${index + 1}. ${win.action} (${win.timeEstimate})`, 'info');
      });
    }
  }
}

// Run master audit if called directly
if (require.main === module) {
  const masterVerification = new MasterVerification();
  masterVerification.runCompleteAudit()
    .then(report => {
      console.log('\n🎉 Master audit completed successfully!');
      console.log('📋 Reports generated:');
      console.log('  - MASTER-AUDIT-REPORT.json (detailed)');
      console.log('  - HACKATHON-READINESS-SUMMARY.md (human-readable)');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Master audit failed:', error.message);
      process.exit(1);
    });
}

module.exports = MasterVerification;
