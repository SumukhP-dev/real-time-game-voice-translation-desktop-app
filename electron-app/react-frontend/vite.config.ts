import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  // Critical for Electron `file://` loading in production builds.
  // Without this, assets default to absolute `/assets/...` which resolves to `file:///assets/...` (blank screen).
  base: './',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3010,
    host: true
  }
})
