# Vue 3 生产级鉴权与实时权限架构方案 (腾讯面试级)

本方案旨在打造一个高稳定性、风险可控的前端鉴权架构，重点解决“登录态一致性”与“权限实时生效”两大生产难题。

## 第一阶段：工程初始化与目录规约
- **目标**: 建立清晰、可维护的代码结构，体现工程化思维。
- **执行内容**:
    - 初始化 Vite + Vue 3 + TypeScript 项目。
    - 引入 Pinia, Vue Router, Axios, Element Plus。
    - **目录结构**:
        - `src/auth`: 核心鉴权逻辑 (Token, 状态机, Refresh)。
        - `src/permission`: 权限管理 (Store, 动态路由, 实时通道)。
        - `src/axios`: 网络层 (拦截器, 队列)。
        - `src/bootstrap`: 应用启动引导。

## 第二阶段：登录态状态机 (Auth State Machine)
- **目标**: 使用确定性状态机替代布尔值，杜绝“半登录态”。
- **执行内容**:
    - **定义状态**: `idle` (空闲), `bootstrapping` (初始化中), `authenticated` (已认证), `expired` (已过期), `logged_out` (已登出)。
    - **`src/auth/authStore.ts`**:
        - 维护当前状态 `status`。
        - 仅在内存中维护 `accessToken` (Pinia)。
        - 暴露 `isReady` (非 `idle` & `bootstrapping`) 供路由守卫使用。

## 第三阶段：可控的网络鉴权体系 (Axios)
- **目标**: 解决并发 401 与 Refresh 风暴。
- **执行内容**:
    - **`src/auth/refresh.ts`**: 实现单例 Promise 模式的 Token 刷新逻辑。
    - **`src/axios/index.ts`**:
        - **请求拦截**: 自动注入 Token，若处于 `bootstrapping` 则挂起请求。
        - **响应拦截**:
            - 401 (登录态失效): 挂起当前请求 -> 唤起 Refresh 单例 -> 成功重试 / 失败登出。
            - 403 (权限不足): 直接 Reject，不触发 Refresh。

## 第四阶段：实时权限模型 (Real-time Permission)
- **核心亮点**: 权限变更视为安全事件，必须实时生效。
- **执行内容**:
    - **`src/permission/permissionStore.ts`**: 存储菜单、路由、权限点。
    - **`src/permission/routeBuilder.ts`**: 实现动态路由的构建与**重置** (Reset Router)。
    - **`src/permission/permissionChannel.ts`**:
        - 建立模拟 WebSocket/SSE 通道。
        - 监听权限变更事件 -> 触发 `handlePermissionChange`。
    - **`handlePermissionChange` 流程**:
        1. 锁定 UI (可选 loading)。
        2. 清空当前权限。
        3. 重新拉取权限数据。
        4. 重建路由表。
        5. **关键**: 校验当前路由是否有权限，若无权限立即跳转 403。

## 第五阶段：路由守卫与启动引导
- **目标**: 确保应用在安全状态下运行。
- **执行内容**:
    - **`src/bootstrap/index.ts`**:
        - 应用启动 -> `authStore.setBootstrapping()` -> 尝试 Refresh 恢复 Session -> 更新状态。
    - **`src/router/guard.ts`**:
        - `await authStore.untilReady()`: 确保鉴权初始化完成。
        - 权限校验：未登录 -> Login；已登录无权限 -> 403。

## 第六阶段：UI 实现与场景验证
- **目标**: 验证架构的稳定性与实时性。
- **执行内容**:
    - **Mock 服务**: 模拟 Refresh 接口 (HttpOnly Cookie 场景)、模拟权限变更推送。
    - **验证场景**:
        - **刷新页面**: 验证 `bootstrapping` 状态能否阻挡业务请求，且最终恢复登录态。
        - **并发 401**: 验证 Network 面板中 `/refresh` 仅请求一次。
        - **权限被回收**: 用户停留在某页面，模拟后台回收该页面权限 -> 前端自动跳转 403。

## 关键代码注释策略
- 在 `src/auth/refresh.ts` 中解释为何使用单例 Promise (防止风暴)。
- 在 `src/permission/permissionChannel.ts` 中解释为何需要实时中断用户 (安全边界)。
- 在 `src/auth/authStore.ts` 中解释为何 Access Token 不存 LocalStorage (安全预期)。
