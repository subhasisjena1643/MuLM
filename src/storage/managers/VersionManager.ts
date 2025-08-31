// @ts-nocheck
/**
 * Version Manager for µLM Grid Storage
 * Handles version control and change tracking for grid cells
 */

import { GridCell, VersionHistory } from '../types/GridTypes';
import { IndexedDBManager } from './IndexedDBManager';

export class VersionManager {
  private dbManager: IndexedDBManager;
  private maxVersionsPerCell = 50;
  private compressionThreshold = 10;

  constructor(dbManager: IndexedDBManager) {
    this.dbManager = dbManager;
  }

  /**
   * Save a new version of a grid cell
   */
  async saveVersion(cellId: string, cellData: GridCell): Promise<void> {
    const version: VersionHistory = {
      cellId,
      version: cellData.version,
      data: this.deepClone(cellData),
      timestamp: new Date(),
      changeType: 'update',
      changes: this.detectChanges(cellId, cellData)
    };

    await this.dbManager.saveVersion(version);
    await this.cleanupOldVersions(cellId);
  }

  /**
   * Get version history for a cell
   */
  async getVersionHistory(cellId: string, limit = 10): Promise<VersionHistory[]> {
    return await this.dbManager.loadVersionHistory(cellId, limit);
  }

  /**
   * Restore a cell to a specific version
   */
  async restoreVersion(cellId: string, version: number): Promise<GridCell | null> {
    const history = await this.dbManager.loadVersionHistory(cellId);
    const targetVersion = history.find(h => h.version === version);
    
    if (!targetVersion) {
      throw new Error(`Version ${version} not found for cell ${cellId}`);
    }

    return this.deepClone(targetVersion.data);
  }

  /**
   * Compare two versions of a cell
   */
  async compareVersions(
    cellId: string, 
    version1: number, 
    version2: number
  ): Promise<{
    added: Record<string, any>;
    removed: Record<string, any>;
    modified: Record<string, { old: any; new: any }>;
  }> {
    const history = await this.dbManager.loadVersionHistory(cellId);
    const v1 = history.find(h => h.version === version1);
    const v2 = history.find(h => h.version === version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return this.diffObjects(v1.data, v2.data);
  }

  /**
   * Get change summary for a cell
   */
  async getChangeSummary(cellId: string): Promise<{
    totalVersions: number;
    firstCreated: Date;
    lastModified: Date;
    changeFrequency: number; // changes per day
    majorChanges: number;
    minorChanges: number;
  }> {
    const history = await this.dbManager.loadVersionHistory(cellId, this.maxVersionsPerCell);
    
    if (history.length === 0) {
      throw new Error(`No version history found for cell ${cellId}`);
    }

    const firstCreated = new Date(Math.min(...history.map(h => h.timestamp.getTime())));
    const lastModified = new Date(Math.max(...history.map(h => h.timestamp.getTime())));
    const daysDiff = (lastModified.getTime() - firstCreated.getTime()) / (1000 * 60 * 60 * 24);
    const changeFrequency = daysDiff > 0 ? history.length / daysDiff : 0;

    let majorChanges = 0;
    let minorChanges = 0;

    for (const version of history) {
      if (version.changes && Object.keys(version.changes).length > 3) {
        majorChanges++;
      } else {
        minorChanges++;
      }
    }

    return {
      totalVersions: history.length,
      firstCreated,
      lastModified,
      changeFrequency,
      majorChanges,
      minorChanges
    };
  }

  /**
   * Create a branch from a specific version
   */
  async createBranch(
    cellId: string, 
    fromVersion: number, 
    branchName: string
  ): Promise<string> {
    const history = await this.dbManager.loadVersionHistory(cellId);
    const sourceVersion = history.find(h => h.version === fromVersion);
    
    if (!sourceVersion) {
      throw new Error(`Version ${fromVersion} not found for cell ${cellId}`);
    }

    const branchId = `${cellId}-branch-${branchName}-${Date.now()}`;
    const branchVersion: VersionHistory = {
      ...sourceVersion,
      cellId: branchId,
      version: 1,
      timestamp: new Date(),
      changeType: 'create',
      changes: { branchedFrom: { cellId, version: fromVersion } }
    };

    await this.dbManager.saveVersion(branchVersion);
    return branchId;
  }

  /**
   * Merge changes from one cell to another
   */
  async mergeCells(
    sourceCellId: string,
    targetCellId: string,
    strategy: 'overwrite' | 'merge' | 'selective' = 'merge'
  ): Promise<GridCell> {
    const sourceHistory = await this.dbManager.loadVersionHistory(sourceCellId, 1);
    const targetHistory = await this.dbManager.loadVersionHistory(targetCellId, 1);

    if (sourceHistory.length === 0 || targetHistory.length === 0) {
      throw new Error('Source or target cell not found');
    }

    const sourceCell = sourceHistory[0].data;
    const targetCell = targetHistory[0].data;

    let mergedCell: GridCell;

    switch (strategy) {
      case 'overwrite':
        mergedCell = this.deepClone(sourceCell);
        mergedCell.id = targetCellId;
        mergedCell.position = targetCell.position;
        break;

      case 'merge':
        mergedCell = this.mergeObjects(targetCell, sourceCell);
        break;

      case 'selective':
        // For selective merge, we only merge non-conflicting changes
        mergedCell = this.selectiveMerge(targetCell, sourceCell);
        break;

      default:
        throw new Error(`Unknown merge strategy: ${strategy}`);
    }

    mergedCell.version++;
    mergedCell.lastModified = new Date();

    return mergedCell;
  }

  /**
   * Compress old versions to save space
   */
  async compressVersions(cellId: string): Promise<number> {
    const history = await this.dbManager.loadVersionHistory(cellId, this.maxVersionsPerCell);
    
    if (history.length <= this.compressionThreshold) {
      return 0; // No compression needed
    }

    // Keep the latest versions and create compressed snapshots for older ones
    const keepRecent = Math.floor(this.compressionThreshold * 0.7);
    const recentVersions = history.slice(0, keepRecent);
    const oldVersions = history.slice(keepRecent);

    // Create compressed snapshots every 10 versions
    const compressionInterval = 10;
    const compressedSnapshots: VersionHistory[] = [];

    for (let i = 0; i < oldVersions.length; i += compressionInterval) {
      const snapshot = oldVersions[i];
      snapshot.changes = { compressed: true, originalCount: compressionInterval };
      compressedSnapshots.push(snapshot);
    }

    // Save compressed versions and remove originals
    for (const snapshot of compressedSnapshots) {
      await this.dbManager.saveVersion(snapshot);
    }

    return oldVersions.length - compressedSnapshots.length;
  }

  private async cleanupOldVersions(cellId: string): Promise<void> {
    const history = await this.dbManager.loadVersionHistory(cellId, this.maxVersionsPerCell + 10);
    
    if (history.length > this.maxVersionsPerCell) {
      // Auto-compress if we have too many versions
      await this.compressVersions(cellId);
    }
  }

  private async detectChanges(cellId: string, newData: GridCell): Promise<Record<string, any> | undefined> {
    try {
      const history = await this.dbManager.loadVersionHistory(cellId, 1);
      if (history.length === 0) {
        return { type: 'initial_creation' };
      }

      const previousData = history[0].data;
      const diff = this.diffObjects(previousData, newData);
      
      return {
        hasChanges: Object.keys(diff.added).length > 0 || 
                   Object.keys(diff.removed).length > 0 || 
                   Object.keys(diff.modified).length > 0,
        ...diff
      };
    } catch (error) {
      console.warn('Failed to detect changes:', error);
      return undefined;
    }
  }

  private diffObjects(obj1: any, obj2: any, path = ''): {
    added: Record<string, any>;
    removed: Record<string, any>;
    modified: Record<string, { old: any; new: any }>;
  } {
    const result = {
      added: {} as Record<string, any>,
      removed: {} as Record<string, any>,
      modified: {} as Record<string, { old: any; new: any }>
    };

    // Find added and modified properties
    for (const key in obj2) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        result.added[currentPath] = obj2[key];
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
                 obj1[key] !== null && obj2[key] !== null) {
        const nested = this.diffObjects(obj1[key], obj2[key], currentPath);
        Object.assign(result.added, nested.added);
        Object.assign(result.removed, nested.removed);
        Object.assign(result.modified, nested.modified);
      } else if (obj1[key] !== obj2[key]) {
        result.modified[currentPath] = { old: obj1[key], new: obj2[key] };
      }
    }

    // Find removed properties
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in obj2)) {
        result.removed[currentPath] = obj1[key];
      }
    }

    return result;
  }

  private mergeObjects(target: any, source: any): any {
    const result = this.deepClone(target);
    
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null && 
          typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.mergeObjects(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private selectiveMerge(target: any, source: any): any {
    const result = this.deepClone(target);
    
    // Only merge non-conflicting changes
    for (const key in source) {
      if (!(key in target)) {
        // Add new properties
        result[key] = source[key];
      } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
        // Merge arrays by combining unique elements
        result[key] = [...new Set([...target[key], ...source[key]])];
      }
      // Skip conflicting properties
    }
    
    return result;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
