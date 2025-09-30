import { ChunkedUploadService } from '../chunkedUpload';
import { IStorageAdapter } from '../storage/storage.interface';
import { ChunkedUploadConfig } from '../types';

// Mock storage adapter
const mockStorageAdapter: jest.Mocked<IStorageAdapter> = {
  upload: jest.fn(),
};

describe('ChunkedUploadService', () => {
  let service: ChunkedUploadService;
  const config: ChunkedUploadConfig = {
    tempDir: '/tmp/test-chunks',
    maxChunkSize: 1024 * 1024, // 1MB
    maxFileSize: 10 * 1024 * 1024, // 10MB
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChunkedUploadService(mockStorageAdapter, config);
  });

  describe('initUpload', () => {
    it('should initialize a new upload session', async () => {
      const fileName = 'test.mp4';
      const totalSize = 5 * 1024 * 1024; // 5MB
      const mimeType = 'video/mp4';

      const result = await service.initUpload(fileName, totalSize, mimeType);

      expect(result.uploadId).toBeDefined();
      expect(typeof result.uploadId).toBe('string');
    });

    it('should throw error for file size exceeding limit', async () => {
      const fileName = 'large.mp4';
      const totalSize = 20 * 1024 * 1024; // 20MB > 10MB limit
      const mimeType = 'video/mp4';

      await expect(service.initUpload(fileName, totalSize, mimeType)).rejects.toThrow();
    });
  });

  describe('uploadChunk', () => {
    it('should upload a chunk successfully', async () => {
      const fileName = 'test.mp4';
      const totalSize = 2 * 1024 * 1024; // 2MB
      const mimeType = 'video/mp4';

      const { uploadId } = await service.initUpload(fileName, totalSize, mimeType);
      const chunkData = Buffer.from('chunk data');

      const result = await service.uploadChunk(uploadId, 0, chunkData);

      expect(result.success).toBe(true);
    });

    it('should throw error for invalid upload ID', async () => {
      const chunkData = Buffer.from('chunk data');

      await expect(service.uploadChunk('invalid-id', 0, chunkData)).rejects.toThrow('Upload session not found');
    });
  });

  describe('completeUpload', () => {
    it('should complete upload and return URL', async () => {
      const fileName = 'test.mp4';
      const totalSize = 1024; // 1KB
      const mimeType = 'video/mp4';

      const { uploadId } = await service.initUpload(fileName, totalSize, mimeType);
      const chunkData = Buffer.from('test data');

      await service.uploadChunk(uploadId, 0, chunkData);
      mockStorageAdapter.upload.mockResolvedValue('https://example.com/test.mp4');

      const result = await service.completeUpload(uploadId);

      expect(result.url).toBe('https://example.com/test.mp4');
      expect(mockStorageAdapter.upload).toHaveBeenCalled();
    });

    it('should throw error if chunks are missing', async () => {
      const fileName = 'test.mp4';
      const totalSize = 2 * 1024; // 2KB
      const mimeType = 'video/mp4';

      const { uploadId } = await service.initUpload(fileName, totalSize, mimeType);
      // Only upload chunk 0, missing chunk 1

      await expect(service.completeUpload(uploadId)).rejects.toThrow('Missing chunks');
    });
  });

  describe('getUploadProgress', () => {
    it('should return upload progress', async () => {
      const fileName = 'test.mp4';
      const totalSize = 3 * 1024 * 1024; // 3MB > 1MB chunk size
      const mimeType = 'video/mp4';

      const { uploadId } = await service.initUpload(fileName, totalSize, mimeType);
      await service.uploadChunk(uploadId, 0, Buffer.from('data'));

      const progress = service.getUploadProgress(uploadId);

      expect(progress).toEqual({
        uploadedChunks: 1,
        totalChunks: 3, // 3MB / 1MB = 3 chunks
      });
    });

    it('should return null for invalid upload ID', () => {
      const progress = service.getUploadProgress('invalid-id');

      expect(progress).toBeNull();
    });
  });
});
