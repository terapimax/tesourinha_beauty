// Copia do app do cliente (apps/mobile) o design system e o catálogo compartilhados.
// Os arquivos copiados ficam nos mesmos caminhos (src/theme, src/lib, src/data, src/components/*),
// então os imports "@/..." funcionam igual nos dois apps. Edite sempre no apps/mobile.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const mobile = (p) => fileURLToPath(new URL(`../../mobile/src/${p}`, import.meta.url))
const here = (p) => fileURLToPath(new URL(`../src/${p}`, import.meta.url))

const shared = [
  'theme/index.ts',
  'lib/format.ts',
  'lib/haptics.ts',
  'lib/confirm.ts',
  'data/catalog.ts',
  'data/types.ts',
  'components/ui.tsx',
  'components/screen.tsx',
  'components/logo.tsx',
  'components/calendar.tsx',
]

if (!existsSync(mobile(''))) {
  console.log('apps/mobile não encontrado; usando as cópias já versionadas')
  process.exit(0)
}
for (const file of shared) {
  mkdirSync(here(file.split('/').slice(0, -1).join('/')), { recursive: true })
  cpSync(mobile(file), here(file))
}
console.log(`design system compartilhado sincronizado (${shared.length} arquivos)`)
