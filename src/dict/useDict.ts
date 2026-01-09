import { ref, onMounted, toRefs } from 'vue';
import { useDictStore } from './dictStore';
import type { DictData } from './dictApi';

/**
 * 字典 Hook
 * @param args 字典类型数组
 * @returns 响应式字典对象
 */
export function useDict(...args: string[]) {
  const dictStore = useDictStore();
  const res = ref<Record<string, DictData[]>>({});

  // 立即执行的逻辑（Composition API 风格）
  (() => {
    // 1. 预先初始化 key，避免模板中访问 undefined 报错
    args.forEach((type) => {
      res.value[type] = [];
    });

    // 2. 在组件挂载时发起请求
    onMounted(async () => {
      // 使用 Promise.all 并行请求，提高性能
      const promises = args.map((type) => dictStore.getDict(type));
      const results = await Promise.all(promises);

      // 填充结果
      args.forEach((type, index) => {
        const data = results[index];
        if (data) {
          res.value[type] = data;
        }
      });
    });
  })();

  return toRefs(res.value);
}
