<template>
  <template v-if="!isHidden">
    <!-- 叶子节点（无子节点或单个子节点视为根节点） -->
    <template v-if="showAsLeaf">
      <app-link v-if="leafRoute.meta" :to="resolvePath(leafRoute.path)">
        <el-menu-item
          :index="resolvePath(leafRoute.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
          v-bind="$attrs"
        >
          <Icon v-if="leafRoute.meta.icon" :icon="'ep:' + leafRoute.meta.icon" class="el-icon" />
          <template #title>
            <span>{{ leafRoute.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 子菜单节点 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported v-bind="$attrs">
      <template #title>
        <Icon v-if="item.meta && item.meta.icon" :icon="'ep:' + item.meta.icon" class="el-icon" />
        <span v-if="item.meta">{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="child in sortedChildren"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import type { PropType } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import AppLink from './Link.vue';

defineOptions({
  inheritAttrs: false,
});

// 定义具有严格类型的 Props
const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: '',
  },
});

// 用于叶子路由计算的辅助类型
type DisplayRoute = RouteRecordRaw & { noShowingChildren?: boolean };

// 检查当前路由是否隐藏或禁用
const isHidden = computed(() => {
  return props.item.meta?.hidden === true || props.item.meta?.enabled === false;
});

// 过滤应该显示的子节点
const showingChildren = computed(() => {
  const children = props.item.children || [];
  return children.filter((item) => {
    return !item.meta?.hidden && item.meta?.enabled !== false;
  });
});

// 根据 orderNo 对子节点进行排序
const sortedChildren = computed(() => {
  return [...showingChildren.value].sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
});

// 确定是否应将此项显示为叶子节点（无下拉菜单）的逻辑
// 返回要显示为叶子节点的路由对象
const leafRouteResult = computed<{ isLeaf: boolean; route: DisplayRoute | null }>(() => {
  const alwaysShow = props.item.meta?.alwaysShow;
  const childrenCount = showingChildren.value.length;

  // 如果 alwaysShow 为 true，则永远不显示为叶子节点（始终作为子菜单）
  if (alwaysShow) {
    return { isLeaf: false, route: null };
  }

  // 情况 1：没有显示的子节点 -> 将父节点显示为叶子节点
  if (childrenCount === 0) {
    return {
      isLeaf: true,
      route: { ...props.item, path: '', noShowingChildren: true } as DisplayRoute
    };
  }

  // 情况 2：有一个显示的子节点 -> 将该子节点显示为叶子节点（扁平化）
  if (childrenCount === 1) {
    const child = showingChildren.value[0];
    if (!child) {
      return { isLeaf: false, route: null };
    }

    // 检查子节点是否有自己的显示子节点
    const grandChildren = child.children || [];
    const showingGrandChildren = grandChildren.filter((item) => {
      return !item.meta?.hidden && item.meta?.enabled !== false;
    });

    // 如果子节点有显示的子节点或设置为始终显示，
    // 我们不能将其扁平化为叶子节点，因为这会隐藏其子节点。
    // 相反，我们将当前项视为子菜单 (isLeaf: false)。
    if (showingGrandChildren.length > 0 || child.meta?.alwaysShow) {
      return { isLeaf: false, route: null };
    }

    return {
      isLeaf: true,
      route: child as DisplayRoute
    };
  }

  // 情况 3：多个子节点 -> 显示为子菜单
  return { isLeaf: false, route: null };
});

const showAsLeaf = computed(() => leafRouteResult.value.isLeaf);
const leafRoute = computed(() => leafRouteResult.value.route as DisplayRoute);

// 路径解析逻辑
const resolvePath = (routePath: string) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 合并路径
  // 确保没有双斜杠
  const basePath = props.basePath.endsWith('/') ? props.basePath : props.basePath + '/';
  const path = routePath.startsWith('/') ? routePath.slice(1) : routePath;
  const cleanPath = (basePath + path).replace(/\/+/g, '/');

  return cleanPath;
};

// 检查外部链接的工具函数
const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path);
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.module.scss' as *;

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  // font-size: 14px;
  // letter-spacing: 0.5px; // 增加间距

  // 图标
  // .el-icon {
  //   width: 18px;
  //   height: 18px;
  //   font-size: 18px;
  //   color: #9ca3af;
  // }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05) !important; // 使用明确的悬停颜色或变量
  }
}

// :deep(.el-menu-item) {
//   &.is-active {
//     background-color: rgba(255, 255, 255, 0.05) !important;
//     color: $menuActiveText !important;
//
//     &::before {
//       content: '';
//       position: absolute;
//       left: 0;
//       top: 0;
//       bottom: 0;
//       width: 3px;
//       background: var(--el-color-primary);
//     }
//
//     .el-icon {
//       color: #ffffff;
//     }
//   }
// }
</style>
