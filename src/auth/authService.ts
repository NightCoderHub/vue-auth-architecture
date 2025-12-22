import apiClient from '../axios';
import { useAuthStore } from './authStore';
import { usePermissionStore } from '../permission/permissionStore';
import { resetRouter, initDynamicRoutes } from '../permission/routeBuilder';
import { initPermissionChannel } from '../permission/permissionChannel';
import { ensureAuthReady } from './refresh';
import router from '../router';
import type { ApiResponse, UserInfo } from './authTypes';

/**
 * 认证业务逻辑
 *
 * 1. 登录请求
 * 2. 更新 Store (认证)
 * 3. 并行获取个人资料、权限、菜单
 * 4. 更新 Stores
 * 5. 初始化动态路由
 * 6. 启动安全通道
 * 7. 导航
 */

export async function login(username: string, password: string) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  console.log('[AuthService] 正在登录...');

  try {
    // 1. 登录请求
    const res = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/login', { username, password });
    const { accessToken } = res.data.data;

    // 2. 更新 Store (认证)
    // 必须先设置 Token，否则后续的 API 请求无法通过拦截器的鉴权
    authStore.setAccessToken(accessToken);

    console.log('[AuthService] Token 获取成功。正在并行获取用户资料和权限...');

    // 3. 并行获取个人资料、权限
    const [userRes, permRes] = await Promise.all([
      apiClient.get<ApiResponse<UserInfo>>('/user/profile'),
      apiClient.get<ApiResponse<string[]>>('/user/permissions')
    ]);

    const user = userRes.data.data;
    const permissions = permRes.data.data;

    // 4. 更新 Stores
    authStore.setUserInfo(user);
    permissionStore.setPermissions(permissions);

    // 5. 初始化动态路由 (复用 routeBuilder 中的逻辑)
    await initDynamicRoutes();

    // 6. 启动安全通道
    initPermissionChannel();

    // 7. 导航
    const redirect = router.currentRoute.value.query.redirect as string;
    router.push(redirect || '/');
  } catch (error) {
    console.error('[AuthService] 登录过程失败:', error);
    // 事务回滚：确保登录操作的原子性
    // 如果获取权限失败，不应保持“已认证”状态
    authStore.setLoggedOut();
    permissionStore.clear();
    throw error;
  }
}

/**
 * 恢复会话（页面刷新 / 引导程序）
 *
 * 尝试刷新 Token 并获取最新的用户信息/权限。
 */
let restorePromise: Promise<boolean> | null = null;

export function restoreSession(): Promise<boolean> {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 如果已有正在进行的恢复过程，直接返回该 Promise
  if (restorePromise) {
    console.log('[AuthService] 复用正在进行的会话恢复请求...');
    return restorePromise;
  }

  restorePromise = (async () => {
    try {
      // 1. 尝试恢复 Token（通过 Refresh Token Cookie）
      const token = await ensureAuthReady();
      if (!token) return false;

      console.log('[AuthService] Token 已恢复。正在获取个人资料和权限...');

      // 2. 并行获取个人资料、权限
      const [userRes, permRes] = await Promise.all([
        apiClient.get<ApiResponse<UserInfo>>('/user/profile'),
        apiClient.get<ApiResponse<string[]>>('/user/permissions')
      ]);

      const user = userRes.data.data;
      const permissions = permRes.data.data;

      // 3. 更新 Stores
      authStore.setUserInfo(user);
      permissionStore.setPermissions(permissions);

      // 4. 重建路由
      // 注意：必须在这里等待路由初始化完成，确保后续逻辑（如 Guard）能看到完整的路由表
      await initDynamicRoutes();

      initPermissionChannel();

      return true;
    } catch (error) {
      console.warn('[AuthService] Restore session failed:', error);
      // 如果我们有 Token 但无法获取个人资料，为了安全起见应退出登录
      logout();
      return false;
    } finally {
      // 无论成功失败，重置 Promise 以便下次调用（虽然通常 restoreSession 只在初始化调用一次）
      restorePromise = null;
    }
  })();

  return restorePromise;
}

export function logout() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 1. 调用后端退出登录（以清除 Cookie）
  try {
    apiClient.post('/auth/logout').catch(() => {});
    console.log('[AuthService] 已调用后端退出登录');
  } catch (e) {
    console.warn('[AuthService] 后端退出登录失败', e);
  }

  // 2. 清除状态
  authStore.setLoggedOut();
  permissionStore.clear();
  resetRouter();

  // 3. 跳转至登录页
  router.push('/login');
}
