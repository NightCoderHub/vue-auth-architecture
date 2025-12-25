<template>
  <div class="not-found-container">
    <div class="content">
      <div class="icon-wrapper">
        <Icon icon="icon-park-outline:attention" class="warning-icon" width="100" height="100" />
      </div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除。</p>

      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/')">
           <Icon icon="icon-park-outline:home" /> 返回首页
        </el-button>
        <el-button size="large" @click="$router.back()"  >
          <Icon icon="icon-park-outline:left" />  返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description: 404 错误页面
 */
</script>

<style scoped>
.not-found-container {
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
  background: #fdf6ec;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
}

.warning-icon {
  color: #e6a23c;
}

.error-code {
  font-size: 72px;
  font-weight: 800;
  color: #303133;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
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
