import router from './index';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';

/**
 * 全局路由守卫
 * 
 * 强制执行安全策略：
 * 1. 等待认证初始化（引导程序）。
 * 2. 将未认证用户重定向到登录页。
 * 3. 重定向未授权用户 (403) - *待通过权限检查实现*
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. 关键：等待认证状态稳定
  // 这可以防止刷新时的“登录页闪烁”。
  if (!authStore.isReady) {
    console.log('[Router] Waiting for Auth Ready...');
    await ensureAuthReady();
  }

  // 2. 确定访问要求
  // 使用 'requiresAuth' meta 或默认为私有
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isPublic = ['/login', '/403'].includes(to.path);

  if (authStore.isAuthenticated) {
    // 用户已登录
    if (to.path === '/login') {
      return next('/');
    }
    
    // 权限检查（占位符）
    // if (to.meta.permissions && !authStore.hasPermission(to.meta.permissions)) {
    //   return next('/403');
    // }
    
    next();
  } else {
    // 用户未登录
    if (requiresAuth || !isPublic) {
      // 重定向到登录页并附带返回 URL
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    next();
  }
});
