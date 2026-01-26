// src/utils/storage/modules/Observer.ts

type StorageCallback = (key: string | null, newValue: any, oldValue: any) => void;

export class Observer {
  private callbacks: Set<StorageCallback> = new Set();

  constructor() {
    // 监听原生 storage 事件 (用于跨标签页通信)
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key) {
      // 触发所有回调，让上层去判断是否关心这个 Key
      this.callbacks.forEach(fn => fn(event.key, event.newValue, event.oldValue));
    }
  }

  /**
   * 注册监听器
   */
  public on(callback: StorageCallback) {
    this.callbacks.add(callback);
  }

  /**
   * 移除监听器
   */
  public off(callback: StorageCallback) {
    this.callbacks.delete(callback);
  }
}
