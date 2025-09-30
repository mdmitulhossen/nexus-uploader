# Performance Guide

## Overview

Nexus Uploader includes powerful performance optimization features including caching and CDN integration.

## Caching

### Redis Caching

High-performance distributed caching for production applications.

```javascript
const performanceMiddleware = createPerformanceMiddleware({
  caching: {
    type: 'redis',
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'your-password' // optional
    },
    ttl: 3600 // 1 hour
  }
});
```

### Memory Caching

Lightweight in-memory caching for development or small applications.

```javascript
const performanceMiddleware = createPerformanceMiddleware({
  caching: {
    type: 'memory',
    ttl: 1800 // 30 minutes
  }
});
```

## CDN Integration

### How CDN Works

CDN distributes your files globally for faster delivery and reduced latency.

### Supported Providers

- **Cloudflare**: Full API integration with automatic cache purging
- **CloudFront**: AWS CloudFront support
- **Akamai**: Enterprise CDN support
- **Custom**: Any CDN with custom purge logic

### CDN Setup

```javascript
const performanceMiddleware = createPerformanceMiddleware({
  cdn: {
    provider: 'cloudflare',
    baseUrl: 'https://cdn.yourdomain.com',
    apiKey: 'your-api-key',
    zoneId: 'your-zone-id',
    purgeOnUpload: true
  }
});
```

## Performance Benefits

- 🚀 **Faster Delivery**: Files served from edge locations
- 💰 **Cost Savings**: Reduced storage API calls
- 🔄 **Auto Purge**: Cache cleared automatically on updates
- 🌐 **Global Performance**: Worldwide content delivery

## Monitoring

Track performance metrics to optimize your setup:

```javascript
const { cacheManager, cdnManager } = createPerformanceMiddleware({
  // your config
});

// Monitor cache hit rates
console.log('Cache stats:', cacheManager.getStats());
```