# Nexus Uploader

[![npm version](https://img.shields.io/npm/v/nexus-uploader.svg)](https://www.npmjs.com/package/nexus-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Complete file upload solution for Node.js** - middleware, optimization, and client libraries for seamless file handling.

## 🚀 What is Nexus Uploader?

Nexus Uploader is a comprehensive file upload system that handles everything from server-side processing to client-side integration. It provides:

- **Express.js Middleware**: Robust server-side file upload handling
- **Automatic Optimization**: Convert images to WebP, videos to WebM
- **Multiple Storage Options**: S3, Google Cloud, Azure, Local storage
- **Chunked Uploads**: Resume interrupted large file uploads
- **Client Libraries**: React components and hooks for frontend integration

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

### Frontend Setup (React)

```bash
npm install nexus-uploader-react react react-dom
```

```tsx
import React from 'react';
import { useNexusUploader, UploadDropzone } from 'nexus-uploader-react';

function App() {
  const { uploadFile, progress, isUploading } = useNexusUploader({
    baseUrl: 'http://localhost:3000'
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
          {isDragActive ? 'Drop files here!' : 'Upload files'}
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

## 📋 Requirements

### Backend
- **Node.js**: >= 14.0.0
- **Express.js**: >= 4.0.0
- **Storage**: AWS S3, Google Cloud Storage, Azure Blob Storage, or Local

### Frontend
- **React**: >= 16.8.0 (for hooks)
- **React DOM**: >= 16.8.0

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
- 🔗 **File URL retrieval** - Direct access to stored files
- 📦 **Chunked uploads** - Resume interrupted uploads

## 📚 Documentation

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
