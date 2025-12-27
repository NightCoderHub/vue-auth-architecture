import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: false, // 禁用 CSS 处理以避免 SCSS 错误
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
            'src/axios/__tests__/**',
            'src/test/**',
            'src/main.ts',
            'src/App.vue',
            'src/**/*.d.ts',
            'src/types/**'
        ],
        thresholds: {
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80
        }
      }
  },
});
