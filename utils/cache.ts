// Simple cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class SimpleCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: T, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}