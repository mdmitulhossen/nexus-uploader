// demo-direct-upload.js
// Simple demonstration of direct upload functionality
// This would run in a browser environment

import { NexusUploader, S3ClientStorageAdapter } from 'nexus-uploader-core';

// Mock file for demonstration
const mockFile = {
  name: 'test.jpg',
  size: 1024,
  type: 'image/jpeg'
};

// Configure storage
const storage = new S3ClientStorageAdapter({
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket',
  region: 'us-east-1'
});

// Create uploader with direct storage
const uploader = new NexusUploader({
  storage,
  generateFileKey: (file) => `uploads/${Date.now()}-${file.name}`,
  onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
  onComplete: (result) => console.log('Upload complete:', result),
  onError: (error) => console.error('Upload error:', error)
});

console.log('Direct upload functionality is ready!');
console.log('Uploader configured with:', {
  hasStorage: !!uploader.config.storage,
  generateFileKey: typeof uploader.config.generateFileKey
});

export { uploader, storage };