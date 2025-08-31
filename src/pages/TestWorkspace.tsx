import React from 'react';
import { useLocation } from 'react-router-dom';

interface WorkspaceProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

const TestWorkspace: React.FC<WorkspaceProps> = ({ isDark, onThemeToggle }) => {
  const location = useLocation();
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">🔧 Workspace Test Page</h1>
        <p className="text-lg mb-4">This is a test workspace to verify basic functionality.</p>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Theme Status</h2>
            <p>Current theme: {isDark ? 'Dark' : 'Light'}</p>
            <button 
              onClick={onThemeToggle}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Toggle Theme
            </button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Location State</h2>
            <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(location.state, null, 2)}
            </pre>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Navigation Test</h2>
            <a href="/" className="text-blue-500 hover:underline">
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWorkspace;
