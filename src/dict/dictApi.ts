import { customInstance } from '@/axios/index';

/**
 * @description: 字典数据接口
 */
export interface DictData {
  /** 字典标签 */
  label: string;
  /** 字典值 */
  value: string;
  /** 字典类型 */
  dictType: string;
  /** 列表样式 (如 primary, success, info, warning, danger) */
  listClass?: string;
  /** CSS 样式类名 */
  cssClass?: string;
  /** 是否默认 */
  isDefault?: boolean;
}

/**
 * @description: 批量获取字典数据
 * @param types 字典类型字符串，多个用逗号分隔
 */
export const getDictBatchApi = (types: string) => {
  return customInstance<Record<string, DictData[]>>({
    url: '/dict/batch',
    method: 'GET',
    params: { types }
  });
};
