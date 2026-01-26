import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: '127.0.0.1',
    host: true, // listens on all interfaces (including VPN)
    port: 5173, // optional, keep default
    strictPort: true, // fail if port is busy
    proxy:{
      '/api': {
        // target: 'http://127.0.0.1:8000',
        target: 'http://ideproj.test/',
        changeOrigin: true,
        headers:{
          Accept: 'application/json',
          "Content-Type": 'application/json',
        }
      }
    },
    allowedHosts: true
  }
})