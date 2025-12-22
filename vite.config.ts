import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // 配置前缀，例如使用 <i-ep-edit />
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    // 自动安装并使用本地图标集
    Icons({
      autoInstall: false, // 已经手动下载了 @iconify-json/ep，设为 false
       compiler: 'vue3',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
        // api: 'modern-compiler', // 已移除，SassPreprocessorOptions 类型中不存在该字段
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 如果想专门把 iconify 拆出来
            if (id.includes('@iconify-json')) {
              return 'icons';
            }
            // 其他依赖打入 vendor
            return 'vendor';
          }
        }
      }
    }
  }
})
