import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PassThrough } from 'stream';
import { IStorageAdapter } from './storage/storage.interface';
import { ProcessingError } from './errors';

export class UploaderService {
  private storage: IStorageAdapter;

  constructor(storageAdapter: IStorageAdapter) {
    this.storage = storageAdapter;
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  }

  private async uploadStreamToStorage(
    fileKey: string,
    stream: NodeJS.ReadableStream,
    mimeType: string,
  ): Promise<string> {
      return this.storage.upload(fileKey, stream, mimeType);
  }

  async optimizedUpload(file: Express.Multer.File): Promise<string> {
    if (!file) {
        throw new Error('No file provided for upload.');
    }
    const fileType = file.mimetype.split('/')[0];

    if (fileType === 'image') {
      return this.processAndUploadImage(file);
    }
    if (fileType === 'video') {
      return this.processAndUploadVideo(file);
    }
    return this.uploadGenericFile(file);
  }

  private async processAndUploadImage(file: Express.Multer.File): Promise<string> {
    const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
    const baseName = path.basename(sanitizedOriginalName, path.extname(sanitizedOriginalName));
    const fileKey = `images/${uuidv4()}-${baseName}.webp`;

    const transformer = sharp().webp({ quality: 80, effort: 4 }).withMetadata();
    
    const readable = new PassThrough();
    readable.end(file.buffer);

    const sharpStream = readable.pipe(transformer);

    return this.uploadStreamToStorage(fileKey, sharpStream, 'image/webp');
  }

  private async processAndUploadVideo(file: Express.Multer.File): Promise<string> {
     const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
     const baseName = path.basename(sanitizedOriginalName, path.extname(sanitizedOriginalName));
     const fileKey = `videos/${uuidv4()}-${baseName}.webm`;
     const tempInputPath = path.join(os.tmpdir(), `${uuidv4()}-${file.originalname}`);
     await fs.promises.writeFile(tempInputPath, file.buffer);
     const outputStream = new PassThrough();

     return new Promise((resolve, reject) => {
         ffmpeg(tempInputPath)
             .format('webm')
             .outputOptions('-c:v libvpx-vp9', '-crf 30', '-b:v 0', '-c:a libopus', '-b:a 128k')
             .on('error', (err) => {
                 fs.promises.unlink(tempInputPath).catch(console.error);
                 reject(new ProcessingError(`Failed to process video: ${err.message}`));
             })
             .on('end', () => {
                 fs.promises.unlink(tempInputPath).catch(console.error);
             })
             .pipe(outputStream, { end: true });

         this.uploadStreamToStorage(fileKey, outputStream, 'video/webm')
             .then(resolve)
             .catch(reject);
     });
  }

  private async uploadGenericFile(file: Express.Multer.File): Promise<string> {
     const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
     const fileKey = `documents/${uuidv4()}-${sanitizedOriginalName}`;
     const stream = new PassThrough();
     stream.end(file.buffer);
     return this.uploadStreamToStorage(fileKey, stream, file.mimetype);
  }
}