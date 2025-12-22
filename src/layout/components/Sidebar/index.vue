<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in permission_routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { usePermissionStore } from '@/permission/permissionStore';
import Logo from './Logo.vue';
import SidebarItem from './SidebarItem.vue';

import variables from '@/styles/variables.module.scss';

const route = useRoute();
const appStore = useAppStore();
const permissionStore = usePermissionStore();

const showLogo = computed(() => true); // Can be controlled by settings
const isCollapse = computed(() => !appStore.sidebar.opened);
const permission_routes = computed(() => {
  const menus = permissionStore.menus;
  // Deep clone or just sort top level?
  // Sorting top level is a good start.
  // Since SidebarItem also sorts its children (we will implement this), we just need to sort the root here.
  return [...menus].sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
});

const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.module.scss' as *;

.has-logo {
  .el-scrollbar {
    height: calc(100% - 50px);
  }
}

:deep(.el-menu) {
  border: none;
  height: 100%;
  width: 100% !important;
}
</style>
