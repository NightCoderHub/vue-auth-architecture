<template>
  <div class="navbar">
    <div class="left-menu">
      <div
        class="hamburger-container"
        :class="{ 'is-active': sidebar.opened }"
        @click="toggleSideBar"
      >
        <el-icon :size="20" class="hamburger-icon"><Expand v-if="!sidebar.opened" /><Fold v-else /></el-icon>
      </div>
      <el-breadcrumb v-if="!isBreadcrumbHidden" class="breadcrumb-container" :separator-icon="ArrowRight">
        <transition-group name="breadcrumb">
          <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
            <span
              v-if="item.redirect === 'noRedirect' || index === levelList.length - 1"
              class="no-redirect"
            >{{ item.meta.title }}</span>
            <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
          </el-breadcrumb-item>
        </transition-group>
      </el-breadcrumb>
    </div>

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <span class="user-name">Admin</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/">
              <el-dropdown-item>首页</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span style="display:block;">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { logout as authLogout } from '@/auth/authService';
import { Expand, Fold, CaretBottom, ArrowRight } from '@element-plus/icons-vue';
import userAvatar from '@/assets/vue.svg';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const sidebar = computed(() => appStore.sidebar);
const avatar = computed(() => userAvatar); // Default avatar
const isBreadcrumbHidden = computed(() => route.meta.hideBreadcrumb === true);

const levelList = ref<RouteLocationMatched[]>([]);

const getBreadcrumb = () => {
  let matched = route.matched.filter(
    (item) => item.meta && item.meta.title && item.meta.hideBreadcrumb !== true
  );

  const first = matched[0];

  if (!isHome(first)) {
    matched = [{ path: '/home', meta: { title: '首页' } } as any].concat(matched);
  }

  // De-duplicate home routes: if multiple routes are identified as home, keep only the first one
  const homeItems = matched.filter((item) => isHome(item));
  if (homeItems.length > 1) {
    const otherItems = matched.filter((item) => !isHome(item));
    matched = [homeItems[0]!, ...otherItems];
  }

  levelList.value = matched;
};

const isHome = (route: RouteLocationMatched | undefined) => {
  if (!route) return false;
  const name = (route.name as string)?.trim().toLocaleLowerCase();
  const path = route.path?.trim().toLocaleLowerCase();

  return name === 'home' || name === 'dashboard' || path === '/home' || path === '/';
};

const handleLink = (item: any) => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect);
    return;
  }
  router.push(path);
};

const toggleSideBar = () => {
  appStore.toggleSidebar();
};

const logout = async () => {
  await authLogout();
  // Redirect handled by authService or guard usually, but let's ensure
  router.push(`/login?redirect=${route.fullPath}`);
};

watch(
  () => route.path,
  () => {
    getBreadcrumb();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.navbar {
  height: $navbarHeight;
  overflow: hidden;
  position: relative;
  background: var(--color-bg-layout);
  display: flex;
  align-items: center;
  justify-content: space-between;
  // border-bottom: 1px solid var(--color-border);
  box-shadow: none;
  padding: 0 20px; // Design Spec: 24px horizontal padding
  transition: padding 0.3s;

  @media (max-width: 768px) {
    padding: 0 16px; // Mobile: 16px padding
  }

  .left-menu {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .hamburger-container {
    // width: 32px;
    // height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px; // Soft square
    color: var(--color-text-regular);

    &:hover {
      background: var(--color-bg-spotlight); // Use semantic variable
      color: var(--color-primary);
    }

    .hamburger-icon {
      font-size: 20px;
    }
  }

  .breadcrumb-container {
    margin-left: 16px;

    // Hide breadcrumb on mobile
    @media (max-width: 768px) {
      display: none;
    }

    :deep(.el-breadcrumb__separator) {
      color: var(--color-text-placeholder);
      margin: 0 8px;
    }

    :deep(.el-breadcrumb__inner) {
      font-size: 14px;

      a {
        color: var(--color-text-regular);
        font-weight: 400;
        transition: color 0.2s;

        &:hover {
          color: var(--color-primary);
        }
      }
    }

    :deep(.no-redirect) {
      color: var(--color-text-primary);
      cursor: default;
      font-weight: 500;
    }
  }

  .right-menu {
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .avatar-container {
      margin-right: 0;

      .avatar-wrapper {
        padding: 4px 8px;
        border-radius: 6px;
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background 0.3s;

        &:hover {
          background: var(--color-bg-spotlight);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          margin-left: 8px;
          font-size: 14px;
          color: var(--color-text-primary);
          font-weight: 500;
          line-height: 1;
        }

        .el-icon--right {
          margin-left: 4px;
          color: var(--color-text-secondary);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
