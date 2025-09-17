# Configuration

`nexus-uploader` is designed to be highly configurable. You pass a configuration object to the `createUploadMiddleware` function.

## `NexusUploaderConfig`

This is the main configuration object.

```typescript
interface NexusUploaderConfig {
  storage: IStorageAdapter;
  fields: FieldConfig[];
  fileTypeConfig?: Partial<Record<FileType, Partial<FileTypeConfig>>>;
  hooks?: LifecycleHooks;
}
```

### `storage`
**Type:** `IStorageAdapter`
**Required:** Yes

This defines where your files will be stored. You must provide an instance of a storage adapter.

- **`S3StorageAdapter`**: For uploading to AWS S3 or any S3-compatible service.
- **`LocalStorageAdapter`**: For saving files to the local server filesystem.

See the [Storage Adapters](./storage-adapters.md) documentation for more details.

### `fields`
**Type:** `FieldConfig[]`
**Required:** Yes

This array defines the `multipart/form-data` fields you expect to receive files from.

```typescript
interface FieldConfig {
  name: string; // The 'name' attribute of the form input field
  maxCount: number; // Maximum number of files for this field
  type: FileType | FileType[]; // Allowed file types
}

type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ANY';
```
- **`name`**: Corresponds to the `name` attribute of the `<input type="file">` tag.
- **`maxCount`**: The maximum number of files allowed for that field.
- **`type`**: Specifies the category of files allowed. This determines which optimization logic is applied and what MIME types are accepted.

### `fileTypeConfig`
**Type:** `Partial<Record<FileType, Partial<FileTypeConfig>>>`
**Required:** No

This object allows you to override the default settings for different file types.

```typescript
interface FileTypeConfig {
  mimeTypes: string[];
  maxSize: number; // in bytes
}
```

**Example:** Override the max size for images and add a new MIME type for videos.
```javascript
const nexusConfig = {
  // ... other config
  fileTypeConfig: {
    IMAGE: {
      maxSize: 10 * 1024 * 1024, // 10 MB
    },
    VIDEO: {
      mimeTypes: ['video/mp4', 'video/x-matroska'], // Allow .mkv files
    }
  }
};
```

#### Default Settings
| Type       | Allowed MIME Types                                                              | Max Size (Default) |
| :--------- | :------------------------------------------------------------------------------ | :----------------- |
| **IMAGE**  | `image/jpeg`, `image/png`, `image/webp`, `image/gif`                              | 25 MB              |
| **VIDEO**  | `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`                   | 200 MB             |
| **DOCUMENT**| `application/pdf`, `application/msword`, etc.                                   | 10 MB              |
| **ANY**    | Any file type                                                                   | 200 MB             |

### `hooks`
**Type:** `LifecycleHooks`
**Required:** No

This object allows you to run custom logic at different stages of the upload process.

See the [Lifecycle Hooks](./lifecycle-hooks.md) documentation for more details.
