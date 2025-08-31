import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Play, CheckCircle, ArrowRight } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  highlight?: string;
  video?: string;
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to µLM AI Playground!',
    description: 'The most powerful visual block library system. Build, connect, and deploy AI workflows in minutes, not hours.',
    action: 'Get started with your first workflow',
    highlight: 'Perfect for hackathons, prototypes, and production apps'
  },
  {
    id: 'prompts',
    title: '💡 Start with Smart Prompts',
    description: 'Choose from our demo-winning workflow templates or describe your own idea in natural language.',
    action: 'Try clicking on a demo workflow below',
    highlight: 'AI automatically designs the entire workflow for you'
  },
  {
    id: 'canvas',
    title: '🎨 Visual Workflow Canvas',
    description: 'Drag and drop AI blocks, connect them with smart connectors, and watch your workflow come to life.',
    action: 'Each block represents an AI operation',
    highlight: 'Real-time configuration matching between connected blocks'
  },
  {
    id: 'blocks',
    title: '🧩 Intelligent AI Blocks',
    description: 'Each block is a powerful AI component: language models, image processors, data transformers, and more.',
    action: 'Blocks auto-configure when connected',
    highlight: 'No coding required - just connect and configure'
  },
  {
    id: 'execution',
    title: '⚡ Real-time Execution',
    description: 'Run workflows instantly with live progress tracking, error handling, and performance monitoring.',
    action: 'See results in real-time',
    highlight: 'Built-in cost estimation and optimization'
  },
  {
    id: 'export',
    title: '🚀 One-Click Deployment',
    description: 'Export to Docker, Kubernetes, serverless functions, or standalone applications with a single click.',
    action: 'Deploy anywhere, anytime',
    highlight: 'Production-ready code generated automatically'
  }
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">µLM Interactive Tutorial</h2>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentStep + 1} of {tutorialSteps.length}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                {tutorialSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-white text-blue-600 scale-110'
                        : completedSteps.has(index)
                        ? 'bg-green-500 text-white'
                        : index < currentStep
                        ? 'bg-white/60 text-white'
                        : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {completedSteps.has(index) ? (
                      <CheckCircle size={16} />
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                {currentStepData.title}
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentStepData.description}
              </p>
              
              {currentStepData.highlight && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    💡 {currentStepData.highlight}
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Play size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    Next Action:
                  </span>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  {currentStepData.action}
                </p>
              </div>
            </motion.div>

            {/* Demo Video/Image Placeholder */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Play size={24} className="text-white ml-1" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Interactive Demo: {currentStepData.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to see this feature in action
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                Skip Tutorial
              </button>
              
              <motion.button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>
                  {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
