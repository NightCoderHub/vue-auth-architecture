import { useAuthStore } from '../auth/authStore';
import { ensureAuthReady } from '../auth/refresh';
import { initPermissionChannel } from '../permission/permissionChannel';

/**
 * Application Bootstrap Logic
 * 
 * Called before mounting the Vue app to ensure:
 * 1. Auth state is restored (from HttpOnly Cookie).
 * 2. Security channels are established.
 */
export async function bootstrap() {
  const authStore = useAuthStore();
  
  // Mark as bootstrapping to block UI rendering if needed
  authStore.setBootstrapping();
  
  try {
    console.log('[Bootstrap] Restoring session...');
    // Attempt to refresh token immediately
    const token = await ensureAuthReady();
    
    if (token) {
      console.log('[Bootstrap] Session restored.');
      // Initialize Real-time Permission Channel
      initPermissionChannel();
    } else {
      console.log('[Bootstrap] No active session.');
    }
  } catch (error) {
    console.error('[Bootstrap] Failed:', error);
  }
}
