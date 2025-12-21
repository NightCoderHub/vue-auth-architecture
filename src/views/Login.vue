<template>
  <div class="login-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>Tencent Auth Architecture</h3>
        </div>
      </template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="Username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            Login
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <p>Mock Credentials: any / any</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { login } from '../auth/authService';

const form = reactive({ username: 'admin', password: 'password' });
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    await login(form.username, form.password);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.box-card {
  width: 400px;
}
.tips {
  margin-top: 20px;
  color: #666;
  font-size: 12px;
  text-align: center;
}
</style>
