import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthStatus, UserInfo } from './authTypes';

/**
 * 认证状态机 Store
 * 
 * 管理用户认证状态的生命周期。
 * 不持久化 Access Token（安全要求）。
 */
export const useAuthStore = defineStore('auth', () => {
  // --- 状态 ---
  const status = ref<AuthStatus>('idle');
  const accessToken = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  // --- Getters ---
  // 被路由守卫用于判断是否可以继续
  const isReady = computed(() => status.value !== 'idle' && status.value !== 'bootstrapping');
  const isAuthenticated = computed(() => status.value === 'authenticated');

  // --- Actions ---
  
  function setAccessToken(token: string) {
    accessToken.value = token;
    // 转换到已认证状态
    if (status.value !== 'authenticated') {
      status.value = 'authenticated';
    }
  }

  function setBootstrapping() {
    status.value = 'bootstrapping';
  }

  function setLoggedOut() {
    accessToken.value = '';
    userInfo.value = null;
    status.value = 'logged_out';
  }
  
  function setExpired() {
      status.value = 'expired';
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  return {
    status,
    accessToken,
    userInfo,
    isReady,
    isAuthenticated,
    setAccessToken,
    setBootstrapping,
    setLoggedOut,
    setExpired,
    setUserInfo
  };
});
