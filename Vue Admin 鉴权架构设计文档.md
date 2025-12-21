# Vue Admin 鉴权架构设计文档

## 1. 架构概览 (Architecture Overview)

本项目采用现代 Vue 3 生态系统构建，实现了一套企业级的、高安全性的前端认证与权限管理架构。核心设计理念包括**双 Token 机制**、**状态驱动的认证流程**、**动态路由加载**以及**实时权限同步**。

### 1.1 技术栈
- **核心框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **语言**: TypeScript
- **UI 组件库**: Element Plus

### 1.2 核心架构图
```mermaid
graph TD
    User[用户] --> View[视图层 (Views)]
    View --> Component[组件层 (Components)]

    subgraph "应用引导 (Bootstrap)"
        Main[main.ts] --> Bootstrap[bootstrap()]
        Bootstrap --> AuthService
    end

    subgraph "核心服务层 (Core Services)"
        AuthService[Auth Service]
        PermissionChannel[WebSocket Permission Channel]
    end

    subgraph "状态管理 (Pinia Stores)"
        AuthStore[Auth Store]
        PermissionStore[Permission Store]
    end

    subgraph "基础设施 (Infrastructure)"
        Router[Vue Router]
        Axios[Axios Instance]
        Refresh[Token Refresh Logic]
    end

    View -- 触发登录/操作 --> AuthService
    AuthService -- 更新状态 --> AuthStore
    AuthService -- 更新权限 --> PermissionStore
    AuthService -- 注册路由 --> Router

    Axios -- 拦截器/401处理 --> Refresh
    Refresh -- 获取Token --> AuthStore

    PermissionChannel -- 推送变更 --> PermissionStore
    PermissionChannel -- 触发重建 --> Router

    Router -- 路由守卫 --> AuthStore
```

---

## 2. 目录与文件深度分析 (File Analysis)

### 2.1 认证模块 (`src/auth/`)
负责用户身份的验证、会话维持和令牌管理。

| 文件 | 类型 | 核心功能 | 依赖关系 |
| :--- | :--- | :--- | :--- |
| `authService.ts` | **Service** | 登录(`login`)、登出(`logout`)、会话恢复(`restoreSession`)的高层业务逻辑封装。协调 API、Store 和 Router。 | 依赖 `axios`, `authStore`, `permissionStore`, `router` |
| `authStore.ts` | **Store** | 管理认证状态机 (`idle`, `authenticated` 等)、用户信息和 Access Token。**Token 仅存储在内存中**。 | 依赖 `pinia`, `authTypes` |
| `refresh.ts` | **Utility** | 实现 Token 刷新逻辑。包含 `ensureAuthReady` 单例 Promise，防止并发请求导致的"刷新风暴"。 | 依赖 `authStore`, `axios` |
| `authTypes.ts` | **Type** | 定义 `UserInfo`, `AuthStatus`, `ApiResponse` 等核心类型接口。 | 无 |

### 2.2 权限模块 (`src/permission/`)
负责基于角色的访问控制 (RBAC) 和动态资源管理。

| 文件 | 类型 | 核心功能 | 依赖关系 |
| :--- | :--- | :--- | :--- |
| `permissionStore.ts` | **Store** | 存储当前用户的权限列表 (`string[]`) 和菜单树结构。 | 依赖 `pinia` |
| `routeBuilder.ts` | **Service** | 根据权限列表动态筛选并添加 Vue Router 路由 (`buildRoutes`)，支持路由重置 (`resetRouter`)。 | 依赖 `router` |
| `permissionChannel.ts` | **Service** | 建立 WebSocket 连接，监听服务端权限变更事件，实时更新前端权限和路由。 | 依赖 `authStore`, `permissionStore`, `router` |

### 2.3 基础设施 (`src/axios/`, `src/router/`, `src/bootstrap/`)

| 文件 | 类型 | 核心功能 |
| :--- | :--- | :--- |
| `axios/index.ts` | **Config** | 配置 Axios 拦截器。**Request**: 注入 Bearer Token；**Response**: 拦截 401 错误并自动触发 Token 刷新重试机制。 |
| `router/guard.ts` | **Guard** | 全局路由守卫。确保页面访问前认证状态已就绪 (`isReady`)，处理登录重定向和权限校验。 |
| `bootstrap/index.ts` | **Init** | 应用启动脚本。在 `app.mount()` 之前执行，负责恢复用户会话，防止页面刷新时的状态丢失。 |

---

## 3. 核心设计模式与机制 (Key Design Patterns)

### 3.1 双 Token 架构 (Dual Token Strategy)
*   **Access Token**: 短效，存储在 Pinia (内存) 中，防止 XSS 攻击窃取。
*   **Refresh Token**: 长效，由后端通过 `HttpOnly` Cookie 设置，前端 JS 无法读取，防止 CSRF 和 XSS。
*   **刷新机制**: `src/auth/refresh.ts` 使用单例 Promise 模式 (`refreshPromise`)，确保在多个并发请求触发 401 时，只发起一次刷新请求。

### 3.2 状态驱动的认证 (State-Driven Auth)
`AuthStore` 维护一个有限状态机 (FSM):
*   `idle`: 初始化状态
*   `bootstrapping`: 正在恢复会话
*   `authenticated`: 已登录且 Token 有效
*   `expired`: Token 过期，等待刷新
*   `logged_out`: 未登录

### 3.3 动态路由 (Dynamic Routing)
不将所有路由硬编码在 `router/index.ts` 中。
1.  登录后获取权限列表。
2.  `routeBuilder.ts` 根据权限过滤出可用路由。
3.  使用 `router.addRoute()` 动态注册。
4.  支持 `resetRouter()` 清理路由，用于登出或权限变更场景。

### 3.4 实时安全通道 (Real-time Security)
使用 WebSocket (`permissionChannel.ts`) 保持长连接。当管理员在后台修改用户权限时，前端即时收到通知，自动重新拉取权限并重建路由，甚至在权限被撤销时强制踢出用户。

---

## 4. 关键代码片段示例

### 4.1 防止并发刷新 (Refresh Token Singleton)
```typescript
// src/auth/refresh.ts
let refreshPromise: Promise<string | null> | null = null;

export async function ensureAuthReady(): Promise<string | null> {
  // ... 检查现有 Token ...

  // 如果已有刷新请求在进行，直接复用其 Promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // 否则开启新的刷新请求
  refreshPromise = refreshClient.post('/auth/refresh')
    // ... 处理响应 ...
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}
```

### 4.2 应用引导 (Bootstrapping)
```typescript
// src/main.ts
bootstrap().then(() => {
  app.mount('#app');
});

// src/bootstrap/index.ts
export async function bootstrap() {
    // 尝试利用 HttpOnly Cookie 恢复会话
    const restored = await restoreSession();
    // 初始化 WebSocket 等
    if (restored) initPermissionChannel();
}
```

---

## 5. 总结

该架构通过**模块化分层**清晰地分离了视图、逻辑和状态。特别是**静默刷新**和**实时权限同步**的设计，极大地提升了用户体验和系统安全性，适用于对安全性和响应速度有较高要求的中后台管理系统。