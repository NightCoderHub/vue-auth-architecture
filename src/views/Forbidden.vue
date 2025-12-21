<template>
  <div class="forbidden-container">
    <el-result
      icon="warning"
      title="403 Forbidden"
      sub-title="Sorry, you don't have permission to access this page."
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">Back to Home</el-button>
        <el-button @click="$router.push('/login')">Re-Login</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
