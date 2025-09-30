// packages/core/src/client-storage/client-storage.interface.ts

export interface IClientStorageAdapter {
  /**
   * Uploads a file directly to storage from the browser
   * @param fileKey - The unique key (path and filename) for the file in the storage
   * @param file - The File object to upload
   * @param onProgress - Optional progress callback
   * @returns A promise that resolves to the public URL of the uploaded file
   */
  upload(fileKey: string, file: File, onProgress?: (progress: number) => void): Promise<string>;

  /**
   * Get a signed URL for direct upload (for presigned URL uploads)
   * @param fileKey - The unique key for the file
   * @param mimeType - The MIME type of the file
   * @param expiresIn - Expiration time in seconds
   * @returns A promise that resolves to a signed URL for upload
   */
  getSignedUploadUrl?(fileKey: string, mimeType: string, expiresIn?: number): Promise<string>;
}