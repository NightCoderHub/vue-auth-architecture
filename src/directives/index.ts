import type { App } from 'vue';

export const setupDirectives = (app: App) => {
  // 示例：自定义权限指令 v-permission
  app.directive('permission', {
    mounted(_el, binding) {
      const { value } = binding;
      // 这里可以添加实际的权限判断逻辑
      // const hasPermission = useUserStore().hasPermission(value);
      // if (!hasPermission) {
      //   el.parentNode && el.parentNode.removeChild(el);
      // }
      console.log('v-permission directive mounted', value);
    },
  });
};
