import { IStorageAdapter } from './storage/storage.interface';

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
}

export interface LocalStorageConfig {
  destination: string;
}

export interface GCSStorageConfig {
  bucket: string;
  projectId?: string;
  keyFilename?: string;
}

export interface AzureStorageConfig {
  connectionString: string;
  containerName: string;
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
  storage: IStorageAdapter;
  fileTypeConfig?: Partial<Record<FileType, Partial<FileTypeConfig>>>;
  hooks?: LifecycleHooks;
  limits?: {
    fileSize?: number | string;
  };
}