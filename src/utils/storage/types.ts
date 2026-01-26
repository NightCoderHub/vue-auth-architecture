// src/utils/storage/types.ts

/**
 * 存储值的数据结构
 */
export interface StorageData<T> {
  value: T;
  expire: number | null; // 过期时间戳，null 表示永不过期
  version?: string;      // 数据版本号，版本不匹配时会丢弃旧数据
}

/**
 * 存储配置选项
 */
export interface StorageConfig {
  prefixKey: string;      // 命名空间前缀，如 'APP_V1_'
  storage: Storage;       // 底层存储引擎 (localStorage | sessionStorage)
  encrypt?: boolean;      // 是否开启加密
  timeout?: number | null;// 默认过期时间 (秒)，null 表示不过期
  version?: string;       // 全局版本号，用于控制缓存失效
  migrations?: Record<string, (value: any) => any>; // 数据迁移策略
}

/**
 * 设置值的可选参数
 */
export interface SetOptions {
  expire?: number | null; // 覆盖默认过期时间
}
