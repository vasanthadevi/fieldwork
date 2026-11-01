import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api to the FastAPI backend so the browser talks to one origin (no CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.TARGET_API || 'http://127.0.0.1:8100',
    },
  },
})
