// packages/core/src/client-storage/azure.client.adapter.ts
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { IClientStorageAdapter } from './client-storage.interface';

export interface AzureClientConfig {
  connectionString: string;
  containerName: string;
}

export class AzureClientStorageAdapter implements IClientStorageAdapter {
  private containerClient: ContainerClient;

  constructor(config: AzureClientConfig) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    this.containerClient = blobServiceClient.getContainerClient(config.containerName);
  }

  async upload(fileKey: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileKey);

    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: 'public, max-age=31536000',
      },
      metadata: {
        originalName: file.name,
      },
      onProgress: onProgress ? (progress: any) => {
        if (progress.loadedBytes && file.size) {
          const percentage = (progress.loadedBytes / file.size) * 100;
          onProgress(percentage);
        }
      } : undefined,
    };

    await blockBlobClient.upload(file, file.size, uploadOptions);

    return blockBlobClient.url;
  }
}