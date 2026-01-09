<script setup lang="ts">
/**
 * @description: 步骤 3B - 审计报告
 */
</script>

<template>
  <div class="step-audit-report">
    <el-alert title="触发审计要求" type="warning" show-icon :closable="false" class="mb-4">
      由于投资金额超过 1 亿元，需上传专项审计报告。
    </el-alert>
    <el-form-item label="审计报告上传 (模拟)">
      <el-button type="primary">点击上传审计报告</el-button>
    </el-form-item>
  </div>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
