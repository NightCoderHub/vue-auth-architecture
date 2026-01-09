<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ShareholderTable from '../ShareholderTable.vue';

/**
 * @description: 步骤 2 - 投资方案
 */
interface Props {
  /** 校验错误信息 */
  errors: Record<string, string | undefined>;
}

const props = defineProps<Props>();

// 使用平铺的 defineModel 确保响应式直达父组件
const destination = defineModel<string>('destination');
const plannedDate = defineModel<string>('plannedDate');
const mode = defineModel<string>('mode');
const amountRMB = defineModel<number>('amountRMB');

// 响应式存储枚举数据
const investmentModes = ref<{ label: string; value: string }[]>([]);
const loading = ref(false);

/**
 * 模拟从后端接口获取数据
 */
const fetchInvestmentModes = async () => {
  loading.value = true;
  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 模拟后端返回的数据
    const data = [
      { label: '新设企业', value: 'new' },
      { label: '并购重组', value: 'merge' },
      { label: '增资扩股', value: 'increase' }
    ];

    investmentModes.value = data;
  } catch (error) {
    console.error('Failed to fetch investment modes:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchInvestmentModes();
});
</script>

<template>
  <div class="step-investment">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="投资目的地" :error="errors['investmentPlan.destination']" >
          <el-input
            v-model="destination"
            placeholder="请输入国家或地区"
          />
          <div class="tip">输入 'CountryX' 或 'CountryY' 将触发安全审查流程</div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="计划投资日期" :error="errors['investmentPlan.plannedDate']" >
          <el-date-picker
            v-model="plannedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="投资方式" :error="errors['investmentPlan.mode']" >
          <el-select
            v-model="mode"
            :loading="loading"
            placeholder="请选择"
          >
            <el-option
              v-for="item in investmentModes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="折合人民币金额" :error="errors['investmentPlan.amountRMB']" >
          <el-input-number
            v-model="amountRMB"
            :min="0"
            :step="1000000"
            style="width: 100%"
          />
          <div class="tip">超过 1 亿 (100000000) 将触发审计报告流程</div>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 动态股东表格 -->
    <ShareholderTable
      name="shareholders"
      :errors="errors"
    />
  </div>
</template>

<style scoped>
.tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
