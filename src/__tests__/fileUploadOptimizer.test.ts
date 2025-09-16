import { createUploadMiddleware, UploaderService, NexusUploaderConfig, FileUploadConfig, FileType } from '../index';
import { InvalidFileTypeError, FileSizeExceededError } from '../errors';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

// Mock UploaderService
jest.mock('../advanceUploadImage');

const mockUploaderService = new UploaderService({} as any) as jest.Mocked<UploaderService>;
mockUploaderService.optimizedUpload = jest.fn().mockResolvedValue('http://mock-url.com/file.webp');

describe('createUploadMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            body: {},
            files: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    const createMockFile = (fieldname: string, size: number, mimetype: string): Express.Multer.File => ({
        fieldname,
        originalname: 'test.jpg',
        mimetype,
        buffer: Buffer.from(''),
        size,
        stream: new (require('stream').PassThrough)(),
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
    });

    it('should call onUploadStart and onUploadComplete hooks on successful upload', async () => {
        const onUploadStart = jest.fn();
        const onUploadComplete = jest.fn();

        const nexusConfigWithHooks: NexusUploaderConfig = {
            ...nexusConfig,
            hooks: { onUploadStart, onUploadComplete },
        };

        const uploadConfig: FileUploadConfig = { fields: [{ name: 'avatar', maxCount: 1, type: 'IMAGE' }] };
        const middleware = createUploadMiddleware(uploadConfig, mockUploaderService, nexusConfigWithHooks);
        const processAndUpload = middleware[1];

        const file = createMockFile('avatar', 5 * 1024 * 1024, 'image/jpeg');
        mockRequest.files = { avatar: [file] };

        await processAndUpload(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(onUploadStart).toHaveBeenCalledWith(file);
        expect(onUploadComplete).toHaveBeenCalledWith(file, 'http://mock-url.com/file.webp');
        expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call onUploadError hook on upload failure', async () => {
        const onUploadError = jest.fn();
        const nexusConfigWithHooks: NexusUploaderConfig = {
            ...nexusConfig,
            hooks: { onUploadError },
        };

        const uploadConfig: FileUploadConfig = { fields: [{ name: 'avatar', maxCount: 1, type: 'IMAGE' }] };
        const middleware = createUploadMiddleware(uploadConfig, mockUploaderService, nexusConfigWithHooks);
        const processAndUpload = middleware[1];

        const error = new Error('Upload failed');
        mockUploaderService.optimizedUpload.mockRejectedValueOnce(error);

        const file = createMockFile('avatar', 5 * 1024 * 1024, 'image/jpeg');
        mockRequest.files = { avatar: [file] };

        await processAndUpload(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(onUploadError).toHaveBeenCalledWith(error, file);
        expect(nextFunction).toHaveBeenCalledWith(error);
    });

    const nexusConfig: NexusUploaderConfig = {
        s3: {
            endpoint: 'test',
            accessKeyId: 'test',
            secretAccessKey: 'test',
            bucket: 'test',
        },
    };

    it('should call next() if no files are present', async () => {
        const uploadConfig: FileUploadConfig = { fields: [{ name: 'avatar', maxCount: 1, type: 'IMAGE' }] };
        const middleware = createUploadMiddleware(uploadConfig, mockUploaderService, nexusConfig);
        
        // The middleware is an array of functions, we are interested in the second one
        const processAndUpload = middleware[1];
        mockRequest.files = undefined;

        await processAndUpload(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
        expect(mockUploaderService.optimizedUpload).not.toHaveBeenCalled();
    });

    it('should throw FileSizeExceededError for oversized files', async () => {
        const uploadConfig: FileUploadConfig = { fields: [{ name: 'avatar', maxCount: 1, type: 'IMAGE' }] };
        const middleware = createUploadMiddleware(uploadConfig, mockUploaderService, nexusConfig);
        const processAndUpload = middleware[1];

        const largeFile = {
            fieldname: 'avatar',
            originalname: 'large.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from(''),
            size: 30 * 1024 * 1024, // 30 MB
        } as Express.Multer.File;

        mockRequest.files = { avatar: [largeFile] };

        await processAndUpload(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(expect.any(FileSizeExceededError));
    });
});
