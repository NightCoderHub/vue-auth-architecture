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
@use '@/styles/variables.scss' as *;

.tags-view-container {
  height: $tagsViewHeight;
  width: 100%;
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-1);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 28px; // Slightly taller for better click area
      line-height: 28px;
      border: none; // Remove border
      border-radius: var(--border-radius-base); // Smooth rounded
      color: var(--color-text-regular); // Medium grey
      background: transparent;
      padding: 0 12px;
      font-size: 13px;
      margin-left: 6px;
      margin-top: 3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background-color: var(--color-bg-spotlight);
        color: var(--color-text-primary);

        .close-icon {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:first-of-type {
        margin-left: 16px;
      }

      &:last-of-type {
        margin-right: 16px;
      }

      &.active {
        background-color: var(--color-bg-spotlight); // Use semantic color if available or keep hardcoded for now, but spotlight is good for active/selected
        background-color: #E6EFFF; // Hardcoded matches var(--color-primary-light-9) approximately
        color: var(--color-primary);
        font-weight: 500;
        box-shadow: none;

        &::before {
          display: none; // Remove the dot
        }
      }

      .close-icon {
        width: 14px;
        height: 14px;
        vertical-align: -1px;
        border-radius: 50%;
        text-align: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        margin-left: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        opacity: 0; // Hidden by default
        transform: scale(0.8);
        color: var(--color-text-secondary);

        &:hover {
          background-color: var(--color-danger); // Light red bg
          color: #ffffff; // Red text
        }
      }
    }
  }
}
</style>
