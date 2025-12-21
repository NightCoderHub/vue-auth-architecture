import { ref } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { usePermissionStore } from './permissionStore';
import { resetRouter, buildRoutes } from './routeBuilder';
import router from '../router';
import apiClient from '../axios'; // 用于获取权限（作为后备或手动刷新）
import type { ApiResponse } from '../auth/authTypes';

// WebSocket 实例
let socket: WebSocket | null = null;
// 重连定时器
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
// WebSocket 连接状态（暴露给 UI 使用）
export const wsStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

/**
 * 实时权限更新通道
 *
 * 建立 WebSocket 连接以监听权限变更。
 * 当发生 'permission_change' 事件时：
 * 1. 接收服务端推送的最新权限数据。
 * 2. 更新本地 Store。
 * 3. 重建 Vue Router。
 * 4. 验证当前页面是否仍然可访问。
 */
export function initPermissionChannel() {
  const authStore = useAuthStore();
  const token = authStore.accessToken;

  if (!token) {
    console.warn('[PermissionChannel] 无法建立连接: 缺少 Access Token');
    return;
  }

  connectWebSocket(token);
}

/**
 * 建立 WebSocket 连接
 */
function connectWebSocket(token: string) {
  if (socket) return; // 避免重复连接

  const wsUrl = `ws://localhost:3000?token=${token}`;
  console.log('[PermissionChannel] 正在连接 WebSocket:', wsUrl);
  wsStatus.value = 'connecting';

  try {
    socket = new WebSocket(wsUrl);
  } catch (error) {
    console.error('[PermissionChannel] 连接创建失败:', error);
    wsStatus.value = 'error';
    return;
  }

  socket.onopen = () => {
    console.log('[PermissionChannel] WebSocket 已连接');
    wsStatus.value = 'connected';
    // 可以在此发送心跳或认证信息（如果需要）
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error('[PermissionChannel] 消息解析失败:', error);
    }
  };

  socket.onclose = (event) => {
    console.log(`[PermissionChannel] WebSocket 已关闭 (Code: ${event.code}, Reason: ${event.reason})`);
    wsStatus.value = 'disconnected';
    socket = null;
    cleanupReconnectTimer();

    // 自动重连逻辑
    // 1000: 正常关闭; 1008: 策略违规（如 Token 无效）
    // 仅在非正常关闭且用户仍处于认证状态时重连
    const authStore = useAuthStore();
    if (event.code !== 1000 && event.code !== 1008 && authStore.isAuthenticated) {
      console.log('[PermissionChannel] 3秒后尝试重连...');
      reconnectTimer = setTimeout(() => {
        // 重新获取最新的 Token（以防 Token 刷新）
        const newToken = authStore.accessToken;
        if (newToken) {
          connectWebSocket(newToken);
        }
      }, 3000);
    }
  };

  socket.onerror = (error) => {
    console.error('[PermissionChannel] WebSocket 错误:', error);
    wsStatus.value = 'error';
  };
}

/**
 * 关闭 WebSocket 连接
 * (应在注销时调用)
 */
export function closePermissionChannel() {
  cleanupReconnectTimer();
  if (socket) {
    socket.close(1000, 'User logged out');
    socket = null;
  }
  wsStatus.value = 'disconnected';
}

function cleanupReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * 处理 WebSocket 消息
 */
async function handleMessage(message: any) {
  if (message.type === 'permission_change') {
    console.log('[PermissionChannel] 收到权限变更通知:', message.data);

    // 从消息中直接获取数据，避免额外的 API 请求
    const { permissions, menus } = message.data;
    await handlePermissionUpdate(permissions, menus);
  }
}

/**
 * 执行权限更新流程
 * @param newPermissions 可选：新的权限列表。如果不传，则从 API 拉取。
 * @param newMenus 可选：新的菜单列表。
 */
async function handlePermissionUpdate(newPermissions?: string[], newMenus?: any[]) {
  const permissionStore = usePermissionStore();

  // 1. 清除旧数据（故障安全）
  permissionStore.clear();
  resetRouter();

  try {
    let permissions = newPermissions;
    let menus = newMenus;

    // 如果未提供数据（例如手动刷新场景），则从 API 获取
    if (!permissions || !menus) {
      console.log('[PermissionChannel] 正在从 API 获取新权限...');
      const [permRes, menuRes] = await Promise.all([
        apiClient.get<ApiResponse<string[]>>('/user/permissions'),
        apiClient.get<ApiResponse<any[]>>('/user/menus')
      ]);
      permissions = permRes.data.data;
      menus = menuRes.data.data;
    } else {
      console.log('[PermissionChannel] 使用推送数据更新权限...');
    }

    // 2. 更新 Store
    if (permissions) permissionStore.setPermissions(permissions);
    if (menus) permissionStore.setMenus(menus);

    // 3. 重建路由
    if (permissions) buildRoutes(permissions);

    // 4. 安全检查：当前页面是否仍然允许访问？
    const currentPath = router.currentRoute.value.fullPath;
    const resolved = router.resolve(currentPath);

    // 如果路由匹配 'NotFound' (通常用于 404 的名称) 或无匹配项
    // 这意味着路由在 resetRouter 期间被移除且未被添加回来。
    if (!resolved.matched.length || resolved.name === 'NotFound') {
      console.warn('[安全] 当前页面访问权限被撤销。重定向至 403。');
      router.replace('/403');
    } else {
      console.log('[安全] 当前页面访问权限已验证。');
    }

  } catch (error) {
    console.error('[PermissionChannel] 更新失败:', error);
    // 后备方案：强制退出或跳转至错误页面
    router.replace('/login');
  }
}

