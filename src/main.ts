import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './router/guard' // 激活路由守卫
import { bootstrap } from './bootstrap'
import { setupDirectives } from './directives'
import './styles/main.scss'
import { Icon, addCollection } from '@iconify/vue'
// 直接引入下载好的 Element Plus 图标 JSON 数据
import epIcons from '@iconify-json/ep/icons.json'

// 关键步骤：将整个图标集注册到本地缓存
addCollection(epIcons)

const app = createApp(App)

// 1. 安装插件
app.use(createPinia())
app.use(router)
// 2. 全局注册 Icon 组件
app.component('Icon', Icon)
setupDirectives(app)

// 3. 执行引导逻辑
// 我们在挂载应用前等待认证恢复，
// 以确保 UI 立即反映正确的状态。
console.log('[App] 正在启动...');
bootstrap().then(() => {
  console.log('[App] 正在挂载...');
  app.mount('#app')
});
