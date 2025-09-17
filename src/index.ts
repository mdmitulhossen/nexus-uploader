// src/index.ts
export * from './types';
export * from './fileUploadOptimizer';
export * from './errors';
export { IStorageAdapter } from './storage/storage.interface';
export { S3StorageAdapter } from './storage/s3.adapter';
export { LocalStorageAdapter } from './storage/local.adapter';
export { GCSStorageAdapter } from './storage/gcs.adapter';
export { AzureStorageAdapter } from './storage/azure.adapter';
