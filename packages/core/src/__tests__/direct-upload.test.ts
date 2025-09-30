// packages/core/src/__tests__/direct-upload.test.ts
import { NexusUploader } from '../uploader';
import { S3ClientStorageAdapter } from '../client-storage';

describe('Direct Upload', () => {
  it('should initialize uploader with storage adapter', () => {
    const mockStorage = {
      upload: jest.fn().mockResolvedValue('https://example.com/file.jpg')
    } as any;

    const uploader = new NexusUploader({
      storage: mockStorage
    });

    expect(uploader).toBeDefined();
  });

  it('should throw error when accessing file URLs without baseUrl', async () => {
    const mockStorage = {
      upload: jest.fn().mockResolvedValue('https://example.com/file.jpg')
    } as any;

    const uploader = new NexusUploader({
      storage: mockStorage
    });

    await expect(uploader.getFileUrl('test.jpg')).rejects.toThrow(
      'getFileUrl requires baseUrl to be configured for backend file access'
    );
  });
});