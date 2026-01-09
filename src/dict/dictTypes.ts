/**
 * @description: 字典类型 (使用 const 对象以满足 erasableSyntaxOnly 限制)
 */
export const DictType = {
  /** 用户状态 */
  USER_STATUS: 'user_status',
  /** 性别 */
  GENDER: 'gender',
  /** 订单状态 */
  ORDER_STATUS: 'order_status'
} as const;

/** 字典类型定义 */
export type DictType = typeof DictType[keyof typeof DictType];
