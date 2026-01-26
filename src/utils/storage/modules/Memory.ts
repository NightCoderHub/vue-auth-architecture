// src/utils/storage/modules/Memory.ts

/**
 * 内存二级缓存 (L2 Cache)
 * 减少 JSON.parse 开销，提升频繁读取性能
 */
export class MemoryCache {
  private cache = new Map<string, any>();

  constructor() {}

  /**
   * 获取内存缓存
   */
  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * 设置内存缓存
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  /**
   * 移除内存缓存
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空内存缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查是否包含 Key
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
}
