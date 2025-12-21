export type AuthStatus = 
  | 'idle'          // Initial state
  | 'bootstrapping' // Checking auth on app start
  | 'authenticated' // Logged in
  | 'expired'       // Token expired, needs refresh
  | 'logged_out';   // Explicitly logged out or refresh failed

export interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}
