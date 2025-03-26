import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

  ],
  build: {
    assetsInclude: ['src/locales/*.js'],
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Remove external vue-i18n reference
        manualChunks(id) {
          if (id.includes('node_modules/vue-i18n') || id.includes('src/locales')) {
            return 'vendor'
          }
          // Simplified manual chunks configuration
        }
      }
    }
  },
  optimizeDeps: {
    // Remove vue-i18n from include
    include: []
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
