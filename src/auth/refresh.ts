import axios from 'axios';
import { useAuthStore } from './authStore';

/**
 * Dedicated Axios instance for Token Refresh
 * Must be separate from the main instance to avoid Interceptor Deadlocks.
 */
const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // CRITICAL: Sends the HttpOnly Refresh Token Cookie
});

/**
 * Singleton Promise for Refresh Token Request
 * Prevents "Refresh Token Storm" (multiple concurrent refresh requests).
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Core Logic: Ensure Auth is Ready
 * 
 * 1. If we have a valid access token, return it immediately.
 * 2. If a refresh is already in progress, join that existing promise.
 * 3. Otherwise, start a new refresh request.
 */
export async function ensureAuthReady(): Promise<string | null> {
  const authStore = useAuthStore();

  // 1. Happy Path: Already authenticated
  if (authStore.isAuthenticated && authStore.accessToken) {
    return authStore.accessToken;
  }

  // 2. Concurrency Control: Return existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // 3. Start Refresh Process
  // Note: We don't manually set status to 'bootstrapping' here because this might be triggered
  // by a 401 interceptor, and we want to keep the 'expired' or 'bootstrapping' context clear.
  
  refreshPromise = refreshClient.post('/auth/refresh')
    .then(res => {
      // Expecting { accessToken: '...', user: { ... } }
      const { accessToken, user } = res.data;
      
      authStore.setAccessToken(accessToken);
      if (user) {
        authStore.setUserInfo(user);
      }
      
      return accessToken as string;
    })
    .catch(error => {
      console.warn('[Auth] Refresh failed:', error);
      authStore.setLoggedOut();
      return null;
    })
    .finally(() => {
      // Cleanup singleton
      refreshPromise = null;
    });

  return refreshPromise;
}
