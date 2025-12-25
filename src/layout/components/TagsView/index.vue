<template>
  <div class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        class="tags-view-item"
        :class="isActive(tag) ? 'active' : ''"
        @click.middle="closeSelectedTag(tag)"
      >
        <Icon
          v-if="tag.meta && tag.meta.icon"
          :icon="tag.meta.icon"
          class="tag-icon"
        />
        {{ tag.title }}
        <span v-if="!isAffix(tag)" class="close-icon" @click.prevent.stop="closeSelectedTag(tag)">
          <Icon icon="ep:close" />
        </span>
      </router-link>
    </scroll-pane>
  </div>
</template>

<script setup lang="ts">
/**
 * @description: 标签页视图组件
 * 显示已访问的视图标签，支持关闭和切换
 */
import { computed, watch, onMounted, ref } from 'vue';
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router';
import { useTagsViewStore, type TagView } from '@/stores/tagsView';
import { usePermissionStore } from '@/permission/permissionStore';
import ScrollPane from './ScrollPane.vue';
import path from 'path-browserify';

const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const router = useRouter();

const affixTags = ref<TagView[]>([]);

// 使用计算属性对 visitedViews 进行排序，确保 affix 标签始终在前面
const visitedViews = computed(() => {
  const views = tagsViewStore.visitedViews;
  const affix = views.filter(tag => tag.meta?.affix);
  const normal = views.filter(tag => !tag.meta?.affix);
  return [...affix, ...normal];
});

const isActive = (tag: TagView) => {
  return tag.path === route.path;
};

const isAffix = (tag: TagView) => {
  return tag.meta && tag.meta.affix;
};

const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/') => {
  let tags: TagView[] = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = path.resolve(basePath, route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
};

const initTags = () => {
    const routes = permissionStore.menus; // 假设permissionStore拥有所有路由
    const tags = filterAffixTags(routes);
    affixTags.value = tags;
    for (const tag of tags) {
      // 必须包含标签名称
      if (tag.name) {
        tagsViewStore.addVisitedView(tag as any);
      }
    }
  };

const addTags = () => {
  if (route.name) {
    tagsViewStore.addView(route);
  }
};

const closeSelectedTag = (view: TagView) => {
  if (isAffix(view)) return;
  tagsViewStore.delView(view).then(({ visitedViews }: any) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
};

const toLastView = (visitedViews: TagView[], view: TagView) => {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath as string);
  } else {
    // 如果没有标签了，默认重定向到首页，
    // 但由于我们有固定标签，除非首页被关闭（这是被阻止的），否则通常不会命中这个分支。
    if (view.name === 'Home') {
       router.replace({ path: '/redirect' + view.fullPath });
    } else {
      router.push('/');
    }
  }
};

watch(
  () => route.path,
  () => {
    addTags();
  }
);

onMounted(() => {
  initTags();
  addTags();
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/variables.scss' as *;

.tags-view-container {
  height: $tagsViewHeight;
  width: 100%;
  display: flex;
  align-items: center;

  // 优化：升级到合成器层，以防止布局转换时的闪烁
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;

  .tags-view-wrapper {
    width: 100%;

    :deep(.el-scrollbar__view) {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 30px;
      line-height: 30px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      color: var(--color-text-regular);
      background: var(--color-bg-container);
      padding: 0 10px;
      font-size: 13px;
      margin-left: 8px;
      margin-top: 0;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      user-select: none;

      // 优化：避免在活动状态变化时触发布局抖动
      // will-change: color, background-color, border-color;

      .tag-icon {
        margin-right: 4px;
        font-size: 14px;
        vertical-align: -2px;
      }

      &:hover {
        // color: var(--color-primary);
        // border-color: var(--color-primary-light-5);
        // background-color: var(--color-primary-light-9);
        color: color.adjust($primary, $lightness: 5%);
        z-index: 10;

        .close-icon {
          opacity: 1;
          color: color.adjust($primary, $lightness: 5%);
        }
      }

      &:first-of-type {
        margin-left: 20px;
      }

      &:last-of-type {
        margin-right: 20px;
      }

      &.active {
       color: color.adjust($primary, $lightness: 5%);
        // border-color: var(--color-primary-light-5);
        // background-color: var(--color-primary-light-9);
        font-weight: 500;

        .close-icon {
           color: color.adjust($primary, $lightness: 5%);
        }
      }

      .close-icon {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 4px;
        transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        opacity: 0.6;
        transform: scale(0.9);
        color: var(--color-text-secondary);
        font-size: 12px;

        &:hover {
          background-color: color.adjust($primary, $lightness: 5%);
          color: #ffffff !important;
          transform: scale(1);
        }
      }
    }
  }
}
</style>
