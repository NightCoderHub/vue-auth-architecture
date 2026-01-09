import { computed, watch, toRaw } from 'vue';
import { useMachine } from '@xstate/vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useStorage } from '@vueuse/core';
import { complianceMachine } from './machine';
import { complianceFormSchema, type ComplianceFormValues, DEFAULT_FORM_VALUES } from './schema';

// 步骤与字段的映射关系，用于分步校验
const STEP_FIELDS: Record<string, (keyof ComplianceFormValues)[]> = {
  basic: ['basicInfo'],
  investment: ['investmentPlan', 'shareholders'],
  security_review: ['compliance'],
  audit_report: ['compliance'],
  review_submit: [], // Review step might not have fields, or just final confirmation
};

const STORAGE_KEY = 'compliance-form-snapshot-v1';

export function useFormLogic() {
  // 1. 持久化存储 (保存状态机快照)
  // useStorage 会自动同步 LocalStorage
  const persistedState = useStorage<any>(STORAGE_KEY, null, localStorage, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : null),
      write: (v) => JSON.stringify(v),
    },
  });

  // 2. 初始化状态机
  // 如果有持久化状态，尝试恢复
  const { snapshot, send, actorRef } = useMachine(complianceMachine, {
    snapshot: persistedState.value, // XState v5 支持直接传入 snapshot 恢复
  });

  // 3. 监听状态变化并持久化
  actorRef.subscribe((state) => {
    persistedState.value = state;
  });

  // 4. 初始化表单 (VeeValidate)
  const { values, errors, defineField, validate, resetForm: resetVeeForm, handleSubmit } = useForm<ComplianceFormValues>({
    validationSchema: toTypedSchema(complianceFormSchema),
    initialValues: (snapshot.value.context.formData as ComplianceFormValues) || DEFAULT_FORM_VALUES,
    // 关键配置：防止在切换步骤（组件卸载）时丢失表单数据
    keepValuesOnUnmount: true,
    // 关键配置：禁止挂载时立即触发校验，解决初始化即报错问题
    validateOnMount: false,
  });

  // 4.1 核心修复：实时草稿同步
  // 监听表单值变化，实时同步到 XState Machine Context
  // 这将触发 actorRef.subscribe 中的持久化逻辑
  watch(values, (newValues) => {
    // 使用 toRaw 确保发送给 XState 的是纯 JS 对象，避免 Proxy 干扰
    send({ type: 'SET_DATA', data: toRaw(newValues) });
  }, { deep: true });

  // 5. 核心逻辑：下一步
  const handleNext = async () => {
    const currentStep = snapshot.value.value as string;
    const fieldsToValidate = STEP_FIELDS[currentStep];

    // 如果当前步骤有需要校验的字段
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      // 触发部分校验
      // 注意：这里简单的 validate() 会校验所有字段，我们需要利用 validate({ mode: 'silent' }) 或者只检查特定 path
      // 由于 Zod schema 是嵌套的，我们可以尝试校验整个表单，然后检查 errors 中是否有属于当前步骤的错误

      const result = await validate();

      if (!result.valid) {
        // 检查错误是否属于当前步骤
        const hasStepErrors = Object.keys(errors.value).some(key => {
            // 核心修复：处理数组字段路径，如 'shareholders[0].name' -> 'shareholders'
            const rootField = key.split(/[.[]/)[0] as keyof ComplianceFormValues;
            return fieldsToValidate.includes(rootField);
        });

        if (hasStepErrors) {
            console.warn('Validation failed for current step');
            return;
        }
      }
    }

    // 校验通过，同步数据到机器 Context 并跳转
    send({ type: 'SET_DATA', data: toRaw(values) });
    send({ type: 'NEXT' });
  };

  // 6. 核心逻辑：上一步
  const handleBack = () => {
    send({ type: 'BACK' });
  };

  // 7. 特殊逻辑：黑名单检查
  // 监听 code 变化
  watch(() => values.basicInfo?.code, (newCode) => {
    if (newCode && newCode.length >= 3) {
       // 模拟 API 检查，实际项目中可能是 debounce 后调用
       if (newCode === '999') {
         send({ type: 'CHECK_BLACKLIST', code: '999' });
       }
    }
  });

  // 7. 核心逻辑：提交表单
  const handleSubmitForm = handleSubmit(async (values) => {
    // 最终全量校验通过
    console.log('Submitting form:', values);

    // 触发状态机的 SUBMIT 事件
    send({ type: 'SUBMIT' });

    // 这里可以添加实际的 API 调用
    // await api.submit(values);

    // 模拟成功反馈
    // ElMessage.success('申报提交成功！');
  });

  // 8. 重置逻辑
  const resetForm = () => {
    // 顺序很重要：先停止监听或清空持久化，防止重置过程中的中间状态被保存
    persistedState.value = null;
    localStorage.removeItem(STORAGE_KEY);

    // 核心修复：resetVeeForm 必须传入初始值，否则它会重置为 useForm 初始化时的快照（即带数据的快照）
    resetVeeForm({
        values: DEFAULT_FORM_VALUES
    });

    send({ type: 'RESET' }); // 重置状态机
  };

  return {
    state: computed(() => snapshot.value.value),
    context: computed(() => snapshot.value.context),
    defineField,
    formValues: values,
    formErrors: errors,
    handleNext,
    handleBack,
    handleSubmitForm,
    resetForm,
  };
}
