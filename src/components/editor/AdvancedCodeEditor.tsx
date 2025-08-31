// @ts-nocheck
// Advanced Source Code Editor with AI Assistant for µLM Blocks
// Monaco Editor integration with real-time AI assistance and collaboration features

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { 
  Code2, 
  Wand2, 
  Bug, 
  Zap, 
  RefreshCw, 
  FileText, 
  TestTube, 
  Settings,
  Eye,
  History,
  Share2,
  Save,
  Download,
  Upload,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';

interface CodeError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: string;
}

interface AISuggestion {
  id: string;
  type: 'improvement' | 'fix' | 'optimization' | 'refactor';
  title: string;
  description: string;
  code: string;
  line?: number;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

interface CodeVersion {
  id: string;
  timestamp: Date;
  code: string;
  message: string;
  author: string;
}

interface AdvancedCodeEditorProps {
  initialCode: string;
  language: 'python' | 'javascript' | 'typescript';
  blockType: string;
  blockId: string;
  onCodeChange: (code: string) => void;
  onSave: (code: string) => void;
  isDark?: boolean;
  readOnly?: boolean;
  showAIAssistant?: boolean;
  showVersionHistory?: boolean;
}

export const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({
  initialCode,
  language,
  blockType,
  blockId,
  onCodeChange,
  onSave,
  isDark = false,
  readOnly = false,
  showAIAssistant = true,
  showVersionHistory = true
}) => {
  const [code, setCode] = useState(initialCode);
  const [errors, setErrors] = useState<CodeError[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'versions' | 'config'>('editor');
  const [isLinting, setIsLinting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Initialize Monaco Editor
  const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor features
    setupEditorFeatures(editor, monaco);
    setupErrorMarkers(editor, monaco);
    setupAutoCompletion(editor, monaco);
    setupCodeActions(editor, monaco);

    // Initial code analysis
    analyzeCode(code);
  }, [code]);

  const setupEditorFeatures = (editor: any, monaco: Monaco) => {
    // Enable advanced features
    editor.updateOptions({
      minimap: { enabled: true },
      folding: true,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showMethods: true,
        showVariables: true
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true
    });

    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
      requestAISuggestions();
    });
  };

  const setupErrorMarkers = (editor: any, monaco: Monaco) => {
    // Setup real-time error checking
    const updateMarkers = () => {
      const model = editor.getModel();
      if (!model) return;

      const markers = errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + 10,
        message: error.message,
        severity: getSeverityLevel(error.severity, monaco),
        source: error.source
      }));

      monaco.editor.setModelMarkers(model, 'linter', markers);
    };

    updateMarkers();
  };

  const getSeverityLevel = (severity: string, monaco: Monaco) => {
    switch (severity) {
      case 'error': return monaco.MarkerSeverity.Error;
      case 'warning': return monaco.MarkerSeverity.Warning;
      default: return monaco.MarkerSeverity.Info;
    }
  };

  const setupAutoCompletion = (editor: any, monaco: Monaco) => {
    // Register completion provider for block-specific suggestions
    const completionProvider = monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position, context, token) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        const suggestions = getBlockSpecificCompletions(blockType).map(suggestion => ({
          ...suggestion,
          range
        }));
        
        return { suggestions };
      }
    });

    return () => completionProvider.dispose();
  };

  const getBlockSpecificCompletions = (blockType: string) => {
    const baseCompletions = [
      {
        label: 'input_data',
        kind: 2, // Variable
        insertText: 'input_data',
        documentation: 'Access input data from previous block'
      },
      {
        label: 'context',
        kind: 2,
        insertText: 'context',
        documentation: 'Block execution context'
      },
      {
        label: 'config',
        kind: 2,
        insertText: 'config',
        documentation: 'Block configuration parameters'
      }
    ];

    // Add block-type specific completions
    switch (blockType) {
      case 'transformer':
        return [...baseCompletions, ...getTransformerCompletions()];
      case 'llm':
        return [...baseCompletions, ...getLLMCompletions()];
      case 'dataProcessor':
        return [...baseCompletions, ...getDataProcessorCompletions()];
      default:
        return baseCompletions;
    }
  };

  const getTransformerCompletions = () => [
    {
      label: 'transform_text',
      kind: 1, // Function
      insertText: 'transform_text(${1:text}, ${2:options})',
      insertTextRules: 4, // InsertAsSnippet
      documentation: 'Transform text using AI model'
    },
    {
      label: 'tokenize',
      kind: 1,
      insertText: 'tokenize(${1:text})',
      insertTextRules: 4,
      documentation: 'Tokenize input text'
    }
  ];

  const getLLMCompletions = () => [
    {
      label: 'generate_response',
      kind: 1,
      insertText: 'generate_response(${1:prompt}, ${2:parameters})',
      insertTextRules: 4,
      documentation: 'Generate LLM response'
    },
    {
      label: 'chat_completion',
      kind: 1,
      insertText: 'chat_completion(${1:messages})',
      insertTextRules: 4,
      documentation: 'Chat completion API call'
    }
  ];

  const getDataProcessorCompletions = () => [
    {
      label: 'process_data',
      kind: 1,
      insertText: 'process_data(${1:data})',
      insertTextRules: 4,
      documentation: 'Process input data'
    },
    {
      label: 'validate_schema',
      kind: 1,
      insertText: 'validate_schema(${1:data}, ${2:schema})',
      insertTextRules: 4,
      documentation: 'Validate data against schema'
    }
  ];

  const setupCodeActions = (editor: any, monaco: Monaco) => {
    // Register code actions for AI suggestions
    monaco.languages.registerCodeActionProvider(language, {
      provideCodeActions: (model, range, context) => {
        const actions: any[] = [];

        // Add AI suggestion actions
        aiSuggestions.forEach(suggestion => {
          if (!suggestion.line || suggestion.line >= range.startLineNumber && suggestion.line <= range.endLineNumber) {
            actions.push({
              title: `AI: ${suggestion.title}`,
              kind: 'quickfix',
              edit: {
                edits: [{
                  resource: model.uri,
                  edit: {
                    range: range,
                    text: suggestion.code
                  }
                }]
              }
            });
          }
        });

        return {
          actions,
          dispose: () => {}
        };
      }
    });
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined && value !== code) {
      setCode(value);
      setHasUnsavedChanges(true);
      onCodeChange(value);
      
      // Debounced analysis
      setTimeout(() => analyzeCode(value), 1000);
    }
  }, [code, onCodeChange]);

  const analyzeCode = async (codeToAnalyze: string) => {
    setIsLinting(true);
    try {
      // Simulate code analysis (replace with actual linter integration)
      const analysisResult = await performCodeAnalysis(codeToAnalyze, language, blockType);
      setErrors(analysisResult.errors);
      
      if (showAIAssistant) {
        setAISuggestions(analysisResult.suggestions);
      }
    } catch (error) {
      console.error('Code analysis failed:', error);
    } finally {
      setIsLinting(false);
    }
  };

  const performCodeAnalysis = async (code: string, lang: string, type: string) => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const errors: CodeError[] = [];
    const suggestions: AISuggestion[] = [];

    // Basic syntax checks (replace with actual linter)
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('undefined_variable')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('undefined_variable'),
          message: 'Undefined variable',
          severity: 'error',
          source: 'linter'
        });
      }

      if (line.includes('TODO')) {
        suggestions.push({
          id: `todo-${index}`,
          type: 'improvement',
          title: 'Complete TODO item',
          description: 'This TODO comment should be addressed',
          code: line.replace('TODO', 'DONE'),
          line: index + 1,
          confidence: 0.8,
          impact: 'low'
        });
      }
    });

    // AI-powered suggestions
    if (code.includes('for ') && lang === 'python') {
      suggestions.push({
        id: 'list-comprehension',
        type: 'optimization',
        title: 'Use list comprehension',
        description: 'This loop can be optimized using list comprehension',
        code: 'result = [item for item in items if condition]',
        confidence: 0.9,
        impact: 'medium'
      });
    }

    return { errors, suggestions };
  };

  const requestAISuggestions = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      const suggestions = await generateAISuggestions(code, blockType);
      setAISuggestions(suggestions);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAISuggestions = async (code: string, blockType: string): Promise<AISuggestion[]> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
      {
        id: 'error-handling',
        type: 'improvement',
        title: 'Add error handling',
        description: 'Consider adding try-catch blocks for better error handling',
        code: `try:\n    ${code.split('\n').join('\n    ')}\nexcept Exception as e:\n    logger.error(f"Error: {e}")`,
        confidence: 0.85,
        impact: 'high'
      },
      {
        id: 'performance',
        type: 'optimization',
        title: 'Optimize performance',
        description: 'This code can be optimized for better performance',
        code: '# Optimized version with caching',
        confidence: 0.75,
        impact: 'medium'
      },
      {
        id: 'documentation',
        type: 'improvement',
        title: 'Add documentation',
        description: 'Add docstrings and comments for better maintainability',
        code: '"""Block function documentation"""',
        confidence: 0.9,
        impact: 'low'
      }
    ];
  };

  const handleSave = () => {
    onSave(code);
    setHasUnsavedChanges(false);
    
    // Add to version history
    const newVersion: CodeVersion = {
      id: `v${Date.now()}`,
      timestamp: new Date(),
      code,
      message: 'Manual save',
      author: 'Current User'
    };
    setVersions(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.line && editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      
      if (model) {
        const lineContent = model.getLineContent(suggestion.line);
        const range = {
          startLineNumber: suggestion.line,
          startColumn: 1,
          endLineNumber: suggestion.line,
          endColumn: lineContent.length + 1
        };
        
        editor.executeEdits('ai-suggestion', [{
          range,
          text: suggestion.code
        }]);
      }
    } else {
      setCode(suggestion.code);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('editor', 'editor.action.formatDocument');
    }
  };

  const showVersionDiff = (versionId: string) => {
    setSelectedVersion(versionId);
    setShowDiff(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code Editor - {blockType}
          </h3>
          {hasUnsavedChanges && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
              Unsaved changes
            </span>
          )}
          {isLinting && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={formatCode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Format Code"
          >
            <Code2 className="w-4 h-4" />
          </button>
          
          {showAIAssistant && (
            <button
              onClick={requestAISuggestions}
              disabled={isAnalyzing}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="AI Suggestions"
            >
              <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </button>
          )}

          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Code2 className="w-4 h-4 inline mr-2" />
          Editor
        </button>
        
        {showAIAssistant && (
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'ai'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            AI Assistant {aiSuggestions.length > 0 && (
              <span className="ml-1 px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                {aiSuggestions.length}
              </span>
            )}
          </button>
        )}
        
        {showVersionHistory && (
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'versions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Versions
          </button>
        )}

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'config'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Config
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              readOnly,
              fontSize: 14,
              lineHeight: 20,
              padding: { top: 16, bottom: 16 }
            }}
          />
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {activeTab === 'ai' && <AIAssistantPanel suggestions={aiSuggestions} onApplySuggestion={applySuggestion} />}
          {activeTab === 'versions' && <VersionHistoryPanel versions={versions} onShowDiff={showVersionDiff} />}
          {activeTab === 'config' && <ConfigurationPanel blockType={blockType} />}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language.toUpperCase()} • {code.split('\n').length} lines
          </span>
          
          {errors.length > 0 && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{errors.length} errors</span>
            </div>
          )}
          
          {errors.length === 0 && code.length > 0 && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>No errors</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">
            Block: {blockId}
          </span>
        </div>
      </div>
    </div>
  );
};

// AI Assistant Panel Component
const AIAssistantPanel: React.FC<{
  suggestions: AISuggestion[];
  onApplySuggestion: (suggestion: AISuggestion) => void;
}> = ({ suggestions, onApplySuggestion }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">AI Suggestions</h4>
      
      {suggestions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No suggestions available</p>
          <p className="text-sm">Press Ctrl+E to request AI analysis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{suggestion.title}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  suggestion.type === 'improvement' ? 'bg-blue-100 text-blue-800' :
                  suggestion.type === 'fix' ? 'bg-red-100 text-red-800' :
                  suggestion.type === 'optimization' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {suggestion.type}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                  <span>Impact: {suggestion.impact}</span>
                </div>
                
                <button
                  onClick={() => onApplySuggestion(suggestion)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Version History Panel Component
const VersionHistoryPanel: React.FC<{
  versions: CodeVersion[];
  onShowDiff: (versionId: string) => void;
}> = ({ versions, onShowDiff }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Version History</h4>
      
      {versions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No versions saved yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div key={version.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{version.id}</span>
                <span className="text-xs text-gray-500">{version.timestamp.toLocaleString()}</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{version.message}</p>
              <p className="text-xs text-gray-500">by {version.author}</p>
              
              <button
                onClick={() => onShowDiff(version.id)}
                className="mt-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <GitBranch className="w-3 h-3 inline mr-1" />
                Show Diff
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Configuration Panel Component
const ConfigurationPanel: React.FC<{ blockType: string }> = ({ blockType }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Configuration</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Block Type
          </label>
          <input
            type="text"
            value={blockType}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Runtime Environment
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
            <option>Python 3.9</option>
            <option>Node.js 18</option>
            <option>Deno Runtime</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Memory Limit (MB)
          </label>
          <input
            type="number"
            defaultValue={512}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timeout (seconds)
          </label>
          <input
            type="number"
            defaultValue={30}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Environment Variables</h5>
          <button className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors">
            + Add Environment Variable
          </button>
        </div>
      </div>
    </div>
  );
};
