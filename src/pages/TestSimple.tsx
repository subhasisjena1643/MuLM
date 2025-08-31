import React from 'react';

interface TestSimpleProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

const TestSimple: React.FC<TestSimpleProps> = ({ isDark, onThemeToggle }) => {
  console.log('🟢 TestSimple component rendered successfully');
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Test Simple Component
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mt-4">
        This is a simple test component to verify routing works.
      </p>
      <button 
        onClick={onThemeToggle}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Toggle Theme
      </button>
      <p className="mt-4">
        Current mode: {isDark ? 'Dark' : 'Light'}
      </p>
    </div>
  );
};

export default TestSimple;
