import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ChunkedUploadConfig, ChunkMetadata } from './types';
import { IStorageAdapter } from './storage/storage.interface';
import { ProcessingError, FileSizeExceededError } from './errors';

const DEFAULT_CONFIG: Required<ChunkedUploadConfig> = {
  tempDir: path.join(os.tmpdir(), 'nexus-chunks'),
  maxChunkSize: 5 * 1024 * 1024, // 5MB
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  cleanupInterval: 60 * 60 * 1000, // 1 hour
};

export class ChunkedUploadService {
  private config: Required<ChunkedUploadConfig>;
  private storage: IStorageAdapter;
  private metadataStore: Map<string, ChunkMetadata> = new Map();

  constructor(storage: IStorageAdapter, config: ChunkedUploadConfig = {}) {
    this.storage = storage;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Ensure temp directory exists
    if (!fs.existsSync(this.config.tempDir)) {
      fs.mkdirSync(this.config.tempDir, { recursive: true });
    }

    // Start cleanup interval
    setInterval(() => this.cleanupOldChunks(), this.config.cleanupInterval);
  }

  /**
   * Initialize a new chunked upload
   */
  async initUpload(fileName: string, totalSize: number, mimeType: string): Promise<{ uploadId: string }> {
    if (totalSize > this.config.maxFileSize) {
      throw new FileSizeExceededError(`File size ${totalSize} exceeds maximum allowed size ${this.config.maxFileSize}`);
    }

    const uploadId = uuidv4();
    const metadata: ChunkMetadata = {
      uploadId,
      fileName,
      totalChunks: Math.ceil(totalSize / this.config.maxChunkSize),
      uploadedChunks: [],
      totalSize,
      mimeType,
      createdAt: new Date(),
      lastModified: new Date(),
    };

    this.metadataStore.set(uploadId, metadata);
    return { uploadId };
  }

  /**
   * Upload a chunk
   */
  async uploadChunk(uploadId: string, chunkIndex: number, chunkData: Buffer): Promise<{ success: boolean }> {
    const metadata = this.metadataStore.get(uploadId);
    if (!metadata) {
      throw new ProcessingError('Upload session not found');
    }

    if (chunkData.length > this.config.maxChunkSize) {
      throw new FileSizeExceededError(`Chunk size exceeds maximum allowed size ${this.config.maxChunkSize}`);
    }

    const chunkPath = path.join(this.config.tempDir, `${uploadId}_${chunkIndex}`);
    await fs.promises.writeFile(chunkPath, chunkData);

    metadata.uploadedChunks.push(chunkIndex);
    metadata.lastModified = new Date();
    this.metadataStore.set(uploadId, metadata);

    return { success: true };
  }

  /**
   * Complete the upload by combining chunks and uploading to storage
   */
  async completeUpload(uploadId: string): Promise<{ url: string }> {
    const metadata = this.metadataStore.get(uploadId);
    if (!metadata) {
      throw new ProcessingError('Upload session not found');
    }

    // Check if all chunks are uploaded
    const expectedChunks = Array.from({ length: metadata.totalChunks }, (_, i) => i);
    const missingChunks = expectedChunks.filter(chunk => !metadata.uploadedChunks.includes(chunk));

    if (missingChunks.length > 0) {
      throw new ProcessingError(`Missing chunks: ${missingChunks.join(', ')}`);
    }

    // Combine chunks into a single file
    const combinedPath = path.join(this.config.tempDir, `${uploadId}_combined`);
    const writeStream = fs.createWriteStream(combinedPath);

    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = path.join(this.config.tempDir, `${uploadId}_${i}`);
      const chunkData = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkData);
      // Clean up chunk file
      await fs.promises.unlink(chunkPath);
    }

    writeStream.end();

    // Wait for write to complete
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Upload to storage
    const readStream = fs.createReadStream(combinedPath);
    const fileKey = `uploads/${uuidv4()}-${metadata.fileName}`;
    const url = await this.storage.upload(fileKey, readStream, metadata.mimeType);

    // Clean up combined file and metadata
    await fs.promises.unlink(combinedPath);
    this.metadataStore.delete(uploadId);

    return { url };
  }

  /**
   * Get upload progress
   */
  getUploadProgress(uploadId: string): { uploadedChunks: number; totalChunks: number } | null {
    const metadata = this.metadataStore.get(uploadId);
    if (!metadata) return null;

    return {
      uploadedChunks: metadata.uploadedChunks.length,
      totalChunks: metadata.totalChunks,
    };
  }

  /**
   * Clean up old chunks and metadata
   */
  private cleanupOldChunks(): void {
    const now = Date.now();
    const maxAge = this.config.cleanupInterval;

    for (const [uploadId, metadata] of this.metadataStore.entries()) {
      if (now - metadata.lastModified.getTime() > maxAge) {
        // Clean up chunks
        for (const chunkIndex of metadata.uploadedChunks) {
          const chunkPath = path.join(this.config.tempDir, `${uploadId}_${chunkIndex}`);
          fs.unlink(chunkPath, () => {}); // Ignore errors
        }
        // Clean up combined file if exists
        const combinedPath = path.join(this.config.tempDir, `${uploadId}_combined`);
        fs.unlink(combinedPath, () => {}); // Ignore errors

        this.metadataStore.delete(uploadId);
      }
    }
  }
}

/**
 * Express middleware for chunked uploads
 */
export const createChunkedUploadMiddleware = (
  storage: IStorageAdapter,
  config: ChunkedUploadConfig = {}
) => {
  const service = new ChunkedUploadService(storage, config);

  return {
    init: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { fileName, totalSize, mimeType } = req.body;
        const result = await service.initUpload(fileName, parseInt(totalSize), mimeType);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },

    uploadChunk: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { uploadId, chunkIndex } = req.body;
        const chunkData = req.file?.buffer;
        if (!chunkData) {
          return res.status(400).json({ error: 'No chunk data provided' });
        }
        const result = await service.uploadChunk(uploadId, parseInt(chunkIndex), chunkData);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },

    complete: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { uploadId } = req.body;
        const result = await service.completeUpload(uploadId);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },

    getProgress: (req: Request, res: Response) => {
      const { uploadId } = req.params;
      const progress = service.getUploadProgress(uploadId);
      if (!progress) {
        return res.status(404).json({ error: 'Upload session not found' });
      }
      res.json(progress);
    },
  };
};
