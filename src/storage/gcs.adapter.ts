import { Storage } from '@google-cloud/storage';
import { GCSStorageConfig } from '../types';
import { IStorageAdapter } from './storage.interface';
import { Readable } from 'stream';

export class GCSStorageAdapter implements IStorageAdapter {
  private storage: Storage;
  private bucketName: string;

  constructor(config: GCSStorageConfig) {
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
    this.bucketName = config.bucket;
  }

  async upload(
    fileName: string,
    fileStream: Readable,
    mimetype: string
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      fileStream
        .pipe(writeStream)
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
          resolve(publicUrl);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
