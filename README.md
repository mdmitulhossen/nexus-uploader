# Nexus Uploader

[![npm version](https://img.shields.io/npm/v/nexus-uploader.svg)](https://www.npmjs.com/package/nexus-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Complete file upload solution for Node.js** - middleware, optimization, and client libraries for seamless file handling.

## 🚀 What is Nexus Uploader?

Nexus Uploader is a comprehensive file upload system that provides two modes of operation:

### Backend Mode (Traditional)
- **Express.js Middleware**: Robust server-side file upload handling
- **Automatic Optimization**: Convert images to WebP, videos to WebM
- **Multiple Storage Options**: S3, Google Cloud, Azure, Local storage
- **Chunked Uploads**: Resume interrupted large file uploads

### Frontend-Only Mode (Direct Upload)
- **No Backend Required**: Upload directly from browser to storage
- **Client-Side Storage**: Configure storage credentials in frontend
- **Same Storage Support**: S3, Google Cloud Storage, Azure Blob Storage
- **Progress Tracking**: Real-time upload progress
- **React Components**: Drop-in React components and hooks

## ✨ Key Features

- **Enterprise Security**: Advanced validation, virus scanning, rate limiting
- **Performance Optimization**: Redis/memory caching, CDN integration
- **Dual Upload Modes**: Backend-mediated or direct storage uploads
- **Chunked Uploads**: Automatic large file handling with resumable uploads
- **Multiple Storage Options**: S3, Google Cloud, Azure, Local storage
- **File Optimization**: Automatic WebP images, WebM videos
- **TypeScript Support**: Full type definitions included
- **Production Ready**: Comprehensive error handling and logging

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`nexus-uploader`](https://www.npmjs.com/package/nexus-uploader) | Express.js middleware | ![npm](https://img.shields.io/npm/v/nexus-uploader.svg) |
| [`nexus-uploader-core`](https://www.npmjs.com/package/nexus-uploader-core) | Core client library | ![npm](https://img.shields.io/npm/v/nexus-uploader-core.svg) |
| [`nexus-uploader-react`](https://www.npmjs.com/package/nexus-uploader-react) | React components | ![npm](https://img.shields.io/npm/v/nexus-uploader-react.svg) |

## 🛠️ Quick Start

### Backend Setup

```bash
npm install nexus-uploader express
```

```javascript
const express = require('express');
const { createUploadMiddleware, S3StorageAdapter } = require('nexus-uploader');

const app = express();

// Configure storage
const storage = new S3StorageAdapter({
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket'
});

// Create upload middleware
const uploadMiddleware = createUploadMiddleware({
  storage,
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' },
    { name: 'documents', maxCount: 5, type: ['IMAGE', 'DOCUMENT'] }
  ]
});

// Use in route
app.post('/upload', uploadMiddleware, (req, res) => {
  res.json({ urls: req.body });
});

app.listen(3000);
```

### Frontend-Only Setup

```bash
npm install nexus-uploader-react @aws-sdk/client-s3 @aws-sdk/lib-storage
```

```tsx
import React from 'react';
import { useNexusUploader, UploadDropzone, S3ClientStorageAdapter } from 'nexus-uploader-react';

function App() {
  // Configure storage directly in frontend
  const storage = new S3ClientStorageAdapter({
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
    bucket: 'your-bucket',
    region: 'us-east-1'
  });

  const { uploadFile, progress, isUploading } = useNexusUploader({
    storage,
    generateFileKey: (file) => `uploads/${Date.now()}-${file.name}`
  });

  const handleUpload = async (files) => {
    for (const file of files) {
      await uploadFile(file);
    }
  };

  return (
    <UploadDropzone onFilesSelected={handleUpload}>
      {({ isDragActive }) => (
        <div>
          {isDragActive ? 'Drop files here!' : 'Upload files directly to storage'}
        </div>
      )}
    </UploadDropzone>
  );
}
```

## 🛡️ Enterprise Security & Performance

### Advanced Security Features

```javascript
const { createSecurityMiddleware } = require('nexus-uploader');

const securityMiddlewares = createSecurityMiddleware({
  validation: {
    allowedMimeTypes: ['image/*', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    enableVirusScan: true,
    clamAVHost: 'localhost',
    clamAVPort: 3310
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 uploads per windowMs
  }
});
```

### Performance Optimization

```javascript
const { createPerformanceMiddleware } = require('nexus-uploader');

const { middlewares: performanceMiddlewares } = createPerformanceMiddleware({
  caching: {
    type: 'redis',
    redis: { host: 'localhost', port: 6379 },
    ttl: 3600
  },
  cdn: {
    provider: 'cloudflare',
    baseUrl: 'https://cdn.yourdomain.com',
    purgeOnUpload: true
  }
});
```

## 🌐 CDN Integration Guide

### How CDN Works

CDN (Content Delivery Network) distributes your files across multiple global servers for faster delivery. Nexus Uploader automatically transforms storage URLs to CDN URLs and purges cache when files are updated.

### CDN Benefits

🚀 **Faster Delivery** - Files serve from CDN edge locations closest to users instead of your storage server
💰 **Cost Savings** - Reduce storage API calls by caching frequently accessed files
🔄 **Auto Purge** - Cache automatically cleared when new files are uploaded to prevent serving stale content
🌐 **Global Performance** - Worldwide content delivery with reduced latency

### Supported CDN Providers

| Provider | Features | Setup |
|----------|----------|-------|
| **Cloudflare** ✅ | Full API integration with automatic cache purging | Requires API token and zone ID |
| **CloudFront** ✅ | AWS CloudFront integration | Requires distribution ID |
| **Akamai** ✅ | Enterprise CDN support | Requires API credentials |
| **Custom** ✅ | Any CDN with custom purge function | Implement your own purge logic |

### CDN Setup Examples

#### Cloudflare CDN
```javascript
const cdnConfig = {
  provider: 'cloudflare',
  baseUrl: 'https://cdn.yourdomain.com',
  apiKey: 'your-cloudflare-api-token',
  zoneId: 'your-cloudflare-zone-id',
  purgeOnUpload: true  // Automatically purge cache on upload
};
```

#### Custom CDN
```javascript
const cdnConfig = {
  provider: 'custom',
  baseUrl: 'https://cdn.yourdomain.com',
  customPurgeFunction: async (fileUrl) => {
    // Your custom CDN purge logic
    await fetch('https://your-cdn-api.com/purge', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer your-token' },
      body: JSON.stringify({ urls: [fileUrl] })
    });
  }
};
```

### CDN URL Transformation

**Before CDN:**
```
https://your-bucket.s3.amazonaws.com/uploads/avatar.jpg
```

**After CDN:**
```
https://cdn.yourdomain.com/uploads/avatar.jpg
```

## ⚛️ Frontend CDN Integration

For frontend applications, you can manually transform URLs to CDN URLs:

```tsx
import React from 'react';
import { useNexusUploader } from 'nexus-uploader-react';

// CDN configuration
const CDN_BASE_URL = 'https://cdn.yourdomain.com';

function App() {
  const { uploadFile, getFileUrl } = useNexusUploader({
    baseUrl: 'http://localhost:3000' // Your backend URL
  });

  // Transform URL to CDN URL
  const getCDNUrl = (fileName: string) => {
    const storageUrl = getFileUrl(fileName);
    return storageUrl.replace(/https?:\/\/[^\/]+/, CDN_BASE_URL);
  };

  const handleUpload = async (file: File) => {
    const result = await uploadFile(file);
    const cdnUrl = getCDNUrl(result.fileName);
    console.log('CDN URL:', cdnUrl);
  };

  return (
    <div>
      {/* Your upload UI */}
    </div>
  );
}
```

## 📋 Complete Setup Examples

### Production-Ready Backend Setup

```javascript
const express = require('express');
const {
  createUploadMiddleware,
  createSecurityMiddleware,
  createPerformanceMiddleware,
  S3StorageAdapter
} = require('nexus-uploader');

const app = express();

// 1. Storage Configuration
const storage = new S3StorageAdapter({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET
});

// 2. Security Middleware
const securityMiddlewares = createSecurityMiddleware({
  validation: {
    allowedMimeTypes: ['image/*', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    enableVirusScan: true,
    clamAVHost: process.env.CLAMAV_HOST,
    clamAVPort: 3310
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
});

// 3. Performance Middleware
const { middlewares: performanceMiddlewares } = createPerformanceMiddleware({
  caching: {
    type: 'redis',
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    ttl: 3600
  },
  cdn: {
    provider: 'cloudflare',
    baseUrl: process.env.CDN_BASE_URL,
    apiKey: process.env.CLOUDFLARE_API_KEY,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    purgeOnUpload: true
  },
  enableFileUrlCaching: true
});

// 4. Upload Middleware
const uploadMiddleware = createUploadMiddleware({
  storage,
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' },
    { name: 'documents', maxCount: 5, type: ['IMAGE', 'DOCUMENT'] }
  ]
});

// 5. Apply All Middlewares
app.use('/upload', ...securityMiddlewares, ...performanceMiddlewares, uploadMiddleware);

app.post('/upload', (req, res) => {
  // Files uploaded successfully with CDN URLs
  res.json({
    success: true,
    urls: req.body, // These will be CDN URLs
    message: 'Files uploaded and optimized!'
  });
});

app.listen(3000);
```

## 🔧 Configuration Options

### Storage Adapters

| Storage | Setup | Features |
|---------|-------|----------|
| **AWS S3** | `new S3StorageAdapter({ accessKeyId, secretAccessKey, bucket })` | Full featured, scalable |
| **Google Cloud** | `new GCSStorageAdapter({ keyFilename, bucketName })` | GCP integration |
| **Azure** | `new AzureStorageAdapter({ connectionString, containerName })` | Microsoft cloud |
| **Local** | `new LocalStorageAdapter({ uploadDir: './uploads' })` | Development use |

### File Types

```javascript
const uploadMiddleware = createUploadMiddleware({
  storage,
  fields: [
    { name: 'images', maxCount: 5, type: 'IMAGE' },           // .jpg, .png, .gif, .webp
    { name: 'videos', maxCount: 2, type: 'VIDEO' },           // .mp4, .avi, .mov
    { name: 'documents', maxCount: 10, type: 'DOCUMENT' },    // .pdf, .doc, .txt
    { name: 'archives', maxCount: 3, type: ['ZIP', 'RAR'] },  // Custom types
    { name: 'any', maxCount: 1, type: '*' }                   // Any file type
  ]
});
```

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Complete setup guide
- **[Configuration](./docs/configuration.md)** - All configuration options
- **[Storage Adapters](./docs/storage-adapters.md)** - Storage setup
- **[Chunked Uploads](./docs/chunked-uploads.md)** - Large file handling
- **[Frontend Integration](./docs/frontend-integration.md)** - Client libraries
- **[Error Handling](./docs/error-handling.md)** - Error management
- **[Lifecycle Hooks](./docs/lifecycle-hooks.md)** - Custom logic
- **[Security Guide](./docs/security.md)** - Security features
- **[Performance Guide](./docs/performance.md)** - Caching & CDN
- **[API Reference](./docs/api-reference.md)** - Complete API docs
- **[Version Management](./VERSIONING.md)** - Versioning and publishing
- **[Changelog](./CHANGELOG.md)** - Release history

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
- 🐛 **Report Bugs** - [Open an issue](https://github.com/mdmitulhossen/nexus-uploader/issues)
- 💡 **Suggest Features** - [Start a discussion](https://github.com/mdmitulhossen/nexus-uploader/discussions)
- 📝 **Improve Documentation** - Help make docs clearer
- 🧪 **Write Tests** - Add test coverage
- 🔧 **Code Contributions** - Fix bugs or add features

### Development Setup
```bash
# Clone the repository
git clone https://github.com/mdmitulhossen/nexus-uploader.git
cd nexus-uploader

# Install dependencies
npm install

# Run tests
npm test

# Build packages
npm run build

# Start development
npm run dev
```

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **[Documentation](./docs/)** - Complete guides and API reference
- 🐛 **[GitHub Issues](https://github.com/mdmitulhossen/nexus-uploader/issues)** - Report bugs
- 💬 **[GitHub Discussions](https://github.com/mdmitulhossen/nexus-uploader/discussions)** - Ask questions (if enabled)
- 📧 **Email** - Contact maintainers directly

---

**Made with ❤️ for the developer community**