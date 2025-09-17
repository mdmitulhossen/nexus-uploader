// src/storage/s3.adapter.ts
import AWS from 'aws-sdk';
import { IStorageAdapter } from './storage.interface';
import { S3UploadError } from '../errors';
import { S3Config } from '../types';

export class S3StorageAdapter implements IStorageAdapter {
  private s3: AWS.S3;
  private bucket: string;

  constructor(config: S3Config) {
    const spacesEndpoint = new AWS.Endpoint(config.endpoint);
    this.s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      s3ForcePathStyle: false,
      signatureVersion: 'v4',
      sslEnabled: true,
      region: config.region || 'us-east-1',
    });
    this.bucket = config.bucket;
  }

  async upload(fileKey: string, stream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Body: stream,
      ACL: 'public-read',
      ContentType: mimeType,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000',
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      throw new S3UploadError('Failed to upload to S3-compatible storage.', error);
    }
  }
}
