# Frontend Integration

Nexus Uploader provides client libraries for easy integration with frontend frameworks. Currently, we support React with the `@nexus-uploader/react` package.

## React Client (`nexus-uploader-react`)

The React client provides hooks and components for seamless file uploads in React applications.

### Installation

```bash
npm install nexus-uploader-react
# or
yarn add nexus-uploader-react
```

### Peer Dependencies

Make sure you have React and React DOM installed:

```bash
npm install react react-dom
```

### Basic Usage

#### Using the Hook

```tsx
import React, { useState } from 'react';
import { useNexusUploader } from '@nexus-uploader/react';

function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const { uploadFile, progress, isUploading, error } = useNexusUploader({
    baseUrl: 'http://localhost:3000',
  });

  const handleUpload = async () => {
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        console.log('Upload successful:', result);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? `Uploading... ${progress}%` : 'Upload'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Using the Component

```tsx
import React from 'react';
import { UploadDropzone } from '@nexus-uploader/react';

function App() {
  const handleFilesSelected = (files: FileList) => {
    // Handle file selection
    console.log('Files selected:', files);
  };

  return (
    <UploadDropzone
      onFilesSelected={handleFilesSelected}
      className="my-dropzone"
      style={{ border: '2px dashed #007bff', padding: '20px', borderRadius: '5px' }}
    >
      {({ isDragActive, isDragReject }) => (
        <div>
          {isDragActive && !isDragReject && <p>Drop files here!</p>}
          {isDragReject && <p>File type not accepted</p>}
          {!isDragActive && <p>Drag & drop files here, or click to select</p>}
        </div>
      )}
    </UploadDropzone>
  );
}
```

### API Reference

#### `useNexusUploader(options)`

A React hook for managing file uploads.

**Parameters:**
- `options.baseUrl` (string): The base URL of your Nexus Uploader server
- `options.headers` (object, optional): Additional headers to send with requests

**Returns:**
- `uploadFile(file: File): Promise<UploadResult>`: Function to upload a single file
- `progress: number`: Current upload progress (0-100)
- `isUploading: boolean`: Whether an upload is in progress
- `error: Error | null`: Current error, if any

#### `UploadDropzone`

A customizable dropzone component for file selection.

**Props:**
- `onFilesSelected(files: FileList)`: Callback when files are selected
- `accept?: string`: Accepted file types (e.g., "image/*,video/*")
- `multiple?: boolean`: Allow multiple file selection (default: true)
- `disabled?: boolean`: Disable the dropzone
- `className?: string`: CSS class name
- `style?: React.CSSProperties`: Inline styles
- `children?: (props: { isDragActive: boolean; isDragReject: boolean }) => React.ReactNode`: Render prop for custom content

### Customization

The `UploadDropzone` component is fully customizable:

```tsx
<UploadDropzone
  onFilesSelected={handleFiles}
  className="custom-dropzone"
  style={{
    border: '3px dashed #28a745',
    borderRadius: '10px',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s ease'
  }}
  accept="image/*"
  multiple={false}
>
  {({ isDragActive, isDragReject }) => (
    <div style={{ textAlign: 'center' }}>
      <Icon name={isDragActive ? 'upload-active' : 'upload'} size="large" />
      <p style={{ margin: '10px 0', fontSize: '18px' }}>
        {isDragReject
          ? 'File type not supported'
          : isDragActive
          ? 'Drop your image here'
          : 'Drag & drop an image, or click to select'}
      </p>
    </div>
  )}
</UploadDropzone>
```

### Error Handling

Handle upload errors gracefully:

```tsx
const { uploadFile, error } = useNexusUploader({ baseUrl: '...' });

useEffect(() => {
  if (error) {
    // Show error notification
    toast.error(error.message);
  }
}, [error]);
```

### Chunked Uploads

The client automatically handles chunked uploads for large files. No additional configuration needed - just upload as usual!

### Next.js Integration

For Next.js applications, make sure to handle the component on the client side:

```tsx
import dynamic from 'next/dynamic';

const UploadDropzone = dynamic(
  () => import('@nexus-uploader/react').then(mod => mod.UploadDropzone),
  { ssr: false }
);
```

## Core Client (`nexus-uploader-core`)

If you need lower-level control or want to integrate with other frameworks, use the core client:

```bash
npm install nexus-uploader-core
```

```typescript
import { NexusUploader } from 'nexus-uploader-core';

const uploader = new NexusUploader({ baseUrl: 'http://localhost:3000' });
const result = await uploader.uploadFile(file);
```

## Contributing

We welcome contributions! If you'd like to add support for other frameworks (Vue, Angular, Svelte, etc.), please open an issue or submit a PR.</content>
<parameter name="filePath">c:\extra\nexus-uploader\docs\frontend-integration.md