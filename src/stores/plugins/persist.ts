import type { PiniaPluginContext } from 'pinia';
import ls from '@/utils/storage';

/**
 * Pinia 持久化插件
 * @param context Pinia 插件上下文
 */
export function piniaPersist({ options, store }: PiniaPluginContext) {
  const persist = options.persist;
  if (!persist) return;

  // 默认配置
  const defaultStrategy = {
    key: store.$id,
    storage: ls,
    paths: undefined as string[] | undefined,
  };

  // 合并配置
  const strategy = typeof persist === 'object'
    ? { ...defaultStrategy, ...persist }
    : defaultStrategy;

  const { key, storage, paths } = strategy;

  // 1. 恢复状态 (Hydrate)
  // 从存储中读取数据
  const storedState = storage?.get(key);
  if (storedState) {
    store.$patch(storedState);
  }

  // 2. 监听变化并保存 (Persist)
  store.$subscribe((_mutation, state) => {
    let dataToSave = state;

    // 如果指定了 paths，则只持久化指定字段
    if (paths && paths.length > 0) {
      dataToSave = paths.reduce((acc, path) => {
        if (path in state) {
          acc[path] = (state as any)[path];
        }
        return acc;
      }, {} as Record<string, any>);
    }

    // 写入存储
    storage?.set(key, dataToSave);
  }, { detached: true }); // detached: true 确保组件卸载后订阅依然有效
}
