import {
  BlobServiceClient,
  BlockBlobClient,
} from '@azure/storage-blob';
import { AzureStorageConfig } from '../types';
import { IStorageAdapter } from './storage.interface';
import { Readable } from 'stream';

export class AzureStorageAdapter implements IStorageAdapter {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor(config: AzureStorageConfig) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      config.connectionString
    );
    this.containerName = config.containerName;
  }

  private async getBlockBlobClient(
    fileName: string
  ): Promise<BlockBlobClient> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName
    );
    await containerClient.createIfNotExists({ access: 'blob' });
    return containerClient.getBlockBlobClient(fileName);
  }

  async upload(
    fileName: string,
    fileStream: Readable,
    mimetype: string
  ): Promise<string> {
    const blockBlobClient = await this.getBlockBlobClient(fileName);

    await blockBlobClient.uploadStream(fileStream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    return blockBlobClient.url;
  }
}
