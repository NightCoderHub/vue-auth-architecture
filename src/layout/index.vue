<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView }" class="main-container">
      <div class="layout-header">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';
import Sidebar from './components/Sidebar/index.vue';
import Navbar from './components/Navbar.vue';
import TagsView from './components/TagsView/index.vue';
import AppMain from './components/AppMain.vue';
import useResizeHandler from './mixin/ResizeHandler';

const appStore = useAppStore();
const { device, sidebar } = useResizeHandler();

const needTagsView = computed(() => true);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}));

const handleClickOutside = () => {
  appStore.closeSidebar(false);
};
</script>

<style lang="scss" scoped>
@use '@/styles/element/index.scss' as *;
@use '@/styles/variables.module.scss' as *;

.app-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}

.sidebar-container {
  transition: width 0.28s;
  width: $sideBarWidth !important;
  background-color: $menuBg;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
  z-index: 1001;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.05);

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  // Reset Element Plus Menu styles for Sidebar
  :deep(.el-menu) {
    border: none;
    height: 100%;
    width: 100% !important;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background-color: $mainBg;
  position: relative;
}

.layout-header {
  width: 100%;
  flex-shrink: 0;
  background: $navbarBg;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;
}

.hideSidebar {
  .sidebar-container {
    width: $sideBarWidthCollapsed !important;
  }
}
</style>
