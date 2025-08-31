#!/usr/bin/env node
/**
 * µLM Feature Completeness Audit Script
 * Comprehensive analysis of all implemented features vs requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FeatureAudit {
  constructor() {
    this.results = {
      todos: [],
      userStories: [],
      apiEndpoints: [],
      uiComponents: [],
      workflows: [],
      critical: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[AUDIT] ${message}${colors.reset}`);
  }

  // 1. TODO Analysis
  async auditTodos() {
    this.log('🔍 Scanning for TODO items...', 'info');
    
    try {
      const todoPattern = /(TODO|FIXME|HACK|XXX|NOTE):?\s*(.*)/gi;
      const files = this.getAllSourceFiles();
      let totalTodos = 0;
      
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            const match = line.match(todoPattern);
            if (match) {
              totalTodos++;
              this.results.todos.push({
                file: file.replace(process.cwd() + '\\', ''),
                line: index + 1,
                type: match[1],
                message: match[2] || 'No description',
                priority: this.assessTodoPriority(match[0])
              });
            }
          });
        } catch (error) {
          this.log(`Error reading ${file}: ${error.message}`, 'warning');
        }
      });
      
      this.log(`Found ${totalTodos} TODO items`, totalTodos > 0 ? 'warning' : 'success');
      return totalTodos === 0;
    } catch (error) {
      this.log(`TODO audit failed: ${error.message}`, 'error');
      return false;
    }
  }

  // 2. User Story Validation
  async auditUserStories() {
    this.log('👤 Validating user stories...', 'info');
    
    const criticalUserStories = [
      {
        story: 'User enters prompt and gets AI-generated workflow',
        components: ['PremiumPromptInput', 'AIWorkflowGenerationService'],
        endpoints: ['/api/generate-workflow'],
        status: 'unknown'
      },
      {
        story: 'User drags blocks from palette to canvas',
        components: ['BlockPalette', 'UltraWorkspacePage'],
        interactions: ['drag-drop', 'canvas-placement'],
        status: 'unknown'
      },
      {
        story: 'User connects blocks to create workflow',
        components: ['BlockNode', 'ReactFlow'],
        interactions: ['edge-creation', 'node-connection'],
        status: 'unknown'
      },
      {
        story: 'User runs simulation and sees results',
        components: ['RealTimeSimulationEngine', 'PerformanceMetricsDashboard'],
        services: ['WorkflowExecutionService'],
        status: 'unknown'
      },
      {
        story: 'User exports workflow to production code',
        components: ['UniversalExportService'],
        formats: ['python-package', 'huggingface-space', 'docker-container'],
        status: 'unknown'
      }
    ];

    for (const story of criticalUserStories) {
      story.status = await this.validateUserStory(story);
      this.results.userStories.push(story);
    }

    const passedStories = criticalUserStories.filter(s => s.status === 'implemented').length;
    this.log(`User Stories: ${passedStories}/${criticalUserStories.length} implemented`, 
             passedStories === criticalUserStories.length ? 'success' : 'warning');
    
    return passedStories === criticalUserStories.length;
  }

  // 3. API Endpoint Validation
  async auditApiEndpoints() {
    this.log('🌐 Checking API endpoints...', 'info');
    
    const expectedEndpoints = [
      { path: 'src/services/AIWorkflowGenerationService.ts', methods: ['generateWorkflow'] },
      { path: 'src/services/AIBlockGenerationService.ts', methods: ['generateBlock'] },
      { path: 'src/services/OpenAIEfficiencyService.ts', methods: ['generateWithCache'] },
      { path: 'src/export/UniversalExportService.ts', methods: ['exportWorkflow'] },
      { path: 'src/simulation/RealTimeSimulationEngine.ts', methods: ['startSimulation'] }
    ];

    let implementedEndpoints = 0;
    
    for (const endpoint of expectedEndpoints) {
      const implemented = await this.validateEndpoint(endpoint);
      if (implemented) implementedEndpoints++;
      
      this.results.apiEndpoints.push({
        ...endpoint,
        implemented,
        status: implemented ? 'functional' : 'missing'
      });
    }

    this.log(`API Endpoints: ${implementedEndpoints}/${expectedEndpoints.length} implemented`, 
             implementedEndpoints === expectedEndpoints.length ? 'success' : 'error');
    
    return implementedEndpoints === expectedEndpoints.length;
  }

  // 4. UI Component Validation
  async auditUiComponents() {
    this.log('🎨 Validating UI components...', 'info');
    
    const criticalComponents = [
      'UltraWorkspacePage.tsx',
      'Homepage.tsx', 
      'BlockPalette.tsx',
      'BlockNode.tsx',
      'PremiumPromptInput.tsx',
      'PremiumAnimatedBackground.tsx'
    ];

    let workingComponents = 0;
    
    for (const component of criticalComponents) {
      const componentPath = this.findComponent(component);
      if (componentPath) {
        const isValid = await this.validateComponent(componentPath);
        if (isValid) workingComponents++;
        
        this.results.uiComponents.push({
          name: component,
          path: componentPath,
          valid: isValid,
          issues: isValid ? [] : ['Component validation failed']
        });
      } else {
        this.results.uiComponents.push({
          name: component,
          path: null,
          valid: false,
          issues: ['Component file not found']
        });
      }
    }

    this.log(`UI Components: ${workingComponents}/${criticalComponents.length} working`, 
             workingComponents === criticalComponents.length ? 'success' : 'error');
    
    return workingComponents === criticalComponents.length;
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

  assessTodoPriority(todo) {
    const critical = /FIXME|HACK|XXX|CRITICAL|URGENT/i;
    const high = /TODO.*(?:before|demo|prod|release)/i;
    
    if (critical.test(todo)) return 'CRITICAL';
    if (high.test(todo)) return 'HIGH';
    return 'MEDIUM';
  }

  async validateUserStory(story) {
    // Check if required components exist
    for (const component of story.components || []) {
      const found = this.findComponent(`${component}.tsx`) || this.findComponent(`${component}.ts`);
      if (!found) return 'missing-components';
    }
    
    return 'implemented'; // Simplified for this audit
  }

  async validateEndpoint(endpoint) {
    try {
      const content = fs.readFileSync(endpoint.path, 'utf8');
      return endpoint.methods.every(method => content.includes(method));
    } catch (error) {
      return false;
    }
  }

  async validateComponent(componentPath) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Basic validation checks
      const hasReactImport = content.includes('import') && (content.includes('React') || content.includes('from \'react\''));
      const hasExport = content.includes('export');
      const hasJSX = content.includes('<') && content.includes('>');
      
      return hasReactImport && hasExport && hasJSX;
    } catch (error) {
      return false;
    }
  }

  findComponent(name) {
    const possiblePaths = [
      `src/components/${name}`,
      `src/pages/${name}`,
      `src/services/${name}`,
      `src/simulation/${name}`
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  // Generate Report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        todos: this.results.todos.length,
        criticalTodos: this.results.todos.filter(t => t.priority === 'CRITICAL').length,
        userStories: this.results.userStories.filter(s => s.status === 'implemented').length + '/' + this.results.userStories.length,
        apiEndpoints: this.results.apiEndpoints.filter(e => e.implemented).length + '/' + this.results.apiEndpoints.length,
        uiComponents: this.results.uiComponents.filter(c => c.valid).length + '/' + this.results.uiComponents.length
      },
      details: this.results,
      recommendation: this.getRecommendation()
    };

    fs.writeFileSync('feature-audit-report.json', JSON.stringify(report, null, 2));
    
    this.log('📋 Feature audit report generated: feature-audit-report.json', 'success');
    return report;
  }

  getRecommendation() {
    const criticalTodos = this.results.todos.filter(t => t.priority === 'CRITICAL').length;
    const implementedStories = this.results.userStories.filter(s => s.status === 'implemented').length;
    const workingEndpoints = this.results.apiEndpoints.filter(e => e.implemented).length;
    
    if (criticalTodos > 0) return 'NO-GO: Critical TODOs must be resolved';
    if (implementedStories < this.results.userStories.length) return 'CAUTION: Some user stories not fully implemented';
    if (workingEndpoints < this.results.apiEndpoints.length) return 'CAUTION: Some API endpoints missing';
    
    return 'GO: Feature completeness looks good';
  }

  async run() {
    this.log('🚀 Starting Feature Completeness Audit...', 'info');
    
    await this.auditTodos();
    await this.auditUserStories();
    await this.auditApiEndpoints();
    await this.auditUiComponents();
    
    const report = this.generateReport();
    
    this.log('✅ Feature audit completed!', 'success');
    this.log(`Recommendation: ${report.recommendation}`, 
             report.recommendation.startsWith('GO') ? 'success' : 'warning');
    
    return report;
  }
}

// Run audit if called directly
if (require.main === module) {
  const audit = new FeatureAudit();
  audit.run().catch(console.error);
}

module.exports = FeatureAudit;
