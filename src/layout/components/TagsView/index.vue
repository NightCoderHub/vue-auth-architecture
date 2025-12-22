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
@use '@/styles/variables.module.scss' as *;

.tags-view-container {
  height: $tagsViewHeight;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 28px; // Slightly taller for better click area
      line-height: 28px;
      border: none; // Remove border
      border-radius: 6px; // Smooth rounded
      color: #6b7280; // Medium grey
      background: transparent;
      padding: 0 12px;
      font-size: 13px;
      margin-left: 6px;
      margin-top: 3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background-color: #f3f4f6;
        color: #111827;

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
        background-color: #ffffff;
        color: var(--el-color-primary);
        font-weight: 500;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 2px 4px 0 rgba(64, 158, 255, 0.15); // Subtle shadow

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
        color: #9ca3af;

        &:hover {
          background-color: #fee2e2; // Light red bg
          color: #ef4444; // Red text
        }

        // Always show on active tag? User said "Only in Hover".
        // But UX-wise, active tag might need close button visible?
        // "Close button: Only in Hover (Hover) display close icon, keep visual interface minimal and focused."
        // I will follow instruction strictly: Only on hover.
      }
    }
  }
}
</style>
