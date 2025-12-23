<template>
  <div class="dashboard-container">
    <!-- 1. 欢迎/状态区 (Context Awareness & Efficient) -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ timeGreeting }}, {{ user?.username || 'Admin' }}</h1>
        <p class="welcome-subtitle">
          系统运行正常 | 安全等级: <span class="security-level">高</span> |
          <span class="status-item">
            <el-icon class="status-icon" :class="wsStatus"><Connection /></el-icon>
            实时连接: {{ wsStatus === 'connected' ? '在线' : '离线' }}
          </span>
        </p>
      </div>
      <div class="header-actions">
        <el-tooltip content="系统当前处于安全保护模式" placement="bottom">
          <el-tag type="success" effect="dark" round class="security-badge">
           安全防护开启
          </el-tag>
        </el-tooltip>
      </div>
    </div>

    <!-- 2. 核心指标卡片 (Efficient & Clear) -->
    <el-row :gutter="20" class="metric-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="(metric, index) in metrics" :key="index">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-icon" :class="metric.type">
            <el-icon><component :is="metric.icon" /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">
              <span class="number">{{ metric.value }}</span>
              <span class="unit" v-if="metric.unit">{{ metric.unit }}</span>
            </div>
            <div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
              <el-icon><component :is="metric.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
              {{ Math.abs(metric.trend) }}% 较昨日
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <!-- 3. 左侧：智能推荐与快捷操作 (Smart & Intelligent) -->
      <el-col :xs="24" :lg="16">
        <!-- 智能建议 -->
        <el-card shadow="hover" class="smart-card mb-20">
          <template #header>
            <div class="card-header">
              <span class="title-with-icon">
                <el-icon class="text-primary"><Cpu /></el-icon> 智能诊断与建议
              </span>
              <el-tag size="small" effect="plain">AI 引擎运行中</el-tag>
            </div>
          </template>
          <div class="suggestions-list">
            <div class="suggestion-item" v-for="item in suggestions" :key="item.id">
              <div class="suggestion-icon" :class="item.type">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="suggestion-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.desc }}</p>
              </div>
              <el-button type="primary" link size="small">立即处理</el-button>
            </div>
          </div>
        </el-card>

        <!-- 权限验证区 (Functional) -->
        <el-card shadow="hover" class="action-card mb-20">
          <template #header>
            <div class="card-header">
              <span class="title-with-icon">
                <el-icon class="text-warning"><Key /></el-icon> 权限验证沙箱
              </span>
            </div>
          </template>
          <div class="permission-grid">
            <div class="permission-group">
              <span class="group-label">用户域</span>
              <div class="group-actions">
                <Permission code="user:view"><el-button plain size="small">查看</el-button></Permission>
                <Permission code="user:add"><el-button type="primary" plain size="small">新增</el-button></Permission>
                <Permission code="user:edit"><el-button type="success" plain size="small">编辑</el-button></Permission>
                <Permission code="user:delete"><el-button type="danger" plain size="small">删除</el-button></Permission>
              </div>
            </div>
            <el-divider direction="vertical" class="hidden-xs-only" />
            <div class="permission-group">
              <span class="group-label">角色域</span>
              <div class="group-actions">
                <Permission code="role:view"><el-button plain size="small">查看</el-button></Permission>
                <Permission code="role:edit"><el-button type="success" plain size="small">编辑</el-button></Permission>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 4. 右侧：安全审计与开发者工具 (Safe & Reliable + Authoritative) -->
      <el-col :xs="24" :lg="8">
        <!-- 用户信息 -->
        <el-card shadow="hover" class="profile-card mb-20">
          <div class="user-info-compact">
            <div class="avatar-circle">{{ user?.username?.charAt(0).toUpperCase() }}</div>
            <div class="info-text">
              <div class="name">{{ user?.username }}</div>
              <div class="role-tags">
                <el-tag v-for="role in user?.roles" :key="role.id" size="small" effect="light">{{ role.name }}</el-tag>
              </div>
            </div>
          </div>
          <div class="security-status-list">
             <div class="status-row">
               <span>Token 状态</span>
               <span class="status-val success" v-if="accessToken"><div class="dot"></div> 活跃</span>
               <span class="status-val danger" v-else><div class="dot"></div> 丢失</span>
             </div>
             <div class="status-row">
               <span>上次登录</span>
               <span class="status-val text-gray">刚刚</span>
             </div>
          </div>
        </el-card>

        <!-- 系统诊断工具 -->
        <el-card shadow="hover" class="dev-tools-card">
          <template #header>
            <div class="card-header">
              <span class="title-with-icon">
                <el-icon><Tools /></el-icon> 开发者诊断
              </span>
            </div>
          </template>
          <div class="tool-actions">
             <el-button class="tool-btn" @click="testConcurrency">
               <el-icon><Timer /></el-icon>
               <span>并发测试</span>
             </el-button>
             <el-button class="tool-btn" @click="updateRolePermissions">
               <el-icon><Refresh /></el-icon>
               <span>变更权限</span>
             </el-button>
             <el-button class="tool-btn" @click="assignRoleMenus">
               <el-icon><Menu /></el-icon>
               <span>分配菜单</span>
             </el-button>
             <el-button class="tool-btn danger" @click="handleLogout">
               <el-icon><SwitchButton /></el-icon>
               <span>安全注销</span>
             </el-button>
          </div>

          <!-- 日志面板 -->
          <div class="mini-console" v-if="logs.length">
             <div class="console-header">
               <span>控制台输出</span>
               <el-icon class="clear-btn" @click="logs = []"><Delete /></el-icon>
             </div>
             <div class="console-body">
               <div v-for="(log, i) in logs" :key="i" class="log-line">
                 <span class="time">{{ log?.split(']')[0]?.replace('[', '') }}</span>
                 <span class="msg">{{ log?.split(']')[1] }}</span>
               </div>
             </div>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { logout } from '../auth/authService';
import Permission from '../components/Permission.vue';
import apiClient from '../axios';
import { wsStatus, closePermissionChannel } from '../permission/permissionChannel';
import {
  Connection, Key, Cpu,
  Timer, Refresh, SwitchButton, Tools, Delete
} from '@element-plus/icons-vue';

// --- Stores & State ---
const authStore = useAuthStore();
const user = computed(() => authStore.userInfo);
const accessToken = computed(() => authStore.accessToken);
const logs = ref<string[]>([]);

// --- Mock Data for UI Beautification ---
const metrics = ref([
  { label: '系统负载', value: '24', unit: '%', trend: -12, icon: 'Cpu', type: 'primary' },
  { label: '活跃会话', value: '1,284', unit: '', trend: 5.4, icon: 'Monitor', type: 'success' },
  { label: 'API 延迟', value: '45', unit: 'ms', trend: -2.1, icon: 'TrendCharts', type: 'warning' },
  { label: '安全拦截', value: '3', unit: '次', trend: 0, icon: 'Eleme', type: 'danger' }
]);

const suggestions = ref([
  { id: 1, title: 'Token 刷新策略优化', desc: '检测到频繁的 Token 刷新请求，建议检查客户端时钟同步。', type: 'warning', icon: 'Warning' },
  { id: 2, title: '权限配置安全', desc: '所有角色权限配置符合最小权限原则。', type: 'success', icon: 'CircleCheck' }
]);

const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// --- Functional Logic (Preserved) ---
const log = (msg: string) => logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);

watch(wsStatus, (newStatus) => {
  log(`WebSocket 状态变更: ${newStatus}`);
});

const assignRoleMenus = async () => {
    log('--- 触发分配菜单测试 ---');
    try {
        // 模拟分配给 ID 为 1 的角色，分配菜单 ID [1, 2, 3]
        const roleId = 2;
        const menuIds = [6, 7, 8,9,10,11];
        await apiClient.put(`/roles/${roleId}/menus`, { menuIds });
        log('✅ 菜单分配成功');
    } catch (e) {
        log(`❌ 分配失败: ${e}`);
    }
}

const handleLogout = () => {
  closePermissionChannel();
  logout();
};

const testConcurrency = async () => {
  logs.value = [];
  log('--- 开始请求队列测试 ---');
  authStore.setBootstrapping();
  log('2. 发起 3 个并发请求...');

  apiClient.get('/users').then(() => log('✅ User Service 响应')).catch(e => log(`❌ 失败: ${e.message}`));
  apiClient.get('/roles').then(() => log('✅ Role Service 响应')).catch(e => log(`❌ 失败: ${e.message}`));
  apiClient.get('/products').then(() => log('✅ Product Service 响应')).catch(e => log(`❌ 失败: ${e.message}`));

  setTimeout(() => {
      log('4. 模拟 Token 恢复...');
      authStore.setAccessToken('restored_token_' + Date.now());
  }, 2000);
};

const updateRolePermissions = async () => {
    log('--- 触发权限变更测试 ---');
    try {
        await apiClient.put(`/roles/2/permissions`, { permissionIds: [1, 2, 3] });
        log('✅ 变更指令已发送');
    } catch (e) {
        log(`❌ 更新失败: ${e}`);
    }
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.module.scss' as *;

.dashboard-container {
  padding: 24px;
}

/* 1. Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  .welcome-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2d3d;
    margin: 0 0 8px 0;
  }

  .welcome-subtitle {
    font-size: 14px;
    color: #606266;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    .security-level {
      color: var(--el-color-success);
      font-weight: 600;
    }

    .status-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      .status-icon {
        font-size: 12px;
        &.connected { color: var(--el-color-success); }
        &.connecting { color: var(--el-color-warning); }
        &.disconnected { color: var(--el-color-info); }
      }
    }
  }
}

/* 2. Metric Cards */
.metric-cards {
  margin-bottom: 24px;

  .metric-card {
    border: none;
    border-radius: 12px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: flex-start;
      padding: 20px;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 16px;
      flex-shrink: 0;

      &.primary { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
      &.success { background: var(--el-color-success-light-9); color: var(--el-color-success); }
      &.warning { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
      &.danger { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
    }

    .metric-info {
      flex-grow: 1;

      .metric-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 4px;
      }

      .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 4px;

        .unit {
          font-size: 14px;
          color: #909399;
          margin-left: 4px;
          font-weight: normal;
        }
      }

      .metric-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;

        &.up { color: var(--el-color-danger); } /* Stock market style: Red is up/hot, Green is down/safe? Or standard? Let's use standard green for good, red for bad. But trend up usually green? In China red is up. Let's stick to standard: Green Up. Wait, standard western is Green Up. */
        /* Actually for metrics like 'Latency', up is bad. Let's keep it simple. */
        &.up { color: var(--el-color-success); }
        &.down { color: var(--el-color-danger); }
      }
    }
  }
}

/* Common Card Styles */
.el-card {
  border: none;
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }
  }
}

/* 3. Smart Suggestions */
.suggestions-list {
  .suggestion-item {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    background: #f9fafc;
    border-radius: 8px;
    margin-bottom: 12px;

    .suggestion-icon {
      margin-right: 12px;
      font-size: 20px;
      padding-top: 2px;

      &.warning { color: var(--el-color-warning); }
      &.success { color: var(--el-color-success); }
    }

    .suggestion-content {
      flex-grow: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }
}

/* Permission Grid */
.permission-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .permission-group {
    flex: 1;
    min-width: 200px;

    .group-label {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .group-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

/* 4. Profile & Tools */
.user-info-compact {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .avatar-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    margin-right: 16px;
  }

  .info-text {
    .name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }
  }
}

.security-status-list {
  background: #f9fafc;
  border-radius: 8px;
  padding: 12px;

  .status-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 8px;
    color: #606266;

    &:last-child { margin-bottom: 0; }

    .status-val {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      &.success { color: var(--el-color-success); }
      &.danger { color: var(--el-color-danger); }
      &.text-gray { color: #909399; }
    }
  }
}

.tool-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  .tool-btn {
    margin: 0 !important;
    height: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &.danger {
      grid-column: span 2;
      border-color: var(--el-color-danger-light-8);
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);

      &:hover {
        background: var(--el-color-danger);
        color: white;
      }
    }
  }
}

.mini-console {
  background: #1f2d3d;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;

  .console-header {
    display: flex;
    justify-content: space-between;
    color: #909399;
    margin-bottom: 8px;
    font-size: 11px;
    text-transform: uppercase;

    .clear-btn {
      cursor: pointer;
      &:hover { color: white; }
    }
  }

  .console-body {
    max-height: 150px;
    overflow-y: auto;

    /* Scrollbar for console */
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: #4a5a6a; border-radius: 2px; }

    .log-line {
      margin-bottom: 4px;
      line-height: 1.4;

      .time { color: #667eea; margin-right: 8px; }
      .msg { color: #e6e6e6; }
    }
  }
}

/* Utilities */
.mb-20 { margin-bottom: 20px; }
.text-primary { color: var(--el-color-primary); }
.text-warning { color: var(--el-color-warning); }
.text-success { color: var(--el-color-success); }
</style>