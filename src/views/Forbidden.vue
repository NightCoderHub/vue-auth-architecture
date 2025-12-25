<template>
  <div class="forbidden-container">
    <div class="content">
      <div class="icon-wrapper">
        <Icon icon="ep:lock" class="lock-icon" width="100" height="100" />
      </div>
      <h1 class="error-code">403</h1>
      <h2 class="error-title">访问被拒绝</h2>
      <p class="error-desc">抱歉，您没有权限访问此页面。</p>

      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/')" >
          <Icon icon="ep:home-filled" />
          返回首页
        </el-button>
        <el-button size="large" @click="$router.push('/login')">
          <Icon icon="ep:user" />
          重新登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description: 403 禁止访问页面
 */
</script>

<style scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image:
    radial-gradient(#e1e1e1 1px, transparent 1px),
    radial-gradient(#e1e1e1 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

.content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 480px;
  width: 90%;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.icon-wrapper {
  width: 120px;
  height: 120px;
  background: #fef0f0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
}

.lock-icon {
  color: #f56c6c;
}

.error-code {
  font-size: 72px;
  font-weight: 800;
  color: #303133;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #f56c6c 0%, #ff9f43 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin: 10px 0;
}

.error-desc {
  color: #909399;
  font-size: 16px;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
