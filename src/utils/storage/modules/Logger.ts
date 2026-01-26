// src/utils/storage/modules/Logger.ts

const isDev = import.meta.env.DEV;

export class Logger {
  static debug(action: string, key: string, value?: any) {
    if (!isDev) return;
    console.groupCollapsed(`[Storage] ${action} Key: "${key}"`);
    if (value !== undefined) {
      console.log('Value:', value);
    }
    console.log('Time:', new Date().toLocaleTimeString());
    console.groupEnd();
  }

  static warn(message: string, error?: any) {
    if (!isDev) return;
    console.warn(`[Storage Warning] ${message}`, error);
  }

  static error(message: string, error?: any) {
    console.error(`[Storage Error] ${message}`, error);
  }
}
