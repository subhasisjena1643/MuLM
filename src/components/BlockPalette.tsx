/**
 * Block Palette Component
 * Displays available AI workflow blocks organized by category
 * Similar to n8n's node palette or Blender's node editor
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { BlocksByCategory } from '../storage/blocks/AIWorkflowBlocks';
import { BlockDefinition } from '../storage/types/GridTypes';

interface BlockPaletteProps {
  onBlockSelect: (block: BlockDefinition) => void;
  onBlockDrag: (block: BlockDefinition, event: React.DragEvent) => void;
  blocks?: BlockDefinition[]; // Optional blocks array to override default blocks
  className?: string;
}

interface BlockItemProps {
  block: BlockDefinition;
  onSelect: (block: BlockDefinition) => void;
  onDrag: (block: BlockDefinition, event: React.DragEvent) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ block, onSelect, onDrag }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={`border border-gray-200 rounded-lg mb-2 hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white ${isDragging ? 'opacity-50 scale-95' : ''}`}>
      <div
        className="p-3 cursor-grab active:cursor-grabbing select-none"
        draggable
        onDragStart={(e) => {
          console.log('🎯 Starting drag for block:', block.name);
          setIsDragging(true);
          onDrag(block, e);
        }}
        onDragEnd={() => {
          console.log('🏁 Drag ended for block:', block.name);
          setIsDragging(false);
        }}
        onClick={() => onSelect(block)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {block.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
                {block.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {block.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              {block.category}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Inputs:</span>
                <span className="ml-1 font-medium">{block.inputs.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Outputs:</span>
                <span className="ml-1 font-medium">{block.outputs.length}</span>
              </div>
            </div>
            {block.tags && block.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {block.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: string;
  blocks: Record<string, BlockDefinition>;
  onBlockSelect: (block: BlockDefinition) => void;
  onBlockDrag: (block: BlockDefinition, event: React.DragEvent) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  blocks,
  onBlockSelect,
  onBlockDrag
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const blockArray = Object.values(blocks);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'input': return '📥';
      case 'mlAlgorithm': return '🤖';
      case 'neuralNetwork': return '🧠';
      case 'expert': return '🎯';
      case 'utility': return '�';
      case 'output': return '📊';
      default: return '📁';
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getCategoryIcon(category)}</span>
          <div className="text-left">
            <span className="font-medium text-gray-900 text-sm capitalize">{category}</span>
            <div className="text-xs text-gray-500">{blockArray.length} blocks</div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-1 pl-4">
          {blockArray.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              onSelect={onBlockSelect}
              onDrag={onBlockDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  onBlockSelect,
  onBlockDrag,
  blocks, // Optional blocks array
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Convert blocks array to category format if provided
  const blocksSource = useMemo(() => {
    if (blocks && blocks.length > 0) {
      // Group blocks by category
      const groupedBlocks: Record<string, Record<string, BlockDefinition>> = {};
      blocks.forEach(block => {
        const category = block.category || 'expert';
        if (!groupedBlocks[category]) {
          groupedBlocks[category] = {};
        }
        groupedBlocks[category][block.id] = block;
      });
      return groupedBlocks;
    }
    return BlocksByCategory;
  }, [blocks]);

  const filteredBlocks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return blocksSource;

    const filtered: Record<string, Record<string, BlockDefinition>> = {};
    Object.entries(blocksSource).forEach(([category, blockRecord]) => {
      const matchingBlocks: Record<string, BlockDefinition> = {};
      Object.entries(blockRecord).forEach(([blockId, block]) => {
        if (
          block.name.toLowerCase().includes(query) ||
          block.description.toLowerCase().includes(query) ||
          block.type?.toLowerCase().includes(query) ||
          block.category.toLowerCase().includes(query)
        ) {
          matchingBlocks[blockId] = block;
        }
      });
      if (Object.keys(matchingBlocks).length > 0) {
        filtered[category] = matchingBlocks;
      }
    });
    return filtered;
  }, [searchQuery, blocksSource]);

  const totalBlocks = Object.values(blocksSource).reduce((total, categoryBlocks) => 
    total + Object.keys(categoryBlocks).length, 0
  );

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Blocks</h2>
          <span className="text-sm text-gray-500">
            {totalBlocks} available
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(filteredBlocks).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2 text-2xl">🔍</div>
            <p className="text-gray-500 text-sm">No blocks found</p>
          </div>
        ) : (
          Object.entries(filteredBlocks).map(([category, blocks]) => (
            <CategorySection
              key={category}
              category={category}
              blocks={blocks}
              onBlockSelect={onBlockSelect}
              onBlockDrag={onBlockDrag}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Block</span>
        </button>
      </div>
    </div>
  );
};

export default BlockPalette;
