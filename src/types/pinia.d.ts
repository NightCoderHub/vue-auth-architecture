import 'pinia';
import { StorageCore } from '@/utils/storage/StorageCore';

declare module 'pinia' {
  export interface PersistStrategy {
    /**
     * 自定义存储 Key，默认为 store.$id
     */
    key?: string;
    /**
     * 指定存储引擎 (ls 或 ss)，默认为 ls
     */
    storage?: StorageCore;
    /**
     * 指定需要持久化的 State 路径，默认为所有 State
     */
    paths?: string[];
  }

  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * 开启持久化
     * - true: 使用默认配置 (key=store.$id, storage=ls, paths=all)
     * - object: 自定义配置
     */
    persist?: boolean | PersistStrategy;
  }
}
