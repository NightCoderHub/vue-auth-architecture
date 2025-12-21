import { useAuthStore } from '../auth/authStore';
import { restoreSession } from '../auth/authService';

/**
 * Application Bootstrap Logic
 * 
 * Called before mounting the Vue app to ensure:
 * 1. Auth state is restored (from HttpOnly Cookie).
 * 2. Security channels are established.
 * 3. User profile and permissions are fetched.
 */
export async function bootstrap() {
  const authStore = useAuthStore();
  
  // Mark as bootstrapping to block UI rendering if needed
  authStore.setBootstrapping();
  
  try {
    console.log('[Bootstrap] Restoring session...');
    
    // Delegate to AuthService
    const restored = await restoreSession();
    
    if (restored) {
      console.log('[Bootstrap] Session fully restored.');
    } else {
      console.log('[Bootstrap] No active session.');
      // Ensure we are in logged_out state (restoreSession handles logout on error, but ensureAuthReady handles simple no-token)
      if (authStore.status !== 'logged_out') {
          authStore.setLoggedOut();
      }
    }
  } catch (error) {
    console.error('[Bootstrap] Failed:', error);
    authStore.setLoggedOut();
  }
}
