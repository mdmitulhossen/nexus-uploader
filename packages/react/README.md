# Nexus Uploader React

[![npm version](https://img.shields.io/npm/v/nexus-uploader-react.svg)](https://www.npmjs.com/package/nexus-uploader-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**React hooks and components for Nexus Uploader** - seamless file uploads in React applications with beautiful, customizable UI.

## ⚠️ Requirements

This package requires a **Nexus Uploader backend server** running with the main [`nexus-uploader`](https://www.npmjs.com/package/nexus-uploader) package.

```bash
# Backend setup (required)
npm install nexus-uploader express

# Frontend client
npm install nexus-uploader-react
# or
yarn add nexus-uploader-react
```

### Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

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

## API Reference

### `useNexusUploader(options)`

React hook for managing file uploads.

#### Options

```typescript
interface UseNexusUploaderOptions {
  baseUrl: string;        // Base URL of your Nexus Uploader server
  headers?: Record<string, string>; // Additional headers
}
```

#### Returns

```typescript
interface UseNexusUploaderReturn {
  upload: (file: File) => Promise<void>;
  progress: number;       // 0-100
  error: Error | null;
  isUploading: boolean;
  result: UploadResult | null;
  getFileUrl: (fileName: string, options?: { expiresIn?: number }) => Promise<string>;
  getFileUrls: (fileNames: string[], options?: { expiresIn?: number }) => Promise<Record<string, string>>;
  reset: () => void;
}
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

```tsx
const { getFileUrl, getFileUrls } = useNexusUploader({ baseUrl: '...' });

// Get URL for a single file
const imageUrl = await getFileUrl('user-avatar.jpg');
console.log('Image URL:', imageUrl);

// Get URLs for multiple files
const fileUrls = await getFileUrls(['doc1.pdf', 'doc2.pdf']);
console.log('File URLs:', fileUrls);

// Get signed URLs with expiration
const signedUrl = await getFileUrl('private-file.pdf', { expiresIn: 3600 });
```

## Features

- ✅ **Drag & Drop**: Intuitive file selection
- ✅ **Progress Tracking**: Real-time upload progress
- ✅ **Error Handling**: Comprehensive error states
- ✅ **Customizable UI**: Full styling control
- ✅ **TypeScript**: Complete type definitions
- ✅ **Chunked Uploads**: Automatic large file handling
- ✅ **Multiple Files**: Support for batch uploads

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