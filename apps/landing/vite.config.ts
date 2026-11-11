import { defineConfig } from 'vite'

// A landing importa o catálogo e as funções de formatação direto do app (apps/mobile/src),
// então o servidor de desenvolvimento precisa ler a pasta acima da raiz.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  server: { fs: { allow: ['..'] } },
})
