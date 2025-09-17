// src/storage/local.adapter.ts
import { IStorageAdapter } from './storage.interface';
import fs from 'fs';
import path from 'path';
import { finished } from 'stream/promises';

export interface LocalStorageConfig {
  /**
   * The directory where files will be uploaded.
   * This path should be absolute or relative to the project root.
   */
  uploadDir: string;
  /**
   * The base URL from which the files will be served.
   * e.g., '/uploads' or 'https://my-cdn.com/uploads'
   */
  baseUrl: string;
}

export class LocalStorageAdapter implements IStorageAdapter {
  private config: LocalStorageConfig;

  constructor(config: LocalStorageConfig) {
    this.config = config;
    // Ensure the upload directory exists
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
  }

  async upload(fileKey: string, stream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const filePath = path.join(this.config.uploadDir, fileKey);
    const dir = path.dirname(filePath);

    // Ensure the directory for the file exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    await finished(writeStream);

    // Construct the public URL
    const url = `${this.config.baseUrl}/${fileKey}`.replace(/\\/g, '/');
    return url;
  }
}
