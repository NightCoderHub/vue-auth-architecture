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

    // 确保隐藏水平滚动条以防止垂直空间消耗
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }
}

:deep(.el-menu) {
  border: none;
  height: auto; // 允许内容指定高度
  width: 100% !important;
  background-color: transparent !important;
  padding-top: 4px; //补偿第一个项目上删除的页边空白顶部
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  // 高度计算：内容（42px）+底部间距（4px）
  // 使用边框而不是边距可以防止动画过程中的高度计算问题
  height: calc(#{$menuItemHeight} + 4px);
  line-height: $menuItemHeight;
  margin: 0 8px; // 保留水平边距，删除垂直边距
  border-bottom: 4px solid transparent; // 模拟margin底部
    border-bottom-color:transparent !important;
  background-clip: padding-box; // 防止背景覆盖透明边框
  box-sizing: border-box;

  // 修复：补偿底部边框的边框半径，以确保视觉一致性
  // 内半径=外半径-边框宽度
  // 所以我们需要：外半径=所需的内半径（6px）+边框宽度（4px）
  border-radius: $menuItemRadius;
  border-bottom-left-radius: calc(#{$menuItemRadius} + 4px);
  border-bottom-right-radius: calc(#{$menuItemRadius} + 4px);

  width: auto;
  font-size: $menuItemFontSize;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    background-color: $menuHover !important;
    color: $menuActiveText !important;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .el-icon {
      color: $menuActiveText;
    }
  }

  .el-icon {
    // width: 1em;
    // height: 1em;
    margin-right: $menuIconSpacing;
    font-size: $menuIconSize;
    color: inherit;
    transition: all 0.3s;
  }

  span {
    vertical-align: middle;
  }
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: unset; //重置Element Plus默认值
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


    .el-sub-menu__icon-arrow {
      color: $menuActiveText !important;
    }
  }
}

:deep(.el-sub-menu__icon-arrow) {
  font-size: $menuArrowSize !important;
  width: $menuArrowSize;
  height: $menuArrowSize;
  right: 0; // 固定右距离
  color: $menuArrowColor !important;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

// 折叠特定样式
:deep(.el-menu--collapse) {
  width: 100% !important;

  // 确保路由器链接（标签）作为一个块来填充宽度
  // 这一点至关重要，因为SidebarItem将el菜单项包装在锚点标记中
  a {
    display: block;
    width: 100%;
    // 删除链接本身的默认边距或填充
    margin: 0;
    padding: 0;
  }

  .el-menu-item,
  .el-sub-menu__title {
    padding: 0 !important;
    margin: 0 8px; // 水平边距保持与非折叠状态一致
    border-bottom: 4px solid transparent; // 模拟margin-bottom
    background-clip: padding-box;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 100%;
    height: calc(#{$menuItemHeight} + 4px); // 确保固定高度
    line-height: 1; // 防止行高影响垂直对齐

    .el-icon {
      margin: 0 !important;
      // 确保图标容器完美居中
      width: 100%;
      font-size: $menuIconSize;
      // height: 100%;
      // max-width: 1em;
      max-height: 1em;
      // font-size: 1.125rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      // 重置位置相对于flex容器
      position: static;
      transform: none;
    }

    // 隐藏文本和箭头完全
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

  // 确保工具提示不会搞乱布局，如果它们包装内容
  > .el-menu-item {
     &.is-active {
         // 保持活动样式一致
     }
  }

  // 修复折叠模式下工具提示/弹出窗口触发区域
  .el-sub-menu {
    &.is-active {
      > .el-sub-menu__title {
        //  background-color: $menuActiveBg !important;
      }
    }
  }
}
</style>
