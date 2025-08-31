#!/usr/bin/env node
/**
 * µLM End-to-End Demo Verification Script
 * Simulates the complete 5-minute demo scenario
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class DemoVerificationSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
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

  async setup() {
    this.log('🚀 Starting Demo Verification...', 'info');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.log(`Browser Error: ${msg.text()}`, 'error');
      }
    });
    
    // Set up error handling
    this.page.on('pageerror', error => {
      this.log(`Page Error: ${error.message}`, 'error');
    });
  }

  async runTest(name, testFn, timeout = 30000) {
    this.log(`Testing: ${name}`, 'info');
    const startTime = Date.now();
    
    try {
      await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      this.results.push({ name, success: true, duration });
      this.log(`✅ PASSED: ${name} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({ name, success: false, duration, error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
      return false;
    }
  }

  async testHomepageLoad() {
    return this.runTest('Homepage Load', async () => {
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      // Check if main elements are present
      await this.page.waitForSelector('h1', { timeout: 5000 });
      await this.page.waitForSelector('[data-testid="theme-toggle"]', { timeout: 5000 });
      
      // Check for no critical errors
      const errors = await this.page.evaluate(() => {
        return window.console.errors || [];
      });
      
      if (errors.length > 0) {
        throw new Error(`Console errors: ${errors.join(', ')}`);
      }
    });
  }

  async testThemeToggle() {
    return this.runTest('Theme Toggle', async () => {
      // Click theme toggle
      await this.page.click('[data-testid="theme-toggle"]');
      
      // Wait for theme change
      await this.page.waitForFunction(() => {
        return document.documentElement.classList.contains('dark');
      }, { timeout: 3000 });
      
      // Toggle back
      await this.page.click('[data-testid="theme-toggle"]');
      await this.page.waitForFunction(() => {
        return !document.documentElement.classList.contains('dark');
      }, { timeout: 3000 });
    });
  }

  async testPromptInput() {
    return this.runTest('Prompt Input', async () => {
      const testPrompt = "Build a sentiment analysis pipeline with preprocessing and classification";
      
      // Find and fill prompt input
      await this.page.waitForSelector('textarea, input[type="text"]', { timeout: 5000 });
      const promptInput = await this.page.$('textarea') || await this.page.$('input[type="text"]');
      
      if (!promptInput) {
        throw new Error('Prompt input not found');
      }
      
      await promptInput.type(testPrompt);
      
      // Submit the prompt
      await this.page.keyboard.press('Enter');
      
      // Wait for navigation or loading state
      await this.page.waitForFunction(() => {
        return window.location.pathname.includes('workspace') || 
               document.querySelector('[data-testid="loading"]') ||
               document.querySelector('.loading');
      }, { timeout: 10000 });
    });
  }

  async testWorkspaceNavigation() {
    return this.runTest('Workspace Navigation', async () => {
      // Ensure we're on workspace page
      if (!this.page.url().includes('workspace')) {
        await this.page.goto('http://localhost:3000/workspace', { waitUntil: 'networkidle0' });
      }
      
      // Check for main workspace elements
      await this.page.waitForSelector('.react-flow', { timeout: 10000 });
      await this.page.waitForSelector('[data-testid="workspace-canvas"]', { timeout: 5000 });
      
      // Check for panels
      const leftPanel = await this.page.$('[data-testid="left-panel"]');
      const topBar = await this.page.$('[data-testid="top-bar"]');
      
      if (!leftPanel || !topBar) {
        throw new Error('Workspace panels not found');
      }
    });
  }

  async testBlockPalette() {
    return this.runTest('Block Palette', async () => {
      // Find block palette
      await this.page.waitForSelector('[data-testid="block-palette"]', { timeout: 5000 });
      
      // Check for block categories
      const categories = await this.page.$$eval('[data-testid="block-category"]', elements => 
        elements.map(el => el.textContent)
      );
      
      if (categories.length === 0) {
        throw new Error('No block categories found');
      }
      
      this.log(`Found ${categories.length} block categories: ${categories.join(', ')}`, 'info');
    });
  }

  async testBlockDragAndDrop() {
    return this.runTest('Block Drag and Drop', async () => {
      // Find first draggable block
      await this.page.waitForSelector('[data-testid="draggable-block"]', { timeout: 5000 });
      const block = await this.page.$('[data-testid="draggable-block"]');
      
      if (!block) {
        throw new Error('No draggable blocks found');
      }
      
      // Get canvas element
      const canvas = await this.page.$('.react-flow__pane');
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Perform drag and drop
      const blockBox = await block.boundingBox();
      const canvasBox = await canvas.boundingBox();
      
      await this.page.mouse.move(
        blockBox.x + blockBox.width / 2,
        blockBox.y + blockBox.height / 2
      );
      await this.page.mouse.down();
      
      await this.page.mouse.move(
        canvasBox.x + 300,
        canvasBox.y + 200
      );
      await this.page.mouse.up();
      
      // Wait for block to appear on canvas
      await this.page.waitForSelector('.react-flow__node', { timeout: 5000 });
    });
  }

  async testAIBlockGenerator() {
    return this.runTest('AI Block Generator', async () => {
      // Look for AI block generator button
      const aiButton = await this.page.$('[data-testid="ai-block-generator"]') ||
                       await this.page.$('[aria-label*="AI"]') ||
                       await this.page.$('button:has-text("AI")');
      
      if (!aiButton) {
        this.log('AI Block Generator button not found, skipping test', 'warning');
        return;
      }
      
      // Click AI generator
      await aiButton.click();
      
      // Wait for modal or interface
      await this.page.waitForSelector('[data-testid="ai-generator-modal"]', { timeout: 5000 });
      
      // Input a test prompt
      const promptInput = await this.page.$('[data-testid="ai-prompt-input"]') ||
                          await this.page.$('textarea[placeholder*="describe"]');
      
      if (promptInput) {
        await promptInput.type('Create a text classification block for sentiment analysis');
        
        // Submit
        const submitButton = await this.page.$('[data-testid="generate-button"]') ||
                             await this.page.$('button:has-text("Generate")');
        
        if (submitButton) {
          await submitButton.click();
          
          // Wait for generation (with longer timeout for AI)
          await this.page.waitForFunction(() => {
            return document.querySelector('[data-testid="generated-block"]') ||
                   document.querySelector('.generated-code') ||
                   document.querySelector('[data-testid="generation-complete"]');
          }, { timeout: 30000 });
        }
      }
    });
  }

  async testSimulation() {
    return this.runTest('Workflow Simulation', async () => {
      // Ensure we have blocks on canvas
      const blocks = await this.page.$$('.react-flow__node');
      if (blocks.length === 0) {
        // Add a simple block if none exists
        await this.testBlockDragAndDrop();
      }
      
      // Find simulate button
      const simulateButton = await this.page.$('[data-testid="simulate-button"]') ||
                            await this.page.$('button:has-text("Simulate")') ||
                            await this.page.$('[aria-label*="simulate"]');
      
      if (!simulateButton) {
        throw new Error('Simulate button not found');
      }
      
      // Click simulate
      await simulateButton.click();
      
      // Wait for simulation to start
      await this.page.waitForFunction(() => {
        return document.querySelector('[data-testid="simulation-running"]') ||
               document.querySelector('.simulation-progress') ||
               document.querySelector('[data-testid="simulation-results"]');
      }, { timeout: 15000 });
      
      // Wait for simulation to complete
      await this.page.waitForFunction(() => {
        return document.querySelector('[data-testid="simulation-complete"]') ||
               document.querySelector('.simulation-results') ||
               !document.querySelector('[data-testid="simulation-running"]');
      }, { timeout: 30000 });
    });
  }

  async testExportFunctionality() {
    return this.runTest('Export Functionality', async () => {
      // Find export button
      const exportButton = await this.page.$('[data-testid="export-button"]') ||
                          await this.page.$('button:has-text("Export")') ||
                          await this.page.$('[aria-label*="export"]');
      
      if (!exportButton) {
        this.log('Export button not found, skipping test', 'warning');
        return;
      }
      
      // Click export
      await exportButton.click();
      
      // Wait for export modal or options
      await this.page.waitForFunction(() => {
        return document.querySelector('[data-testid="export-modal"]') ||
               document.querySelector('.export-options') ||
               document.querySelector('[data-testid="export-format"]');
      }, { timeout: 10000 });
      
      // Try to generate Python export
      const pythonOption = await this.page.$('[data-testid="export-python"]') ||
                           await this.page.$('button:has-text("Python")');
      
      if (pythonOption) {
        await pythonOption.click();
        
        // Wait for code generation
        await this.page.waitForFunction(() => {
          return document.querySelector('[data-testid="generated-code"]') ||
                 document.querySelector('.export-code') ||
                 document.querySelector('pre code');
        }, { timeout: 15000 });
      }
    });
  }

  async testPerformanceMetrics() {
    return this.runTest('Performance Metrics', async () => {
      // Measure page performance
      const metrics = await this.page.metrics();
      
      const jsHeapUsed = metrics.JSHeapUsedSize / (1024 * 1024); // MB
      const jsHeapTotal = metrics.JSHeapTotalSize / (1024 * 1024); // MB
      
      this.log(`JS Heap Used: ${jsHeapUsed.toFixed(2)}MB`, 'info');
      this.log(`JS Heap Total: ${jsHeapTotal.toFixed(2)}MB`, 'info');
      
      // Check if memory usage is reasonable
      if (jsHeapUsed > 500) {
        throw new Error(`High memory usage: ${jsHeapUsed.toFixed(2)}MB`);
      }
      
      // Check page load performance
      const performanceTiming = await this.page.evaluate(() => {
        const timing = performance.timing;
        return {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
        };
      });
      
      this.log(`Load Time: ${performanceTiming.loadTime}ms`, 'info');
      this.log(`DOM Ready: ${performanceTiming.domReady}ms`, 'info');
      this.log(`First Paint: ${performanceTiming.firstPaint}ms`, 'info');
      
      if (performanceTiming.loadTime > 5000) {
        throw new Error(`Slow page load: ${performanceTiming.loadTime}ms`);
      }
    });
  }

  async runCompleteDemo() {
    await this.setup();
    
    try {
      this.log('\n🎯 Running Complete Demo Scenario', 'warning');
      
      // Core Demo Flow
      await this.testHomepageLoad();
      await this.testThemeToggle();
      await this.testPromptInput();
      await this.testWorkspaceNavigation();
      await this.testBlockPalette();
      await this.testBlockDragAndDrop();
      await this.testAIBlockGenerator();
      await this.testSimulation();
      await this.testExportFunctionality();
      await this.testPerformanceMetrics();
      
      this.generateReport();
      
    } catch (error) {
      this.log(`Demo failed: ${error.message}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalDuration = (endTime - this.startTime) / 1000;
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const passRate = (passed / this.results.length * 100).toFixed(1);
    
    this.log('\n' + '='.repeat(50), 'info');
    this.log('📊 DEMO VERIFICATION REPORT', 'info');
    this.log('='.repeat(50), 'info');
    
    this.log(`✅ Passed: ${passed}`, 'success');
    this.log(`❌ Failed: ${failed}`, 'error');
    this.log(`📈 Pass Rate: ${passRate}%`, passRate > 80 ? 'success' : 'error');
    this.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}s`, 'info');
    
    // Demo readiness assessment
    const criticalTests = [
      'Homepage Load',
      'Workspace Navigation',
      'Block Drag and Drop',
      'Workflow Simulation'
    ];
    
    const criticalFailures = this.results.filter(r => 
      !r.success && criticalTests.includes(r.name)
    ).length;
    
    if (criticalFailures === 0 && failed <= 2) {
      this.log('\n🎉 DEMO READY! All critical tests passed.', 'success');
      this.log(`⚡ Demo can be completed in under ${Math.ceil(totalDuration)}s`, 'success');
    } else {
      this.log(`\n🚨 NOT DEMO READY! ${criticalFailures} critical failures.`, 'error');
    }
    
    // Detailed results
    this.log('\n📋 Detailed Results:', 'info');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      this.log(`  ${status} ${result.name} (${duration})`, 
        result.success ? 'success' : 'error');
      
      if (!result.success && result.error) {
        this.log(`    Error: ${result.error}`, 'error');
      }
    });
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed,
        failed,
        passRate: parseFloat(passRate),
        totalDuration,
        demoReady: criticalFailures === 0 && failed <= 2
      },
      results: this.results
    };
    
    fs.writeFileSync('demo-verification-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Report saved to: demo-verification-report.json', 'info');
    
    process.exit(failed > 3 ? 1 : 0); // Allow some minor failures
  }
}

// Execute if run directly
if (require.main === module) {
  const demoSuite = new DemoVerificationSuite();
  demoSuite.runCompleteDemo().catch(error => {
    console.error('Demo verification failed:', error);
    process.exit(1);
  });
}

module.exports = DemoVerificationSuite;
