export interface UploadConfig {
  baseUrl?: string; // Optional for direct uploads
  chunkSize?: number;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (url: string) => void;
  // Direct upload options
  storage?: IClientStorageAdapter;
  generateFileKey?: (file: File) => string;
}

export interface UploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

export interface UploadConfigInternal extends Required<Omit<UploadConfig, 'onProgress' | 'onError' | 'onComplete' | 'baseUrl' | 'storage' | 'generateFileKey'>> {
  baseUrl?: string;
  storage?: IClientStorageAdapter;
  generateFileKey?: (file: File) => string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (url: string) => void;
}

// Import the client storage interface
import { IClientStorageAdapter } from './client-storage';