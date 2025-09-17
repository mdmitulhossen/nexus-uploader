# Storage Adapters

Nexus Uploader uses a flexible adapter-based architecture for storing files. This allows you to easily switch between different storage backends, like a cloud service or your local server disk, without changing your core application logic.

You configure the storage backend by passing a storage adapter instance to the `storage` property in the main configuration.

## `S3StorageAdapter`

Use this adapter to upload files to AWS S3 or any S3-compatible object storage service (like DigitalOcean Spaces, MinIO, etc.).

### Installation
This adapter requires the `aws-sdk` package.
```bash
npm install aws-sdk
```

### Configuration
The `S3StorageAdapter` constructor takes an `S3Config` object.

```typescript
interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string; // Optional, defaults to 'us-east-1'
}
```

### Example
```javascript
import { S3StorageAdapter } from 'nexus-uploader';

const s3Adapter = new S3StorageAdapter({
  endpoint: 'fra1.digitaloceanspaces.com',
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY',
  bucket: 'your-bucket-name',
  region: 'fra-1'
});

// Then pass s3Adapter to your main config
const nexusConfig = {
  storage: s3Adapter,
  // ... other config
};
```

## `LocalStorageAdapter`

Use this adapter to save files directly to the local filesystem of your server. This is useful for development, testing, or applications that don't require cloud storage.

### Configuration
The `LocalStorageAdapter` constructor takes a `LocalStorageConfig` object.

```typescript
interface LocalStorageConfig {
  path: string; // The directory where files will be saved
  baseUrl?: string; // An optional base URL to prepend to the returned file path
}
```

### Example
```javascript
import { LocalStorageAdapter } from 'nexus-uploader';

const localAdapter = new LocalStorageAdapter({
  path: './public/uploads', // Files will be saved in the 'public/uploads' directory
  baseUrl: '/uploads/' // The returned URL will be, e.g., '/uploads/image.webp'
});

// Then pass localAdapter to your main config
const nexusConfig = {
  storage: localAdapter,
  // ... other config
};
```
If `baseUrl` is not provided, the adapter will return the absolute file path on the server.

## Creating a Custom Adapter

You can create your own storage adapter by implementing the `IStorageAdapter` interface. This is useful if you want to integrate with a service that isn't supported out-of-the-box (e.g., Google Cloud Storage, Azure Blob Storage).

### `IStorageAdapter` Interface
```typescript
interface IStorageAdapter {
  upload(
    fileKey: string,
    stream: NodeJS.ReadableStream,
    mimeType: string
  ): Promise<string>;
}
```
Your custom adapter must have an `upload` method that accepts a unique `fileKey`, a readable `stream`, and the file's `mimeType`. The method must return a `Promise` that resolves to the public URL or path of the uploaded file.
