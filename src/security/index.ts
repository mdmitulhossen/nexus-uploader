// src/security/index.ts
import { createFileValidator, ValidationOptions } from './validation';
import { createUploadRateLimit, createLargeFileRateLimit, createChunkedUploadRateLimit, RateLimitOptions } from './rate-limiting';

export interface SecurityOptions {
  validation?: ValidationOptions;
  rateLimit?: RateLimitOptions;
  enableLargeFileLimit?: boolean;
  enableChunkedUploadLimit?: boolean;
}

/**
 * Create comprehensive security middleware
 */
export function createSecurityMiddleware(options: SecurityOptions = {}) {
  const middlewares = [];

  // File validation middleware
  if (options.validation) {
    middlewares.push(createFileValidator(options.validation));
  }

  // Rate limiting middleware
  if (options.rateLimit) {
    middlewares.push(createUploadRateLimit(options.rateLimit));
  }

  // Large file rate limiting
  if (options.enableLargeFileLimit) {
    middlewares.push(createLargeFileRateLimit());
  }

  // Chunked upload rate limiting
  if (options.enableChunkedUploadLimit) {
    middlewares.push(createChunkedUploadRateLimit());
  }

  return middlewares;
}

// Re-export individual security modules
export * from './validation';
export * from './rate-limiting';