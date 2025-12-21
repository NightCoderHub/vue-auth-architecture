import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'), // 懒加载
    meta: { requiresAuth: true }
  },
  {
      path: '/403',
      name: 'Forbidden',
      component: () => import('../views/Forbidden.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
