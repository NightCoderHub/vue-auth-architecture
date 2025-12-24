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

    // 如果是 affix 标签，插入到所有 affix 标签的后面（保持在列表前面）
    // 如果是普通标签，直接 push 到最后
    // 这里简化逻辑：我们会在组件层面通过 initTags 和排序来保证顺序，
    // 但为了 store 的健壮性，我们可以做一个简单的 push，由组件来维护顺序或初始化。
    // 不过，为了满足"始终作为第一个标签"的要求，我们可以在添加时做检查。

    // 简单实现：直接 push，后续在组件中通过排序或 filterAffixTags 逻辑来保证
    // 或者在这里做插入排序？通常 TagsView 的顺序是按照访问顺序来的，除了 affix tags。

    // 实际上，affix tags 应该在初始化时就全部加入。
    // 动态访问时，如果是新的 affix tag（不太可能，affix 通常是静态路由属性），也应该加入。

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
    // Prevent closing affix tags
    if (view.meta?.affix) return;

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
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delCachedView,
  };
});
