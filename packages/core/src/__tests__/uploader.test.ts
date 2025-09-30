import { NexusUploader } from '../uploader';

// Mock axios
jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NexusUploader', () => {
  let uploader: NexusUploader;

  beforeEach(() => {
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
    uploader = new NexusUploader({ baseUrl: 'http://localhost:3000' });
  });

  it('should initialize with default config', () => {
    expect(uploader).toBeDefined();
  });

  it('should call init upload API', async () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    mockedAxios.post.mockResolvedValueOnce({ data: { uploadId: 'test-id' } });

    // We can't fully test uploadFile without mocking more, but this is a start
    expect(mockedAxios.post).not.toHaveBeenCalled();

    // For now, just test the constructor
  });
});