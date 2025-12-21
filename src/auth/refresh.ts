import axios from 'axios';
import { useAuthStore } from './authStore';

/**
 * 用于 Token 刷新的专用 Axios 实例
 * 必须与主实例分离以避免拦截器死锁。
 */
const refreshClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // 关键：发送 HttpOnly Refresh Token Cookie
});

/**
 * Refresh Token 请求的单例 Promise
 * 防止“Refresh Token 风暴”（多个并发刷新请求）。
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * 核心逻辑：确保认证就绪
 *
 * 1. 如果有有效的 Access Token，立即返回。
 * 2. 如果刷新已在进行中，加入该现有 Promise。
 * 3. 否则，启动新的刷新请求。
 */
export async function ensureAuthReady(): Promise<string | null> {
  const authStore = useAuthStore();

  // 1. 理想路径：已认证
  if (authStore.isAuthenticated && authStore.accessToken) {
    return authStore.accessToken;
  }

  // 2. 并发控制：返回现有 Promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // 3. 启动刷新流程
  // 注意：我们不在此手动将状态设置为 'bootstrapping'，因为这可能由 401 拦截器触发，
  // 我们希望保持 'expired' 或 'bootstrapping' 上下文清晰。

  refreshPromise = refreshClient.post('/auth/refresh')
    .then(res => {
      // API 响应: { code: 200, data: { accessToken: '...' } }
      const { code, data } = res.data;

      if (code === 200 && data && data.accessToken) {
        authStore.setAccessToken(data.accessToken);
        // 注意：刷新 API 通常不返回用户信息，严格只返回 Access Token
        return data.accessToken as string;
      }

      throw new Error('Invalid Refresh Response');
    })
    .catch(error => {
      console.warn('[Auth] Refresh failed:', error);
      authStore.setLoggedOut();
      return null;
    })
    .finally(() => {
      // 清理单例
      refreshPromise = null;
    });

  return refreshPromise;
}
