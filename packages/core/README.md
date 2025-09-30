# Nexus Uploader Core

[![npm version](https://img.shields.io/npm/v/nexus-uploader-core.svg)](https://www.npmjs.com/package/nexus-uploader-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Core client library for Nexus Uploader** - handles API communication, chunking logic, and direct storage uploads for frontend applications.

## 🚀 Features

- **Dual Upload Modes**: Backend-mediated uploads or direct storage uploads
- **Chunked Uploads**: Automatic large file handling with resumable uploads
- **Progress Tracking**: Real-time upload progress monitoring
- **Direct Storage Integration**: Upload directly to S3, GCS, or Azure without backend
- **TypeScript Support**: Full type definitions included
- **Error Handling**: Comprehensive error handling with retry logic

## 📦 Installation

```bash
npm install nexus-uploader-core
# or
yarn add nexus-uploader-core
```

## ⚠️ Usage Modes

### Backend Mode (Traditional)
Requires a **Nexus Uploader backend server** running with the main [`nexus-uploader`](https://www.npmjs.com/package/nexus-uploader) package.

```bash
# Backend setup (required for backend mode)
npm install nexus-uploader express
```

### Direct Upload Mode (No Backend Required)
Upload directly from frontend to storage services without any backend server.

```bash
# Additional dependencies for direct uploads
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage    # For S3
# or
npm install @google-cloud/storage                      # For Google Cloud Storage
# or
npm install @azure/storage-blob                        # For Azure Blob Storage
```

## Quick Start

### Backend Mode

```typescript
import { NexusUploader } from 'nexus-uploader-core';

// Initialize uploader with backend
const uploader = new NexusUploader({
  baseUrl: 'http://localhost:3000'
});

// Upload a file
const result = await uploader.uploadFile(file);
console.log('Upload successful:', result);
```

### Direct Upload Mode

```typescript
import { NexusUploader, S3ClientStorageAdapter } from 'nexus-uploader-core';

// Configure storage directly
const storage = new S3ClientStorageAdapter({
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket',
  region: 'us-east-1'
});

// Initialize uploader with direct storage
const uploader = new NexusUploader({
  storage,
  generateFileKey: (file) => `uploads/${Date.now()}-${file.name}`
});

// Upload directly to storage
const result = await uploader.uploadFile(file);
console.log('Upload successful:', result);
```

## API Reference

### `NexusUploader`

#### Constructor Options

```typescript
interface NexusUploaderOptions {
  // Backend mode
  baseUrl?: string;       // Base URL of your Nexus Uploader server

  // Direct upload mode
  storage?: IClientStorageAdapter;  // Direct storage adapter
  generateFileKey?: (file: File) => string; // Custom file key generator

  // Common options
  chunkSize?: number;     // Chunk size for large files (default: 5MB)
  maxRetries?: number;    // Max retry attempts (default: 3)
  headers?: Record<string, string>; // Additional headers

  // Callbacks
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: UploadResult) => void;
}
```

### Storage Adapters

#### `S3ClientStorageAdapter`

```typescript
import { S3ClientStorageAdapter } from 'nexus-uploader-core';

const storage = new S3ClientStorageAdapter({
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket',
  region: 'us-east-1',
  endpoint?: 'https://your-custom-endpoint.com' // For S3-compatible services
});
```

#### `GCSClientStorageAdapter`

```typescript
import { GCSClientStorageAdapter } from 'nexus-uploader-core';

const storage = new GCSClientStorageAdapter({
  projectId: 'your-project-id',
  credentials: {
    client_email: 'your-service-account@project.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\n...'
  },
  bucket: 'your-bucket'
});
```

#### `AzureClientStorageAdapter`

```typescript
import { AzureClientStorageAdapter } from 'nexus-uploader-core';

const storage = new AzureClientStorageAdapter({
  connectionString: 'DefaultEndpointsProtocol=https;AccountName=...',
  containerName: 'your-container'
});
```

#### Methods

##### `uploadFile(file: File): Promise<UploadResult>`

Uploads a file using either backend mode or direct storage mode.

**Parameters:**
- `file`: The File object to upload

**Returns:** Promise resolving to upload result

**Example:**
```typescript
const result = await uploader.uploadFile(file);
console.log('Upload successful:', result);
// { url: 'https://...', fileName: 'example.jpg', size: 12345 }
```

##### `getFileUrl(fileName: string, options?: { expiresIn?: number }): Promise<string>`

**Backend Mode Only**: Gets the URL for a file stored in your Nexus Uploader backend's storage.

**Parameters:**
- `fileName`: Name/key of the file in storage
- `options.expiresIn`: Optional expiration time in seconds for signed URLs

**Returns:** Promise resolving to the file URL

**Example:**
```typescript
// Get a permanent URL for a file
const url = await uploader.getFileUrl('my-image.jpg');

// Get a signed URL that expires in 1 hour
const signedUrl = await uploader.getFileUrl('private-file.pdf', { expiresIn: 3600 });
```

##### `getFileUrls(fileNames: string[], options?: { expiresIn?: number }): Promise<Record<string, string>>`

**Backend Mode Only**: Gets URLs for multiple files at once.

**Parameters:**
- `fileNames`: Array of file names/keys
- `options.expiresIn`: Optional expiration time in seconds

**Returns:** Promise resolving to an object mapping file names to URLs

**Example:**
```typescript
const urls = await uploader.getFileUrls(['image1.jpg', 'image2.jpg', 'doc.pdf']);
console.log(urls);
// {
//   'image1.jpg': 'https://...',
//   'image2.jpg': 'https://...',
//   'doc.pdf': 'https://...'
// }
```

## Features

- ✅ **Dual Upload Modes**: Backend-mediated or direct storage uploads
- ✅ **Chunked Uploads**: Automatic large file handling with resumable uploads
- ✅ **Progress Tracking**: Real-time upload progress monitoring
- ✅ **Direct Storage Integration**: Upload directly to S3, GCS, or Azure
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Error Handling**: Comprehensive error handling with retry logic
- ✅ **File URL Retrieval**: Get URLs for uploaded files (backend mode)
- ✅ **Custom File Keys**: Flexible file naming strategies

## Keywords

file upload, chunked upload, resumable upload, S3, AWS S3, Google Cloud Storage, Azure Blob Storage, direct upload, client-side upload, React, TypeScript, Node.js, Express.js

## Integration

This core package is used by higher-level packages like `nexus-uploader-react`. For React applications, consider using the React package for a complete UI solution.

### Security Note

When using direct upload mode, storage credentials will be exposed in the browser. This is suitable for:
- Development and prototyping
- Public file uploads
- Applications where security is not a primary concern

For production applications requiring enhanced security, use backend mode with proper authentication.

## License

MIT</content>
<parameter name="filePath">c:\extra\nexus-uploader\packages\core\README.md