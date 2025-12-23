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
import { normalizePath } from '@/utils/path-governance';

import variables from '@/styles/variables.module.scss';

const route = useRoute();
const appStore = useAppStore();
const permissionStore = usePermissionStore();

const showLogo = computed(() => true); // Can be controlled by settings
const isCollapse = computed(() => !appStore.sidebar.opened);

/**
 * Filter and sort routes for the sidebar.
 *
 * Rules:
 * 1. Filter out hidden or disabled routes.
 * 2. Sort by 'orderNo' (ascending).
 */
const permission_routes = computed(() => {
  const menus = permissionStore.menus;

  // Filter hidden or disabled routes
  const filteredMenus = menus.filter(route => {
    const meta = route.meta;
    if (!meta) return true; // Default visible
    if (meta.hidden === true) return false;
    if (meta.enabled === false) return false;
    return true;
  });

  // Sort by orderNo
  return filteredMenus.sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
});

/**
 * Determine the active menu index.
 *
 * Priority:
 * 1. meta.activeMenu (if configured, e.g., for hidden detail pages)
 * 2. route.path (default)
 */
const activeMenu = computed(() => {
  const { meta, path } = route;
  
  let activePath = path;
  if (meta.activeMenu) {
    activePath = meta.activeMenu as string;
  }

  // Path Governance: 使用统一的规范化工具
  const normalized = normalizePath(activePath);

  return normalized;
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
