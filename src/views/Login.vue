<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <div class="logo-circle">
          <el-icon :size="40" color="#fff"><Lock /></el-icon>
        </div>
        <h2 class="title">Vue 前端鉴权架构</h2>
        <p class="subtitle">企业级中后台权限管理系统方案</p>
      </div>

      <el-card class="login-card" shadow="hover">
        <el-form
          ref="loginFormRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" underline="never">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="login-button"
              round
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider>
          <span class="divider-text">测试账号</span>
        </el-divider>

        <div class="tips">
          <el-tag type="info" effect="plain" class="tip-tag">用户: admin</el-tag>
          <el-tag type="info" effect="plain" class="tip-tag">密码: password</el-tag>
        </div>
      </el-card>

      <div class="footer">
        <p>© 2025 Vue Auth Architecture. 开源项目.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { login } from '../auth/authService';
import { User, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const loginFormRef = ref<FormInstance>();
const form = reactive({ username: 'admin', password: 'password' });
const rememberMe = ref(true);
const loading = ref(false);

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '长度至少 3 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '长度至少 6 个字符', trigger: 'blur' },
  ],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await login(form.username, form.password);
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1c1c1e 0%, #2c3e50 100%);
  position: relative;
  overflow: hidden;
}

/* Background Pattern Overlay */
.login-container::before {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
  transform: rotate(45deg);
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  color: #fff;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #42d392 0%, #647eff 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  box-shadow: 0 10px 25px rgba(66, 211, 146, 0.3);
  transition: transform 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05) rotate(5deg);
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  letter-spacing: 0.5px;
}

.login-card {
  border-radius: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

:deep(.el-card__body) {
  padding: 30px 30px 20px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(90deg, #42d392 0%, #647eff 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(100, 126, 255, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.divider-text {
  color: #909399;
  font-size: 12px;
}

.tips {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

.tip-tag {
  font-family: monospace;
}

.footer {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

/* Custom Input Styles */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 1px 11px;
  background-color: #f5f7fa;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  background-color: #fff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #647eff inset !important;
  background-color: #fff;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}
</style>