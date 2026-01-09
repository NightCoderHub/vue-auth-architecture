import { useDictStore } from './dictStore';
import { DictType } from './dictTypes';

/**
 * 预加载常用字典
 * 
 * 策略：
 * 1. 仅在已登录状态下进行
 * 2. 不阻塞主流程（不 await）
 * 3. 提前将常用字典缓存到 Store 中，避免组件渲染时出现 Loading 或布局抖动
 */
export function preloadDicts() {
  const dictStore = useDictStore();
  const commonDicts = [
    DictType.USER_STATUS,
    DictType.GENDER,
    // ORDER_STATUS 可能只在特定页面用，视情况决定是否预加载。这里作为演示全部加载。
    DictType.ORDER_STATUS
  ];
  
  console.log('[Dict] 正在预加载字典:', commonDicts);
  
  // 并发请求
  Promise.all(commonDicts.map(type => dictStore.getDict(type)))
    .then(() => {
      console.log('[Dict] 字典预加载完成');
    })
    .catch(err => {
      console.warn('[Dict] 字典预加载部分失败:', err);
    });
}
