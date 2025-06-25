import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'chunk-VW5OPMQA',
      'chunk-YPEMTGFV',
      'chunk-FPBZWFJX'
    ]
  },
  build: {
    // Improve build performance and handle dynamic imports better
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Ensure proper code splitting
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'antd']
        }
      }
    }
  }
})
