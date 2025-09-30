// src/performance/caching.ts
import Redis from 'ioredis';
import NodeCache from 'node-cache';
import MemoryCache from 'memory-cache';

export interface CacheOptions {
  type?: 'redis' | 'node-cache' | 'memory';
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };
  ttl?: number; // Time to live in seconds
  maxKeys?: number; // Maximum number of keys (for memory cache)
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache: any;
  private options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.options = {
      type: 'memory',
      ttl: 3600, // 1 hour default
      maxKeys: 1000,
      ...options
    };

    this.initializeCache();
  }

  private initializeCache() {
    switch (this.options.type) {
      case 'redis':
        this.cache = new Redis({
          host: this.options.redis?.host || 'localhost',
          port: this.options.redis?.port || 6379,
          password: this.options.redis?.password,
          db: this.options.redis?.db || 0,
        });
        break;

      case 'node-cache':
        this.cache = new NodeCache({
          stdTTL: this.options.ttl,
          maxKeys: this.options.maxKeys
        });
        break;

      case 'memory':
      default:
        this.cache = MemoryCache;
        break;
    }
  }

  /**
   * Set a cache entry
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const finalTtl = ttl || this.options.ttl || 3600;

    switch (this.options.type) {
      case 'redis':
        await this.cache.setex(key, finalTtl, JSON.stringify(value));
        break;

      case 'node-cache':
        this.cache.set(key, value, finalTtl);
        break;

      case 'memory':
        this.cache.put(key, value, finalTtl * 1000); // Memory cache uses milliseconds
        break;
    }
  }

  /**
   * Get a cache entry
   */
  async get<T = any>(key: string): Promise<T | null> {
    let value: any = null;

    switch (this.options.type) {
      case 'redis':
        const redisValue = await this.cache.get(key);
        value = redisValue ? JSON.parse(redisValue) : null;
        break;

      case 'node-cache':
        value = this.cache.get(key);
        break;

      case 'memory':
        value = this.cache.get(key);
        break;
    }

    return value;
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string): Promise<boolean> {
    switch (this.options.type) {
      case 'redis':
        const result = await this.cache.del(key);
        return result > 0;

      case 'node-cache':
        return this.cache.del(key) > 0;

      case 'memory':
        this.cache.del(key);
        return true;

      default:
        return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    switch (this.options.type) {
      case 'redis':
        await this.cache.flushdb();
        break;

      case 'node-cache':
        this.cache.flushAll();
        break;

      case 'memory':
        this.cache.clear();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    switch (this.options.type) {
      case 'redis':
        const info = await this.cache.info();
        return { type: 'redis', info };

      case 'node-cache':
        return {
          type: 'node-cache',
          keys: this.cache.getStats().keys,
          hits: this.cache.getStats().hits,
          misses: this.cache.getStats().misses
        };

      case 'memory':
        return { type: 'memory', status: 'active' };
    }
  }

  /**
   * Close cache connection
   */
  async close(): Promise<void> {
    if (this.options.type === 'redis') {
      await this.cache.quit();
    }
  }
}

/**
 * Create file URL caching middleware
 */
export function createFileUrlCache(cacheManager: CacheManager) {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `file_url_${req.params.fileName || req.query.key}`;

    // Try to get from cache first
    const cachedUrl = await cacheManager.get(cacheKey);
    if (cachedUrl) {
      return res.json({ url: cachedUrl });
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function(data: any) {
      if (data.url) {
        cacheManager.set(cacheKey, data.url, 1800); // Cache for 30 minutes
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Create upload session caching
 */
export function createUploadSessionCache(cacheManager: CacheManager) {
  return {
    async storeSession(sessionId: string, data: any, ttl: number = 3600) {
      await cacheManager.set(`upload_session_${sessionId}`, data, ttl);
    },

    async getSession(sessionId: string) {
      return await cacheManager.get(`upload_session_${sessionId}`);
    },

    async deleteSession(sessionId: string) {
      return await cacheManager.delete(`upload_session_${sessionId}`);
    }
  };
}