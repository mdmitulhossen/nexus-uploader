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

## � Features

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

### Advanced Security & Performance Setup

```javascript
const express = require('express');
const {
  createUploadMiddleware,
  createSecurityMiddleware,
  createPerformanceMiddleware,
  S3StorageAdapter
} = require('nexus-uploader');

const app = express();

// Configure storage
const storage = new S3StorageAdapter({
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket'
});

// Security middleware (anti-spoofing, virus scanning, rate limiting)
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
  },
  enableLargeFileLimit: true,
  enableChunkedUploadLimit: true
});

// Performance middleware (caching, CDN)
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
  },
  enableFileUrlCaching: true
});

// Create upload middleware with security and performance
const uploadMiddleware = createUploadMiddleware({
  storage,
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' },
    { name: 'documents', maxCount: 5, type: ['IMAGE', 'DOCUMENT'] }
  ]
});

// Apply middlewares in order
app.use('/upload', ...securityMiddlewares, ...performanceMiddlewares, uploadMiddleware, (req, res) => {
  res.json({ urls: req.body });
});

app.listen(3000);
```

### Frontend-Only Setup (Direct Upload)

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
    storage, // Direct storage configuration
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

### File URL Retrieval

Access files stored in your backend directly from the frontend:

```tsx
const { getFileUrl, getFileUrls } = useNexusUploader({ baseUrl: '...' });

// Get URL for a single file
const imageUrl = await getFileUrl('user-avatar.jpg');

// Get URLs for multiple files
const fileUrls = await getFileUrls(['doc1.pdf', 'doc2.pdf']);

// Get signed URLs with expiration
const signedUrl = await getFileUrl('private-file.pdf', { expiresIn: 3600 });
```

## ⚠️ Security Warning

**Direct Frontend Upload Mode**: When using client-side storage configuration, be aware that storage credentials will be exposed in the browser. This approach is suitable for:

- ✅ **Development/Prototyping**: Quick testing and development
- ✅ **Public Uploads**: When you want users to upload directly to your storage
- ✅ **Serverless Applications**: When backend infrastructure is not available

**Not recommended for**:
- ❌ **Production with sensitive data**: Credentials are visible in browser
- ❌ **Private file uploads**: Consider using backend mode with proper authentication
- ❌ **Large-scale applications**: Backend mode provides better security and control

For production applications requiring security, use the **Backend Mode** with proper authentication and authorization.

## ✨ Features

### Backend Features
- 🔄 **Stream-based processing** - Minimal memory usage
- 🎯 **File type validation** - Images, videos, documents
- 📏 **Size limits** - Configurable per file type
- 🔄 **Automatic optimization** - WebP images, WebM videos
- ☁️ **Multiple storage adapters** - S3, GCS, Azure, Local
- 📦 **Chunked uploads** - Resume interrupted uploads
- 🎣 **Lifecycle hooks** - Custom processing logic
- 🚨 **Error handling** - Specific error types

### Frontend Features
- 🎨 **Customizable UI** - Style components as needed
- 🖱️ **Drag & drop** - Intuitive file selection
- 📊 **Progress tracking** - Real-time upload progress
- 🚨 **Error handling** - User-friendly error messages
- 📱 **Responsive** - Works on all devices
- ⚡ **TypeScript** - Full type safety
- 🔗 **File URL retrieval** - Direct access to stored files (backend mode)
- 📦 **Chunked uploads** - Resume interrupted uploads (backend mode)
- 🌐 **Direct storage upload** - No backend required
- 🔐 **Client-side storage config** - Configure credentials in frontend

## �️ Security & Performance

### Advanced Validation
- **MIME Type Spoofing Prevention**: Detects actual file content vs declared type
- **Virus Scanning**: ClamAV integration for malware detection
- **File Size Limits**: Configurable per file type and user
- **Content Analysis**: Deep file inspection before storage

### Rate Limiting
- **Upload Rate Limits**: Prevent abuse with configurable thresholds
- **Large File Limits**: Special limits for big file uploads
- **Chunked Upload Limits**: Control concurrent chunk uploads
- **IP-based Limiting**: Per-IP address restrictions

### Caching Layer
- **Redis Support**: High-performance distributed caching
- **Memory Caching**: Lightweight in-memory cache for development
- **File URL Caching**: Cache generated file URLs
- **Upload Session Caching**: Cache chunked upload sessions

### CDN Integration
- **Cloudflare**: Automatic cache purging on upload
- **CloudFront**: AWS CloudFront integration
- **Akamai**: Enterprise CDN support
- **Custom CDN**: Support for any CDN provider

### Enterprise Features
- **Audit Logging**: Comprehensive upload activity logging
- **Compliance Ready**: GDPR and enterprise security standards
- **Scalable Architecture**: Handle millions of uploads daily
- **Monitoring**: Built-in metrics and health checks

## �📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Complete setup guide
- **[Configuration](./docs/configuration.md)** - All configuration options
- **[Storage Adapters](./docs/storage-adapters.md)** - Storage setup
- **[Chunked Uploads](./docs/chunked-uploads.md)** - Large file handling
- **[Frontend Integration](./docs/frontend-integration.md)** - Client libraries
- **[Error Handling](./docs/error-handling.md)** - Error management
- **[Lifecycle Hooks](./docs/lifecycle-hooks.md)** - Custom logic

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/mdmitulhossen/nexus-uploader/issues)
- 💬 [Discussions](https://github.com/mdmitulhossen/nexus-uploader/discussions)
