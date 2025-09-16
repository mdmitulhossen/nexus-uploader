import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import httpStatus from 'http-status';
import { optimizedUpload } from '../utils/advanceUploadImage';
import ApiError from '../error/ApiErrors';


export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ANY';

export interface FieldConfig {
  name: string;
  maxCount: number;
  type: FileType | FileType[]; 
}

export interface FileUploadConfig {
  fields: FieldConfig[];
}


const FILE_TYPE_CONFIG: Record<
  FileType,
  { mimeTypes: string[]; maxSize: number }
> = {
  IMAGE: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 25 * 1024 * 1024, // 25 MB
  },
  VIDEO: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 200 * 1024 * 1024, // 200 MB
  },
  DOCUMENT: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
  ANY: {
    mimeTypes: [], 
    maxSize: 200 * 1024 * 1024, // Default to a generous limit
  },
};

/**
 * Middleware Factory: Creates a tailored set of file upload middleware.
 *
 * This function is the core of the advanced upload system. It takes a configuration
 * object that specifies which fields to expect, how many files each can have,
 * and what types of files are allowed. It then returns an array of Express
 * middleware handlers that perform validation, processing, and uploading.
 *
 * @param {FileUploadConfig} config - The configuration for the file uploads.
 * @returns An array of Express middleware functions.
 */
export const createUploadMiddleware = (config: FileUploadConfig) => {
  const multerFields = config.fields.map(field => ({
    name: field.name,
    maxCount: field.maxCount,
  }));

  // Create a map for quick lookups of field configurations.
  const fieldConfigMap = new Map<string, FieldConfig>(
    config.fields.map(field => [field.name, field]),
  );

  // Dynamically create the fileFilter function for multer.
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const fieldConfig = fieldConfigMap.get(file.fieldname);

    if (!fieldConfig) {
      // This should not happen if the form field names are correct.
      return cb(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Unexpected file field: ${file.fieldname}`,
        ),
      );
    }

    const allowedTypes = Array.isArray(fieldConfig.type)
      ? fieldConfig.type
      : [fieldConfig.type];

    if (allowedTypes.includes('ANY')) {
      // If 'ANY' is allowed, we skip MIME type validation at this stage.
      return cb(null, true);
    }

    // Get all allowed MIME types for the configured file types.
    const allowedMimeTypes = allowedTypes.flatMap(
      type => FILE_TYPE_CONFIG[type].mimeTypes,
    );

    if (allowedMimeTypes.includes(file.mimetype)) {
      // The file's MIME type is in the allowed list.
      cb(null, true);
    } else {
      // The file type is not allowed. Reject it.
      cb(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid file type for ${file.fieldname}. Allowed types: ${allowedTypes.join(', ')}.`,
        ),
      );
    }
  };

  // Initialize multer with the dynamic configuration.
  const multerUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
  }).fields(multerFields);

  const processAndUploadFiles = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.files || typeof req.files !== 'object') {
      return next();
    }

    try {
      const filesByField = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Process all fields concurrently.
      await Promise.all(
        Object.keys(filesByField).map(async fieldName => {
          const files = filesByField[fieldName];
          const fieldConfig = fieldConfigMap.get(fieldName);

          if (!files || !fieldConfig) return;

          // Validate file sizes and upload each file.
          const uploadPromises = files.map(async file => {
            // Determine the correct size limit for this file.
            const fileTypeCategory = (
              Array.isArray(fieldConfig.type) ? fieldConfig.type : [fieldConfig.type]
            ).find(type => {
              if (type === 'ANY') return true;
              return FILE_TYPE_CONFIG[type].mimeTypes.some(mime =>
                file.mimetype.startsWith(mime.split('/')[0]),
              );
            });

            const limit = fileTypeCategory
              ? FILE_TYPE_CONFIG[fileTypeCategory].maxSize
              : FILE_TYPE_CONFIG.DOCUMENT.maxSize; // Fallback

            if (file.size > limit) {
              throw new ApiError(
                httpStatus.BAD_REQUEST,
                `${fileTypeCategory || 'File'} for field '${fieldName}' cannot exceed ${limit / 1024 / 1024} MB.`,
              );
            }

            // Upload the file and get its URL.
            return optimizedUpload(file);
          });

          const urls = await Promise.all(uploadPromises);

          // Assign the URL(s) back to the request body.
          if (fieldConfig.maxCount === 1) {
            req.body[fieldName] = urls[0];
          } else {
            req.body[fieldName] = urls;
          }
        }),
      );

      next();
    } catch (error) {
      console.error('File upload processing middleware error:', error);
      // Ensure ApiErrors are passed on correctly.
      if (error instanceof ApiError) {
        return next(error);
      }
      // Wrap other errors in a generic ApiError.
      next(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'An error occurred during file processing and upload.',
        ),
      );
    }
  };

  return [multerUpload, processAndUploadFiles];
};
