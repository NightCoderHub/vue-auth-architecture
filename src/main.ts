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
import { dictUtils } from '@/dict'
import { DictTag, DictSelect } from '@/components/Dict'

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
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // 如果 Axios 拦截器已经判定为“会话过期”，则不进行 Vue Query 级别的重试
          if (error?.message === '会话已过期' || error?.response?.status === 401) {
            return false;
          }
          // 其他错误（如 500、网络超时）重试 3 次
          return failureCount < 3;
        },
      },
    },
  },
})
app.use(router)
// 2. 全局注册组件与工具
app.component('Icon', Icon)
app.component('DictTag', DictTag)
app.component('DictSelect', DictSelect)
app.config.globalProperties.$dict = dictUtils
setupDirectives(app)

// 3. 执行引导逻辑
async function startApp() {
  // if (import.meta.env.VITE_APP_MOCK === 'true') {
  //   const { worker } = await import('./mocks/browser')
  //   await worker.start({
  //     onUnhandledRequest: 'bypass',
  //   })
  // }

  console.log('[App] 正在启动...');
  await bootstrap();
  console.log('[App] 正在挂载...');
  app.mount('#app');
}

startApp();
