/**
 * IndexedDB Manager for µLM Grid Storage
 * Handles client-side persistence with efficient querying
 */

import { GridCell, GridMetadata, WorkflowConnection, GridExport, VersionHistory, BackupMetadata } from '../types/GridTypes';

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly version = 1;

  constructor(workspaceId: string) {
    this.dbName = `mulm-grid-${workspaceId}`;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Grid cells store
    if (!db.objectStoreNames.contains('cells')) {
      const cellStore = db.createObjectStore('cells', { keyPath: 'id' });
      cellStore.createIndex('position', ['position.x', 'position.y'], { unique: true });
      cellStore.createIndex('type', 'block.type');
      cellStore.createIndex('category', 'metadata.category');
      cellStore.createIndex('lastAccessed', 'lastAccessed');
      cellStore.createIndex('accessCount', 'accessCount');
    }

    // Connections store
    if (!db.objectStoreNames.contains('connections')) {
      const connStore = db.createObjectStore('connections', { keyPath: 'id' });
      connStore.createIndex('from', 'from');
      connStore.createIndex('to', 'to');
      connStore.createIndex('type', 'type');
    }

    // Metadata store
    if (!db.objectStoreNames.contains('metadata')) {
      db.createObjectStore('metadata', { keyPath: 'id' });
    }

    // Version history store
    if (!db.objectStoreNames.contains('versions')) {
      const versionStore = db.createObjectStore('versions', { keyPath: ['cellId', 'version'] });
      versionStore.createIndex('cellId', 'cellId');
      versionStore.createIndex('timestamp', 'timestamp');
    }

    // Backups store
    if (!db.objectStoreNames.contains('backups')) {
      const backupStore = db.createObjectStore('backups', { keyPath: 'id' });
      backupStore.createIndex('created', 'metadata.created');
      backupStore.createIndex('workspaceId', 'metadata.workspaceId');
    }
  }

  async saveCell(cell: GridCell): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cells'], 'readwrite');
      const store = transaction.objectStore('cells');
      const request = store.put(cell);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadCell(cellId: string): Promise<GridCell | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cells'], 'readonly');
      const store = transaction.objectStore('cells');
      const request = store.get(cellId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async loadAllCells(): Promise<GridCell[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cells'], 'readonly');
      const store = transaction.objectStore('cells');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteCell(cellId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cells'], 'readwrite');
      const store = transaction.objectStore('cells');
      const request = store.delete(cellId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveConnection(connection: WorkflowConnection): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['connections'], 'readwrite');
      const store = transaction.objectStore('connections');
      const request = store.put(connection);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadAllConnections(): Promise<WorkflowConnection[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['connections'], 'readonly');
      const store = transaction.objectStore('connections');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveMetadata(metadata: GridMetadata): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put(metadata);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadMetadata(): Promise<GridMetadata | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result;
        resolve(results.length > 0 ? results[0] : null);
      };
    });
  }

  async saveVersion(version: VersionHistory): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['versions'], 'readwrite');
      const store = transaction.objectStore('versions');
      const request = store.put(version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadVersionHistory(cellId: string, limit = 10): Promise<VersionHistory[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['versions'], 'readonly');
      const store = transaction.objectStore('versions');
      const index = store.index('cellId');
      const request = index.getAll(cellId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
        resolve(results);
      };
    });
  }

  async saveBackup(backupId: string, exportData: GridExport): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const backup = {
      id: backupId,
      data: exportData,
      metadata: {
        id: backupId,
        workspaceId: exportData.metadata.id,
        created: new Date(),
        size: JSON.stringify(exportData).length
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['backups'], 'readwrite');
      const store = transaction.objectStore('backups');
      const request = store.put(backup);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadBackup(backupId: string): Promise<GridExport | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['backups'], 'readonly');
      const store = transaction.objectStore('backups');
      const request = store.get(backupId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  async listBackups(): Promise<BackupMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['backups'], 'readonly');
      const store = transaction.objectStore('backups');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.map(backup => backup.metadata);
        resolve(results);
      };
    });
  }

  async searchCells(query: {
    type?: string;
    category?: string;
    minAccessCount?: number;
    maxAge?: number;
  }): Promise<GridCell[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cells'], 'readonly');
      const store = transaction.objectStore('cells');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let results = request.result;

        // Apply filters
        if (query.type) {
          results = results.filter(cell => cell.block.type === query.type);
        }

        if (query.category) {
          results = results.filter(cell => cell.metadata.category === query.category);
        }

        if (query.minAccessCount !== undefined) {
          results = results.filter(cell => cell.accessCount >= query.minAccessCount!);
        }

        if (query.maxAge !== undefined) {
          const cutoffTime = Date.now() - query.maxAge;
          results = results.filter(cell => cell.lastAccessed.getTime() > cutoffTime);
        }

        resolve(results);
      };
    });
  }

  async getStorageSize(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      if ('estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          resolve(estimate.usage || 0);
        });
      } else {
        // Fallback estimation
        resolve(0);
      }
    });
  }

  async cleanupOldVersions(maxAge: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffTime = Date.now() - maxAge;
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['versions'], 'readwrite');
      const store = transaction.objectStore('versions');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(new Date(cutoffTime)));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
