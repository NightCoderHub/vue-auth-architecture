# 企业级前端八层架构分层解析 (Vue 3 + TypeScript)

本文档基于 **Vue 3 + TypeScript + Element Plus** 技术栈，从架构师视角阐述企业级前端应用的八层架构体系。重点涵盖**工程化基建**、**核心能力抽象**、**鉴权安全体系**及**业务逻辑复用**。

## 架构分层总览

```mermaid
graph TD
    Layer1[1. 基础设施层 (Infrastructure)] --> Layer2[2. 核心抽象层 (Core)]
    Layer2 --> Layer3[3. 网络交互层 (Network)]
    Layer3 --> Layer4[4. 鉴权与安全层 (Auth & Security)]
    Layer4 --> Layer5[5. 业务逻辑层 (Domain)]
    Layer5 --> Layer6[6. UI 组件层 (UI)]
    Layer6 --> Layer7[7. 应用适配层 (Application)]
    Layer7 --> Layer8[8. 质量与运维层 (Quality)]
```

---

## 1. 基础设施层 (Infrastructure Layer)

**目标**：为研发提供稳定的工程底座，统一团队协作规范。

*   **构建工具**: `Vite`
    *   配置 Alias (`@/`), Proxy 代理, Drop Console (生产环境)。
*   **包管理**: `pnpm`
    *   利用软链接机制优化磁盘空间，天然支持 Monorepo。
*   **代码规范**:
    *   `ESLint`: 代码质量检查。
    *   `Prettier`: 代码风格格式化。
    *   `Stylelint`: CSS/SCSS 规范检查。
*   **Git 规范**:
    *   `Husky` + `Lint-staged`: 提交前自动执行 Lint 检查。
    *   `Commitlint`: 强制 Commit Message 符合 Conventional Commits 规范 (如 `feat: add login`)。

---

## 2. 核心抽象层 (Core Layer)

**目标**：提供与具体业务解耦的底层能力，沉淀通用资产。

### 2.1 缓存管理模块 (Storage)

基于策略模式封装 `localStorage` / `sessionStorage`，构建高可靠、高性能、可进化的前端缓存层。

*   **核心特性**：
    *   **自动序列化**: 自动处理 `JSON.stringify` / `JSON.parse`，支持复杂对象存取。
    *   **命名空间 (Namespace)**: 强制 Key 前缀（如 `VUE_ADMIN_`），彻底解决多项目同域部署的覆盖问题。
    *   **AES 加密**: 生产环境可配置自动开启 AES 加密，防止敏感数据明文泄露。
    *   **二级缓存 (L2 Memory)**: 引入内存 `Map` 作为二级缓存 (Read-through/Write-through 策略)，大幅减少 `JSON.parse` 的 CPU 开销，提升高频读取性能。
    *   **过期机制 (TTL)**: 支持单条数据自定义过期时间，读取时惰性删除。
    *   **配额管理 (Quota)**: 自动捕获 `QuotaExceededError`，触发过期数据清理策略；若仍不足，则降级为静默失败，保障应用不崩溃。

*   **进阶能力**：
    *   **版本控制 (Versioning)**: 引入全局版本号（如 `1.0.0`），当版本不匹配时自动失效旧缓存，防止数据结构不兼容导致的运行时错误。
    *   **数据迁移 (Migration)**: 支持定义版本迁移策略（Migration Table），在升级时自动将旧版本数据转换为新结构，实现平滑升级。
    *   **多标签页同步**: 监听 `storage` 事件，当其他标签页修改数据时，自动同步更新当前页面的内存缓存。
    *   **Pinia 集成 (Persistence)**: 提供自定义 Pinia 插件，只需一行配置即可实现 Store 状态的自动持久化与恢复，底层复用 Storage 的加密与版本控制能力。

```typescript
// src/utils/storage/index.ts
import { createStorage } from './StorageCore';

// 导出默认实例 (localStorage)
export const ls = createStorage(localStorage, {
  prefixKey: 'VUE_ADMIN_LS_',
  encrypt: import.meta.env.PROD, // 生产环境自动加密
  timeout: 60 * 60 * 24 * 7,     // 默认 7 天过期
  version: '2.0.0',              // 当前数据版本
  migrations: {                  // 数据迁移策略
    '1.0.0': (oldData) => {
      // 将旧版 { theme: 'dark' } 迁移为 { appearance: { mode: 'dark' } }
      return { appearance: { mode: oldData.theme } };
    }
  }
});

// 使用示例 1：直接调用
ls.set('settings', { theme: 'dark' });
const settings = ls.get('settings'); // 优先命中内存，若版本不匹配则触发迁移

// 使用示例 2：配合 Pinia 自动持久化
// src/stores/app.ts
defineStore('app', () => {
  const sidebar = ref(true);
  return { sidebar };
}, {
  persist: { // 开启持久化
    key: 'app_store',
    storage: ls, // 指定使用 ls 实例
    paths: ['sidebar'] // 仅持久化 sidebar 字段
  }
});
```

### 2.2 业务工具函数封装 (Utils)

将高频使用的业务逻辑提取为纯函数 (Pure Function)，确保无副作用且易于测试。

*   **日期时间处理**: 基于 `dayjs` 封装，统一全站时间格式，避免格式混乱。
*   **文件流处理**: 统一封装 Blob 文件下载、Excel 导出逻辑。

```typescript
// src/utils/index.ts
import dayjs from 'dayjs';

/**
 * 统一日期格式化
 * @param date - 日期对象/时间戳/字符串
 * @param format - 格式化模板 (默认: YYYY-MM-DD HH:mm:ss)
 */
export const formatDate = (date: string | number | Date | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 通用文件流下载
 * @param data - 后端返回的 Blob 数据
 * @param fileName - 文件名
 */
export const downloadFile = (data: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 数据树形化 (扁平数据转 Tree)
 */
export const listToTree = <T extends { id: string; parentId?: string; children?: T[] }>(
  list: T[],
  pid: string | null = null
): T[] => {
  return list
    .filter((item) => item.parentId === pid)
    .map((item) => ({
      ...item,
      children: listToTree(list, item.id),
    }));
};
```

### 2.3 数据字典模块 (Dict)

统一管理系统中的字典数据，提供缓存、预加载与便捷的 Hooks 调用方式。

*   **核心能力**:
    *   **DictStore**: 基于 Pinia 的字典数据缓存中心，负责数据的获取与存储。
    *   **useDict**: 组件级 Hook，支持在组件中并发请求多个字典类型，自动注入响应式数据。
    *   **dictUtils**: 纯函数工具库，提供 `getDictLabel` 等回显方法，脱离组件上下文也可使用。

```typescript
// src/dict/useDict.ts (简化示意)
import { useDictStore } from './dictStore';
import { ref, onMounted, toRefs } from 'vue';

export function useDict(...args: string[]) {
  const dictStore = useDictStore();
  const res = ref<Record<string, any[]>>({});

  onMounted(async () => {
    // 1. 并行加载字典数据
    const promises = args.map((type) => dictStore.getDict(type));
    const results = await Promise.all(promises);

    // 2. 映射结果到响应式对象
    args.forEach((type, index) => {
      res.value[type] = results[index] || [];
    });
  });

  return toRefs(res.value);
}
```

---

## 3. 网络交互层 (Network Layer)

**目标**：构建高性能、可扩展的数据通信大动脉，隔离后端接口差异。

### 3.1 Axios 深度封装

实现双 Token 无感刷新、全局错误处理、取消重复请求及类型安全的响应数据解包。

```typescript
// src/axios/index.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

// ... (详细代码见源码 src/axios/index.ts，包含拦截器链与 Token 刷新逻辑)
// 核心特性：
// 1. 扩展 Axios 类型定义，支持泛型返回值
// 2. 请求拦截：自动注入 Bearer Token，等待认证就绪
// 3. 响应拦截 A：处理 401 过期，调用 handleTokenExpired 进行无感刷新
// 4. 响应拦截 B：统一处理业务错误码 (code !== 200) 与 403 权限拒绝
// 5. 响应拦截 C：自动解包 data.data，简化调用方逻辑
```

### 3.2 API 接口管理

建议配合 **Orval** 等工具根据 Swagger/OpenAPI 文档自动生成接口定义，保持前后端类型同步。

---

## 4. 鉴权与安全层 (Auth & Security Layer)

**目标**：基于 RBAC (Role-Based Access Control) 模型，保障应用安全，实现精细化的访问控制。

### 4.1 RBAC 权限模型设计

采用标准的 **用户-角色-权限** 三层模型：
*   **用户 (User)**: 系统的使用者。
*   **角色 (Role)**: 权限的集合 (如 `admin`, `editor`, `visitor`)。
*   **权限 (Permission)**: 具体的操作资源 (如 `user:add`, `order:delete`)。

### 4.2 认证 (Authentication)
*   **登录流程**: 账号密码 / SSO 登录，换取 Token。
*   **Token 存储策略**:
    *   **Access Token**: 存储在 **内存 (Pinia)** 中，页面刷新即丢失，杜绝 XSS 攻击。
    *   **Refresh Token**: 存储在 **HttpOnly Cookie** 中，由后端写入，前端无法读取。
    *   *禁止将 Token 明文存储在 LocalStorage 中。*

#### 1. 核心类型定义 (authTypes.ts)

```typescript
// src/auth/authTypes.ts
export type AuthStatus =
  | 'idle'          // 初始状态
  | 'bootstrapping' // 应用启动时检查认证
  | 'authenticated' // 已登录
  | 'expired'       // Token 过期，需要刷新
  | 'logged_out';   // 显式退出登录或刷新失败

export interface UserInfo {
  id: number;
  username: string;
  roles: Array<{ id: number; name: string }>;
  avatar?: string;
}
```

#### 2. 认证状态仓库 (authStore.ts)

维护一个有限状态机 (FSM) 来管理复杂的登录状态流转。

```typescript
// src/auth/authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthStatus, UserInfo } from './authTypes';

export const useAuthStore = defineStore('auth', () => {
  const status = ref<AuthStatus>('idle');
  const accessToken = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  const isAuthenticated = computed(() => status.value === 'authenticated');

  function setAccessToken(token: string) {
    accessToken.value = token;
    if (status.value !== 'authenticated') {
      status.value = 'authenticated';
    }
  }

  function setLoggedOut() {
    accessToken.value = '';
    userInfo.value = null;
    status.value = 'logged_out';
  }

  return { status, accessToken, userInfo, isAuthenticated, setAccessToken, setLoggedOut };
});
```

#### 3. Token 刷新机制 (refresh.ts)

实现 Token 刷新逻辑，包含并发控制（防止“刷新风暴”）。

```typescript
// src/auth/refresh.ts
import axios from 'axios';
import { useAuthStore } from './authStore';

// 独立的 Axios 实例，避免拦截器死锁
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 发送 HttpOnly Cookie
});

let refreshPromise: Promise<string | null> | null = null;

export async function ensureAuthReady(): Promise<string | null> {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated && authStore.accessToken) {
    return authStore.accessToken;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshClient.post('/auth/refresh')
    .then(res => {
      const { data } = res.data;
      if (data && data.accessToken) {
        authStore.setAccessToken(data.accessToken);
        return data.accessToken;
      }
      throw new Error('Refresh failed');
    })
    .catch(() => {
      authStore.setLoggedOut();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
```

#### 4. 认证业务服务 (authService.ts)

封装登录、登出、会话恢复的高层逻辑。

```typescript
// src/auth/authService.ts
import { useAuthStore } from './authStore';
import { ensureAuthReady } from './refresh';
import api from '@/api'; // 假设的 API 模块

export async function login(payload: any) {
  const authStore = useAuthStore();
  // 1. 登录请求
  const { accessToken } = await api.auth.login(payload);
  // 2. 设置 Token
  authStore.setAccessToken(accessToken);
  // 3. 获取用户信息
  const user = await api.user.getProfile();
  authStore.userInfo = user;
}

export async function restoreSession() {
  const authStore = useAuthStore();
  // 尝试刷新 Token
  const token = await ensureAuthReady();
  if (token) {
    // 恢复用户信息
    const user = await api.user.getProfile();
    authStore.userInfo = user;
    return true;
  }
  return false;
}
```

### 4.3 授权 (Authorization)

#### 1. 页面级权限 (Page Level) - 动态路由
采用 **后端驱动 (Backend-Driven)** 方案，核心逻辑拆分为 **状态管理**、**路由构建** 与 **实时更新通道**。

*   **状态管理 (PermissionStore)**:
    仅负责存储权限码与菜单树，不再包含复杂的业务逻辑。

```typescript
// src/permission/permissionStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { constantRoutes } from '@/router';

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([]);
  const menus = ref<any[]>(constantRoutes);
  const routesGenerated = ref(false);

  function setMenus(newMenus: any[]) {
    menus.value = constantRoutes.concat(newMenus);
    routesGenerated.value = true;
  }

  return { permissions, menus, routesGenerated, setMenus };
});
```

*   **路由构建 (RouteBuilder)**:
    独立模块负责将后端菜单数据递归转换为 Vue Router 路由配置，并处理动态挂载。

```typescript
// src/permission/routeBuilder.ts
import { usePermissionStore } from './permissionStore';
import router from '@/router';

export function buildRoutes(menus: MenuItem[] = []) {
  const permissionStore = usePermissionStore();

  // 1. 递归转换路由结构
  const dynamicRoutes = generateRoutesFromMenu(menus);

  // 2. 动态注册路由
  dynamicRoutes.forEach(route => {
    router.addRoute(route);
  });

  // 3. 添加 404 守卫
  router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/404' });

  // 4. 更新 Store
  permissionStore.setMenus(dynamicRoutes);
}
```

*   **实时权限更新 (PermissionChannel)**:
    建立 WebSocket 连接监听权限变更，实现权限修改后的**即时生效**（无需用户手动刷新）。

```typescript
// src/permission/permissionChannel.ts
export function initPermissionChannel() {
  // ... WebSocket 连接逻辑
  socket.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'permission_change') {
      // 1. 重置路由
      resetRouter();
      // 2. 更新 Store & 重建路由
      handlePermissionUpdate(data.permissions, data.menus);
      // 3. 安全检查：当前页面若无权访问则跳至 403
      validateCurrentRoute();
    }
  };
}
```

#### 2. 按钮级权限 (Button Level) - 细粒度控制
基于 **Permission 组件** 进行细粒度控制，相比指令方式，组件方式对插槽的支持更好，且更符合 Vue 3 的组件化思想。

*   **流程**:
    1.  接口返回用户的所有权限码列表 `['user:add', 'user:edit']`。
    2.  使用 `<Permission>` 组件包裹需要控制的元素。

*   **实现代码**:

```html
<!-- 只有拥有 'user:add' 权限的用户才能看到此按钮 -->
<Permission code="user:add">
  <el-button>新增用户</el-button>
</Permission>
```

```typescript
// src/components/Permission.vue
<template>
  <slot v-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '@/permission/permissionStore';

const props = defineProps<{
  code: string
}>();

const permissionStore = usePermissionStore();

const hasAccess = computed(() => {
  return permissionStore.permissions.includes(props.code);
});
</script>
```

---

## 5. 业务逻辑层 (Domain Layer)

**目标**：管理应用状态与业务规则，核心是“逻辑复用”。

*   **状态管理**: **Pinia**
    *   `stores/app.ts`: 全局 UI 状态 (侧边栏折叠、设备类型响应式切换)。
    *   `stores/tagsView.ts`: 多标签页状态 (已访问视图列表、KeepAlive 缓存列表)。
    *   *注：业务领域 Store (如 `authStore`, `permissionStore`) 已内聚至对应模块目录 (`src/auth`, `src/permission`)，实现领域驱动设计。*
*   **Composables (Hooks)**:
    *   `useResizeHandler`: 响应式布局处理器，监听窗口变化自动切换桌面/移动端模式，并控制侧边栏状态。
    *   *扩展性*: 可在此目录下封装 `useRequest` (基于 Vue Query 的请求封装) 或 `useTable` (通用表格逻辑) 等复用钩子。

---

## 6. UI 组件层 (UI Layer)

**目标**：构建视觉与交互标准，提升开发效率。

*   **UI 框架**: **Element Plus**
    *   采用**按需引入** (Auto Import) 减少体积。
    *   **主题定制**: 使用 SCSS 变量覆盖 Element Plus 默认变量。
*   **样式方案**:
    *   **SCSS (Global)**: 定义全局变量 (`variables.scss`), Mixins, 重置样式。
    *   **CSS Modules (Local)**: 用于业务组件，防止样式冲突。
*   **组件体系**:
    *   `src/components/Base`: 基础 UI 组件 (如 `BaseButton`, `BaseIcon`)。
    *   `src/components/Business`: 业务组件 (如 `UserSelect`, `ProTable`)。
*   **图标系统 (Iconography)**:
    *   **方案**: 采用 **Iconify** (`@iconify/vue`) 实现多图标库的统一渲染。
    *   **离线/内网适配**: 通过 `src/icons/bundled.ts` 预打包常用图标 (如 `icon-park-outline` 系列)，避免运行时请求 API，确保内网可用性。
    *   **自定义扩展**: 支持通过 `addIcon` 注册自定义 SVG 路径图标 (如 `hamburger-menu-linear`)。

---

## 7. 应用适配层 (Application Layer)

**目标**：将各层组装成完整的应用程序，提供路由导航、页面布局和应用启动引导能力。

### 7.1 路由系统 (Routing System)

*   **路由配置 (Router)**:
    *   **常量路由 (Constant Routes)**: 不需要鉴权的基础页面 (如 `/login`, `/404`, `/403`, `/home`)。
    *   **严格模式 (Strict Mode)**: 启用 Path Governance，强制规范化 URL 路径（如自动移除尾随斜杠）。

*   **全局路由守卫 (Guards)**:
    1.  **路径规范化**: 拦截并重定向不规范的路径 (e.g. `/home/` -> `/home`)。
    2.  **会话恢复等待**: 在刷新页面时，暂停路由导航，直到认证状态恢复完成 (`restoreSession`)。
    3.  **动态路由加载**: 登录后或刷新时，按需懒加载业务路由 (`initDynamicRoutes`)，避免 404。
    4.  **鉴权拦截**: 对未登录或无权限的访问进行重定向。

```typescript
// src/router/guard.ts (核心逻辑示意)
router.beforeEach(async (to, _from, next) => {
  // 1. Path Governance: 强制移除尾随斜杠
  if (to.path !== '/' && to.path.endsWith('/')) {
    return next({ path: normalizePath(to.fullPath), replace: true });
  }

  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // 2. 关键：等待认证状态稳定 (防止刷新闪烁)
  if (!authStore.isReady) {
    const restored = await restoreSession();
    if (restored) return next({ ...to, replace: true });
  }

  if (authStore.isAuthenticated) {
    if (to.path === '/login') return next('/');

    // 3. 动态路由加载检查
    if (!permissionStore.routesGenerated) {
      await initDynamicRoutes();
      return next({ ...to, replace: true }); // 确保新路由生效
    }
    next();
  } else {
    // 4. 未登录拦截
    if (to.meta.requiresAuth !== false) {
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    next();
  }
});
```

### 7.2 布局系统 (Layout System)

*   **核心布局 (`src/layout`)**:
    *   `BasicLayout`: 包含 Sidebar (侧边导航), Navbar (顶部导航), TagsView (历史标签), AppMain (主内容区) 的经典后台布局。
    *   `BlankLayout`: 空白布局 (用于登录、404 等页面)。
*   **样式设计 (Design Tokens)**:
    *   基于 SCSS 变量 (`variables.module.scss`) 实现统一的**设计变量系统**，支持主题定制。
    *   **Sidebar**: 深色主题 (`#111827`)，强调秩序感。
    *   **Navbar**: 纯白扁平化设计，集成面包屑与个人中心。
    *   **TagsView**: 现代化“胶囊”风格，支持右键菜单与历史导航。
    *   **AppMain**: 动态计算高度，集成 `fade-transform` 页面切换过渡动画。
*   **规范**: 严格遵循 BEM 命名规范 (如 `.app-wrapper`, `.sidebar-container`)，使用 CSS Modules 防止样式污染。

### 7.3 应用引导 (Bootstrap)

**目标**：在 Vue 实例挂载前，完成核心状态的初始化，确保应用“就绪”后再渲染 UI，避免页面闪烁或鉴权逻辑竞态。

*   **核心职责**:
    1.  **会话恢复**: 尝试从 HttpOnly Cookie 恢复登录态。
    2.  **数据预热**: 并行加载字典、配置等基础数据（非阻塞）。
    3.  **状态流转**: 维护 `bootstrapping` -> `authenticated` / `logged_out` 的状态机流转。

```typescript
// src/main.ts
async function startApp() {
  const app = createApp(App);
  // ... Pinia, Router 等插件安装 ...

  // 阻塞式引导：确保核心状态就绪
  console.log('[App] 正在启动...');
  await bootstrap();

  console.log('[App] 正在挂载...');
  app.mount('#app');
}
```

```typescript
// src/bootstrap/index.ts
import { restoreSession } from '@/auth/authService';
import { preloadDicts } from '@/dict';

export async function bootstrap() {
  const authStore = useAuthStore();
  // 标记为启动中，UI 可据此显示 Loading 遮罩
  authStore.setBootstrapping();

  try {
    // 1. 恢复会话 (Token & UserInfo)
    const restored = await restoreSession();

    if (restored) {
      // 2. 登录成功后，预加载常用字典（非阻塞执行，不影响首屏渲染速度）
      preloadDicts();
      // 3. 建立权限通道 (如果需要)
      // initPermissionChannel();
    }
  } catch (error) {
    // 异常兜底：确保应用能进入未登录状态，而不是卡死
    authStore.setLoggedOut();
  }
}
```

---

## 8. 质量与运维层 (Quality Layer)

**目标**：保障代码质量与线上稳定性。

*   **单元测试**: `Vitest` + `Vue Test Utils`。
*   **类型检查**: 构建时运行 `vue-tsc --noEmit`。
*   **监控**: 接入 Sentry 或自研埋点系统。

---

## 目录结构参考

```
src/
├── api/                # API 接口定义
├── assets/             # 静态资源
├── auth/               # [新增] 认证核心模块 (Service, Store, Types)
├── dict/               # [新增] 数据字典模块
├── axios/              # [新增] Axios 封装
├── bootstrap/          # [新增] 应用引导模块
├── components/         # 公共组件
│   ├── Base/           # 基础组件
│   ├── Business/       # 业务组件
│   ├── Permission.vue  # [新增] 权限控制组件
├── composables/        # 组合式函数 (Hooks)
├── directives/         # 自定义指令 (v-auth)
├── layout/             # 布局组件
├── permission/         # [新增] 权限管理模块 (Store, RouteBuilder, Channel)
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── styles/             # 全局样式 (SCSS)
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数 (request, storage)
├── views/              # 页面视图
├── App.vue
└── main.ts
```
