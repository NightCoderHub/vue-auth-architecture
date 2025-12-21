export type AuthStatus =
  | 'idle'          // Initial state
  | 'bootstrapping' // Checking auth on app start
  | 'authenticated' // Logged in
  | 'expired'       // Token expired, needs refresh
  | 'logged_out';   // Explicitly logged out or refresh failed

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
