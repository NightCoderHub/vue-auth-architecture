import router from './index';
import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';

/**
 * Global Route Guard
 * 
 * Enforces security policies:
 * 1. Wait for Auth Initialization (Bootstrapping).
 * 2. Redirect unauthenticated users to Login.
 * 3. Redirect unauthorized users (403) - *To be implemented with permission check*
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. Critical: Wait for Auth State to be Stable
  // This prevents "Login Page Flash" on refresh.
  if (!authStore.isReady) {
    console.log('[Router] Waiting for Auth Ready...');
    await ensureAuthReady();
  }

  // 2. Determine Access Requirement
  // Use 'requiresAuth' meta or default to private
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isPublic = ['/login', '/403'].includes(to.path);

  if (authStore.isAuthenticated) {
    // User is logged in
    if (to.path === '/login') {
      return next('/');
    }
    
    // Permission Check (Placeholder)
    // if (to.meta.permissions && !authStore.hasPermission(to.meta.permissions)) {
    //   return next('/403');
    // }
    
    next();
  } else {
    // User is NOT logged in
    if (requiresAuth || !isPublic) {
      // Redirect to Login with return url
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    next();
  }
});
