// src/performance/index.ts
import { CacheManager, createFileUrlCache, createUploadSessionCache, CacheOptions } from './caching';
import { CDNManager, createCDNMiddleware, createCachePurgeMiddleware, CDNOptions } from './cdn';

export interface PerformanceOptions {
  caching?: CacheOptions;
  cdn?: CDNOptions;
  enableFileUrlCaching?: boolean;
  enableUploadSessionCaching?: boolean;
}

/**
 * Create comprehensive performance middleware
 */
export function createPerformanceMiddleware(options: PerformanceOptions = {}) {
  const middlewares = [];
  let cacheManager: CacheManager | null = null;
  let cdnManager: CDNManager | null = null;

  // Initialize cache manager if caching is enabled
  if (options.caching) {
    cacheManager = new CacheManager(options.caching);
  }

  // Initialize CDN manager if CDN is enabled
  if (options.cdn) {
    cdnManager = new CDNManager(options.cdn);
  }

  // File URL caching middleware
  if (options.enableFileUrlCaching && cacheManager) {
    middlewares.push(createFileUrlCache(cacheManager));
  }

  // CDN URL transformation middleware
  if (cdnManager) {
    middlewares.push(createCDNMiddleware(options.cdn));
  }

  // CDN cache purge middleware
  if (cdnManager) {
    middlewares.push(createCachePurgeMiddleware(cdnManager));
  }

  return {
    middlewares,
    cacheManager,
    cdnManager,
    uploadSessionCache: cacheManager ? createUploadSessionCache(cacheManager) : null
  };
}

// Re-export individual performance modules
export * from './caching';
export * from './cdn';