import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Star, Eye, Clock, Users, Zap, Award, Filter, Search } from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number;
  downloads: number;
  estimatedTime: string;
  author: string;
  tags: string[];
  preview: string;
  isDemo: boolean;
  isFeatured: boolean;
  thumbnail: string;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'smart-doc-analyzer',
    name: '🏆 Smart Document Analyzer',
    description: 'PDF → Text Extraction → Summarization → Sentiment → Insights',
    category: 'Document Processing',
    difficulty: 'Advanced',
    rating: 4.9,
    downloads: 1247,
    estimatedTime: '2-3 min',
    author: 'µLM Team',
    tags: ['PDF', 'NLP', 'Summarization', 'Sentiment', 'Demo'],
    preview: 'Extract insights from any document with AI-powered analysis',
    isDemo: true,
    isFeatured: true,
    thumbnail: '📄'
  },
  {
    id: 'multimodal-search',
    name: '🔍 Multimodal Search Engine',
    description: 'Image + Text → Embedding → Similarity → Ranking → Results',
    category: 'Search & Retrieval',
    difficulty: 'Expert',
    rating: 4.8,
    downloads: 892,
    estimatedTime: '3-4 min',
    author: 'µLM Team',
    tags: ['Vision', 'Search', 'Embedding', 'Multimodal', 'Demo'],
    preview: 'Search through images and text using advanced AI embeddings',
    isDemo: true,
    isFeatured: true,
    thumbnail: '🔍'
  },
  {
    id: 'content-moderator',
    name: '🛡️ AI Content Moderator',
    description: 'Text/Image → Classification → Toxicity Detection → Action Router',
    category: 'Safety & Compliance',
    difficulty: 'Advanced',
    rating: 4.7,
    downloads: 634,
    estimatedTime: '2-3 min',
    author: 'µLM Team',
    tags: ['Moderation', 'Safety', 'Classification', 'Toxicity', 'Demo'],
    preview: 'Automatically moderate content with AI safety checks',
    isDemo: true,
    isFeatured: true,
    thumbnail: '🛡️'
  },
  {
    id: 'chatbot-builder',
    name: '🤖 Intelligent Chatbot',
    description: 'Build conversational AI with memory and context understanding',
    category: 'Conversational AI',
    difficulty: 'Intermediate',
    rating: 4.6,
    downloads: 2134,
    estimatedTime: '1-2 min',
    author: 'Community',
    tags: ['Chatbot', 'Conversation', 'Memory', 'Context'],
    preview: 'Create smart chatbots with persistent memory',
    isDemo: false,
    isFeatured: true,
    thumbnail: '🤖'
  },
  {
    id: 'image-generator',
    name: '🎨 AI Image Generator',
    description: 'Text prompts to stunning AI-generated images with style control',
    category: 'Creative AI',
    difficulty: 'Beginner',
    rating: 4.5,
    downloads: 3021,
    estimatedTime: '1 min',
    author: 'Community',
    tags: ['Image Generation', 'Creative', 'Art', 'Style'],
    preview: 'Generate beautiful images from text descriptions',
    isDemo: false,
    isFeatured: false,
    thumbnail: '🎨'
  },
  {
    id: 'fraud-detection',
    name: '🔒 Fraud Detection System',
    description: 'Real-time transaction monitoring with anomaly detection',
    category: 'Security',
    difficulty: 'Advanced',
    rating: 4.4,
    downloads: 567,
    estimatedTime: '3-4 min',
    author: 'Expert User',
    tags: ['Security', 'Anomaly', 'Finance', 'Real-time'],
    preview: 'Detect fraudulent activities with ML algorithms',
    isDemo: false,
    isFeatured: false,
    thumbnail: '🔒'
  }
];

interface WorkflowTemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export const WorkflowTemplateGallery: React.FC<WorkflowTemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', ...Array.from(new Set(workflowTemplates.map(t => t.category)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const filteredTemplates = workflowTemplates
    .filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating;
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'newest':
          return b.downloads - a.downloads; // Placeholder for creation date
        default:
          return 0;
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Intermediate': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'Advanced': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'Expert': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">🎯 Workflow Template Gallery</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                ×
              </button>
            </div>
            <p className="text-blue-100">
              Choose from expertly crafted workflow templates to jumpstart your AI projects
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 border-b dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                    template.isDemo 
                      ? 'border-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  } overflow-hidden cursor-pointer`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Featured Badge */}
                  {template.isFeatured && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Award size={12} />
                        <span>Featured</span>
                      </div>
                    </div>
                  )}

                  {/* Demo Badge */}
                  {template.isDemo && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Zap size={12} />
                        <span>Demo</span>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <div className="text-4xl">{template.thumbnail}</div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        {renderStars(template.rating)}
                        <span className="ml-1">{template.rating}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Download size={12} />
                          <span>{template.downloads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty & Category */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {template.category}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Author */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {template.author}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <motion.button
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Use Template
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
