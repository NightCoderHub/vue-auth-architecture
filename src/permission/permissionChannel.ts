import { usePermissionStore } from './permissionStore';
import { resetRouter, buildRoutes } from './routeBuilder';
import router from '../router';
import apiClient from '../axios'; // 用于获取权限

/**
 * 实时权限更新通道
 * 
 * 建立 WebSocket/SSE 连接以监听权限变更。
 * 当发生 'PERMISSION_UPDATED' 事件时：
 * 1. 清除本地权限数据。
 * 2. 从 API 重新获取最新权限。
 * 3. 重建 Vue Router。
 * 4. 验证当前页面是否仍然可访问。
 */
export function initPermissionChannel() {
  console.log('[PermissionChannel] Listening for security events...');

  // 模拟实现：暴露一个全局函数以模拟后端推送
  // 用法: window.simulatePermissionChange()
  (window as any).simulatePermissionChange = async () => {
    console.warn('⚠️ [Security] Permission Change Event Received');
    await handlePermissionUpdate();
  };
}

async function handlePermissionUpdate() {
  const permissionStore = usePermissionStore();

  // 1. 清除旧数据（故障安全）
  permissionStore.clear();
  resetRouter();

  try {
    // 2. 重新获取权限
    // 在真实应用中: const res = await apiClient.get('/user/permissions');
    console.log('[PermissionChannel] Fetching new permissions...');
    
    // 模拟延迟和响应
    await new Promise(r => setTimeout(r, 500)); 
    const newPermissions = ['admin', 'user:read']; // 模拟的新权限
    
    permissionStore.setPermissions(newPermissions);

    // 3. 重建路由
    buildRoutes(newPermissions);

    // 4. 安全检查：当前页面是否仍然允许访问？
    const currentPath = router.currentRoute.value.fullPath;
    const resolved = router.resolve(currentPath);

    // 如果路由匹配 'NotFound' (通常用于 404 的名称) 或无匹配项
    // 这意味着路由在 resetRouter 期间被移除且未被添加回来。
    if (!resolved.matched.length || resolved.name === 'NotFound') {
      console.warn('[Security] Current page access revoked. Redirecting to 403.');
      router.replace('/403');
    } else {
      console.log('[Security] Current page access verified.');
    }

  } catch (error) {
    console.error('[PermissionChannel] Update failed:', error);
    // 后备方案：强制退出或跳转至错误页面
    router.replace('/login');
  }
}
