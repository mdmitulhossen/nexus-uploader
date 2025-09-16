// src/types.ts
export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
}

export interface NexusUploaderConfig {
  s3: S3Config;
}