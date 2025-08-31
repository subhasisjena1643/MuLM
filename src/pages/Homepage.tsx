import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PremiumAnimatedBackground } from '../components/PremiumAnimatedBackground';
import { PremiumThemeToggle } from '../components/PremiumThemeToggle';
import { PremiumPromptInput } from '../components/PremiumPromptInput';
import { ExamplePrompts } from '../components/ExamplePrompts';
import { OnboardingTutorial } from '../components/OnboardingTutorial';
import { WorkflowTemplateGallery } from '../components/WorkflowTemplateGallery';
import { PresentationMode } from '../components/PresentationMode';
import { DemoStatsWidget } from '../components/DemoStatsWidget';
import { AnimatedDecorations } from '../components/AnimatedDecorations';
import { budgetOptimizationService } from '../services/BudgetOptimizationService';
import { backgroundAIWorkflowService } from '../services/BackgroundAIWorkflowService';
import { motion } from 'framer-motion';
import { Play, BookOpen, Sparkles, Zap, Award, Rocket } from 'lucide-react';

interface HomepageProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ isDark, onThemeToggle }) => {
  const [prompt, setPrompt] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePromptSubmit = async (submittedPrompt: string) => {
    console.log('🚀 Starting AI workflow generation for:', submittedPrompt);
    
    // Check budget before proceeding
    try {
      const budgetStatus = budgetOptimizationService.getBudgetStatus();
      if (budgetStatus.percentage > 95) {
        alert('Budget limit reached! Please optimize usage or increase budget.');
        return;
      }

      // Track budget usage for this generation
      budgetOptimizationService.trackUsage(2.5, 'workflow-generation', {
        prompt: submittedPrompt.substring(0, 100),
        timestamp: new Date()
      });
    } catch (budgetError) {
      console.warn('Budget check failed, proceeding anyway:', budgetError);
    }

    setIsGenerating(true);
    setGenerationProgress('🧠 Initializing block library system...');
    
    try {
      // Debug logging
      console.log('🔍 Debug: Starting workflow generation');
      console.log('🔍 Debug: backgroundAIWorkflowService available:', !!backgroundAIWorkflowService);
      
      // Generate workflow in background using AI service
      const workflowResult = await backgroundAIWorkflowService.generateWorkflowFromPrompt(
        submittedPrompt,
        (progress) => {
          setGenerationProgress(progress);
          console.log('🔄 Generation progress:', progress);
        }
      );

      console.log('🔍 Debug: Workflow result received:', workflowResult);

      if (workflowResult.success) {
        console.log('✅ Workflow generated successfully:', workflowResult);
        
        setGenerationProgress('🚀 Launching AI workspace...');
        setIsTransitioning(true);
        
        // Navigate to enhanced workspace with pre-generated workflow
        try {
          console.log('🔍 Debug: Attempting navigation to /enhanced-workspace');
          navigate('/enhanced-workspace', { 
            state: { 
              prompt: submittedPrompt,
              useAI: true,
              preGeneratedWorkflow: {
                nodes: workflowResult.nodes,
                edges: workflowResult.edges,
                workflowId: workflowResult.workflowId
              },
              generationSteps: workflowResult.generationSteps
            } 
          });
          console.log('🔍 Debug: Navigation initiated successfully');
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
          setIsGenerating(false);
          setIsTransitioning(false);
        }
      } else {
        console.error('❌ Workflow generation failed:', workflowResult.error);
        
        // Fallback to enhanced workspace navigation
        setGenerationProgress('⚠️ Falling back to manual builder...');
        setTimeout(() => {
          setIsTransitioning(true);
          navigate('/enhanced-workspace', { 
            state: { 
              prompt: submittedPrompt,
              useAI: true,
              error: workflowResult.error
            } 
          });
        }, 1000);
      }
    } catch (error) {
      console.error('❌ AI workflow generation error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      });
      
      // Fallback navigation to enhanced workspace
      setGenerationProgress('⚠️ Switching to manual mode...');
      setTimeout(() => {
        try {
          setIsTransitioning(true);
          console.log('🔍 Debug: Fallback navigation to /enhanced-workspace');
          navigate('/enhanced-workspace', { 
            state: { 
              prompt: submittedPrompt,
              useAI: true,
              error: error instanceof Error ? error.message : 'Unknown error'
            } 
          });
        } catch (fallbackError) {
          console.error('❌ Fallback navigation failed:', fallbackError);
          setIsGenerating(false);
          setIsTransitioning(false);
          alert('Navigation failed. Please try refreshing the page.');
        }
      }, 1000);
    } finally {
      // Ensure loading state is cleared
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    }
  };

  const handleExampleSelect = async (example: string) => {
    console.log('🎯 Processing demo prompt:', example);
    setPrompt(example);
    
    setIsGenerating(true);
    setGenerationProgress('🚀 Fast-tracking demo workflow...');
    
    try {
      // Use optimized demo generation
      const workflowResult = await backgroundAIWorkflowService.generateFromDemoPrompt(
        example,
        (progress) => {
          setGenerationProgress(progress);
          console.log('🔄 Demo generation progress:', progress);
        }
      );

      if (workflowResult.success) {
        console.log('✅ Demo workflow generated successfully:', workflowResult);
        
        setGenerationProgress('🎨 Loading demo workspace...');
        setIsTransitioning(true);
        
        // Navigate to enhanced workspace with pre-generated demo workflow
        navigate('/enhanced-workspace', { 
          state: { 
            prompt: example,
            useAI: true,
            isDemo: true,
            preGeneratedWorkflow: {
              nodes: workflowResult.nodes,
              edges: workflowResult.edges,
              workflowId: workflowResult.workflowId
            },
            generationSteps: workflowResult.generationSteps
          } 
        });
      } else {
        // Fallback to regular generation
        handlePromptSubmit(example);
      }
    } catch (error) {
      console.error('❌ Demo generation error:', error);
      // Fallback to regular generation
      handlePromptSubmit(example);
    }
  };

  if (isTransitioning) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        <PremiumAnimatedBackground />
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Creating your AI workflow...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        <PremiumAnimatedBackground />
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generating AI Workflow
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {generationProgress}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PremiumAnimatedBackground />
      <AnimatedDecorations />
      <PremiumThemeToggle isDark={isDark} toggle={onThemeToggle} />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-7xl mx-auto text-center space-y-16 homepage-content">
          
          {/* Distinguished Header with Custom µLM Title */}
          <div className={`
            space-y-12 transition-all duration-1000 ease-out
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}>
            <div className="space-y-8">
              {/* Premium µLM Title with enhanced styling */}
              <div className="relative inline-block">
                <h1 
                  ref={titleRef}
                  className="mulm-title text-8xl md:text-9xl font-display font-bold leading-none tracking-tight"
                >
                  µLM
                </h1>
                
                {/* Decorative elements around the title */}
                <div className="absolute -top-4 -right-4 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-60" />
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className={`
                space-y-6 transition-all duration-1000 ease-out delay-400
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                {/* Refined tagline with better typography */}
                <p className="text-3xl md:text-4xl font-display font-medium text-gradient-secondary max-w-4xl mx-auto text-balance leading-tight">
                  Build AI Systems Visually.<br />
                  <span className="text-2xl md:text-3xl opacity-80">No Code Required.</span>
                </p>
                
                {/* Enhanced description */}
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-balance leading-relaxed">
                  Transform ideas into intelligent workflows with our visual AI builder. 
                  Drag, drop, and deploy sophisticated machine learning systems in minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Prompt Input Section */}
          <div className={`
            space-y-12 transition-all duration-1000 ease-out delay-700
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}>
            <PremiumPromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handlePromptSubmit}
            />
          </div>

          {/* Example Prompts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className={`
              transition-all duration-1000 ease-out delay-1000
              ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <ExamplePrompts onSelectPrompt={handleExampleSelect} />
          </motion.div>

          {/* Demo Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <motion.button
              onClick={() => setShowTutorial(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen size={20} />
              <span className="font-medium">Start Tutorial</span>
            </motion.button>

            <motion.button
              onClick={() => setShowTemplateGallery(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={20} />
              <span className="font-medium">Browse Templates</span>
            </motion.button>

            <motion.button
              onClick={() => setDemoMode(!demoMode)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                demoMode 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={20} />
              <span className="font-medium">
                {demoMode ? 'Exit Demo Mode' : 'Demo Mode'}
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/enhanced-workspace')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket size={20} />
              <span className="font-medium">Go to Workspace</span>
            </motion.button>

            <motion.button
              onClick={() => setPresentationMode(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-xl hover:from-red-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} />
              <span className="font-medium">Presentation Mode</span>
            </motion.button>
          </motion.div>

          {/* Demo Mode Features */}
          {demoMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                    🏆 Demo Mode Active
                  </h3>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Enhanced for hackathon presentations with optimized performance, 
                  pre-loaded templates, and presentation-ready features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      ⚡ Faster Load Times
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      📊 Mock Data Ready
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      🎯 Demo Templates
                    </p>
                  </div>
                </div>

                {/* Demo Stats Widget */}
                <div className="mt-6">
                  <DemoStatsWidget isDemoMode={demoMode} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tutorial and Template Gallery */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false);
          setShowTemplateGallery(true);
        }}
      />

      <WorkflowTemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={(template) => {
          setShowTemplateGallery(false);
          handleExampleSelect(template.description);
        }}
      />

      <PresentationMode
        isActive={presentationMode}
        onToggle={() => setPresentationMode(!presentationMode)}
      />
    </div>
  );
};
