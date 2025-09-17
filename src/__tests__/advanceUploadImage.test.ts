import { UploaderService } from '../advanceUploadImage';
import { IStorageAdapter } from '../storage/storage.interface';
import { PassThrough, Readable } from 'stream';
import sharp from 'sharp';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

// Mock dependencies
jest.mock('sharp', () => {
    // Return a factory function that creates a new mock instance each time
    return jest.fn(() => {
        const mockSharpInstance = new PassThrough();
        const webp = jest.fn().mockReturnThis();
        const withMetadata = jest.fn().mockReturnThis();
        Object.assign(mockSharpInstance, { webp, withMetadata });
        return mockSharpInstance;
    });
});

jest.mock('fluent-ffmpeg', () => {
    // Return a factory function that creates a new mock instance each time
    return jest.fn(() => {
        const mockFfmpegInstance: Partial<FfmpegCommand> = {
            format: jest.fn().mockReturnThis(),
            outputOptions: jest.fn().mockReturnThis(),
            on: jest.fn(function(this: FfmpegCommand, event: string, cb: (...args: any[]) => void): FfmpegCommand {
                if (event === 'end') {
                    // Simulate async completion
                    setTimeout(() => cb(null, null), 0);
                }
                return this;
            }),
            pipe: jest.fn(),
        };
        return mockFfmpegInstance as FfmpegCommand;
    });
});


// Mock storage adapter
const mockStorageAdapter: jest.Mocked<IStorageAdapter> = {
  upload: jest.fn(),
};

describe('UploaderService', () => {
  let uploaderService: UploaderService;

  beforeEach(() => {
    jest.clearAllMocks();
    uploaderService = new UploaderService(mockStorageAdapter);
  });

  describe('optimizedUpload', () => {
    it('should process and upload an image', async () => {
      const file: Express.Multer.File = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        size: 100,
        fieldname: 'test',
        encoding: 'utf8',
        destination: '',
        filename: '',
        path: '',
        stream: new PassThrough(),
      };

      mockStorageAdapter.upload.mockResolvedValue('https://example.com/image.webp');

      const url = await uploaderService.optimizedUpload(file);
      
      expect(url).toBe('https://example.com/image.webp');
      expect(sharp).toHaveBeenCalled();
      expect(mockStorageAdapter.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^images\/.*\.webp$/),
        expect.any(Readable),
        'image/webp'
      );
    });

    it('should throw an error on storage upload failure', async () => {
        const file: Express.Multer.File = {
            mimetype: 'image/jpeg',
            originalname: 'test.jpg',
            buffer: Buffer.from('test'),
            size: 100,
            fieldname: 'test',
            encoding: 'utf8',
            destination: '',
            filename: '',
            path: '',
            stream: new PassThrough(),
          };

      mockStorageAdapter.upload.mockRejectedValue(new Error('Storage Error'));

      await expect(uploaderService.optimizedUpload(file)).rejects.toThrow('Storage Error');
    });

    it('should handle generic file uploads', async () => {
        const file: Express.Multer.File = {
            mimetype: 'application/pdf',
            originalname: 'document.pdf',
            buffer: Buffer.from('pdf content'),
            size: 1024,
            fieldname: 'doc',
            encoding: 'utf8',
            destination: '',
            filename: '',
            path: '',
            stream: new PassThrough(),
        };

        mockStorageAdapter.upload.mockResolvedValue('https://example.com/document.pdf');

        const url = await uploaderService.optimizedUpload(file);

        expect(url).toBe('https://example.com/document.pdf');
        expect(mockStorageAdapter.upload).toHaveBeenCalledWith(
            expect.stringMatching(/^documents\/.*\.pdf$/),
            expect.any(Readable),
            'application/pdf'
        );
    });

    it('should process and upload a video', async () => {
        const file: Express.Multer.File = {
            mimetype: 'video/mp4',
            originalname: 'test.mp4',
            buffer: Buffer.from('video content'),
            size: 1024,
            fieldname: 'video',
            encoding: 'utf8',
            destination: '',
            filename: '',
            path: '',
            stream: new PassThrough(),
        };

        mockStorageAdapter.upload.mockResolvedValue('https://example.com/video.webm');

        const url = await uploaderService.optimizedUpload(file);

        expect(url).toBe('https://example.com/video.webm');
        expect(ffmpeg).toHaveBeenCalled();
        expect(mockStorageAdapter.upload).toHaveBeenCalledWith(
            expect.stringMatching(/^videos\/.*\.webm$/),
            expect.any(PassThrough),
            'video/webm'
        );
    });
  });
});
