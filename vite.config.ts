import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 手动分包：将常见大依赖拆分，降低首包体积
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('react-dom')) return 'react'
          if (id.includes('react-router')) return 'router'
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('/antd/')) return 'antd'
          return 'vendor'
        },
      },
    },
  },
})
