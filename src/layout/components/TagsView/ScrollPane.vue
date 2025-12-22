<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const scrollContainer = ref(null);

const handleScroll = (e: WheelEvent) => {
  const eventDelta = e.deltaY || -e.deltaX;
  const $scrollWrapper = (scrollContainer.value as any).$refs.wrap$;
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
};
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
