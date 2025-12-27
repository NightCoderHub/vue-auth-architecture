import { mount, type MountingOptions } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

export function mountWithPlugins(component: any, options: MountingOptions<any> = {}) {
  const pinia = createPinia();
  const router = createRouter({
    history: createWebHistory(),
    routes: [], // 根据需要传入路由配置
  });

  return mount(component, {
    global: {
      plugins: [pinia, router],
      ...options.global,
    },
    ...options,
  });
}