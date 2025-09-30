# Nexus Uploader

[![npm version](https://img.shields.io/npm/v/nexus-uploader.svg)](https://www.npmjs.com/package/nexus-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Nexus Uploader: The Ultimate File Upload & Optimization Middleware for Node.js

[![npm version](https://img.shields.io/npm/v/nexus-uploader.svg)](https://www.npmjs.com/package/nexus-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Nexus Uploader is a powerful, stream-based media upload and optimization middleware for Express.js.** It's designed to be flexible, efficient, and easy to integrate. Effortlessly handle image, video, and document uploads with automatic optimization and direct-to-cloud streaming using a pluggable storage architecture.

This package simplifies file handling by providing a robust pipeline for validation, processing, and storage, allowing you to focus on your application's core logic.

## Core Features

- **Pluggable Storage:** Don't get locked into one provider. Use our built-in `S3StorageAdapter` or `LocalStorageAdapter`, or create your own.
- **Automatic Optimization:** Converts images to `.webp` and videos to `.webm` on the fly to save bandwidth and improve performance.
- **Stream-Based Processing:** Handles large files with a minimal memory footprint by processing them as streams.
- **Advanced Configuration:** Define file types, size limits, and more.
- **Lifecycle Hooks:** Run custom logic at key stages of the upload process.
- **Chunked/Resumable Uploads:** Upload large files in chunks and resume interrupted uploads.
- **Modern Error Handling:** Throws specific, catchable errors for precise control.

---

## Documentation

For full installation, configuration, and usage details, please explore our detailed documentation:

- **[Getting Started](./docs/getting-started.md)**: A quick-start guide to get you up and running.
- **[Configuration](./docs/configuration.md)**: A deep dive into all available configuration options.
- **[Storage Adapters](./docs/storage-adapters.md)**: Learn how to use S3, local storage, Google Cloud Storage, Azure Blob Storage, or create your own adapter.
- **[Chunked/Resumable Uploads](./docs/chunked-uploads.md)**: Upload large files in chunks with resume capability.
- **[Error Handling](./docs/error-handling.md)**: Handle upload errors like a pro.
- **[Lifecycle Hooks](./docs/lifecycle-hooks.md)**: Integrate uploads with your application's logic.

---

## Quick Example

Here's a taste of how easy it is to use Nexus Uploader:

```javascript
import express from 'express';
import { createUploadMiddleware, S3StorageAdapter } from 'nexus-uploader';

const app = express();

// 1. Configure a storage adapter
const storage = new S3StorageAdapter({
  endpoint: 'your-s3-endpoint',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket-name',
});

// 2. Create the middleware
const uploadMiddleware = createUploadMiddleware({
  storage,
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' },
    { name: 'gallery', maxCount: 5, type: ['IMAGE', 'VIDEO'] },
  ],
});

// 3. Apply to a route
app.post('/upload-profile', uploadMiddleware, (req, res) => {
  // req.body now contains the URLs of the uploaded files
  res.json({ urls: req.body });
});

app.listen(3000);
```

Ready to get started? **[Check out the full Getting Started guide!](./docs/getting-started.md)**

---

## Frontend Clients

Nexus Uploader now includes client libraries for seamless frontend integration:

### React Client

Use `nexus-uploader-react` for React applications with hooks and customizable components.

```bash
npm install nexus-uploader-react
# or
yarn add nexus-uploader-react
```

**Basic Usage:**

```tsx
import React from 'react';
import { useNexusUploader, UploadDropzone } from '@nexus-uploader/react';

function App() {
  const { uploadFile, progress, isUploading } = useNexusUploader({
    baseUrl: 'http://localhost:3000',
  });

  const handleFileSelect = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
  };

  return (
    <div>
      <UploadDropzone
        onFilesSelected={handleFileSelect}
        className="custom-dropzone"
        style={{ border: '2px dashed #ccc', padding: '20px' }}
      >
        {({ isDragActive }) => (
          <div>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </div>
        )}
      </UploadDropzone>
      {isUploading && <progress value={progress} max={100} />}
    </div>
  );
}
```

**Features:**
- Customizable dropzone component with drag-and-drop support
- Progress tracking and error handling
- Chunked upload support for large files
- Fully customizable UI via className, style, and render props

For more details, see **[Frontend Integration](./docs/frontend-integration.md)**.

---

## License

This project is licensed under the MIT License.
