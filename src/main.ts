import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './router/guard' // 激活路由守卫
import { bootstrap } from './bootstrap'
import { setupDirectives } from './directives'
import './styles/main.scss'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { Icon, addIcon } from '@iconify/vue'
import { registerIcons } from './icons/bundled'

// 注册离线图标
registerIcons()

// 自定义图标：汉堡菜单线性图标
addIcon('hamburger-menu-linear', {
	"width": 24,
	"height": 24,
	"body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"2\" d=\"M20 7H4m16 5H4m16 5H4\"/>"
})

const app = createApp(App)

// 1. 安装插件
app.use(createPinia())
app.use(VueQueryPlugin)
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
