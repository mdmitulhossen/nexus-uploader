import { GCSStorageAdapter } from '../storage/gcs.adapter';
import { GCSStorageConfig } from '../types';
import { Readable, Writable } from 'stream';

// Mock the @google-cloud/storage library
const mockCreateWriteStream = jest.fn(() => {
  const writable = new Writable({
    write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
      callback();
    },
  });
  // Simulate the finish event for a successful upload
  setTimeout(() => writable.emit('finish'), 10);
  return writable;
});

const mockFile = jest.fn(() => ({
  createWriteStream: mockCreateWriteStream,
}));

const mockBucket = jest.fn(() => ({
  file: mockFile,
}));

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn(() => ({
    bucket: mockBucket,
  })),
}));

describe('GCSStorageAdapter', () => {
  let adapter: GCSStorageAdapter;
  const config: GCSStorageConfig = {
    bucket: 'test-bucket',
    projectId: 'test-project',
  };

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    adapter = new GCSStorageAdapter(config);
  });

  it('should upload a file and return a public URL', async () => {
    const fileName = 'test-file.txt';
    const fileStream = new Readable();
    fileStream.push('hello world');
    fileStream.push(null); // End the stream
    const mimetype = 'text/plain';

    const publicUrl = await adapter.upload(fileName, fileStream, mimetype);

    expect(mockBucket).toHaveBeenCalledWith(config.bucket);
    expect(mockFile).toHaveBeenCalledWith(fileName);
    expect(mockCreateWriteStream).toHaveBeenCalledWith({
      metadata: {
        contentType: mimetype,
      },
    });
    expect(publicUrl).toBe(
      `https://storage.googleapis.com/${config.bucket}/${fileName}`
    );
  });

  it('should reject the promise on a stream error', async () => {
    const error = new Error('Upload failed');
    // Configure the mock stream to emit an error
    mockCreateWriteStream.mockImplementationOnce(() => {
      const writable = new Writable({
        write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
            // Immediately call back with an error to simulate a write failure
            callback(error);
        },
      });
      // The 'error' event will be emitted by the stream when write fails
      return writable;
    });

    const fileName = 'error-file.txt';
    const fileStream = new Readable();
    fileStream.push('some data');
    fileStream.push(null);
    const mimetype = 'text/plain';

    // We need to wrap the call in a promise that rejects
    await expect(adapter.upload(fileName, fileStream, mimetype)).rejects.toThrow('Upload failed');
  });
});
