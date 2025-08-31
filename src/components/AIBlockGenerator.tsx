// @ts-nocheck
/**
 * AI Block Generator Component
 * Intelligent floating button that generates custom blocks from natural language
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Code, Zap, Brain, Settings, Copy, Download } from 'lucide-react';
import { BlockDefinition, BlockCategory, Port } from '../storage/types/GridTypes';
import { aiBlockGenerationService, BlockGenerationRequest } from '../services/AIBlockGenerationService';

interface AIBlockGeneratorProps {
  onBlockGenerated: (block: BlockDefinition) => void;
  existingBlocks?: BlockDefinition[];
  workflowContext?: any;
}

interface GeneratedBlock {
  block: BlockDefinition;
  code: string;
  alternatives: BlockDefinition[];
  suggestions: string[];
  documentation: string;
}

export const AIBlockGenerator: React.FC<AIBlockGeneratorProps> = ({
  onBlockGenerated,
  existingBlocks = [],
  workflowContext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedBlock, setGeneratedBlock] = useState<GeneratedBlock | null>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // AI Block Generation Logic
  const generateBlock = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const request: BlockGenerationRequest = {
        prompt: prompt.trim(),
        existingBlocks,
        workflowContext,
        preferences: {
          complexity: 'intermediate',
          performance: 'balanced'
        }
      };
      
      const result = await aiBlockGenerationService.generateBlock(request);
      
      setGeneratedBlock({
        block: result.block,
        code: result.implementation.pythonCode,
        alternatives: result.alternatives,
        suggestions: result.optimization.suggestions,
        documentation: result.documentation.readme
      });
    } catch (error) {
      console.error('Block generation failed:', error);
      // Show error to user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToWorkflow = () => {
    console.log('🚀 handleAddToWorkflow called');
    console.log('📦 generatedBlock:', generatedBlock);
    if (generatedBlock) {
      console.log('📤 Calling onBlockGenerated with:', generatedBlock.block);
      onBlockGenerated(generatedBlock.block);
      setIsOpen(false);
      setGeneratedBlock(null);
      setPrompt('');
      console.log('✅ Block sent to workflow!');
    } else {
      console.error('❌ No generated block to add!');
    }
  };

  const copyCode = () => {
    if (generatedBlock) {
      navigator.clipboard.writeText(generatedBlock.code);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={`fixed z-50 cursor-pointer transition-all duration-300 ${isDragging ? 'scale-110' : 'hover:scale-105'}`}
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
          onClick={() => !isDragging && setIsOpen(true)}
        >
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* AI Generator Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <h2 className="text-lg font-semibold">AI Block Generator</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-[70vh]">
              {/* Input Panel */}
              <div className="w-1/2 p-4 border-r border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Describe the block you want to create:
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Create a text classifier that categorizes emails as spam or not spam using machine learning..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
                    disabled={isGenerating}
                  />
                </div>

                <button
                  onClick={generateBlock}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate Block</span>
                    </>
                  )}
                </button>

                {/* Workflow Context */}
                {existingBlocks.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      Workflow Context: {existingBlocks.length} existing blocks
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {existingBlocks.slice(0, 5).map(block => (
                        <span key={block.id} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-xs rounded">
                          {block.name}
                        </span>
                      ))}
                      {existingBlocks.length > 5 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-xs rounded">
                          +{existingBlocks.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Output Panel */}
              <div className="w-1/2 p-4 overflow-y-auto">
                {generatedBlock ? (
                  <div className="space-y-4">
                    {/* Block Preview */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h3 className="font-semibold text-lg mb-2">{generatedBlock.block.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {generatedBlock.block.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-medium">Inputs:</p>
                          {generatedBlock.block.inputs.map(input => (
                            <p key={input.id} className="text-gray-600">• {input.name} ({input.type})</p>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium">Outputs:</p>
                          {generatedBlock.block.outputs.map(output => (
                            <p key={output.id} className="text-gray-600">• {output.name} ({output.type})</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddToWorkflow}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Download className="w-4 h-4" />
                        <span>Add to Workflow</span>
                      </button>
                      <button
                        onClick={copyCode}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        title="Copy Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Code Preview */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b">
                        <span className="text-sm font-medium">Generated Code</span>
                        <Code className="w-4 h-4" />
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto bg-gray-900 text-green-400">
                        <code>{generatedBlock.code.slice(0, 500)}...</code>
                      </pre>
                    </div>

                    {/* Suggestions */}
                    {generatedBlock.suggestions.length > 0 && (
                      <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                        <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
                          Optimization Suggestions:
                        </h4>
                        <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                          {generatedBlock.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Describe your block to generate AI-powered code</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIBlockGenerator;
