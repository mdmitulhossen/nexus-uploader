export function* createChunks(file: File, chunkSize: number): Generator<Blob> {
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    yield file.slice(offset, offset + chunkSize);
  }
}

export function calculateTotalChunks(fileSize: number, chunkSize: number): number {
  return Math.ceil(fileSize / chunkSize);
}