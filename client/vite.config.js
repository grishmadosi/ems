import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // Vite dev-server port (avoids conflict with Express on 5000)
    strictPort: false, // auto-increment if 5173 is already in use
    proxy: {
      // All requests to /api/* are forwarded to Express — no CORS issues in dev
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
