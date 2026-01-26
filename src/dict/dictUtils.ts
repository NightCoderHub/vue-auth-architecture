import { useDictStore } from './dictStore';

/**
 * 获取字典标签
 * @param dictType 字典类型
 * @param value 字典值
 * @param defaultValue 默认值
 */
export function getDictLabel(dictType: string, value: string | number | undefined, defaultValue = ''): string {
  if (value === undefined || value === null) return defaultValue;

  const dictStore = useDictStore();
  const dicts = dictStore.dictMap[dictType];

  // 1. 字典数据不存在时，不仅返回默认值，还应尝试加载字典
  if (!dicts) {
    // 异步加载字典，确保下次访问时有数据
    dictStore.getDict(dictType);
    return defaultValue;
  }

  // 兼容 string 和 number 比较
  const found = dicts.find((item) => String(item.value) === String(value));
  return found ? found.label : defaultValue;
}

/**
 * 获取字典列表样式 (Tag type)
 * @param dictType 字典类型
 * @param value 字典值
 */
export function getDictListClass(dictType: string, value: string | number | undefined): string {
  if (value === undefined || value === null) return '';

  const dictStore = useDictStore();
  const dicts = dictStore.dictMap[dictType];

  if (!dicts) {
    // 异步加载字典
    dictStore.getDict(dictType);
    return '';
  }

  const found = dicts.find((item) => String(item.value) === String(value));
  return found ? (found.listClass || '') : '';
}

/**
 * 字典工具对象，用于全局注册
 */
export const dictUtils = {
  label: getDictLabel,
  listClass: getDictListClass
};
