// @ts-nocheck
/**
 * Comprehensive µLM AI Workflow Block Library
 * Complete library with standardized interfaces for dynamic grid storage
 */

import { BlockDefinition, BlockCategory, Port, ConfigParameter } from '../types/GridTypes';

// =============================================================================
// INPUT BLOCKS
// =============================================================================

export const InputBlocks: Record<string, BlockDefinition> = {
  // File Upload Blocks
  csvUpload: {
    id: 'csvUpload',
    name: 'CSV File Upload',
    category: 'input' as BlockCategory,
    description: 'Upload and parse CSV files with automatic type detection',
    version: '1.0.0',
    inputs: [],
    outputs: [
      { id: 'data', name: 'Data', type: 'dataframe', description: 'Parsed CSV data' },
      { id: 'columns', name: 'Columns', type: 'array', description: 'Column names' },
      { id: 'metadata', name: 'Metadata', type: 'object', description: 'File metadata' }
    ],
    config: {
      file: { type: 'file', label: 'CSV File', accept: '.csv', required: true },
      delimiter: { type: 'select', label: 'Delimiter', options: [',', ';', '\t', '|'], default: ',' },
      header: { type: 'boolean', label: 'Has Header', default: true },
      encoding: { type: 'select', label: 'Encoding', options: ['utf-8', 'latin-1', 'ascii'], default: 'utf-8' },
      inferTypes: { type: 'boolean', label: 'Auto-detect Types', default: true }
    },
    implementation: 'CSVUploadProcessor',
    tags: ['file', 'data', 'import'],
    performance: { avgExecutionTime: 150, memoryUsage: 'medium' },
    errorHandling: { retryable: false, timeout: 30000 }
  },

  textInput: {
    id: 'textInput',
    name: 'Text Input',
    category: 'input' as BlockCategory,
    description: 'Manual text input with validation and formatting',
    version: '1.0.0',
    inputs: [],
    outputs: [
      { id: 'text', name: 'Text', type: 'text', description: 'Input text' },
      { id: 'length', name: 'Length', type: 'number', description: 'Text length' }
    ],
    config: {
      value: { type: 'textarea', label: 'Text Content', default: '', required: true },
      maxLength: { type: 'number', label: 'Max Length', default: 1000 },
      minLength: { type: 'number', label: 'Min Length', default: 0 },
      validateRegex: { type: 'text', label: 'Validation Regex', default: '' }
    },
    implementation: 'TextInputProcessor',
    tags: ['input', 'text', 'manual'],
    performance: { avgExecutionTime: 5, memoryUsage: 'low' },
    errorHandling: { retryable: false, timeout: 1000 }
  },

  apiDataFetcher: {
    id: 'apiDataFetcher',
    name: 'API Data Fetcher',
    category: 'input' as BlockCategory,
    description: 'Fetch data from REST APIs with authentication',
    version: '1.0.0',
    inputs: [
      { id: 'trigger', name: 'Trigger', type: 'any', description: 'Trigger fetch operation' }
    ],
    outputs: [
      { id: 'data', name: 'Data', type: 'object', description: 'API response data' },
      { id: 'headers', name: 'Headers', type: 'object', description: 'Response headers' },
      { id: 'status', name: 'Status', type: 'number', description: 'HTTP status code' }
    ],
    config: {
      url: { type: 'text', label: 'API URL', default: '', required: true },
      method: { type: 'select', label: 'HTTP Method', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      headers: { type: 'textarea', label: 'Headers (JSON)', default: '{}' },
      authType: { type: 'select', label: 'Auth Type', options: ['none', 'bearer', 'basic', 'apikey'], default: 'none' },
      authToken: { type: 'password', label: 'Auth Token', default: '' }
    },
    implementation: 'APIDataFetcher',
    tags: ['api', 'http', 'data'],
    performance: { avgExecutionTime: 1000, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 30000 }
  }
};

// =============================================================================
// ML ALGORITHM BLOCKS
// =============================================================================

export const MLAlgorithmBlocks: Record<string, BlockDefinition> = {
  linearRegression: {
    id: 'linearRegression',
    name: 'Linear Regression',
    category: 'mlAlgorithm' as BlockCategory,
    description: 'Linear regression with regularization options',
    version: '1.0.0',
    inputs: [
      { id: 'features', name: 'Features (X)', type: 'dataframe', description: 'Input features' },
      { id: 'target', name: 'Target (y)', type: 'array', description: 'Target values' }
    ],
    outputs: [
      { id: 'model', name: 'Model', type: 'model', description: 'Trained model' },
      { id: 'predictions', name: 'Predictions', type: 'array', description: 'Model predictions' },
      { id: 'metrics', name: 'Metrics', type: 'object', description: 'Performance metrics' },
      { id: 'coefficients', name: 'Coefficients', type: 'array', description: 'Model coefficients' }
    ],
    config: {
      fitIntercept: { type: 'boolean', label: 'Fit Intercept', default: true },
      normalize: { type: 'boolean', label: 'Normalize Features', default: false },
      regularization: { type: 'select', label: 'Regularization', options: ['none', 'ridge', 'lasso', 'elastic'], default: 'none' },
      alpha: { type: 'number', label: 'Regularization Strength', default: 1.0 },
      testSize: { type: 'number', label: 'Test Size (0-1)', default: 0.2 }
    },
    implementation: 'LinearRegressionProcessor',
    tags: ['regression', 'supervised', 'linear'],
    performance: { avgExecutionTime: 100, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 30000 }
  },

  randomForest: {
    id: 'randomForest',
    name: 'Random Forest',
    category: 'mlAlgorithm' as BlockCategory,
    description: 'Random Forest ensemble method for classification and regression',
    version: '1.0.0',
    inputs: [
      { id: 'features', name: 'Features (X)', type: 'dataframe', description: 'Input features' },
      { id: 'target', name: 'Target (y)', type: 'array', description: 'Target values' }
    ],
    outputs: [
      { id: 'model', name: 'Model', type: 'model', description: 'Trained ensemble model' },
      { id: 'predictions', name: 'Predictions', type: 'array', description: 'Model predictions' },
      { id: 'featureImportance', name: 'Feature Importance', type: 'array', description: 'Feature importance scores' },
      { id: 'metrics', name: 'Metrics', type: 'object', description: 'Performance metrics' }
    ],
    config: {
      nEstimators: { type: 'number', label: 'Number of Trees', default: 100 },
      maxDepth: { type: 'number', label: 'Max Depth', default: 10 },
      minSamplesSplit: { type: 'number', label: 'Min Samples Split', default: 2 },
      maxFeatures: { type: 'select', label: 'Max Features', options: ['auto', 'sqrt', 'log2'], default: 'auto' },
      taskType: { type: 'select', label: 'Task Type', options: ['auto', 'classification', 'regression'], default: 'auto' }
    },
    implementation: 'RandomForestProcessor',
    tags: ['ensemble', 'trees', 'supervised'],
    performance: { avgExecutionTime: 300, memoryUsage: 'high' },
    errorHandling: { retryable: true, timeout: 120000 }
  },

  kMeansClustering: {
    id: 'kMeansClustering',
    name: 'K-Means Clustering',
    category: 'mlAlgorithm' as BlockCategory,
    description: 'K-Means clustering algorithm with automatic K selection',
    version: '1.0.0',
    inputs: [
      { id: 'features', name: 'Features (X)', type: 'dataframe', description: 'Input features for clustering' }
    ],
    outputs: [
      { id: 'model', name: 'Model', type: 'model', description: 'Trained clustering model' },
      { id: 'labels', name: 'Cluster Labels', type: 'array', description: 'Cluster assignments' },
      { id: 'centroids', name: 'Centroids', type: 'array', description: 'Cluster centers' },
      { id: 'metrics', name: 'Metrics', type: 'object', description: 'Clustering metrics' }
    ],
    config: {
      nClusters: { type: 'number', label: 'Number of Clusters', default: 3 },
      autoK: { type: 'boolean', label: 'Auto-determine K', default: false },
      initMethod: { type: 'select', label: 'Initialization', options: ['k-means++', 'random'], default: 'k-means++' },
      maxIter: { type: 'number', label: 'Max Iterations', default: 300 }
    },
    implementation: 'KMeansProcessor',
    tags: ['clustering', 'unsupervised', 'kmeans'],
    performance: { avgExecutionTime: 150, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 45000 }
  }
};

// =============================================================================
// NEURAL NETWORK BLOCKS
// =============================================================================

export const NeuralNetworkBlocks: Record<string, BlockDefinition> = {
  denseLayer: {
    id: 'denseLayer',
    name: 'Dense Layer',
    category: 'neuralNetwork' as BlockCategory,
    description: 'Fully connected dense layer for neural networks',
    version: '1.0.0',
    inputs: [
      { id: 'input', name: 'Input', type: 'tensor', description: 'Input tensor' }
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'tensor', description: 'Layer output' },
      { id: 'weights', name: 'Weights', type: 'tensor', description: 'Layer weights' }
    ],
    config: {
      units: { type: 'number', label: 'Number of Units', default: 64, required: true },
      activation: { type: 'select', label: 'Activation Function', options: ['relu', 'sigmoid', 'tanh', 'linear'], default: 'relu' },
      useBias: { type: 'boolean', label: 'Use Bias', default: true },
      weightInit: { type: 'select', label: 'Weight Initialization', options: ['glorot_uniform', 'he_normal', 'random_normal'], default: 'glorot_uniform' }
    },
    implementation: 'DenseLayerProcessor',
    tags: ['layer', 'dense', 'neural'],
    performance: { avgExecutionTime: 50, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 15000 }
  },

  modelTrainer: {
    id: 'modelTrainer',
    name: 'Model Trainer',
    category: 'neuralNetwork' as BlockCategory,
    description: 'Train neural network models with monitoring',
    version: '1.0.0',
    inputs: [
      { id: 'model', name: 'Compiled Model', type: 'model', description: 'Compiled neural network' },
      { id: 'trainX', name: 'Train X', type: 'tensor', description: 'Training features' },
      { id: 'trainY', name: 'Train Y', type: 'tensor', description: 'Training targets' }
    ],
    outputs: [
      { id: 'trainedModel', name: 'Trained Model', type: 'model', description: 'Trained neural network' },
      { id: 'history', name: 'Training History', type: 'object', description: 'Training metrics history' }
    ],
    config: {
      epochs: { type: 'number', label: 'Epochs', default: 100 },
      batchSize: { type: 'number', label: 'Batch Size', default: 32 },
      validationSplit: { type: 'number', label: 'Validation Split', default: 0.2 },
      earlyStopping: { type: 'boolean', label: 'Early Stopping', default: true },
      patience: { type: 'number', label: 'Patience (epochs)', default: 10 }
    },
    implementation: 'ModelTrainerProcessor',
    tags: ['training', 'model', 'neural'],
    performance: { avgExecutionTime: 5000, memoryUsage: 'very_high' },
    errorHandling: { retryable: true, timeout: 3600000 }
  }
};

// =============================================================================
// EXPERT BLOCKS (Pre-trained Models)
// =============================================================================

export const ExpertBlocks: Record<string, BlockDefinition> = {
  textClassification: {
    id: 'textClassification',
    name: 'Text Classification',
    category: 'expert' as BlockCategory,
    description: 'Pre-trained text classification with multiple model options',
    version: '1.0.0',
    inputs: [
      { id: 'text', name: 'Text', type: 'text', description: 'Input text to classify' }
    ],
    outputs: [
      { id: 'classification', name: 'Classification', type: 'object', description: 'Classification result with confidence' },
      { id: 'probabilities', name: 'Probabilities', type: 'array', description: 'Class probabilities' },
      { id: 'embeddings', name: 'Embeddings', type: 'tensor', description: 'Text embeddings' }
    ],
    config: {
      model: { type: 'select', label: 'Pre-trained Model', options: ['bert-base', 'distilbert', 'roberta'], default: 'distilbert' },
      task: { type: 'select', label: 'Classification Task', options: ['sentiment', 'emotion', 'topic', 'intent'], default: 'sentiment' },
      threshold: { type: 'number', label: 'Confidence Threshold', default: 0.5 },
      maxLength: { type: 'number', label: 'Max Text Length', default: 512 }
    },
    implementation: 'TextClassificationExpert',
    tags: ['nlp', 'classification', 'expert', 'pretrained'],
    performance: { avgExecutionTime: 300, memoryUsage: 'high' },
    errorHandling: { retryable: true, timeout: 60000 }
  },

  imageClassification: {
    id: 'imageClassification',
    name: 'Image Classification',
    category: 'expert' as BlockCategory,
    description: 'Classify images using pre-trained computer vision models',
    version: '1.0.0',
    inputs: [
      { id: 'image', name: 'Image', type: 'image', description: 'Input image to classify' }
    ],
    outputs: [
      { id: 'classification', name: 'Classification', type: 'object', description: 'Image classification result' },
      { id: 'topK', name: 'Top K Predictions', type: 'array', description: 'Top K class predictions' },
      { id: 'features', name: 'Features', type: 'tensor', description: 'Extracted image features' }
    ],
    config: {
      model: { type: 'select', label: 'Vision Model', options: ['resnet50', 'efficientnet', 'vit'], default: 'efficientnet' },
      topK: { type: 'number', label: 'Top K Predictions', default: 5 },
      generateHeatmap: { type: 'boolean', label: 'Generate Heatmap', default: true }
    },
    implementation: 'ImageClassificationExpert',
    tags: ['vision', 'classification', 'expert', 'cnn'],
    performance: { avgExecutionTime: 300, memoryUsage: 'high' },
    errorHandling: { retryable: true, timeout: 45000 }
  }
};

// =============================================================================
// UTILITY BLOCKS
// =============================================================================

export const UtilityBlocks: Record<string, BlockDefinition> = {
  dataPreprocessor: {
    id: 'dataPreprocessor',
    name: 'Data Preprocessor',
    category: 'utility' as BlockCategory,
    description: 'Comprehensive data preprocessing and cleaning',
    version: '1.0.0',
    inputs: [
      { id: 'data', name: 'Raw Data', type: 'dataframe', description: 'Input data to preprocess' }
    ],
    outputs: [
      { id: 'processedData', name: 'Processed Data', type: 'dataframe', description: 'Cleaned and preprocessed data' },
      { id: 'report', name: 'Processing Report', type: 'object', description: 'Data quality and processing report' }
    ],
    config: {
      handleMissing: { type: 'select', label: 'Handle Missing Values', options: ['drop', 'fill_mean', 'fill_median', 'fill_mode'], default: 'fill_mean' },
      removeOutliers: { type: 'boolean', label: 'Remove Outliers', default: true },
      encoding: { type: 'select', label: 'Categorical Encoding', options: ['onehot', 'label', 'target'], default: 'onehot' },
      textProcessing: { type: 'boolean', label: 'Process Text Columns', default: true }
    },
    implementation: 'DataPreprocessorUtility',
    tags: ['preprocessing', 'cleaning', 'utility'],
    performance: { avgExecutionTime: 200, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 60000 }
  },

  performanceMetrics: {
    id: 'performanceMetrics',
    name: 'Performance Metrics',
    category: 'utility' as BlockCategory,
    description: 'Calculate comprehensive performance metrics for ML models',
    version: '1.0.0',
    inputs: [
      { id: 'predictions', name: 'Predictions', type: 'array', description: 'Model predictions' },
      { id: 'actual', name: 'Actual Values', type: 'array', description: 'True values' }
    ],
    outputs: [
      { id: 'metrics', name: 'Metrics', type: 'object', description: 'Calculated performance metrics' },
      { id: 'confusionMatrix', name: 'Confusion Matrix', type: 'array', description: 'Confusion matrix (for classification)' },
      { id: 'report', name: 'Detailed Report', type: 'text', description: 'Formatted performance report' }
    ],
    config: {
      taskType: { type: 'select', label: 'Task Type', options: ['auto', 'classification', 'regression'], default: 'auto' },
      metrics: { type: 'multiselect', label: 'Metrics to Calculate', options: ['accuracy', 'precision', 'recall', 'f1', 'auc', 'mse'], default: ['accuracy', 'f1'] },
      average: { type: 'select', label: 'Averaging Method', options: ['macro', 'micro', 'weighted'], default: 'weighted' }
    },
    implementation: 'PerformanceMetricsUtility',
    tags: ['metrics', 'evaluation', 'performance', 'utility'],
    performance: { avgExecutionTime: 50, memoryUsage: 'low' },
    errorHandling: { retryable: true, timeout: 15000 }
  }
};

// =============================================================================
// OUTPUT BLOCKS
// =============================================================================

export const OutputBlocks: Record<string, BlockDefinition> = {
  displayResults: {
    id: 'displayResults',
    name: 'Display Results',
    category: 'output' as BlockCategory,
    description: 'Display results in various formats with rich formatting',
    version: '1.0.0',
    inputs: [
      { id: 'data', name: 'Data', type: 'any', description: 'Data to display' },
      { id: 'title', name: 'Title', type: 'text', description: 'Display title' }
    ],
    outputs: [
      { id: 'rendered', name: 'Rendered Output', type: 'html', description: 'Rendered display output' },
      { id: 'metadata', name: 'Display Metadata', type: 'object', description: 'Display configuration metadata' }
    ],
    config: {
      displayType: { type: 'select', label: 'Display Type', options: ['table', 'json', 'text', 'html'], default: 'table' },
      formatting: { type: 'select', label: 'Formatting', options: ['auto', 'pretty', 'compact'], default: 'pretty' },
      maxRows: { type: 'number', label: 'Max Rows to Display', default: 100 },
      includeIndex: { type: 'boolean', label: 'Include Index', default: true }
    },
    implementation: 'DisplayResultsOutput',
    tags: ['display', 'visualization', 'output'],
    performance: { avgExecutionTime: 30, memoryUsage: 'low' },
    errorHandling: { retryable: true, timeout: 10000 }
  },

  chartVisualization: {
    id: 'chartVisualization',
    name: 'Chart Visualization',
    category: 'output' as BlockCategory,
    description: 'Create interactive charts and graphs',
    version: '1.0.0',
    inputs: [
      { id: 'data', name: 'Data', type: 'dataframe', description: 'Data to visualize' },
      { id: 'labels', name: 'Labels', type: 'array', description: 'Chart labels' }
    ],
    outputs: [
      { id: 'chart', name: 'Chart', type: 'visualization', description: 'Generated chart' },
      { id: 'config', name: 'Chart Config', type: 'object', description: 'Chart configuration' }
    ],
    config: {
      chartType: { type: 'select', label: 'Chart Type', options: ['line', 'bar', 'scatter', 'pie', 'histogram'], default: 'line' },
      xColumn: { type: 'text', label: 'X-axis Column', default: '' },
      yColumn: { type: 'text', label: 'Y-axis Column', default: '' },
      title: { type: 'text', label: 'Chart Title', default: 'Data Visualization' },
      interactive: { type: 'boolean', label: 'Interactive Chart', default: true }
    },
    implementation: 'ChartVisualizationOutput',
    tags: ['chart', 'visualization', 'graph', 'output'],
    performance: { avgExecutionTime: 150, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 30000 }
  },

  modelExport: {
    id: 'modelExport',
    name: 'Model Export',
    category: 'output' as BlockCategory,
    description: 'Export trained models in various formats',
    version: '1.0.0',
    inputs: [
      { id: 'model', name: 'Trained Model', type: 'model', description: 'Model to export' },
      { id: 'metadata', name: 'Model Metadata', type: 'object', description: 'Model metadata and info' }
    ],
    outputs: [
      { id: 'modelFile', name: 'Model File', type: 'file', description: 'Exported model file' },
      { id: 'configFile', name: 'Config File', type: 'file', description: 'Model configuration file' }
    ],
    config: {
      format: { type: 'select', label: 'Export Format', options: ['pickle', 'joblib', 'onnx', 'tensorflow'], default: 'joblib' },
      includePreprocessing: { type: 'boolean', label: 'Include Preprocessing', default: true },
      compression: { type: 'select', label: 'Compression', options: ['none', 'gzip', 'lzma'], default: 'gzip' },
      version: { type: 'text', label: 'Model Version', default: '1.0.0' }
    },
    implementation: 'ModelExportOutput',
    tags: ['model', 'export', 'save', 'output'],
    performance: { avgExecutionTime: 300, memoryUsage: 'medium' },
    errorHandling: { retryable: true, timeout: 120000 }
  }
};

// =============================================================================
// LEGACY BLOCKS (for backward compatibility)
// =============================================================================

// Legacy transformer block
export const transformer: BlockDefinition = {
  id: 'transformer',
  name: 'Transformer Model',
  category: 'expert' as BlockCategory,
  description: 'Transformer-based language model for text processing',
  version: '1.0.0',
  inputs: [
    { id: 'text', name: 'Input Text', type: 'text', description: 'Text to process' }
  ],
  outputs: [
    { id: 'output', name: 'Processed Text', type: 'text', description: 'Processed output' },
    { id: 'embeddings', name: 'Embeddings', type: 'tensor', description: 'Text embeddings' }
  ],
  config: {
    model: { type: 'select', label: 'Model Type', options: ['gpt', 'bert', 't5'], default: 'bert' },
    maxLength: { type: 'number', label: 'Max Length', default: 512 },
    temperature: { type: 'number', label: 'Temperature', default: 0.7 }
  },
  implementation: 'TransformerProcessor',
  tags: ['nlp', 'transformer', 'expert'],
  performance: { avgExecutionTime: 400, memoryUsage: 'high' },
  errorHandling: { retryable: true, timeout: 60000 }
};

// Legacy text formatter block
export const textFormatter: BlockDefinition = {
  id: 'textFormatter',
  name: 'Text Formatter',
  category: 'utility' as BlockCategory,
  description: 'Format and clean text data',
  version: '1.0.0',
  inputs: [
    { id: 'text', name: 'Input Text', type: 'text', description: 'Text to format' }
  ],
  outputs: [
    { id: 'formattedText', name: 'Formatted Text', type: 'text', description: 'Formatted output' },
    { id: 'metadata', name: 'Format Metadata', type: 'object', description: 'Formatting information' }
  ],
  config: {
    format: { type: 'select', label: 'Output Format', options: ['plain', 'markdown', 'html'], default: 'plain' },
    cleanWhitespace: { type: 'boolean', label: 'Clean Whitespace', default: true },
    removeSpecialChars: { type: 'boolean', label: 'Remove Special Characters', default: false },
    toLowerCase: { type: 'boolean', label: 'Convert to Lowercase', default: false }
  },
  implementation: 'TextFormatterProcessor',
  tags: ['text', 'formatting', 'utility'],
  performance: { avgExecutionTime: 20, memoryUsage: 'low' },
  errorHandling: { retryable: true, timeout: 5000 }
};

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const AllBlocks: Record<string, BlockDefinition> = {
  // Input Blocks
  ...InputBlocks,
  
  // ML Algorithm Blocks
  ...MLAlgorithmBlocks,
  
  // Neural Network Blocks
  ...NeuralNetworkBlocks,
  
  // Expert Blocks
  ...ExpertBlocks,
  
  // Utility Blocks
  ...UtilityBlocks,
  
  // Output Blocks
  ...OutputBlocks,
  
  // Legacy blocks for backward compatibility
  transformer,
  textFormatter
};

// Export by category for easy access
export const BlocksByCategory = {
  input: InputBlocks,
  mlAlgorithm: MLAlgorithmBlocks,
  neuralNetwork: NeuralNetworkBlocks,
  expert: ExpertBlocks,
  utility: UtilityBlocks,
  output: OutputBlocks
};

// For backward compatibility with BlockPalette
export const BlockCategories = [
  { key: 'input', name: 'Input Blocks', description: 'Data input and file upload blocks' },
  { key: 'mlAlgorithm', name: 'ML Algorithm Blocks', description: 'Machine learning algorithms' },
  { key: 'neuralNetwork', name: 'Neural Network Blocks', description: 'Neural network layers and training' },
  { key: 'expert', name: 'Expert Blocks', description: 'Pre-trained models and expert systems' },
  { key: 'utility', name: 'Utility Blocks', description: 'Data processing and utility functions' },
  { key: 'output', name: 'Output Blocks', description: 'Visualization and export blocks' }
];

// Helper functions for backward compatibility
export const getBlocksByCategory = (category: string) => {
  return Object.values(BlocksByCategory[category as keyof typeof BlocksByCategory] || {});
};

export const searchBlocks = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return Object.entries(AllBlocks).filter(([id, block]) =>
    block.name.toLowerCase().includes(lowercaseQuery) ||
    block.description.toLowerCase().includes(lowercaseQuery) ||
    block.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Export total count
export const TotalBlocks = Object.keys(AllBlocks).length;

console.log(`µLM Comprehensive Block Library loaded: ${TotalBlocks} blocks across 6 categories`);
