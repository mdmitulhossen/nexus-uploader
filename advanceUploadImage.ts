import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PassThrough } from 'stream';
import config from '../../config';
import ApiError from '../error/ApiErrors';
import httpStatus from 'http-status';

// --- S3 Configuration (similar to your existing file) ---
const spacesEndpoint = new AWS.Endpoint(config.DO_SPACE_ENDPOINT as string);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.DO_SPACE_ACCESS_KEY,
  secretAccessKey: config.DO_SPACE_SECRET_KEY,
  s3ForcePathStyle: false,
  signatureVersion: 'v4',
  sslEnabled: true,
  region: 'us-east-1',
});

/**
 * Sanitizes a filename to remove potentially harmful characters.
 * @param filename The original filename.
 * @returns A sanitized filename.
 */
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

/**
 * Uploads a file stream to DigitalOcean Spaces.
 * This is a core function that handles the actual upload.
 * @param fileKey The unique key (path) for the file in the bucket.
 * @param stream The readable stream of the file content.
 * @param mimeType The MIME type of the file.
 * @returns The public URL of the uploaded file.
 */
const uploadStreamToSpaces = async (
  fileKey: string,
  stream: NodeJS.ReadableStream,
  mimeType: string,
): Promise<string> => {
  if (!config.DO_SPACE_BUCKET) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'DigitalOcean Spaces bucket name is not configured.',
    );
  }

  const params = {
    Bucket: config.DO_SPACE_BUCKET,
    Key: fileKey,
    Body: stream,
    ACL: 'public-read',
    ContentType: mimeType,
    ContentDisposition: 'inline',
    CacheControl: 'public, max-age=31536000',
  };

  try {
    const data = await s3.upload(params).promise();
    // Ensure the URL is always HTTPS
    return data.Location.replace(/^http:/, 'https');
  } catch (error) {
    console.error('Error uploading stream to DigitalOcean Spaces:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to upload file stream.',
    );
  }
};

/**
 * Processes and uploads an image file.
 * Compresses and converts the image to WebP format for optimal web performance.
 * @param file The uploaded image file from Multer.
 * @returns The public URL of the processed and uploaded image.
 */
const processAndUploadImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const fileExtension = path.extname(sanitizedOriginalName);
  const baseName = path.basename(sanitizedOriginalName, fileExtension);
  const fileKey = `images/${uuidv4()}-${baseName}.webp`;

  // Create a transformation stream with sharp
  const transformer = sharp()
    .webp({ quality: 80, effort: 4 }) // High quality, good compression
    .withMetadata();

  // Pipe the file buffer into the transformer
  const sharpStream = new PassThrough();
  transformer.pipe(sharpStream);
  sharp(file.buffer).pipe(transformer);

  return uploadStreamToSpaces(fileKey, sharpStream, 'image/webp');
};

/**
 * Processes and uploads a video file.
 * Converts the video to WebM format.
 * NOTE: This requires `ffmpeg` to be installed on the server's host machine.
 * @param file The uploaded video file from Multer.
 * @returns The public URL of the processed and uploaded video.
 */
const processAndUploadVideo = async (
  file: Express.Multer.File,
): Promise<string> => {
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const fileExtension = path.extname(sanitizedOriginalName);
  const baseName = path.basename(sanitizedOriginalName, fileExtension);
  const fileKey = `videos/${uuidv4()}-${baseName}.webm`;

  const tempInputPath = path.join(os.tmpdir(), `${uuidv4()}-${file.originalname}`);
  await fs.promises.writeFile(tempInputPath, file.buffer);

  const outputStream = new PassThrough();

  return new Promise((resolve, reject) => {
    ffmpeg(tempInputPath)
      .format('webm')
      .outputOptions('-c:v libvpx-vp9', '-crf 30', '-b:v 0', '-c:a libopus', '-b:a 128k')
      .on('start', commandLine => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg Error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        fs.promises.unlink(tempInputPath).catch(console.error); // Clean up temp file
        reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to process video.'));
      })
      .on('end', () => {
        console.log('Video processing finished.');
        fs.promises.unlink(tempInputPath).catch(console.error); // Clean up temp file
        // The upload will resolve the promise once it's done
      })
      .pipe(outputStream, { end: true });

    // Upload the processed stream and resolve the promise with the URL
    uploadStreamToSpaces(fileKey, outputStream, 'video/webm')
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Uploads a generic file without processing.
 * @param file The uploaded file from Multer.
 * @returns The public URL of the uploaded file.
 */
const uploadGenericFile = async (
  file: Express.Multer.File,
): Promise<string> => {
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const fileKey = `documents/${uuidv4()}-${sanitizedOriginalName}`;
  const stream = new PassThrough();
  stream.end(file.buffer);

  return uploadStreamToSpaces(fileKey, stream, file.mimetype);
};

/**
 * Main function to handle advanced file uploads.
 * It intelligently detects the file type and routes it to the appropriate
 * processing pipeline (image, video, or generic) before uploading to S3.
 *
 * @param file The file uploaded via Multer.
 * @returns A promise that resolves to the public URL of the uploaded file.
 */
export const optimizedUpload = async (
  file: Express.Multer.File,
): Promise<string> => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file provided for upload.');
  }

  const mimeType = file.mimetype;

  if (mimeType.startsWith('image/')) {
    return processAndUploadImage(file);
  } else if (mimeType.startsWith('video/')) {
    return processAndUploadVideo(file);
  } else {
    return uploadGenericFile(file);
  }
};

/**
 * Deletes a file from DigitalOcean Spaces using its public URL.
 * @param fileUrl The public URL of the file to delete.
 */
export const removeFileFromSpaces = async (fileUrl: string): Promise<void> => {
  try {
    const url = new URL(fileUrl);
    // The key is the pathname without the leading '/'
    const fileKey = url.pathname.substring(1);

    if (!config.DO_SPACE_BUCKET) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'DigitalOcean Spaces bucket name is not configured.',
      );
    }

    const params = {
      Bucket: config.DO_SPACE_BUCKET,
      Key: decodeURIComponent(fileKey),
    };

    await s3.deleteObject(params).promise();
    console.log(`File ${fileKey} deleted successfully from DigitalOcean Spaces.`);
  } catch (error) {
    console.error('Error deleting file from DigitalOcean Spaces:', error);
    // We don't throw an error that crashes the app, just log it.
    // Deletion failure is often not a critical user-facing error.
  }
};
