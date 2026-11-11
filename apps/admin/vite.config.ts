import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// O catálogo de dados é compartilhado com o app mobile (apps/mobile/src/data).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../mobile/src/data', import.meta.url)),
    },
  },
})
