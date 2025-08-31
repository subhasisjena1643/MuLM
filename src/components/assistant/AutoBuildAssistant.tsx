// @ts-nocheck
// Auto-Build AI Assistant UI Component
// Provides conversational workflow building with intelligent suggestions

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Wand2, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  BookOpen,
  TrendingUp,
  Zap,
  Target,
  Layers,
  GitBranch,
  Clock,
  BarChart3,
  Brain,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  Sparkles,
  Code,
  Database,
  Network,
  X
} from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { 
  autoBuildAI, 
  WorkflowRequirements, 
  WorkflowArchitecture, 
  WorkflowPattern, 
  ConversationTurn,
  BlockSuggestion
} from '../../services/AutoBuildAIService';

interface AutoBuildAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (nodes: Node[], edges: Edge[]) => void;
  onApplyOptimizations: (optimizations: any) => void;
  isDark: boolean;
  currentNodes?: Node[];
  currentEdges?: Edge[];
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: WorkflowPattern[];
    architecture?: WorkflowArchitecture;
    questions?: string[];
    optimizations?: any;
    actions?: string[];
  };
}

export const AutoBuildAssistant: React.FC<AutoBuildAssistantProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
  onApplyOptimizations,
  isDark,
  currentNodes = [],
  currentEdges = [],
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'initial' | 'requirements' | 'patterns' | 'architecture' | 'optimization'>('initial');
  const [requirements, setRequirements] = useState<WorkflowRequirements | null>(null);
  const [suggestedPatterns, setSuggestedPatterns] = useState<WorkflowPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<WorkflowPattern | null>(null);
  const [generatedArchitecture, setGeneratedArchitecture] = useState<WorkflowArchitecture | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    }
  }, [isOpen]);

  // Handle initial prompt from homepage
  useEffect(() => {
    if (initialPrompt && isOpen && messages.length === 1) {
      setInputValue(initialPrompt);
      setTimeout(() => {
        handleSendMessage();
      }, 1000); // Small delay after welcome message
    }
  }, [initialPrompt, isOpen, messages.length]);

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `🎉 **Welcome to the Auto-Build AI Assistant!**

I'll help you create intelligent µLM workflows from natural language descriptions. Here's what I can do:

✨ **Analyze Requirements** - Parse your description and identify data types, transformations, and constraints
🏗️ **Generate Workflows** - Create complete workflows with optimal block placement and connections
🔧 **Smart Configuration** - Intelligently configure block parameters based on your needs
🛡️ **Add Safety Features** - Include error handling, monitoring, and validation automatically
📊 **Provide Documentation** - Generate comprehensive workflow documentation

**Let's get started!** Tell me about the workflow you'd like to build. For example:
- "Create a chatbot that answers questions using my documents"
- "Build an ML pipeline for image classification"
- "Set up a real-time data processing system"

What would you like to create today?`,
      timestamp: new Date(),
      metadata: {
        actions: ['analyze', 'generate', 'optimize']
      }
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      await processUserInput(inputValue);
    } catch (error) {
      console.error('Error processing user input:', error);
      addAssistantMessage(`I apologize, but I encountered an error processing your request. Please try again or rephrase your request.`);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (input: string) => {
    switch (currentStep) {
      case 'initial':
        await handleInitialInput(input);
        break;
      case 'requirements':
        await handleRequirementsRefinement(input);
        break;
      case 'patterns':
        await handlePatternSelection(input);
        break;
      case 'architecture':
        await handleArchitectureReview(input);
        break;
      case 'optimization':
        await handleOptimizationFeedback(input);
        break;
    }
  };

  const handleInitialInput = async (input: string) => {
    // Parse requirements from user input
    const parsedRequirements = await autoBuildAI.parseRequirements(input);
    setRequirements(parsedRequirements);

    // Add conversation turn
    autoBuildAI.addConversationTurn('user', input);

    // Generate follow-up questions
    const questions = autoBuildAI.generateFollowUpQuestions(parsedRequirements);
    
    // Suggest workflow patterns
    const patterns = autoBuildAI.suggestWorkflowPattern(parsedRequirements);
    setSuggestedPatterns(patterns);

    let responseContent = `Great! I've analyzed your requirements and identified the following:\n\n`;
    
    responseContent += `**📋 Requirements Summary:**\n`;
    responseContent += `- **Input Types:** ${parsedRequirements.inputTypes.join(', ')}\n`;
    responseContent += `- **Output Types:** ${parsedRequirements.outputTypes.join(', ')}\n`;
    responseContent += `- **Complexity:** ${parsedRequirements.preferences.complexity}\n`;
    responseContent += `- **Reliability:** ${parsedRequirements.preferences.reliability}\n`;
    
    if (Object.values(parsedRequirements.constraints).some(v => v)) {
      responseContent += `\n**⚡ Constraints:**\n`;
      Object.entries(parsedRequirements.constraints)
        .filter(([_, value]) => value)
        .forEach(([key, value]) => {
          responseContent += `- **${key}:** ${value}\n`;
        });
    }

    if (patterns.length > 0) {
      responseContent += `\n**🏗️ Recommended Workflow Patterns:**\n`;
      patterns.slice(0, 3).forEach((pattern, index) => {
        responseContent += `${index + 1}. **${pattern.name}** - ${pattern.description}\n`;
        responseContent += `   - *Use case:* ${pattern.useCase}\n`;
        responseContent += `   - *Complexity:* ${pattern.complexity}/5\n`;
        responseContent += `   - *Performance:* ${pattern.performance.throughput} throughput, ${pattern.performance.latency} latency\n\n`;
      });
    }

    if (questions.length > 0) {
      responseContent += `**❓ I have a few questions to better understand your needs:**\n`;
      questions.forEach((question, index) => {
        responseContent += `${index + 1}. ${question}\n`;
      });
      responseContent += `\nYou can answer these questions, or simply say "generate workflow" to proceed with the current understanding.`;
      setCurrentStep('requirements');
    } else {
      responseContent += `\nWould you like me to generate a workflow based on the most suitable pattern, or would you prefer to review the options first?`;
      setCurrentStep('patterns');
    }

    addAssistantMessage(responseContent, {
      suggestions: patterns.slice(0, 3),
      questions: questions
    });
  };

  const handleRequirementsRefinement = async (input: string) => {
    if (input.toLowerCase().includes('generate') || input.toLowerCase().includes('proceed')) {
      await generateWorkflow();
      return;
    }

    // Process additional requirements
    const additionalRequirements = await autoBuildAI.parseRequirements(input);
    
    // Merge with existing requirements
    if (requirements) {
      const updatedRequirements = {
        ...requirements,
        description: requirements.description + ' ' + input,
        constraints: {
          ...requirements.constraints,
          ...additionalRequirements.constraints
        },
        preferences: {
          ...requirements.preferences,
          ...additionalRequirements.preferences
        }
      };
      setRequirements(updatedRequirements);

      // Update pattern suggestions
      const newPatterns = autoBuildAI.suggestWorkflowPattern(updatedRequirements);
      setSuggestedPatterns(newPatterns);
    }

    addAssistantMessage(`Thank you for the additional information! I've updated the requirements analysis. Would you like me to generate the workflow now, or do you have more requirements to specify?`);
  };

  const handlePatternSelection = async (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('1') || lowerInput.includes('first')) {
      setSelectedPattern(suggestedPatterns[0]);
    } else if (lowerInput.includes('2') || lowerInput.includes('second')) {
      setSelectedPattern(suggestedPatterns[1]);
    } else if (lowerInput.includes('3') || lowerInput.includes('third')) {
      setSelectedPattern(suggestedPatterns[2]);
    } else if (lowerInput.includes('generate') || lowerInput.includes('proceed')) {
      setSelectedPattern(suggestedPatterns[0]); // Default to first pattern
    }

    await generateWorkflow();
  };

  const generateWorkflow = async () => {
    if (!requirements) return;

    addAssistantMessage(`🔧 Generating your workflow architecture...`);

    try {
      const architecture = await autoBuildAI.generateWorkflowArchitecture(
        requirements,
        selectedPattern || undefined
      );
      
      setGeneratedArchitecture(architecture);
      setCurrentStep('architecture');

      let responseContent = `✅ **Workflow Generated Successfully!**\n\n`;
      
      responseContent += `**🏗️ Architecture: ${architecture.pattern.name}**\n`;
      responseContent += `${architecture.pattern.description}\n\n`;
      
      responseContent += `**🧩 Blocks (${architecture.blocks.length}):**\n`;
      architecture.blocks.forEach((block, index) => {
        responseContent += `${index + 1}. **${block.name}** (${block.type})\n`;
        responseContent += `   - ${block.description}\n`;
        responseContent += `   - *Reasoning:* ${block.reasoning}\n`;
      });

      responseContent += `\n**🔗 Connections (${architecture.connections.length}):**\n`;
      architecture.connections.forEach((conn, index) => {
        responseContent += `${index + 1}. ${conn.from} → ${conn.to} (${conn.type})\n`;
      });

      if (architecture.errorHandling.blocks.length > 0) {
        responseContent += `\n**🛡️ Error Handling:**\n`;
        architecture.errorHandling.strategies.forEach((strategy, index) => {
          responseContent += `- ${strategy}\n`;
        });
      }

      if (architecture.monitoring.blocks.length > 0) {
        responseContent += `\n**📊 Monitoring:**\n`;
        architecture.monitoring.metrics.forEach((metric, index) => {
          responseContent += `- ${metric}\n`;
        });
      }

      responseContent += `\n**💡 Next Steps:**\n`;
      responseContent += `- Review the generated workflow\n`;
      responseContent += `- Apply it to your canvas\n`;
      responseContent += `- Request optimizations\n`;
      responseContent += `- Provide feedback for learning\n`;

      responseContent += `\nWould you like me to apply this workflow to your canvas, or would you prefer to review and modify it first?`;

      addAssistantMessage(responseContent, {
        architecture: architecture,
        actions: ['apply', 'optimize', 'modify']
      });

    } catch (error) {
      addAssistantMessage(`❌ I encountered an error generating the workflow: ${error.message}. Please try again with a different approach.`);
    }
  };

  const handleArchitectureReview = async (input: string) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('apply') || lowerInput.includes('generate') || lowerInput.includes('yes')) {
      await applyWorkflowToCanvas();
    } else if (lowerInput.includes('optimize')) {
      await suggestOptimizations();
    } else if (lowerInput.includes('modify') || lowerInput.includes('change')) {
      addAssistantMessage(`What would you like to modify about the workflow? You can request changes to:
- Block types or configurations
- Connections and data flow
- Error handling strategies
- Performance optimizations
- Additional features

Please describe the changes you'd like to make.`);
    } else {
      await suggestOptimizations();
    }
  };

  const applyWorkflowToCanvas = async () => {
    if (!generatedArchitecture) return;

    addAssistantMessage(`🎨 Applying workflow to your canvas...`);

    try {
      // Convert architecture to React Flow nodes and edges
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Create nodes from blocks
      generatedArchitecture.blocks.forEach((block, index) => {
        const node: Node = {
          id: `${block.type}-${index}`,
          type: block.type,
          position: block.position,
          data: {
            label: block.name,
            blockType: block.type,
            config: block.config,
            description: block.description
          }
        };
        nodes.push(node);
      });

      // Add error handling blocks
      generatedArchitecture.errorHandling.blocks.forEach((block, index) => {
        const node: Node = {
          id: `error-${index}`,
          type: block.type,
          position: block.position,
          data: {
            label: block.name,
            blockType: block.type,
            config: block.config,
            description: block.description
          }
        };
        nodes.push(node);
      });

      // Add monitoring blocks
      generatedArchitecture.monitoring.blocks.forEach((block, index) => {
        const node: Node = {
          id: `monitor-${index}`,
          type: block.type,
          position: block.position,
          data: {
            label: block.name,
            blockType: block.type,
            config: block.config,
            description: block.description
          }
        };
        nodes.push(node);
      });

      // Create edges from connections
      generatedArchitecture.connections.forEach((conn, index) => {
        const sourceNode = nodes.find(n => n.data.blockType === conn.from);
        const targetNode = nodes.find(n => n.data.blockType === conn.to);

        if (sourceNode && targetNode) {
          const edge: Edge = {
            id: `edge-${index}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'smoothstep',
            data: {
              type: conn.type,
              reasoning: conn.reasoning
            }
          };
          edges.push(edge);
        }
      });

      // Apply to canvas
      onWorkflowGenerated(nodes, edges);

      addAssistantMessage(`✅ **Workflow Applied Successfully!**

Your new workflow has been added to the canvas with:
- ${nodes.length} blocks properly positioned
- ${edges.length} connections configured
- Error handling and monitoring included

The workflow is ready to use! You can:
- Customize individual block configurations
- Test the workflow with sample data
- Deploy to your preferred environment

Would you like me to suggest any optimizations or help with the next steps?`);

      setCurrentStep('optimization');

    } catch (error) {
      addAssistantMessage(`❌ Error applying workflow to canvas: ${error.message}`);
    }
  };

  const suggestOptimizations = async () => {
    if (!generatedArchitecture) return;

    addAssistantMessage(`🔍 Analyzing workflow for optimization opportunities...`);

    try {
      const optimizations = await autoBuildAI.suggestOptimizations(generatedArchitecture);

      let responseContent = `💡 **Optimization Suggestions:**\n\n`;

      if (optimizations.performance.length > 0) {
        responseContent += `**⚡ Performance Improvements:**\n`;
        optimizations.performance.forEach((opt, index) => {
          responseContent += `${index + 1}. ${opt}\n`;
        });
        responseContent += `\n`;
      }

      if (optimizations.cost.length > 0) {
        responseContent += `**💰 Cost Optimizations:**\n`;
        optimizations.cost.forEach((opt, index) => {
          responseContent += `${index + 1}. ${opt}\n`;
        });
        responseContent += `\n`;
      }

      if (optimizations.reliability.length > 0) {
        responseContent += `**🛡️ Reliability Improvements:**\n`;
        optimizations.reliability.forEach((opt, index) => {
          responseContent += `${index + 1}. ${opt}\n`;
        });
        responseContent += `\n`;
      }

      if (optimizations.maintainability.length > 0) {
        responseContent += `**🔧 Maintainability Enhancements:**\n`;
        optimizations.maintainability.forEach((opt, index) => {
          responseContent += `${index + 1}. ${opt}\n`;
        });
        responseContent += `\n`;
      }

      responseContent += `Would you like me to apply any of these optimizations automatically?`;

      addAssistantMessage(responseContent, {
        optimizations: optimizations,
        actions: ['apply-optimizations', 'custom-optimization']
      });

      setCurrentStep('optimization');

    } catch (error) {
      addAssistantMessage(`❌ Error analyzing optimizations: ${error.message}`);
    }
  };

  const handleOptimizationFeedback = async (input: string) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('apply') || lowerInput.includes('yes')) {
      addAssistantMessage(`🔧 Applying optimizations to your workflow...`);
      // Apply optimizations through callback
      if (generatedArchitecture) {
        const optimizations = await autoBuildAI.suggestOptimizations(generatedArchitecture);
        onApplyOptimizations(optimizations);
        addAssistantMessage(`✅ Optimizations applied successfully! Your workflow has been updated with performance, cost, and reliability improvements.`);
      }
    } else if (lowerInput.includes('feedback') || lowerInput.includes('rate')) {
      provideFeedbackInterface();
    } else {
      addAssistantMessage(`Is there anything else you'd like me to help you with regarding your workflow? I can:

- Generate additional workflows
- Suggest alternative architectures
- Help with specific block configurations
- Provide documentation
- Answer questions about best practices

Just let me know what you need!`);
    }
  };

  const provideFeedbackInterface = () => {
    addAssistantMessage(`🌟 **Feedback & Learning**

Please help me improve by rating this workflow generation experience:

**Overall Rating:** (1-5 stars)
**What worked well:**
**What could be improved:**
**Would you use this workflow pattern again?**

Your feedback helps me learn your preferences and generate better workflows in the future!`);
  };

  const addAssistantMessage = (content: string, metadata?: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      metadata
    };

    setMessages(prev => [...prev, message]);
    autoBuildAI.addConversationTurn('assistant', content, metadata);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'apply':
        setInputValue('apply workflow to canvas');
        break;
      case 'optimize':
        setInputValue('suggest optimizations');
        break;
      case 'modify':
        setInputValue('I want to modify the workflow');
        break;
      case 'generate':
        setInputValue('generate workflow');
        break;
      default:
        setInputValue(action);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`
            max-w-[80%] rounded-lg px-4 py-3
            ${isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }
          `}
        >
          {!isUser && (
            <div className="flex items-center mb-2">
              <Brain className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none text-sm">
            {message.content.split('\n').map((line, index) => (
              <div key={index}>
                {line.startsWith('**') && line.endsWith('**') ? (
                  <strong>{line.slice(2, -2)}</strong>
                ) : line.startsWith('- ') ? (
                  <div className="ml-4">• {line.slice(2)}</div>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>

          {/* Quick action buttons */}
          {!isUser && message.metadata?.actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.metadata.actions.map((action: string) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  {action === 'apply' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                  {action === 'optimize' && <Zap className="w-3 h-3 mr-1 inline" />}
                  {action === 'modify' && <Settings className="w-3 h-3 mr-1 inline" />}
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Pattern suggestions */}
          {!isUser && message.metadata?.suggestions && (
            <div className="mt-3 space-y-2">
              {message.metadata.suggestions.map((pattern: WorkflowPattern, index: number) => (
                <div
                  key={pattern.id}
                  className="p-3 bg-white dark:bg-gray-600 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                  onClick={() => {
                    setSelectedPattern(pattern);
                    setInputValue(`Use pattern ${index + 1}: ${pattern.name}`);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">{pattern.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Complexity: {pattern.complexity}/5
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Auto-Build AI</h3>
            <p className="text-xs text-blue-100">Intelligent Workflow Builder</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'initial' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <span>Requirements</span>
          </div>
          <ArrowRight className="w-3 h-3" />
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'patterns' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <span>Patterns</span>
          </div>
          <ArrowRight className="w-3 h-3" />
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'architecture' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <span>Generate</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your workflow or ask a question..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick suggestions */}
        <div className="mt-2 flex flex-wrap gap-1">
          {currentStep === 'initial' && (
            <>
              <button
                onClick={() => setInputValue('Create a chatbot with document search')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                💬 Chatbot
              </button>
              <button
                onClick={() => setInputValue('Build an ML pipeline for image classification')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                🤖 ML Pipeline
              </button>
              <button
                onClick={() => setInputValue('Set up real-time data processing')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ⚡ Real-time
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
