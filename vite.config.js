import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [{
        src: 'src/locales/*.js',
        dest: 'locales'
      }]
    })
  ],
  build: {
    assetsInclude: ['src/locales/*.js'],
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Ensure locales are included in the main chunk to avoid loading issues
        // This helps with Cloudflare Pages deployment
        manualChunks(id) {
          if (id.includes('node_modules/vue-i18n') || id.includes('src/locales')) {
            return 'vendor'
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
