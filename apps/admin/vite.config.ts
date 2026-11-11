import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// O catálogo vem do app mobile (apps/mobile/src/data), copiado para src/shared pelo script sync-shared.
// VITE_BASE define o caminho onde o painel é publicado (ex.: /admin/ quando fica junto dos outros apps).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
})
