// src/types/memory-cache.d.ts
declare module 'memory-cache' {
  interface MemoryCache {
    put(key: string, value: any, time?: number): void;
    get(key: string): any;
    del(key: string): void;
    clear(): void;
    size(): number;
    memsize(): number;
  }

  const cache: MemoryCache;
  export = cache;
}