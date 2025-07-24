import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@bokuweb/zstd-wasm', 'brotli-wasm'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // 将WASM库分离到单独的chunk
          'wasm-libs': ['@bokuweb/zstd-wasm', 'brotli-wasm']
        }
      }
    }
  },
  esbuild: {
    target: 'es2020',
    // 不要删除console，某些WASM库可能需要它
    // drop: ['console', 'debugger']
  },
  server: {
    fs: {
      strict: false
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  worker: {
    format: 'es'
  }
})
