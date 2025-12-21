import apiClient from '../axios';
import { useAuthStore } from './authStore';
import { usePermissionStore } from '../permission/permissionStore';
import { buildRoutes, resetRouter } from '../permission/routeBuilder';
import { initPermissionChannel } from '../permission/permissionChannel';
import { ensureAuthReady } from './refresh';
import router from '../router';
import type { ApiResponse, UserInfo } from './authTypes';

/**
 * Auth Business Logic
 */

export async function login(username: string, password: string) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  console.log('[AuthService] Logging in...');

  // 1. Login Request
  const res = await apiClient.post<ApiResponse<{ accessToken: string, user: UserInfo }>>('/auth/login', { username, password });
  const { accessToken, user } = res.data.data;

  // 2. Update Store (Auth)
  authStore.setAccessToken(accessToken);
  authStore.setUserInfo(user);

  // 3. Fetch Permissions & Menus
  const [permRes, menuRes] = await Promise.all([
    apiClient.get<ApiResponse<string[]>>('/user/permissions'),
    apiClient.get<ApiResponse<any[]>>('/user/menus')
  ]);

  const permissions = permRes.data.data;
  const menus = menuRes.data.data;

  permissionStore.setPermissions(permissions);
  permissionStore.setMenus(menus);

  // 4. Initialize Dynamic Routes
  buildRoutes(permissions);

  // 5. Start Security Channel
  initPermissionChannel();

  // 6. Navigate
  const redirect = router.currentRoute.value.query.redirect as string;
  router.push(redirect || '/');
}

/**
 * Restore Session (Page Reload / Bootstrap)
 *
 * Attempts to refresh the token and fetch fresh user profile/permissions.
 */
export async function restoreSession() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 1. Try to restore token (via Refresh Token Cookie)
  const token = await ensureAuthReady();
  if (!token) return false;

  try {
    console.log('[AuthService] Token restored. Fetching profile & permissions...');

    // 2. Fetch Profile, Permissions, Menus (Parallel)
    // We assume if refresh succeeded, the backend is available.
    const [userRes, permRes, menuRes] = await Promise.all([
        apiClient.get<ApiResponse<UserInfo>>('/user/profile'),
        apiClient.get<ApiResponse<string[]>>('/user/permissions'),
        apiClient.get<ApiResponse<any[]>>('/user/menus')
    ]);

    // 3. Update Stores
    // API Response structure: { code: 200, data: ... }
    // Note: apiClient returns AxiosResponse, so we access .data for body, then .data for payload
    authStore.setUserInfo(userRes.data.data);
    permissionStore.setPermissions(permRes.data.data);
    permissionStore.setMenus(menuRes.data.data);

    // 4. Rebuild Routes
    buildRoutes(permRes.data.data);
    initPermissionChannel();

    return true;
  } catch (error) {
    console.warn('[AuthService] Restore session failed:', error);
    // If we have a token but can't fetch profile, it's safer to logout
    logout();
    return false;
  }
}

export function logout() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 1. Call Backend Logout (to clear cookie)
  try {
    apiClient.post('/auth/logout').catch(() => {});
    console.log('[AuthService] Backend logout called');
  } catch (e) {
    console.warn('[AuthService] Backend logout failed', e);
  }

  // 2. Clear State
  authStore.setLoggedOut();
  permissionStore.clear();
  resetRouter();

  // 3. Navigate to Login
  router.push('/login');
}
