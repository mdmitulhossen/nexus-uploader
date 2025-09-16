import { UploaderService } from '../advanceUploadImage';
import { S3UploadError } from '../errors';
import AWS from 'aws-sdk';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

// Mock dependencies
jest.mock('aws-sdk');
jest.mock('sharp');
jest.mock('fluent-ffmpeg');

const mockS3 = {
  upload: jest.fn(),
};
const mockSharp = {
  webp: jest.fn().mockReturnThis(),
  withMetadata: jest.fn().mockReturnThis(),
  pipe: jest.fn(),
};
const mockFfmpeg = jest.fn();

(AWS.S3 as unknown as jest.Mock).mockImplementation(() => mockS3);
(sharp as unknown as jest.Mock).mockImplementation(() => mockSharp);
(ffmpeg as unknown as jest.Mock).mockImplementation(() => {
    const chain = {
        format: jest.fn().mockReturnThis(),
        outputOptions: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn(),
    };
    mockFfmpeg.getMockImplementation()?.(chain);
    return chain;
});


describe('UploaderService', () => {
  let uploaderService: UploaderService;

  beforeEach(() => {
    jest.clearAllMocks();
    uploaderService = new UploaderService({
      s3: {
        endpoint: 'test-endpoint',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        bucket: 'test-bucket',
      },
    });
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

      mockS3.upload.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Location: 'https://s3.com/image.webp' }),
      });

      const url = await uploaderService.optimizedUpload(file);
      expect(url).toBe('https://s3.com/image.webp');
      expect(mockSharp.webp).toHaveBeenCalled();
      expect(mockS3.upload).toHaveBeenCalled();
    });

    it('should throw S3UploadError on S3 upload failure', async () => {
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

      mockS3.upload.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('S3 Error')),
      });

      await expect(uploaderService.optimizedUpload(file)).rejects.toThrow(S3UploadError);
    });
  });
});
