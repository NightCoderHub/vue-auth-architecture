export type AuthStatus =
  | 'idle'          // 初始状态
  | 'bootstrapping' // 应用启动时检查认证
  | 'authenticated' // 已登录
  | 'expired'       // Token 过期，需要刷新
  | 'logged_out';   // 显式退出登录或刷新失败

export interface UserInfo {
  id: number;
  username: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  avatar?: string;
}

/**
 * 菜单项接口定义 (Standard MenuItem)
 * 遵循大型中后台系统标准设计
 */
export interface MenuItem {
  /**
   * 菜单 ID
   * 唯一标识符
   */
  id: number | string;

  /**
   * 父级菜单 ID
   * 顶级菜单为 0 或 null
   */
  parentId?: number | null;

  /**
   * 路由路径
   * 示例: '/system', 'user', 'https://external.com'
   */
  path: string;

  /**
   * 路由名称
   * 必须唯一，用于 KeepAlive 缓存和路由跳转
   * 推荐使用 PascalCase (如: 'SystemUser')
   */
  name: string;

  /**
   * 组件路径
   * - 'Layout': 布局组件
   * - 'ParentView': 多级路由容器
   * - 'system/user/index': 具体的 .vue 文件路径
   */
  component: string;

  /**
   * 路由重定向
   * 示例: '/system/user'
   */
  redirect?: string;

  /**
   * 菜单标题
   * 用于侧边栏、面包屑、Tab 标题
   */
  title: string;

  /**
   * 菜单图标
   * 支持 Element Plus 图标名或 SVG 图标名
   */
  icon?: string;

  /**
   * 【可选/权限】是否需要登录授权
   * @default true (建议生产环境默认为 true，更安全)
   */
  requiresAuth?: boolean;

  /**
   * 【可选/布局】是否隐藏面包屑
   * @default false
   */
  hideBreadcrumb?: boolean;

  /**
   * 【可选/状态】是否启用
   * 如果为 false，则不显示在菜单中且不可访问（由路由守卫拦截）
   * @default true
   */
  enabled?: boolean;

  /**
   * 是否隐藏
   * true: 不在侧边栏显示 (如详情页、404 页)
   * @default false
   */
  hidden?: boolean;

  /**
   * 【可选/菜单】高亮菜单项的路径
   * 场景：访问详情页时，希望侧边栏高亮的是列表页的菜单
   * 示例：'/user/list'
   */
  activeMenu?: string;

  /**
   * 是否开启缓存
   * true: 开启 KeepAlive
   * @default false
   */
  keepAlive?: boolean;

  /**
   * 权限标识数组
   * 控制该菜单的访问权限 (如: ['sys:user:view'])
   */
  permissions?: string[];

  /**
   * 菜单类型
   * 0: 目录 (Directory)
   * 1: 菜单 (Menu)
   * 2: 按钮 (Button) - 仅作为权限控制，不生成路由
   */
  type?: 0 | 1 | 2;

  /**
   * 排序号
   * 数值越小越靠前
   */
  sort?: number;

  /**
   * 是否固定在 TagsView
   * @default false
   */
  affix?: boolean;

  /**
   * 是否全屏显示
   * (隐藏侧边栏和顶栏)
   * @default false
   */
  fullScreen?: boolean;

  /**
   * 总是显示根菜单
   * 当只有一个子菜单时，是否强制显示父级
   * @default true
   */
  alwaysShow?: boolean;

  /**
   * 外部链接
   * 如果设置，点击将在新窗口打开
   */
  externalLink?: string;

  /**
   * 内嵌 Iframe 地址
   * 如果设置，将在内容区嵌入 Iframe
   */
  frameSrc?: string;

  /**
   * 子菜单列表
   */
  children?: MenuItem[];
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
