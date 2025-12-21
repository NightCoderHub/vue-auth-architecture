import apiClient from '../axios';
import { useAuthStore } from './authStore';
import { usePermissionStore } from '../permission/permissionStore';
import { buildRoutes, resetRouter } from '../permission/routeBuilder';
import { initPermissionChannel } from '../permission/permissionChannel';
import router from '../router';

/**
 * Auth Business Logic
 */
export async function login(username: string, password: string) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  console.log('[AuthService] Logging in...');
  
  // 1. Mock API Login
  // In real app: await apiClient.post('/auth/login', ...)
  // Note: Backend should set the HttpOnly Refresh Token Cookie here.
  await new Promise(r => setTimeout(r, 800)); // Simulate delay
  
  const mockAccessToken = 'mock_access_token_' + Date.now();
  const mockPermissions = ['admin', 'user:create', 'btn:edit'];
  
  // 2. Update Store
  authStore.setAccessToken(mockAccessToken);
  authStore.setUserInfo({ id: '1', name: 'Admin User', roles: ['admin'] });
  permissionStore.setPermissions(mockPermissions);
  
  // 3. Initialize Dynamic Routes
  buildRoutes(mockPermissions);
  
  // 4. Start Security Channel
  initPermissionChannel();

  // 5. Navigate
  const redirect = router.currentRoute.value.query.redirect as string;
  router.push(redirect || '/');
}

export function logout() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  
  // 1. Clear State
  authStore.setLoggedOut();
  permissionStore.clear();
  resetRouter();
  
  // 2. Navigate to Login
  router.push('/login');
  
  // 3. Call Backend Logout (to clear cookie)
  // apiClient.post('/auth/logout');
}
