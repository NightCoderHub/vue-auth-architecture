<template>
  <div class="iframe-container" v-loading="loading">
    <iframe 
      v-if="frameSrc" 
      :src="frameSrc" 
      class="iframe" 
      frameborder="0"
      @load="onLoad"
    ></iframe>
    <div v-else class="empty-state">
      <el-empty description="未配置 Frame Source 地址" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)

const frameSrc = computed(() => {
  return route.meta.frameSrc
})

const onLoad = () => {
  loading.value = false
}

// 监听路由变化，重置 loading 状态（如果复用组件）
watch(
  () => route.path,
  () => {
    loading.value = true
  }
)

onMounted(() => {
  if (!frameSrc.value) {
    loading.value = false
  }
})
</script>

<style scoped>
.iframe-container {
  width: 100%;
  height: calc(100vh - 84px); /* 减去顶栏和 TagsView 的高度，需根据实际布局调整 */
  position: relative;
}

.iframe {
  width: 100%;
  height: 100%;
  display: block;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
