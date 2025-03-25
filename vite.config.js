import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          'vue-i18n': ['vue-i18n'],
          'locales': ['./src/locales/zh.js', './src/locales/en.js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue-i18n']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
