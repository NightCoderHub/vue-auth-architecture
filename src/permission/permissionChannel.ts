import { usePermissionStore } from './permissionStore';
import { resetRouter, buildRoutes } from './routeBuilder';
import router from '../router';
import apiClient from '../axios'; // For fetching permissions

/**
 * Real-time Permission Update Channel
 * 
 * Establishes a WebSocket/SSE connection to listen for permission changes.
 * When a 'PERMISSION_UPDATED' event occurs:
 * 1. Clear local permission data.
 * 2. Re-fetch latest permissions from API.
 * 3. Rebuild Vue Router.
 * 4. Verify if current page is still accessible.
 */
export function initPermissionChannel() {
  console.log('[PermissionChannel] Listening for security events...');

  // Mock Implementation: Expose a global function to simulate Backend Push
  // Usage: window.simulatePermissionChange()
  (window as any).simulatePermissionChange = async () => {
    console.warn('⚠️ [Security] Permission Change Event Received');
    await handlePermissionUpdate();
  };
}

async function handlePermissionUpdate() {
  const permissionStore = usePermissionStore();

  // 1. Clear Old Data (Fail-safe)
  permissionStore.clear();
  resetRouter();

  try {
    // 2. Re-fetch Permissions
    // In real app: const res = await apiClient.get('/user/permissions');
    console.log('[PermissionChannel] Fetching new permissions...');
    
    // Mock Delay & Response
    await new Promise(r => setTimeout(r, 500)); 
    const newPermissions = ['admin', 'user:read']; // Simulated new permissions
    
    permissionStore.setPermissions(newPermissions);

    // 3. Rebuild Routes
    buildRoutes(newPermissions);

    // 4. Security Check: Is current page still allowed?
    const currentPath = router.currentRoute.value.fullPath;
    const resolved = router.resolve(currentPath);

    // If route matches 'NotFound' (name usually used for 404) or has no matches
    // It means the route was removed during resetRouter and not added back.
    if (!resolved.matched.length || resolved.name === 'NotFound') {
      console.warn('[Security] Current page access revoked. Redirecting to 403.');
      router.replace('/403');
    } else {
      console.log('[Security] Current page access verified.');
    }

  } catch (error) {
    console.error('[PermissionChannel] Update failed:', error);
    // Fallback: Force logout or redirect to error page
    router.replace('/login');
  }
}
