import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  // Critical for Electron `file://` loading in production builds.
  // Without this, assets default to absolute `/assets/...` which resolves to `file:///assets/...` (blank screen).
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        overlay: resolve(__dirname, 'overlay.html'),
      },
    },
  },
  server: {
    port: 3010,
    strictPort: true,
    host: true
  }
})
