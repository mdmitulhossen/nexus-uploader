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

export interface NexusUploaderConfig {
  s3: S3Config;
  fileTypeConfig?: Partial<Record<FileType, Partial<FileTypeConfig>>>;
}