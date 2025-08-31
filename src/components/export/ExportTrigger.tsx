// @ts-nocheck
// Export Trigger Component
// Floating button and menu for easy access to export functionality

import React, { useState } from 'react';
import { 
  Download, 
  Package, 
  Cloud, 
  Server, 
  BookOpen, 
  Smartphone, 
  Container,
  ChevronUp,
  Zap,
  FileDown,
  Share,
  Rocket
} from 'lucide-react';
import { ExportFormat } from '../../export/UniversalExportService';

interface ExportTriggerProps {
  onExportOpen: (format?: ExportFormat) => void;
  isDark: boolean;
  className?: string;
}

interface QuickExportOption {
  id: ExportFormat;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const quickExportOptions: QuickExportOption[] = [
  {
    id: 'python-package',
    name: 'Python Package',
    icon: Package,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Pip-installable library'
  },
  {
    id: 'huggingface-space',
    name: 'HF Space',
    icon: Cloud,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Interactive demo'
  },
  {
    id: 'fastapi-service',
    name: 'API Service',
    icon: Server,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Production API'
  },
  {
    id: 'jupyter-notebook',
    name: 'Notebook',
    icon: BookOpen,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Educational format'
  },
  {
    id: 'edge-deployment',
    name: 'Edge Deploy',
    icon: Smartphone,
    color: 'bg-red-500 hover:bg-red-600',
    description: 'Mobile/IoT optimized'
  }
];

export const ExportTrigger: React.FC<ExportTriggerProps> = ({
  onExportOpen,
  isDark,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickExport = (format: ExportFormat) => {
    setIsExpanded(false);
    onExportOpen(format);
  };

  return (
    <div className={`fixed bottom-24 right-6 z-40 ${className}`}>
      {/* Quick Export Options */}
      {isExpanded && (
        <div className="mb-4 space-y-2">
          {quickExportOptions.map((option, index) => {
            const Icon = option.icon;
            
            return (
              <div
                key={option.id}
                className="flex items-center justify-end animate-in slide-in-from-right duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Tooltip */}
                <div className="mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{option.name}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {option.description}
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleQuickExport(option.id)}
                  className={`group p-3 rounded-full shadow-lg transition-all duration-200 ${option.color} text-white`}
                  title={`Export as ${option.name}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          {/* Separator */}
          <div className="flex justify-end">
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mr-6"></div>
          </div>

          {/* All Formats Button */}
          <div className="flex items-center justify-end">
            <div className="mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="font-medium">All Formats</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Full export wizard
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsExpanded(false);
                onExportOpen();
              }}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all duration-200"
              title="Open Export Wizard"
            >
              <FileDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Export Button */}
      <div className="relative">
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isExpanded || isHovered
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-110'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          } text-white group`}
        >
          <div className="relative">
            <Download 
              className={`w-6 h-6 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
            
            {/* Animated background pulse */}
            <div className={`absolute inset-0 rounded-full bg-white opacity-20 scale-0 ${
              isHovered ? 'animate-ping' : ''
            }`}></div>
          </div>

          {/* Expansion indicator */}
          <ChevronUp 
            className={`absolute -top-1 -right-1 w-4 h-4 bg-white text-blue-600 rounded-full p-0.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Tooltip for main button */}
        {isHovered && !isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-blue-400" />
              <span>Export & Deploy</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              Export workflow to multiple formats
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        )}

        {/* Pulsing indicator for attention */}
        <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 ${
          !isExpanded && !isHovered ? 'animate-pulse' : 'opacity-0'
        } transition-opacity duration-300`}></div>
      </div>

      {/* Background overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
