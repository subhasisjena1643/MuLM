// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { X, Code, Settings, Play, Eye, Wand2, History, FileText, Bug } from 'lucide-react';
import { Node } from 'reactflow';
import { AdvancedCodeEditor } from '../editor/AdvancedCodeEditor';
import { VisualParameterEditor } from '../editor/VisualParameterEditor';
import { DiffViewer } from '../editor/DiffViewer';
import { aiCodeAssistant } from '../../services/AICodeAssistantService';

interface WorkspaceRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  width: number;
  onWidthChange: (width: number) => void;
  isDark: boolean;
}

export const WorkspaceRightPanel: React.FC<WorkspaceRightPanelProps> = ({
  isOpen,
  onClose,
  selectedNode,
  width,
  onWidthChange,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'config' | 'ai' | 'diff' | 'docs'>('code');
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize code when node changes
  useEffect(() => {
    if (selectedNode) {
      const nodeCode = getNodeCode(selectedNode);
      setCode(nodeCode);
      setOriginalCode(nodeCode);
      setHasUnsavedChanges(false);
    }
  }, [selectedNode]);

  const getNodeCode = (node: Node): string => {
    if (!node) return '';
    
    // Get code from node data or use default template
    if (node.data?.code) {
      return node.data.code;
    }

    return getDefaultCodeTemplate(node.type || 'default');
  };

  const getDefaultCodeTemplate = (nodeType: string): string => {
    const templates = {
      transformer: `# AI Transformer Block
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class TransformerBlock:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model_name = config.get('model_name', 'gpt-3.5-turbo')
        self.api_key = config.get('api_key', '')
        self.temperature = config.get('temperature', 0.7)
        self.max_tokens = config.get('max_tokens', 1000)
        
    async def execute(self, input_data: Any, context: Dict[str, Any]) -> Any:
        """
        Execute the transformer block
        
        Args:
            input_data: Input data to transform
            context: Execution context
            
        Returns:
            Transformed data
        """
        try:
            # Implement your transformation logic here
            logger.info(f"Processing with model: {self.model_name}")
            
            # Example transformation
            if isinstance(input_data, str):
                # Process text input
                result = await self.transform_text(input_data)
                return result
            else:
                # Handle other data types
                return input_data
                
        except Exception as e:
            logger.error(f"Transform failed: {e}")
            raise
            
    async def transform_text(self, text: str) -> str:
        """Transform text using AI model"""
        # Implement AI transformation logic
        return f"Transformed: {text}"
        
    def validate_config(self) -> bool:
        """Validate block configuration"""
        required_fields = ['model_name']
        for field in required_fields:
            if not self.config.get(field):
                raise ValueError(f"Missing required config: {field}")
        return True`,

      llm: `# Large Language Model Block
import asyncio
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class LLMBlock:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.provider = config.get('provider', 'openai')
        self.model = config.get('model', 'gpt-3.5-turbo')
        self.system_prompt = config.get('system_prompt', 'You are a helpful assistant.')
        self.streaming = config.get('streaming', False)
        
    async def execute(self, input_data: Any, context: Dict[str, Any]) -> Any:
        """
        Execute LLM processing
        
        Args:
            input_data: Input prompt or messages
            context: Execution context
            
        Returns:
            LLM response
        """
        try:
            logger.info(f"Processing with {self.provider} {self.model}")
            
            if isinstance(input_data, str):
                # Single prompt
                response = await self.generate_response(input_data)
                return response
            elif isinstance(input_data, list):
                # Chat messages
                response = await self.chat_completion(input_data)
                return response
            else:
                raise ValueError(f"Unsupported input type: {type(input_data)}")
                
        except Exception as e:
            logger.error(f"LLM processing failed: {e}")
            raise
            
    async def generate_response(self, prompt: str) -> str:
        """Generate response from prompt"""
        # Implement LLM API call
        return f"LLM Response to: {prompt}"
        
    async def chat_completion(self, messages: List[Dict]) -> str:
        """Process chat completion"""
        # Implement chat completion logic
        return "Chat completion response"
        
    def validate_config(self) -> bool:
        """Validate configuration"""
        if not self.config.get('api_key'):
            raise ValueError("API key is required")
        return True`,

      dataProcessor: `# Data Processing Block
import json
import logging
from typing import Dict, Any, Union, List
import pandas as pd

logger = logging.getLogger(__name__)

class DataProcessorBlock:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.input_format = config.get('input_format', 'json')
        self.output_format = config.get('output_format', 'json')
        self.validation_schema = config.get('validation_schema', {})
        
    async def execute(self, input_data: Any, context: Dict[str, Any]) -> Any:
        """
        Process input data
        
        Args:
            input_data: Raw input data
            context: Execution context
            
        Returns:
            Processed data
        """
        try:
            logger.info(f"Processing {self.input_format} to {self.output_format}")
            
            # Validate input
            if self.validation_schema:
                self.validate_data(input_data)
            
            # Process data
            processed_data = self.transform_data(input_data)
            
            # Format output
            formatted_output = self.format_output(processed_data)
            
            return formatted_output
            
        except Exception as e:
            logger.error(f"Data processing failed: {e}")
            raise
            
    def validate_data(self, data: Any) -> bool:
        """Validate data against schema"""
        # Implement validation logic
        return True
        
    def transform_data(self, data: Any) -> Any:
        """Transform data"""
        # Implement transformation logic
        if isinstance(data, dict):
            # Process dictionary
            return {k: self.process_value(v) for k, v in data.items()}
        elif isinstance(data, list):
            # Process list
            return [self.process_value(item) for item in data]
        else:
            return self.process_value(data)
            
    def process_value(self, value: Any) -> Any:
        """Process individual value"""
        # Implement value processing
        return value
        
    def format_output(self, data: Any) -> Any:
        """Format data for output"""
        if self.output_format == 'json':
            return json.dumps(data, indent=2)
        elif self.output_format == 'csv' and isinstance(data, list):
            df = pd.DataFrame(data)
            return df.to_csv(index=False)
        return data`,

      default: `# Custom Block Implementation
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CustomBlock:
    def __init__(self, config: Dict[str, Any]):
        """Initialize the block with configuration"""
        self.config = config
        self.name = config.get('name', 'custom_block')
        self.enabled = config.get('enabled', True)
        
    async def execute(self, input_data: Any, context: Dict[str, Any]) -> Any:
        """
        Execute the block logic
        
        Args:
            input_data: Input data from previous block
            context: Execution context with workflow state
            
        Returns:
            Processed output data
        """
        try:
            if not self.enabled:
                logger.info(f"Block {self.name} is disabled, passing through")
                return input_data
            
            logger.info(f"Executing block: {self.name}")
            
            # Implement your block logic here
            result = self.process_data(input_data, context)
            
            logger.info(f"Block {self.name} completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Block {self.name} failed: {e}")
            raise
            
    def process_data(self, data: Any, context: Dict[str, Any]) -> Any:
        """Process the input data"""
        # TODO: Implement your processing logic
        return data
        
    def validate_config(self) -> bool:
        """Validate block configuration"""
        return True`
    };

    return templates[nodeType] || templates.default;
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setHasUnsavedChanges(newCode !== originalCode);
  };

  const handleSaveCode = (savedCode: string) => {
    // Update the node with new code
    if (selectedNode) {
      selectedNode.data = {
        ...selectedNode.data,
        code: savedCode
      };
    }
    setOriginalCode(savedCode);
    setHasUnsavedChanges(false);
  };

  const handleConfigChange = (config: Record<string, any>) => {
    // Update node configuration
    if (selectedNode) {
      selectedNode.data = {
        ...selectedNode.data,
        config
      };
    }
  };

  const tabs = [
    { id: 'code', label: 'Code Editor', icon: Code },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'ai', label: 'AI Assistant', icon: Wand2 },
    { id: 'diff', label: 'Changes', icon: History },
    { id: 'docs', label: 'Documentation', icon: FileText },
  ];

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-16 right-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = width;

          const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(400, Math.min(800, startWidth - (e.clientX - startX)));
            onWidthChange(newWidth);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />

      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedNode ? selectedNode.data?.block?.name || selectedNode.type || 'Block' : 'No Selection'}
          </h3>
          {hasUnsavedChanges && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              Unsaved
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedNode ? (
          <>
            {activeTab === 'code' && (
              <AdvancedCodeEditor
                initialCode={code}
                language="python"
                blockType={selectedNode.type || 'default'}
                blockId={selectedNode.id}
                onCodeChange={handleCodeChange}
                onSave={handleSaveCode}
                isDark={isDark}
                showAIAssistant={true}
                showVersionHistory={true}
              />
            )}

            {activeTab === 'config' && (
              <VisualParameterEditor
                blockType={selectedNode.type || 'default'}
                blockId={selectedNode.id}
                initialConfig={selectedNode.data?.config || {}}
                onConfigChange={handleConfigChange}
                onSave={() => {}}
                isDark={isDark}
                showAdvanced={true}
              />
            )}

            {activeTab === 'diff' && originalCode !== code && (
              <DiffViewer
                originalCode={originalCode}
                modifiedCode={code}
                language="python"
                originalTitle="Original"
                modifiedTitle="Modified"
                isDark={isDark}
                readOnly={false}
              />
            )}

            {activeTab === 'docs' && (
              <div className="p-6 overflow-y-auto">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Block Documentation
                </h4>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    Documentation for {selectedNode.type || 'this block'} will be generated here.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <Wand2 className="w-4 h-4 inline mr-2" />
                    Generate Documentation
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Block Selected</p>
              <p className="text-sm">Select a block to view and edit its code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
