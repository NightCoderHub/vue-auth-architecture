import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePermissionStore = defineStore('permission', () => {
  // Permission Codes (e.g., 'user:add', 'order:delete')
  const permissions = ref<string[]>([]);
  
  // Menu Structure (Tree)
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
