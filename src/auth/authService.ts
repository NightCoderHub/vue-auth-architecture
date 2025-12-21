import apiClient from '../axios';
import { useAuthStore } from './authStore';
import { usePermissionStore } from '../permission/permissionStore';
import { buildRoutes, resetRouter } from '../permission/routeBuilder';
import { initPermissionChannel } from '../permission/permissionChannel';
import { ensureAuthReady } from './refresh';
import router from '../router';
import type { ApiResponse, UserInfo } from './authTypes';

/**
 * 认证业务逻辑
 */

export async function login(username: string, password: string) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  console.log('[AuthService] 正在登录...');

  // 1. 登录请求
  const res = await apiClient.post<ApiResponse<{ accessToken: string, user: UserInfo }>>('/auth/login', { username, password });
  const { accessToken, user } = res.data.data;

  // 2. 更新 Store (认证)
  authStore.setAccessToken(accessToken);
  authStore.setUserInfo(user);

  // 3. 获取权限和菜单
  const [permRes, menuRes] = await Promise.all([
    apiClient.get<ApiResponse<string[]>>('/user/permissions'),
    apiClient.get<ApiResponse<any[]>>('/user/menus')
  ]);

  const permissions = permRes.data.data;
  const menus = menuRes.data.data;

  permissionStore.setPermissions(permissions);
  permissionStore.setMenus(menus);

  // 4. 初始化动态路由
  buildRoutes(permissions);

  // 5. 启动安全通道
  initPermissionChannel();

  // 6. 导航
  const redirect = router.currentRoute.value.query.redirect as string;
  router.push(redirect || '/');
}

/**
 * 恢复会话（页面刷新 / 引导程序）
 *
 * 尝试刷新 Token 并获取最新的用户信息/权限。
 */
export async function restoreSession() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 1. 尝试恢复 Token（通过 Refresh Token Cookie）
  const token = await ensureAuthReady();
  if (!token) return false;

  try {
    console.log('[AuthService] Token 已恢复。正在获取个人资料和权限...');

    // 2. 并行获取个人资料、权限、菜单
    // 我们假设如果刷新成功，后端即为可用状态。
    const [userRes, permRes, menuRes] = await Promise.all([
        apiClient.get<ApiResponse<UserInfo>>('/user/profile'),
        apiClient.get<ApiResponse<string[]>>('/user/permissions'),
        apiClient.get<ApiResponse<any[]>>('/user/menus')
    ]);

    // 3. 更新 Stores
    // API 响应结构: { code: 200, data: ... }
    // 注意：apiClient 返回 AxiosResponse，所以我们访问 .data 获取 body，然后访问 .data 获取 payload
    authStore.setUserInfo(userRes.data.data);
    permissionStore.setPermissions(permRes.data.data);
    permissionStore.setMenus(menuRes.data.data);

    // 4. 重建路由
    buildRoutes(permRes.data.data);
    initPermissionChannel();

    return true;
  } catch (error) {
    console.warn('[AuthService] Restore session failed:', error);
    // 如果我们有 Token 但无法获取个人资料，为了安全起见应退出登录
    logout();
    return false;
  }
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
