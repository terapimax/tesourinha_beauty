// Copia o catálogo compartilhado do app mobile para dentro do painel antes do build/dev.
// Assim o painel compila sozinho (ex.: no Vercel) sem depender do tsconfig/node_modules do mobile.
import { cpSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const from = fileURLToPath(new URL('../../mobile/src/data/', import.meta.url))
const to = fileURLToPath(new URL('../src/shared/', import.meta.url))
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
console.log('catálogo compartilhado sincronizado em src/shared')
