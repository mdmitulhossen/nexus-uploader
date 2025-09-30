# Nexus Uploader React

[![npm version](https://img.shields.io/npm/v/nexus-uploader-react.svg)](https://www.npmjs.com/package/nexus-uploader-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**React hooks and components for Nexus Uploader** - seamless file uploads with backend API or direct storage integration.

## 🚀 Features

- **Dual Upload Modes**: Backend-mediated uploads or direct storage uploads
- **Drag & Drop Interface**: Intuitive file selection with visual feedback
- **Progress Tracking**: Real-time upload progress with customizable UI
- **Direct Storage Integration**: Upload directly to S3, GCS, or Azure without backend
- **Customizable Components**: Full styling control with render props
- **TypeScript Support**: Complete type definitions included
- **Error Handling**: Comprehensive error states and user feedback
- **Chunked Uploads**: Automatic large file handling
- **Multiple File Support**: Batch upload capabilities

## 📦 Installation

```bash
npm install nexus-uploader-react
# or
yarn add nexus-uploader-react
```

### Peer Dependencies

```bash
npm install react react-dom
```

## ⚠️ Usage Modes

### Backend Mode (Traditional)
Requires a **Nexus Uploader backend server** running with the main [`nexus-uploader`](https://www.npmjs.com/package/nexus-uploader) package.

```bash
# Backend setup (required for backend mode)
npm install nexus-uploader express
```

### Direct Upload Mode (No Backend Required)
Upload directly from React components to storage services without any backend server.

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

```tsx
import React from 'react';
import { useNexusUploader, UploadDropzone } from 'nexus-uploader-react';

function FileUploader() {
  const { uploadFile, progress, isUploading, error } = useNexusUploader({
    baseUrl: 'http://localhost:3000'
  });

  const handleFilesSelected = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i]);
        console.log('Upload successful:', result);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  return (
    <div>
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        accept="image/*,video/*"
        multiple
      >
        {({ isDragActive, isDragReject }) => (
          <div style={{
            border: `2px dashed ${isDragReject ? '#ff4444' : isDragActive ? '#4444ff' : '#cccccc'}`,
            padding: '40px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            {isDragReject
              ? 'File type not supported'
              : isDragActive
              ? 'Drop files here!'
              : 'Drag & drop files here, or click to select'}
          </div>
        )}
      </UploadDropzone>

      {isUploading && (
        <div>
          <progress value={progress} max={100} style={{ width: '100%' }} />
          <p>Uploading... {progress}%</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
```

### Direct Upload Mode

```tsx
import React from 'react';
import { useNexusUploader, UploadDropzone, S3ClientStorageAdapter } from 'nexus-uploader-react';

function DirectFileUploader() {
  // Configure storage directly in React
  const storage = new S3ClientStorageAdapter({
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
    bucket: 'your-bucket',
    region: 'us-east-1'
  });

  const { uploadFile, progress, isUploading, error } = useNexusUploader({
    storage,
    generateFileKey: (file) => `uploads/${Date.now()}-${file.name}`
  });

  const handleFilesSelected = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i]);
        console.log('Upload successful:', result);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  return (
    <div>
      <UploadDropzone onFilesSelected={handleFilesSelected}>
        {({ isDragActive }) => (
          <div style={{
            border: `2px dashed ${isDragActive ? '#007bff' : '#cccccc'}`,
            padding: '40px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            {isDragActive ? 'Drop files here!' : 'Upload directly to storage'}
          </div>
        )}
      </UploadDropzone>

      {isUploading && (
        <div>
          <progress value={progress} max={100} style={{ width: '100%' }} />
          <p>Uploading... {progress}%</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
```

## API Reference

### `useNexusUploader(options)`

React hook for managing file uploads.

#### Options

```typescript
interface UseNexusUploaderOptions {
  // Backend mode
  baseUrl?: string;       // Base URL of your Nexus Uploader server

  // Direct upload mode
  storage?: IClientStorageAdapter;  // Direct storage adapter
  generateFileKey?: (file: File) => string; // Custom file key generator

  // Common options
  headers?: Record<string, string>; // Additional headers

  // Callbacks
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: UploadResult) => void;
}
```

#### Returns

```typescript
interface UseNexusUploaderReturn {
  upload: (file: File) => Promise<UploadResult>;
  progress: number;       // 0-100
  error: Error | null;
  isUploading: boolean;
  result: UploadResult | null;
  getFileUrl: (fileName: string, options?: { expiresIn?: number }) => Promise<string>;
  getFileUrls: (fileNames: string[], options?: { expiresIn?: number }) => Promise<Record<string, string>>;
  reset: () => void;
}
```

### Storage Adapters

#### `S3ClientStorageAdapter`

```typescript
import { S3ClientStorageAdapter } from 'nexus-uploader-react';

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
import { GCSClientStorageAdapter } from 'nexus-uploader-react';

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
import { AzureClientStorageAdapter } from 'nexus-uploader-react';

const storage = new AzureClientStorageAdapter({
  connectionString: 'DefaultEndpointsProtocol=https;AccountName=...',
  containerName: 'your-container'
});
```

### `UploadDropzone`

Customizable file dropzone component.

#### Props

```typescript
interface UploadDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  accept?: string;        // File type filter (e.g., "image/*,video/*")
  multiple?: boolean;     // Allow multiple files (default: true)
  disabled?: boolean;     // Disable the dropzone
  className?: string;     // CSS class
  style?: React.CSSProperties; // Inline styles
  children?: (props: {
    isDragActive: boolean;
    isDragReject: boolean;
  }) => React.ReactNode;  // Render prop for custom content
}
```

## Advanced Usage

### Custom Styling

```tsx
<UploadDropzone
  onFilesSelected={handleFiles}
  className="my-custom-dropzone"
  style={{
    border: '3px dashed #007bff',
    borderRadius: '12px',
    padding: '60px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s ease'
  }}
>
  {({ isDragActive }) => (
    <div>
      <UploadIcon size={48} color={isDragActive ? '#007bff' : '#6c757d'} />
      <h3>{isDragActive ? 'Drop files here!' : 'Upload Files'}</h3>
      <p>Support for images, videos, and documents</p>
    </div>
  )}
</UploadDropzone>
```

### Error Handling

```tsx
const { uploadFile, error } = useNexusUploader({ baseUrl: '...' });

useEffect(() => {
  if (error) {
    // Show toast notification or custom error UI
    showErrorToast(error.message);
  }
}, [error]);
```

### Progress Tracking

```tsx
const { progress, isUploading } = useNexusUploader({ baseUrl: '...' });

if (isUploading) {
  return (
    <div className="upload-progress">
      <CircularProgress value={progress} />
      <p>Uploading... {Math.round(progress)}%</p>
    </div>
  );
}
```

### File URL Retrieval

**Backend Mode Only**: Access files stored in your backend directly from the frontend:

```tsx
const { getFileUrl, getFileUrls } = useNexusUploader({ baseUrl: '...' });

// Get URL for a single file
const imageUrl = await getFileUrl('user-avatar.jpg');

// Get URLs for multiple files
const fileUrls = await getFileUrls(['doc1.pdf', 'doc2.pdf']);

// Get signed URLs with expiration
const signedUrl = await getFileUrl('private-file.pdf', { expiresIn: 3600 });
```

## Features

- ✅ **Dual Upload Modes**: Backend-mediated or direct storage uploads
- ✅ **Drag & Drop Interface**: Intuitive file selection with visual feedback
- ✅ **Progress Tracking**: Real-time upload progress with customizable UI
- ✅ **Direct Storage Integration**: Upload directly to S3, GCS, or Azure
- ✅ **Customizable Components**: Full styling control with render props
- ✅ **TypeScript Support**: Complete type definitions included
- ✅ **Error Handling**: Comprehensive error states and user feedback
- ✅ **Chunked Uploads**: Automatic large file handling
- ✅ **Multiple File Support**: Batch upload capabilities
- ✅ **File URL Retrieval**: Get URLs for uploaded files (backend mode)

## Keywords

React, file upload, drag and drop, S3, AWS S3, Google Cloud Storage, Azure Blob Storage, direct upload, client-side upload, TypeScript, React hooks, React components, resumable upload, chunked upload

## Security Note

When using direct upload mode, storage credentials will be exposed in the browser. This is suitable for:
- Development and prototyping
- Public file uploads
- Applications where security is not a primary concern

For production applications requiring enhanced security, use backend mode with proper authentication.

## Next.js Integration

For Next.js applications, disable SSR for the component:

```tsx
import dynamic from 'next/dynamic';

const UploadDropzone = dynamic(
  () => import('nexus-uploader-react').then(mod => mod.UploadDropzone),
  { ssr: false }
);
```

## License

MIT</content>
<parameter name="filePath">c:\extra\nexus-uploader\packages\react\README.md