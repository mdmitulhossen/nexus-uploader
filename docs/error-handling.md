# Error Handling

`nexus-uploader` throws custom, specific errors to allow for precise error handling in your application. All custom errors extend from the base `NexusUploaderError` class, so you can easily catch all errors originating from this package.

## Error Types

- **`NexusUploaderError`**: The base error class for all other custom errors.
- **`InvalidFileTypeError`**: Thrown when a file's MIME type is not in the allowed list for its field configuration.
- **`FileSizeExceededError`**: Thrown when a file's size is larger than the configured limit for its type.
- **`ProcessingError`**: Thrown if an error occurs during media processing (e.g., video transcoding with `ffmpeg` fails).
- **`S3UploadError`**: Thrown specifically if the upload to S3-compatible storage fails. Contains the original error from the AWS SDK.
- **`LocalStorageError`**: Thrown if there's an error writing a file to the local filesystem.

## Handling Errors

The recommended way to handle these errors is by using a global Express.js error-handling middleware. This keeps your route handlers clean and centralizes your error logic.

### Example Middleware

Here is an example of how you can identify and handle each specific error type.

```javascript
import { 
  NexusUploaderError, 
  InvalidFileTypeError, 
  FileSizeExceededError,
  ProcessingError
} from 'nexus-uploader';
import httpStatus from 'http-status';

// Place this after all your routes
app.use((err, req, res, next) => {
  // Handle specific, common client errors
  if (err instanceof InvalidFileTypeError) {
    return res.status(httpStatus.BAD_REQUEST).json({
      error: 'Invalid File Type',
      message: err.message,
    });
  }

  if (err instanceof FileSizeExceededError) {
    return res.status(httpStatus.REQUEST_TOO_LONG).json({
      error: 'File Too Large',
      message: err.message,
    });
  }

  // Handle server-side or processing errors
  if (err instanceof ProcessingError) {
    console.error('File processing failed:', err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'File Processing Failed',
      message: 'There was an issue processing the uploaded file.',
    });
  }

  // Catch-all for other Nexus Uploader errors
  if (err instanceof NexusUploaderError) {
    console.error('An upload error occurred:', err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'File Upload Failed',
      message: err.message,
    });
  }

  // Handle any other errors that were not caught
  console.error('An unexpected error occurred:', err);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred.' });
});
```
This setup allows you to provide clear feedback to your users for common issues like invalid file types or large files, while logging more critical server-side errors for debugging.
