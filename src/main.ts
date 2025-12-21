import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './router/guard' // Activate Router Guards
import { bootstrap } from './bootstrap'
import './style.css'

const app = createApp(App)

// 1. Install Plugins
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 2. Execute Bootstrap Logic
// We wait for auth restoration before mounting the app
// to ensure the UI reflects the correct state immediately.
console.log('[App] Bootstrapping...');
bootstrap().then(() => {
  console.log('[App] Mounting...');
  app.mount('#app')
});
