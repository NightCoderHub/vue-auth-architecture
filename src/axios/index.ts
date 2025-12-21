import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';
import router from '../router';
import type { ApiResponse } from '../auth/authTypes';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true, // 关键：发送 HttpOnly Refresh Token Cookie
});

// 处理 Token 过期和重试的辅助函数
async function handleTokenExpired(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  if (originalRequest._retry) {
    return Promise.reject(new Error('检测到 Token 刷新循环'));
  }

  originalRequest._retry = true;
  const authStore = useAuthStore();
  authStore.setExpired();

  // 尝试刷新（这将使用单例 Promise）
  const newToken = await ensureAuthReady();

  if (newToken) {
    // 刷新成功 -> 重试原始请求
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }
    return apiClient(originalRequest);
  } else {
    // 刷新失败 -> 重定向到登录页
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
    return Promise.reject(new Error('会话已过期'));
  }
}

// --- 请求拦截器 ---
apiClient.interceptors.request.use(async (config) => {
  // 关键：所有业务请求必须等待认证就绪。
  const token = await ensureAuthReady();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- 响应拦截器 ---
apiClient.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 检查业务状态码 401 (未授权)
    // 服务器可能返回 HTTP 200 但在响应体中包含 code: 401
    if (response.data && response.data.code === 401) {
       const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };
       return handleTokenExpired(originalRequest);
    }

    // 可选：你可能希望在这里拒绝其他业务错误
    // if (response.data.code !== 200) {
    //   return Promise.reject(new Error(response.data.message || 'Error'));
    // }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. 处理 HTTP 401 (未授权) - Token 过期
    if (error.response?.status === 401 && originalRequest) {
      return handleTokenExpired(originalRequest);
    }

    // 2. 处理 HTTP 403 (禁止) - 权限被拒绝
    if (error.response?.status === 403) {
        console.error('权限被拒绝 (403)');
        // 可选：重定向到 403 页面
    }

    return Promise.reject(error);
  }
);

export default apiClient;
