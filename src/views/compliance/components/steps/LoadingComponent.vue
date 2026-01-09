<script setup lang="ts">
/**
 * @description: 步骤组件加载中状态
 */
</script>

<template>
  <div class="step-loading" v-loading="true" element-loading-text="正在加载步骤组件...">
    <div style="height: 200px;"></div>
  </div>
</template>

<style scoped>
.step-loading {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
