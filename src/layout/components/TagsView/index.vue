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
          :icon="tag.meta.icon.startsWith('ep:') ? tag.meta.icon : 'ep:' + tag.meta.icon"
          class="tag-icon"
        />
        {{ tag.title }}
        <span v-if="!isAffix(tag)" class="close-icon" @click.prevent.stop="closeSelectedTag(tag)">
          <el-icon><Close /></el-icon>
        </span>
      </router-link>
    </scroll-pane>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsViewStore, type TagView } from '@/stores/tagsView';
import { Close } from '@element-plus/icons-vue';
// ScrollPane could be a simple div with overflow-x: auto for now
import ScrollPane from './ScrollPane.vue';

const tagsViewStore = useTagsViewStore();
const route = useRoute();
const router = useRouter();

const visitedViews = computed(() => tagsViewStore.visitedViews);

const isActive = (tag: TagView) => {
  return tag.path === route.path;
};

const isAffix = (tag: TagView) => {
  return tag.meta && tag.meta.affix;
};

const addTags = () => {
  if (route.name) {
    tagsViewStore.addView(route);
  }
};

const closeSelectedTag = (view: TagView) => {
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
    if (view.name === 'HomeView') {
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
  addTags();
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/variables.scss' as *;

.tags-view-container {
  height: $tagsViewHeight;
  width: 100%;
  margin-bottom: 12px;
  background: var(--color-bg-layout);
  // border-bottom: 1px solid #dcdfe6;
  // box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;

  .tags-view-wrapper {
    width: 100%;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 32px; // 4 * 8
      line-height: 30px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      color: var(--color-text-regular);
      background: var(--color-bg-container);
      padding: 0 10px; // 1.5 * 8, comfortable density
      font-size: 13px;
      margin-left: 8px; // 1 * 8 grid
      margin-top: 0;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      user-select: none;

      .tag-icon {
        margin-right: 4px; // Visual balance (not strictly 8px but 8px is too wide here)
        font-size: 14px;
        vertical-align: -2px;
      }

      &:hover {
        // color: var(--color-primary);
        // border-color: var(--color-primary-light-5);
        // background-color: var(--color-primary-light-9);
        color: color.adjust($primary, $lightness: 5%);
        z-index: 10; // Ensure hover state is on top

        .close-icon {
          opacity: 1;
          color: color.adjust($primary, $lightness: 5%);
        }
      }

      &:first-of-type {
        margin-left: 20px; // Align with Navbar padding (3 * 8)
      }

      &:last-of-type {
        margin-right: 20px; // Align with Navbar padding (3 * 8)
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
        width: 14px; // 2 * 8
        height: 14px; // 2 * 8
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 4px; // 1 * 8 grid
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
