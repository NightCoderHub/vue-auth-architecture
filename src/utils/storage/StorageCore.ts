// src/utils/storage/StorageCore.ts

import type { StorageConfig, StorageData, SetOptions } from './types';
import { Cipher } from './modules/Cipher';
import { Logger } from './modules/Logger';
import { Observer } from './modules/Observer';
import { MemoryCache } from './modules/Memory';

export class StorageCore {
  private config: StorageConfig;
  private observer: Observer;
  private memory: MemoryCache;

  constructor(config: StorageConfig) {
    this.config = config;
    this.observer = new Observer();
    this.memory = new MemoryCache();

    // 监听跨标签页变化，同步清除/更新内存缓存
    this.observer.on((key, _newValue) => {
      // 注意：storage 事件返回的 key 是带前缀的完整 key
      if (key && key.startsWith(this.config.prefixKey)) {
        // 简单策略：发生变化时，直接移除内存缓存，下次读取时重新从 Storage 加载
        // 这样避免了复杂的反序列化和解密同步逻辑
        const internalKey = key.slice(this.config.prefixKey.length);
        this.memory.remove(internalKey);
        Logger.debug('Sync Memory (Cross-Tab)', internalKey);
      }
    });
  }

  /**
   * 获取完整 Key
   */
  private getKey(key: string): string {
    return `${this.config.prefixKey}${key}`;
  }

  /**
   * 设置缓存
   */
  public set<T = any>(key: string, value: T, options?: SetOptions): void {
    const fullKey = this.getKey(key);
    const expire = options?.expire ?? (this.config.timeout ? Date.now() + this.config.timeout * 1000 : null);

    const data: StorageData<T> = {
      value,
      expire,
      version: this.config.version, // 写入版本号
    };

    // 1. 更新内存缓存 (Write-through)
    this.memory.set(key, data);

    // 2. 序列化 & 加密
    let storageValue = JSON.stringify(data);
    if (this.config.encrypt) {
      storageValue = Cipher.encrypt(storageValue);
    }

    // 3. 写入 Storage (带配额管理)
    try {
      this.config.storage.setItem(fullKey, storageValue);
    } catch (e: any) {
      // 捕获 QuotaExceededError
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        Logger.warn('Storage Quota Exceeded! Trying to clear expired items...', e);

        // 尝试清理过期数据
        this.clearExpired();

        // 重试写入
        try {
          this.config.storage.setItem(fullKey, storageValue);
          Logger.debug('Retry Set Success', key);
        } catch (retryError) {
          Logger.error('Storage Quota Full. Write Failed silently.', retryError);
          // 此时内存缓存中仍有数据，应用本次会话可能还能正常运行
        }
      } else {
        Logger.error('Storage Set Error', e);
      }
    }

    Logger.debug('Set', key, value);
  }

  /**
   * 获取缓存
   */
  public get<T = any>(key: string): T | null {
    // 1. 检查内存缓存 (L2 Cache)
    const memData = this.memory.get<StorageData<T>>(key);
    if (memData) {
       if (this.checkInvalid(memData)) {
          // 无效（过期或版本不符），删除并继续
          this.memory.remove(key);
       } else {
          Logger.debug('Get (Memory Hit)', key, memData.value);
          return memData.value;
       }
    }

    const fullKey = this.getKey(key);
    const item = this.config.storage.getItem(fullKey);

    if (!item) return null;

    try {
      let decodedItem = item;
      // 2. 解密
      if (this.config.encrypt) {
         try {
           decodedItem = Cipher.decrypt(item);
         } catch (e) {
           // 解密失败（可能是密钥变更或数据损坏），视为失效
           Logger.error('Decrypt Failed', e);
           this.remove(key);
           return null;
         }
      }

      // 3. 反序列化
      const data: StorageData<T> = JSON.parse(decodedItem);

      // 4. 检查过期
      if (this.checkExpire(data)) {
        this.remove(key);
        return null;
      }

      // 5. 检查版本 & 迁移
      if (this.config.version && data.version !== this.config.version) {
         // 尝试迁移
         const migration = data.version ? this.config.migrations?.[data.version] : undefined;

         if (migration) {
            Logger.debug(`Migration Found: ${data.version} -> ${this.config.version}`, key);
            try {
              const newValue = migration(data.value);

              // 持久化迁移后的数据 (同时更新 Memory 和 Storage)
              this.set(key, newValue);
              return newValue;
            } catch (e) {
              Logger.error('Migration Failed', e);
              this.remove(key);
              return null;
            }
         }

         // 版本不匹配且无迁移策略 -> 丢弃
         this.remove(key);
         return null;
      }

      // 6. 回填内存缓存 (Read-through)
      this.memory.set(key, data);

      Logger.debug('Get (Storage Hit)', key, data.value);
      return data.value;
    } catch (e) {
      Logger.error('Get Error', e);
      this.remove(key);
      return null;
    }
  }

  /**
   * 移除缓存
   */
  public remove(key: string): void {
    const fullKey = this.getKey(key);
    this.config.storage.removeItem(fullKey);
    this.memory.remove(key);
    Logger.debug('Remove', key);
  }

  /**
   * 清空所有当前命名空间下的缓存
   */
  public clear(): void {
    const len = this.config.storage.length;
    // 倒序遍历，防止删除时索引变化
    for (let i = len - 1; i >= 0; i--) {
      const key = this.config.storage.key(i);
      if (key && key.startsWith(this.config.prefixKey)) {
        this.config.storage.removeItem(key);
      }
    }
    this.memory.clear();
    Logger.debug('Clear', 'All');
  }

  /**
   * 检查是否过期或版本不匹配
   * @returns true if invalid (expired or version mismatch)
   */
  private checkInvalid(data: StorageData<any>): boolean {
    // 1. 检查版本
    if (this.config.version && data.version !== this.config.version) {
      return true;
    }
    // 2. 检查过期
    return this.checkExpire(data);
  }

  /**
   * 检查是否过期
   */
  private checkExpire(data: StorageData<any>): boolean {
    if (data.expire && data.expire < Date.now()) {
      return true;
    }
    return false;
  }

  /**
   * 清理所有过期数据 (释放空间用)
   */
  public clearExpired(): void {
    const len = this.config.storage.length;
    const keysToRemove: string[] = [];

    for (let i = 0; i < len; i++) {
      const key = this.config.storage.key(i);
      if (key && key.startsWith(this.config.prefixKey)) {
        let json = this.config.storage.getItem(key);
        if (!json) continue;

        if (this.config.encrypt) {
           json = Cipher.decrypt(json);
        }

        try {
          const data = JSON.parse(json) as StorageData<any>;
          if (this.checkExpire(data)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // 解析失败的脏数据也应该清理
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(k => {
      this.config.storage.removeItem(k);
      // 同时也移除内存中对应的（如果有）
      const internalKey = k.slice(this.config.prefixKey.length);
      this.memory.remove(internalKey);
    });

    Logger.debug('Clear Expired', `${keysToRemove.length} items removed`);
  }
}
