import router from './index';
import { useAuthStore } from '../auth/authStore';
import { usePermissionStore } from '../permission/permissionStore';
import { restoreSession } from '../auth/authService';
import { initDynamicRoutes } from '../permission/routeBuilder';

/**
 * 全局路由守卫
 *
 * 强制执行安全策略：
 * 1. 等待认证初始化（引导程序）。
 * 2. 将未认证用户重定向到登录页。
 * 3. 重定向未授权用户 (403) - *待通过权限检查实现*
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 1. 关键：等待认证状态稳定
  // 这可以防止刷新时的“登录页闪烁”。
  if (!authStore.isReady) {
    console.log('[Router] 正在等待认证就绪...');
    const restored = await restoreSession();
    // 如果会话恢复成功（且路由已生成），必须重定向以重新匹配路由
    if (restored) {
       return next({ ...to, replace: true });
    }
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

    // 3. 动态路由加载检查
    // 如果用户已认证但路由尚未生成（通常发生在页面刷新时），则初始化路由
    if (!permissionStore.routesGenerated) {
      try {
        console.log('[Router] 检测到动态路由未加载，正在初始化...');
        await initDynamicRoutes();

        // 路由加载完成后，使用 replace: true 重定向到目标路由，
        // 确保新添加的路由生效，避免 404
        return next({ ...to, replace: true });
      } catch (error) {
        console.error('[Router] 动态路由加载失败:', error);
        // 如果路由加载失败，可能是 token 失效或其他严重错误
        // 这里选择重定向到登录页，或者可以让其继续（可能会 404）
        return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      }
    }
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
