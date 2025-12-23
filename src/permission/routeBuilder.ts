import router from '../router';
import { type RouteRecordRaw } from 'vue-router';

import { usePermissionStore } from './permissionStore';
import type { MenuItem, ApiResponse } from '../auth/authTypes';
import Layout from '@/layout/index.vue';
import apiClient from '../axios';
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
 * 初始化动态路由
 * 从 API 获取菜单数据并构建路由
 */
export async function initDynamicRoutes() {
  try {
    const { data } = await apiClient.get<ApiResponse<MenuItem[]>>('/user/menus');
    if (data.code === 200 && data.data) {
      buildRoutes(data.data);
    } else {
      console.warn('[RouteBuilder] 获取菜单数据失败:', data.message);
      // Fallback: build empty routes or handle error
      buildRoutes([]);
    }
  } catch (error) {
    console.error('[RouteBuilder] 初始化动态路由出错:', error);
    throw error;
  }
}

/**
 * 构建并注册路由
 * 将权限映射到实际的路由记录。
 * @param menus 后端返回的菜单数据（可选，如果业务逻辑是前端根据权限映射则无需此参数）
 */
export function buildRoutes(menus: MenuItem[] = []) {
  const permissionStore = usePermissionStore();
  // 1. 根据权限生成动态路由
  // 采用后端驱动方案 (Scheme B):
  // 后端直接返回路由配置 (menus)，前端递归处理成 Vue Router 格式
  // 这种方式灵活性最高，无需在前端维护庞大的路由映射表
  const dynamicRoutes: RouteRecordRaw[] = generateRoutesFromMenu(menus);
  // 2. 注册路由
  // 过滤掉外链路由，避免 vue-router 报错
  const routerRoutes = filterExternalRoutes(dynamicRoutes);
  routerRoutes.forEach(route => {
    router.addRoute(route);

    if (route.name) {
      addedRouteNames.push(route.name as string);
    }
  });
  // 3. 动态添加 404 路由（捕获所有未匹配路径）
  // 必须最后添加，以确保不会覆盖合法的动态路由
  try {
    const notFoundRoute: RouteRecordRaw = {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      meta: { hidden: true, title: '页面未找到' }
    };

    router.addRoute(notFoundRoute);
    addedRouteNames.push('NotFound');
  } catch (error) {
    console.error('[RouteBuilder] 添加 404 路由失败:', error);
  }

  // 4. 更新 Store 中的菜单 (用于侧边栏渲染)
  // 注意：侧边栏菜单可能需要包含 constantRoutes，这里仅设置动态部分
  permissionStore.setMenus(dynamicRoutes);

  console.log('[Permission] 路由已重建:', addedRouteNames);
}

/**
 * 将后端菜单数据转换为 Vue Router 路由配置
 * @param menus 后端菜单数组
 */
function generateRoutesFromMenu(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  for (const item of menus) {
    // 基础路由结构
    // 使用 as any 规避 RouteRecordRaw 的联合类型推断问题
    // 因为 RouteRecordRaw 是 RouteRecordSingleView | RouteRecordMultipleViews | RouteRecordRedirect 的联合类型
    // 动态构建时很难满足所有严格的类型约束
    const route: any = {
      path: item.path,
      name: item.name,
      // 如果是顶级菜单且没有 component，通常使用 Layout
      // 如果是子菜单，根据 component 字段动态加载组件
      component: !item.component || item.component.trim() === 'Layout'
        ? Layout
        : loadView(item.component),
      meta: {
        title: item.title,
        icon: item.icon,
        hidden: item.hidden ?? false,
        keepAlive: item.keepAlive ?? false,
        permissions: item.permissions,
        affix: item.affix ?? false,
        alwaysShow: item.alwaysShow ?? true,
        externalLink: item.externalLink,
        activeMenu: item.activeMenu,
        fullScreen: item.fullScreen ?? false,
        orderNo: item.sort ?? 0,
        enabled: item.enabled ?? true,
        requiresAuth: item.requiresAuth ?? true,
        hideBreadcrumb: item.hideBreadcrumb ?? false,
        parentId: item.parentId
      }
    };

    if (item.redirect) {
      route.redirect = item.redirect;
    }

    // 递归处理子路由
    if (item.children && item.children.length > 0) {
      route.children = generateRoutesFromMenu(item.children);
    }

    routes.push(route);
  }

  return routes;
}

/**
 * 动态加载组件
 * Vite 中需要使用 Glob Import 或明确的 switch case
 */
const modules = import.meta.glob('../views/**/*.vue');

/**
 * 判断是否为外部链接
 */
function isExternal(path: string) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 递归过滤掉外部链接路由
 * 用于 vue-router 注册（Router 不支持 http:// 开头的 path）
 * 同时保留原始路由结构用于侧边栏渲染
 */
function filterExternalRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = [];

  routes.forEach(route => {
    // 如果 path 是外链，则不注册到 router
    if (isExternal(route.path)) {
      return;
    }

    // 浅拷贝路由对象，避免修改原始 menus 数据（影响侧边栏）
    const tmp = { ...route };
    if (tmp.children) {
      tmp.children = filterExternalRoutes(tmp.children);
    }
    res.push(tmp);
  });

  return res;
}

function loadView(viewPath: string) {
  // 处理特殊情况
  if (!viewPath) return undefined;

  // 假设后端返回的是 "system/UserManage" 这样的相对路径
  // 需要映射到 "../views/system/UserManage.vue"

  // 这里为了演示方便，如果找不到组件，统一 fallback 到 HomeView
  // 真实项目中应该报错或跳转 404
  const path = `../views/${viewPath}.vue`;
  console.log('[RouteBuilder] Loading component:', path);
  if (modules[path]) {
    return modules[path];
  } else {
    // 开发阶段为了容错，如果组件不存在，暂时渲染 HomeView
    console.warn(`[RouteBuilder] Component not found: ${viewPath}, fallback to HomeView`);
    return () => import('../views/HomeView.vue');
  }
}
