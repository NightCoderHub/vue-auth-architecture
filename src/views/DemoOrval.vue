<script setup lang="ts">
/**
 * @description: Orval + Vue Query 自动生成代码演示组件
 */
import { reactive } from 'vue';
import { useLogin, useGetProfile, type LoginBody } from '@/api/endpoints';
import { ElMessage } from 'element-plus';

// --- 1. Query 示例: 获取个人资料 ---
// 这里的 query 会自动运行，除非 enabled 为 false
// Orval 生成的 Hook 已经包含了类型定义
const {
  data: profile,
  isLoading: isProfileLoading,
  error: profileError,
  refetch: refetchProfile
} = useGetProfile({
  query: {
    // 只有当有 token 时才应该启用（实际项目中通常在全局处理，或者默认启用依靠 401 拦截）
    // 这里为了演示，我们允许它尝试加载
    retry: false
  }
});

// --- 2. Mutation 示例: 登录 ---
const loginForm = reactive<LoginBody>({
  username: 'admin',
  password: 'password'
});

const { mutate: login, isPending: isLoggingIn } = useLogin({
  mutation: {
    onSuccess: (data) => {
      debugger
      // data 现在直接是 Login200Data 类型 ({ accessToken, user })
      ElMessage.success(`登录成功，欢迎: ${data.user.name}`);
      // 登录成功后刷新个人资料
      refetchProfile();
    },
    onError: (error) => {
      ElMessage.error(`登录失败: ${error.message}`);
    }
  }
});

const handleLogin = () => {
  login({ data: loginForm });
};
</script>

<template>
  <div class="orval-demo">
    <h1>Orval + Vue Query 自动生成代码演示</h1>
    <p class="desc">
      本页面演示了由 Orval 根据 Swagger 自动生成的 API Hooks。
    </p>

    <!-- 登录区域 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>Login Mutation 演示 (useLogin)</span>
        </div>
      </template>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="isLoggingIn">
            执行登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资料展示区域 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>GetProfile Query 演示 (useGetProfile)</span>
          <el-button size="small" @click="() => refetchProfile()" :loading="isProfileLoading">
            手动刷新
          </el-button>
        </div>
      </template>

      <div v-if="isProfileLoading">加载中...</div>

      <div v-else-if="profileError">
        <el-alert
          title="获取失败 (可能未登录)"
          type="warning"
          :description="profileError.message"
          show-icon
          :closable="false"
        />
      </div>

      <div v-else-if="profile">
        <el-descriptions title="用户信息" border :column="1">
          <el-descriptions-item label="ID">{{ profile.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ profile.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag v-for="role in profile.roles" :key="role.id" size="small" style="margin-right: 5px">
              {{ role.name }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-else>
        暂无数据
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.orval-demo {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
.desc {
  color: #666;
  margin-bottom: 20px;
}
.section-card {
  margin-bottom: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
