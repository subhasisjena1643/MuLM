/**
 * Demo Workflows for µLM AI Playground
 * Pre-built workflows for demonstration and testing purposes
 */

import { Node, Edge } from 'reactflow';

export interface DemoWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'ml' | 'nlp' | 'data' | 'vision' | 'audio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  nodes: Node[];
  edges: Edge[];
  tags: string[];
  prompt: string;
  expectedOutput: string;
}

export const demoWorkflows: DemoWorkflow[] = [
  {
    id: 'sentiment-analysis-pipeline',
    name: 'Sentiment Analysis Pipeline',
    description: 'A complete pipeline for analyzing sentiment in text data with preprocessing, classification, and evaluation.',
    category: 'nlp',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    prompt: 'Build a sentiment analysis pipeline that processes text, classifies sentiment, and provides confidence scores',
    expectedOutput: 'Text classification with positive/negative/neutral sentiment and confidence percentages',
    tags: ['nlp', 'classification', 'preprocessing', 'evaluation'],
    nodes: [
      {
        id: 'input-1',
        type: 'aiBlock',
        position: { x: 100, y: 200 },
        data: {
          label: 'Text Input',
          category: 'input',
          type: 'input',
          description: 'Accepts text data for sentiment analysis',
          config: {
            inputType: 'text',
            placeholder: 'Enter text to analyze...',
            required: true,
            maxLength: 1000
          },
          isResizable: true,
          sourceCode: `
def process_input(text_input):
    """Process raw text input for sentiment analysis"""
    if not text_input or len(text_input.strip()) == 0:
        raise ValueError("Input text cannot be empty")
    
    return {
        'text': text_input.strip(),
        'length': len(text_input),
        'word_count': len(text_input.split())
    }
          `
        }
      },
      {
        id: 'preprocessing-1',
        type: 'aiBlock',
        position: { x: 400, y: 200 },
        data: {
          label: 'Text Preprocessing',
          category: 'nlp',
          type: 'preprocessing',
          description: 'Cleans and preprocesses text data for analysis',
          config: {
            lowercase: true,
            removeStopwords: true,
            removePunctuation: false,
            stemming: false
          },
          isResizable: true,
          sourceCode: `
import re
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

def preprocess_text(data):
    """Preprocess text for sentiment analysis"""
    text = data['text']
    
    # Lowercase
    text = text.lower()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words]
    
    # Join back
    processed_text = ' '.join(tokens)
    
    return {
        'original_text': data['text'],
        'processed_text': processed_text,
        'token_count': len(tokens)
    }
          `
        }
      },
      {
        id: 'classifier-1',
        type: 'aiBlock',
        position: { x: 700, y: 200 },
        data: {
          label: 'Sentiment Classifier',
          category: 'mlAlgorithm',
          type: 'classification',
          description: 'Classifies text sentiment using machine learning',
          config: {
            model: 'transformers',
            modelName: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
            confidence_threshold: 0.7
          },
          isResizable: true,
          sourceCode: `
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
import numpy as np

def classify_sentiment(data):
    """Classify sentiment using pretrained transformer model"""
    text = data['processed_text']
    
    # Load model and tokenizer
    model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    # Tokenize and predict
    encoded_text = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
    output = model(**encoded_text)
    
    # Get probabilities
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    
    # Map to labels
    labels = ['negative', 'neutral', 'positive']
    result = {
        'sentiment': labels[np.argmax(scores)],
        'confidence': float(np.max(scores)),
        'scores': {
            'negative': float(scores[0]),
            'neutral': float(scores[1]),
            'positive': float(scores[2])
        }
    }
    
    return {**data, **result}
          `
        }
      },
      {
        id: 'output-1',
        type: 'aiBlock',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Sentiment Results',
          category: 'output',
          type: 'output',
          description: 'Formats and displays sentiment analysis results',
          config: {
            format: 'json',
            includeConfidence: true,
            visualize: true
          },
          isResizable: true,
          sourceCode: `
import json

def format_results(data):
    """Format sentiment analysis results for output"""
    
    result = {
        'input_text': data['original_text'],
        'predicted_sentiment': data['sentiment'],
        'confidence': round(data['confidence'], 3),
        'detailed_scores': {
            'negative': round(data['scores']['negative'], 3),
            'neutral': round(data['scores']['neutral'], 3),
            'positive': round(data['scores']['positive'], 3)
        },
        'text_stats': {
            'original_length': len(data['original_text']),
            'processed_length': len(data['processed_text']),
            'token_count': data['token_count']
        }
    }
    
    print(f"Sentiment: {result['predicted_sentiment'].upper()}")
    print(f"Confidence: {result['confidence']:.1%}")
    print(f"Detailed Scores: {json.dumps(result['detailed_scores'], indent=2)}")
    
    return result
          `
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input-1', target: 'preprocessing-1' },
      { id: 'e2-3', source: 'preprocessing-1', target: 'classifier-1' },
      { id: 'e3-4', source: 'classifier-1', target: 'output-1' }
    ]
  },
  
  {
    id: 'document-qa-rag',
    name: 'Document Q&A with RAG',
    description: 'Retrieval-Augmented Generation system for answering questions based on document content.',
    category: 'nlp',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    prompt: 'Create a RAG system that can answer questions by retrieving relevant information from documents',
    expectedOutput: 'Accurate answers to questions with source citations and relevance scores',
    tags: ['rag', 'qa', 'retrieval', 'generation', 'embeddings'],
    nodes: [
      {
        id: 'doc-input',
        type: 'aiBlock',
        position: { x: 100, y: 150 },
        data: {
          label: 'Document Loader',
          category: 'input',
          type: 'document',
          description: 'Loads and processes documents for Q&A',
          config: {
            supportedFormats: ['pdf', 'txt', 'docx'],
            chunkSize: 1000,
            chunkOverlap: 200
          },
          sourceCode: 'from langchain.document_loaders import TextLoader\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter'
        }
      },
      {
        id: 'embeddings',
        type: 'aiBlock',
        position: { x: 400, y: 150 },
        data: {
          label: 'Text Embeddings',
          category: 'nlp',
          type: 'embeddings',
          description: 'Generates embeddings for document chunks',
          config: {
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            dimension: 384
          },
          sourceCode: 'from sentence_transformers import SentenceTransformer\nmodel = SentenceTransformer("all-MiniLM-L6-v2")'
        }
      },
      {
        id: 'vector-store',
        type: 'aiBlock',
        position: { x: 700, y: 150 },
        data: {
          label: 'Vector Database',
          category: 'utility',
          type: 'storage',
          description: 'Stores document embeddings for retrieval',
          config: {
            database: 'chroma',
            collection: 'documents',
            similarity: 'cosine'
          },
          sourceCode: 'import chromadb\nclient = chromadb.Client()\ncollection = client.create_collection("documents")'
        }
      },
      {
        id: 'question-input',
        type: 'aiBlock',
        position: { x: 100, y: 350 },
        data: {
          label: 'Question Input',
          category: 'input',
          type: 'text',
          description: 'Accepts user questions',
          config: {
            placeholder: 'Ask a question about the documents...',
            maxLength: 500
          },
          sourceCode: 'def get_question():\n    return input("Enter your question: ")'
        }
      },
      {
        id: 'retriever',
        type: 'aiBlock',
        position: { x: 700, y: 350 },
        data: {
          label: 'Document Retriever',
          category: 'ragTool',
          type: 'retrieval',
          description: 'Retrieves relevant documents for the question',
          config: {
            topK: 5,
            scoreThreshold: 0.7
          },
          sourceCode: 'def retrieve_documents(question, vector_store):\n    results = vector_store.similarity_search(question, k=5)\n    return results'
        }
      },
      {
        id: 'llm-generator',
        type: 'aiBlock',
        position: { x: 1000, y: 250 },
        data: {
          label: 'Answer Generator',
          category: 'expert',
          type: 'llm',
          description: 'Generates answers using retrieved context',
          config: {
            model: 'gpt-3.5-turbo',
            temperature: 0.1,
            maxTokens: 500
          },
          sourceCode: 'from openai import OpenAI\nclient = OpenAI()\nresponse = client.chat.completions.create(...)'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'doc-input', target: 'embeddings' },
      { id: 'e2', source: 'embeddings', target: 'vector-store' },
      { id: 'e3', source: 'question-input', target: 'retriever' },
      { id: 'e4', source: 'vector-store', target: 'retriever' },
      { id: 'e5', source: 'retriever', target: 'llm-generator' }
    ]
  },

  {
    id: 'image-classification',
    name: 'Image Classification Pipeline',
    description: 'Computer vision pipeline for classifying images using convolutional neural networks.',
    category: 'vision',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    prompt: 'Build an image classification system that can identify objects in photos',
    expectedOutput: 'Object classifications with confidence scores and bounding boxes',
    tags: ['computer-vision', 'cnn', 'classification', 'preprocessing'],
    nodes: [
      {
        id: 'img-input',
        type: 'aiBlock',
        position: { x: 100, y: 200 },
        data: {
          label: 'Image Input',
          category: 'input',
          type: 'image',
          description: 'Loads and validates image files',
          config: {
            formats: ['jpg', 'png', 'bmp'],
            maxSize: '10MB',
            minDimensions: [224, 224]
          },
          sourceCode: 'from PIL import Image\nimport numpy as np\n\ndef load_image(path):\n    return Image.open(path)'
        }
      },
      {
        id: 'img-preprocess',
        type: 'aiBlock',
        position: { x: 400, y: 200 },
        data: {
          label: 'Image Preprocessing',
          category: 'vision',
          type: 'preprocessing',
          description: 'Preprocesses images for neural network input',
          config: {
            resize: [224, 224],
            normalize: true,
            augmentation: false
          },
          sourceCode: 'import torchvision.transforms as transforms\n\ntransform = transforms.Compose([\n    transforms.Resize((224, 224)),\n    transforms.ToTensor(),\n    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\n])'
        }
      },
      {
        id: 'cnn-model',
        type: 'aiBlock',
        position: { x: 700, y: 200 },
        data: {
          label: 'CNN Classifier',
          category: 'neuralNetwork',
          type: 'cnn',
          description: 'Convolutional neural network for image classification',
          config: {
            architecture: 'ResNet50',
            pretrained: true,
            classes: 1000
          },
          sourceCode: 'import torchvision.models as models\nimport torch\n\nmodel = models.resnet50(pretrained=True)\nmodel.eval()'
        }
      },
      {
        id: 'results-output',
        type: 'aiBlock',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Classification Results',
          category: 'output',
          type: 'visualization',
          description: 'Displays classification results with confidence',
          config: {
            topK: 5,
            showConfidence: true,
            visualize: true
          },
          sourceCode: 'import matplotlib.pyplot as plt\n\ndef display_results(image, predictions):\n    plt.imshow(image)\n    plt.title(f"Top prediction: {predictions[0][\'class\']} ({predictions[0][\'confidence\']:.2%})")\n    plt.show()'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'img-input', target: 'img-preprocess' },
      { id: 'e2', source: 'img-preprocess', target: 'cnn-model' },
      { id: 'e3', source: 'cnn-model', target: 'results-output' }
    ]
  },

  {
    id: 'data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'ETL pipeline for cleaning, transforming, and analyzing tabular data.',
    category: 'data',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    prompt: 'Create a data processing pipeline that cleans CSV data and generates insights',
    expectedOutput: 'Clean dataset with statistical summaries and visualizations',
    tags: ['etl', 'data-cleaning', 'analysis', 'visualization'],
    nodes: [
      {
        id: 'csv-input',
        type: 'aiBlock',
        position: { x: 100, y: 200 },
        data: {
          label: 'CSV Data Loader',
          category: 'input',
          type: 'file',
          description: 'Loads and parses CSV files',
          config: {
            delimiter: ',',
            encoding: 'utf-8',
            headerRow: true
          },
          sourceCode: 'import pandas as pd\n\ndef load_csv(file_path):\n    return pd.read_csv(file_path)'
        }
      },
      {
        id: 'data-cleaner',
        type: 'aiBlock',
        position: { x: 400, y: 200 },
        data: {
          label: 'Data Cleaner',
          category: 'utility',
          type: 'cleaning',
          description: 'Cleans and validates data quality',
          config: {
            handleMissing: 'impute',
            removeOutliers: true,
            validateTypes: true
          },
          sourceCode: 'def clean_data(df):\n    # Handle missing values\n    df = df.dropna(thresh=len(df.columns)*0.7)\n    \n    # Remove duplicates\n    df = df.drop_duplicates()\n    \n    return df'
        }
      },
      {
        id: 'feature-engineer',
        type: 'aiBlock',
        position: { x: 700, y: 200 },
        data: {
          label: 'Feature Engineering',
          category: 'mlAlgorithm',
          type: 'transformation',
          description: 'Creates new features from existing data',
          config: {
            scaling: 'standard',
            encoding: 'one-hot',
            featureSelection: true
          },
          sourceCode: 'from sklearn.preprocessing import StandardScaler, LabelEncoder\n\ndef engineer_features(df):\n    scaler = StandardScaler()\n    numeric_columns = df.select_dtypes(include=[np.number]).columns\n    df[numeric_columns] = scaler.fit_transform(df[numeric_columns])\n    return df'
        }
      },
      {
        id: 'analytics',
        type: 'aiBlock',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Data Analytics',
          category: 'output',
          type: 'analysis',
          description: 'Generates statistical insights and visualizations',
          config: {
            statistics: true,
            correlations: true,
            distributions: true,
            charts: ['histogram', 'scatter', 'heatmap']
          },
          sourceCode: 'import matplotlib.pyplot as plt\nimport seaborn as sns\n\ndef generate_analytics(df):\n    print(df.describe())\n    \n    # Correlation heatmap\n    plt.figure(figsize=(10, 8))\n    sns.heatmap(df.corr(), annot=True, cmap=\'coolwarm\')\n    plt.show()'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'csv-input', target: 'data-cleaner' },
      { id: 'e2', source: 'data-cleaner', target: 'feature-engineer' },
      { id: 'e3', source: 'feature-engineer', target: 'analytics' }
    ]
  }
];

export const workflowCategories = [
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Traditional ML algorithms and pipelines',
    color: '#3B82F6',
    workflows: demoWorkflows.filter(w => w.category === 'ml')
  },
  {
    id: 'nlp',
    name: 'Natural Language Processing',
    description: 'Text analysis and language understanding',
    color: '#10B981',
    workflows: demoWorkflows.filter(w => w.category === 'nlp')
  },
  {
    id: 'vision',
    name: 'Computer Vision',
    description: 'Image and video processing',
    color: '#F59E0B',
    workflows: demoWorkflows.filter(w => w.category === 'vision')
  },
  {
    id: 'data',
    name: 'Data Processing',
    description: 'ETL and data analysis pipelines',
    color: '#8B5CF6',
    workflows: demoWorkflows.filter(w => w.category === 'data')
  },
  {
    id: 'audio',
    name: 'Audio Processing',
    description: 'Speech and audio analysis',
    color: '#EF4444',
    workflows: demoWorkflows.filter(w => w.category === 'audio')
  }
];

export const getWorkflowById = (id: string): DemoWorkflow | undefined => {
  return demoWorkflows.find(workflow => workflow.id === id);
};

export const getWorkflowsByCategory = (category: string): DemoWorkflow[] => {
  return demoWorkflows.filter(workflow => workflow.category === category);
};

export const getWorkflowsByDifficulty = (difficulty: string): DemoWorkflow[] => {
  return demoWorkflows.filter(workflow => workflow.difficulty === difficulty);
};

export const searchWorkflows = (query: string): DemoWorkflow[] => {
  const lowerQuery = query.toLowerCase();
  return demoWorkflows.filter(workflow => 
    workflow.name.toLowerCase().includes(lowerQuery) ||
    workflow.description.toLowerCase().includes(lowerQuery) ||
    workflow.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export default demoWorkflows;
