// packages/core/src/client-storage/gcs.client.adapter.ts
import { Storage } from '@google-cloud/storage';
import { IClientStorageAdapter } from './client-storage.interface';

export interface GCSClientConfig {
  projectId: string;
  keyFilename?: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
  bucket: string;
}

export class GCSClientStorageAdapter implements IClientStorageAdapter {
  private storage: Storage;
  private bucket: string;

  constructor(config: GCSClientConfig) {
    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
      credentials: config.credentials,
    });
    this.bucket = config.bucket;
  }

  async upload(fileKey: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(fileKey);

    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    });

    return new Promise((resolve, reject) => {
      let uploadedBytes = 0;

      stream.on('error', reject);

      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileKey}`;
        resolve(publicUrl);
      });

      // Convert File to Buffer for upload
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          const buffer = Buffer.from(event.target.result);
          stream.write(buffer);
          stream.end();
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}