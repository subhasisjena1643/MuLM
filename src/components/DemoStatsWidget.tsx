import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  Users, 
  TrendingUp, 
  Award,
  DollarSign,
  Activity
} from 'lucide-react';

interface DemoStatsWidgetProps {
  isDemoMode?: boolean;
  className?: string;
}

interface DemoStats {
  workflowsGenerated: number;
  totalExecutionTime: number;
  successRate: number;
  activeUsers: number;
  costSavings: number;
  performanceBoost: number;
}

export const DemoStatsWidget: React.FC<DemoStatsWidgetProps> = ({ 
  isDemoMode = false,
  className = ''
}) => {
  const [stats, setStats] = useState<DemoStats>({
    workflowsGenerated: 0,
    totalExecutionTime: 0,
    successRate: 0,
    activeUsers: 0,
    costSavings: 0,
    performanceBoost: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  // Simulate real-time stats for demo
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        workflowsGenerated: prev.workflowsGenerated + Math.floor(Math.random() * 3),
        totalExecutionTime: prev.totalExecutionTime + Math.random() * 0.5,
        successRate: Math.min(99.9, prev.successRate + Math.random() * 0.1),
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        costSavings: prev.costSavings + Math.random() * 50,
        performanceBoost: Math.min(95, prev.performanceBoost + Math.random() * 0.5)
      }));
    }, 2000);

    // Initialize with demo values
    setStats({
      workflowsGenerated: 1247,
      totalExecutionTime: 89.3,
      successRate: 98.7,
      activeUsers: 23,
      costSavings: 15420,
      performanceBoost: 87.5
    });

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const statItems = [
    {
      icon: Zap,
      label: 'Workflows Generated',
      value: stats.workflowsGenerated.toLocaleString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12.5%'
    },
    {
      icon: Clock,
      label: 'Avg Execution Time',
      value: `${stats.totalExecutionTime.toFixed(1)}s`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '-23.4%'
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+0.3%'
    },
    {
      icon: Users,
      label: 'Active Users',
      value: stats.activeUsers.toString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '+5'
    },
    {
      icon: DollarSign,
      label: 'Cost Savings',
      value: `$${(stats.costSavings).toLocaleString()}`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: '+$1.2K'
    },
    {
      icon: Activity,
      label: 'Performance Boost',
      value: `${stats.performanceBoost.toFixed(1)}%`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '+2.1%'
    }
  ];

  if (!isDemoMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Demo Stats
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time performance metrics
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${item.bgColor} dark:bg-gray-600`}>
                <item.icon className={`w-4 h-4 ${item.color} dark:text-gray-300`} />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {item.trend}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
      >
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Hackathon Demo Mode Active
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Showcasing µLM AI Playground capabilities with simulated data
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
              98.7%
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Demo Score
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
