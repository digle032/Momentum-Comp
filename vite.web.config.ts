import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone web build config (no Electron)
export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    outDir: '../../dist-web',
    emptyOutDir: true,
  },
})
