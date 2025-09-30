import axios, { AxiosResponse } from 'axios';
import { UploadConfig, UploadProgress, UploadResult, UploadConfigInternal } from './types';
import { createChunks, calculateTotalChunks } from './chunker';

export class NexusUploader {
  private config: UploadConfigInternal;

  constructor(config: UploadConfig) {
    this.config = {
      chunkSize: 5 * 1024 * 1024, // 5MB default
      maxRetries: 3,
      ...config,
    };
  }

  async uploadFile(file: File): Promise<UploadResult> {
    try {
      // Initialize upload
      const initResponse = await this.initUpload(file);
      const { uploadId } = initResponse.data;

      // Upload chunks
      const totalChunks = calculateTotalChunks(file.size, this.config.chunkSize);
      let uploadedChunks = 0;

      for (const [index, chunk] of Array.from(createChunks(file, this.config.chunkSize)).entries()) {
        await this.uploadChunkWithRetry(uploadId, chunk, index);
        uploadedChunks++;
        const progress = (uploadedChunks / totalChunks) * 100;
        this.config.onProgress?.(progress);
      }

      // Complete upload
      const completeResponse = await this.completeUpload(uploadId);
      const { url } = completeResponse.data;

      this.config.onComplete?.(url);

      return {
        url,
        fileName: file.name,
        size: file.size,
      };
    } catch (error) {
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  private async initUpload(file: File): Promise<AxiosResponse> {
    return axios.post(`${this.config.baseUrl}/upload/init`, {
      fileName: file.name,
      totalSize: file.size,
      mimeType: file.type,
    });
  }

  private async uploadChunkWithRetry(uploadId: string, chunk: Blob, index: number, attempt = 1): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', index.toString());
      formData.append('chunk', chunk);

      await axios.post(`${this.config.baseUrl}/upload/chunk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        await this.uploadChunkWithRetry(uploadId, chunk, index, attempt + 1);
      } else {
        throw error;
      }
    }
  }

  private async completeUpload(uploadId: string): Promise<AxiosResponse> {
    return axios.post(`${this.config.baseUrl}/upload/complete`, { uploadId });
  }

  async getProgress(uploadId: string): Promise<UploadProgress> {
    const response = await axios.get(`${this.config.baseUrl}/upload/progress/${uploadId}`);
    const { uploadedChunks, totalChunks } = response.data;
    return {
      uploadedChunks,
      totalChunks,
      percentage: (uploadedChunks / totalChunks) * 100,
    };
  }

  /**
   * Get the URL for a file stored in the configured storage backend
   * @param fileName - Name/key of the file in storage
   * @param options - Additional options for URL generation
   * @returns Promise resolving to the file URL
   */
  async getFileUrl(fileName: string, options?: { expiresIn?: number }): Promise<string> {
    const response = await axios.get(`${this.config.baseUrl}/files/${encodeURIComponent(fileName)}`, {
      params: options
    });
    return response.data.url;
  }

  /**
   * Get URLs for multiple files at once
   * @param fileNames - Array of file names/keys
   * @param options - Additional options for URL generation
   * @returns Promise resolving to an object mapping file names to URLs
   */
  async getFileUrls(fileNames: string[], options?: { expiresIn?: number }): Promise<Record<string, string>> {
    const response = await axios.post(`${this.config.baseUrl}/files/batch`, {
      fileNames,
      ...options
    });
    return response.data.urls;
  }
}