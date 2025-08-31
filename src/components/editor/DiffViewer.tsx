// @ts-nocheck
// Advanced Diff Viewer for Code Changes and Version Comparison
// Monaco-based diff editor with syntax highlighting and change navigation

import React, { useRef, useEffect, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  Copy,
  Download,
  GitBranch,
  Eye,
  EyeOff,
  Search,
  Settings,
  FileText,
  Clock
} from 'lucide-react';

interface DiffChange {
  lineNumber: number;
  type: 'added' | 'removed' | 'modified';
  content: string;
  originalContent?: string;
}

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'yaml';
  originalTitle?: string;
  modifiedTitle?: string;
  onAcceptChange?: (changeIndex: number) => void;
  onRejectChange?: (changeIndex: number) => void;
  onApplyAll?: () => void;
  onRevertAll?: () => void;
  isDark?: boolean;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  enableInlineDiff?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language,
  originalTitle = 'Original',
  modifiedTitle = 'Modified',
  onAcceptChange,
  onRejectChange,
  onApplyAll,
  onRevertAll,
  isDark = false,
  readOnly = false,
  showLineNumbers = true,
  enableInlineDiff = false
}) => {
  const diffEditorRef = useRef<any>(null);
  const [changes, setChanges] = useState<DiffChange[]>([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [diffStats, setDiffStats] = useState({ additions: 0, deletions: 0, modifications: 0 });
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);

  useEffect(() => {
    analyzeChanges();
  }, [originalCode, modifiedCode]);

  const analyzeChanges = () => {
    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    const detectedChanges: DiffChange[] = [];
    let additions = 0, deletions = 0, modifications = 0;

    // Simple diff algorithm (replace with more sophisticated one if needed)
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i];
      const modifiedLine = modifiedLines[i];

      if (originalLine === undefined && modifiedLine !== undefined) {
        // Line added
        detectedChanges.push({
          lineNumber: i + 1,
          type: 'added',
          content: modifiedLine
        });
        additions++;
      } else if (originalLine !== undefined && modifiedLine === undefined) {
        // Line removed
        detectedChanges.push({
          lineNumber: i + 1,
          type: 'removed',
          content: originalLine
        });
        deletions++;
      } else if (originalLine !== modifiedLine) {
        // Line modified
        detectedChanges.push({
          lineNumber: i + 1,
          type: 'modified',
          content: modifiedLine,
          originalContent: originalLine
        });
        modifications++;
      }
    }

    setChanges(detectedChanges);
    setDiffStats({ additions, deletions, modifications });
  };

  const handleEditorDidMount = (editor: any) => {
    diffEditorRef.current = editor;
    
    // Configure diff editor options
    editor.updateOptions({
      readOnly,
      renderSideBySide: viewMode === 'side-by-side',
      renderWhitespace: showWhitespace ? 'all' : 'none',
      ignoreTrimWhitespace: ignoreWhitespace,
      lineNumbers: showLineNumbers ? 'on' : 'off',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 20,
      folding: true,
      wordWrap: 'on'
    });

    // Add keyboard shortcuts
    editor.addCommand(editor.KeyMod.CtrlCmd | editor.KeyCode.KeyF, () => {
      setIsNavigationOpen(!isNavigationOpen);
    });
  };

  const navigateToChange = (changeIndex: number) => {
    if (!diffEditorRef.current || changeIndex < 0 || changeIndex >= changes.length) return;

    const change = changes[changeIndex];
    setCurrentChangeIndex(changeIndex);

    // Navigate to the change in the diff editor
    diffEditorRef.current.revealLineInCenter(change.lineNumber);
    diffEditorRef.current.setPosition({ lineNumber: change.lineNumber, column: 1 });
  };

  const nextChange = () => {
    const nextIndex = (currentChangeIndex + 1) % changes.length;
    navigateToChange(nextIndex);
  };

  const previousChange = () => {
    const prevIndex = currentChangeIndex === 0 ? changes.length - 1 : currentChangeIndex - 1;
    navigateToChange(prevIndex);
  };

  const acceptChange = (changeIndex: number) => {
    if (onAcceptChange) {
      onAcceptChange(changeIndex);
    }
  };

  const rejectChange = (changeIndex: number) => {
    if (onRejectChange) {
      onRejectChange(changeIndex);
    }
  };

  const copyDiff = () => {
    const diffText = changes.map(change => {
      const prefix = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : '~';
      return `${prefix} Line ${change.lineNumber}: ${change.content}`;
    }).join('\n');
    
    navigator.clipboard.writeText(diffText);
  };

  const exportDiff = () => {
    const diffContent = [
      `--- ${originalTitle}`,
      `+++ ${modifiedTitle}`,
      `@@ -1,${originalCode.split('\n').length} +1,${modifiedCode.split('\n').length} @@`,
      ...changes.map(change => {
        const prefix = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' ';
        return `${prefix}${change.content}`;
      })
    ].join('\n');

    const blob = new Blob([diffContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff_${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-600 bg-green-50 border-green-200';
      case 'removed': return 'text-red-600 bg-red-50 border-red-200';
      case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredChanges = changes.filter(change =>
    searchTerm === '' ||
    change.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    change.originalContent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code Diff Viewer
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center space-x-1 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>+{diffStats.additions}</span>
            </span>
            <span className="flex items-center space-x-1 text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>-{diffStats.deletions}</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>~{diffStats.modifications}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'side-by-side' ? 'inline' : 'side-by-side')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Toggle view mode"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Settings */}
          <div className="relative">
            <button
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation toggle */}
          <button
            onClick={() => setIsNavigationOpen(!isNavigationOpen)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Toggle navigation panel"
          >
            {isNavigationOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Export */}
          <button
            onClick={exportDiff}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Export diff"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={copyDiff}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Copy diff"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main diff editor */}
        <div className="flex-1">
          <DiffEditor
            height="100%"
            language={language}
            original={originalCode}
            modified={modifiedCode}
            onMount={handleEditorDidMount}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              readOnly,
              renderSideBySide: viewMode === 'side-by-side',
              renderWhitespace: showWhitespace ? 'all' : 'none',
              ignoreTrimWhitespace: ignoreWhitespace,
              lineNumbers: showLineNumbers ? 'on' : 'off',
              originalEditable: false,
              fontSize: 14,
              lineHeight: 20
            }}
          />
        </div>

        {/* Navigation panel */}
        {isNavigationOpen && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
            {/* Navigation header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Changes</h4>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={previousChange}
                    disabled={changes.length === 0}
                    className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextChange}
                    disabled={changes.length === 0}
                    className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search changes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Changes list */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredChanges.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No changes found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredChanges.map((change, index) => (
                    <div
                      key={index}
                      onClick={() => navigateToChange(index)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        index === currentChangeIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : getChangeTypeColor(change.type)
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Line {change.lineNumber}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          change.type === 'added' ? 'bg-green-100 text-green-800' :
                          change.type === 'removed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {change.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                        {change.content}
                      </div>

                      {change.originalContent && (
                        <div className="text-sm text-gray-500 dark:text-gray-500 font-mono truncate mt-1">
                          - {change.originalContent}
                        </div>
                      )}

                      {!readOnly && (onAcceptChange || onRejectChange) && (
                        <div className="flex items-center space-x-2 mt-2">
                          {onAcceptChange && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptChange(index);
                              }}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {onRejectChange && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectChange(index);
                              }}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!readOnly && (onApplyAll || onRevertAll) && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {onApplyAll && (
                  <button
                    onClick={onApplyAll}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Apply All Changes
                  </button>
                )}
                {onRevertAll && (
                  <button
                    onClick={onRevertAll}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Revert All Changes
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language.toUpperCase()} • {changes.length} changes
          </span>
          {changes.length > 0 && (
            <span className="text-gray-600 dark:text-gray-400">
              Change {currentChangeIndex + 1} of {changes.length}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">
            {originalTitle} ↔ {modifiedTitle}
          </span>
        </div>
      </div>
    </div>
  );
};
