import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause,
  Settings,
  Zap,
  Award,
  MousePointer
} from 'lucide-react';

interface PresentationModeProps {
  isActive: boolean;
  onToggle: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ 
  isActive, 
  onToggle 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [demoTimer, setDemoTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Timer for demo tracking
  useEffect(() => {
    let interval: number;
    if (isTimerRunning && isActive) {
      interval = setInterval(() => {
        setDemoTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isActive]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: number;
    if (isActive) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isActive, showControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'o':
        case 'O':
          setIsOfflineMode(!isOfflineMode);
          break;
        case 'r':
        case 'R':
          resetDemo();
          break;
        case ' ':
          event.preventDefault();
          setIsTimerRunning(!isTimerRunning);
          break;
        case 'Escape':
          onToggle();
          break;
        case '=':
        case '+':
          setFontSize(prev => Math.min(150, prev + 10));
          break;
        case '-':
          setFontSize(prev => Math.max(80, prev - 10));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, isOfflineMode, isTimerRunning, onToggle]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetDemo = () => {
    setDemoTimer(0);
    setIsTimerRunning(false);
    setFontSize(100);
    // Reset any demo data here
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90"
        style={{ fontSize: `${fontSize}%` }}
      >
        {/* Presentation Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Demo Timer */}
          <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="font-mono text-lg">{formatTime(demoTimer)}</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {/* Offline Mode */}
            {isOfflineMode && (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
                <WifiOff size={16} />
                <span className="text-sm">Offline Mode</span>
              </div>
            )}

            {/* Fullscreen Indicator */}
            {isFullscreen && (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
                <Monitor size={16} />
                <span className="text-sm">Fullscreen</span>
              </div>
            )}

            {/* Demo Mode Indicator */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
              <Award size={16} />
              <span className="text-sm">Demo Mode</span>
            </div>
          </div>

          {/* Font Size Indicator */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded-lg">
            <span className="text-sm">Font: {fontSize}%</span>
          </div>

          {/* Network Status */}
          <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg flex items-center space-x-2">
            {isOfflineMode ? (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-sm">Offline</span>
              </>
            ) : (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-sm">Online</span>
              </>
            )}
          </div>
        </div>

        {/* Floating Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md rounded-2xl p-4 pointer-events-auto"
              onMouseEnter={() => setShowControls(true)}
            >
              <div className="flex items-center space-x-4">
                {/* Timer Controls */}
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>

                {/* Reset Demo */}
                <button
                  onClick={resetDemo}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  <span>{isFullscreen ? 'Exit' : 'Full'}</span>
                </button>

                {/* Offline Mode Toggle */}
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isOfflineMode 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isOfflineMode ? <WifiOff size={16} /> : <Wifi size={16} />}
                  <span>{isOfflineMode ? 'Online' : 'Offline'}</span>
                </button>

                {/* Font Size Controls */}
                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                  <button
                    onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                    className="text-white hover:text-gray-300 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="text-white text-sm min-w-[3rem] text-center">
                    {fontSize}%
                  </span>
                  <button
                    onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                    className="text-white hover:text-gray-300 text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Exit Presentation Mode */}
                <button
                  onClick={onToggle}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Settings size={16} />
                  <span>Exit</span>
                </button>
              </div>

              {/* Quick Shortcuts Help */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>F - Fullscreen</div>
                  <div>O - Offline Mode</div>
                  <div>R - Reset Demo</div>
                  <div>Space - Start/Pause</div>
                  <div>+/- - Font Size</div>
                  <div>ESC - Exit</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mouse Indicator for Presentations */}
        <div className="absolute inset-0 pointer-events-none">
          <MousePointer 
            className="absolute transition-all duration-100 text-yellow-400" 
            size={24}
            style={{
              left: 'var(--mouse-x, 50%)',
              top: 'var(--mouse-y, 50%)',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Instruction Overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showControls ? 1 : 0.3 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white pointer-events-none"
          onMouseMove={() => setShowControls(true)}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Presentation Mode Active</h1>
          <p className="text-xl text-gray-300">
            Move mouse to show controls • ESC to exit
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Perfect for hackathon demos and presentations
          </div>
        </motion.div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
