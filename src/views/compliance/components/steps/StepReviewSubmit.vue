<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';

/**
 * @description: 步骤 4 - 复核提交
 */
interface Props {
  data: {
    name: string;
    code: string;
    destination: string;
    amountRMB: number;
    shareholders: any[];
  };
}

defineProps<Props>();
</script>

<template>
  <div class="step-review-submit">
    <el-descriptions title="申报信息汇总" border direction="vertical" :column="4">
      <el-descriptions-item label="企业名称">{{ data.name }}</el-descriptions-item>
      <el-descriptions-item label="信用代码">{{ data.code }}</el-descriptions-item>
      <el-descriptions-item label="目的地">{{ data.destination }}</el-descriptions-item>
      <el-descriptions-item label="投资金额">{{ data.amountRMB }} RMB</el-descriptions-item>
    </el-descriptions>

    <div class="mt-4" v-if="data.shareholders && data.shareholders.length">
      <h4>股东信息</h4>
      <el-table :data="data.shareholders" border size="small">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="ratio" label="持股比例 (%)" />
        <el-table-column prop="nationality" label="国籍" />
      </el-table>
    </div>

    <div class="success-tip mt-4">
      <el-icon color="#67C23A"><Check /></el-icon> 所有校验已通过，可以提交。
    </div>
  </div>
</template>

<style scoped>
.mt-4 { margin-top: 16px; }
.success-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67C23A;
  font-weight: bold;
}
</style>
