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

    console.log('[AuthService] Token 获取成功。正在并行获取用户资料、权限和菜单...');

    // 3. 并行获取个人资料、权限、菜单
    // 保持与 restoreSession 一致的并行请求逻辑
    const [userRes, permRes, menuRes] = await Promise.all([
      apiClient.get<ApiResponse<UserInfo>>('/user/profile'),
      apiClient.get<ApiResponse<string[]>>('/user/permissions'),
      apiClient.get<ApiResponse<any[]>>('/user/menus')
    ]);

    const user = userRes.data.data;
    const permissions = permRes.data.data;
    const menus = menuRes.data.data;

    // 4. 更新 Stores
    authStore.setUserInfo(user);
    permissionStore.setPermissions(permissions);
    permissionStore.setMenus(menus);

    // 5. 初始化动态路由
    buildRoutes(permissions);

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
