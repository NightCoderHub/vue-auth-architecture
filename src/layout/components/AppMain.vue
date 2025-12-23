<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
    <footer class="app-footer">
      <span>© 2025 Vue Auth Architecture. 开源项目.</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTagsViewStore } from '@/stores/tagsView';

const tagsViewStore = useTagsViewStore();
const cachedViews = computed(() => tagsViewStore.cachedViews);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.app-main {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: auto;
  // padding: 20px;
  background-color: $mainBg;
  display: flex;
  flex-direction: column;
}

.app-footer {
  margin-top: auto;
  text-align: center;
  padding: 20px 0 0;
  color: $info;
  font-size: 14px;
}

/* fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
