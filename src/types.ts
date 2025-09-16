// src/types.ts
export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
}

export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ANY';

export interface FileTypeConfig {
  mimeTypes: string[];
  maxSize: number;
}

export interface LifecycleHooks {
  onUploadStart?: (file: Express.Multer.File) => void | Promise<void>;
  onUploadComplete?: (file: Express.Multer.File, url: string) => void | Promise<void>;
  onUploadError?: (error: Error, file: Express.Multer.File) => void | Promise<void>;
}

export interface NexusUploaderConfig {
  s3: S3Config;
  fileTypeConfig?: Partial<Record<FileType, Partial<FileTypeConfig>>>;
  hooks?: LifecycleHooks;
}