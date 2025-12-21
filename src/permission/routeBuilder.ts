import router from '../router';
import type { RouteRecordRaw } from 'vue-router';

// 追踪动态添加的路由以便清理
let addedRouteNames: string[] = [];

/**
 * 重置 Router
 * 移除所有动态添加的路由。
 * 必须在重建路由前调用（例如在权限变更时）。
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
 * 构建并注册路由
 * 将权限映射到实际的路由记录。
 */
export function buildRoutes(permissions: string[]) {
  // 在真实应用中，这将是 { permission -> route } 的映射
  // 或者是全量路由树的递归过滤。
  
  const dynamicRoutes: RouteRecordRaw[] = [
    {
      path: '/admin',
      name: 'AdminPanel',
      component: () => import('../views/Dashboard.vue'),
      meta: { title: 'Admin Panel', requiresAuth: true }
    }
  ];

  // 逻辑：如果用户有权限则添加路由
  // 演示用：如果调用此函数则始终添加（假设后端发送了有效权限）
  
  dynamicRoutes.forEach(route => {
    // 注意：在 Vue Router 4 中，addRoute parentName 是可选的
    router.addRoute(route);
    
    if (route.name) {
      addedRouteNames.push(route.name as string);
    }
  });
  
  console.log('[Permission] 路由已重建:', addedRouteNames);
}
