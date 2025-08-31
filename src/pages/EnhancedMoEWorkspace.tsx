import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Core Components
import BlockPalette from '../components/BlockPalette';
import BlockNode from '../components/BlockNode';
import AIBlockGenerator from '../components/AIBlockGenerator';

// Services
import { AIBlockGenerationService } from '../services/AIBlockGenerationService';
import { UniversalExportService } from '../export/UniversalExportService';
import { WorkflowSimulationEngine } from '../simulation/WorkflowSimulationEngine';
import { autoBuildAI } from '../services/AutoBuildAIService';
import { openaiWorkflowIntelligence } from '../services/OpenAIWorkflowIntelligence';
import DistributedGridProcessingService from '../services/DistributedGridProcessingService';

// Storage
import { GridStorage } from '../storage/GridStorage';

// Types
import { BlockDefinition } from '../storage/types/GridTypes';

// Icons
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
  Robot: '🤖',
  Magic: '🪄',
  Workflow: '🔄',
  Database: '🗃️',
  Link: '🔗',
  Eye: '👁️',
  Bug: '🐛',
  Rocket: '🚀',
  Zap: '⚡',
  Build: '🔨',
  Test: '🧪',
  Export: '📤',
  Import: '📥',
  Grid: '⚏',
  Search: '🔍',
};

// Enhanced styles
const smoothTransition = 'transition-all duration-300 ease-out';
const glassEffect = 'backdrop-blur-sm bg-opacity-80 border border-gray-200 dark:border-gray-700';
const neonGlow = 'shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30';

// Pre-built Expert Library (Enhanced from hackathon prompts)
const PRE_BUILT_EXPERTS: BlockDefinition[] = [
  // Text Processing Experts
  {
    id: 'bert-classifier',
    name: 'BERT Classifier',
    description: 'BERT-based text classification expert for sentiment, topics, and intent detection',
    category: 'expert',
    version: '1.0.0',
    inputs: [
      { id: 'text', name: 'Text Input', type: 'text', description: 'Input text to classify', required: true },
      { id: 'labels', name: 'Labels', type: 'array', description: 'Classification labels', required: false }
    ],
    outputs: [
      { id: 'classification', name: 'Classification', type: 'text', description: 'Classification result', required: true },
      { id: 'confidence', name: 'Confidence', type: 'number', description: 'Prediction confidence', required: true }
    ],
    implementation: `
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

class BERTClassifier:
    def __init__(self, model_name="bert-base-uncased", labels=None):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.classifier = pipeline("text-classification", 
                                 model=self.model, 
                                 tokenizer=self.tokenizer)
        self.labels = labels
        
    def process(self, text_input, labels=None):
        if labels:
            self.labels = labels
            
        results = self.classifier(text_input)
        return {
            'classification': results[0]['label'],
            'confidence': results[0]['score']
        }
    
    def batch_process(self, texts):
        return [self.process(text) for text in texts]
`,
    tags: ['nlp', 'text', 'classification', 'bert', 'transformers'],
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
        type: 'select',
        label: 'BERT Model',
        options: ['bert-base-uncased', 'bert-large-uncased', 'distilbert-base-uncased'],
        default: 'bert-base-uncased'
      },
      max_length: {
        type: 'number',
        label: 'Max Token Length',
        default: 512,
        min: 64,
        max: 1024
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'High-performance BERT-based text classification with configurable models and batch processing',
      dependencies: ['transformers', 'torch', 'numpy'],
      isGenerated: false,
      tags: ['nlp', 'transformers', 'production-ready'],
      category: 'text'
    }
  },
  
  {
    id: 'sentiment-analyzer',
    name: 'Advanced Sentiment Analyzer',
    description: 'Multi-model sentiment analysis with emotion detection and confidence scoring',
    category: 'expert',
    version: '1.0.0',
    inputs: [
      { id: 'text', name: 'Text', type: 'text', description: 'Text to analyze', required: true },
      { id: 'mode', name: 'Analysis Mode', type: 'text', description: 'sentiment|emotion|both', required: false }
    ],
    outputs: [
      { id: 'sentiment', name: 'Sentiment Score', type: 'number', description: 'Sentiment polarity (-1 to 1)', required: true },
      { id: 'emotion', name: 'Dominant Emotion', type: 'text', description: 'Primary emotion detected', required: false },
      { id: 'confidence', name: 'Confidence', type: 'number', description: 'Analysis confidence', required: true }
    ],
    implementation: `
from textblob import TextBlob
from transformers import pipeline
import numpy as np

class AdvancedSentimentAnalyzer:
    def __init__(self):
        self.sentiment_pipeline = pipeline("sentiment-analysis", 
                                          model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        self.emotion_pipeline = pipeline("text-classification", 
                                        model="j-hartmann/emotion-english-distilroberta-base")
        
    def process(self, text_input, mode="both"):
        results = {}
        
        # Sentiment Analysis
        if mode in ["sentiment", "both"]:
            sent_result = self.sentiment_pipeline(text_input)[0]
            # Convert to -1 to 1 scale
            sentiment_score = sent_result['score'] if sent_result['label'] == 'POSITIVE' else -sent_result['score']
            results['sentiment'] = sentiment_score
            
        # Emotion Detection
        if mode in ["emotion", "both"]:
            emotion_result = self.emotion_pipeline(text_input)[0]
            results['emotion'] = emotion_result['label']
            
        # Overall confidence
        results['confidence'] = np.mean([r['score'] for r in [sent_result, emotion_result] if 'score' in r])
        
        return results
`,
    tags: ['nlp', 'sentiment', 'emotion', 'analysis'],
    performance: {
      avgExecutionTime: 80,
      memoryUsage: 'medium' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 20000
    },
    config: {
      threshold: {
        type: 'number',
        label: 'Confidence Threshold',
        default: 0.7,
        min: 0.1,
        max: 1.0
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Advanced sentiment and emotion analysis using multiple transformer models',
      dependencies: ['textblob', 'transformers', 'numpy'],
      isGenerated: false,
      tags: ['sentiment', 'emotion', 'nlp'],
      category: 'text'
    }
  },

  // Vision Experts
  {
    id: 'image-classifier',
    name: 'Universal Image Classifier',
    description: 'State-of-the-art image classification with multiple model architectures',
    category: 'expert',
    version: '1.0.0',
    inputs: [
      { id: 'image', name: 'Image', type: 'image', description: 'Input image (PIL, numpy, or path)', required: true },
      { id: 'top_k', name: 'Top K Results', type: 'number', description: 'Number of top predictions', required: false }
    ],
    outputs: [
      { id: 'predictions', name: 'Predictions', type: 'array', description: 'Top predictions with confidence', required: true },
      { id: 'top_class', name: 'Top Class', type: 'text', description: 'Most likely class', required: true },
      { id: 'confidence', name: 'Confidence', type: 'number', description: 'Top prediction confidence', required: true }
    ],
    implementation: `
from torchvision import models, transforms
from PIL import Image
import torch
import torch.nn.functional as F
import requests
import json

class UniversalImageClassifier:
    def __init__(self, model_name="resnet50", top_k=5):
        self.model_name = model_name
        self.top_k = top_k
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load model
        if model_name == "resnet50":
            self.model = models.resnet50(pretrained=True)
        elif model_name == "efficientnet_b0":
            self.model = models.efficientnet_b0(pretrained=True)
        elif model_name == "vit_b_16":
            self.model = models.vit_b_16(pretrained=True)
            
        self.model.eval()
        self.model.to(self.device)
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        # Load ImageNet class labels
        self.class_labels = self._load_imagenet_labels()
        
    def process(self, image_input, top_k=None):
        if top_k:
            self.top_k = top_k
            
        # Handle different input types
        if isinstance(image_input, str):
            image = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, Image.Image):
            image = image_input.convert('RGB')
        else:
            raise ValueError("Unsupported image format")
            
        # Preprocess and predict
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = F.softmax(outputs[0], dim=0)
            
        # Get top k predictions
        top_prob, top_idx = torch.topk(probabilities, self.top_k)
        
        predictions = []
        for i in range(self.top_k):
            predictions.append({
                'class': self.class_labels[top_idx[i].item()],
                'confidence': top_prob[i].item()
            })
            
        return {
            'predictions': predictions,
            'top_class': predictions[0]['class'],
            'confidence': predictions[0]['confidence']
        }
`,
    tags: ['vision', 'classification', 'cnn', 'pytorch'],
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
        options: ['resnet50', 'efficientnet_b0', 'vit_b_16'],
        default: 'resnet50'
      },
      top_k: {
        type: 'number',
        label: 'Top K Predictions',
        default: 5,
        min: 1,
        max: 10
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Production-ready image classification with multiple SOTA architectures',
      dependencies: ['torch', 'torchvision', 'pillow', 'requests'],
      isGenerated: false,
      tags: ['vision', 'classification', 'production'],
      category: 'vision'
    }
  },

  // Multimodal Expert
  {
    id: 'clip-multimodal',
    name: 'CLIP Multimodal Expert',
    description: 'OpenAI CLIP for image-text understanding and zero-shot classification',
    category: 'expert',
    version: '1.0.0',
    inputs: [
      { id: 'image', name: 'Image', type: 'image', description: 'Input image', required: false },
      { id: 'text', name: 'Text', type: 'text', description: 'Input text or labels', required: false },
      { id: 'labels', name: 'Candidate Labels', type: 'array', description: 'Text labels for classification', required: false }
    ],
    outputs: [
      { id: 'similarity_scores', name: 'Similarity Scores', type: 'array', description: 'Image-text similarity scores', required: true },
      { id: 'best_match', name: 'Best Match', type: 'text', description: 'Best matching label', required: false },
      { id: 'embeddings', name: 'Embeddings', type: 'array', description: 'Feature embeddings', required: false }
    ],
    implementation: `
import clip
import torch
from PIL import Image
import numpy as np

class CLIPMultimodalExpert:
    def __init__(self, model_name="ViT-B/32"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, self.preprocess = clip.load(model_name, device=self.device)
        
    def process(self, image=None, text=None, labels=None):
        results = {}
        
        if image is not None and labels is not None:
            # Zero-shot image classification
            if isinstance(image, str):
                image = Image.open(image)
            
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            text_inputs = clip.tokenize(labels).to(self.device)
            
            with torch.no_grad():
                image_features = self.model.encode_image(image_input)
                text_features = self.model.encode_text(text_inputs)
                
                # Calculate similarities
                similarities = (100.0 * image_features @ text_features.T).softmax(dim=-1)
                similarities = similarities.cpu().numpy()[0]
                
            # Format results
            labeled_scores = [(labels[i], float(similarities[i])) for i in range(len(labels))]
            labeled_scores.sort(key=lambda x: x[1], reverse=True)
            
            results['similarity_scores'] = labeled_scores
            results['best_match'] = labeled_scores[0][0]
            
        elif image is not None:
            # Get image embeddings
            if isinstance(image, str):
                image = Image.open(image)
                
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                image_features = self.model.encode_image(image_input)
                results['embeddings'] = image_features.cpu().numpy().tolist()
                
        elif text is not None:
            # Get text embeddings
            text_input = clip.tokenize([text]).to(self.device)
            with torch.no_grad():
                text_features = self.model.encode_text(text_input)
                results['embeddings'] = text_features.cpu().numpy().tolist()
                
        return results
`,
    tags: ['multimodal', 'clip', 'vision', 'text', 'zero-shot'],
    performance: {
      avgExecutionTime: 150,
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
      documentation: 'OpenAI CLIP for powerful multimodal understanding and zero-shot capabilities',
      dependencies: ['clip-by-openai', 'torch', 'pillow'],
      isGenerated: false,
      tags: ['multimodal', 'clip', 'zero-shot'],
      category: 'multimodal'
    }
  },

  // Data Processing Experts
  {
    id: 'data-loader',
    name: 'Universal Data Loader',
    description: 'Load and preprocess data from multiple sources (CSV, JSON, API, Database)',
    category: 'input',
    version: '1.0.0',
    inputs: [
      { id: 'source', name: 'Data Source', type: 'text', description: 'File path, URL, or database connection', required: true },
      { id: 'format', name: 'Data Format', type: 'text', description: 'csv|json|api|sql', required: true }
    ],
    outputs: [
      { id: 'data', name: 'Loaded Data', type: 'dataframe', description: 'Processed data', required: true },
      { id: 'metadata', name: 'Data Metadata', type: 'object', description: 'Data information', required: true }
    ],
    implementation: `
import pandas as pd
import requests
import sqlite3
import json
from typing import Union, Dict, Any

class UniversalDataLoader:
    def __init__(self):
        self.supported_formats = ['csv', 'json', 'api', 'sql', 'excel']
        
    def process(self, source: str, format: str) -> Dict[str, Any]:
        if format not in self.supported_formats:
            raise ValueError(f"Unsupported format: {format}")
            
        data = None
        metadata = {
            'source': source,
            'format': format,
            'rows': 0,
            'columns': 0,
            'memory_usage': 0
        }
        
        try:
            if format == 'csv':
                data = pd.read_csv(source)
            elif format == 'json':
                if source.startswith('http'):
                    response = requests.get(source)
                    data = pd.json_normalize(response.json())
                else:
                    data = pd.read_json(source)
            elif format == 'api':
                response = requests.get(source)
                data = pd.json_normalize(response.json())
            elif format == 'sql':
                # Expects source like "sqlite:///path/to/db.sqlite|||SELECT * FROM table"
                parts = source.split('|||')
                connection = sqlite3.connect(parts[0].replace('sqlite:///', ''))
                data = pd.read_sql_query(parts[1], connection)
                connection.close()
            elif format == 'excel':
                data = pd.read_excel(source)
                
            # Update metadata
            if data is not None:
                metadata.update({
                    'rows': len(data),
                    'columns': len(data.columns),
                    'column_names': data.columns.tolist(),
                    'dtypes': data.dtypes.to_dict(),
                    'memory_usage': data.memory_usage(deep=True).sum()
                })
                
        except Exception as e:
            raise Exception(f"Failed to load data: {str(e)}")
            
        return {
            'data': data,
            'metadata': metadata
        }
`,
    tags: ['data', 'input', 'loader', 'preprocessing'],
    performance: {
      avgExecutionTime: 300,
      memoryUsage: 'medium' as const
    },
    errorHandling: {
      retryable: true,
      timeout: 120000
    },
    config: {
      chunk_size: {
        type: 'number',
        label: 'Chunk Size (for large files)',
        default: 10000,
        min: 1000,
        max: 100000
      }
    },
    metadata: {
      author: 'µLM Team',
      documentation: 'Universal data loading with automatic format detection and preprocessing',
      dependencies: ['pandas', 'requests', 'openpyxl'],
      isGenerated: false,
      tags: ['data', 'preprocessing', 'universal'],
      category: 'input'
    }
  }
];

// Simulation Status Interface
interface SimulationStatus {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  activeNodes: string[];
  performanceMetrics: {
    throughput: number;
    latency: number;
    memoryUsage: number;
    errorRate: number;
    gridMetrics?: {
      totalNodes: number;
      activeNodes: number;
      processingLoad: number;
      gridEfficiency: number;
    };
  };
  logs: Array<{
    timestamp: number;
    nodeId: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }>;
}

interface WorkspaceProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

// Main Enhanced Workspace Component
const EnhancedMoEWorkspace: React.FC<WorkspaceProps> = ({ isDark, onThemeToggle }) => {
  console.log('🚀 EnhancedMoEWorkspace component initializing...');
  
  const location = useLocation();
  console.log('📍 Location state:', location.state);
  
  // Core React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  console.log('✅ React Flow state initialized');

  // UI State
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showSimulationPanel, setShowSimulationPanel] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [backgroundVariant, setBackgroundVariant] = useState<'dots' | 'lines' | 'cross'>('dots');
  
  console.log('✅ UI state initialized');
  
  // Workspace State
  const [workspacePrompt, setWorkspacePrompt] = useState('');
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  
  // Storage and Services - Dynamic Grid Storage as main USP
  const [gridStorage] = useState(() => new GridStorage('enhanced-workspace'));
  const [aiService] = useState(() => AIBlockGenerationService.getInstance());
  const [autoBuilder] = useState(() => autoBuildAI);
  const [simulationEngine] = useState(() => new WorkflowSimulationEngine());
  const [distributedGridService] = useState(() => DistributedGridProcessingService.getInstance(gridStorage));
  
  console.log('✅ Services and Dynamic GridStorage initialized');
  
  // Simulation State
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>({
    isRunning: false,
    currentStep: 0,
    totalSteps: 0,
    activeNodes: [],
    performanceMetrics: {
      throughput: 0,
      latency: 0,
      memoryUsage: 0,
      errorRate: 0
    },
    logs: []
  });

  // Expert Library with AI-generated blocks
  const [expertLibrary, setExpertLibrary] = useState<BlockDefinition[]>(PRE_BUILT_EXPERTS);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);

  // Debug: Log expert library changes
  useEffect(() => {
    console.log('Expert library updated:', expertLibrary.length, 'blocks');
    expertLibrary.forEach((block, i) => {
      console.log(`  ${i + 1}. ${block.name} (${block.category})`);
    });
  }, [expertLibrary]);

  // OpenAI Integration States
  const [aiGenerationProgress, setAiGenerationProgress] = useState<string>('');
  const [workflowAnalysis, setWorkflowAnalysis] = useState<any>(null);
  const [suggestedBlocks, setSuggestedBlocks] = useState<any[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{role: string, content: string, timestamp: Date}>>([]);
  const [isAnalyzingWorkflow, setIsAnalyzingWorkflow] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Initialize workspace
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        await gridStorage.initialize();
        console.log('✅ Enhanced workspace initialized');
        
        // Handle pre-generated workflow from homepage
        const locationState = location.state as any;
        if (locationState?.preGeneratedWorkflow) {
          console.log('🚀 Loading pre-generated workflow from homepage:', locationState);
          
          const { nodes: preNodes, edges: preEdges, workflowId } = locationState.preGeneratedWorkflow;
          
          if (preNodes && preNodes.length > 0) {
            setNodes(preNodes);
            console.log('✅ Loaded pre-generated nodes:', preNodes.length);
          }
          
          if (preEdges && preEdges.length > 0) {
            setEdges(preEdges);
            console.log('✅ Loaded pre-generated edges:', preEdges.length);
          }
          
          if (locationState.prompt) {
            setWorkspacePrompt(locationState.prompt);
            console.log('✅ Set workspace prompt:', locationState.prompt);
          }
          
          if (locationState.isDemo) {
            console.log('🎯 Demo workflow loaded successfully');
            // Add demo-specific styling or behavior
            setShowAiSuggestions(true);
          }
          
          if (locationState.generationSteps) {
            console.log('📝 Generation steps:', locationState.generationSteps);
            // Display generation summary in chat
            setAiChatHistory(prev => [...prev, {
              role: 'assistant',
              content: `✅ Workflow generated successfully!\n\nSteps taken:\n${locationState.generationSteps.join('\n')}`,
              timestamp: new Date()
            }]);
          }
        } else if (locationState?.prompt) {
          // Handle manual prompt without pre-generated workflow
          console.log('📝 Manual prompt received:', locationState.prompt);
          setWorkspacePrompt(locationState.prompt);
          
          if (locationState.useAI) {
            // Show AI suggestions for manual building
            setShowAiSuggestions(true);
            setAiChatHistory(prev => [...prev, {
              role: 'user',
              content: locationState.prompt,
              timestamp: new Date()
            }, {
              role: 'assistant',
              content: 'I\'ll help you build this workflow! You can drag blocks from the palette or use the AI generator to create custom blocks.',
              timestamp: new Date()
            }]);
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize workspace:', error);
        
        // Show error in chat if from failed generation
        const locationState = location.state as any;
        if (locationState?.error) {
          setAiChatHistory(prev => [...prev, {
            role: 'assistant',
            content: `⚠️ Workflow generation encountered an issue: ${locationState.error}\n\nNo worries! You can still build your workflow manually using the AI tools.`,
            timestamp: new Date()
          }]);
        }
      }
    };

    initializeWorkspace();
  }, [gridStorage]);

  // Helper function to convert workflow data to React Flow format
  const convertToReactFlow = (prompt: string): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Analyze prompt to determine what experts to use
    const promptLower = prompt.toLowerCase();
    let selectedExperts: BlockDefinition[] = [];

    // Smart expert selection based on prompt keywords
    if (promptLower.includes('sentiment') || promptLower.includes('emotion')) {
      selectedExperts = expertLibrary.filter(e => 
        e.id === 'sentiment-analyzer' || e.id === 'bert-classifier'
      ).slice(0, 2);
    } else if (promptLower.includes('image') || promptLower.includes('vision')) {
      selectedExperts = expertLibrary.filter(e => 
        e.id === 'image-classifier' || e.id === 'clip-multimodal'
      ).slice(0, 2);
    } else if (promptLower.includes('document') || promptLower.includes('text')) {
      selectedExperts = expertLibrary.filter(e => 
        e.id === 'bert-classifier' || e.id === 'ner-extractor'
      ).slice(0, 2);
    } else if (promptLower.includes('data') || promptLower.includes('csv')) {
      selectedExperts = expertLibrary.filter(e => 
        e.id === 'data-loader' || e.id === 'sentiment-analyzer'
      ).slice(0, 2);
    } else {
      // Default workflow: take first 3 experts
      selectedExperts = expertLibrary.slice(0, 3);
    }

    // Ensure we have at least 2 experts
    if (selectedExperts.length < 2) {
      selectedExperts = expertLibrary.slice(0, 3);
    }

    // Create nodes from selected experts
    selectedExperts.forEach((expert, index) => {
      const node: Node = {
        id: `node-${index}`,
        type: 'block',
        position: { x: index * 300 + 100, y: 200 },
        data: {
          label: expert.name,
          block: expert,
          inputs: expert.inputs,
          outputs: expert.outputs,
          implementation: expert.implementation
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
      nodes.push(node);
    });

    // Create linear connections between nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      const edge: Edge = {
        id: `edge-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2 }
      };
      edges.push(edge);
    }

    return { nodes, edges };
  };

  // Helper function for auto-layout
  const autoLayoutNodes = (nodes: Node[]): Node[] => {
    const layoutNodes = [...nodes];
    const spacing = { x: 300, y: 150 };
    
    layoutNodes.forEach((node, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      
      node.position = {
        x: col * spacing.x + 100,
        y: row * spacing.y + 100
      };
    });
    
    return layoutNodes;
  };

  // Enhanced AI-Powered Workflow Generation
  const handleGenerateWorkflow = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGeneratingWorkflow(true);
    setAiGenerationProgress('🧠 Initializing OpenAI workflow generation...');

    try {
      // Step 1: OpenAI analyzes prompt and structures workflow
      setAiGenerationProgress('🤖 OpenAI is analyzing your prompt and designing the workflow architecture...');
      
      const workflowStructure = await openaiWorkflowIntelligence.generateWorkflowStructure(prompt, expertLibrary);
      
      console.log('✅ OpenAI generated workflow structure:', workflowStructure);
      
      // Step 2: Add chat history
      setAiChatHistory(prev => [...prev, {
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }, {
        role: 'assistant', 
        content: `Generated workflow: "${workflowStructure.workflow.name}" with ${workflowStructure.blocks.length} blocks`,
        timestamp: new Date()
      }]);

      // Step 3: Convert AI structure to React Flow nodes
      setAiGenerationProgress('🔗 Converting AI design to visual workflow...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const generatedNodes: Node[] = workflowStructure.blocks.map((block, index) => ({
        id: block.id,
        type: 'blockNode',
        position: block.position,
        data: {
          label: block.name,
          block: {
            id: block.id,
            name: block.name,
            description: block.purpose,
            category: block.type as any,
            version: '1.0.0',
            inputs: block.inputs,
            outputs: block.outputs,
            tags: ['ai-generated'],
            performance: {
              avgExecutionTime: 100,
              memoryUsage: 'medium' as const
            },
            errorHandling: {
              retryable: true,
              timeout: 30000
            },
            config: block.configuration,
            metadata: {
              author: 'OpenAI Assistant',
              documentation: block.purpose,
              dependencies: block.dependencies,
              isGenerated: true,
              tags: ['ai-generated'],
              category: block.type
            }
          }
        },
        draggable: true
      }));

      const generatedEdges: Edge[] = workflowStructure.connections.map((conn, index) => ({
        id: `edge-${index}`,
        source: conn.from,
        target: conn.to,
        sourceHandle: conn.fromPort,
        targetHandle: conn.toPort,
        type: 'smoothstep',
        data: {
          dataType: conn.dataType,
          reasoning: conn.reasoning
        },
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      }));

      // Step 4: Apply intelligent layout if needed
      setAiGenerationProgress('� Optimizing layout for best visual flow...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const positionedNodes = autoLayoutNodes(generatedNodes);
      
      // Step 5: Apply to canvas
      setAiGenerationProgress('✨ Applying AI-generated workflow to canvas...');
      setNodes(positionedNodes);
      setEdges(generatedEdges);
      
      // Step 6: Store workflow data
      try {
        // Store workflow in local storage for now
        const workflowData = {
          id: `ai-workflow-${Date.now()}`,
          name: workflowStructure.workflow.name,
          description: workflowStructure.workflow.description,
          prompt: prompt,
          nodes: positionedNodes,
          edges: generatedEdges,
          aiGenerated: true,
          aiStructure: workflowStructure,
          createdAt: new Date()
        };
        localStorage.setItem(`workflow-${workflowData.id}`, JSON.stringify(workflowData));
        console.log('✅ AI workflow stored successfully');
      } catch (storageError) {
        console.warn('⚠️ Storage not available:', storageError);
      }

      // Step 7: Analyze the generated workflow
      setAiGenerationProgress('🔍 Running AI analysis on generated workflow...');
      const analysis = await openaiWorkflowIntelligence.analyzeWorkflow(positionedNodes, generatedEdges);
      setWorkflowAnalysis(analysis);

      setAiGenerationProgress('🎉 AI workflow generation completed successfully!');
      
      // Auto-start simulation after a delay
      setTimeout(() => {
        if (positionedNodes.length > 0) {
          handleStartSimulation();
        }
      }, 1500);

      // Generate suggestions for next steps
      setTimeout(async () => {
        try {
          const suggestions = await openaiWorkflowIntelligence.suggestNextBlocks(
            { nodes: positionedNodes, edges: generatedEdges },
            `Continue optimizing the workflow for: ${prompt}`
          );
          setSuggestedBlocks(suggestions.suggestions);
          setShowAiSuggestions(true);
        } catch (error) {
          console.warn('Could not generate suggestions:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('❌ AI workflow generation failed:', error);
      setAiGenerationProgress(`❌ AI generation failed: ${error.message}. Please check your OpenAI configuration.`);
      
      // Fallback to original generation method
      try {
        setAiGenerationProgress('🔄 Falling back to built-in generation...');
        const { nodes: fallbackNodes, edges: fallbackEdges } = convertToReactFlow(prompt);
        const positionedNodes = autoLayoutNodes(fallbackNodes);
        setNodes(positionedNodes);
        setEdges(fallbackEdges);
        setAiGenerationProgress('✅ Fallback generation completed');
      } catch (fallbackError) {
        setAiGenerationProgress('❌ All generation methods failed. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setIsGeneratingWorkflow(false);
        setAiGenerationProgress('');
      }, 3000);
    }
  }, [expertLibrary, setNodes, setEdges, gridStorage]);

  // Simulation Controls
  const handleStartSimulation = useCallback(async () => {
    if (nodes.length === 0) {
      console.warn('No nodes to simulate');
      return;
    }

    console.log('🚀 Starting distributed grid simulation with', nodes.length, 'nodes');
    setSimulationStatus(prev => ({ 
      ...prev, 
      isRunning: true, 
      currentStep: 0,
      totalSteps: nodes.length,
      activeNodes: [nodes[0]?.id || '']
    }));
    setShowSimulationPanel(true);

    try {
      // Step 1: Deploy workflow to distributed grid
      console.log('📊 Deploying workflow to distributed grid...');
      const wireframes = await distributedGridService.deployWorkflowToGrid(
        nodes, 
        edges, 
        `workflow-${Date.now()}`
      );
      
      console.log('✅ Grid wireframes created:', wireframes.length);
      
      // Step 2: Start grid monitoring
      await distributedGridService.startGridMonitoring(`workflow-${Date.now()}`);
      
      // Step 3: Simulate processing through distributed grid
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Update active node
        setSimulationStatus(prev => ({
          ...prev,
          currentStep: i + 1,
          activeNodes: [node.id],
          logs: [
            ...prev.logs,
            {
              timestamp: Date.now(),
              nodeId: node.id,
              message: `Processing ${node.data?.label || node.id} through grid...`,
              type: 'info' as const
            }
          ]
        }));

        // Simulate distributed processing
        if (i === 0) {
          // Start processing with initial data
          const sampleData = { input: "Sample workflow data", timestamp: new Date() };
          try {
            const responses = await distributedGridService.processDataThroughGrid(
              sampleData,
              node.id,
              `workflow-${Date.now()}`
            );
            
            console.log('📊 Grid processing responses:', responses);
            
            // Log grid processing results
            setSimulationStatus(prev => ({
              ...prev,
              logs: [
                ...prev.logs,
                {
                  timestamp: Date.now(),
                  nodeId: node.id,
                  message: `Grid processed: ${responses.length} responses received`,
                  type: 'success' as const
                }
              ]
            }));
          } catch (error) {
            console.warn('⚠️ Grid processing fallback:', error);
            setSimulationStatus(prev => ({
              ...prev,
              logs: [
                ...prev.logs,
                {
                  timestamp: Date.now(),
                  nodeId: node.id,
                  message: `Using fallback processing for ${node.data?.label}`,
                  type: 'warning' as const
                }
              ]
            }));
          }
        }

        // Simulate processing time with grid optimizations
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Faster with distributed processing
      }

      // Get final grid status
      const gridStatus = distributedGridService.getGridStatus();
      
      // Simulation complete - generate final metrics including grid stats
      const finalMetrics = {
        throughput: Math.random() * 100 + 100, // Higher throughput with distributed processing
        latency: Math.random() * 150 + 50, // Lower latency with grid
        memoryUsage: Math.random() * 256 + 128, // Distributed memory usage
        errorRate: Math.random() * 0.05, // Lower error rate with redundancy
        gridMetrics: {
          totalNodes: gridStatus.totalNodes,
          activeNodes: gridStatus.activeNodes,
          processingLoad: gridStatus.processingLoad,
          gridEfficiency: gridStatus.gridAllocation.efficiency
        }
      };

      setSimulationStatus(prev => ({
        ...prev,
        isRunning: false,
        activeNodes: [],
        performanceMetrics: finalMetrics,
        logs: [
          ...prev.logs,
          {
            timestamp: Date.now(),
            nodeId: 'grid-system',
            message: '✅ Simulation completed successfully',
            type: 'info' as const
          }
        ]
      }));

      console.log('✅ Simulation completed with metrics:', finalMetrics);

    } catch (error) {
      console.error('❌ Simulation failed:', error);
      setSimulationStatus(prev => ({ 
        ...prev, 
        isRunning: false,
        activeNodes: [],
        logs: [
          ...prev.logs,
          {
            timestamp: Date.now(),
            nodeId: 'system',
            message: `❌ Simulation failed: ${error}`,
            type: 'error' as const
          }
        ]
      }));
    }
  }, [nodes]);

  const handleStopSimulation = useCallback(() => {
    setSimulationStatus(prev => ({ 
      ...prev, 
      isRunning: false, 
      activeNodes: [],
      currentStep: 0 
    }));
  }, []);

  // Canvas drop handlers for drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOverCanvas(true);
    console.log('🔄 Drag over canvas');
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOverCanvas(false);
    console.log('👋 Drag left canvas');
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOverCanvas(false);
    console.log('📍 Drop event triggered on canvas');
    
    try {
      const blockData = event.dataTransfer.getData('application/json');
      console.log('📦 Block data:', blockData);
      
      if (!blockData) {
        console.warn('⚠️ No block data found in drag event');
        return;
      }
      
      const block: BlockDefinition = JSON.parse(blockData);
      console.log('🎯 Parsed block:', block.name);
      
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };
      console.log('📍 Drop position:', position);

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'blockNode', // Use consistent node type
        position,
        data: {
          label: block.name,
          block: block,
          inputs: block.inputs,
          outputs: block.outputs,
          implementation: block.implementation
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      setNodes(prev => {
        const newNodes = [...prev, newNode];
        console.log('✅ Added block to canvas:', block.name, 'Total nodes:', newNodes.length);
        return newNodes;
      });
    } catch (error) {
      console.error('❌ Failed to add block:', error);
    }
  }, [setNodes]);

  // Node Operations with Real-time Configuration Matching
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('🔗 Connecting blocks:', params);
      
      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const sourceBlock = sourceNode.data?.block;
        const targetBlock = targetNode.data?.block;
        
        if (sourceBlock && targetBlock) {
          // Real-time configuration matching
          const sourceOutput = sourceBlock.outputs?.find(o => o.id === params.sourceHandle);
          const targetInput = targetBlock.inputs?.find(i => i.id === params.targetHandle);
          
          if (sourceOutput && targetInput) {
            console.log('🔄 Auto-configuring connection:', {
              source: `${sourceBlock.name}.${sourceOutput.name}`,
              target: `${targetBlock.name}.${targetInput.name}`,
              dataType: sourceOutput.type
            });
            
            // Update target node configuration based on source output
            setNodes(prevNodes => 
              prevNodes.map(node => {
                if (node.id === params.target) {
                  const updatedBlock = { ...targetBlock };
                  
                  // Auto-configure input based on connection
                  if (updatedBlock.config) {
                    // Match data types and configure accordingly
                    if (sourceOutput.type === 'text' && targetInput.type === 'text') {
                      updatedBlock.config.inputFormat = { value: 'text', autoConfigured: true };
                    } else if (sourceOutput.type === 'array' && targetInput.type === 'array') {
                      updatedBlock.config.inputFormat = { value: 'array', autoConfigured: true };
                    } else if (sourceOutput.type === 'dataframe' && targetInput.type === 'dataframe') {
                      updatedBlock.config.inputFormat = { value: 'dataframe', autoConfigured: true };
                    }
                    
                    // Set expected input shape/format
                    updatedBlock.config.expectedInputType = {
                      value: sourceOutput.type,
                      source: sourceBlock.name,
                      autoConfigured: true
                    };
                  }
                  
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      block: updatedBlock,
                      connectedFrom: sourceBlock.name,
                      lastConfigured: new Date()
                    }
                  };
                }
                return node;
              })
            );
            
            // Add connection metadata to edge
            const enhancedParams = {
              ...params,
              data: {
                sourceOutput,
                targetInput,
                dataType: sourceOutput.type,
                compatible: sourceOutput.type === targetInput.type,
                configuredAt: new Date()
              },
              style: {
                stroke: sourceOutput.type === targetInput.type ? '#10b981' : '#f59e0b',
                strokeWidth: 2
              }
            };
            
            setEdges((eds) => addEdge(enhancedParams, eds));
            
            console.log('✅ Real-time configuration applied');
          } else {
            console.warn('⚠️ Could not find matching inputs/outputs for configuration');
            setEdges((eds) => addEdge(params, eds));
          }
        } else {
          setEdges((eds) => addEdge(params, eds));
        }
      } else {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowConfigPanel(true);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowCodeEditor(true);
  }, []);

  // Add AI-generated expert to palette
  const handleExpertGenerated = useCallback((expert: BlockDefinition) => {
    setExpertLibrary(prev => [...prev, expert]);
  }, []);

  // AI-Powered Custom Block Generation
  const handleGenerateCustomBlock = useCallback(async (blockPrompt: string) => {
    if (!blockPrompt.trim()) return;

    setIsLoadingExperts(true);
    setAiGenerationProgress('🤖 OpenAI is designing your custom block...');

    try {
      const blockRequest = {
        prompt: blockPrompt,
        context: {
          existingBlocks: expertLibrary,
          workflowPurpose: workspacePrompt || 'Custom workflow',
          expectedInputs: nodes.filter(n => n.data?.block?.category === 'input').map(n => n.data.label),
          expectedOutputs: nodes.filter(n => n.data?.block?.category === 'output').map(n => n.data.label),
          performanceRequirements: ['efficient', 'reliable', 'scalable']
        }
      };

      const generatedBlock = await openaiWorkflowIntelligence.generateCustomBlock(blockRequest);
      
      // Add to expert library
      setExpertLibrary(prev => [...prev, generatedBlock.block]);
      
      // Add to chat history
      setAiChatHistory(prev => [...prev, {
        role: 'user',
        content: `Generate custom block: ${blockPrompt}`,
        timestamp: new Date()
      }, {
        role: 'assistant',
        content: `Created custom block: "${generatedBlock.block.name}" with complete Python implementation`,
        timestamp: new Date()
      }]);

      console.log('✅ AI generated custom block:', generatedBlock.block.name);
      setAiGenerationProgress('✅ Custom block created and added to library!');

    } catch (error) {
      console.error('❌ Custom block generation failed:', error);
      setAiGenerationProgress(`❌ Block generation failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsLoadingExperts(false);
        setAiGenerationProgress('');
      }, 2000);
    }
  }, [expertLibrary, workspacePrompt, nodes]);

  // AI Workflow Analysis
  const handleAnalyzeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      console.warn('No workflow to analyze');
      return;
    }

    setIsAnalyzingWorkflow(true);
    setAiGenerationProgress('🔍 OpenAI is analyzing your workflow...');

    try {
      const analysis = await openaiWorkflowIntelligence.analyzeWorkflow(nodes, edges);
      setWorkflowAnalysis(analysis);

      // Add to chat history
      setAiChatHistory(prev => [...prev, {
        role: 'user',
        content: 'Analyze current workflow',
        timestamp: new Date()
      }, {
        role: 'assistant',
        content: `Workflow Analysis Complete:\n${analysis.analysis}\n\nCode Quality Score: ${analysis.codeQuality}/100`,
        timestamp: new Date()
      }]);

      console.log('✅ Workflow analysis completed:', analysis);
      setAiGenerationProgress('✅ Workflow analysis completed!');

    } catch (error) {
      console.error('❌ Workflow analysis failed:', error);
      setAiGenerationProgress(`❌ Analysis failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsAnalyzingWorkflow(false);
        setAiGenerationProgress('');
      }, 2000);
    }
  }, [nodes, edges]);

  // Export Workflow
  const handleExportWorkflow = useCallback(async (format: string) => {
    try {
      const exportService = new UniversalExportService();
      const workflow = {
        nodes,
        edges,
        metadata: {
          name: workspacePrompt || 'Untitled Workflow',
          created: new Date(),
          version: '1.0.0'
        }
      };

      const exportOptions = {
        format: format as any,
        name: workspacePrompt || 'Untitled Workflow',
        description: `AI workflow generated from: ${workspacePrompt}`,
        version: '1.0.0',
        author: 'µLM User',
        license: 'MIT',
        includeTests: true,
        includeDocs: true,
        optimizationLevel: 'production' as const,
        targetEnvironment: 'cloud' as const,
        deploymentConfig: {}
      };
      
      const result = await exportService.exportWorkflow(nodes, edges, exportOptions);
      
      // @ts-ignore - Handle different result structures
      const code = result.code || result.content || result.data || '# Generated workflow code';
      // @ts-ignore - Handle different result structures  
      const filename = result.filename || result.name || `workflow.${format}`;
      
      // Download the exported file
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }, [nodes, edges, workspacePrompt]);

  // Node types for React Flow
  const nodeTypes = useMemo(() => ({
    block: BlockNode,
    blockNode: BlockNode, // Support both block and blockNode types
  }), []);

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-900">
      <ReactFlowProvider>
        {/* Left Sidebar - Block Palette */}
        <div className={`w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ${smoothTransition}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">{Icons.Grid}</span>
              Expert Library
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag blocks to canvas or use AI generation
            </p>
          </div>

          {/* AI Prompt Builder */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>{Icons.Magic}</span>
                AI Workflow Builder
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  OpenAI Powered
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={workspacePrompt}
                  onChange={(e) => setWorkspacePrompt(e.target.value)}
                  placeholder="E.g., 'Analyze customer reviews for sentiment and extract key insights'"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isGeneratingWorkflow}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && workspacePrompt.trim() && !isGeneratingWorkflow) {
                      handleGenerateWorkflow(workspacePrompt);
                    }
                  }}
                />
                <button
                  onClick={() => handleGenerateWorkflow(workspacePrompt)}
                  disabled={isGeneratingWorkflow || !workspacePrompt.trim()}
                  className={`px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition}`}
                  title="Generate AI workflow"
                >
                  {isGeneratingWorkflow ? Icons.Lightning : Icons.Build}
                </button>
              </div>
              
              {/* AI Features Help */}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                <div className="font-medium mb-1">🤖 AI Features:</div>
                <ul className="space-y-1 list-disc ml-4">
                  <li>OpenAI analyzes prompts and generates complete workflows</li>
                  <li>Automatically selects and configures appropriate AI blocks</li>
                  <li>Generates production-ready Python code for each component</li>
                  <li>Provides intelligent optimization suggestions</li>
                </ul>
              </div>
              
              {/* Quick Demo Prompts */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Quick AI workflows:</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    'Analyze text sentiment and classify topics',
                    'Process images with AI vision models', 
                    'Extract entities from documents using NLP',
                    'Build a multimodal content classifier'
                  ].map((demo) => (
                    <button
                      key={demo}
                      onClick={() => {
                        setWorkspacePrompt(demo);
                        handleGenerateWorkflow(demo);
                      }}
                      disabled={isGeneratingWorkflow}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      {demo}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* AI-Powered Controls */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  🤖 OpenAI Assistant
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAnalyzeWorkflow}
                    disabled={isAnalyzingWorkflow || nodes.length === 0}
                    className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isAnalyzingWorkflow ? '🔍' : '📊'} Analyze
                  </button>
                  <button
                    onClick={() => {
                      const blockPrompt = prompt('Describe the custom block you need:');
                      if (blockPrompt) handleGenerateCustomBlock(blockPrompt);
                    }}
                    disabled={isLoadingExperts}
                    className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isLoadingExperts ? '⚡' : '🔧'} Custom Block
                  </button>
                </div>
              </div>
              
              {(generationProgress || aiGenerationProgress) && (
                <div className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                  {aiGenerationProgress || generationProgress}
                </div>
              )}
            </div>
          </div>

          {/* Block Palette */}
          <div className="flex-1 overflow-y-auto">
            {/* Debug Info */}
            <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 border-b">
              Expert Library: {expertLibrary.length} blocks loaded
              {expertLibrary.length === 0 && (
                <div className="mt-1 text-yellow-600">
                  ⚠️ No blocks in expert library. Using default blocks.
                </div>
              )}
            </div>
            
            <BlockPalette 
              blocks={expertLibrary.length > 0 ? expertLibrary : undefined}
              onBlockSelect={(block) => {
                console.log('Block selected:', block.name);
                // Add block to canvas
                const newNode: Node = {
                  id: `node-${Date.now()}`,
                  type: 'blockNode',
                  position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
                  data: {
                    label: block.name,
                    block: block,
                    inputs: block.inputs,
                    outputs: block.outputs,
                    implementation: block.implementation
                  },
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                };
                setNodes(prev => [...prev, newNode]);
              }}
              onBlockDrag={(block, event) => {
                console.log('🎯 Block drag started:', block.name);
                // Handle drag start
                event.dataTransfer.setData('application/json', JSON.stringify(block));
                event.dataTransfer.effectAllowed = 'move';
                console.log('📦 Block data set for drag:', block.id);
              }}
            />
          </div>

          {/* AI Generator Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAIGenerator(true)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium ${smoothTransition} ${neonGlow}`}
            >
              <span>{Icons.Sparkles}</span>
              Generate Custom Expert
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          {/* Top Toolbar */}
          <div className={`absolute top-0 left-0 right-0 z-10 p-4 ${glassEffect} bg-white dark:bg-gray-800`}>
            <div className="flex items-center justify-between">
              {/* Enhanced prompt state display */}
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">{Icons.Workflow}</span>
                  µLM Workspace
                </h1>
                {workspacePrompt && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    "{workspacePrompt.substring(0, 40)}..."
                  </div>
                )}
                {isGeneratingWorkflow && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <span className="animate-spin">{Icons.Lightning}</span>
                    <span>Building workflow...</span>
                  </div>
                )}
                {nodes.length > 0 && !isGeneratingWorkflow && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                    {nodes.length} blocks • {edges.length} connections
                  </div>
                )}
              </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Clear Canvas */}
                  {nodes.length > 0 && (
                    <button
                      onClick={() => {
                        setNodes([]);
                        setEdges([]);
                        setWorkspacePrompt('');
                        console.log('🧹 Canvas cleared');
                      }}
                      className={`px-3 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${smoothTransition} flex items-center gap-1`}
                      title="Clear Canvas"
                    >
                      <span>🧹</span>
                      <span className="text-sm">Clear</span>
                    </button>
                  )}

                  {/* Simulation Controls */}
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={handleStartSimulation}
                    disabled={simulationStatus.isRunning || nodes.length === 0}
                    className={`px-3 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition}`}
                    title="Start Simulation"
                  >
                    {Icons.Play}
                  </button>
                  <button
                    onClick={handleStopSimulation}
                    disabled={!simulationStatus.isRunning}
                    className={`px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition}`}
                    title="Stop Simulation"
                  >
                    {Icons.Stop}
                  </button>
                  <button
                    onClick={() => setShowSimulationPanel(!showSimulationPanel)}
                    className={`px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-r-lg ${smoothTransition}`}
                    title="Simulation Dashboard"
                  >
                    {Icons.Chart}
                  </button>
                </div>

                {/* Export Button */}
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={nodes.length === 0}
                  className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${smoothTransition} flex items-center gap-2`}
                >
                  <span>{Icons.Export}</span>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* React Flow Canvas */}
          <div 
            className={`h-full pt-20 transition-all duration-200 ${isDragOverCanvas ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600' : ''}`} 
            onDragOver={onDragOver} 
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className="bg-gray-50 dark:bg-gray-900"
            >
              <Background 
                variant={
                  backgroundVariant === 'dots' ? BackgroundVariant.Dots :
                  backgroundVariant === 'lines' ? BackgroundVariant.Lines :
                  BackgroundVariant.Cross
                } 
                gap={backgroundVariant === 'dots' ? 24 : 20} 
                size={backgroundVariant === 'dots' ? 3 : 2} 
                color={isDark ? '#4B5563' : '#D1D5DB'}
                className="opacity-60"
              />
              <Controls position="bottom-right" />
              <MiniMap 
                position="bottom-left"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              />

              {/* Theme Toggle and Workspace Controls */}
              <Panel position="top-right">
                <div className="flex items-center gap-2">
                  {/* Theme Toggle Button */}
                  <button
                    onClick={onThemeToggle}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 
                      ${isDark 
                        ? 'bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>

                  {/* Background Pattern Toggle */}
                  <button
                    onClick={() => {
                      const variants = ['dots', 'lines', 'cross'] as const;
                      const currentIndex = variants.indexOf(backgroundVariant);
                      const nextIndex = (currentIndex + 1) % variants.length;
                      setBackgroundVariant(variants[nextIndex]);
                    }}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 
                      ${isDark 
                        ? 'bg-gray-800 border-gray-600 text-blue-400 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    title={`Current pattern: ${backgroundVariant}. Click to change`}
                  >
                    {backgroundVariant === 'dots' ? '⚬' : backgroundVariant === 'lines' ? '═' : '⊞'}
                  </button>
                  
                  {/* Export Button */}
                  <button
                    onClick={() => setShowExportModal(true)}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 
                      ${isDark 
                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    title="Export workflow"
                  >
                    {Icons.Export}
                  </button>
                  
                  {/* Config Panel Toggle */}
                  <button
                    onClick={() => setShowConfigPanel(!showConfigPanel)}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 
                      ${showConfigPanel 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : isDark 
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    title="Toggle settings"
                  >
                    {Icons.Settings}
                  </button>
                </div>
              </Panel>

              {/* Simulation Overlay */}
              {simulationStatus.isRunning && (
                <Panel position="top-center">
                  <div className={`px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg animate-pulse ${smoothTransition}`}>
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">{Icons.Lightning}</span>
                      <span>Simulating workflow... Step {simulationStatus.currentStep}</span>
                    </div>
                  </div>
                </Panel>
              )}

              {/* Empty State */}
              {nodes.length === 0 && !isGeneratingWorkflow && (
                <Panel position="top-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-4 text-center border border-gray-200 dark:border-gray-700 mt-20">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      AI-Powered Workflow Builder
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Describe what you want to build in natural language. OpenAI will design the complete workflow, select optimal AI models, and generate production-ready code.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 justify-center">
                        <span>✨</span>
                        <span>Intelligent architecture design</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <span>🔧</span>
                        <span>Auto-generated Python code</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <span>📊</span>
                        <span>Performance optimization</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <span>🎯</span>
                        <span>Drag blocks from left panel</span>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </div>

        {/* Right Sidebar - Simulation Panel */}
        {showSimulationPanel && (
          <div className={`w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col ${smoothTransition}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{Icons.Chart}</span>
                  Simulation Dashboard
                </h3>
                <button
                  onClick={() => setShowSimulationPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Analysis Panel */}
              {workflowAnalysis && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    🤖 AI Analysis
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Score: {workflowAnalysis.codeQuality}/100
                    </span>
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {workflowAnalysis.analysis}
                    </div>
                    {workflowAnalysis.optimizations.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Optimizations:</div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4 space-y-1">
                          {workflowAnalysis.optimizations.slice(0, 3).map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {showAiSuggestions && suggestedBlocks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    💡 AI Suggestions
                    <button
                      onClick={() => setShowAiSuggestions(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </h4>
                  <div className="space-y-2">
                    {suggestedBlocks.slice(0, 3).map((suggestion, i) => (
                      <div key={i} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {suggestion.name}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {suggestion.reasoning}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Priority: {suggestion.priority}/10
                          </span>
                          <button
                            onClick={() => {
                              const blockPrompt = `Create a ${suggestion.name} block: ${suggestion.reasoning}`;
                              handleGenerateCustomBlock(blockPrompt);
                            }}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Chat History */}
              {aiChatHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    💬 AI Assistant
                    <button
                      onClick={() => setAiChatHistory([])}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiChatHistory.slice(-4).map((msg, i) => (
                      <div key={i} className={`p-2 rounded-lg text-xs ${
                        msg.role === 'user' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}>
                        <div className="font-medium">{msg.role === 'user' ? '👤 You' : '🤖 AI'}</div>
                        <div className="mt-1">{msg.content}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Throughput</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {simulationStatus.performanceMetrics.throughput.toFixed(1)}/s
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Latency</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {simulationStatus.performanceMetrics.latency.toFixed(0)}ms
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Memory</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {simulationStatus.performanceMetrics.memoryUsage.toFixed(1)}MB
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Error Rate</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(simulationStatus.performanceMetrics.errorRate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Grid Storage Metrics */}
              {simulationStatus.performanceMetrics.gridMetrics && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {Icons.Grid} Dynamic Grid Storage
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Grid Nodes</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {simulationStatus.performanceMetrics.gridMetrics.activeNodes}/{simulationStatus.performanceMetrics.gridMetrics.totalNodes}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg border">
                      <div className="text-xs text-green-600 dark:text-green-400">Grid Efficiency</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(simulationStatus.performanceMetrics.gridMetrics.gridEfficiency * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border">
                      <div className="text-xs text-purple-600 dark:text-purple-400">Processing Load</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {simulationStatus.performanceMetrics.gridMetrics.processingLoad.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border">
                      <div className="text-xs text-orange-600 dark:text-orange-400">Distributed</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Icons.Cloud} Server-Side
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    💡 Models stay on server - only processed data flows through application
                  </div>
                </div>
              )}

              {/* Active Nodes */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Active Nodes</h4>
                <div className="space-y-2">
                  {simulationStatus.activeNodes.length > 0 ? (
                    simulationStatus.activeNodes.map(nodeId => (
                      <div key={nodeId} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-gray-900 dark:text-white">{nodeId}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No active nodes</div>
                  )}
                </div>
              </div>

              {/* Simulation Logs */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Execution Logs</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {simulationStatus.logs.length > 0 ? (
                    simulationStatus.logs.map((log, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <span className={`w-1 h-1 rounded-full ${
                            log.type === 'error' ? 'bg-red-500' :
                            log.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">{log.nodeId}</span>
                        </div>
                        <div className="text-gray-900 dark:text-white mt-1">{log.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No logs available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Block Generator Modal */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <AIBlockGenerator
                onBlockGenerated={handleExpertGenerated}
                existingBlocks={expertLibrary}
              />
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{Icons.Export}</span>
                    Export Workflow
                  </h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

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

                  <button
                    onClick={() => handleExportWorkflow('huggingface')}
                    className={`w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                  >
                    <span className="text-yellow-600">{Icons.Cloud}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">HuggingFace Hub</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Model repository with API</div>
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
          </div>
        )}

        {/* Code Editor Modal */}
        {showCodeEditor && selectedNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{Icons.Code}</span>
                    Edit Block: {selectedNode.data?.label || selectedNode.id}
                  </h3>
                  <button
                    onClick={() => setShowCodeEditor(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 h-96 overflow-y-auto">
                <textarea
                  className="w-full h-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  defaultValue={selectedNode.data?.implementation || '# Block implementation code here\npass'}
                  placeholder="Enter block implementation code..."
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className={`flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${smoothTransition}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save implementation logic here
                    setShowCodeEditor(false);
                  }}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${smoothTransition}`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default EnhancedMoEWorkspace;
