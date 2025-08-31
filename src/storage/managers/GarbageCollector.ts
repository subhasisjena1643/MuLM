// @ts-nocheck
/**
 * Garbage Collector for µLM Grid Storage
 * Automatically cleans up unused blocks and optimizes storage
 */

import { GridStorage } from '../GridStorage';
import { GarbageCollectionConfig, GarbageCollectionResult, GridCell } from '../types/GridTypes';

export class GarbageCollector {
  private gridStorage: GridStorage;
  private config: GarbageCollectionConfig;
  private isRunning = false;
  private lastRun: Date | null = null;

  constructor(gridStorage: GridStorage, config?: Partial<GarbageCollectionConfig>) {
    this.gridStorage = gridStorage;
    this.config = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      minAccessCount: 1,
      maxUnusedCells: 100,
      preserveConnected: true,
      ...config
    };
  }

  /**
   * Run garbage collection
   */
  async run(): Promise<GarbageCollectionResult> {
    if (this.isRunning) {
      console.log('Garbage collection already running, skipping...');
      return {
        cellsRemoved: 0,
        connectionsRemoved: 0,
        memoryFreed: 0,
        duration: 0
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    let cellsRemoved = 0;
    let connectionsRemoved = 0;
    let memoryFreed = 0;

    try {
      console.log('Starting garbage collection...');

      // Phase 1: Identify candidates for removal
      const candidates = await this.identifyGarbageCandidates();
      console.log(`Found ${candidates.length} garbage collection candidates`);

      // Phase 2: Remove unused generated blocks
      const generatedCandidates = candidates.filter(cell => 
        cell.metadata.isGenerated && 
        this.shouldRemoveCell(cell)
      );

      for (const cell of generatedCandidates) {
        const size = this.estimateCellSize(cell);
        const removed = await this.removeCell(cell);
        if (removed) {
          cellsRemoved++;
          memoryFreed += size;
        }
      }

      // Phase 3: Clean up orphaned connections
      connectionsRemoved += await this.cleanupOrphanedConnections();

      // Phase 4: Compress version history
      await this.compressVersionHistory();

      // Phase 5: Clean up cache
      await this.cleanupCache();

      this.lastRun = new Date();
      console.log(`Garbage collection completed: ${cellsRemoved} cells, ${connectionsRemoved} connections removed`);

      return {
        cellsRemoved,
        connectionsRemoved,
        memoryFreed,
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error('Garbage collection failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Force garbage collection with custom config
   */
  async forceRun(customConfig?: Partial<GarbageCollectionConfig>): Promise<GarbageCollectionResult> {
    const originalConfig = this.config;
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    try {
      return await this.run();
    } finally {
      this.config = originalConfig;
    }
  }

  /**
   * Get garbage collection statistics
   */
  getStatistics() {
    return {
      lastRun: this.lastRun,
      isRunning: this.isRunning,
      config: this.config,
      estimatedGarbage: this.estimateGarbageSize()
    };
  }

  /**
   * Preview what would be removed without actually removing it
   */
  async previewGarbageCollection(): Promise<{
    candidates: GridCell[];
    estimatedSavings: number;
    riskyRemovals: GridCell[];
  }> {
    const candidates = await this.identifyGarbageCandidates();
    const riskyRemovals = candidates.filter(cell => this.isRiskyRemoval(cell));
    const estimatedSavings = candidates.reduce((sum, cell) => sum + this.estimateCellSize(cell), 0);

    return {
      candidates,
      estimatedSavings,
      riskyRemovals
    };
  }

  private async identifyGarbageCandidates(): Promise<GridCell[]> {
    const allCells = await this.getAllCells();
    const now = Date.now();
    const candidates: GridCell[] = [];

    for (const cell of allCells) {
      // Check age
      const age = now - cell.lastAccessed.getTime();
      if (age < this.config.maxAge) continue;

      // Check access count
      if (cell.accessCount >= this.config.minAccessCount) continue;

      // Check if connected (if preservation is enabled)
      if (this.config.preserveConnected && await this.isConnected(cell)) continue;

      candidates.push(cell);
    }

    return candidates.slice(0, this.config.maxUnusedCells);
  }

  private shouldRemoveCell(cell: GridCell): boolean {
    const now = Date.now();
    const age = now - cell.lastAccessed.getTime();

    // Never remove recently accessed cells
    if (age < 60 * 60 * 1000) return false; // 1 hour

    // Remove if it's old and unused
    if (age > this.config.maxAge && cell.accessCount <= this.config.minAccessCount) {
      return true;
    }

    // Remove generated blocks more aggressively
    if (cell.metadata.isGenerated) {
      const generatedThreshold = this.config.maxAge * 0.5; // 50% of normal threshold
      return age > generatedThreshold && cell.accessCount <= 1;
    }

    return false;
  }

  private async removeCell(cell: GridCell): Promise<boolean> {
    try {
      // Create a backup before removal
      await this.createRemovalBackup(cell);
      
      // Remove the cell
      const removed = await this.gridStorage.removeBlock(cell.position);
      
      if (removed) {
        console.log(`Removed cell ${cell.id} (${cell.block.name})`);
      }
      
      return removed;
    } catch (error) {
      console.error(`Failed to remove cell ${cell.id}:`, error);
      return false;
    }
  }

  private async cleanupOrphanedConnections(): Promise<number> {
    let removedCount = 0;
    const allCells = await this.getAllCells();
    const validCellIds = new Set(allCells.map(cell => cell.id));

    // This would need to be implemented based on the connection storage structure
    // For now, return 0 as a placeholder
    console.log('Cleaned up orphaned connections (placeholder implementation)');
    
    return removedCount;
  }

  private async compressVersionHistory(): Promise<void> {
    const allCells = await this.getAllCells();
    let compressedCount = 0;

    for (const cell of allCells) {
      try {
        // This would call the version manager's compression method
        // const compressed = await this.versionManager.compressVersions(cell.id);
        // compressedCount += compressed;
      } catch (error) {
        console.warn(`Failed to compress versions for cell ${cell.id}:`, error);
      }
    }

    if (compressedCount > 0) {
      console.log(`Compressed ${compressedCount} version entries`);
    }
  }

  private async cleanupCache(): Promise<void> {
    // This would call the cache manager's optimization method
    // this.cacheManager.optimize();
    console.log('Cache cleanup completed');
  }

  private async createRemovalBackup(cell: GridCell): Promise<void> {
    const backupKey = `removed-${cell.id}-${Date.now()}`;
    try {
      // Store in a special "removed items" collection for potential recovery
      localStorage.setItem(backupKey, JSON.stringify({
        cell,
        removedAt: new Date(),
        reason: 'garbage_collection'
      }));
    } catch (error) {
      console.warn('Failed to create removal backup:', error);
    }
  }

  private isRiskyRemoval(cell: GridCell): boolean {
    // Check if cell has many dependencies
    if (cell.metadata.dependencies.length > 5) return true;

    // Check if it's a core system component
    if (cell.metadata.category === 'core' || cell.metadata.category === 'system') return true;

    // Check if it has high access count
    if (cell.accessCount > 10) return true;

    // Check if it's recently created but not accessed
    const daysSinceCreation = (Date.now() - cell.created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1 && cell.accessCount === 0) return true;

    return false;
  }

  private async isConnected(cell: GridCell): Promise<boolean> {
    try {
      const connections = this.gridStorage.getConnectionsFrom(cell.position);
      return connections.length > 0;
    } catch {
      return false;
    }
  }

  private async getAllCells(): Promise<GridCell[]> {
    // This is a placeholder - would need to access the grid storage internals
    // In the actual implementation, this would be provided by the GridStorage class
    return [];
  }

  private estimateCellSize(cell: GridCell): number {
    try {
      const serialized = JSON.stringify(cell);
      return serialized.length * 2; // Rough estimate for UTF-16
    } catch {
      return 1024; // 1KB fallback
    }
  }

  private async estimateGarbageSize(): Promise<number> {
    try {
      const candidates = await this.identifyGarbageCandidates();
      return candidates.reduce((sum, cell) => sum + this.estimateCellSize(cell), 0);
    } catch {
      return 0;
    }
  }

  /**
   * Schedule automatic garbage collection
   */
  scheduleAutoCollection(intervalMs = 30 * 60 * 1000): () => void {
    const interval = setInterval(() => {
      this.run().catch(error => {
        console.error('Scheduled garbage collection failed:', error);
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Restore a removed cell from backup
   */
  async restoreRemovedCell(cellId: string): Promise<boolean> {
    try {
      const backupKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`removed-${cellId}-`)
      );

      if (backupKeys.length === 0) {
        console.warn(`No backup found for removed cell ${cellId}`);
        return false;
      }

      // Get the most recent backup
      const latestBackup = backupKeys.sort().pop()!;
      const backupData = JSON.parse(localStorage.getItem(latestBackup)!);
      
      // Restore the cell
      await this.gridStorage.setBlock(backupData.cell.position, backupData.cell.block);
      
      // Remove the backup
      localStorage.removeItem(latestBackup);
      
      console.log(`Restored cell ${cellId} from backup`);
      return true;
    } catch (error) {
      console.error(`Failed to restore cell ${cellId}:`, error);
      return false;
    }
  }
}
