<!--
  HomeView.vue

  系统独立首页组件

  使用说明：
  1. 该组件作为系统的次级入口或独立展示页，通过 '/home' 路由访问。
  2. 不依赖 Dashboard 组件逻辑，拥有独立的布局和样式。
  3. 包含欢迎语、功能概览和快捷导航。

  注意事项：
  - 请确保 Layout 组件正确包裹此视图以保持整体风格一致（如需全屏显示可调整路由配置）。
  - 数据目前为 Mock 数据，实际对接 API 时请替换 script 部分的逻辑。
-->

<template>
  <div class="home-container">
    <!-- 欢迎标题区域 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来，管理员</h1>
      <p class="welcome-subtitle">今天是 {{ currentDate }}，系统运行平稳。</p>
    </div>

    <!-- 主要内容展示区 -->
    <div class="main-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>系统状态</span>
                <el-tag type="success">正常</el-tag>
              </div>
            </template>
            <div class="card-body">
              <p>CPU 使用率: 12%</p>
              <p>内存使用率: 34%</p>
              <p>服务在线时长: 5天 12小时</p>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>待办事项</span>
                <el-tag type="warning">3</el-tag>
              </div>
            </template>
            <div class="card-body">
              <ul class="todo-list">
                <li>审核新用户注册</li>
                <li>更新系统配置</li>
                <li>查看月度报表</li>
              </ul>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>公告通知</span>
                <el-tag>新</el-tag>
              </div>
            </template>
            <div class="card-body">
              <p>本周五系统将进行例行维护，请提前做好准备。</p>
              <small class="date">2025-12-20</small>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 必要的导航链接 -->
    <div class="nav-section">
      <el-divider content-position="left">快捷导航</el-divider>
      <div class="quick-links">
        <el-button type="primary" plain @click="$router.push('/dashboard')">
          <el-icon><Odometer /></el-icon> 控制台
        </el-button>
        <el-button type="success" plain @click="$router.push('/user/profile')">
          <el-icon><User /></el-icon> 个人中心
        </el-button>
        <el-button type="warning" plain @click="$router.push('/system/settings')">
          <el-icon><Setting /></el-icon> 系统设置
        </el-button>
        <el-button type="info" plain @click="handleDocs">
          <el-icon><Document /></el-icon> 查看文档
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Odometer, User, Setting, Document } from '@element-plus/icons-vue';

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 处理文档点击
const handleDocs = () => {
  window.open('https://vuejs.org', '_blank');
};
</script>

<style scoped lang="scss">
@use '@/styles/variables.module.scss' as *;

.home-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);

  .welcome-section {
    margin-bottom: 32px;
    text-align: center;

    .welcome-title {
      font-size: 2.5rem;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .welcome-subtitle {
      font-size: 1.1rem;
      color: var(--el-text-color-secondary);
    }
  }

  .main-content {
    margin-bottom: 32px;

    .info-card {
      margin-bottom: 20px;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }

      .card-body {
        min-height: 100px;
        color: var(--el-text-color-regular);

        p {
          margin: 8px 0;
          line-height: 1.6;
        }

        .todo-list {
          padding-left: 20px;
          margin: 0;

          li {
            margin-bottom: 8px;
          }
        }

        .date {
          display: block;
          margin-top: 10px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .nav-section {
    .quick-links {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-top: 20px;

      .el-button {
        padding: 20px 30px;
        font-size: 1.1rem;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .home-container {
    padding: 16px;

    .welcome-section {
      .welcome-title {
        font-size: 1.8rem;
      }
    }

    .nav-section .quick-links .el-button {
      width: 100%;
      margin: 0;
    }
  }
}
</style>
