<template>
  <div class="fullscreen-page-container">
    <div class="content-box">
      <h1>全屏页面演示</h1>
      <p>这是一个全屏页面，不显示侧边栏和顶部导航栏。</p>
      <p>适用于数据大屏、独立工作台等场景。</p>
      
      <div class="info-block">
        <Icon icon="ep:full-screen" class="icon" />
        <span>当前状态：全屏模式</span>
      </div>

      <el-button type="primary" @click="$router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @description: 全屏页面演示组件
 */
</script>

<style scoped>
.fullscreen-page-container {
  width: 100%;
  height: 100vh; /* 占满视口高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
}

.content-box {
  text-align: center;
  background: white;
  padding: 40px 60px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 20px;
  color: #303133;
}

p {
  color: #606266;
  margin-bottom: 10px;
}

.info-block {
  margin: 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #409eff;
  font-size: 18px;
}

.icon {
  font-size: 24px;
}
</style>
