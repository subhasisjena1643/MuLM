import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-6">
              🚨 Workspace Component Error
            </h1>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">
                Error Details:
              </h2>
              
              {this.state.error && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 dark:text-red-300 mb-2">
                    Error Message:
                  </h3>
                  <pre className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-3 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              {this.state.error?.stack && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 dark:text-red-300 mb-2">
                    Stack Trace:
                  </h3>
                  <pre className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-3 rounded overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 dark:text-red-300 mb-2">
                    Component Stack:
                  </h3>
                  <pre className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-3 rounded overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                🔄 Reload Page
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                ← Go Back
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                🔨 Try Again
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 Debugging Tips:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Check the browser console for additional error details</li>
                <li>• Verify all required dependencies are installed</li>
                <li>• Check if there are any missing imports or services</li>
                <li>• Try refreshing the page or clearing browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
