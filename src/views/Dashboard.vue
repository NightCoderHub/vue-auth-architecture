<template>
  <div class="dashboard-container">
    <!-- 1. 欢迎/状态区 (Context Awareness & Efficient) -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ timeGreeting }}, {{ user?.username || 'Admin' }}</h1>
        <p class="welcome-subtitle">
          系统运行正常 | 安全等级: <span class="security-level">高</span> |
          <span class="status-item">
            <Icon icon="icon-park-outline:connection" class="status-icon" :class="wsStatus === 'connected' ? 'connected' : 'disconnected'" />
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
            <Icon :icon="metric.icon" />
          </div>
          <div class="metric-info">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">
              <span class="number">{{ metric.value }}</span>
              <span class="unit" v-if="metric.unit">{{ metric.unit }}</span>
            </div>
            <div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
              <Icon :icon="metric.trend > 0 ? 'icon-park-outline:arrow-up' : 'icon-park-outline:arrow-down'" />
              {{ Math.abs(metric.trend) }}% 较昨日
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="main-content">
      <!-- 3. 左侧：智能推荐与快捷操作 (Smart & Intelligent) -->
      <el-col :xs="24" :lg="16">
        <!-- 智能建议 -->
        <el-card shadow="hover" class="smart-card">
          <template #header>
            <div class="card-header">
              <span class="title-with-icon">
                <Icon icon="icon-park-outline:cpu" class="text-primary" /> 智能诊断与建议
              </span>
              <el-tag size="small" effect="plain">AI 引擎运行中</el-tag>
            </div>
          </template>
          <div class="suggestions-list">
            <div class="suggestion-item" v-for="item in suggestions" :key="item.id">
              <div class="suggestion-icon" :class="item.type">
                <Icon :icon="item.icon" />
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
        <el-card shadow="hover" class="action-card">
          <template #header>
            <div class="card-header">
              <span class="title-with-icon">
                <Icon icon="icon-park-outline:key" class="text-warning" /> 权限验证沙箱
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
        <el-card shadow="hover" class="profile-card">
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
                <Icon icon="icon-park-outline:tool" /> 开发者诊断
              </span>
            </div>
          </template>
          <div class="tool-actions">
             <el-button class="tool-btn" @click="testConcurrency">
               <Icon icon="icon-park-outline:time" />
               <span>并发测试</span>
             </el-button>
             <el-button class="tool-btn" @click="updateRolePermissions">
               <Icon icon="icon-park-outline:refresh" />
               <span>变更权限</span>
             </el-button>
             <el-button class="tool-btn" @click="assignRoleMenus">
               <Icon icon="icon-park-outline:menu-fold" />
               <span>分配菜单</span>
             </el-button>
             <el-button class="tool-btn danger" @click="handleLogout">
               <Icon icon="icon-park-outline:switch-button" />
               <span>安全注销</span>
             </el-button>
          </div>

          <!-- 日志面板 -->
          <div class="mini-console" v-if="logs.length">
             <div class="console-header">
               <span>控制台输出</span>
               <Icon icon="icon-park-outline:delete" class="clear-btn" @click="logs = []" />
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
/**
 * @description: 仪表盘组件
 * 展示系统核心指标、快捷操作入口及开发者诊断工具
 */
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { logout } from '../auth/authService';
import Permission from '../components/Permission.vue';
import apiClient from '../axios';
import { wsStatus, closePermissionChannel } from '../permission/permissionChannel';

const authStore = useAuthStore();
const user = computed(() => authStore.userInfo);
const accessToken = computed(() => authStore.accessToken);
const logs = ref<string[]>([]);

const metrics = ref([
  { label: '系统负载', value: '24', unit: '%', trend: -12, icon: 'icon-park-outline:cpu', type: 'primary' },
  { label: '活跃会话', value: '1,284', unit: '', trend: 5.4, icon: 'icon-park-outline:monitor', type: 'success' },
  { label: 'API 延迟', value: '45', unit: 'ms', trend: -2.1, icon: 'icon-park-outline:chart-line', type: 'warning' },
  { label: '安全拦截', value: '3', unit: '次', trend: 0, icon: 'icon-park-outline:protect', type: 'danger' }
]);

const suggestions = ref([
  { id: 1, title: 'Token 刷新策略优化', desc: '检测到频繁的 Token 刷新请求，建议检查客户端时钟同步。', type: 'warning', icon: 'icon-park-outline:attention' },
  { id: 2, title: '权限配置安全', desc: '所有角色权限配置符合最小权限原则。', type: 'success', icon: 'icon-park-outline:check-one' }
]);

const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

const log = (msg: string) => logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);

watch(wsStatus, (newStatus) => {
  log(`WebSocket 状态变更: ${newStatus}`);
});

const assignRoleMenus = async () => {
    log('--- 触发分配菜单测试 ---');
    try {
        // 模拟分配给 ID 为 1 的角色，分配菜单 ID [1, 2, 3]
        const roleId = 2;
        const menuIds = [5,6, 7, 8,9,10,11];
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
@use 'sass:color';
@use '@/styles/variables.scss' as *;

.dashboard-container {
  padding: 24px;
  background-color: transparent;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px 32px;
  border-radius: var(--app-card-radius);
  box-shadow: 0 1px 2px rgba(0, 21, 41, 0.05);

  .welcome-content {
    .welcome-title {
      font-size: 24px;
      font-weight: 700;
      color: $menuText;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .welcome-subtitle {
      font-size: 14px;
      color: $info;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 16px;

      .status-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .status-icon {
            font-size: 16px;
            &.connected { color: var(--el-color-success); }
            &.disconnected { color: var(--el-color-danger); }
        }
      }
    }
  }
}

.metric-cards {
  margin-bottom: 24px;

  .metric-card {
    border: none;
    border-radius: var(--app-card-radius);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    height: 100%;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
        padding: 20px 24px;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;

      &.primary { background: rgba($primary, 0.1); color: $primary; }
      &.success { background: var(--el-color-success-light-9); color: var(--el-color-success); }
      &.warning { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
      &.danger { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
    }

    .metric-info {
      .metric-label {
        font-size: 14px;
        color: $info;
        margin-bottom: 8px;
      }

      .metric-value {
        display: flex;
        align-items: baseline;
        margin-bottom: 8px;

        .number {
          font-size: 28px;
          font-weight: 700;
          color: $menuText;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .unit {
          font-size: 14px;
          color: $info;
          margin-left: 4px;
        }
      }

      .metric-trend {
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.up { color: var(--el-color-success); }
        &.down { color: var(--el-color-danger); }
      }
    }
  }
}

.smart-card, .action-card, .profile-card, .dev-tools-card {
  border: none;
  border-radius: var(--app-card-radius);
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 21, 41, 0.05);

  :deep(.el-card__header) {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 16px 24px;
  }

  :deep(.el-card__body) {
      padding: 24px;
    }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: $menuText;
  }
}

.suggestions-list {
  .suggestion-item {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    margin-bottom: 12px;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    .suggestion-icon {
      margin-right: 16px;
      font-size: 20px;
      margin-top: 2px;
      &.warning { color: var(--el-color-warning); }
      &.success { color: var(--el-color-success); }
    }

    .suggestion-content {
      flex: 1;
      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: $menuText;
        font-weight: 600;
      }
      p {
        margin: 0;
        font-size: 13px;
        color: $info;
        line-height: 1.5;
      }
    }
  }
}

.permission-grid {
    display: flex;
    align-items: flex-start;

    .permission-group {
        flex: 1;
        padding: 0 12px;

        .group-label {
            display: block;
            font-size: 12px;
            color: $info;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .group-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }
}

.user-info-compact {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .avatar-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, color.adjust($primary, $lightness: 20%));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    margin-right: 16px;
    box-shadow: 0 4px 12px rgba($primary, 0.3);
  }

  .info-text {
    .name {
      font-size: 18px;
      font-weight: 600;
      color: $menuText;
      margin-bottom: 6px;
    }
    .role-tags {
        display: flex;
        gap: 4px;
    }
  }
}

.security-status-list {
  .status-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding: 10px 0;
    border-bottom: 1px dashed var(--el-border-color-lighter);

    &:last-child { border-bottom: none; }

    span:first-child { color: $info; }

    .status-val {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.success { color: var(--el-color-success); .dot { background: var(--el-color-success); } }
      &.danger { color: var(--el-color-danger); .dot { background: var(--el-color-danger); } }
      &.text-gray { color: $info; }
    }
  }
}

.tool-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  .tool-btn {
    margin: 0 !important;
    height: auto;
    padding: 12px;
    justify-content: flex-start;
    border-radius: 8px;

    span { margin-left: 6px; }
  }
}

.mini-console {
  background: #282c34;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);

  .console-header {
    display: flex;
    justify-content: space-between;
    color: #abb2bf;
    margin-bottom: 12px;
    border-bottom: 1px solid #3e4451;
    padding-bottom: 8px;

    .clear-btn {
        cursor: pointer;
        transition: color 0.2s;
        &:hover { color: #fff; }
    }
  }

  .console-body {
    max-height: 150px;
    overflow-y: auto;

    .log-line {
      margin-bottom: 6px;
      line-height: 1.4;
      .time { color: #5c6370; margin-right: 8px; user-select: none; }
      .msg { color: #98c379; }
    }
  }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 16px;
    }

    .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
            width: 100%;
            display: flex;
            justify-content: flex-start;
        }
    }

    .metric-cards {
        margin-bottom: 16px;
        .el-col {
            margin-bottom: 16px;
        }
    }
}
</style>
