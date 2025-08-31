# µLM Elastic Grid Storage System

A sophisticated client-side storage system designed for µLM's AI workflow builder. Provides dynamic grid management, version control, smart caching, and real-time synchronization capabilities.

## 🚀 Features

### Core Grid Management
- **Dynamic Grid Expansion**: Automatically scales based on usage patterns
- **Efficient Block Storage**: Each grid cell stores AI blocks with complete metadata
- **Connection Mapping**: Tracks workflow relationships between blocks
- **Smart Positioning**: Automatic coordinate-based organization

### Performance Optimizations
- **Smart Caching**: LRU + frequency-based cache with 50MB default capacity
- **IndexedDB Storage**: Client-side persistence with efficient querying
- **Automatic Compression**: Version history compression for storage optimization
- **Garbage Collection**: Automated cleanup of unused generated blocks

### Version Control
- **Complete History**: Track all changes to grid cells
- **Branching Support**: Create branches from specific versions
- **Merge Capabilities**: Merge changes between cells with conflict resolution
- **Change Detection**: Detailed diff tracking for all modifications

### Data Management
- **Export/Import**: Portable workspace format with integrity verification
- **Backup/Restore**: Automated backup creation with metadata
- **Real-time Sync**: WebSocket-based synchronization (when available)
- **Cross-workflow Sharing**: Share blocks between different workflows

### Debugging & Visualization
- **Grid Visualizer**: Generate comprehensive visualization data
- **Performance Metrics**: Track execution times, success rates, usage patterns
- **Heat Maps**: Visual representation of grid usage intensity
- **Dependency Graphs**: Analyze block relationships and dependencies

## 📦 Installation

The storage system is integrated into the µLM workspace. No additional installation required.

## 🔧 Basic Usage

### Initialize Grid Storage

```typescript
import { GridStorage } from './storage/GridStorage';

// Create and initialize storage for a workspace
const gridStorage = new GridStorage('workspace-id');
await gridStorage.initialize();
```

### Add Blocks to Grid

```typescript
import { BlockDefinition } from './storage/types/GridTypes';

const blockDefinition: BlockDefinition = {
  id: 'ml-classifier-1',
  type: 'mlAlgorithm',
  name: 'Image Classifier',
  description: 'CNN-based image classification model',
  version: '1.0.0',
  code: 'import tensorflow as tf...',
  config: {
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001
  },
  inputs: [
    {
      id: 'images',
      name: 'Input Images',
      type: 'data',
      dataType: 'tensor',
      required: true
    }
  ],
  outputs: [
    {
      id: 'predictions',
      name: 'Classifications',
      type: 'data',
      dataType: 'array',
      required: true
    }
  ],
  metadata: {
    tags: ['machine-learning', 'vision', 'classification'],
    category: 'ml-models',
    isGenerated: false
  }
};

// Add block to grid position
await gridStorage.setBlock({ x: 5, y: 3 }, blockDefinition);
```

### Create Connections

```typescript
// Connect two blocks in a workflow
await gridStorage.createConnection(
  { x: 5, y: 3 }, // Source block
  { x: 6, y: 3 }, // Target block
  'dataflow'      // Connection type
);
```

### Retrieve Blocks

```typescript
// Get a block from specific position
const cell = await gridStorage.getBlock({ x: 5, y: 3 });
if (cell) {
  console.log('Block:', cell.block.name);
  console.log('Access count:', cell.accessCount);
  console.log('Last modified:', cell.lastModified);
}
```

## 🔄 React Integration

### Using with React Components

```tsx
import React from 'react';
import { GridStorageProvider, useGridStorage } from './storage/GridStorageIntegration';

function App() {
  return (
    <GridStorageProvider workspaceId="my-workspace">
      <WorkspaceComponent />
    </GridStorageProvider>
  );
}

function WorkspaceComponent() {
  const { saveBlock, loadBlock, getStatistics } = useGridStorage();
  
  // Component implementation...
}
```

### Display Grid Statistics

```tsx
import { GridStorageStats } from './storage/GridStorageIntegration';

function Dashboard() {
  return (
    <div>
      <h1>µLM Dashboard</h1>
      <GridStorageStats />
    </div>
  );
}
```

### Backup/Restore Controls

```tsx
import { GridBackupControls } from './storage/GridStorageIntegration';

function WorkspaceSettings() {
  return (
    <div>
      <h2>Workspace Management</h2>
      <GridBackupControls />
    </div>
  );
}
```

## 📊 Advanced Features

### Version Control

```typescript
import { VersionManager } from './storage/managers/VersionManager';

// Get version history for a cell
const history = await versionManager.getVersionHistory('5,3', 10);
console.log(`Found ${history.length} versions`);

// Restore to previous version
const restoredCell = await versionManager.restoreVersion('5,3', 5);

// Compare two versions
const diff = await versionManager.compareVersions('5,3', 5, 7);
console.log('Changes:', diff);

// Create a branch
const branchId = await versionManager.createBranch('5,3', 5, 'experiment-1');
```

### Cache Management

```typescript
import { CacheManager } from './storage/managers/CacheManager';

const cacheManager = new CacheManager(100 * 1024 * 1024); // 100MB cache
await cacheManager.initialize();

// Get cache statistics
const stats = cacheManager.getDetailedStats();
console.log('Hit rate:', stats.hitRate);
console.log('Memory usage:', stats.memoryUsage);

// Optimize cache
cacheManager.optimize();
```

### Garbage Collection

```typescript
import { GarbageCollector } from './storage/managers/GarbageCollector';

// Run garbage collection
const result = await garbageCollector.run();
console.log(`Removed ${result.cellsRemoved} cells`);
console.log(`Freed ${result.memoryFreed} bytes`);

// Preview what would be removed
const preview = await garbageCollector.previewGarbageCollection();
console.log(`${preview.candidates.length} candidates for removal`);
```

### Visualization

```typescript
import { GridVisualizer } from './storage/visualizers/GridVisualizer';

// Generate visualization data
const vizData = gridStorage.getVisualizationData();

// Export for external tools
const graphML = visualizer.exportVisualization('graphml');
const d3Format = visualizer.exportVisualization('d3');

// Generate performance data
const perfData = visualizer.generatePerformanceData();
console.log('Bottlenecks:', perfData.bottlenecks);
```

## 🔧 Configuration

### Storage Configuration

```typescript
const config = {
  // Cache settings
  cacheSize: 50 * 1024 * 1024, // 50MB
  
  // Garbage collection
  gcConfig: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    minAccessCount: 1,
    maxUnusedCells: 100,
    preserveConnected: true
  },
  
  // Version control
  maxVersionsPerCell: 50,
  compressionThreshold: 10
};
```

### WebSocket Integration

```typescript
// Enable real-time synchronization
const gridStorage = new GridStorage('workspace-id');
// WebSocket connection is automatically established if available
// Falls back to offline mode gracefully
```

## 📈 Performance Monitoring

### Built-in Metrics

```typescript
// Get comprehensive statistics
const stats = gridStorage.getStatistics();
console.log('Grid dimensions:', stats.gridDimensions);
console.log('Total cells:', stats.totalCells);
console.log('Cache hit rate:', stats.cacheHitRate);
console.log('Memory usage:', stats.memoryUsage);
```

### Performance Optimization Tips

1. **Cache Warmup**: Preload frequently used blocks
2. **Batch Operations**: Group multiple operations together
3. **Garbage Collection**: Run during idle periods
4. **Version Compression**: Enable for long-running workspaces
5. **Connection Optimization**: Minimize complex dependency chains

## 🔒 Data Integrity

### Backup Strategy

```typescript
// Automatic backup every hour
const backupId = await gridStorage.backup();

// Export for external storage
const exportData = await gridStorage.exportGrid();
// Save exportData to cloud storage, file system, etc.
```

### Error Recovery

```typescript
try {
  await gridStorage.setBlock(position, block);
} catch (error) {
  console.error('Failed to save block:', error);
  // Grid storage automatically handles recovery
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Storage Full**: Increase cache size or run garbage collection
2. **Slow Performance**: Check cache hit rate and optimize
3. **Version Conflicts**: Use merge strategies for resolution
4. **Connection Errors**: Verify WebSocket connectivity

### Debug Mode

```typescript
// Enable detailed logging
localStorage.setItem('mulm-debug', 'true');

// Check storage health
const health = await gridStorage.getStorageHealth();
console.log('Storage health:', health);
```

## 🚀 Future Enhancements

- [ ] Distributed grid storage across multiple devices
- [ ] Advanced AI-powered optimization algorithms
- [ ] Integration with cloud storage providers
- [ ] Real-time collaborative editing
- [ ] Advanced analytics and insights
- [ ] Custom storage adapters

## 📄 License

Part of the µLM AI Workflow Playground - See main project license.

---

For more information and examples, see the [µLM Documentation](../README.md).
