import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './router/guard' // 激活路由守卫
import { bootstrap } from './bootstrap'
import './style.css'

const app = createApp(App)

// 1. 安装插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 2. 执行引导逻辑
// 我们在挂载应用前等待认证恢复，
// 以确保 UI 立即反映正确的状态。
console.log('[App] 正在启动...');
bootstrap().then(() => {
  console.log('[App] 正在挂载...');
  app.mount('#app')
});
