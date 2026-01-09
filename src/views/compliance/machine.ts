import { setup, assign } from 'xstate';
import { type ComplianceFormValues, DEFAULT_FORM_VALUES } from './schema';

// 敏感国家列表（模拟）
const SENSITIVE_COUNTRIES = ['CountryX', 'CountryY', 'SensitiveLand'];

// 工具类型：递归 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export interface ComplianceContext {
  formData: DeepPartial<ComplianceFormValues>;
}

export type ComplianceEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_DATA'; data: Partial<ComplianceFormValues> }
  | { type: 'CHECK_BLACKLIST'; code: string }
  | { type: 'RESET' }
  | { type: 'RECOVER_DRAFT'; data: Partial<ComplianceFormValues>; step: string } // 用于恢复草稿
  | { type: 'SUBMIT' }; // 提交表单

export const complianceMachine = setup({
  types: {
    context: {} as ComplianceContext,
    events: {} as ComplianceEvent,
  },
  guards: {
    isSensitiveCountry: ({ context }) => {
      const dest = context.formData.investmentPlan?.destination;
      return !!dest && SENSITIVE_COUNTRIES.includes(dest);
    },
    isHighAmount: ({ context }) => {
      const amount = context.formData.investmentPlan?.amountRMB;
      return !!amount && amount > 100000000;
    },
  },
  actions: {
    assignData: assign({
      formData: ({ context, event }) => {
        if (event.type === 'SET_DATA') {
          return { ...context.formData, ...event.data };
        }
        return context.formData;
      },
    }),
    resetContext: assign({
      formData: DEFAULT_FORM_VALUES,
    }),
    resetSubsequentData: assign({
      formData: ({ context }) => {
        // 当从前面的步骤重新进入时，可以在这里选择性重置某些后续字段
        // 为了简化，这里暂时不做破坏性重置，依赖 UI 校验
        return context.formData;
      }
    })
  },
}).createMachine({
  id: 'complianceFlow',
  initial: 'basic',
  // 全局事件监听：允许在任何状态下更新数据
  on: {
    SET_DATA: { actions: 'assignData' },
    RESET: { target: '.basic', actions: 'resetContext' },
  },
  context: {
    formData: DEFAULT_FORM_VALUES,
  },
  states: {
    basic: {
      on: {
        NEXT: { target: 'investment' },
        CHECK_BLACKLIST: {
          target: 'blocked',
          guard: ({ event }) => event.code === '999',
        },
      },
    },
    investment: {
      on: {
        BACK: { target: 'basic' },
        NEXT: [
          { target: 'security_review', guard: 'isSensitiveCountry' },
          { target: 'audit_report', guard: 'isHighAmount' },
          { target: 'review_submit' },
        ],
      },
    },
    security_review: {
      on: {
        BACK: { target: 'investment' },
        NEXT: [
          // 安全审查后，如果金额也很大，还需要去审计吗？
          // 假设业务逻辑是：安全审查优先级最高，或者并行。
          // 简化逻辑：安全审查 -> (如果金额大 -> 审计) -> 复核
          { target: 'audit_report', guard: 'isHighAmount' },
          { target: 'review_submit' },
        ],
      },
    },
    audit_report: {
      on: {
        BACK: [
          // 回退时需要判断是来自 security_review 还是 investment
          { target: 'security_review', guard: 'isSensitiveCountry' },
          { target: 'investment' },
        ],
        NEXT: { target: 'review_submit' },
      },
    },
    review_submit: {
      on: {
        BACK: [
           // 回退逻辑同上，需反向判断
           { target: 'audit_report', guard: 'isHighAmount' },
           { target: 'security_review', guard: 'isSensitiveCountry' },
           { target: 'investment' }
        ],
        SUBMIT: { target: 'submitted' },
      },
    },
    submitted: {
      type: 'final',
    },
    blocked: {},
    },
});
