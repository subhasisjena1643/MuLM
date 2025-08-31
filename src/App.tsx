import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Homepage } from './pages/Homepage';
import EnhancedMoEWorkspace from './pages/EnhancedMoEWorkspace';
import TestWorkspace from './pages/TestWorkspace';
import TestSimple from './pages/TestSimple';
import MinimalWorkspace from './pages/MinimalWorkspace';
import ErrorBoundary from './components/ErrorBoundary';

// Simple theme hook
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return { isDark, toggleTheme };
};

function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Router>
      <div className={`App ${isDark ? 'dark' : ''}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Homepage 
                isDark={isDark} 
                onThemeToggle={toggleTheme} 
              />
            } 
          />
          <Route 
            path="/workspace" 
            element={
              <ErrorBoundary>
                <EnhancedMoEWorkspace 
                  isDark={isDark} 
                  onThemeToggle={toggleTheme} 
                />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/enhanced-workspace" 
            element={
              <ErrorBoundary>
                <EnhancedMoEWorkspace 
                  isDark={isDark} 
                  onThemeToggle={toggleTheme} 
                />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/test-workspace" 
            element={
              <TestWorkspace 
                isDark={isDark} 
                onThemeToggle={toggleTheme} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
