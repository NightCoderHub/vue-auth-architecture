# vue-auth-architecture

> 一个以 **稳定性、安全性、可解释性** 为核心的 Vue 3 前端鉴权与权限架构示例
> 适用于真实中后台系统，也可作为 **前端面试的完整讲解项目**

---

## ✨ 项目目标

本项目不是为了演示“如何登录”，
而是聚焦 **真实生产环境中的鉴权与权限难题**：

* 页面刷新导致登录态丢失
* Access Token 过期与并发 401
* Refresh Token 风暴
* 权限变更后前端状态滞后
* 登录态与权限状态不一致带来的安全风险

👉 **核心目标**：
在不牺牲安全性的前提下，
让登录态和权限在复杂场景下 **稳定、可控、可兜底**。

---

## 🧩 技术栈

* **Vue 3**（Composition API）
* **TypeScript**
* **Pinia**（状态管理）
* **Vue Router**
* **Axios**
* **Vite**
* **Element Plus**

---

## 🤝 相关项目

* <a href="https://github.com/NightCoderHub/node-api-server" target="_blank">Node.js API Server (配套后端)</a>
    > 提供 HttpOnly Cookie 管理、双 Token 刷新及 WebSocket 权限实时推送接口，与前端共同构成完整的鉴权体系。

---

## 🔐 整体架构设计概览

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ App Bootstrap 初始化阶段 │
│ - refresh 登录态恢复    │
│ - 阻塞渲染               │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 鉴权状态机（Auth FSM）  │
│ idle / bootstrapping    │
│ authenticated / expired │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ Axios 鉴权请求层        │
│ - Token 注入            │
│ - 并发 401 控制         │
│ - refresh 队列          │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 权限系统（Permission）  │
│ - 菜单 / 路由 / 权限点  │
│ - 权限实时生效          │
└─────────────────────────┘
```

---

## 🔑 Token 设计（Access + Refresh）

### Access Token

* 仅存储在 **内存（Pinia）**
* 页面刷新后失效是 **预期行为**
* 用于高频接口访问

### Refresh Token

* 由后端通过 **HttpOnly Cookie** 管理
* 前端不可读
* 用于无感恢复 Access Token

> ⚠️ 前端不是最终安全边界，
> 所有接口仍需后端校验权限。

---

## 📚 数据字典系统 (Data Dictionary System)

> **解耦、复用、一致性** 是中后台数据管理的核心目标。本项目实现了一套大厂级的“字典驱动开发”方案，彻底告别硬编码。

### 核心特性
* **统一管理**：所有字典逻辑聚合在 `src/dict` 目录下。
* **按需加载 & 缓存**：同一字典类型仅在首次使用时请求，后续直接读取 Pinia 缓存。
* **非阻塞预加载**：在应用启动/登录成功后并发加载常用字典，提升首屏渲染速度。
* **类型安全**：字典值在 API 层统一为 `string`，但在组件层支持通过 `value-type` 自动转换（如转为 `number`）。

### 架构设计
1. **TypeScript Enum (`dictTypes.ts`)**: 定义字典类型的唯一来源。
2. **Pinia Store (`dictStore.ts`)**: 处理全局缓存与并发请求复用（防止同一时刻重复请求）。
3. **Global Components**: `DictTag`（展示态）与 `DictSelect`（编辑态）。
4. **Composition Hook (`useDict.ts`)**: 支持并发加载多个字典的响应式 Hook。

### 使用示例

#### 1. 展示组件 `DictTag`
自动翻译 `value` 并匹配 Element Plus 标签样式。
```html
<dict-tag type="user_status" :value="row.status" />
```

#### 2. 选择器组件 `DictSelect`
支持 Select、Radio、Checkbox 模式，处理类型转换。
```html
<!-- 基础用法 -->
<dict-select v-model="form.status" dict-type="user_status" />

<!-- 自动类型转换：字典源是 "1"，表单需要数字 1 -->
<dict-select v-model="form.status" dict-type="user_status" value-type="number" />

<!-- 排除特定选项 -->
<dict-select v-model="form.gender" dict-type="gender" :exclude="['0']" render-type="radio" />
```

#### 3. 编程式使用 (Hook & Utils)
```typescript
import { useDict, dictUtils } from '@/dict';

// Hook 方式 (Composition API)
const { user_status } = useDict('user_status');

// 工具函数 (常用于 JS 逻辑或全局挂载)
const label = dictUtils.label('user_status', '1'); // "正常"
```

---

## 🚀 应用初始化（Bootstrap 阶段）

### 为什么需要初始化阶段？

如果页面一加载就直接渲染并发请求：

* Token 尚未恢复
* 接口会提前 401
* 页面可能误跳登录页

这是**典型的工程缺陷**。

---

### 本项目的做法

* 应用启动时：

  * 自动调用 `/auth/refresh`
  * 尝试恢复 Access Token
* 在初始化完成前：

  * **不渲染业务页面**
  * **不发送业务请求**

👉 避免页面闪烁与误判登录态。

---

## 🔁 Axios 鉴权与并发控制

### 设计目标

* 自动注入 Access Token
* 并发 401 场景下：

  * **只允许一个 refresh 请求**
  * 其余请求进入等待队列
* 避免：

  * refresh 风暴
  * 后端被瞬时打满

---

### 401 / 403 区分原则

* **401**：登录态失效
  → 触发 refresh 流程
* **403**：权限不足
  → 不触发 refresh，进入权限兜底

这是一个**非常重要的安全边界**。

---

## 🧠 登录态状态机（Auth State Machine）

本项目避免使用简单的 boolean 判断登录状态，而是引入 **显式状态机**：

```ts
idle
→ bootstrapping
→ authenticated
→ expired
→ logged_out
```

### 好处

* 所有行为（请求 / 路由 / 权限刷新）有明确依据
* 不会出现“半登录态”
* 异常路径 **可预测、可解释**

---

## 🧩 权限模型设计（核心亮点）

### 三层权限模型

1. **菜单权限**

   * 控制可见性
2. **路由权限**

   * 控制可访问性
3. **权限点**

   * 控制按钮 / 操作

权限数据统一来源于接口。

---

## ⚠️ 权限变更如何「实时生效」（重点）

> **这是本项目的核心亮点之一**

### 为什么要实时生效？

* 权限变更是一个 **安全事件**
* 不能依赖用户刷新页面
* 权限滞后会带来越权风险

---

### 本项目的处理方式

当后端权限发生变更时（基于 WebSocket 实时推送）：

1. 前端接收最新权限数据（直接应用推送数据，无需额外 API 请求）
2. 动态重建路由表
3. 同步更新菜单与权限点
4. 当前页面重新校验访问权限

如果用户正在访问无权限页面：

* **立即中断访问**
* 进入 403 或安全兜底页面

> 这是**预期行为**，
> 目的是降低线上安全风险，而不是优化体验。

---

## 🛣️ 路由与守卫策略

* 路由守卫中：

  * 等待鉴权初始化完成
  * 不直接通过 token 是否存在判断
* 访问规则：

  * 未登录 → 登录页
  * 已登录但无权限 → 403 页面
* 权限刷新后：

  * 动态更新路由
  * 重新校验当前路径

---

## 🛣️ 路径治理 (Path Governance)

> **Trailing Slash 不是小问题，而是架构问题**

本项目实施了严格的路径治理方案，确保全系统路径格式一致性。

### 核心规则

1.  **无尾随斜杠 (No Trailing Slash)**：除根路径 `/` 外，所有路径严禁以 `/` 结尾。
2.  **自动修正**：系统在路由入口自动拦截并修正不规范路径。
3.  **严格模式**：Vue Router 启用 `strict: true`，精确区分 `/path` 与 `/path/`。

### 架构设计

```text
User Input / API
      │
      ▼
[Path Governance Layer] (src/utils/path-governance.ts)
      │ normalizePath()
      ▼
┌───────────────────────┐
│ Vue Router (Strict)   │◄── Guard 自动重定向
├───────────────────────┤
│ Permission System     │◄── Key 匹配标准化
├───────────────────────┤
│ Menu / Breadcrumb     │◄── 高亮匹配标准化
└───────────────────────┘
```

### 为什么这样做？

*   **权限安全**：避免因 `/admin/user` 和 `/admin/user/` 被识别为不同 Key 而导致权限失效。
*   **动态路由**：确保后端下发的路由与前端注册的路由严格一致，防止 404。
*   **SEO 与体验**：统一 URL 格式，避免重复内容和不必要的跳转。

---

## 🧯 兜底与稳定性设计

本项目明确考虑并处理以下风险场景：

* 并发 401 导致 refresh 风暴
* refresh 失败后的统一清理逻辑
* 权限刷新失败的安全降级
* 防止出现“半登录 / 半权限态”

所有异常路径：

* 行为可预测
* 状态可解释
* 不依赖用户手动操作

---

## 📁 项目结构说明

```
src/
├─ api/                    # API 接口定义
├─ assets/                 # 静态资源目录
├─ auth/                   # 认证模块：登录/Token刷新/状态管理
│  ├─ authService.ts       # 认证核心业务逻辑
│  ├─ authStore.ts         # 认证状态管理 (Pinia)
│  └─ refresh.ts           # Token 刷新机制与并发控制
├─ axios/                  # HTTP 请求配置
│  └─ index.ts             # Axios 实例与拦截器封装
├─ bootstrap/              # 应用引导程序
│  └─ index.ts             # 初始化逻辑：环境准备与会话恢复
├─ components/             # 公共组件
│  ├─ Dict/                # 数据字典组件 (DictTag, DictSelect)
│  └─ Permission.vue       # 权限控制组件
├─ composables/            # 通用组合式函数
├─ dict/                   # 数据字典核心模块
│  ├─ dictStore.ts         # 字典状态缓存
│  ├─ dictUtils.ts         # 字典标签/样式转换工具
│  ├─ preload.ts           # 字典预加载机制
│  └─ useDict.ts           # 字典消费 Hook
├─ layout/                 # 布局系统
│  ├─ components/          # 布局子组件 (Sidebar, Navbar, TagsView)
│  └─ index.vue            # 布局入口
├─ mocks/                  # MSW Mock 服务数据
├─ permission/             # 权限管理模块
│  ├─ permissionChannel.ts # WebSocket 实时权限同步
│  ├─ permissionStore.ts   # 权限数据管理
│  └─ routeBuilder.ts      # 动态路由构建器
├─ router/                 # 路由配置
│  ├─ guard.ts             # 全局路由守卫
│  └─ index.ts             # 路由实例与基础路由
├─ stores/                 # 全局状态管理 (App, TagsView等)
├─ styles/                 # 全局样式与变量 (SCSS)
├─ types/                  # TypeScript 类型定义
├─ utils/                  # 工具函数库
│  └─ path-governance.ts   # 路径治理工具
├─ views/                  # 业务页面视图
│  ├─ compliance/          # 复杂表单示例
│  ├─ system/              # 系统管理页面
│  ├─ Dashboard.vue        # 仪表盘
│  └─ Login.vue            # 登录页
├─ App.vue                 # 应用根组件
└─ main.ts                 # 应用入口文件
```
### 结构说明：

1.  **核心模块 (auth/ & permission/)**:
    *   `auth/` 专注于身份验证（你是谁），包含登录、Token 刷新和状态存储。
    *   `permission/` 专注于访问控制（你能做什么），包含动态路由构建、权限存储和实时权限同步通道。

2.  **基础设施 (axios/ & router/)**:
    *   `axios/index.ts` 集成了 Token 自动刷新和 401 处理逻辑。
    *   `router/guard.ts` 实现了路由级别的权限拦截和重定向。

3.  **启动流程 (bootstrap/ & main.ts)**:
    *   `main.ts` 调用 `bootstrap()`，确保在 Vue 应用挂载前，用户的认证状态和权限数据已经恢复并准备就绪。
---

## 🎯 项目适用场景

* 中后台系统
* 多角色、多权限业务
* 对稳定性和安全性要求较高的前端项目
* 前端架构 / 高级前端工程师面试展示

---

## 🧠 设计原则总结

* 页面刷新丢 Token 是 **预期行为**
* 权限变更是 **安全事件**
* 前端不是最终安全边界
* 稳定性优先于体验
* 所有异常必须可兜底、可解释

---

## 📌 最后说明

> 这个项目的价值不在于“功能是否完整”，
> 而在于 **是否能在复杂场景下保持系统可控**。

如果你能完整理解并讲清这套架构，
它足以支撑 **30 分钟以上的前端架构面试讨论**。

---

