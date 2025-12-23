import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 【必要/核心】页面标题
     * 用于 document.title、侧边栏菜单名称、面包屑展示
     */
    title: string;

    /**
     * 【核心/可选】菜单图标
     * 通常为组件名或图标库的 class 类名
     */
    icon?: string;

    /**
     * 【可选/权限】是否需要登录授权
     * @default true
     */
    requiresAuth?: boolean;

    /**
     * 【可选/权限】访问角色
     * 只有拥有其中一个角色的用户才能访问，如 ['admin', 'editor']
     */
    roles?: string[];

    /**
     * 【可选/权限】细粒度权限代码
     * 用户需拥有定义的权限标识才能访问，如 ['user:add']
     */
    permissions?: string[];

    /**
     * 【可选/菜单】是否在侧边栏隐藏
     * 适用于 404、登录、个人设置等不需要在导航栏展示的路径
     * @default false
     */
    hidden?: boolean;

    /**
     * 【可选/缓存】是否启用 KeepAlive 缓存
     * 开启后，页面切换不会触发生命周期销毁
     * @default false
     */
    keepAlive?: boolean;

    /**
     * 【可选/多页签】是否固定在标签页栏 (TagsView)
     * 设置为 true 时，该页签不允许被关闭（如“首页”）
     * @default false
     */
    affix?: boolean;

    /**
     * 【可选/菜单】高亮菜单项的路径
     * 场景：访问详情页时，希望侧边栏高亮的是列表页的菜单
     * 示例：'/user/edit'
     */
    activeMenu?: string;

    /**
     * 【可选/菜单】是否总是显示根菜单
     * 如果子路由只有一个，默认会提升显示。设为 true 则强制保持层级显示。
     * @default true
     */
    alwaysShow?: boolean;

    /**
     * 【可选/交互】外部链接地址
     * 如果设置，点击菜单将直接在新窗口打开该链接
     */
    externalLink?: string;

    /**
     * 【可选/布局】是否隐藏面包屑
     * @default false
     */
    hideBreadcrumb?: boolean;

    /**
     * 【可选/布局】是否全屏显示
     * 设置为 true 时，可能隐藏侧边栏和顶栏，仅显示内容区
     * @default false
     */
    fullScreen?: boolean;

    /**
     * 【可选/菜单】排序权重
     * 数字越小排序越靠前
     * @default 0
     */
    orderNo?: number;

    /**
     * 【可选/状态】是否启用
     * 如果为 false，则不显示在菜单中且不可访问（由路由守卫拦截）
     * @default true
     */
    enabled?: boolean;

    /**
     * 【可选/路由】路由重定向
     * 当用户访问该路由时，重定向到指定的路由路径
     */
    redirect?: string;

    /**
     * 【可选/数据】父级ID
     * 用于动态路由构建时识别层级关系，0或null表示顶级
     */
    parentId?: number | string | null;
  }
}
