<template>
  <template v-if="!isHidden">
    <!--
      叶子节点渲染
      当路由没有子节点，或者只有一个子节点且 alwaysShow 为 false 时渲染。
    -->
    <template v-if="showAsLeaf">
      <app-link v-if="leafRoute.meta" :to="resolvePath(leafRoute.path, leafRoute.meta.externalLink)">
        <el-menu-item
          :index="resolvePath(leafRoute.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
          v-bind="$attrs"
        >
          <!-- 图标处理：支持 Element Plus 图标的 'ep:' 前缀 -->
          <Icon
            v-if="leafRoute.meta.icon"
            :icon="leafRoute.meta.icon.startsWith('ep:') ? leafRoute.meta.icon : 'ep:' + leafRoute.meta.icon"
            class="el-icon"
          />
          <template #title>
            <span>{{ leafRoute.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!--
      子菜单节点渲染
      当路由有多个子节点，或者 alwaysShow 为 true 时渲染。
    -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported v-bind="$attrs">
      <template #title>
        <Icon
          v-if="item.meta && item.meta.icon"
          :icon="item.meta.icon.startsWith('ep:') ? item.meta.icon : 'ep:' + item.meta.icon"
          class="el-icon"
        />
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
import { normalizePath } from '@/utils/path-governance';


defineOptions({
  inheritAttrs: false,
});

/**
 * Props 定义
 */
const props = defineProps({
  // 要渲染的路由对象
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  // 该项是否嵌套在另一个子菜单中
  isNest: {
    type: Boolean,
    default: false,
  },
  // 用于解析相对路径的基础路径
  basePath: {
    type: String,
    default: '',
  },
});

// 叶子路由计算的辅助类型
type DisplayRoute = RouteRecordRaw & { noShowingChildren?: boolean };

/**
 * 确定菜单项是否应该隐藏。
 * 检查 meta 中的 'hidden' (默认为 false) 和 'enabled' (默认为 true) 属性。
 */
const isHidden = computed(() => {
  const meta = props.item.meta;
  if (!meta) return false;

  // hidden: true 表示隐藏
  if (meta.hidden === true) return true;

  // enabled: false 表示禁用/隐藏
  if (meta.enabled === false) return true;

  return false;
});

/**
 * 过滤应该显示的子项。
 * 检查每个子项的 'hidden' 和 'enabled'。
 */
const showingChildren = computed(() => {
  const children = props.item.children || [];
  return children.filter((item) => {
    const meta = item.meta;
    if (!meta) return true; // 如果没有 meta，默认可见
    if (meta.hidden === true) return false;
    if (meta.enabled === false) return false;
    return true;
  });
});

/**
 * 根据 'orderNo' 对子项进行排序。
 * 默认 orderNo 为 0。
 */
const sortedChildren = computed(() => {
  return [...showingChildren.value].sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
});

/**
 * 确定该项是否应渲染为叶子节点（无子菜单）的逻辑。
 * 严格遵循 'alwaysShow' 逻辑。
 */
const leafRouteResult = computed<{ isLeaf: boolean; route: DisplayRoute | null }>(() => {
  // 根据 router.d.ts 定义，默认 alwaysShow 为 true
  // 然而，通常的标准行为暗示如果未指定，则为 false 以进行扁平化。
  // 如果提供了显式值，我们将遵循该值，否则仅在严格请求时默认为 true。
  // 但是，根据常见用法，alwaysShow=true 意味着“保持为子菜单”。
  // 如果未定义，通常允许扁平化。
  // router.d.ts 说 @default true。
  // 让我们使用 ?? true 来严格遵守用户提供的类型定义。
  const alwaysShow = props.item.meta?.alwaysShow ?? true;

  const childrenCount = showingChildren.value.length;

  // 如果 alwaysShow 为 true，我们从不扁平化（除非 0 个子项，如下处理）
  // 如果 0 个子项，它必须是叶子节点。

  // 情况 1: 没有可显示的子项 -> 渲染为叶子节点（实际上不管 alwaysShow 如何）
  // 除非它是目录类型？但在这里我们只渲染为叶子链接。
  if (childrenCount === 0) {
    return {
      isLeaf: true,
      route: { ...props.item, path: '', noShowingChildren: true } as DisplayRoute
    };
  }

  // 如果 alwaysShow 为 true，且有子项，则渲染为子菜单。
  if (alwaysShow) {
    return { isLeaf: false, route: null };
  }

  // 情况 2: 有一个可显示的子项 -> 扁平化为叶子节点（如果 alwaysShow 为 false）
  if (childrenCount === 1) {
    const child = showingChildren.value[0];
    if (!child) {
      return { isLeaf: false, route: null };
    }

    // 检查子项是否有其自己的可显示子项
    const grandChildren = child.children || [];
    const showingGrandChildren = grandChildren.filter((item) => {
      const meta = item.meta;
      if (!meta) return true;
      return !meta.hidden && meta.enabled !== false;
    });

    // 如果子项有子项，则不扁平化
    if (showingGrandChildren.length > 0) {
       return { isLeaf: false, route: null };
    }

    return {
      isLeaf: true,
      route: child as DisplayRoute
    };
  }

  // 情况 3: 多个子项 -> 渲染为子菜单
  return { isLeaf: false, route: null };
});

const showAsLeaf = computed(() => leafRouteResult.value.isLeaf);
const leafRoute = computed(() => leafRouteResult.value.route as DisplayRoute);

/**
 * 解析菜单项的路径。
 * 如果存在，优先使用 meta 中的 'externalLink'。
 */
const resolvePath = (routePath: string, externalLink?: string) => {
  // 如果提供了 meta.externalLink，直接使用它
  if (externalLink) {
    return externalLink;
  }

  if (isExternalUrl(routePath)) {
    return routePath;
  }
  if (isExternalUrl(props.basePath)) {
    return props.basePath;
  }

  // 如果路径是绝对路径，直接返回
  if (routePath.startsWith('/')) {
    return routePath;
  }

  // 解析相对路径
  const basePath = props.basePath.endsWith('/') ? props.basePath : props.basePath + '/';
  const cleanPath = (basePath + routePath).replace(/\/+/g, '/');

  // Path Governance: 最终路径必须经过标准化处理
  return normalizePath(cleanPath);
};

// 内联 isExternal 工具函数
const isExternalUrl = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path);
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.module.scss' as *;

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  &:hover {
    background-color: $menuHover !important;
    color: $primary !important;
  }
}

// Active Menu Item
:deep(.el-menu-item.is-active) {
  background-color: $menuActiveBg !important;
  color: $menuActiveText !important;
  border-right: 3px solid $primary;

  .el-icon {
    color: $menuActiveText !important;
  }
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: $menuActiveText !important;
}
</style>
