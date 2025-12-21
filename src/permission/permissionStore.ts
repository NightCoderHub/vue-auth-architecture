import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePermissionStore = defineStore('permission', () => {
  // 权限代码 (例如: 'user:add', 'order:delete')
  const permissions = ref<string[]>([]);
  
  // 菜单结构 (树形)
  const menus = ref<any[]>([]);

  function setPermissions(perms: string[]) {
    permissions.value = perms;
  }
  
  function setMenus(newMenus: any[]) {
      menus.value = newMenus;
  }
  
  function clear() {
      permissions.value = [];
      menus.value = [];
  }

  return {
    permissions,
    menus,
    setPermissions,
    setMenus,
    clear
  };
});
