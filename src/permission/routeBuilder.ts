import router from '../router';
import type { RouteRecordRaw } from 'vue-router';

// Track dynamically added routes for cleanup
let addedRouteNames: string[] = [];

/**
 * Reset Router
 * Removes all dynamically added routes.
 * Must be called before rebuilding routes (e.g. on permission change).
 */
export function resetRouter() {
  addedRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
  addedRouteNames = [];
}

/**
 * Build and Register Routes
 * Maps permissions to actual Route Records.
 */
export function buildRoutes(permissions: string[]) {
  // In a real app, this would be a mapping of { permission -> route }
  // or a recursive filter on a full route tree.
  
  const dynamicRoutes: RouteRecordRaw[] = [
    {
      path: '/admin',
      name: 'AdminPanel',
      component: () => import('../views/Dashboard.vue'),
      meta: { title: 'Admin Panel', requiresAuth: true }
    }
  ];

  // Logic: Add routes if user has permissions
  // For demo: Always add them if this function is called (assuming backend sent valid perms)
  
  dynamicRoutes.forEach(route => {
    // Note: In Vue Router 4, addRoute parentName is optional
    router.addRoute(route);
    
    if (route.name) {
      addedRouteNames.push(route.name as string);
    }
  });
  
  console.log('[Permission] Routes Rebuilt:', addedRouteNames);
}
