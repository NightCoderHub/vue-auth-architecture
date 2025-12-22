import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export interface TagView extends Partial<RouteLocationNormalized> {
  title?: string;
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([]);
  const cachedViews = ref<string[]>([]);

  function addView(view: RouteLocationNormalized) {
    addVisitedView(view);
    addCachedView(view);
  }

  function addVisitedView(view: RouteLocationNormalized) {
    if (visitedViews.value.some((v) => v.path === view.path)) return;
    visitedViews.value.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name',
      })
    );
  }

  function addCachedView(view: RouteLocationNormalized) {
    if (cachedViews.value.includes(view.name as string)) return;
    if (!view.meta.noCache) {
      cachedViews.value.push(view.name as string);
    }
  }

  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delVisitedView(view: TagView) {
    for (const [i, v] of visitedViews.value.entries()) {
      if (v.path === view.path) {
        visitedViews.value.splice(i, 1);
        break;
      }
    }
  }

  function delCachedView(view: TagView) {
    const index = cachedViews.value.indexOf(view.name as string);
    if (index > -1) {
      cachedViews.value.splice(index, 1);
    }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    delView,
    delVisitedView,
    delCachedView,
  };
});
