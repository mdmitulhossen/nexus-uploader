// src/storage/storage.interface.ts

export interface IStorageAdapter {
  /**
   * Uploads a file stream to the storage.
   * @param fileKey - The unique key (path and filename) for the file in the storage.
   * @param stream - The readable stream of the file content.
   * @param mimeType - The MIME type of the file.
   * @returns A promise that resolves to the public URL of the uploaded file.
   */
  upload(fileKey: string, stream: NodeJS.ReadableStream, mimeType: string): Promise<string>;
}
