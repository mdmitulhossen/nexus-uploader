import { AzureStorageAdapter } from '../storage/azure.adapter';
import { AzureStorageConfig } from '../types';
import { Readable } from 'stream';

// Mock the @azure/storage-blob library
const mockUploadStream = jest.fn(() => Promise.resolve({} as any));
const mockGetBlockBlobClient = jest.fn(() => ({
  uploadStream: mockUploadStream,
  url: 'https://fake-azure-url.com/test-container/test-file.txt',
}));
const mockCreateIfNotExists = jest.fn(() => Promise.resolve({} as any));
const mockGetContainerClient = jest.fn(() => ({
  createIfNotExists: mockCreateIfNotExists,
  getBlockBlobClient: mockGetBlockBlobClient,
}));

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      getContainerClient: mockGetContainerClient,
    })),
  },
}));

describe('AzureStorageAdapter', () => {
  let adapter: AzureStorageAdapter;
  const config: AzureStorageConfig = {
    connectionString: 'fake-connection-string',
    containerName: 'test-container',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AzureStorageAdapter(config);
  });

  it('should upload a file and return the blob URL', async () => {
    const fileName = 'test-file.txt';
    const fileStream = new Readable();
    fileStream.push('hello azure');
    fileStream.push(null);
    const mimetype = 'text/plain';

    const url = await adapter.upload(fileName, fileStream, mimetype);

    expect(mockGetContainerClient).toHaveBeenCalledWith(config.containerName);
    expect(mockCreateIfNotExists).toHaveBeenCalledWith({ access: 'blob' });
    expect(mockGetBlockBlobClient).toHaveBeenCalledWith(fileName);
    expect(mockUploadStream).toHaveBeenCalledWith(
      fileStream,
      undefined,
      undefined,
      {
        blobHTTPHeaders: { blobContentType: mimetype },
      }
    );
    expect(url).toBe('https://fake-azure-url.com/test-container/test-file.txt');
  });

  it('should reject the promise on an upload error', async () => {
    const error = new Error('Azure upload failed');
    mockUploadStream.mockImplementationOnce(() => Promise.reject(error));

    const fileName = 'error-file.txt';
    const fileStream = new Readable();
    fileStream.push('some data');
    fileStream.push(null);
    const mimetype = 'text/plain';

    await expect(
      adapter.upload(fileName, fileStream, mimetype)
    ).rejects.toThrow(error);
  });
});
