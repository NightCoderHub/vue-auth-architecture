import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDictBatchApi, type DictData } from './dictApi';

export const useDictStore = defineStore('dict', () => {
  const dictMap = ref<Record<string, DictData[]>>({});

  /**
   * 获取字典数据
   * @param type 字典类型
   */
  const getDict = async (type: string): Promise<DictData[]> => {
    // 1. 如果缓存中有，直接返回
    if (dictMap.value[type]) {
      return dictMap.value[type];
    }

    // 2. 调用接口获取
    // 注意：后端返回的是 { [type]: [...] } 结构
    try {
      const res = await getDictBatchApi(type);
      if (res && res[type]) {
        dictMap.value[type] = res[type];
        return res[type];
      }
    } catch (error) {
      console.error(`获取字典 ${type} 失败:`, error);
    }

    return [];
  };

  /**
   * 批量设置字典（用于预加载或批量请求优化）
   */
  const setDictMap = (data: Record<string, DictData[]>) => {
    Object.assign(dictMap.value, data);
  };

  return {
    dictMap,
    getDict,
    setDictMap
  };
});
