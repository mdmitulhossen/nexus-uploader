// src/advanceUploadImage.ts
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PassThrough } from 'stream';
import { S3Config } from './types';

// This class will hold the S3 client and perform uploads
export class UploaderService {
  private s3: AWS.S3;
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
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
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  }

  private async uploadStreamToSpaces(
    fileKey: string,
    stream: NodeJS.ReadableStream,
    mimeType: string,
  ): Promise<string> {
    const params = {
      Bucket: this.config.bucket,
      Key: fileKey,
      Body: stream,
      ACL: 'public-read',
      ContentType: mimeType,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000',
    };
    const data = await this.s3.upload(params).promise();
    return data.Location.replace(/^http:/, 'https');
  }

  private async processAndUploadImage(file: Express.Multer.File): Promise<string> {
    const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
    const baseName = path.basename(sanitizedOriginalName, path.extname(sanitizedOriginalName));
    const fileKey = `images/${uuidv4()}-${baseName}.webp`;

    const transformer = sharp().webp({ quality: 80, effort: 4 }).withMetadata();
    const sharpStream = new PassThrough();
    transformer.pipe(sharpStream);
    sharp(file.buffer).pipe(transformer);

    return this.uploadStreamToSpaces(fileKey, sharpStream, 'image/webp');
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
                 reject(new Error(`Failed to process video: ${err.message}`));
             })
             .on('end', () => {
                 fs.promises.unlink(tempInputPath).catch(console.error);
             })
             .pipe(outputStream, { end: true });

         this.uploadStreamToSpaces(fileKey, outputStream, 'video/webm')
             .then(resolve)
             .catch(reject);
     });
  }

  private async uploadGenericFile(file: Express.Multer.File): Promise<string> {
     const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
     const fileKey = `documents/${uuidv4()}-${sanitizedOriginalName}`;
     const stream = new PassThrough();
     stream.end(file.buffer);
     return this.uploadStreamToSpaces(fileKey, stream, file.mimetype);
  }

  public async optimizedUpload(file: Express.Multer.File): Promise<string> {
     if (!file) {
         throw new Error('No file provided for upload.');
     }
     const mimeType = file.mimetype;
     if (mimeType.startsWith('image/')) {
         return this.processAndUploadImage(file);
     } else if (mimeType.startsWith('video/')) {
         return this.processAndUploadVideo(file);
     } else {
         return this.uploadGenericFile(file);
     }
  }
}