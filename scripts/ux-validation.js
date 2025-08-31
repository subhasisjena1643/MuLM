#!/usr/bin/env node
/**
 * µLM User Experience Validation Suite
 * Comprehensive UX testing and accessibility assessment
 */

const fs = require('fs');
const path = require('path');

class UXValidationSuite {
  constructor() {
    this.results = {
      uiIntuition: { score: 0, issues: [], recommendations: [] },
      responsiveDesign: { score: 0, issues: [], recommendations: [] },
      loadingStates: { score: 0, issues: [], recommendations: [] },
      errorMessages: { score: 0, issues: [], recommendations: [] },
      visualDesign: { score: 0, issues: [], recommendations: [] },
      animations: { score: 0, issues: [], recommendations: [] },
      accessibility: { score: 0, issues: [], recommendations: [] }
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
    console.log(`${colors[type]}[UX] ${message}${colors.reset}`);
  }

  // 1. UI Intuition Assessment
  async assessUIIntuition() {
    this.log('🎯 Assessing UI intuition...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      
      // Check for proper button styling and states
      let buttonsWithStates = 0;
      let totalButtons = 0;
      let formsWithValidation = 0;
      let totalForms = 0;
      let tooltipUsage = 0;
      let helpTextUsage = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Button analysis
          const buttonMatches = content.match(/<button|<Button/g);
          if (buttonMatches) {
            totalButtons += buttonMatches.length;
            
            if (content.includes('hover:') || content.includes(':hover') || content.includes('disabled')) {
              buttonsWithStates++;
            }
          }
          
          // Form analysis
          const formMatches = content.match(/<form|<Form/g);
          if (formMatches) {
            totalForms += formMatches.length;
            
            if (content.includes('validation') || content.includes('error') || content.includes('required')) {
              formsWithValidation++;
            }
          }
          
          // Tooltip and help text
          if (content.includes('tooltip') || content.includes('Tooltip')) {
            tooltipUsage++;
          }
          
          if (content.includes('help') || content.includes('hint') || content.includes('placeholder')) {
            helpTextUsage++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      // Calculate scores
      const buttonStatePercentage = totalButtons > 0 ? (buttonsWithStates / totalButtons) * 100 : 100;
      const formValidationPercentage = totalForms > 0 ? (formsWithValidation / totalForms) * 100 : 100;
      
      if (buttonStatePercentage < 50) {
        issues.push(`Only ${buttonStatePercentage.toFixed(1)}% of buttons have proper states`);
        recommendations.push('Add hover, active, and disabled states to all buttons');
        score -= 20;
      }
      
      if (formValidationPercentage < 80) {
        issues.push(`Only ${formValidationPercentage.toFixed(1)}% of forms have validation`);
        recommendations.push('Implement form validation with clear error messages');
        score -= 15;
      }
      
      if (tooltipUsage === 0) {
        issues.push('No tooltips found for complex UI elements');
        recommendations.push('Add helpful tooltips for complex features');
        score -= 10;
      }
      
      // Check for consistent navigation
      const hasNavigation = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('nav') || content.includes('Navigation') || content.includes('router');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasNavigation) {
        issues.push('No clear navigation structure detected');
        recommendations.push('Implement consistent navigation with clear hierarchy');
        score -= 15;
      }
      
      this.results.uiIntuition = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          buttonStatePercentage: buttonStatePercentage.toFixed(1) + '%',
          formValidationPercentage: formValidationPercentage.toFixed(1) + '%',
          tooltipUsage,
          helpTextUsage
        }
      };
      
    } catch (error) {
      this.log(`UI intuition assessment error: ${error.message}`, 'error');
      this.results.uiIntuition.score = 60;
    }
    
    this.log(`UI Intuition Score: ${this.results.uiIntuition.score}/100`, 
             this.results.uiIntuition.score >= 80 ? 'success' : 'warning');
  }

  // 2. Responsive Design Assessment
  async assessResponsiveDesign() {
    this.log('📱 Assessing responsive design...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      const cssFiles = this.getAllCSSFiles();
      
      let responsiveClassUsage = 0;
      let fixedWidthUsage = 0;
      let mediaQueryUsage = 0;
      
      [...sourceFiles, ...cssFiles].forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for Tailwind responsive classes
          const responsiveMatches = content.match(/(?:sm|md|lg|xl|2xl):/g);
          if (responsiveMatches) {
            responsiveClassUsage += responsiveMatches.length;
          }
          
          // Check for fixed widths
          const fixedWidthMatches = content.match(/width:\\s*\\d+px|w-\\d+(?!\\d)/g);
          if (fixedWidthMatches) {
            fixedWidthUsage += fixedWidthMatches.length;
          }
          
          // Check for media queries
          if (content.includes('@media')) {
            mediaQueryUsage++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      if (responsiveClassUsage < 10) {
        issues.push('Limited responsive design implementation detected');
        recommendations.push('Add responsive breakpoints for mobile, tablet, and desktop');
        score -= 25;
      }
      
      if (fixedWidthUsage > responsiveClassUsage * 2) {
        issues.push('Excessive fixed width usage may break responsive design');
        recommendations.push('Replace fixed widths with responsive alternatives');
        score -= 15;
      }
      
      // Check for mobile-first approach
      const hasMobileFirst = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('mobile') || content.includes('touch') || content.includes('viewport');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasMobileFirst) {
        recommendations.push('Consider mobile-first design approach');
        score -= 10;
      }
      
      this.results.responsiveDesign = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          responsiveClassUsage,
          fixedWidthUsage,
          mediaQueryUsage,
          hasMobileFirst
        }
      };
      
    } catch (error) {
      this.log(`Responsive design assessment error: ${error.message}`, 'error');
      this.results.responsiveDesign.score = 70;
    }
    
    this.log(`Responsive Design Score: ${this.results.responsiveDesign.score}/100`, 
             this.results.responsiveDesign.score >= 80 ? 'success' : 'warning');
  }

  // 3. Loading States Assessment
  async assessLoadingStates() {
    this.log('⏳ Assessing loading states...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      
      let loadingStateUsage = 0;
      let skeletonUsage = 0;
      let progressIndicatorUsage = 0;
      let asyncOperations = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for async operations
          const asyncMatches = content.match(/async|await|useEffect|fetch|api/g);
          if (asyncMatches) {
            asyncOperations += asyncMatches.length;
          }
          
          // Check for loading states
          if (content.includes('loading') || content.includes('isLoading')) {
            loadingStateUsage++;
          }
          
          // Check for skeleton components
          if (content.includes('skeleton') || content.includes('Skeleton')) {
            skeletonUsage++;
          }
          
          // Check for progress indicators
          if (content.includes('progress') || content.includes('Progress') || content.includes('spinner')) {
            progressIndicatorUsage++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      const loadingCoverage = asyncOperations > 0 ? (loadingStateUsage / asyncOperations) * 100 : 100;
      
      if (loadingCoverage < 30) {
        issues.push(`Low loading state coverage (${loadingCoverage.toFixed(1)}%)`);
        recommendations.push('Add loading states to all async operations');
        score -= 30;
      } else if (loadingCoverage < 60) {
        issues.push(`Moderate loading state coverage (${loadingCoverage.toFixed(1)}%)`);
        recommendations.push('Improve loading state coverage for better UX');
        score -= 15;
      }
      
      if (skeletonUsage === 0) {
        recommendations.push('Consider adding skeleton components for better perceived performance');
        score -= 10;
      }
      
      if (progressIndicatorUsage === 0 && asyncOperations > 5) {
        issues.push('No progress indicators for long operations');
        recommendations.push('Add progress indicators for time-consuming operations');
        score -= 15;
      }
      
      this.results.loadingStates = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          loadingCoverage: loadingCoverage.toFixed(1) + '%',
          asyncOperations,
          loadingStateUsage,
          skeletonUsage,
          progressIndicatorUsage
        }
      };
      
    } catch (error) {
      this.log(`Loading states assessment error: ${error.message}`, 'error');
      this.results.loadingStates.score = 60;
    }
    
    this.log(`Loading States Score: ${this.results.loadingStates.score}/100`, 
             this.results.loadingStates.score >= 75 ? 'success' : 'warning');
  }

  // 4. Error Messages Assessment
  async assessErrorMessages() {
    this.log('❌ Assessing error messages...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      
      let errorHandlingFiles = 0;
      let userFriendlyErrors = 0;
      let actionableErrors = 0;
      let totalErrorMessages = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for error handling
          if (content.includes('error') || content.includes('Error') || content.includes('catch')) {
            errorHandlingFiles++;
          }
          
          // Count error messages
          const errorMessageMatches = content.match(/error.*message|Error.*text|alert.*error/gi);
          if (errorMessageMatches) {
            totalErrorMessages += errorMessageMatches.length;
            
            // Check for user-friendly language
            if (content.includes('Something went wrong') || 
                content.includes('Please try again') ||
                content.includes('We\'re sorry')) {
              userFriendlyErrors++;
            }
            
            // Check for actionable guidance
            if (content.includes('Try') || 
                content.includes('Please') ||
                content.includes('Contact support')) {
              actionableErrors++;
            }
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      const errorHandlingPercentage = (errorHandlingFiles / sourceFiles.length) * 100;
      const userFriendlyPercentage = totalErrorMessages > 0 ? (userFriendlyErrors / totalErrorMessages) * 100 : 0;
      const actionablePercentage = totalErrorMessages > 0 ? (actionableErrors / totalErrorMessages) * 100 : 0;
      
      if (errorHandlingPercentage < 20) {
        issues.push(`Low error handling coverage (${errorHandlingPercentage.toFixed(1)}%)`);
        recommendations.push('Implement comprehensive error handling across components');
        score -= 25;
      }
      
      if (userFriendlyPercentage < 50 && totalErrorMessages > 0) {
        issues.push(`Only ${userFriendlyPercentage.toFixed(1)}% of error messages are user-friendly`);
        recommendations.push('Rewrite error messages in plain, user-friendly language');
        score -= 20;
      }
      
      if (actionablePercentage < 50 && totalErrorMessages > 0) {
        issues.push(`Only ${actionablePercentage.toFixed(1)}% of error messages provide actionable guidance`);
        recommendations.push('Add clear next steps to all error messages');
        score -= 15;
      }
      
      // Check for error boundaries
      const hasErrorBoundary = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('ErrorBoundary') || content.includes('componentDidCatch');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasErrorBoundary) {
        issues.push('No error boundaries detected');
        recommendations.push('Implement error boundaries for graceful error handling');
        score -= 15;
      }
      
      this.results.errorMessages = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          errorHandlingPercentage: errorHandlingPercentage.toFixed(1) + '%',
          totalErrorMessages,
          userFriendlyPercentage: userFriendlyPercentage.toFixed(1) + '%',
          actionablePercentage: actionablePercentage.toFixed(1) + '%',
          hasErrorBoundary
        }
      };
      
    } catch (error) {
      this.log(`Error messages assessment error: ${error.message}`, 'error');
      this.results.errorMessages.score = 60;
    }
    
    this.log(`Error Messages Score: ${this.results.errorMessages.score}/100`, 
             this.results.errorMessages.score >= 75 ? 'success' : 'warning');
  }

  // 5. Visual Design Assessment
  async assessVisualDesign() {
    this.log('🎨 Assessing visual design...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      const cssFiles = this.getAllCSSFiles();
      
      let colorUsage = 0;
      let typographyUsage = 0;
      let spacingConsistency = 0;
      let customStyling = 0;
      
      [...sourceFiles, ...cssFiles].forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for color system usage
          const colorMatches = content.match(/(?:bg|text|border)-(?:primary|secondary|accent|gray|blue|red|green)/g);
          if (colorMatches) {
            colorUsage += colorMatches.length;
          }
          
          // Check for typography system
          const typographyMatches = content.match(/(?:text|font)-(?:xs|sm|base|lg|xl|2xl|3xl)/g);
          if (typographyMatches) {
            typographyUsage += typographyMatches.length;
          }
          
          // Check for consistent spacing
          const spacingMatches = content.match(/(?:p|m|gap|space)-(?:1|2|3|4|5|6|8|10|12)/g);
          if (spacingMatches) {
            spacingConsistency += spacingMatches.length;
          }
          
          // Check for custom styling
          if (content.includes('style={{') || content.includes('styled.')) {
            customStyling++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      if (colorUsage < 20) {
        issues.push('Limited use of consistent color system');
        recommendations.push('Implement a comprehensive color system with semantic naming');
        score -= 15;
      }
      
      if (typographyUsage < 10) {
        issues.push('Inconsistent typography scale usage');
        recommendations.push('Define and use a consistent typography scale');
        score -= 15;
      }
      
      if (spacingConsistency < 30) {
        issues.push('Inconsistent spacing system');
        recommendations.push('Use consistent spacing values from design system');
        score -= 10;
      }
      
      if (customStyling > colorUsage + typographyUsage) {
        issues.push('Excessive custom styling may hurt design consistency');
        recommendations.push('Reduce custom styles in favor of design system components');
        score -= 10;
      }
      
      // Check for design system usage
      const hasDesignSystem = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('tailwind') || content.includes('theme') || content.includes('design-system');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasDesignSystem) {
        recommendations.push('Consider implementing a design system for consistency');
        score -= 10;
      }
      
      this.results.visualDesign = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          colorUsage,
          typographyUsage,
          spacingConsistency,
          customStyling,
          hasDesignSystem
        }
      };
      
    } catch (error) {
      this.log(`Visual design assessment error: ${error.message}`, 'error');
      this.results.visualDesign.score = 70;
    }
    
    this.log(`Visual Design Score: ${this.results.visualDesign.score}/100`, 
             this.results.visualDesign.score >= 80 ? 'success' : 'warning');
  }

  // 6. Animations Assessment
  async assessAnimations() {
    this.log('✨ Assessing animations...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      const cssFiles = this.getAllCSSFiles();
      
      let transitionUsage = 0;
      let animationUsage = 0;
      let performantAnimations = 0;
      let microInteractions = 0;
      
      [...sourceFiles, ...cssFiles].forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for CSS transitions
          if (content.includes('transition') || content.includes('ease')) {
            transitionUsage++;
          }
          
          // Check for animations
          if (content.includes('animate') || content.includes('animation') || content.includes('@keyframes')) {
            animationUsage++;
          }
          
          // Check for performant properties (transform, opacity)
          if (content.includes('transform') || content.includes('opacity') || content.includes('scale') || content.includes('translate')) {
            performantAnimations++;
          }
          
          // Check for micro-interactions
          if (content.includes('hover:') || content.includes('focus:') || content.includes('active:')) {
            microInteractions++;
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      if (transitionUsage === 0) {
        issues.push('No smooth transitions detected');
        recommendations.push('Add smooth transitions for better user experience');
        score -= 20;
      }
      
      if (microInteractions < 5) {
        issues.push('Limited micro-interactions for user feedback');
        recommendations.push('Add hover, focus, and active states for better interactivity');
        score -= 15;
      }
      
      if (animationUsage > 0 && performantAnimations === 0) {
        issues.push('Animations may not be optimized for performance');
        recommendations.push('Use transform and opacity for better animation performance');
        score -= 15;
      }
      
      // Check for animation preferences
      const respectsMotionPreferences = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('prefers-reduced-motion') || content.includes('motion-reduce');
        } catch (error) {
          return false;
        }
      });
      
      if (!respectsMotionPreferences && animationUsage > 0) {
        recommendations.push('Respect user motion preferences for accessibility');
        score -= 10;
      }
      
      this.results.animations = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          transitionUsage,
          animationUsage,
          performantAnimations,
          microInteractions,
          respectsMotionPreferences
        }
      };
      
    } catch (error) {
      this.log(`Animations assessment error: ${error.message}`, 'error');
      this.results.animations.score = 70;
    }
    
    this.log(`Animations Score: ${this.results.animations.score}/100`, 
             this.results.animations.score >= 75 ? 'success' : 'warning');
  }

  // 7. Accessibility Assessment
  async assessAccessibility() {
    this.log('♿ Assessing accessibility...', 'info');
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    try {
      const sourceFiles = this.getAllReactFiles();
      
      let semanticElements = 0;
      let ariaLabels = 0;
      let keyboardNavigation = 0;
      let altTexts = 0;
      let colorOnlyReliance = 0;
      
      sourceFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for semantic HTML
          const semanticMatches = content.match(/<(?:header|nav|main|section|article|aside|footer|h[1-6])/g);
          if (semanticMatches) {
            semanticElements += semanticMatches.length;
          }
          
          // Check for ARIA labels
          const ariaMatches = content.match(/aria-(?:label|labelledby|describedby|expanded|hidden)/g);
          if (ariaMatches) {
            ariaLabels += ariaMatches.length;
          }
          
          // Check for keyboard navigation
          if (content.includes('onKeyDown') || content.includes('onKeyPress') || content.includes('tabIndex')) {
            keyboardNavigation++;
          }
          
          // Check for alt texts
          const altMatches = content.match(/alt=/g);
          if (altMatches) {
            altTexts += altMatches.length;
          }
          
          // Check for color-only information
          if (content.includes('color:red') || content.includes('text-red') || content.includes('bg-red')) {
            if (!content.includes('icon') && !content.includes('text')) {
              colorOnlyReliance++;
            }
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      });
      
      if (semanticElements < 10) {
        issues.push('Limited use of semantic HTML elements');
        recommendations.push('Use semantic HTML elements (header, nav, main, section, etc.)');
        score -= 20;
      }
      
      if (ariaLabels < 5) {
        issues.push('Insufficient ARIA labels for screen readers');
        recommendations.push('Add ARIA labels to interactive elements and complex components');
        score -= 25;
      }
      
      if (keyboardNavigation === 0) {
        issues.push('No keyboard navigation support detected');
        recommendations.push('Implement keyboard navigation for all interactive elements');
        score -= 30;
      }
      
      if (altTexts === 0) {
        issues.push('No alt texts found for images');
        recommendations.push('Add descriptive alt text to all images');
        score -= 15;
      }
      
      if (colorOnlyReliance > 0) {
        issues.push('Color used as the only means of conveying information');
        recommendations.push('Use additional indicators beyond color (icons, text, patterns)');
        score -= 10;
      }
      
      // Check for focus management
      const hasFocusManagement = sourceFiles.some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('focus') || content.includes('Focus') || content.includes('outline');
        } catch (error) {
          return false;
        }
      });
      
      if (!hasFocusManagement) {
        issues.push('No focus management detected');
        recommendations.push('Implement visible focus indicators and focus management');
        score -= 15;
      }
      
      this.results.accessibility = {
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: {
          semanticElements,
          ariaLabels,
          keyboardNavigation,
          altTexts,
          colorOnlyReliance,
          hasFocusManagement
        }
      };
      
    } catch (error) {
      this.log(`Accessibility assessment error: ${error.message}`, 'error');
      this.results.accessibility.score = 50;
    }
    
    this.log(`Accessibility Score: ${this.results.accessibility.score}/100`, 
             this.results.accessibility.score >= 70 ? 'success' : 'warning');
  }

  // Helper Methods
  getAllReactFiles() {
    return this.getAllSourceFilesByExtension(['.tsx', '.jsx']);
  }

  getAllCSSFiles() {
    return this.getAllSourceFilesByExtension(['.css', '.scss', '.sass']);
  }

  getAllSourceFilesByExtension(extensions) {
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

  calculateOverallScore() {
    const scores = [
      this.results.uiIntuition.score,
      this.results.responsiveDesign.score,
      this.results.loadingStates.score,
      this.results.errorMessages.score,
      this.results.visualDesign.score,
      this.results.animations.score,
      this.results.accessibility.score
    ];
    
    this.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    return this.overallScore;
  }

  getRecommendation() {
    if (this.overallScore >= 85) {
      return 'EXCELLENT: Outstanding user experience ready for demo';
    } else if (this.overallScore >= 75) {
      return 'GOOD: Strong user experience with minor improvements needed';
    } else if (this.overallScore >= 65) {
      return 'FAIR: Adequate user experience but significant improvements recommended';
    } else {
      return 'POOR: Major user experience issues that may impact demo success';
    }
  }

  async generateReport() {
    const overallScore = this.calculateOverallScore();
    
    const report = {
      timestamp: new Date().toISOString(),
      overallScore,
      recommendation: this.getRecommendation(),
      summary: {
        uiIntuition: this.results.uiIntuition.score,
        responsiveDesign: this.results.responsiveDesign.score,
        loadingStates: this.results.loadingStates.score,
        errorMessages: this.results.errorMessages.score,
        visualDesign: this.results.visualDesign.score,
        animations: this.results.animations.score,
        accessibility: this.results.accessibility.score
      },
      details: this.results,
      criticalIssues: this.getCriticalIssues(),
      quickWins: this.getQuickWins()
    };
    
    fs.writeFileSync('ux-validation-report.json', JSON.stringify(report, null, 2));
    
    this.log(`📊 Overall UX Score: ${overallScore}/100`, 
             overallScore >= 75 ? 'success' : 'warning');
    this.log(`Recommendation: ${report.recommendation}`, 
             report.recommendation.startsWith('EXCELLENT') || report.recommendation.startsWith('GOOD') ? 'success' : 'warning');
    
    return report;
  }

  getCriticalIssues() {
    const critical = [];
    
    if (this.results.accessibility.score < 60) {
      critical.push('Accessibility barriers may prevent some users from using the application');
    }
    
    if (this.results.errorMessages.score < 60) {
      critical.push('Poor error handling may confuse users during demo');
    }
    
    if (this.results.loadingStates.score < 60) {
      critical.push('Lack of loading feedback may make app feel unresponsive');
    }
    
    return critical;
  }

  getQuickWins() {
    const quickWins = [];
    
    if (this.results.animations.score < 80) {
      quickWins.push('Add hover effects to buttons for immediate interactivity improvement');
    }
    
    if (this.results.loadingStates.score < 80) {
      quickWins.push('Add loading spinners to async operations for better perceived performance');
    }
    
    if (this.results.errorMessages.score < 80) {
      quickWins.push('Improve error message wording to be more user-friendly');
    }
    
    return quickWins;
  }

  async runValidation() {
    this.log('🎯 Starting UX Validation Suite...', 'info');
    
    await this.assessUIIntuition();
    await this.assessResponsiveDesign();
    await this.assessLoadingStates();
    await this.assessErrorMessages();
    await this.assessVisualDesign();
    await this.assessAnimations();
    await this.assessAccessibility();
    
    const report = await this.generateReport();
    
    this.log('✅ UX validation completed!', 'success');
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validation = new UXValidationSuite();
  validation.runValidation().catch(console.error);
}

module.exports = UXValidationSuite;
