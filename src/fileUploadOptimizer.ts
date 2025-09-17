import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { UploaderService } from './advanceUploadImage';
import { FileType, NexusUploaderConfig, FileTypeConfig } from './types';
import { InvalidFileTypeError, FileSizeExceededError } from './errors';

export interface FieldConfig { name: string; maxCount: number; type: FileType | FileType[]; }
export interface FileUploadConfig { fields: FieldConfig[]; }

const DEFAULT_FILE_TYPE_CONFIG: Record<FileType, FileTypeConfig> = {
    IMAGE: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], maxSize: 25 * 1024 * 1024 },
    VIDEO: { mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'], maxSize: 200 * 1024 * 1024 },
    DOCUMENT: { mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], maxSize: 10 * 1024 * 1024 },
    ANY: { mimeTypes: [], maxSize: 200 * 1024 * 1024 },
};

export const createUploadMiddleware = (config: NexusUploaderConfig, uploadConfig: FileUploadConfig) => {
    const uploaderService = new UploaderService(config.storage);
    const fileTypeConfig = {
        ...DEFAULT_FILE_TYPE_CONFIG,
        ...(config.fileTypeConfig && Object.entries(config.fileTypeConfig).reduce((acc, [key, value]) => {
            const type = key as FileType;
            acc[type] = { ...DEFAULT_FILE_TYPE_CONFIG[type], ...value };
            return acc;
        }, {} as Record<FileType, FileTypeConfig>))
    };

    const multerFields = uploadConfig.fields.map(field => ({ name: field.name, maxCount: field.maxCount }));
    const fieldConfigMap = new Map<string, FieldConfig>(uploadConfig.fields.map(field => [field.name, field]));

    const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const fieldConfig = fieldConfigMap.get(file.fieldname);
        if (!fieldConfig) return cb(new InvalidFileTypeError(`Unexpected file field: ${file.fieldname}`));

        const allowedTypes = Array.isArray(fieldConfig.type) ? fieldConfig.type : [fieldConfig.type];
        if (allowedTypes.includes('ANY')) return cb(null, true);

        const allowedMimeTypes = allowedTypes.flatMap(type => fileTypeConfig[type].mimeTypes);
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new InvalidFileTypeError(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedTypes.join(', ')}.`));
        }
    };

    const multerUpload = multer({ storage: multer.memoryStorage(), fileFilter }).fields(multerFields);

    const processAndUploadFiles = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.files || typeof req.files !== 'object') return next();
        
        const hooks = config.hooks;

        try {
            const filesByField = req.files as { [fieldname: string]: Express.Multer.File[] };
            await Promise.all(
                Object.keys(filesByField).map(async fieldName => {
                    const files = filesByField[fieldName];
                    const fieldConfig = fieldConfigMap.get(fieldName);
                    if (!files || !fieldConfig) return;

                    const uploadPromises = files.map(async file => {
                        try {
                            await hooks?.onUploadStart?.(file);

                            const fileTypeCategory = (Array.isArray(fieldConfig.type) ? fieldConfig.type : [fieldConfig.type]).find(type => {
                                if (type === 'ANY') return true;
                                // Check based on mime type category (e.g., 'image' for 'image/jpeg')
                                const mimeCategory = file.mimetype.split('/')[0];
                                const typeMimeCategories = fileTypeConfig[type].mimeTypes.map(m => m.split('/')[0]);
                                return typeMimeCategories.includes(mimeCategory);
                            });
                            
                            const limit = fileTypeCategory ? fileTypeConfig[fileTypeCategory].maxSize : fileTypeConfig.ANY.maxSize;
                            if (file.size > limit) {
                                throw new FileSizeExceededError(`${fileTypeCategory || 'File'} for field '${fieldName}' cannot exceed ${limit / 1024 / 1024} MB.`);
                            }
                            
                            const url = await uploaderService.optimizedUpload(file);
                            await hooks?.onUploadComplete?.(file, url);
                            return url;
                        } catch (error) {
                            await hooks?.onUploadError?.(error as Error, file);
                            throw error; // Re-throw the error to be caught by the outer catch block
                        }
                    });

                    const urls = await Promise.all(uploadPromises);
                    req.body[fieldName] = fieldConfig.maxCount === 1 ? urls[0] : urls;
                })
            );
            next();
        } catch (error) {
            next(error);
        }
    };

    return [multerUpload, processAndUploadFiles];
};