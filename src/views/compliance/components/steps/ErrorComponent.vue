<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue';

/**
 * @description: 步骤组件加载失败状态
 */
interface Props {
  error?: Error;
}

defineProps<Props>();
</script>

<template>
  <div class="step-error">
    <el-result icon="error" title="加载失败" sub-title="步骤组件加载过程中出现错误，请检查网络或刷新重试">
      <template #icon>
        <el-icon :size="60" color="#f56c6c"><Warning /></el-icon>
      </template>
      <template #extra>
        <el-button type="primary" @click="() => $emit('retry')">重试</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.step-error {
  padding: 40px;
  text-align: center;
}
</style>
