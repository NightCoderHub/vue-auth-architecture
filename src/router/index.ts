import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import Login from '@/views/Login.vue';

// 常量路由：不需要权限即可访问
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/home',
    meta: { title: '首页', icon: 'house', alwaysShow: false },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: '首页', icon: 'house', }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/Forbidden.vue'),
    meta: { hidden: true, title: '无权限' }
  },
  {
    path: '/404',
    component: () => import('../views/NotFound.vue'),
    meta: { hidden: true, title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  strict: true, // 全局配置：严格匹配尾部斜杠
});

export default router;
