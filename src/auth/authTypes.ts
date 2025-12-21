export type AuthStatus =
  | 'idle'          // 初始状态
  | 'bootstrapping' // 应用启动时检查认证
  | 'authenticated' // 已登录
  | 'expired'       // Token 过期，需要刷新
  | 'logged_out';   // 显式退出登录或刷新失败

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
