# 布局样式文档

## 概述
布局系统已全面现代化，通过 SCSS 变量使用统一的**设计变量 (Design Token)** 系统。这确保了视觉风格的一致性、代码的可维护性以及主题定制的便捷性。

## 目录结构
- `src/layout/index.vue`: 主布局容器（侧边栏 + 主内容区）。
- `src/layout/components/`:
  - `Sidebar/`: 支持嵌套路由的侧边导航菜单。
  - `Navbar.vue`: 顶部导航栏，包含面包屑导航和用户个人中心。
  - `TagsView/`: 基于标签页的历史导航组件（采用现代化的“胶囊”风格）。
  - `AppMain.vue`: 主内容区域包装器，包含页面切换过渡动画。

## 设计变量
所有样式变量均定义在 `@/styles/variables.module.scss` 文件中。

### 尺寸 (Dimensions)
- `$sideBarWidth`: `210px`（侧边栏展开宽度）
- `$sideBarWidthCollapsed`: `64px`（侧边栏折叠宽度）
- `$navbarHeight`: `60px`（顶部导航栏高度）
- `$tagsViewHeight`: `34px`（标签栏高度）

### 颜色 (Colors)
- **主色调**: `var(--el-color-primary)`（继承自 Element Plus 主题色）
- **菜单背景**: `#111827`（深海灰蓝，体现深邃感）
- **菜单文字**: `#9ca3af`（半透明灰白）
- **菜单激活文字**: `#ffffff`（纯白）
- **菜单悬停**: `rgba(255, 255, 255, 0.05)`（微弱的白色透明度叠加）
- **背景色**: `#F3F4F6`（主内容区浅灰色，减少视觉干扰）

## 组件样式

### 侧边栏 (Sidebar)
- **风格**: 深色主题垂直菜单，强调秩序感。
- **交互**:
  - **悬停**: 背景色叠加微弱的白色透明层。
  - **激活**: 左侧显示 3px 宽的品牌色垂直线条，文字变为纯白，背景微亮。
- **实现**: 基于 `el-menu` 组件，在 `Sidebar/index.vue` 中进行了深度样式覆盖。

### 顶部导航栏 (Navbar)
- **风格**: 纯白背景，底部添加 1px 边框 (`#e5e7eb`)，移除阴影以增强扁平化和严谨感。
- **元素**:
  - **面包屑**: 采用现代排版，使用箭头 (`>`) 作为分隔符，当前路径文字加粗。
  - **右侧菜单**: Flex 布局，图标及头像区域添加了细腻的悬停交互效果。

### 标签页导航 (TagsView)
- **风格**: 追求 Chrome 浏览器式的流畅感，采用无边框的“胶囊”样式。
- **交互**:
  - **激活态**: 纯白背景，带有微弱的品牌色底部投影，文字加粗并使用主色调。
  - **未激活**: 背景透明，文字中灰，悬停时背景变为浅灰 (`#f3f4f6`)。
  - **关闭图标**: 默认隐藏，仅在鼠标悬停于标签上时显示，保持界面极简。

### 主内容区 (AppMain)
- **布局**: 动态计算最小高度: `100vh - $navbarHeight - $tagsViewHeight`。
- **过渡**: 页面切换采用 `fade-transform`（透明度渐变 + 位移）动画，统一时长 `0.2s`，曲线 `cubic-bezier(0.4, 0, 0.2, 1)`。

## BEM 命名规范
- **Block (块)**: `.app-wrapper`, `.sidebar-container`, `.navbar`
- **Element (元素)**: `.sidebar-container__logo`, `.tags-view-item` (隐含结构)
- **Modifier (修饰符)**: `.mobile`, `.hideSidebar`, `.is-active`

## 浏览器支持
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- **注意**: 项目使用了 `calc()` 和 CSS 变量 (Custom Properties)，所有现代主流浏览器均完全支持。

## 性能优化
- **CSS**: 使用 `scoped` 属性防止样式污染。利用 SCSS 变量进行预编译优化。
- **渲染**: 优化过渡动画，仅对 `transform` 和 `opacity` 属性进行动画处理，避免触发重排 (Reflow)。
