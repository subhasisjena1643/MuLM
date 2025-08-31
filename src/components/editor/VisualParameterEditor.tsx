// @ts-nocheck
// Visual Parameter Editor with Form Controls and Validation
// Advanced configuration interface for µLM block parameters

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Variable,
  Type,
  Check,
  X,
  Copy,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Info,
  Save
} from 'lucide-react';

interface Parameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'secret';
  value: any;
  defaultValue: any;
  description: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    custom?: string;
  };
  category: string;
  sensitive: boolean;
}

interface ParameterGroup {
  name: string;
  description: string;
  parameters: Parameter[];
  collapsed: boolean;
}

interface VisualParameterEditorProps {
  blockType: string;
  blockId: string;
  initialConfig: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
  onSave: () => void;
  isDark?: boolean;
  readOnly?: boolean;
  showAdvanced?: boolean;
}

export const VisualParameterEditor: React.FC<VisualParameterEditorProps> = ({
  blockType,
  blockId,
  initialConfig,
  onConfigChange,
  onSave,
  isDark = false,
  readOnly = false,
  showAdvanced = false
}) => {
  const [parameterGroups, setParameterGroups] = useState<ParameterGroup[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'json' | 'yaml'>('visual');
  const [jsonConfig, setJsonConfig] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize parameter groups based on block type
  useEffect(() => {
    const groups = generateParameterGroups(blockType, initialConfig);
    setParameterGroups(groups);
    setJsonConfig(JSON.stringify(initialConfig, null, 2));
  }, [blockType, initialConfig]);

  const generateParameterGroups = (type: string, config: Record<string, any>): ParameterGroup[] => {
    const baseGroups: ParameterGroup[] = [
      {
        name: 'Basic Configuration',
        description: 'Essential parameters for block operation',
        collapsed: false,
        parameters: [
          {
            id: 'name',
            name: 'Block Name',
            type: 'string',
            value: config.name || '',
            defaultValue: `${type}_block`,
            description: 'Unique identifier for this block',
            required: true,
            category: 'basic',
            sensitive: false
          },
          {
            id: 'description',
            name: 'Description',
            type: 'string',
            value: config.description || '',
            defaultValue: '',
            description: 'Brief description of what this block does',
            required: false,
            category: 'basic',
            sensitive: false
          },
          {
            id: 'enabled',
            name: 'Enabled',
            type: 'boolean',
            value: config.enabled !== undefined ? config.enabled : true,
            defaultValue: true,
            description: 'Whether this block is active in the workflow',
            required: false,
            category: 'basic',
            sensitive: false
          }
        ]
      },
      {
        name: 'Performance Settings',
        description: 'Resource allocation and performance tuning',
        collapsed: true,
        parameters: [
          {
            id: 'timeout',
            name: 'Timeout (seconds)',
            type: 'number',
            value: config.timeout || 30,
            defaultValue: 30,
            description: 'Maximum execution time before timeout',
            required: false,
            validation: { min: 1, max: 3600 },
            category: 'performance',
            sensitive: false
          },
          {
            id: 'memory_limit',
            name: 'Memory Limit (MB)',
            type: 'number',
            value: config.memory_limit || 512,
            defaultValue: 512,
            description: 'Maximum memory allocation',
            required: false,
            validation: { min: 64, max: 8192 },
            category: 'performance',
            sensitive: false
          },
          {
            id: 'retry_count',
            name: 'Retry Count',
            type: 'number',
            value: config.retry_count || 3,
            defaultValue: 3,
            description: 'Number of retry attempts on failure',
            required: false,
            validation: { min: 0, max: 10 },
            category: 'performance',
            sensitive: false
          }
        ]
      }
    ];

    // Add block-type specific parameters
    switch (type) {
      case 'transformer':
        baseGroups.push(generateTransformerParams(config));
        break;
      case 'llm':
        baseGroups.push(generateLLMParams(config));
        break;
      case 'dataProcessor':
        baseGroups.push(generateDataProcessorParams(config));
        break;
    }

    // Add environment variables group
    baseGroups.push({
      name: 'Environment Variables',
      description: 'Runtime environment configuration',
      collapsed: true,
      parameters: generateEnvVarParams(config.env_vars || {})
    });

    return baseGroups;
  };

  const generateTransformerParams = (config: Record<string, any>): ParameterGroup => ({
    name: 'Transformer Configuration',
    description: 'AI model and transformation settings',
    collapsed: false,
    parameters: [
      {
        id: 'model_name',
        name: 'Model Name',
        type: 'string',
        value: config.model_name || 'gpt-3.5-turbo',
        defaultValue: 'gpt-3.5-turbo',
        description: 'AI model to use for transformation',
        required: true,
        validation: { enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'llama-2'] },
        category: 'transformer',
        sensitive: false
      },
      {
        id: 'api_key',
        name: 'API Key',
        type: 'secret',
        value: config.api_key || '',
        defaultValue: '',
        description: 'API key for the AI service',
        required: true,
        category: 'transformer',
        sensitive: true
      },
      {
        id: 'temperature',
        name: 'Temperature',
        type: 'number',
        value: config.temperature || 0.7,
        defaultValue: 0.7,
        description: 'Creativity level (0.0 to 2.0)',
        required: false,
        validation: { min: 0, max: 2 },
        category: 'transformer',
        sensitive: false
      },
      {
        id: 'max_tokens',
        name: 'Max Tokens',
        type: 'number',
        value: config.max_tokens || 1000,
        defaultValue: 1000,
        description: 'Maximum tokens in response',
        required: false,
        validation: { min: 1, max: 4096 },
        category: 'transformer',
        sensitive: false
      }
    ]
  });

  const generateLLMParams = (config: Record<string, any>): ParameterGroup => ({
    name: 'LLM Configuration',
    description: 'Large Language Model settings',
    collapsed: false,
    parameters: [
      {
        id: 'provider',
        name: 'Provider',
        type: 'string',
        value: config.provider || 'openai',
        defaultValue: 'openai',
        description: 'LLM service provider',
        required: true,
        validation: { enum: ['openai', 'anthropic', 'huggingface', 'local'] },
        category: 'llm',
        sensitive: false
      },
      {
        id: 'system_prompt',
        name: 'System Prompt',
        type: 'string',
        value: config.system_prompt || '',
        defaultValue: 'You are a helpful assistant.',
        description: 'System message to set behavior',
        required: false,
        category: 'llm',
        sensitive: false
      },
      {
        id: 'streaming',
        name: 'Enable Streaming',
        type: 'boolean',
        value: config.streaming !== undefined ? config.streaming : false,
        defaultValue: false,
        description: 'Stream response tokens in real-time',
        required: false,
        category: 'llm',
        sensitive: false
      }
    ]
  });

  const generateDataProcessorParams = (config: Record<string, any>): ParameterGroup => ({
    name: 'Data Processing Configuration',
    description: 'Data transformation and validation settings',
    collapsed: false,
    parameters: [
      {
        id: 'input_format',
        name: 'Input Format',
        type: 'string',
        value: config.input_format || 'json',
        defaultValue: 'json',
        description: 'Expected input data format',
        required: true,
        validation: { enum: ['json', 'csv', 'xml', 'text', 'binary'] },
        category: 'data',
        sensitive: false
      },
      {
        id: 'output_format',
        name: 'Output Format',
        type: 'string',
        value: config.output_format || 'json',
        defaultValue: 'json',
        description: 'Output data format',
        required: true,
        validation: { enum: ['json', 'csv', 'xml', 'text', 'binary'] },
        category: 'data',
        sensitive: false
      },
      {
        id: 'validation_schema',
        name: 'Validation Schema',
        type: 'object',
        value: config.validation_schema || {},
        defaultValue: {},
        description: 'JSON schema for input validation',
        required: false,
        category: 'data',
        sensitive: false
      }
    ]
  });

  const generateEnvVarParams = (envVars: Record<string, string>): Parameter[] => {
    return Object.entries(envVars).map(([key, value], index) => ({
      id: `env_${index}`,
      name: key,
      type: 'string' as const,
      value,
      defaultValue: '',
      description: 'Environment variable',
      required: false,
      category: 'environment',
      sensitive: key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')
    }));
  };

  const updateParameter = (groupIndex: number, paramIndex: number, newValue: any) => {
    const newGroups = [...parameterGroups];
    newGroups[groupIndex].parameters[paramIndex].value = newValue;
    setParameterGroups(newGroups);
    setHasChanges(true);

    // Validate parameter
    const param = newGroups[groupIndex].parameters[paramIndex];
    const error = validateParameter(param, newValue);
    setValidationErrors(prev => ({
      ...prev,
      [param.id]: error || ''
    }));

    // Update config
    const config = extractConfigFromGroups(newGroups);
    onConfigChange(config);
  };

  const validateParameter = (param: Parameter, value: any): string | null => {
    if (param.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }

    if (param.validation) {
      const { min, max, pattern, enum: enumValues } = param.validation;

      if (param.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) return 'Must be a valid number';
        if (min !== undefined && numValue < min) return `Must be at least ${min}`;
        if (max !== undefined && numValue > max) return `Must be at most ${max}`;
      }

      if (param.type === 'string') {
        if (pattern && !new RegExp(pattern).test(value)) return 'Invalid format';
        if (enumValues && !enumValues.includes(value)) return `Must be one of: ${enumValues.join(', ')}`;
      }
    }

    return null;
  };

  const extractConfigFromGroups = (groups: ParameterGroup[]): Record<string, any> => {
    const config: Record<string, any> = {};
    
    groups.forEach(group => {
      group.parameters.forEach(param => {
        if (param.category === 'environment') {
          if (!config.env_vars) config.env_vars = {};
          config.env_vars[param.name] = param.value;
        } else {
          config[param.id] = param.value;
        }
      });
    });

    return config;
  };

  const toggleGroup = (groupIndex: number) => {
    const newGroups = [...parameterGroups];
    newGroups[groupIndex].collapsed = !newGroups[groupIndex].collapsed;
    setParameterGroups(newGroups);
  };

  const addEnvironmentVariable = () => {
    const envGroupIndex = parameterGroups.findIndex(g => g.name === 'Environment Variables');
    if (envGroupIndex === -1) return;

    const newParam: Parameter = {
      id: `env_${Date.now()}`,
      name: 'NEW_VAR',
      type: 'string',
      value: '',
      defaultValue: '',
      description: 'New environment variable',
      required: false,
      category: 'environment',
      sensitive: false
    };

    const newGroups = [...parameterGroups];
    newGroups[envGroupIndex].parameters.push(newParam);
    setParameterGroups(newGroups);
    setHasChanges(true);
  };

  const removeEnvironmentVariable = (groupIndex: number, paramIndex: number) => {
    const newGroups = [...parameterGroups];
    newGroups[groupIndex].parameters.splice(paramIndex, 1);
    setParameterGroups(newGroups);
    setHasChanges(true);
  };

  const toggleSecretVisibility = (paramId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [paramId]: !prev[paramId]
    }));
  };

  const resetToDefaults = () => {
    const newGroups = parameterGroups.map(group => ({
      ...group,
      parameters: group.parameters.map(param => ({
        ...param,
        value: param.defaultValue
      }))
    }));
    setParameterGroups(newGroups);
    setHasChanges(true);
    setValidationErrors({});
  };

  const exportConfig = () => {
    const config = extractConfigFromGroups(parameterGroups);
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${blockId}_config.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        const groups = generateParameterGroups(blockType, config);
        setParameterGroups(groups);
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    };
    reader.readAsText(file);
  };

  const renderParameterInput = (param: Parameter, groupIndex: number, paramIndex: number) => {
    const hasError = validationErrors[param.id];
    const isSecret = param.type === 'secret' || param.sensitive;
    const showValue = !isSecret || showSecrets[param.id];

    switch (param.type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={param.value}
              onChange={(e) => updateParameter(groupIndex, paramIndex, e.target.checked)}
              disabled={readOnly}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {param.description}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={param.value}
            onChange={(e) => updateParameter(groupIndex, paramIndex, Number(e.target.value))}
            disabled={readOnly}
            min={param.validation?.min}
            max={param.validation?.max}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'string':
      case 'secret':
        if (param.validation?.enum) {
          return (
            <select
              value={param.value}
              onChange={(e) => updateParameter(groupIndex, paramIndex, e.target.value)}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                hasError ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {param.validation.enum.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }

        return (
          <div className="relative">
            <input
              type={isSecret && !showValue ? 'password' : 'text'}
              value={param.value}
              onChange={(e) => updateParameter(groupIndex, paramIndex, e.target.value)}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                hasError ? 'border-red-300' : 'border-gray-300'
              } ${isSecret ? 'pr-10' : ''}`}
            />
            {isSecret && (
              <button
                type="button"
                onClick={() => toggleSecretVisibility(param.id)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        );

      case 'array':
      case 'object':
        return (
          <textarea
            value={JSON.stringify(param.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateParameter(groupIndex, paramIndex, parsed);
              } catch {
                // Invalid JSON, keep raw value for now
              }
            }}
            disabled={readOnly}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      default:
        return null;
    }
  };

  const filteredGroups = parameterGroups.filter(group =>
    searchTerm === '' ||
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.parameters.some(param =>
      param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (viewMode === 'json') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">JSON Configuration</h3>
            <button
              onClick={() => setViewMode('visual')}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Visual Editor
            </button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <textarea
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
            className="w-full h-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Block Configuration
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('json')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="JSON View"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={exportConfig}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Export Config"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Import Config">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={importConfig} className="hidden" />
            </label>
            <button
              onClick={resetToDefaults}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Reset to Defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Parameter Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleGroup(groupIndex)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
              </div>
              <div className={`transform transition-transform ${group.collapsed ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {!group.collapsed && (
              <div className="p-4 space-y-4">
                {group.parameters.map((param, paramIndex) => (
                  <div key={param.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {param.name}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                        {param.sensitive && <Key className="w-3 h-3 inline ml-1 text-gray-400" />}
                      </label>
                      
                      {group.name === 'Environment Variables' && (
                        <button
                          onClick={() => removeEnvironmentVariable(groupIndex, paramIndex)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {renderParameterInput(param, groupIndex, paramIndex)}

                    {validationErrors[param.id] && (
                      <div className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{validationErrors[param.id]}</span>
                      </div>
                    )}

                    {param.description && !validationErrors[param.id] && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{param.description}</p>
                    )}
                  </div>
                ))}

                {group.name === 'Environment Variables' && (
                  <button
                    onClick={addEnvironmentVariable}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Environment Variable
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            {hasChanges && (
              <div className="flex items-center space-x-1 text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            )}
            {Object.keys(validationErrors).filter(key => validationErrors[key]).length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <X className="w-3 h-3" />
                <span>{Object.keys(validationErrors).filter(key => validationErrors[key]).length} errors</span>
              </div>
            )}
          </div>

          <button
            onClick={onSave}
            disabled={Object.keys(validationErrors).some(key => validationErrors[key])}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
