import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthStatus, UserInfo } from './authTypes';

/**
 * Authentication State Machine Store
 * 
 * Manages the lifecycle of the user's authentication state.
 * Does NOT persist the Access Token (Security Requirement).
 */
export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const status = ref<AuthStatus>('idle');
  const accessToken = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  // --- Getters ---
  // Used by Router Guards to decide if we can proceed
  const isReady = computed(() => status.value !== 'idle' && status.value !== 'bootstrapping');
  const isAuthenticated = computed(() => status.value === 'authenticated');

  // --- Actions ---
  
  function setAccessToken(token: string) {
    accessToken.value = token;
    // Transition to authenticated state
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
