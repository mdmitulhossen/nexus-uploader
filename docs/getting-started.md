# Getting Started with Nexus Uploader

Welcome to Nexus Uploader! This guide will walk you through the basic setup and usage of the package.

## 1. Installation

First, install the package along with its peer dependency, `express`:

```bash
npm install nexus-uploader express
```

Depending on your needs, you may also need to install packages for media processing:

```bash
# For image optimization (to .webp)
npm install sharp

# For video optimization (to .webm)
npm install fluent-ffmpeg
```

## 2. Basic Configuration

Here's a simple example of how to set up `nexus-uploader` with `S3StorageAdapter`.

```javascript
import express from 'express';
import httpStatus from 'http-status';
import { 
  createUploadMiddleware, 
  S3StorageAdapter, 
  NexusUploaderError,
  FileUploadConfig,
  FileType
} from 'nexus-uploader';

const app = express();

// Step 1: Configure a Storage Adapter
// We'll use the S3 adapter here. You can also use LocalStorageAdapter.
const storageAdapter = new S3StorageAdapter({
  endpoint: 'your-s3-endpoint', // e.g., 's3.amazonaws.com' or 'fra1.digitaloceanspaces.com'
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket-name',
});

// Step 2: Define the Upload Fields
const uploadConfig: FileUploadConfig = {
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' as FileType },
    { name: 'gallery', maxCount: 5, type: ['IMAGE', 'VIDEO'] as FileType[] },
  ],
};

// Step 3: Create the Middleware
const uploadMiddleware = createUploadMiddleware({
  storage: storageAdapter,
  fields: uploadConfig.fields,
});

// Step 4: Apply Middleware to a Route
app.post('/upload-profile', uploadMiddleware, (req, res) => {
  // After the middleware runs, `req.body` will contain the URLs of the uploaded files.
  console.log('Uploaded file URLs:', req.body);

  res.status(httpStatus.OK).json({
    message: 'Files uploaded successfully!',
    urls: req.body,
  });
});

// Step 5: Add a Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof NexusUploaderError) {
    // Handle specific upload errors
    return res.status(httpStatus.BAD_REQUEST).json({
      error: err.name,
      message: err.message,
    });
  }
  
  console.error(err);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## How It Works

1.  When a request with `multipart/form-data` hits your endpoint, `nexus-uploader` intercepts the files.
2.  It validates each file based on the `type` and size limits defined in your configuration.
3.  Images are converted to `.webp`, and videos to `.webm`. Other files are processed as-is.
4.  The processed files are streamed to your chosen storage adapter (e.g., S3 or local disk).
5.  The public URLs (or file paths for local storage) are added to `req.body`.
    -   For a field with `maxCount: 1`, it's a single URL string.
    -   For `maxCount > 1`, it's an array of URL strings.

Now you have a basic setup! Explore the other documentation pages to learn about more advanced features.
