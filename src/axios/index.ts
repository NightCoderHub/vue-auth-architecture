import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';
import router from '../router';
import type { ApiResponse } from '../auth/authTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true, // CRITICAL: Sends the HttpOnly Refresh Token Cookie
});

// Helper to handle token expiration and retry
async function handleTokenExpired(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  if (originalRequest._retry) {
    return Promise.reject(new Error('Token refresh loop detected'));
  }

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
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
    return Promise.reject(new Error('Session expired'));
  }
}

// --- Request Interceptor ---
apiClient.interceptors.request.use(async (config) => {
  // CRITICAL: All business requests must wait for Auth Ready.
  const token = await ensureAuthReady();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // Check for Business Status Code 401 (Unauthorized)
    // The server might return HTTP 200 but with code: 401 in the body
    if (response.data && response.data.code === 401) {
       const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };
       return handleTokenExpired(originalRequest);
    }

    // Optional: You might want to reject other business errors here
    // if (response.data.code !== 200) {
    //   return Promise.reject(new Error(response.data.message || 'Error'));
    // }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Handle HTTP 401 (Unauthorized) - Token Expired
    if (error.response?.status === 401 && originalRequest) {
      return handleTokenExpired(originalRequest);
    }

    // 2. Handle HTTP 403 (Forbidden) - Permission Denied
    if (error.response?.status === 403) {
        console.error('Permission Denied (403)');
        // Optional: Redirect to 403 page
    }

    return Promise.reject(error);
  }
);

export default apiClient;
