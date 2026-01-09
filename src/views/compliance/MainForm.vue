<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw } from 'vue';
import { useFormLogic } from './useFormLogic';
import LoadingComponent from './components/steps/LoadingComponent.vue';
import ErrorComponent from './components/steps/ErrorComponent.vue';
import { RefreshLeft, Right, Check } from '@element-plus/icons-vue';

/**
 * @description: 跨境投资合规申报主表单
 * 集成 XState 状态机与 VeeValidate 表单校验
 * 步骤组件采用 defineAsyncComponent 异步加载
 */

const { state, defineField, formValues, formErrors, handleNext, handleBack, handleSubmitForm, resetForm } = useFormLogic();

// 定义一个用于强制刷新的 key
const retryKey = ref(0);

// 处理重试逻辑
const handleRetry = () => {
  retryKey.value++;
};

// --- 异步组件定义 ---
const asyncOptions = {
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 10000,
  suspensible: false
};

const StepBasic = markRaw(defineAsyncComponent({
  loader: () => import('./components/steps/StepBasic.vue'),
  ...asyncOptions
}));

const StepInvestment = markRaw(defineAsyncComponent({
  loader: () => import('./components/steps/StepInvestment.vue'),
  ...asyncOptions
}));

const StepSecurityReview = markRaw(defineAsyncComponent({
  loader: () => import('./components/steps/StepSecurityReview.vue'),
  ...asyncOptions
}));

const StepAuditReport = markRaw(defineAsyncComponent({
  loader: () => import('./components/steps/StepAuditReport.vue'),
  ...asyncOptions
}));

const StepReviewSubmit = markRaw(defineAsyncComponent({
  loader: () => import('./components/steps/StepReviewSubmit.vue'),
  ...asyncOptions
}));

// --- 状态对应的组件映射 ---
const currentStepComponent = computed(() => {
  switch (state.value) {
    case 'basic': return StepBasic;
    case 'investment': return StepInvestment;
    case 'security_review': return StepSecurityReview;
    case 'audit_report': return StepAuditReport;
    case 'review_submit': return StepReviewSubmit;
    default: return null;
  }
});

// 状态对应的步骤索引
const activeStep = computed(() => {
  switch (state.value) {
    case 'basic': return 0;
    case 'investment': return 1;
    case 'security_review': return 2;
    case 'audit_report': return 2;
    case 'review_submit': return 3;
    case 'blocked': return -1;
    default: return 0;
  }
});

// --- 字段绑定与属性包装 ---
const [name] = defineField('basicInfo.name');
const [code] = defineField('basicInfo.code');
const [foundingDate] = defineField('basicInfo.foundingDate');
const [investmentAmountUSD] = defineField('basicInfo.investmentAmountUSD');

const [destination] = defineField('investmentPlan.destination');
const [mode] = defineField('investmentPlan.mode');
const [amountRMB] = defineField('investmentPlan.amountRMB');
const [plannedDate] = defineField('investmentPlan.plannedDate');

/** 传递给 StepBasic 的数据包 */
const stepBasicData = computed(() => ({
  errors: formErrors.value
}));

/** 传递给 StepInvestment 的数据包 */
const stepInvestmentData = computed(() => ({
  errors: formErrors.value
}));

/** 传递给 StepReviewSubmit 的数据包 */
const stepReviewData = computed(() => ({
  data: {
    name: name.value,
    code: code.value,
    destination: destination.value,
    amountRMB: amountRMB.value,
    shareholders: formValues.shareholders
  }
}));

const isBlocked = computed(() => state.value === 'blocked');
</script>

<template>
  <div class="compliance-form-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>跨境投资（ODI/FDI）合规申报系统</span>
          <el-tag :type="isBlocked ? 'danger' : 'primary'">当前状态: {{ state }}</el-tag>
        </div>
      </template>

      <!-- 异常状态：黑名单拦截 -->
      <div v-if="isBlocked" class="blocked-state">
        <el-result
          icon="error"
          title="系统拦截"
          sub-title="检测到统一社会信用代码异常（模拟黑名单：999），业务已终止。"
        >
          <template #extra>
            <el-button type="primary" @click="resetForm">重置表单</el-button>
          </template>
        </el-result>
      </div>

      <!-- 正常流程 -->
      <div v-else>
        <el-steps :active="activeStep" finish-status="success" align-center class="mb-4">
          <el-step title="基础信息" description="企业基本情况" />
          <el-step title="投资方案" description="目的地与股权结构" />
          <el-step title="合规审查" description="安全审查/审计报告" />
          <el-step title="最终复核" description="确认并提交" />
        </el-steps>

        <el-form label-width="140px" label-position="top" size="large">

          <div class="form-section">
            <transition name="fade" mode="out-in">
              <component
                :is="currentStepComponent"
                v-bind="{
                  ...(state === 'basic' ? stepBasicData : {}),
                  ...(state === 'investment' ? stepInvestmentData : {}),
                  ...(state === 'review_submit' ? stepReviewData : {}),
                  errors: formErrors
                }"
                v-model:name="name"
                v-model:code="code"
                v-model:foundingDate="foundingDate"
                v-model:investmentAmountUSD="investmentAmountUSD"
                v-model:destination="destination"
                v-model:plannedDate="plannedDate"
                v-model:mode="mode"
                v-model:amountRMB="amountRMB"
                @retry="handleRetry"
              />
            </transition>
          </div>

          <!-- Action Buttons -->
          <div class="actions">
            <el-button v-if="activeStep > 0" @click="handleBack" :icon="RefreshLeft">上一步</el-button>

            <el-button
              v-if="state !== 'review_submit'"
              type="primary"
              @click="handleNext"
              :icon="Right"
            >
              下一步
            </el-button>

            <el-button
              v-else
              type="success"
              @click="handleSubmitForm"
              :icon="Check"
            >
              提交申报
            </el-button>

            <el-button @click="resetForm" link class="ml-auto">清空草稿 & 重置</el-button>
          </div>

        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.compliance-form-container {
  /* max-width: 1000px; */
  /* margin: 20px auto; */
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-section {
  padding: 20px 0;
  min-height: 300px;
}
.actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.ml-auto {
  margin-left: auto;
}
.mb-4 { margin-bottom: 16px; }
.blocked-state {
  padding: 40px;
  text-align: center;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
