// src/security/rate-limiting.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum requests per window
  message?: string | object;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
  onLimitReached?: (req: Request, res: Response) => void;
}

/**
 * Create upload rate limiting middleware
 */
export function createUploadRateLimit(options: RateLimitOptions = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 uploads per windowMs
    message: {
      error: 'Too many upload requests from this IP, please try again later.',
      retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
    },
    statusCode: 429,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => req.ip || req.connection.remoteAddress || 'unknown',
    ...options
  };

  return rateLimit({
    windowMs: defaultOptions.windowMs,
    max: defaultOptions.max,
    message: defaultOptions.message,
    statusCode: defaultOptions.statusCode,
    skipSuccessfulRequests: defaultOptions.skipSuccessfulRequests,
    skipFailedRequests: defaultOptions.skipFailedRequests,
    keyGenerator: defaultOptions.keyGenerator,
    ...(defaultOptions.handler && { handler: defaultOptions.handler }),
    ...(defaultOptions.onLimitReached && { onLimitReached: defaultOptions.onLimitReached }),
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
}

/**
 * Create strict rate limiting for large file uploads
 */
export function createLargeFileRateLimit(options: Partial<RateLimitOptions> = {}) {
  return createUploadRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 large file uploads per hour
    message: {
      error: 'Too many large file uploads. Large files are limited to 10 per hour.',
      retryAfter: 3600
    },
    ...options
  });
}

/**
 * Create rate limiting for chunked uploads
 */
export function createChunkedUploadRateLimit(options: Partial<RateLimitOptions> = {}) {
  return createUploadRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // Max 1000 chunks per minute (reasonable for multiple concurrent uploads)
    message: {
      error: 'Too many chunk upload requests. Please slow down your upload.',
      retryAfter: 60
    },
    ...options
  });
}