export interface UploadConfig {
  baseUrl: string;
  chunkSize?: number;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (url: string) => void;
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

export interface UploadConfigInternal extends Required<Omit<UploadConfig, 'onProgress' | 'onError' | 'onComplete'>> {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (url: string) => void;
}