// Monta um único site com os três apps, para publicar num só projeto do Vercel:
//   /app           -> app do cliente (apps/mobile)
//   /profissional  -> app do profissional (apps/pro)
//   /admin         -> painel administrativo (apps/admin)
//   /              -> redireciona para /app (ver vercel.json)
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const out = dir('dist')

function run(cmd, cwd, env = {}) {
  console.log(`\n> [${cwd.replace(root, '')}] ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
}

function install(cwd) {
  run(existsSync(`${cwd}/package-lock.json`) ? 'npm ci' : 'npm install', cwd)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

// 1) App do cliente, em /app
const mobile = dir('apps/mobile')
install(mobile)
run('npx expo export --platform web', mobile, { EXPO_BASE_URL: '/app' })
cpSync(`${mobile}/dist`, `${out}/app`, { recursive: true })

// 2) App do profissional, em /profissional
const pro = dir('apps/pro')
install(pro)
run('node scripts/sync-shared.mjs', pro)
run('npx expo export --platform web', pro, { EXPO_BASE_URL: '/profissional' })
cpSync(`${pro}/dist`, `${out}/profissional`, { recursive: true })

// 3) Painel admin, em /admin
const admin = dir('apps/admin')
install(admin)
run('npm run build', admin, { VITE_BASE: '/admin/' })
cpSync(`${admin}/dist`, `${out}/admin`, { recursive: true })

console.log('\nSite montado em dist/ (/app, /profissional, /admin)')
