import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig,AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';
import router from '../router';
import type { ApiResponse } from '../auth/authTypes';
import { ElMessage } from 'element-plus';

// 扩展 Axios 类型，使其直接返回数据 T
declare module 'axios' {
  interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  }
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true, // 关键：发送 HttpOnly Refresh Token Cookie
});

// 处理 Token 过期和重试的辅助函数
async function handleTokenExpired(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  const authStore = useAuthStore();

  if (originalRequest._retry) {
    // 严重错误：刷新后重试依然失败，必须强制登出
    authStore.setExpired();
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
    return Promise.reject(new Error('检测到 Token 刷新循环'));
  }

  originalRequest._retry = true;
  authStore.setExpired();

  // 尝试刷新（这将使用单例 Promise）
  const newToken = await ensureAuthReady();

  if (newToken) {
    // 刷新成功 -> 重试原始请求
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }
    return apiClient.request(originalRequest);
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

// --- 辅助变量 ---
let isSessionExpiredShow = false; // 控制"会话已过期"消息的显示频率

// --- 辅助函数 ---
function isAxiosResponse(obj: any): obj is AxiosResponse<ApiResponse> {
  return obj && typeof obj === 'object' && 'data' in obj && 'status' in obj && 'headers' in obj;
}

// --- 响应拦截器链 ---

// 1. 拦截器 A：Token 过期处理 (优先级最高，最先执行)
apiClient.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 确保是 Axios 响应格式（防止被前置拦截器修改，或处理非 JSON 响应如 Blob）
    if (!isAxiosResponse(response)) return response;

    // 检查业务状态码 401 (未授权)
    if (response.data && response.data.code === 401) {
       const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };
       // 如果已经是重试过的请求，直接抛出异常，不再重试，防止死循环
       if (originalRequest._retry) {
           return handleTokenExpired(originalRequest);
       }
       // 否则进入过期处理流程
       return handleTokenExpired(originalRequest);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 处理 HTTP 401 (未授权)
    if (error.response?.status === 401 && originalRequest) {
      return handleTokenExpired(originalRequest);
    }
    return Promise.reject(error);
  }
);

// 2. 拦截器 B：业务错误处理
apiClient.interceptors.response.use(
  (response: any) => {
    // 关键：由于拦截器 A 可能返回重试后的业务数据（非 AxiosResponse），
    // 所以这里不能强制声明为 AxiosResponse 类型，而应使用 any 并通过守卫判断。

    // 如果不是 AxiosResponse (说明是上一个拦截器返回的已处理数据)，直接放行
    if (!isAxiosResponse(response)) return response;

    // 检查业务状态码 200
    if (response.data && response.data.code !== 200) {
      const msg = response.data.message || '请求失败';
      ElMessage({
        message: msg,
        grouping: true,
        type: 'error'
      });
      return Promise.reject(new Error(msg));
    }
    return response;
  },
  (error: any) => {
    // 如果是请求取消，不做任何处理
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // 处理 HTTP 403 (禁止)
    if (error.response?.status === 403) {
        console.error('权限被拒绝 (403)');
        ElMessage({
          message: '没有权限执行此操作',
          grouping: true,
          type: 'error'
        });
    } else {
        const msg = error.message || '网络请求失败';
        // 特殊处理 "会话已过期" 错误，避免短时间内重复弹出
        if (msg === '会话已过期') {
          if (!isSessionExpiredShow) {
            isSessionExpiredShow = true;
            ElMessage({
              message: msg,
              grouping: true,
              type: 'error'
            });
            // 3秒后重置，允许再次提示
            setTimeout(() => { isSessionExpiredShow = false; }, 3000);
          }
        } else {
          // 其他错误提示
          ElMessage({
            message: msg,
            grouping: true,
            type: 'error'
          });
        }
    }
    return Promise.reject(error);
  }
);

// 3. 拦截器 C：数据格式转换 (最后执行)
apiClient.interceptors.response.use(
  (response: any) => {
    if (!isAxiosResponse(response)) return response;
    // 直接返回业务数据
    return response.data.data;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

// 提取接口返回类型中的 data 字段类型
type UnwrapData<T> = T extends { data: infer U } ? U : T;

// Orval Mutator 适配器
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<UnwrapData<T>> => {
  const source = axios.CancelToken.source();
  const promise = apiClient({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then((data) => data as UnwrapData<T>);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
