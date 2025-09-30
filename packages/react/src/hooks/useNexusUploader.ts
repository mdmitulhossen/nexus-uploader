import { useState, useCallback } from 'react';
import { NexusUploader, UploadConfig, UploadResult, IClientStorageAdapter } from 'nexus-uploader-core';

export interface UseNexusUploaderOptions extends Omit<UploadConfig, 'onProgress' | 'onError' | 'onComplete'> {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: UploadResult) => void;
  // Direct upload options
  storage?: IClientStorageAdapter;
  generateFileKey?: (file: File) => string;
}

export function useNexusUploader(options: UseNexusUploaderOptions) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const uploader = new NexusUploader({
    ...options,
    onProgress: (p: number) => {
      setProgress(p);
      options.onProgress?.(p);
    },
    onError: (err: Error) => {
      setError(err);
      options.onError?.(err);
    },
    onComplete: (url: string) => {
      // Note: onComplete expects url string, but we have full result
      // We'll handle this in the upload function
    },
  });

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);
    setResult(null);

    try {
      const uploadResult = await uploader.uploadFile(file);
      setResult(uploadResult);
      options.onComplete?.(uploadResult);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setIsUploading(false);
    }
  }, [uploader, options]);

  const getFileUrl = useCallback(async (fileName: string, options?: { expiresIn?: number }) => {
    return await uploader.getFileUrl(fileName, options);
  }, [uploader]);

  const getFileUrls = useCallback(async (fileNames: string[], options?: { expiresIn?: number }) => {
    return await uploader.getFileUrls(fileNames, options);
  }, [uploader]);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setIsUploading(false);
    setResult(null);
  }, []);

  return {
    upload,
    progress,
    error,
    isUploading,
    result,
    getFileUrl,
    getFileUrls,
    reset,
  };
}