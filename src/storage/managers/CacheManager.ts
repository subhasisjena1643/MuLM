/**
 * Smart Cache Manager for µLM Grid Storage
 * Implements LRU eviction with frequency-based optimization
 */

import { CacheEntry, CacheStats } from '../types/GridTypes';

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder = new Map<string, number>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalSize: 0,
    maxSize: 50 * 1024 * 1024, // 50MB default
    evictions: 0
  };
  private accessCounter = 0;

  constructor(maxSize = 50 * 1024 * 1024) {
    this.stats.maxSize = maxSize;
  }

  async initialize(): Promise<void> {
    // Load frequently accessed items from localStorage if available
    try {
      const savedFrequency = localStorage.getItem('mulm-cache-frequency');
      if (savedFrequency) {
        const frequencyData = JSON.parse(savedFrequency);
        // Use frequency data to pre-warm cache with popular items
        console.log('Cache frequency data loaded:', Object.keys(frequencyData).length, 'items');
      }
    } catch (error) {
      console.warn('Failed to load cache frequency data:', error);
    }
  }

  set<T>(key: string, value: T): void {
    const size = this.estimateSize(value);
    
    // Check if we need to evict items
    if (this.stats.totalSize + size > this.stats.maxSize) {
      this.evictItems(size);
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      accessCount: 1,
      size
    };

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.stats.totalSize -= existing.size;
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
    this.stats.totalSize += size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (entry) {
      // Update access statistics
      entry.accessCount++;
      entry.timestamp = Date.now();
      this.accessOrder.set(key, ++this.accessCounter);
      this.stats.hits++;
      return entry.data;
    }
    
    this.stats.misses++;
    return null;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats.totalSize = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  getMemoryUsage(): { used: number; max: number; percentage: number } {
    return {
      used: this.stats.totalSize,
      max: this.stats.maxSize,
      percentage: (this.stats.totalSize / this.stats.maxSize) * 100
    };
  }

  /**
   * Get the most frequently accessed items
   */
  getTopItems(limit = 10): Array<{ key: string; accessCount: number; size: number }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        size: entry.size
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Save cache frequency data for persistence
   */
  saveFrequencyData(): void {
    try {
      const frequencyData: Record<string, number> = {};
      for (const [key, entry] of this.cache.entries()) {
        if (entry.accessCount > 1) {
          frequencyData[key] = entry.accessCount;
        }
      }
      localStorage.setItem('mulm-cache-frequency', JSON.stringify(frequencyData));
    } catch (error) {
      console.warn('Failed to save cache frequency data:', error);
    }
  }

  /**
   * Preload items based on usage patterns
   */
  async preloadItems(loader: (key: string) => Promise<any>): Promise<void> {
    try {
      const savedFrequency = localStorage.getItem('mulm-cache-frequency');
      if (!savedFrequency) return;

      const frequencyData = JSON.parse(savedFrequency);
      const topKeys = Object.entries(frequencyData)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 20) // Preload top 20 items
        .map(([key]) => key);

      for (const key of topKeys) {
        if (!this.has(key)) {
          try {
            const data = await loader(key);
            if (data) {
              this.set(key, data);
            }
          } catch (error) {
            console.warn(`Failed to preload cache item ${key}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to preload cache items:', error);
    }
  }

  private evictItems(requiredSpace: number): void {
    const itemsToEvict: string[] = [];
    let freedSpace = 0;

    // Get items sorted by LRU + frequency score
    const candidates = Array.from(this.cache.entries())
      .map(([key, entry]) => {
        const accessOrder = this.accessOrder.get(key) || 0;
        const age = Date.now() - entry.timestamp;
        const frequency = entry.accessCount;
        
        // Calculate eviction score (lower = more likely to evict)
        const score = (frequency * 1000) - (age / 1000) + accessOrder;
        
        return { key, entry, score };
      })
      .sort((a, b) => a.score - b.score);

    // Evict items until we have enough space
    for (const { key, entry } of candidates) {
      if (freedSpace >= requiredSpace) break;
      
      itemsToEvict.push(key);
      freedSpace += entry.size;
    }

    // Remove evicted items
    for (const key of itemsToEvict) {
      this.delete(key);
      this.stats.evictions++;
    }

    console.log(`Evicted ${itemsToEvict.length} items, freed ${freedSpace} bytes`);
  }

  private estimateSize(value: any): number {
    try {
      // Simple estimation based on JSON serialization
      const jsonString = JSON.stringify(value);
      return jsonString.length * 2; // Rough estimate for UTF-16 encoding
    } catch {
      // Fallback estimation
      return 1024; // 1KB default
    }
  }

  /**
   * Optimize cache by removing stale items
   */
  optimize(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge && entry.accessCount <= 1) {
        this.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Cache optimization: removed ${removedCount} stale items`);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getDetailedStats() {
    const entries = Array.from(this.cache.entries());
    const totalItems = entries.length;
    const averageSize = totalItems > 0 ? this.stats.totalSize / totalItems : 0;
    const averageAccess = totalItems > 0 
      ? entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0) / totalItems 
      : 0;

    return {
      ...this.stats,
      totalItems,
      averageSize,
      averageAccess,
      hitRate: this.getHitRate(),
      memoryUsage: this.getMemoryUsage()
    };
  }
}
