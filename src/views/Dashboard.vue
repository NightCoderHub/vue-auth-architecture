<template>
  <div class="dashboard-container">
    <el-card>
      <template #header>
        <div class="header">
          <h2>Dashboard</h2>
          <div style="display: flex; gap: 10px;">
            <el-tag :type="wsStatus === 'connected' ? 'success' : (wsStatus === 'connecting' ? 'warning' : 'info')">
              WS: {{ wsStatus }}
            </el-tag>
            <el-tag :type="status === 'authenticated' ? 'success' : 'danger'">
              Auth: {{ status }}
            </el-tag>
          </div>
        </div>
      </template>
      <el-descriptions title="用户信息" border :column="1">
        <el-descriptions-item label="用户名">{{ user?.username }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-for="role in user?.roles" :key="role.id" :type="role.name === 'admin' ? 'danger' : 'primary'">
            {{ role.name }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="访问令牌">
          <el-tooltip :content="accessToken" placement="top">
            <span class="token-text">{{ accessToken ? accessToken.substring(0, 30) + '...' : 'None' }}</span>
          </el-tooltip>
          <span class="note">(仅在内存中存储)</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>权限控制演示 (指令/组件)</h3>
      <div class="demo-section">

        <Permission code="user:view">
          <el-button>查看用户 (需权限: user:view)</el-button>
        </Permission>

        <Permission code="user:add">
          <el-button type="primary">添加用户 (需权限: user:add)</el-button>
        </Permission>

        <Permission code="user:edit">
          <el-button type="success">编辑用户 (需权限: user:edit)</el-button>
        </Permission>

        <Permission code="user:delete">
          <el-button type="danger">删除用户 (需权限: user:delete)</el-button>
        </Permission>

        <Permission code="role:view">
          <el-button>查看角色 (需权限: role:view)</el-button>
        </Permission>

        <Permission code="role:add">
          <el-button type="primary" plain>添加角色 (需权限: role:add)</el-button>
        </Permission>

        <Permission code="role:edit">
          <el-button type="success" plain>编辑角色 (需权限: role:edit)</el-button>
        </Permission>

        <Permission code="role:delete">
          <el-button type="danger" plain>删除角色 (需权限: role:delete)</el-button>
        </Permission>

        <Permission code="super:delete">
           <el-button type="info">超级删除 (隐藏)</el-button>
        </Permission>
      </div>

      <el-divider />

      <h3>架构验证</h3>
      <div class="actions">
        <el-button @click="testConcurrency">
          测试请求队列 (模拟应用初始化或刷新)
        </el-button>
        <el-button type="primary" @click="updateRolePermissions">
          更新角色权限 (实时)
        </el-button>
        <el-button type="warning" @click="updateUserRole">
          修改用户角色 (实时)
        </el-button>

        <el-button type="danger" @click="handleLogout">注销</el-button>
      </div>

      <div class="logs" v-if="logs.length">
          <h4>日志:</h4>
          <p v-for="(log, i) in logs" :key="i">{{ log }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { logout } from '../auth/authService';
import Permission from '../components/Permission.vue';
import apiClient from '../axios';
import { wsStatus, closePermissionChannel } from '../permission/permissionChannel';

const authStore = useAuthStore();
const user = computed(() => authStore.userInfo);
const status = computed(() => authStore.status);
const accessToken = computed(() => authStore.accessToken);
const logs = ref<string[]>([]);

const log = (msg: string) => logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

// 监听 WebSocket 状态变化并记录日志
watch(wsStatus, (newStatus) => {
  log(`WebSocket 状态变更: ${newStatus}`);
});

const handleLogout = () => {
  closePermissionChannel(); // 确保注销时关闭连接
  logout();
};

const testConcurrency = async () => {
  logs.value = [];
  log('--- 开始请求队列测试 ---');
  log('1. 手动将状态设置为 "bootstrapping" 以模拟应用初始化或刷新...');
  authStore.setBootstrapping();

  log('2. 发送 3 个并行请求...');

  // 这些请求应该等待直到我们恢复 Token
  apiClient.get('/users').then(() => log('✅ 请求 1 已完成'));
  apiClient.get('/roles').then(() => log('✅ 请求 2 已完成'));
  apiClient.get('/products').then(() => log('✅ 请求 3 已完成'));

  log('3. 请求现在正在队列中挂起 (检查 Network/Console)');

  setTimeout(() => {
      log('4. 模拟刷新成功 (状态 -> 已认证)...');
      authStore.setAccessToken('restored_token_' + Date.now());
      // 请求现在应该已解决
  }, 3000);
};


const updateRolePermissions = async () => {
    log('--- 更新角色权限测试 ---');
    // 我们要更新 ID 为 2 的角色：Editor
    const roleId = 2;
    // 给 Editor 角色分配 View Users, Add User, Edit User 权限
    const newPermissionIds = [1, 2, 3];

    log(`正在更新角色 ID ${roleId} 的权限...`);

    try {
        await apiClient.put(`/roles/${roleId}/permissions`, {
            permissionIds: newPermissionIds
        });
        log('✅ 角色权限更新成功');
        log('注意：如果这是当前用户的角色，服务端应触发 WebSocket 推送更新权限。');
    } catch (e) {
        log(`❌ 更新失败: ${e}`);
    }
};

const updateUserRole = async () => {
    log('--- 修改用户角色测试 ---');
    // 我们要更新 ID 为 2 的用户：Editor
    const userId = 2;
    // 给 Editor 角色分配 Admin, Editor 权限
    const newRoleIds = [1,2];

    log(`正在更新用户 ID ${userId} 的角色...`);

    try {
        await apiClient.put(`/users/${userId}/roles`, {
            roleIds: newRoleIds
        });
        log('✅ 用户角色更新成功');
        log('注意：如果这是当前用户的角色，服务端应触发 WebSocket 推送更新权限。');
    } catch (e) {
        log(`❌ 更新失败: ${e}`);
    }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.demo-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.token-text {
    font-family: monospace;
    cursor: pointer;
    background: #eee;
    padding: 2px 4px;
    border-radius: 4px;
}
.note {
    font-size: 12px;
    color: #999;
    margin-left: 8px;
}
.logs {
    margin-top: 20px;
    background: #282c34;
    color: #abb2bf;
    padding: 15px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    max-height: 200px;
    overflow-y: auto;
}
</style>
