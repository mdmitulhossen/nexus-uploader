import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { UploaderService } from './advanceUploadImage';
import { FileType, NexusUploaderConfig, FileTypeConfig } from './types';

export interface FieldConfig { name: string; maxCount: number; type: FileType | FileType[]; }
export interface FileUploadConfig { fields: FieldConfig[]; }

const DEFAULT_FILE_TYPE_CONFIG: Record<FileType, FileTypeConfig> = {
    IMAGE: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], maxSize: 25 * 1024 * 1024 },
    VIDEO: { mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'], maxSize: 200 * 1024 * 1024 },
    DOCUMENT: { mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], maxSize: 10 * 1024 * 1024 },
    ANY: { mimeTypes: [], maxSize: 200 * 1024 * 1024 },
};

export const createUploadMiddleware = (uploadConfig: FileUploadConfig, uploaderService: UploaderService, nexusConfig?: NexusUploaderConfig) => {
    const fileTypeConfig = {
        ...DEFAULT_FILE_TYPE_CONFIG,
        ...(nexusConfig?.fileTypeConfig && Object.entries(nexusConfig.fileTypeConfig).reduce((acc, [key, value]) => {
            const type = key as FileType;
            acc[type] = { ...DEFAULT_FILE_TYPE_CONFIG[type], ...value };
            return acc;
        }, {} as Record<FileType, FileTypeConfig>))
    };

    const multerFields = uploadConfig.fields.map(field => ({ name: field.name, maxCount: field.maxCount }));
    const fieldConfigMap = new Map<string, FieldConfig>(uploadConfig.fields.map(field => [field.name, field]));

    const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const fieldConfig = fieldConfigMap.get(file.fieldname);
        if (!fieldConfig) return cb(new Error(`Unexpected file field: ${file.fieldname}`));

        const allowedTypes = Array.isArray(fieldConfig.type) ? fieldConfig.type : [fieldConfig.type];
        if (allowedTypes.includes('ANY')) return cb(null, true);

        const allowedMimeTypes = allowedTypes.flatMap(type => fileTypeConfig[type].mimeTypes);
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedTypes.join(', ')}.`));
        }
    };

    const multerUpload = multer({ storage: multer.memoryStorage(), fileFilter }).fields(multerFields);

    const processAndUploadFiles = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.files || typeof req.files !== 'object') return next();
        try {
            const filesByField = req.files as { [fieldname: string]: Express.Multer.File[] };
            await Promise.all(
                Object.keys(filesByField).map(async fieldName => {
                    const files = filesByField[fieldName];
                    const fieldConfig = fieldConfigMap.get(fieldName);
                    if (!files || !fieldConfig) return;

                    const uploadPromises = files.map(async file => {
                        const fileTypeCategory = (Array.isArray(fieldConfig.type) ? fieldConfig.type : [fieldConfig.type]).find(type => {
                            if (type === 'ANY') return true;
                            return fileTypeConfig[type].mimeTypes.some(mime => file.mimetype.startsWith(mime.split('/')[0]));
                        });
                        const limit = fileTypeCategory ? fileTypeConfig[fileTypeCategory].maxSize : fileTypeConfig.DOCUMENT.maxSize;
                        if (file.size > limit) {
                            throw new Error(`${fileTypeCategory || 'File'} for field '${fieldName}' cannot exceed ${limit / 1024 / 1024} MB.`);
                        }
                        return uploaderService.optimizedUpload(file);
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