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
        // Ensure locales are included in the main chunk to avoid loading issues
        // This helps with Cloudflare Pages deployment
        manualChunks(id) {
          if (id.includes('node_modules/vue-i18n')) {
            return 'vue-i18n'
          }
          // Don't separate locales into a separate chunk
          // This ensures they're available immediately
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
