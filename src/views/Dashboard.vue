<template>
  <div class="dashboard-container">
    <el-card>
      <template #header>
        <div class="header">
          <h2>Dashboard</h2>
          <el-tag :type="status === 'authenticated' ? 'success' : 'danger'">
            {{ status.toUpperCase() }}
          </el-tag>
        </div>
      </template>

      <el-descriptions title="User Info" border :column="1">
        <el-descriptions-item label="Username">{{ user?.username }}</el-descriptions-item>
        <el-descriptions-item label="Role">{{ user?.role }}</el-descriptions-item>
        <el-descriptions-item label="Access Token">
          <el-tooltip :content="accessToken" placement="top">
            <span class="token-text">{{ accessToken ? accessToken.substring(0, 30) + '...' : 'None' }}</span>
          </el-tooltip>
          <span class="note">(In Memory Only)</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>Permission Control Demo (Directives/Components)</h3>
      <div class="demo-section">
        <Permission code="btn:edit">
          <el-button type="success">Edit Button (Req: btn:edit)</el-button>
        </Permission>

        <Permission code="admin">
          <el-button type="danger">Admin Action (Req: admin)</el-button>
        </Permission>

        <Permission code="super:delete">
           <el-button type="info">Super Delete (Hidden)</el-button>
        </Permission>
      </div>

      <el-divider />

      <h3>Architecture Validation</h3>
      <div class="actions">
        <el-button @click="testConcurrency">
          Test Request Queue (Simulate Bootstrapping)
        </el-button>

        <el-button type="warning" @click="testPermissionChange">
          Simulate Permission Change (Real-time)
        </el-button>

        <el-button type="danger" @click="handleLogout">Logout</el-button>
      </div>

      <div class="logs" v-if="logs.length">
          <h4>Logs:</h4>
          <p v-for="(log, i) in logs" :key="i">{{ log }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { logout } from '../auth/authService';
import Permission from '../components/Permission.vue';
import apiClient from '../axios';

const authStore = useAuthStore();
const user = computed(() => authStore.userInfo);
const status = computed(() => authStore.status);
const accessToken = computed(() => authStore.accessToken);
const logs = ref<string[]>([]);

const log = (msg: string) => logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

const handleLogout = () => logout();

const testConcurrency = async () => {
  log('--- Starting Request Queue Test ---');
  log('1. Manually setting status to "bootstrapping" to simulate app init or refresh...');
  authStore.setBootstrapping();

  log('2. Firing 3 parallel requests...');

  // 这些请求应该等待直到我们恢复 Token
  apiClient.get('/users').then(() => log('✅ Request 1 Completed'));
  apiClient.get('/roles').then(() => log('✅ Request 2 Completed'));
  apiClient.get('/products').then(() => log('✅ Request 3 Completed'));

  log('3. Requests are now pending in the queue (Check Network/Console)');

  setTimeout(() => {
      log('4. Simulating Refresh Success (Status -> Authenticated)...');
      authStore.setAccessToken('restored_token_' + Date.now());
      // 请求现在应该已解决
  }, 3000);
};

const testPermissionChange = () => {
    log('--- Triggering Real-time Permission Change ---');
    log('Calling window.simulatePermissionChange()...');
    (window as any).simulatePermissionChange();
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
