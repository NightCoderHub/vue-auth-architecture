import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { constantRoutes } from '../router';

export const usePermissionStore = defineStore('permission', () => {
  // 权限代码 (例如: 'user:add', 'order:delete')
  const permissions = ref<string[]>([]);
  
  // 菜单结构 (树形)
  // 初始化时包含常量路由
  const menus = ref<RouteRecordRaw[]>(constantRoutes);
  
  // 标记动态路由是否已生成
  const routesGenerated = ref(false);

  function setPermissions(perms: string[]) {
    permissions.value = perms;
  }
  
  function setMenus(newMenus: RouteRecordRaw[]) {
      // 合并常量路由和动态路由
      menus.value = constantRoutes.concat(newMenus);
      routesGenerated.value = true;
  }
  
  function clear() {
      permissions.value = [];
      menus.value = [];
      routesGenerated.value = false;
  }

  return {
    permissions,
    menus,
    routesGenerated,
    setPermissions,
    setMenus,
    clear
  };
});
