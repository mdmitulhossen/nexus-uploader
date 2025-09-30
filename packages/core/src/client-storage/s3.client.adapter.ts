// packages/core/src/client-storage/s3.client.adapter.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { IClientStorageAdapter } from './client-storage.interface';

export interface S3ClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  endpoint?: string;
}

export class S3ClientStorageAdapter implements IClientStorageAdapter {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: S3ClientConfig) {
    this.s3Client = new S3Client({
      region: config.region || 'us-east-1',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && {
        endpoint: config.endpoint,
        forcePathStyle: true,
      }),
    });
    this.bucket = config.bucket;
  }

  async upload(fileKey: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucket,
        Key: fileKey,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read',
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000',
      },
    });

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = (progress.loaded / progress.total) * 100;
          onProgress(percentage);
        }
      });
    }

    const result = await upload.done();
    return result.Location || `https://${this.bucket}.s3.amazonaws.com/${fileKey}`;
  }

  async getSignedUploadUrl(fileKey: string, mimeType: string, expiresIn: number = 3600): Promise<string> {
    // For signed URLs, we'd need to implement presigned URL generation
    // This is a simplified version - in production, this should be done server-side for security
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: mimeType,
    });

    // Note: This is not secure for production - signed URLs should be generated server-side
    // This is just for demonstration of the interface
    throw new Error('Signed URL generation should be done server-side for security reasons');
  }
}