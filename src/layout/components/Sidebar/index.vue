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

const showLogo = computed(() => true); // 可以通过设置进行控制
const isCollapse = computed(() => !appStore.sidebar.opened);

/**
 * 过滤并排序侧边栏路由。
 *
 * 规则：
 * 1. 过滤掉隐藏或禁用的路由。
 * 2. 按 'orderNo' 排序（升序）。
 */
const permission_routes = computed(() => {
  const menus = permissionStore.menus;

  // 过滤隐藏或禁用的路由
  const filteredMenus = menus.filter(route => {
    const meta = route.meta;
    if (!meta) return true; // 默认可见
    if (meta.hidden === true) return false;
    if (meta.enabled === false) return false;
    return true;
  });

  // 按 orderNo 排序
  return filteredMenus.sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
});

/**
 * 确定当前激活的菜单索引。
 *
 * 优先级：
 * 1. meta.activeMenu（如果已配置，例如用于隐藏的详情页）
 * 2. route.path（默认）
 */
const activeMenu = computed(() => {
  const { meta, path } = route;

  let activePath = path;
  if (meta.activeMenu) {
    activePath = meta.activeMenu as string;
  }

  // 路径治理：使用统一的规范化工具
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
