<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <div class="logo-circle">
          <Icon icon="ep:lock" class="logo-icon" />
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
            >
              <template #prefix>
                <Icon icon="ep:user" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            >
              <template #prefix>
                <Icon icon="ep:lock" />
              </template>
            </el-input>
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
/**
 * @description: 登录页面组件
 * 处理用户登录逻辑、表单验证及反馈
 */
import { reactive, ref } from 'vue';
import { login } from '../auth/authService';
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

<style scoped lang="scss">
@use 'sass:color';
@use '@/styles/variables.scss' as *;

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(rgba($primary, 0.1) 1px, transparent 1px),
    radial-gradient(rgba($primary, 0.1) 1px, #f0f2f5 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  position: relative;
  overflow: hidden;
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  width: 56px;
  height: 56px;
  background: $primary;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba($primary, 0.25);

  .logo-icon {
      font-size: 28px;
      color: #fff;
  }
}

.title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: $menuText;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: $info;
  margin: 0;
}

.login-card {
  border-radius: 8px;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  background-color: $primary;
  border-color: $primary;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
      background-color: color.adjust($primary, $lightness: 5%);
      border-color: color.adjust($primary, $lightness: 5%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba($primary, 0.3);
  }
}

.divider-text {
  color: #c0c4cc;
  font-size: 12px;
}

.tips {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.tip-tag {
  font-family: monospace;
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.footer {
  text-align: center;
  margin-top: 24px;
  color: $info;
  font-size: 12px;
}

/* Custom Input Styles */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 1px 11px;
  background-color: #fff;
  transition: all 0.2s ease;
  border-radius: 4px;

  &:hover {
      box-shadow: 0 0 0 1px $primary inset;
  }

  &.is-focus {
      box-shadow: 0 0 0 1px $primary inset !important;
  }
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  line-height: 1.2;
  color: $menuText;
  font-weight: 500;
}
</style>
