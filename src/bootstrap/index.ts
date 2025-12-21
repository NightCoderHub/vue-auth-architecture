import { useAuthStore } from '../auth/authStore';
import { restoreSession } from '../auth/authService';

/**
 * 应用引导逻辑
 * 
 * 在挂载 Vue 应用前调用，以确保：
 * 1. 认证状态已恢复（从 HttpOnly Cookie）。
 * 2. 安全通道已建立。
 * 3. 用户资料和权限已获取。
 */
export async function bootstrap() {
  const authStore = useAuthStore();
  
  // 标记为 bootstrapping 以在需要时阻止 UI 渲染
  authStore.setBootstrapping();
  
  try {
    console.log('[Bootstrap] Restoring session...');
    
    // 委托给 AuthService
    const restored = await restoreSession();
    
    if (restored) {
      console.log('[Bootstrap] Session fully restored.');
    } else {
      console.log('[Bootstrap] No active session.');
      // 确保处于 logged_out 状态（restoreSession 处理错误时的退出，但 ensureAuthReady 处理简单的无 Token 情况）
      if (authStore.status !== 'logged_out') {
          authStore.setLoggedOut();
      }
    }
  } catch (error) {
    console.error('[Bootstrap] Failed:', error);
    authStore.setLoggedOut();
  }
}
