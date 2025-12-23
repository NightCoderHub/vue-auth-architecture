<template>
  <div class="hidden-breadcrumb-container">
    <el-alert
      title="面包屑已隐藏"
      type="success"
      description="当前页面的面包屑导航已被隐藏（通过路由 meta 配置 hideBreadcrumb: true）。"
      show-icon
      :closable="false"
    />
    <div class="content">
      <h2>功能演示：隐藏面包屑</h2>
      <p>这是一个演示页面，用于展示如何在特定路由下隐藏面包屑导航。</p>
      <p>你可以检查 mockData.js 中的配置：</p>
      <pre>
{
  path: '/feature/hidden-breadcrumb',
  name: 'HiddenBreadcrumb',
  component: 'HiddenBreadcrumb',
  meta: {
    hideBreadcrumb: true
  }
}
      </pre>
    </div>
  </div>
</template>

<style scoped>
.hidden-breadcrumb-container {
  padding: 20px;
}
.content {
  margin-top: 20px;
  line-height: 1.6;
}
pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
