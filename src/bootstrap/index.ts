import { useAuthStore } from '../auth/authStore';
import { restoreSession } from '../auth/authService';
import { preloadDicts } from '@/dict';

/**
 * 应用引导逻辑
 *
 * 在挂载 Vue 应用前调用，以确保：
 * 1. 认证状态已恢复（从 HttpOnly Cookie）。
 * 2. 安全通道已建立。
 * 3. 用户资料和权限已获取。
 * 4. 常用基础数据（如字典）已预加载（非阻塞）。
 */
export async function bootstrap() {
  const authStore = useAuthStore();

  // 标记为 bootstrapping 以在需要时阻止 UI 渲染
  authStore.setBootstrapping();

  try {
    console.log('[Bootstrap] 正在恢复会话...');

    // 委托给 AuthService
    const restored = await restoreSession();

    if (restored) {
      console.log('[Bootstrap] 会话已完全恢复。');
      // 登录成功后，预加载常用字典（非阻塞执行）
      preloadDicts();
    } else {
      console.log('[Bootstrap] 无活动会话。');
      // 确保处于 logged_out 状态（restoreSession 处理错误时的退出，但 ensureAuthReady 处理简单的无 Token 情况）
      if (authStore.status !== 'logged_out') {
          authStore.setLoggedOut();
      }
    }
  } catch (error) {
    console.error('[Bootstrap] 失败:', error);
    authStore.setLoggedOut();
  }
}
