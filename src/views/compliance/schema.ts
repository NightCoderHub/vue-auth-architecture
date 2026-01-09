import { z } from 'zod';

// 基础信息 Schema
const basicInfoSchema = z.object({
  name: z.string({ required_error: '请输入企业名称', invalid_type_error: '请输入企业名称' }).min(1, '企业名称不能为空'),
  code: z
    .string({ required_error: '请输入统一社会信用代码', invalid_type_error: '请输入统一社会信用代码' })
    .regex(/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, '统一社会信用代码格式不正确'),  //特殊逻辑在 UI 层/状态机层处理 '999'
  foundingDate: z.string({ required_error: '请选择成立日期', invalid_type_error: '请选择成立日期' }).refine((val) => !isNaN(Date.parse(val)), '无效的日期格式'),
  investmentAmountUSD: z.number({
    required_error: '请输入投资金额',
    invalid_type_error: '请输入投资金额',
  }).min(0, '投资金额不能为负数'),
});

// 投资计划 Schema
const investmentPlanSchema = z.object({
  destination: z.string({ required_error: '请输入投资目的地', invalid_type_error: '请输入投资目的地' }).min(1, '目的地不能为空'),
  mode: z.string({
    required_error: '请选择投资方式',
    invalid_type_error: '请选择投资方式'
  }).min(1, '请选择投资方式'),
  amountRMB: z.number({
    required_error: '请输入折合人民币金额',
    invalid_type_error: '请输入折合人民币金额',
  }).min(0, '折合人民币金额不能为负数'),
  plannedDate: z.string({ required_error: '请选择计划投资日期', invalid_type_error: '请选择计划投资日期' }).refine((val) => !isNaN(Date.parse(val)), '无效的日期格式'),
});

// 股东信息 Schema
export const shareholderSchema = z.object({
  name: z.string({ required_error: '请输入股东姓名', invalid_type_error: '请输入股东姓名' }).min(1, '股东姓名不能为空'),
  ratio: z.number({ required_error: '请输入持股比例', invalid_type_error: '请输入持股比例' }).min(0).max(100),
  nationality: z.string({ required_error: '请输入国籍', invalid_type_error: '请输入国籍' }).min(1, '国籍不能为空'),
});

// 合规信息 Schema
const complianceSchema = z.object({
  securityQuestionnaire: z.record(z.any()).optional(), // 简化处理，实际应为具体问卷结构
  auditReportStatus: z.enum(['pending', 'uploaded', 'verified']).optional(),
});

// 完整的表单 Schema
export const complianceFormSchema = z.object({
  basicInfo: basicInfoSchema,
  investmentPlan: investmentPlanSchema,
  shareholders: z.array(shareholderSchema).min(1, '至少需要一名股东'),
  compliance: complianceSchema,
})
.superRefine((data, ctx) => {
  // 1. 跨字段校验：股东持股比例总和必须为 100
  const totalRatio = data.shareholders.reduce((sum, item) => sum + (item.ratio || 0), 0);
  if (Math.abs(totalRatio - 100) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `股东持股比例总和必须为 100%，当前为 ${totalRatio}%`,
      path: ['shareholders'],
    });
  }

  // 2. 跨步骤校验：拟出境日期必须晚于成立日期
  const founding = new Date(data.basicInfo.foundingDate).getTime();
  const planned = new Date(data.investmentPlan.plannedDate).getTime();

  if (founding && planned && planned <= founding) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '拟出境日期必须晚于企业成立日期',
      path: ['investmentPlan', 'plannedDate'],
    });
  }
});

// 导出类型
export type ComplianceFormValues = z.infer<typeof complianceFormSchema>;
export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type InvestmentPlan = z.infer<typeof investmentPlanSchema>;
export type Shareholder = z.infer<typeof shareholderSchema>;

// 默认初始值
export const DEFAULT_FORM_VALUES: ComplianceFormValues = {
  basicInfo: {
    name: '',
    code: '',
    foundingDate: '',
    investmentAmountUSD: undefined as any,
  },
  investmentPlan: {
    destination: '',
    mode: '',
    amountRMB: undefined as any,
    plannedDate: '',
  },
  shareholders: [],
  compliance: {
    securityQuestionnaire: {},
    auditReportStatus: 'pending',
  },
};
