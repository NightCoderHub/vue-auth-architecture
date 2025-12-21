import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';
import router from '../router';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  
  // CRITICAL: All business requests must wait for Auth Ready.
  // This solves the "Request fires before Token is ready" race condition.
  const token = await ensureAuthReady();
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 1. Handle 401 (Unauthorized) - Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const authStore = useAuthStore();
      authStore.setExpired();
      
      // Attempt Refresh (This will use the Singleton Promise)
      const newToken = await ensureAuthReady();
      
      if (newToken) {
         // Refresh Success -> Retry Original Request
         if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${newToken}`;
         }
         return apiClient(originalRequest);
      } else {
          // Refresh Failed -> Redirect to Login
          // (Auth Store state is already set to 'logged_out' by ensureAuthReady)
          router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
          return Promise.reject(error);
      }
    }
    
    // 2. Handle 403 (Forbidden) - Permission Denied
    if (error.response?.status === 403) {
        // Do NOT try to refresh. 403 means "Authenticated but not Authorized".
        console.error('Permission Denied (403)');
        // Optional: Redirect to 403 page
        // router.push('/403');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
