import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { login } from './authService';
import { useAuthStore } from './authStore';
import { usePermissionStore } from '../permission/permissionStore';
import apiClient from '../axios';
import router from '../router';

// Mock 外部依赖
vi.mock('../axios');
vi.mock('../router', () => ({
  default: {
    push: vi.fn(),
    currentRoute: {
      value: { query: {} }
    }
  }
}));
vi.mock('../permission/routeBuilder', () => ({
  buildRoutes: vi.fn(),
  resetRouter: vi.fn()
}));
vi.mock('../permission/permissionChannel', () => ({
  initPermissionChannel: vi.fn()
}));

describe('AuthService - Login', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should execute parallel requests for profile, permissions, and menus after getting token', async () => {
    const authStore = useAuthStore();
    const permissionStore = usePermissionStore();

    // Mock API 响应
    (apiClient.post as any).mockResolvedValue({
      data: { code: 200, data: { accessToken: 'mock-token' } }
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      switch (url) {
        case '/user/profile':
          return Promise.resolve({ data: { code: 200, data: { id: 1, username: 'test' } } });
        case '/user/permissions':
          return Promise.resolve({ data: { code: 200, data: ['user:read'] } });
        case '/user/menus':
          return Promise.resolve({ data: { code: 200, data: [{ id: 1, path: '/home' }] } });
        default:
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
      }
    });

    // 执行登录
    await login('admin', '123456');

    // 验证 Token 是否先被设置 (因为后续请求需要它)
    expect(authStore.accessToken).toBe('mock-token');

    // 验证并行请求是否都被调用
    expect(apiClient.get).toHaveBeenCalledWith('/user/profile');
    expect(apiClient.get).toHaveBeenCalledWith('/user/permissions');
    expect(apiClient.get).toHaveBeenCalledWith('/user/menus');

    // 验证 Store 是否更新
    expect(authStore.userInfo).toEqual({ id: 1, username: 'test' });
    expect(permissionStore.permissions).toEqual(['user:read']);
    expect(permissionStore.menus).toHaveLength(1);

    // 验证路由跳转
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('should handle errors and rollback state', async () => {
    const authStore = useAuthStore();

    // 模拟登录成功但获取资料失败
    (apiClient.post as any).mockResolvedValue({
      data: { code: 200, data: { accessToken: 'token-to-be-rolled-back' } }
    });

    // 模拟并行请求中的一个失败
    (apiClient.get as any).mockRejectedValue(new Error('Network Error'));

    await expect(login('admin', 'fail')).rejects.toThrow('Network Error');

    // 验证回滚：Token 应该被清除
    expect(authStore.accessToken).toBe('');
    expect(authStore.status).toBe('logged_out');
  });
});