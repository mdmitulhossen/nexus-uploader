# Nexus Uploader

[![npm version](https://img.shields.io/npm/v/nexus-uploader.svg)](https://www.npmjs.com/package/nexus-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, stream-based media upload and optimization middleware for Express.js, supporting S3-compatible storage.

`nexus-uploader` simplifies handling file uploads in your Express applications. It automatically optimizes images and videos, and uploads them to your S3-compatible cloud storage, such as AWS S3 or DigitalOcean Spaces.

## Features

- **Seamless Express.js Integration**: Works as a middleware, making it easy to add to your existing routes.
- **Advanced Media Optimization**:
  - **Images**: Converts images to modern, efficient `.webp` format using `sharp`.
  - **Videos**: Transcodes videos to `.webm` format using `fluent-ffmpeg` for web-optimized streaming.
- **Stream-Based Processing**: Files are processed as streams to minimize memory footprint, even with large files.
- **Flexible Configuration**: Easily configure upload fields, file types (`IMAGE`, `VIDEO`, `DOCUMENT`), and customize size limits and MIME types.
- **S3-Compatible**: Uploads files directly to any S3-compatible object storage service.

## Installation

```bash
npm install nexus-uploader express
```

You also need to install `fluent-ffmpeg` and `sharp` if you want to use video and image optimization.

```bash
# For video processing
npm install fluent-ffmpeg

# For image processing
npm install sharp
```

## Usage

Here's a quick example of how to use `nexus-uploader` in an Express.js application.

```javascript
import express from 'express';
import { UploaderService, createUploadMiddleware, FileType, NexusUploaderConfig } from 'nexus-uploader';
import httpStatus from 'http-status';

const app = express();

// 1. Configure NexusUploader
const nexusConfig: NexusUploaderConfig = {
  s3: {
    endpoint: 'your-s3-endpoint', // e.g., 's3.amazonaws.com' or 'fra1.digitaloceanspaces.com'
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
    bucket: 'your-bucket-name',
  },
  fileTypeConfig: {
    IMAGE: {
      maxSize: 10 * 1024 * 1024, // Override default max size to 10 MB
    },
    VIDEO: {
      maxSize: 150 * 1024 * 1024, // Override default max size to 150 MB
    }
  }
};

const uploaderService = new UploaderService(nexusConfig);

// 2. Configure Upload Fields
const uploadConfig = {
  fields: [
    { name: 'avatar', maxCount: 1, type: 'IMAGE' as FileType },
    { name: 'gallery', maxCount: 5, type: ['IMAGE', 'VIDEO'] as FileType[] },
    { name: 'resume', maxCount: 1, type: 'DOCUMENT' as FileType },
  ],
};

// 3. Create and Apply Middleware
const uploadMiddleware = createUploadMiddleware(uploadConfig, uploaderService, nexusConfig);

app.post('/upload-profile', uploadMiddleware, (req, res) => {
  // After middleware processing, req.body will contain the URLs of the uploaded files.
  console.log('Uploaded file URLs:', req.body);

  res.status(httpStatus.OK).json({
    message: 'Files uploaded successfully!',
    urls: req.body,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### How It Works

When a request with `multipart/form-data` hits the `/upload-profile` endpoint:

1.  `nexus-uploader` intercepts the files.
2.  It validates the files based on the `type` and size limits defined in your configuration.
3.  Images are converted to `.webp`, and videos to `.webm`. Other files are kept in their original format.
4.  The processed files are streamed to your S3 bucket.
5.  The public URLs of the uploaded files are added to `req.body`. For a field with `maxCount: 1`, it's a single URL string. For `maxCount > 1`, it's an array of strings.

## Configuration

### `NexusUploaderConfig`

The main configuration object for `nexus-uploader`.

```typescript
interface NexusUploaderConfig {
  s3: S3Config;
  fileTypeConfig?: Partial<Record<FileType, Partial<FileTypeConfig>>>;
}

interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string; // Optional, defaults to 'us-east-1'
}

interface FileTypeConfig {
  mimeTypes: string[];
  maxSize: number;
}
```

You can override default file size limits or even MIME types by providing the `fileTypeConfig` property.

### `createUploadMiddleware`

This function takes three arguments: `uploadConfig`, `uploaderService`, and an optional `nexusConfig`.

#### `uploadConfig`

```typescript
interface FileUploadConfig {
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string; // The 'name' attribute of the form input field
  maxCount: number; // Maximum number of files for this field
  type: FileType | FileType[]; // Allowed file types
}

type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ANY';
```

-   **`name`**: Corresponds to the `name` attribute of the `<input type="file">` tag in your HTML form.
-   **`maxCount`**: The maximum number of files allowed for that field.
-   **`type`**: Specifies the category of files allowed. This determines which optimization logic is applied and what MIME types are accepted. You can provide a single type or an array of types.

## File Type Details

The default settings are below. You can customize `maxSize` and `mimeTypes` via the `NexusUploaderConfig`.

| Type       | Allowed MIME Types                                                              | Max Size (Default) | Optimization            |
| :--------- | :------------------------------------------------------------------------------ | :----------------- | :---------------------- |
| **IMAGE**  | `image/jpeg`, `image/png`, `image/webp`, `image/gif`                              | 25 MB              | Converts to `.webp`     |
| **VIDEO**  | `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`                   | 200 MB             | Converts to `.webm`     |
| **DOCUMENT**| `application/pdf`, `application/msword`, etc.                                   | 10 MB              | None                    |
| **ANY**    | Any file type                                                                   | 200 MB             | Uploads as-is           |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
