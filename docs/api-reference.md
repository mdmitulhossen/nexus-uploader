# API Reference

## Core Functions

### createUploadMiddleware(options)

Creates the main upload middleware for Express.js.

```javascript
const uploadMiddleware = createUploadMiddleware({
  storage: new S3StorageAdapter({...}),
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' },
    { name: 'docs', maxCount: 5, type: ['IMAGE', 'DOCUMENT'] }
  ],
  tempDir: './temp',
  onFileUpload: (file) => console.log('Uploaded:', file.filename)
});
```

### createSecurityMiddleware(options)

Creates security middleware with validation and rate limiting.

```javascript
const securityMiddleware = createSecurityMiddleware({
  validation: {
    allowedMimeTypes: ['image/*', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    enableVirusScan: true,
    clamAVHost: 'localhost'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
});
```

### createPerformanceMiddleware(options)

Creates performance middleware with caching and CDN.

```javascript
const { middlewares } = createPerformanceMiddleware({
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

## Storage Adapters

### S3StorageAdapter

```javascript
const storage = new S3StorageAdapter({
  accessKeyId: 'your-key',
  secretAccessKey: 'your-secret',
  bucket: 'your-bucket',
  region: 'us-east-1'
});
```

### GCSStorageAdapter

```javascript
const storage = new GCSStorageAdapter({
  keyFilename: './service-account.json',
  bucketName: 'your-bucket'
});
```

### AzureStorageAdapter

```javascript
const storage = new AzureStorageAdapter({
  connectionString: 'your-connection-string',
  containerName: 'uploads'
});
```

### LocalStorageAdapter

```javascript
const storage = new LocalStorageAdapter({
  uploadDir: './uploads',
  baseUrl: 'http://localhost:3000/uploads'
});
```

## React Hooks

### useNexusUploader(options)

Main hook for file uploads in React.

```tsx
const { uploadFile, progress, isUploading, error } = useNexusUploader({
  storage: new S3ClientStorageAdapter({...}),
  generateFileKey: (file) => `uploads/${Date.now()}-${file.name}`,
  onProgress: (progress) => console.log('Progress:', progress),
  onComplete: (result) => console.log('Complete:', result),
  onError: (error) => console.error('Error:', error)
});
```

### UploadDropzone Component

Drag-and-drop upload component.

```tsx
<UploadDropzone
  onFilesSelected={(files) => {
    files.forEach(file => uploadFile(file));
  }}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple={true}
>
  {({ isDragActive, isDragReject }) => (
    <div>
      {isDragActive ? 'Drop files here!' : 'Upload files'}
    </div>
  )}
</UploadDropzone>
```

## Types

### UploadConfig

```typescript
interface UploadConfig {
  storage?: IClientStorageAdapter;
  baseUrl?: string;
  chunkSize?: number;
  maxRetries?: number;
  generateFileKey?: (file: File) => string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: UploadResult) => void;
}
```

### UploadResult

```typescript
interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  mimeType?: string;
}
```

### SecurityOptions

```typescript
interface SecurityOptions {
  validation?: {
    allowedMimeTypes?: string[];
    maxFileSize?: number;
    enableVirusScan?: boolean;
    clamAVHost?: string;
    clamAVPort?: number;
  };
  rateLimit?: {
    windowMs?: number;
    max?: number;
  };
}
```

### PerformanceOptions

```typescript
interface PerformanceOptions {
  caching?: CacheOptions;
  cdn?: CDNOptions;
  enableFileUrlCaching?: boolean;
  enableUploadSessionCaching?: boolean;
}
```