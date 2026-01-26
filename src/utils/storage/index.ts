// src/utils/storage/index.ts

import { StorageCore } from './StorageCore';

/**
 * 创建 Storage 实例
 */
export const createStorage = (
  storage: Storage = localStorage, 
  options: { 
    prefixKey?: string; 
    encrypt?: boolean; 
    timeout?: number | null;
    version?: string; 
    migrations?: Record<string, (value: any) => any>;
  } = {}
) => {
  const defaultPrefix = 'VUE_ADMIN_';
  return new StorageCore({
    storage,
    prefixKey: options.prefixKey || defaultPrefix,
    encrypt: options.encrypt ?? false, // 默认不开启加密，开发方便调试，生产建议开启
    timeout: options.timeout ?? null,  // 默认不过期
    version: options.version,          // 版本号
    migrations: options.migrations,    // 迁移策略
  });
};

// 导出默认的 localStorage 实例
export const ls = createStorage(localStorage, {
  prefixKey: 'VUE_ADMIN_LS_',
  encrypt: import.meta.env.PROD, // 生产环境默认开启加密
  timeout: 60 * 60 * 24 * 7,     // 默认 7 天过期
  version: '1.0.0',              // 默认版本
});

// 导出默认的 sessionStorage 实例
export const ss = createStorage(sessionStorage, {
  prefixKey: 'VUE_ADMIN_SS_',
  encrypt: false, // Session 一般存临时数据，可不加密
  timeout: null,
});

export default ls;
