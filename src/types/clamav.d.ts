// src/types/clamav.d.ts
declare module 'clamav.js' {
  interface ScannerOptions {
    host?: string;
    port?: number;
  }

  class Scanner {
    constructor(port: number, host?: string);
    scanBuffer(buffer: Buffer, timeout?: number): Promise<string>;
  }

  function createScanner(port: number, host?: string): Scanner;
}