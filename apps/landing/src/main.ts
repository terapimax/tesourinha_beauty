import { categories, professionals, services } from '../../mobile/src/data/catalog'
import type { Professional, Service } from '../../mobile/src/data/types'
import { formatDayLong, formatDuration, formatPrice, toDayKey } from '../../mobile/src/lib/format'
import { contact, courses, whatsappLink } from './content'
import { mountScissors } from './scissors'
import './style.css'

declare global {
  interface Window {
    ScrollCraft: { mount: (root: Element) => { destroy: () => void }; reduce: boolean }
  }
}

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel))
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)
const easeInOut = (x: number) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const phone = matchMedia('(max-width: 860px)').matches

/* ------------------------------------------------------------ conteúdo fixo -- */

mountScissors()

const contactHref: Record<string, string> = {
  whatsapp: whatsappLink('Olá! Vim pelo site da Tesourinha.'),
  phone: `tel:+55${contact.phone.replace(/\D/g, '')}`,
  email: `mailto:${contact.email}`,
  maps: contact.mapsUrl,
  instagram: contact.instagram,
  facebook: contact.facebook,
  youtube: contact.youtube,
}
$$<HTMLAnchorElement>('[data-contact]').forEach((a) => { a.href = contactHref[a.dataset.contact!] })
$$('[data-contact-text]').forEach((el) => { el.textContent = String(contact[el.dataset.contactText as keyof typeof contact]) })
$$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()) })

const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? ''

// Cartões de serviço no trilho lateral. Montados antes do ScrollCraft medir a largura do trilho.
const cardsHtml = services
  .map(
    (s, i) => `
  <article class="svc-card" data-svc-card="${s.id}" style="--i:${i}">
    <p class="svc-card__cat">${esc(categoryName(s.categoryId))}</p>
    <h3 class="svc-card__name">${esc(s.name)}</h3>
    <p class="svc-card__desc">${esc(s.description)}</p>
    <div class="svc-card__foot">
      <p class="svc-card__meta"><span>${formatDuration(s.durationMin)}</span><span>a partir de <b>${formatPrice(s.priceFrom)}</b></span></p>
      <button type="button" class="btn btn--line btn--block" data-pick-service="${s.id}" aria-pressed="false">Escolher</button>
    </div>
  </article>`,
  )
  .join('')
$('.svc__end').insertAdjacentHTML('beforebegin', cardsHtml)

$('[data-book-services]').innerHTML = services
  .map((s) => `<button type="button" class="chip" data-pick-service="${s.id}" aria-pressed="false">${esc(s.name)}<small>${formatDuration(s.durationMin)}</small></button>`)
  .join('')

$('[data-courses]').innerHTML = courses
  .map(
    (c) => `
  <li class="course">
    <details>
      <summary>
        <span class="course__name">${esc(c.name)}</span>
        <span class="course__load">${esc(c.load)}</span>
        <span class="course__when">${esc(c.when)}</span>
        <span class="course__toggle" aria-hidden="true"></span>
      </summary>
      <div class="course__body">
        <p class="course__summary">${esc(c.summary)}</p>
        <ul class="course__mods">${c.modules.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        ${c.note ? `<p class="course__note">${esc(c.note)}</p>` : ''}
        <a class="btn btn--accent" href="${whatsappLink(`Olá! Quero me inscrever no curso de ${c.name}.`)}" target="_blank" rel="noopener">Quero me inscrever</a>
      </div>
    </details>
  </li>`,
  )
  .join('')

/* -------------------------------------------------------------- agendamento -- */

interface Pick { serviceId?: string; proId?: string; day?: string; time?: string }
const STORE = 'tesourinha.landing.pick'
let pick: Pick = {}
try { pick = JSON.parse(sessionStorage.getItem(STORE) || '{}') } catch { pick = {} }

const findService = (id?: string) => services.find((s) => s.id === id)
const findPro = (id?: string) => professionals.find((p) => p.id === id)

/** Mesma regra do app (apps/mobile/src/app/book/[id].tsx), para a landing não oferecer horário que o app mostra ocupado. */
function isTaken(proId: string, day: string, time: string) {
  let h = 0
  for (const ch of `${proId}${day}${time}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 4 === 0
}
function isPast(day: string, time: string) {
  const [y, m, d] = day.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm) <= new Date()
}
/** Próximos 12 dias de atendimento, sem domingos (o calendário do app também bloqueia domingo). */
function nextDays() {
  const out: string[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (out.length < 12) {
    if (d.getDay() !== 0) out.push(toDayKey(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTH = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const dayLabel = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return { week: WEEK[date.getDay()], day: d, month: MONTH[m - 1] }
}
const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

// Uma seleção salva que não vale mais (outro dia, horário passado) é descartada.
if (pick.serviceId && !findService(pick.serviceId)) pick = {}
if (pick.proId && !findPro(pick.proId)?.serviceIds.includes(pick.serviceId!)) { pick.proId = undefined }
if (pick.day && (!nextDays().includes(pick.day) || (pick.time && isPast(pick.day, pick.time)))) { pick.day = undefined; pick.time = undefined }

const complete = () => Boolean(pick.serviceId && pick.proId && pick.day && pick.time)
const appLink = () => {
  if (!complete()) return '/app/'
  const q = new URLSearchParams({ serviceId: pick.serviceId!, date: pick.day!, time: pick.time! })
  return `/app/book/${pick.proId}?${q}`
}
function missing(): { label: string; target: string } | null {
  if (!pick.serviceId) return { label: 'o serviço', target: '#passo-servico' }
  if (!pick.proId) return { label: 'o profissional', target: '#passo-profissional' }
  if (!pick.day) return { label: 'o dia', target: '#passo-quando' }
  if (!pick.time) return { label: 'o horário', target: '#passo-quando' }
  return null
}

function proCard(p: Professional, svc: Service) {
  const on = p.id === pick.proId
  return `<button type="button" class="pro" data-pick-pro="${p.id}" aria-pressed="${on}">
    <span class="pro__avatar" style="--avatar:${p.avatarColor}">${esc(initials(p.name))}</span>
    <span class="pro__info">
      <span class="pro__name">${esc(p.name)}</span>
      <span class="pro__role">${esc(p.role)} · ${esc(p.neighborhood)}</span>
      <span class="pro__meta"><span>Nota ${p.rating.toFixed(1).replace('.', ',')}</span><span>${p.yearsExperience} anos de profissão</span>${p.tesourinhaAlumni ? '<span class="pro__tag">Formação Tesourinha</span>' : ''}</span>
    </span>
    <span class="pro__price">${formatPrice(svc.priceFrom)}</span>
  </button>`
}

let wasComplete = complete()
const ticket = $('[data-ticket]')

function render() {
  try { sessionStorage.setItem(STORE, JSON.stringify(pick)) } catch { /* modo privado: segue sem guardar */ }
  const svc = findService(pick.serviceId)
  const pro = findPro(pick.proId)

  $$<HTMLButtonElement>('[data-pick-service]').forEach((b) => {
    const on = b.dataset.pickService === pick.serviceId
    b.setAttribute('aria-pressed', String(on))
    if (b.closest('.svc-card')) b.textContent = on ? 'Escolhido' : 'Escolher'
  })
  $$('[data-svc-card]').forEach((c) => c.classList.toggle('is-on', c.dataset.svcCard === pick.serviceId))

  // passo 2
  const pros = svc ? professionals.filter((p) => p.serviceIds.includes(svc.id)) : []
  $('[data-book-pros-empty]').hidden = Boolean(svc)
  $('[data-book-pros]').innerHTML = svc ? pros.map((p) => proCard(p, svc)).join('') : ''

  // passo 3
  $('[data-book-when-empty]').hidden = Boolean(pro)
  $('[data-book-days]').innerHTML = pro
    ? nextDays()
        .map((key) => {
          const l = dayLabel(key)
          const free = pro.workingHours.some((t) => !isTaken(pro.id, key, t) && !isPast(key, t))
          return `<button type="button" class="day" data-pick-day="${key}" aria-pressed="${key === pick.day}" ${free ? '' : 'disabled'} aria-label="${esc(formatDayLong(key))}${free ? '' : ', sem horários'}"><small>${l.week}</small><b>${l.day}</b><small>${l.month}</small></button>`
        })
        .join('')
    : ''
  $('[data-book-slots]').innerHTML =
    pro && pick.day
      ? pro.workingHours
          .map((t) => {
            const off = isTaken(pro.id, pick.day!, t) || isPast(pick.day!, t)
            return `<button type="button" class="slot" data-pick-time="${t}" aria-pressed="${t === pick.time}" ${off ? 'disabled aria-label="' + t + ', ocupado"' : ''}>${t}</button>`
          })
          .join('')
      : ''

  // cupom
  $('[data-t-service]').textContent = svc ? svc.name : 'A escolher'
  $('[data-t-pro]').textContent = pro ? pro.name : 'A escolher'
  $('[data-t-when]').textContent = pick.day ? `${formatDayLong(pick.day)}${pick.time ? `, às ${pick.time}` : ''}` : 'A escolher'
  $('[data-t-price]').textContent = svc ? formatPrice(svc.priceFrom) : 'A escolher'
  const cta = $<HTMLAnchorElement>('[data-t-cta]')
  const done = complete()
  cta.href = appLink()
  cta.setAttribute('aria-disabled', String(!done))
  const need = missing()
  $('[data-t-hint]').textContent = need
    ? `Falta escolher ${need.label}.`
    : 'Pronto. No app você confere e confirma.'

  // O recorte toca uma vez, quando o cupom fica completo.
  if (done && !wasComplete) {
    ticket.classList.remove('is-cut')
    void ticket.offsetWidth
    ticket.classList.add('is-cut')
  }
  if (!done) ticket.classList.remove('is-cut')
  if (done && wasComplete) ticket.classList.add('is-cut')
  wasComplete = done

  renderMini()
}

document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-pick-service],[data-pick-pro],[data-pick-day],[data-pick-time],[data-t-cta],[data-mini-cta]')
  if (!t) return
  if (t.dataset.pickService) {
    const id = t.dataset.pickService
    if (pick.serviceId !== id) {
      pick.serviceId = id
      if (!findPro(pick.proId)?.serviceIds.includes(id)) pick = { serviceId: id }
    }
  } else if (t.dataset.pickPro) {
    if (pick.proId !== t.dataset.pickPro) pick = { serviceId: pick.serviceId, proId: t.dataset.pickPro }
  } else if (t.dataset.pickDay) {
    if (pick.day !== t.dataset.pickDay) { pick.day = t.dataset.pickDay; pick.time = undefined }
  } else if (t.dataset.pickTime) {
    pick.time = t.dataset.pickTime
  } else {
    // Botões que confirmam: incompletos levam ao passo que falta.
    const need = missing()
    if (need) {
      e.preventDefault()
      document.querySelector(need.target)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }
    return
  }
  const focusKey = Object.entries(t.dataset).find(([k]) => k.startsWith('pick'))
  render()
  // Depois de redesenhar, devolve o foco ao mesmo botão para quem usa teclado.
  if (focusKey) {
    const attr = `data-${focusKey[0].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`
    const inCard = t.closest('.svc-card') ? '.svc-card ' : t.closest('[data-book-services]') ? '[data-book-services] ' : ''
    document.querySelector<HTMLElement>(`${inCard}[${attr}="${focusKey[1]}"]`)?.focus({ preventScroll: true })
  }
})

/* -------------------------------------------------- cupom flutuante (mini) -- */

const mini = $('[data-mini]')
let bookingVisible = false
function renderMini() {
  const svc = findService(pick.serviceId)
  const show = Boolean(svc) && !bookingVisible
  mini.hidden = !show
  if (!svc) return
  const pro = findPro(pick.proId)
  const need = missing()
  $('[data-mini-text]').innerHTML = need
    ? `<b>${esc(svc.name)}</b>${pro ? ` com ${esc(pro.name)}` : ''}<span>Falta escolher ${need.label}</span>`
    : `<b>${esc(svc.name)}</b> com ${esc(pro!.name)}<span>${esc(formatDayLong(pick.day!))}, às ${pick.time}</span>`
  const cta = $<HTMLAnchorElement>('[data-mini-cta]')
  cta.textContent = need ? 'Continuar' : 'Confirmar no app'
  cta.href = need ? need.target : appLink()
}
new IntersectionObserver(
  ([entry]) => { bookingVisible = entry.isIntersecting; renderMini() },
  { rootMargin: '-20% 0px -20% 0px' },
).observe($('#agendar'))

render()

/* ------------------------------------------ ajustes por tela, antes de montar -- */

// No celular o trilho de serviços é mais estreito na tela e precisa de mais rolagem para não correr.
if (phone) {
  $('#servicos').setAttribute('data-sc-span', '3.8')
  $('#projeto').setAttribute('data-sc-span', '4.2')
}
// O fecho carrega o rodapé; num palco preso de 100svh ele seria cortado em telas baixas.
if (phone || innerHeight < 760) {
  $('#visite').setAttribute('data-sc-act', 'flow')
  $('#visite').classList.add('is-flow')
}

window.ScrollCraft.mount(document.body)

/* ------------------------------------------------- a linha de corte e o pico -- */

const root = document.documentElement
const hero = $('#inicio')
const cut = $('#projeto')
const cutStage = $('.cut__stage')
const countEl = $('[data-cut-count]')
const rail = $('.rail')
const bar = $('.bar')
const marks = $$<HTMLAnchorElement>('.rail__marks a')
marks.forEach((a) => { a.dataset.label = a.textContent ?? '' })
const pOf = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--sc-p')) || 0

let markPos: number[] = []
function measureMarks() {
  const max = Math.max(1, root.scrollHeight - innerHeight)
  markPos = marks.map((a) => {
    const target = document.querySelector<HTMLElement>(a.hash)!
    return clamp01((target.getBoundingClientRect().top + scrollY) / max)
  })
  marks.forEach((a, i) => a.parentElement!.style.setProperty('--at', String(markPos[i])))
}
new ResizeObserver(measureMarks).observe(document.body)
addEventListener('load', measureMarks)
marks.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault()
  document.querySelector(a.hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
}))

// As lâminas abrem e fecham conforme a roda anda; parada, a tesoura descansa entreaberta.
let lastY = scrollY
let phase = 0
let open = 12
let still = 0

function frame() {
  const y = scrollY
  const dy = Math.abs(y - lastY)
  lastY = y
  const max = Math.max(1, root.scrollHeight - innerHeight)
  const prog = clamp01(y / max)

  if (!reduce) {
    if (dy > 0.5) { phase += Math.min(dy, 80); still = 0 } else still++
    const target = still > 8 ? 12 : 4 + 22 * (0.5 + 0.5 * Math.sin(phase / 26))
    open += (target - open) * 0.35
  }
  root.style.setProperty('--prog', prog.toFixed(4))
  rail.style.setProperty('--open', open.toFixed(2))
  bar.style.setProperty('--open', open.toFixed(2))
  let active = 0
  markPos.forEach((p, i) => { if (prog + 0.002 >= p) active = i })
  marks.forEach((a, i) => a.classList.toggle('is-here', i === active))

  // hero: a tesoura gira até apontar para baixo, para entregar o corte ao próximo ato
  const hp = pOf(hero)
  hero.style.setProperty('--h-rot', `${(-32 + easeInOut(hp) * 212).toFixed(2)}deg`)
  hero.style.setProperty('--h-open', `${(14 + hp * 10).toFixed(2)}`)

  // o corte
  const p = pOf(cut)
  const s = clamp01((p - 0.3) / 0.26)
  const h = reduce ? clamp01((p - 0.48) / 0.12) : easeInOut((p - 0.55) / 0.25)
  cutStage.style.setProperty('--cut-s', s.toFixed(4))
  cutStage.style.setProperty('--cut-h', h.toFixed(4))
  cutStage.style.setProperty('--open', s > 0 && s < 1 ? (5 + 24 * (0.5 + 0.5 * Math.sin(p * 170))).toFixed(2) : '10')
  countEl.textContent = String(reduce ? 90 : Math.round(90 * easeOut((p - 0.69) / 0.14)))

  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

/* --------------------------------------------------------- borda do cupom -- */

const edge = $<SVGSVGElement>('.ticket__edge')
new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect
  edge.setAttribute('viewBox', `0 0 ${width} ${height}`)
  $$<SVGRectElement>('rect', edge).forEach((r) => {
    r.setAttribute('width', String(Math.max(0, width - 2)))
    r.setAttribute('height', String(Math.max(0, height - 2)))
  })
}).observe($('.ticket__card'))
