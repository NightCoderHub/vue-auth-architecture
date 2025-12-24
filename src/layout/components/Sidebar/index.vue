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
@use '@/styles/variables.scss' as *;

.has-logo {
  .el-scrollbar {
    height: calc(100% - #{$sideLogoHeight});

    // Ensure horizontal scrollbar is hidden to prevent vertical space consumption
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }
}

:deep(.el-menu) {
  border: none;
  height: auto; // Allow content to dictate height
  width: 100% !important;
  background-color: transparent !important;
  padding-top: 4px; // Compensate for the removed margin-top on first item
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  // Height calculation: content (42px) + bottom spacing (4px)
  // Using border instead of margin prevents height calculation issues during animation
  height: calc(#{$menuItemHeight} + 4px);
  line-height: $menuItemHeight;
  margin: 0 8px; // Keep horizontal margin, remove vertical margin
  border-bottom: 4px solid transparent; // Simulate margin-bottom
    border-bottom-color:transparent !important;
  background-clip: padding-box; // Prevent background from covering the transparent border
  box-sizing: border-box;

  // Fix: Compensate border-radius for the bottom border to ensure visual consistency
  // Inner radius = Outer radius - Border width
  // So we need: Outer radius = Desired inner radius (6px) + Border width (4px)
  border-radius: $menuItemRadius; // Top corners default to 6px
  border-bottom-left-radius: calc(#{$menuItemRadius} + 4px);
  border-bottom-right-radius: calc(#{$menuItemRadius} + 4px);

  width: auto;
  font-size: $menuItemFontSize;
  font-weight: 500; // Medium weight
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    background-color: $menuHover !important;
    color: $menuActiveText !important;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); // Light shadow on hover

    .el-icon {
      color: $menuActiveText; // Icon also highlights on hover
    }
  }

  .el-icon {
    // width: 1em;
    // height: 1em;
    margin-right: $menuIconSpacing;
    font-size: $menuIconSize; // 18px
    color: inherit;
    transition: all 0.3s;
  }

  span {
    vertical-align: middle;
  }
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: unset; // Reset Element Plus default
}

:deep(.el-menu-item) {
  &.is-active {
    background-color: $menuActiveBg !important;
    color: $menuActiveText !important;
    font-weight: 500;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .el-icon {
      color: $menuActiveText;
    }

    // Active Arrow
    .el-sub-menu__icon-arrow {
      color: $menuActiveText !important;
    }
  }
}

:deep(.el-sub-menu__icon-arrow) {
  font-size: $menuArrowSize !important;
  width: $menuArrowSize;
  height: $menuArrowSize;
  right: 0; // Fixed right distance
  color: $menuArrowColor !important;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

// Collapse specific styles
:deep(.el-menu--collapse) {
  width: 100% !important;

  // Ensure router-link (a tag) behaves as a block to fill the width
  // This is crucial because SidebarItem wraps el-menu-item in an anchor tag
  a {
    display: block;
    width: 100%;
    // Remove default margins or padding from the link itself
    margin: 0;
    padding: 0;
  }

  .el-menu-item,
  .el-sub-menu__title {
    padding: 0 !important;
    margin: 0 8px; // Horizontal margin
    border-bottom: 4px solid transparent; // Simulate margin-bottom
    background-clip: padding-box;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 100%;
    height: calc(#{$menuItemHeight} + 4px); // Ensure fixed height
    line-height: 1; // Prevent line-height from affecting vertical alignment

    .el-icon {
      margin: 0 !important;
      // Ensure icon container is perfectly centered
      width: 100%;
      font-size: $menuIconSize;
      // height: 100%;
      // max-width: 1em;
      max-height: 1em;
      // font-size: 1.125rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      // Reset position relative to flex container
      position: static;
      transform: none;
    }

    // Hide text and arrow completely
    span,
    .el-sub-menu__icon-arrow {
      display: none !important;
      width: 0;
      height: 0;
      overflow: hidden;
      visibility: hidden;
      margin: 0;
      padding: 0;
    }
  }

  // Ensure tooltips don't mess up layout if they wrap content
  > .el-menu-item {
     &.is-active {
         // Keep active styles consistent
     }
  }

  // Fix tooltip/popover trigger area in collapse mode
  .el-sub-menu {
    &.is-active {
      > .el-sub-menu__title {
        //  background-color: $menuActiveBg !important;
      }
    }
  }
}
</style>
