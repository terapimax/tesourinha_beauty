// Gera supabase/migrations/0004_seed_demo.sql a partir do catálogo de exemplo do app
// (apps/mobile/src/data/catalog.ts). Rode de novo sempre que o catálogo mudar:
//   node supabase/scripts/generate-seed.mjs
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const cat = await import(pathToFileURL(resolve('apps/mobile/src/data/catalog.ts')).href)

// UUID estável a partir do id de exemplo (o seed pode rodar mais de uma vez sem duplicar).
const uuid = (key) => {
  const h = createHash('sha1').update(`tesourinha:${key}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`

const out = []
out.push('-- Tesourinha Beauty · dados de demonstração (gerado por supabase/scripts/generate-seed.mjs)')
out.push('-- Pode rodar mais de uma vez: usa ids fixos e "on conflict do nothing".\n')

out.push('insert into public.services (id, slug, category_id, name, description, duration_min, price_from, icon) values')
out.push(cat.services.map((s) => `  (${q(uuid(s.id))}, ${q(s.id)}, ${q(s.categoryId)}, ${q(s.name)}, ${q(s.description)}, ${s.durationMin}, ${s.priceFrom}, ${q(s.icon)})`).join(',\n'))
out.push('on conflict (id) do nothing;\n')

out.push('insert into public.professionals (id, slug, name, role, bio, neighborhood, years_experience, tesourinha_alumni, rating, reviews_count, status, category_ids, slot_minutes) values')
out.push(cat.professionals.map((p) => `  (${q(uuid(p.id))}, ${q(p.id)}, ${q(p.name)}, ${q(p.role)}, ${q(p.bio)}, ${q(p.neighborhood)}, ${p.yearsExperience}, ${p.tesourinhaAlumni}, ${p.rating}, ${p.reviewsCount}, 'aprovado', ${arr(p.categoryIds)}, 60)`).join(',\n'))
out.push('on conflict (id) do nothing;\n')

const links = cat.professionals.flatMap((p) => p.serviceIds.map((s) => `  (${q(uuid(p.id))}, ${q(uuid(s))})`))
out.push('insert into public.professional_services (professional_id, service_id) values')
out.push(links.join(',\n'))
out.push('on conflict (professional_id, service_id) do nothing;\n')

// Atendimento de segunda a sábado, 09h–12h e 13h–19h (blocos de 1h).
const hours = cat.professionals.flatMap((p) =>
  [1, 2, 3, 4, 5, 6].flatMap((d) => [`  (${q(uuid(`${p.id}:${d}:am`))}, ${q(uuid(p.id))}, ${d}, '09:00', '12:00', 60)`, `  (${q(uuid(`${p.id}:${d}:pm`))}, ${q(uuid(p.id))}, ${d}, '13:00', '19:00', 60)`]),
)
out.push('insert into public.working_hours (id, professional_id, weekday, start_time, end_time, slot_minutes) values')
out.push(hours.join(',\n'))
out.push('on conflict (id) do nothing;\n')

const reviews = cat.professionals.flatMap((p) => p.reviews.map((r) => `  (${q(uuid(r.id))}, ${q(uuid(p.id))}, ${q(r.author)}, ${Math.round(r.rating)}, ${q(r.comment)}, ${q(r.date)})`))
out.push('insert into public.reviews (id, professional_id, author_name, rating, comment, created_at) values')
out.push(reviews.join(',\n'))
out.push('on conflict (id) do nothing;\n')

out.push('insert into public.courses (id, slug, title, subtitle, area, level, duration_hours, modality, start_date, seats, description, modules, certificate, icon, published) values')
out.push(cat.courses.map((c) => `  (${q(uuid(c.id))}, ${q(c.id)}, ${q(c.title)}, ${q(c.subtitle)}, ${q(c.categoryId)}, ${q(c.level)}, ${c.durationHours}, ${q(c.modality)}, ${q(c.startDate)}, ${c.seats}, ${q(c.description)}, ${arr(c.modules)}, ${c.certificate}, ${q(c.icon)}, true)`).join(',\n'))
out.push('on conflict (id) do nothing;\n')

out.push('insert into public.jobs (id, slug, title, company, location, job_type, salary, description, requirements, benefits, icon, open, created_at) values')
out.push(cat.jobs.map((j) => `  (${q(uuid(j.id))}, ${q(j.id)}, ${q(j.title)}, ${q(j.company)}, ${q(j.location)}, ${q(j.type)}, ${q(j.salary ?? null)}, ${q(j.description)}, ${arr(j.requirements)}, ${arr(j.benefits)}, ${q(j.icon)}, true, ${q(j.postedAt)})`).join(',\n'))
out.push('on conflict (id) do nothing;\n')

writeFileSync('supabase/migrations/0004_seed_demo.sql', out.join('\n'))
console.log('gerado: supabase/migrations/0004_seed_demo.sql')

// Arquivo único para colar no SQL Editor do Supabase (todas as migrações, em ordem).
const dir = 'supabase/migrations'
const all = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
const header = '-- Tesourinha Beauty · configuração completa do banco (gerado por supabase/scripts/generate-seed.mjs)\n-- Cole tudo no SQL Editor do Supabase e clique em Run. Rode só uma vez em um projeto novo.\n'
writeFileSync('supabase/setup-completo.sql', header + all.map((f) => `\n-- ======== ${f} ========\n` + readFileSync(`${dir}/${f}`, 'utf8')).join('\n'))
console.log('gerado: supabase/setup-completo.sql')
