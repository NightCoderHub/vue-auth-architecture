<template>
  <el-config-provider :locale="zhCn" :size="size" :z-index="zIndex" :message="messageConfig">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <VueQueryDevtools />
  </el-config-provider>
</template>

<script setup lang="ts">
/**
 * @description: 根组件，配置全局状态与 Devtools
 */
import { ref, reactive } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

const size = ref<'default' | 'small' | 'large'>('default')
const zIndex = ref(3000)
const messageConfig = reactive({
  max: 3,
})
</script>

