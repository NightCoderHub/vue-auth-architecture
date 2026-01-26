// src/utils/storage/storage.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createStorage } from './index';
import { Cipher } from './modules/Cipher';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageCore', () => {
  let storage: ReturnType<typeof createStorage>;
  const PREFIX = 'TEST_';

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    storage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      encrypt: false,
      timeout: null,
    });
  });

  it('应该正确设置和获取值 (Basic Set/Get)', () => {
    const key = 'user';
    const value = { name: 'Trae', role: 'Admin' };

    storage.set(key, value);

    // 验证底层存储了带前缀的 Key
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      PREFIX + key,
      expect.stringContaining('"value":{"name":"Trae"')
    );

    // 验证获取
    const result = storage.get(key);
    expect(result).toEqual(value);
  });

  it('应该支持加密 (Encryption)', () => {
    const secureStorage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      encrypt: true,
    });

    const key = 'secret';
    const value = 'my-secret-data';

    secureStorage.set(key, value);

    // 获取底层存储的原始值
    const rawValue = localStorageMock.getItem(PREFIX + key);
    expect(rawValue).not.toContain(value); // 应该被加密了，不包含明文

    // 解密验证
    const decrypted = secureStorage.get(key);
    expect(decrypted).toEqual(value);
  });

  it('应该处理过期时间 (Expiry)', () => {
    const key = 'temp';
    const value = 'temp-data';

    // 设置过去的时间作为过期时间
    storage.set(key, value, { expire: Date.now() - 1000 });

    const result = storage.get(key);
    expect(result).toBeNull();

    // 验证底层是否被删除
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PREFIX + key);
  });

  it('应该优先读取内存缓存 (L2 Cache)', () => {
    const key = 'cache-test';
    const value = 123;

    storage.set(key, value);

    // 清除 localStorage mock 的调用记录
    vi.clearAllMocks();

    // 再次读取，应该命中内存，不调用 localStorage.getItem
    const result = storage.get(key);
    expect(result).toBe(value);
    expect(localStorageMock.getItem).not.toHaveBeenCalled();

    // 如果移除内存，应该重新读取 Storage
    (storage as any).memory.remove(key);
    const result2 = storage.get(key);
    expect(result2).toBe(value);
    expect(localStorageMock.getItem).toHaveBeenCalled();
  });

  it('应该清理过期数据 (clearExpired)', () => {
    // 预先存几个数据
    const validKey = 'valid';
    const validData = JSON.stringify({ value: 'ok', expire: Date.now() + 10000 });

    const expiredKey = 'expired';
    const expiredData = JSON.stringify({ value: 'old', expire: Date.now() - 1000 });

    // 模拟底层存储
    (localStorageMock as any).setItem(PREFIX + validKey, validData);
    (localStorageMock as any).setItem(PREFIX + expiredKey, expiredData);

    // 执行清理
    storage.clearExpired();

    // 验证结果
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PREFIX + expiredKey);
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(PREFIX + validKey);
  });

  it('应该处理版本控制 (Version Control)', () => {
    // 1. 创建旧版本的 Storage
    const v1Storage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      version: '1.0.0',
    });
    
    // 存入数据
    const key = 'app-config';
    const value = { theme: 'dark' };
    v1Storage.set(key, value);
    
    // 验证 v1 可以读取
    expect(v1Storage.get(key)).toEqual(value);

    // 2. 创建新版本的 Storage
    const v2Storage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      version: '2.0.0', // 版本升级
    });

    // 尝试读取旧数据 -> 应该返回 null 并清除
    expect(v2Storage.get(key)).toBeNull();
    
    // 3. 再次存入新版本数据
    const newValue = { theme: 'light' };
    v2Storage.set(key, newValue);
    
    // 验证 v2 可以读取新数据
    expect(v2Storage.get(key)).toEqual(newValue);
  });

  it('应该支持数据迁移 (Migration)', () => {
    const key = 'user-settings';
    
    // 1. 初始化 v1 版本
    const v1Storage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      version: '1.0.0',
    });

    // 写入旧格式数据
    const oldData = { theme: 'dark', notifications: true };
    v1Storage.set(key, oldData);

    // 2. 初始化 v2 版本，带迁移策略
    const v2Storage = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      version: '2.0.0',
      migrations: {
        '1.0.0': (oldValue) => {
          return {
            appearance: { mode: oldValue.theme },
            enableNotifications: oldValue.notifications,
          };
        },
      },
    });

    // 3. 读取数据，期望发生迁移
    const expectedData = {
      appearance: { mode: 'dark' },
      enableNotifications: true,
    };

    const migratedData = v2Storage.get(key);
    expect(migratedData).toEqual(expectedData);

    // 4. 验证迁移后的数据已被持久化（再次读取不应再次触发迁移，而是直接读取新格式）
    // 为了验证持久化，我们可以检查底层存储的内容，或者用一个新的 v2 实例读取
    const v2StorageCheck = createStorage(localStorageMock as any, {
      prefixKey: PREFIX,
      version: '2.0.0',
    });
    expect(v2StorageCheck.get(key)).toEqual(expectedData);
  });
});
