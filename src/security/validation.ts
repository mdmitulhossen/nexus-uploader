// src/security/validation.ts
import { Request, Response, NextFunction } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import * as ClamAV from 'clamav.js';
import { NexusUploaderError } from '../errors';

export interface ValidationOptions {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  enableVirusScan?: boolean;
  clamAVHost?: string;
  clamAVPort?: number;
  strictMimeCheck?: boolean;
}

export class FileValidator {
  private options: Required<ValidationOptions>;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'text/*'],
      maxFileSize: 100 * 1024 * 1024, // 100MB default
      enableVirusScan: false,
      clamAVHost: 'localhost',
      clamAVPort: 3310,
      strictMimeCheck: true,
      ...options
    };
  }

  /**
   * Advanced file validation middleware
   */
  validateFile = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | Express.Multer.File;

    if (!files) {
      return next();
    }

    const fileArray = Array.isArray(files) ? files : [files];

    Promise.all(fileArray.map(file => this.validateSingleFile(file)))
      .then(() => next())
      .catch(next);
  };

  /**
   * Validate a single file
   */
  private async validateSingleFile(file: Express.Multer.File): Promise<void> {
    // Check file size
    if (file.size > this.options.maxFileSize) {
      throw new NexusUploaderError(`File size ${file.size} exceeds maximum allowed size ${this.options.maxFileSize}`);
    }

    // MIME type validation
    await this.validateMimeType(file);

    // Virus scanning (if enabled)
    if (this.options.enableVirusScan) {
      await this.scanForViruses(file);
    }
  }

  /**
   * Advanced MIME type validation to prevent spoofing
   */
  private async validateMimeType(file: Express.Multer.File): Promise<void> {
    const buffer = file.buffer || Buffer.alloc(0);

    if (buffer.length === 0) {
      throw new NexusUploaderError('Empty file detected');
    }

    // Get actual file type from content
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      // Allow text files and other files that might not be detected
      if (!file.mimetype.startsWith('text/') && !this.isAllowedMimeType(file.mimetype)) {
        throw new NexusUploaderError(`Unable to determine file type for ${file.originalname}`);
      }
      return;
    }

    // Strict validation: MIME type must match detected type
    if (this.options.strictMimeCheck) {
      const declaredMime = file.mimetype.toLowerCase();
      const detectedMime = detectedType.mime.toLowerCase();

      if (declaredMime !== detectedMime) {
        throw new NexusUploaderError(
          `MIME type mismatch: declared ${declaredMime}, detected ${detectedMime}. Possible spoofing attempt.`
        );
      }
    }

    // Check against allowed types
    if (!this.isAllowedMimeType(detectedType.mime)) {
      throw new NexusUploaderError(`File type ${detectedType.mime} is not allowed`);
    }
  }

  /**
   * Check if MIME type is allowed
   */
  private isAllowedMimeType(mimeType: string): boolean {
    return this.options.allowedMimeTypes.some(allowed => {
      if (allowed.includes('*')) {
        const [type] = allowed.split('/');
        return mimeType.startsWith(`${type}/`);
      }
      return mimeType === allowed;
    });
  }

  /**
   * Virus scanning using ClamAV
   */
  private async scanForViruses(file: Express.Multer.File): Promise<void> {
    try {
      const clamav = ClamAV.createScanner(this.options.clamAVPort, this.options.clamAVHost);
      const buffer = file.buffer || Buffer.alloc(0);

      const result = await clamav.scanBuffer(buffer, 30000); // 30 second timeout

      if (result.includes('FOUND')) {
        throw new NexusUploaderError(`Virus detected in file ${file.originalname}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('VIRUS_DETECTED')) {
        throw error;
      }
      // Log error but don't fail if ClamAV is unavailable
      console.warn('Virus scanning failed:', error instanceof Error ? error.message : String(error));
    }
  }
}

/**
 * Create file validation middleware
 */
export function createFileValidator(options?: ValidationOptions) {
  const validator = new FileValidator(options);
  return validator.validateFile;
}