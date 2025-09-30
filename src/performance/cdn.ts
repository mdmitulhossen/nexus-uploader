// src/performance/cdn.ts
import { Request, Response, NextFunction } from 'express';

export interface CDNOptions {
  provider?: 'cloudflare' | 'akamai' | 'cloudfront' | 'fastly' | 'custom';
  baseUrl?: string;
  apiKey?: string;
  zoneId?: string; // For Cloudflare
  distributionId?: string; // For CloudFront
  purgeOnUpload?: boolean;
  customPurgeFunction?: (fileUrl: string) => Promise<void>;
}

export class CDNManager {
  private options: Required<CDNOptions>;

  constructor(options: CDNOptions = {}) {
    this.options = {
      provider: 'custom',
      baseUrl: '',
      apiKey: '',
      zoneId: '',
      distributionId: '',
      purgeOnUpload: false,
      customPurgeFunction: async () => {},
      ...options
    };
  }

  /**
   * Create CDN URL transformation middleware
   */
  createUrlTransformer() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Store original json method
      const originalJson = res.json;

      // Override json method to transform URLs
      res.json = (data: any) => {
        if (data.url) {
          data.url = this.transformUrl(data.url);
        }
        if (data.urls && Array.isArray(data.urls)) {
          data.urls = data.urls.map((url: string) => this.transformUrl(url));
        }
        if (data.urls && typeof data.urls === 'object') {
          for (const key in data.urls) {
            data.urls[key] = this.transformUrl(data.urls[key]);
          }
        }
        return originalJson.call(res, data);
      };

      next();
    };
  }

  /**
   * Transform storage URL to CDN URL
   */
  private transformUrl(url: string): string {
    if (!url || !this.options.baseUrl) {
      return url;
    }

    // Replace storage domain with CDN domain
    const urlObj = new URL(url);
    const cdnUrlObj = new URL(this.options.baseUrl);

    // Keep the path and query parameters, replace domain
    return `${cdnUrlObj.origin}${urlObj.pathname}${urlObj.search}`;
  }

  /**
   * Purge CDN cache for a file
   */
  async purgeCache(fileUrl: string): Promise<void> {
    if (!this.options.purgeOnUpload) {
      return;
    }

    try {
      switch (this.options.provider) {
        case 'cloudflare':
          await this.purgeCloudflare(fileUrl);
          break;

        case 'cloudfront':
          await this.purgeCloudFront(fileUrl);
          break;

        case 'akamai':
          await this.purgeAkamai(fileUrl);
          break;

        case 'custom':
          if (this.options.customPurgeFunction) {
            await this.options.customPurgeFunction(fileUrl);
          }
          break;

        default:
          console.warn(`CDN provider ${this.options.provider} not supported for cache purging`);
      }
    } catch (error) {
      console.error('CDN cache purge failed:', error);
      // Don't throw error - cache purge failure shouldn't break uploads
    }
  }

  /**
   * Purge Cloudflare cache
   */
  private async purgeCloudflare(fileUrl: string): Promise<void> {
    if (!this.options.apiKey || !this.options.zoneId) {
      throw new Error('Cloudflare API key and zone ID required');
    }

    const cdnUrl = this.transformUrl(fileUrl);
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.options.zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [cdnUrl]
      })
    });

    if (!response.ok) {
      throw new Error(`Cloudflare purge failed: ${response.statusText}`);
    }
  }

  /**
   * Purge CloudFront cache
   */
  private async purgeCloudFront(fileUrl: string): Promise<void> {
    if (!this.options.distributionId) {
      throw new Error('CloudFront distribution ID required');
    }

    // Note: This would require AWS SDK integration
    // For now, just log the intent
    console.log(`CloudFront purge requested for: ${fileUrl} in distribution: ${this.options.distributionId}`);
  }

  /**
   * Purge Akamai cache
   */
  private async purgeAkamai(fileUrl: string): Promise<void> {
    // Note: This would require Akamai API integration
    // For now, just log the intent
    console.log(`Akamai purge requested for: ${fileUrl}`);
  }
}

/**
 * Create CDN middleware
 */
export function createCDNMiddleware(options?: CDNOptions) {
  const cdnManager = new CDNManager(options);
  return cdnManager.createUrlTransformer();
}

/**
 * Create cache purge middleware
 */
export function createCachePurgeMiddleware(cdnManager: CDNManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to purge cache after successful upload
    res.json = function(data: any) {
      if (data.url && res.statusCode === 200) {
        // Purge cache asynchronously (don't wait)
        cdnManager.purgeCache(data.url).catch(err =>
          console.error('CDN cache purge failed:', err)
        );
      }
      return originalJson.call(this, data);
    };

    next();
  };
}