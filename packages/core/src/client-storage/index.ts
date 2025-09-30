// packages/core/src/client-storage/index.ts
export { IClientStorageAdapter } from './client-storage.interface';
export { S3ClientStorageAdapter, S3ClientConfig } from './s3.client.adapter';
export { GCSClientStorageAdapter, GCSClientConfig } from './gcs.client.adapter';
export { AzureClientStorageAdapter, AzureClientConfig } from './azure.client.adapter';