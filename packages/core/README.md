# Nexus Uploader Core

[![npm version](https://img.shields.io/npm/v/nexus-uploader-core.svg)](https://www.npmjs.com/package/nexus-uploader-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Core client library for Nexus Uploader** - handles API communication and chunking logic for frontend applications.

## ⚠️ Requirements

This package requires a **Nexus Uploader backend server** running with the main [`nexus-uploader`](https://www.npmjs.com/package/nexus-uploader) package.

```bash
# Backend setup (required)
npm install nexus-uploader express

# Frontend client
npm install nexus-uploader-core
```

## Quick Start

```typescript
import { NexusUploader } from 'nexus-uploader-core';

// Initialize uploader
const uploader = new NexusUploader({
  baseUrl: 'http://localhost:3000'
});

// Upload a file
const result = await uploader.uploadFile(file);
console.log('Upload successful:', result);
```

## API Reference

### `NexusUploader`

#### Constructor Options

```typescript
interface NexusUploaderOptions {
  baseUrl: string;        // Base URL of your Nexus Uploader server
  headers?: Record<string, string>; // Additional headers for requests
}
```

#### Methods

##### `getFileUrl(fileName: string, options?: { expiresIn?: number }): Promise<string>`

Gets the URL for a file stored in your Nexus Uploader backend's storage.

**Parameters:**
- `fileName`: Name/key of the file in storage
- `options.expiresIn`: Optional expiration time in seconds for signed URLs

**Returns:** Promise resolving to the file URL

**Example:**
```typescript
// Get a permanent URL for a file
const url = await uploader.getFileUrl('my-image.jpg');
console.log('File URL:', url);

// Get a signed URL that expires in 1 hour
const signedUrl = await uploader.getFileUrl('private-file.pdf', { expiresIn: 3600 });
```

##### `getFileUrls(fileNames: string[], options?: { expiresIn?: number }): Promise<Record<string, string>>`

Gets URLs for multiple files at once.

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

- **Chunked Uploads**: Automatically handles large files by splitting them into chunks
- **Progress Tracking**: Built-in progress monitoring
- **Error Handling**: Comprehensive error handling with retry logic
- **TypeScript Support**: Full TypeScript definitions included

## Integration

This core package is used by higher-level packages like `nexus-uploader-react`. For React applications, consider using the React package instead.

## License

MIT</content>
<parameter name="filePath">c:\extra\nexus-uploader\packages\core\README.md