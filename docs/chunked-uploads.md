# Chunked/Resumable Uploads

Nexus Uploader supports chunked (resumable) uploads for large files. This feature allows you to upload big files in smaller chunks, and resume uploads if they get interrupted due to network issues or other problems.

## How It Works

1. **Initialize**: Start a new upload session with file metadata.
2. **Upload Chunks**: Send file data in chunks to the server.
3. **Complete**: Combine all chunks and upload the final file to storage.

## API Endpoints

The chunked upload feature provides several endpoints that you can integrate into your application.

### Initialize Upload

**Endpoint:** `POST /upload/init`

**Body:**
```json
{
  "fileName": "large-video.mp4",
  "totalSize": 104857600,
  "mimeType": "video/mp4"
}
```

**Response:**
```json
{
  "uploadId": "unique-upload-id"
}
```

### Upload Chunk

**Endpoint:** `POST /upload/chunk`

**Body (multipart/form-data):**
- `uploadId`: The upload ID from initialization
- `chunkIndex`: The index of this chunk (starting from 0)
- `chunk`: The chunk data as a file

**Response:**
```json
{
  "success": true
}
```

### Complete Upload

**Endpoint:** `POST /upload/complete`

**Body:**
```json
{
  "uploadId": "unique-upload-id"
}
```

**Response:**
```json
{
  "url": "https://your-storage.com/uploads/uuid-large-video.mp4"
}
```

### Get Upload Progress

**Endpoint:** `GET /upload/progress/:uploadId`

**Response:**
```json
{
  "uploadedChunks": 5,
  "totalChunks": 10
}
```

## Configuration

```typescript
interface ChunkedUploadConfig {
  tempDir?: string; // Directory to store temporary chunks (default: system temp dir)
  maxChunkSize?: number; // Max size per chunk in bytes (default: 5MB)
  maxFileSize?: number; // Max total file size (default: 2GB)
  cleanupInterval?: number; // Cleanup interval in ms (default: 1 hour)
}
```

## Example Usage

```javascript
import express from 'express';
import { createChunkedUploadMiddleware, S3StorageAdapter } from 'nexus-uploader';

const app = express();
app.use(express.json());

// Configure storage
const storage = new S3StorageAdapter({
  endpoint: 'your-s3-endpoint',
  accessKeyId: 'your-key',
  secretAccessKey: 'your-secret',
  bucket: 'your-bucket',
});

// Create chunked upload middleware
const chunkedUpload = createChunkedUploadMiddleware(storage, {
  maxChunkSize: 2 * 1024 * 1024, // 2MB chunks
  maxFileSize: 1 * 1024 * 1024 * 1024, // 1GB max file
});

// Routes
app.post('/upload/init', chunkedUpload.init);
app.post('/upload/chunk', chunkedUpload.uploadChunk);
app.post('/upload/complete', chunkedUpload.complete);
app.get('/upload/progress/:uploadId', chunkedUpload.getProgress);

app.listen(3000);
```

## Client-Side Integration

For the client side, you can use libraries like:
- [Resumable.js](https://github.com/23/resumable.js)
- [Tus.js](https://github.com/tus/tus-js-client)
- [Uppy](https://uppy.io/)

These libraries handle chunking, progress tracking, and resuming automatically.

## Benefits

- **Reliability**: Resume interrupted uploads
- **Performance**: Upload large files without consuming too much memory
- **User Experience**: Show progress and handle network issues gracefully
- **Scalability**: Handle multiple concurrent uploads efficiently

## Error Handling

The chunked upload endpoints use the same error handling as the main uploader. See the [Error Handling](./error-handling.md) documentation for details.

## Cleanup

The service automatically cleans up temporary chunks and incomplete uploads after a configurable interval (default: 1 hour). You can adjust this with the `cleanupInterval` option.