// src/errors.ts

/**
 * Base class for all custom errors thrown by Nexus Uploader.
 * This allows consumers to catch all errors from this package with a single catch block.
 */
export class NexusUploaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // This is necessary to restore the prototype chain.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a file's MIME type is not in the allowed list for its field.
 */
export class InvalidFileTypeError extends NexusUploaderError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when a file's size exceeds the configured maximum limit for its type.
 */
export class FileSizeExceededError extends NexusUploaderError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when there is an error during the file processing (e.g., video transcoding).
 */
export class ProcessingError extends NexusUploaderError {
    constructor(message: string) {
        super(message);
    }
}

/**
 * Thrown when an error occurs while uploading the file to the S3-compatible storage.
 */
export class S3UploadError extends NexusUploaderError {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
  }
}
