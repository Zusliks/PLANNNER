import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  root: 'CLIENT',
  esbuild: { jsx: 'automatic' },
  build: { outDir: '../DIST', emptyOutDir: true, rollupOptions: { input: fileURLToPath(new URL('CLIENT/INDEX.html', import.meta.url)) } },
  server: { proxy: { '/api': 'http://localhost:3000' } }
})
