# Lifecycle Hooks

`nexus-uploader` provides lifecycle hooks to allow you to run custom logic at different stages of the upload process. This is a powerful feature for integrating the upload process with other parts of your application, such as a database, logging service, or real-time notification system.

You can provide these optional async functions in the `hooks` property of your `NexusUploaderConfig`.

## Available Hooks

### `onUploadStart`
- **Signature:** `(file: Express.Multer.File) => void | Promise<void>`
- **Called:** Just before a file begins processing and uploading.
- **Use Case:** Ideal for creating a record in your database with a `'pending'` or `'uploading'` status.

### `onUploadComplete`
- **Signature:** `(file: Express.Multer.File, url: string) => void | Promise<void>`
- **Called:** After a file has been successfully processed and uploaded to the storage adapter.
- **Arguments:**
    - `file`: The original file object.
    - `url`: The final public URL or path of the uploaded file.
- **Use Case:** Perfect for updating your database record with the final URL and a `'completed'` status, or for sending a success notification.

### `onUploadError`
- **Signature:** `(error: Error, file: Express.Multer.File) => void | Promise<void>`
- **Called:** If an error occurs at any stage of the processing or uploading for a specific file.
- **Arguments:**
    - `error`: The error object that was thrown. This could be one of the custom `NexusUploaderError` types.
    - `file`: The file that failed to upload.
- **Use Case:** Useful for updating your database record to a `'failed'` status and logging the error for debugging.

## Example: Database Integration

Here is a practical example of using hooks to track file upload status in a database using an ORM like Prisma.

```javascript
import { NexusUploaderConfig } from 'nexus-uploader';
// import { prisma } from './db'; // Your Prisma client instance

const nexusConfig: NexusUploaderConfig = {
  storage: /* ... your storage adapter ... */,
  fields: /* ... your field config ... */,
  hooks: {
    onUploadStart: async (file) => {
      console.log(`Starting upload for: ${file.originalname}`);
      // Create a record in the database to track the upload
      // await prisma.file.create({
      //   data: {
      //     originalName: file.originalname,
      //     mimeType: file.mimetype,
      //     status: 'UPLOADING',
      //   },
      // });
    },
    onUploadComplete: async (file, url) => {
      console.log(`Successfully uploaded ${file.originalname} to ${url}`);
      // Find the original record and update it with the final URL and status
      // await prisma.file.update({
      //   where: { originalName: file.originalname }, // This is a simplified lookup
      //   data: {
      //     url: url,
      //     status: 'COMPLETED',
      //   },
      // });
    },
    onUploadError: async (error, file) => {
      console.error(`Error uploading ${file.originalname}:`, error.message);
      // Find the original record and mark it as failed
      // await prisma.file.update({
      //   where: { originalName: file.originalname }, // This is a simplified lookup
      //   data: {
            // status: 'FAILED',
      //     errorMessage: error.message,
      //   },
      // });
    },
  },
};

// ... then pass nexusConfig to createUploadMiddleware
```
This example demonstrates how hooks can make your application more robust and provide a better user experience by tracking the state of each upload.
