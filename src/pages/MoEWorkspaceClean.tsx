import React, { useState, useCallback, useRef, useMemo, memo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
  ReactFlowInstance,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Core Components
import BlockPalette from '../components/BlockPalette';
import BlockNode from '../components/BlockNode';
import AIBlockGenerator from '../components/AIBlockGenerator';

// Services
import { AIBlockGenerationService } from '../services/AIBlockGenerationService';
import { UniversalExportService } from '../export/UniversalExportService';

// Types
import { BlockDefinition } from '../storage/types/GridTypes';

// Simple icons (using Unicode as fallback)
const Icons = {
  Play: '▶️',
  Stop: '⏹️',
  Pause: '⏸️',
  Settings: '⚙️',
  Download: '⬇️',
  Sparkles: '✨',
  Chart: '📊',
  CPU: '🔧',
  Lightning: '⚡',
  Code: '💻',
  Docker: '🐳',
  Cloud: '☁️',
  Notebook: '📓',
};

// Enhanced styles for smoother animations
const smoothTransition = 'transition-all duration-300 ease-out';
const glassEffect = 'backdrop-blur-sm bg-opacity-80 border border-gray-200 dark:border-gray-700';
const neonGlow = 'shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30';

// Expert Library - Pre-built components as per hackathon prompts
const PRE_BUILT_EXPERTS: BlockDefinition[] = [
  // Text Processing Experts
  {
    id: 'bert-classifier',
    name: 'BERT Classifier',
    description: 'BERT-based text classification expert',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'text', name: 'Text Input', type: 'text', description: 'Input text to classify', required: true }],
    outputs: [{ id: 'classification', name: 'Classification', type: 'text', description: 'Classification result', required: true }],
    implementation: 'from transformers import pipeline\nclassifier = pipeline("text-classification")',
    tags: ['nlp', 'text', 'classification', 'bert'],
    performance: {
      avgExecutionTime: 100,
      memoryUsage: 'medium' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 30000
    },
    config: {
      model: {
        type: 'text',
        label: 'Model Name',
        default: 'bert-base-uncased'
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'BERT-based text classification using transformers',
      dependencies: ['transformers', 'torch'],
      isGenerated: false,
      tags: ['nlp', 'transformers'],
      category: 'text'
    }
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyze text sentiment and emotions',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'text', name: 'Text', type: 'text', description: 'Text to analyze', required: true }],
    outputs: [{ id: 'sentiment', name: 'Sentiment Score', type: 'number', description: 'Sentiment score', required: true }],
    implementation: 'from textblob import TextBlob\nsentiment = TextBlob(text).sentiment.polarity',
    tags: ['nlp', 'sentiment', 'emotion'],
    performance: {
      avgExecutionTime: 50,
      memoryUsage: 'low' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 10000
    },
    config: {
      threshold: {
        type: 'number',
        label: 'Sentiment Threshold',
        default: 0.5,
        min: -1,
        max: 1
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Text sentiment analysis using TextBlob',
      dependencies: ['textblob'],
      isGenerated: false,
      tags: ['sentiment', 'nlp'],
      category: 'text'
    }
  },
  {
    id: 'ner-extractor',
    name: 'Named Entity Recognition',
    description: 'Extract entities from text',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'text', name: 'Text', type: 'text', description: 'Text to process', required: true }],
    outputs: [{ id: 'entities', name: 'Entities', type: 'array', description: 'Extracted entities', required: true }],
    implementation: 'import spacy\nnlp = spacy.load("en_core_web_sm")\nentities = nlp(text).ents',
    tags: ['nlp', 'ner', 'entities'],
    performance: {
      avgExecutionTime: 150,
      memoryUsage: 'medium' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 20000
    },
    config: {
      model: {
        type: 'select',
        label: 'NER Model',
        options: ['en_core_web_sm', 'en_core_web_md', 'en_core_web_lg'],
        default: 'en_core_web_sm'
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Named entity recognition using spaCy',
      dependencies: ['spacy'],
      isGenerated: false,
      tags: ['ner', 'nlp'],
      category: 'text'
    }
  },
  
  // Vision Experts
  {
    id: 'image-classifier',
    name: 'Image Classifier',
    description: 'Classify images using CNN models',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'image', name: 'Image', type: 'image', description: 'Input image', required: true }],
    outputs: [{ id: 'class', name: 'Class', type: 'text', description: 'Predicted class', required: true }],
    implementation: 'from torchvision import models, transforms\nmodel = models.resnet50(pretrained=True)',
    tags: ['vision', 'classification', 'cnn'],
    performance: {
      avgExecutionTime: 200,
      memoryUsage: 'high' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 60000
    },
    config: {
      model: {
        type: 'select',
        label: 'Model Architecture',
        options: ['resnet50', 'resnet101', 'vgg16', 'efficientnet'],
        default: 'resnet50'
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Image classification using PyTorch models',
      dependencies: ['torch', 'torchvision'],
      isGenerated: false,
      tags: ['vision', 'classification'],
      category: 'vision'
    }
  },
  {
    id: 'object-detector',
    name: 'Object Detector',
    description: 'Detect objects in images',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'image', name: 'Image', type: 'image', description: 'Input image', required: true }],
    outputs: [{ id: 'objects', name: 'Detected Objects', type: 'array', description: 'Detected objects with bounding boxes', required: true }],
    implementation: 'from detectron2 import model_zoo\nfrom detectron2.engine import DefaultPredictor',
    tags: ['vision', 'detection', 'objects'],
    performance: {
      avgExecutionTime: 500,
      memoryUsage: 'very_high' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 90000
    },
    config: {
      confidence: {
        type: 'number',
        label: 'Confidence Threshold',
        default: 0.7,
        min: 0,
        max: 1
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Object detection using Detectron2',
      dependencies: ['detectron2', 'torch'],
      isGenerated: false,
      tags: ['detection', 'vision'],
      category: 'vision'
    }
  },
  
  // Audio Experts
  {
    id: 'speech-recognition',
    name: 'Speech Recognition',
    description: 'Convert speech to text',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'audio', name: 'Audio', type: 'audio', description: 'Audio input', required: true }],
    outputs: [{ id: 'text', name: 'Transcribed Text', type: 'text', description: 'Transcribed text', required: true }],
    implementation: 'import whisper\nmodel = whisper.load_model("base")\nresult = model.transcribe(audio)',
    tags: ['audio', 'speech', 'transcription'],
    performance: {
      avgExecutionTime: 300,
      memoryUsage: 'high' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 120000
    },
    config: {
      model_size: {
        type: 'select',
        label: 'Model Size',
        options: ['tiny', 'base', 'small', 'medium', 'large'],
        default: 'base'
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Speech recognition using OpenAI Whisper',
      dependencies: ['whisper'],
      isGenerated: false,
      tags: ['speech', 'audio'],
      category: 'audio'
    }
  },
  
  // Multimodal Experts
  {
    id: 'clip-encoder',
    name: 'CLIP Encoder',
    description: 'Encode images and text into joint space',
    category: 'expert',
    version: '1.0.0',
    inputs: [
      { id: 'image', name: 'Image', type: 'image', description: 'Input image', required: false },
      { id: 'text', name: 'Text', type: 'text', description: 'Input text', required: false }
    ],
    outputs: [{ id: 'embedding', name: 'Joint Embedding', type: 'tensor', description: 'CLIP embedding', required: true }],
    implementation: 'import clip\nimport torch\nmodel, preprocess = clip.load("ViT-B/32")',
    tags: ['multimodal', 'clip', 'embedding'],
    performance: {
      avgExecutionTime: 250,
      memoryUsage: 'high' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 45000
    },
    config: {
      model: {
        type: 'select',
        label: 'CLIP Model',
        options: ['ViT-B/32', 'ViT-B/16', 'ViT-L/14'],
        default: 'ViT-B/32'
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Multimodal encoding using CLIP',
      dependencies: ['clip-by-openai', 'torch'],
      isGenerated: false,
      tags: ['multimodal', 'clip'],
      category: 'multimodal'
    }
  },
  
  // RAG Experts
  {
    id: 'document-retriever',
    name: 'Document Retriever',
    description: 'Retrieve relevant documents for RAG',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'query', name: 'Query', type: 'text', description: 'Search query', required: true }],
    outputs: [{ id: 'documents', name: 'Retrieved Docs', type: 'array', description: 'Retrieved documents', required: true }],
    implementation: 'from sentence_transformers import SentenceTransformer\nmodel = SentenceTransformer("all-MiniLM-L6-v2")',
    tags: ['rag', 'retrieval', 'documents'],
    performance: {
      avgExecutionTime: 180,
      memoryUsage: 'medium' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 30000
    },
    config: {
      top_k: {
        type: 'number',
        label: 'Top K Documents',
        default: 5,
        min: 1,
        max: 20
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Document retrieval using sentence transformers',
      dependencies: ['sentence-transformers'],
      isGenerated: false,
      tags: ['rag', 'retrieval'],
      category: 'rag'
    }
  },
  
  // Classical ML Experts
  {
    id: 'linear-regression',
    name: 'Linear Regression',
    description: 'Linear regression model',
    category: 'expert',
    version: '1.0.0',
    inputs: [{ id: 'features', name: 'Features', type: 'array', description: 'Input features', required: true }],
    outputs: [{ id: 'prediction', name: 'Prediction', type: 'number', description: 'Regression prediction', required: true }],
    implementation: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()',
    tags: ['ml', 'regression', 'sklearn'],
    performance: {
      avgExecutionTime: 10,
      memoryUsage: 'low' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 5000
    },
    config: {
      normalize: {
        type: 'boolean',
        label: 'Normalize Features',
        default: true
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Linear regression using scikit-learn',
      dependencies: ['scikit-learn'],
      isGenerated: false,
      tags: ['regression', 'ml'],
      category: 'classical'
    }
  }
];

// Helper function to get expert display properties
const getExpertDisplayProps = (expert: BlockDefinition) => {
  const categoryIcons: Record<string, string> = {
    text: '📝',
    vision: '🖼️',
    audio: '🎤',
    multimodal: '🔗',
    rag: '📚',
    classical: '📈'
  };
  
  const categoryColors: Record<string, string> = {
    text: '#10b981',
    vision: '#ef4444',
    audio: '#06b6d4',
    multimodal: '#84cc16',
    rag: '#f97316',
    classical: '#ec4899'
  };
  
  return {
    icon: categoryIcons[expert.metadata?.category || 'expert'] || '🔧',
    color: categoryColors[expert.metadata?.category || 'expert'] || '#6b7280'
  };
};

// Initial setup
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  aiBlock: memo(BlockNode),
};

const connectionLineStyle = { 
  stroke: '#3b82f6', 
  strokeWidth: 3,
  strokeDasharray: '5,5',
};

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: '#3b82f6' },
  type: 'smoothstep',
  animated: true,
  animationDuration: 2000,
};

interface MoEWorkspaceProps {
  isDark: boolean;
}

const MoEWorkspace: React.FC<MoEWorkspaceProps> = ({ isDark }) => {
  // Core React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // UI State
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  
  // Simulation State
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    latency: 0,
    throughput: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  
  // Services
  const aiBlockService = useMemo(() => new AIBlockGenerationService(), []);
  const exportService = useMemo(() => new UniversalExportService(), []);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    },
    [setEdges]
  );

  // Drop handler for new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/json') || '{}');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'aiBlock',
        position,
        data: {
          ...nodeData,
          label: nodeData.name || type,
          onEdit: (nodeId: string) => handleNodeEdit(nodeId),
          onDelete: (nodeId: string) => handleNodeDelete(nodeId),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Node handlers
  const handleNodeEdit = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  }, [nodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // AI Expert Generation
  const handleGenerateAIExpert = useCallback(async (prompt: string) => {
    try {
      const result = await aiBlockService.generateBlock({
        prompt,
        existingBlocks: nodes.map(n => n.data as BlockDefinition),
        workflowContext: {
          workflowName,
          totalBlocks: nodes.length,
          connections: edges.length,
          prompt
        }
      });

      const newNode: Node = {
        id: `ai-expert-${Date.now()}`,
        type: 'aiBlock',
        position: { x: 250, y: 250 },
        data: {
          ...result.block,
          label: result.block.name,
          onEdit: handleNodeEdit,
          onDelete: handleNodeDelete,
          generated: true,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      setNodes((nds) => nds.concat(newNode));
      setShowAIGenerator(false);
    } catch (error) {
      console.error('Failed to generate AI expert:', error);
    }
  }, [aiBlockService, nodes, edges, workflowName, setNodes, handleNodeEdit, handleNodeDelete]);

  // Simulation Controls
  const handleStartSimulation = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsSimulating(true);
    setSimulationProgress(0);
    setActiveNodes(new Set());

    try {
      // Simulate workflow execution with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSimulationProgress(i);
        
        // Simulate active nodes
        const currentActiveNodes = nodes.slice(0, Math.floor((i / 100) * nodes.length)).map(n => n.id);
        setActiveNodes(new Set(currentActiveNodes));
        
        // Update performance metrics
        setPerformanceMetrics({
          latency: Math.random() * 100 + 50,
          throughput: Math.random() * 1000 + 500,
          memoryUsage: Math.random() * 80 + 20,
          cpuUsage: Math.random() * 60 + 20
        });
      }
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [nodes]);

  const handleStopSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setActiveNodes(new Set());
  }, []);

  // Export functionality
  const handleExportWorkflow = useCallback(async (format: string) => {
    try {
      const workflow = {
        id: 'export-workflow',
        name: workflowName,
        blocks: nodes.map(n => n.data as BlockDefinition),
        connections: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || 'output',
          targetHandle: e.targetHandle || 'input'
        })),
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          totalBlocks: nodes.length,
          totalConnections: edges.length
        }
      };

      // For demo purposes, create a simple export
      let exportCode = '';
      let filename = '';
      
      switch (format) {
        case 'python':
          exportCode = `# µLM Generated Workflow: ${workflowName}
import json
from typing import Dict, Any

class ${workflowName.replace(/\s+/g, '')}Workflow:
    def __init__(self):
        self.blocks = ${JSON.stringify(workflow.blocks, null, 2)}
        
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Generated workflow execution logic
        result = input_data
        for block in self.blocks:
            # Process through each expert
            result = self.process_block(block, result)
        return result
        
    def process_block(self, block: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        # Mock processing for demo
        print(f"Processing through {block['name']}")
        return data

if __name__ == "__main__":
    workflow = ${workflowName.replace(/\s+/g, '')}Workflow()
    result = workflow.execute({"input": "test data"})
    print(result)
`;
          filename = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_workflow.py`;
          break;
          
        case 'docker':
          exportCode = `# µLM Docker Export: ${workflowName}
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY workflow.py .
COPY config.json .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "workflow:app", "--host", "0.0.0.0", "--port", "8000"]
`;
          filename = `Dockerfile`;
          break;
          
        case 'jupyter':
          exportCode = `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# ${workflowName}\\n",
    "Generated by µLM AI Workflow Builder\\n",
    "\\n",
    "This notebook contains the implementation of your MoE workflow."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "source": [
    "# Import required libraries\\n",
    "import numpy as np\\n",
    "import pandas as pd\\n",
    "from transformers import pipeline\\n",
    "\\n",
    "# Initialize workflow\\n",
    "workflow_config = ${JSON.stringify(workflow, null, 2)}"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}`;
          filename = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_workflow.ipynb`;
          break;
          
        default:
          exportCode = JSON.stringify(workflow, null, 2);
          filename = `${workflowName.replace(/\s+/g, '_').toLowerCase()}_workflow.json`;
      }
      
      // Download the exported file
      const blob = new Blob([exportCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [nodes, edges, workflowName]);

  // Load workflow templates
  const handleLoadTemplate = useCallback((templateName: string) => {
    const templates = {
      'sentiment-analysis': {
        nodes: [
          {
            id: 'input-1',
            type: 'aiBlock',
            position: { x: 100, y: 100 },
            data: { 
              ...PRE_BUILT_EXPERTS.find(e => e.id === 'sentiment-analyzer')!,
              label: 'Text Input',
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          },
          {
            id: 'sentiment-1',
            type: 'aiBlock',
            position: { x: 400, y: 100 },
            data: { 
              ...PRE_BUILT_EXPERTS.find(e => e.id === 'sentiment-analyzer')!,
              label: 'Sentiment Analysis',
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          },
          {
            id: 'output-1',
            type: 'aiBlock',
            position: { x: 700, y: 100 },
            data: { 
              name: 'Output', 
              category: 'output' as const, 
              metadata: { icon: '📤', color: '#6b7280' },
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'sentiment-1', ...defaultEdgeOptions },
          { id: 'e2-3', source: 'sentiment-1', target: 'output-1', ...defaultEdgeOptions }
        ]
      },
      'document-qa': {
        nodes: [
          {
            id: 'doc-input-1',
            type: 'aiBlock',
            position: { x: 100, y: 100 },
            data: { 
              ...PRE_BUILT_EXPERTS.find(e => e.id === 'document-retriever')!,
              label: 'Document Input',
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          },
          {
            id: 'retriever-1',
            type: 'aiBlock',
            position: { x: 400, y: 100 },
            data: { 
              ...PRE_BUILT_EXPERTS.find(e => e.id === 'document-retriever')!,
              label: 'Document Retriever',
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          },
          {
            id: 'qa-output-1',
            type: 'aiBlock',
            position: { x: 700, y: 100 },
            data: { 
              name: 'QA Output', 
              category: 'output' as const, 
              metadata: { icon: '💬', color: '#6b7280' },
              onEdit: handleNodeEdit,
              onDelete: handleNodeDelete,
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'doc-input-1', target: 'retriever-1', ...defaultEdgeOptions },
          { id: 'e2-3', source: 'retriever-1', target: 'qa-output-1', ...defaultEdgeOptions }
        ]
      }
    };

    const template = templates[templateName as keyof typeof templates];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setWorkflowName(templateName.replace('-', ' ').toUpperCase());
    }
  }, [setNodes, setEdges, handleNodeEdit, handleNodeDelete]);

  return (
    <div className={`w-full h-screen ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 ${smoothTransition}`}>
      <ReactFlowProvider>
        <div className="flex h-full">
          {/* Left Sidebar - Expert Palette */}
          <div className={`w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${smoothTransition}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{Icons.CPU}</span>
                Expert Library
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drag & drop AI experts to build your MoE system
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Expert Categories */}
              <div className="space-y-4">
                {['Text Processing', 'Computer Vision', 'Audio', 'Multimodal', 'RAG', 'Classical ML'].map((category) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</h3>
                    <div className="space-y-2">
                      {PRE_BUILT_EXPERTS
                        .filter(expert => {
                          switch (category) {
                            case 'Text Processing': return ['bert-classifier', 'sentiment-analyzer', 'ner-extractor'].includes(expert.id);
                            case 'Computer Vision': return ['image-classifier', 'object-detector'].includes(expert.id);
                            case 'Audio': return ['speech-recognition'].includes(expert.id);
                            case 'Multimodal': return ['clip-encoder'].includes(expert.id);
                            case 'RAG': return ['document-retriever'].includes(expert.id);
                            case 'Classical ML': return ['linear-regression'].includes(expert.id);
                            default: return false;
                          }
                        })
                        .map((expert) => {
                          const displayProps = getExpertDisplayProps(expert);
                          return (
                          <div
                            key={expert.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData('application/reactflow', 'aiBlock');
                              event.dataTransfer.setData('application/json', JSON.stringify(expert));
                            }}
                            className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab hover:bg-gray-100 dark:hover:bg-gray-600 ${smoothTransition} border-l-4`}
                            style={{ borderLeftColor: displayProps.color }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{displayProps.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {expert.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {expert.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        );})}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={() => setShowAIGenerator(true)}
                className={`w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 ${smoothTransition} ${neonGlow}`}
              >
                <span>{Icons.Sparkles}</span>
                Generate AI Expert
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLoadTemplate('sentiment-analysis')}
                  className={`px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 ${smoothTransition} text-xs`}
                >
                  📊 Sentiment
                </button>
                <button
                  onClick={() => handleLoadTemplate('document-qa')}
                  className={`px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 ${smoothTransition} text-xs`}
                >
                  📚 Doc QA
                </button>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            {/* Top Toolbar */}
            <div className={`h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 ${smoothTransition}`}>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="px-3 py-1 bg-transparent border-none text-lg font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  placeholder="Workflow Name"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {nodes.length} experts • {edges.length} connections
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Simulation Controls */}
                <div className="flex items-center gap-1 mr-4">
                  {!isSimulating ? (
                    <button
                      onClick={handleStartSimulation}
                      disabled={nodes.length === 0}
                      className={`p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition}`}
                      title="Start Simulation"
                    >
                      <span>{Icons.Play}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopSimulation}
                      className={`p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 ${smoothTransition}`}
                      title="Stop Simulation"
                    >
                      <span>{Icons.Stop}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                    className={`p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 ${smoothTransition}`}
                    title="Performance Dashboard"
                  >
                    <span>{Icons.Chart}</span>
                  </button>
                </div>

                {/* Export Controls */}
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={nodes.length === 0}
                  className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition}`}
                >
                  <span>{Icons.Download}</span>
                  Export
                </button>

                <button
                  onClick={() => setShowAIGenerator(true)}
                  className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 ${smoothTransition}`}
                >
                  <span>{Icons.Lightning}</span>
                  AI Assistant
                </button>
              </div>
            </div>

            {/* Simulation Progress Bar */}
            {isSimulating && (
              <div className="absolute top-16 left-0 right-0 bg-blue-600 h-1 z-50">
                <div 
                  className="h-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
            )}

            {/* React Flow Canvas */}
            <div className="h-[calc(100%-4rem)]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                connectionLineStyle={connectionLineStyle}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                attributionPosition="bottom-left"
                className={`${isDark ? 'dark' : ''}`}
              >
                <Controls 
                  className={`${glassEffect} ${smoothTransition}`}
                />
                <MiniMap 
                  className={`${glassEffect} ${smoothTransition}`}
                  nodeColor={(node) => {
                    const expert = node.data as BlockDefinition;
                    return getExpertDisplayProps(expert).color;
                  }}
                />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={20} 
                  size={1}
                  className={isDark ? 'opacity-20' : 'opacity-30'}
                />
              </ReactFlow>
            </div>
          </div>

          {/* Right Panel - Performance Dashboard */}
          {showPerformanceDashboard && (
            <div className={`w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 ${smoothTransition}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{Icons.Chart}</span>
                  Performance Metrics
                </h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Latency</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.latency.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(performanceMetrics.latency, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.throughput.toFixed(0)} req/s
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(performanceMetrics.throughput / 10, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${performanceMetrics.memoryUsage}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${performanceMetrics.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {isSimulating && (
                  <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="animate-pulse">{Icons.Play}</span>
                      <span className="text-sm font-medium">Simulation Running</span>
                    </div>
                    <div className="mt-2 text-xs text-blue-500 dark:text-blue-300">
                      Progress: {simulationProgress}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] ${glassEffect} ${smoothTransition}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>{Icons.Sparkles}</span>
                AI Expert Generator
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe the AI expert you need:
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="e.g., 'Create an expert that can analyze code quality and suggest improvements'"
                    id="ai-prompt"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const prompt = (document.getElementById('ai-prompt') as HTMLTextAreaElement).value;
                      if (prompt.trim()) {
                        handleGenerateAIExpert(prompt);
                      }
                    }}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 ${smoothTransition}`}
                  >
                    Generate Expert
                  </button>
                  
                  <button
                    onClick={() => setShowAIGenerator(false)}
                    className={`px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] ${glassEffect} ${smoothTransition}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Export Workflow
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExportWorkflow('python')}
                  className={`w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                >
                  <span className="text-blue-600">{Icons.Code}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Python Package</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pip-installable with CLI</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExportWorkflow('docker')}
                  className={`w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                >
                  <span className="text-green-600">{Icons.Docker}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Docker Container</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Production-ready microservice</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExportWorkflow('jupyter')}
                  className={`w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                >
                  <span className="text-purple-600">{Icons.Notebook}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Jupyter Notebook</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Educational/research format</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default MoEWorkspace;
