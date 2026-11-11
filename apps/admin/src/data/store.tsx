import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { courses as seedCourses, jobs as seedJobs, professionals as seedPros, services as seedServices } from '@shared/catalog'
import type { BookingStatus, Course, Job, Professional, Service } from '@shared/types'

/* ------------------------------------------------------------------ */
/* Tipos do painel                                                     */
/* ------------------------------------------------------------------ */

export type AdminProfessional = Professional & { active: boolean }
export type AdminService = Service & { active: boolean }
export type AdminCourse = Course & { published: boolean }
export type AdminJob = Job & { open: boolean }

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  city: string
  createdAt: string
  role: 'cliente' | 'aluno' | 'profissional'
}

export interface AdminBooking {
  id: string
  userId: string
  professionalId: string
  serviceId: string
  date: string
  time: string
  status: BookingStatus
  price: number
}

export type ApplicationStatus = 'nova' | 'em análise' | 'aprovada' | 'recusada'

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  createdAt: string
  status: 'inscrito' | 'lista de espera' | 'concluído'
}

export interface Application {
  id: string
  userId: string
  jobId: string
  createdAt: string
  status: ApplicationStatus
}

export interface DB {
  professionals: AdminProfessional[]
  services: AdminService[]
  courses: AdminCourse[]
  jobs: AdminJob[]
  users: AdminUser[]
  bookings: AdminBooking[]
  enrollments: Enrollment[]
  applications: Application[]
}

/* ------------------------------------------------------------------ */
/* Dados de exemplo (determinísticos)                                  */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

const FIRST = ['Juliana', 'Patrícia', 'Camila', 'Larissa', 'Aline', 'Bianca', 'Fernanda', 'Rafael', 'Bruno', 'Thiago', 'Mariana', 'Beatriz', 'Gabriela', 'Lucas', 'Pedro', 'Amanda', 'Letícia', 'Vanessa', 'Carla', 'Débora', 'Renato', 'Rodrigo', 'Sabrina', 'Tatiane']
const LAST = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Rocha']
const HOODS = ['Santo Amaro', 'Capão Redondo', 'Campo Limpo', 'Jardim São Luís', 'Vila Andrade', 'Moema', 'Grajaú']

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (n: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}

function seed(): DB {
  const r = rng(37)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]!

  const users: AdminUser[] = Array.from({ length: 48 }, (_, i) => {
    const name = `${pick(FIRST)} ${pick(LAST)}`
    return {
      id: `u${i + 1}`,
      name,
      email: `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.')}${i}@email.com`,
      phone: `(11) 9${String(Math.floor(r() * 9000) + 1000)}-${String(Math.floor(r() * 9000) + 1000)}`,
      city: `${pick(HOODS)}, SP`,
      createdAt: dayKey(addDays(-Math.floor(r() * 90))),
      role: r() < 0.6 ? 'cliente' : r() < 0.85 ? 'aluno' : 'profissional',
    }
  })

  const services = seedServices.map((s) => ({ ...s, active: true }))
  const professionals = seedPros.map((p) => ({ ...p, active: true }))
  const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  const bookings: AdminBooking[] = []
  for (let offset = -20; offset <= 10; offset++) {
    const d = addDays(offset)
    if (d.getDay() === 0) continue
    const count = Math.floor(r() * 7) + (offset <= 0 ? 4 : 1)
    for (let k = 0; k < count; k++) {
      const pro = pick(professionals)
      const sid = pick(pro.serviceIds)
      const svc = services.find((s) => s.id === sid)!
      const status: BookingStatus = offset < 0 ? (r() < 0.88 ? 'concluido' : 'cancelado') : r() < 0.93 ? 'confirmado' : 'cancelado'
      bookings.push({
        id: `b${bookings.length + 1}`,
        userId: pick(users).id,
        professionalId: pro.id,
        serviceId: svc.id,
        date: dayKey(d),
        time: pick(hours),
        status,
        price: svc.priceFrom + Math.round(r() * 4) * 10,
      })
    }
  }

  const courses = seedCourses.map((c) => ({ ...c, published: true }))
  const enrollments: Enrollment[] = []
  courses.forEach((c) => {
    const n = Math.min(c.seatsTaken, 14)
    for (let i = 0; i < n; i++)
      enrollments.push({ id: `e${enrollments.length + 1}`, userId: pick(users).id, courseId: c.id, createdAt: dayKey(addDays(-Math.floor(r() * 30))), status: c.seatsTaken >= c.seats && i > 10 ? 'lista de espera' : 'inscrito' })
  })

  const jobs = seedJobs.map((j) => ({ ...j, open: true }))
  const appStatuses: ApplicationStatus[] = ['nova', 'nova', 'em análise', 'aprovada', 'recusada']
  const applications: Application[] = []
  jobs.forEach((j) => {
    const n = 2 + Math.floor(r() * 6)
    for (let i = 0; i < n; i++)
      applications.push({ id: `a${applications.length + 1}`, userId: pick(users).id, jobId: j.id, createdAt: dayKey(addDays(-Math.floor(r() * 10))), status: pick(appStatuses) })
  })

  return { professionals, services, courses, jobs, users, bookings, enrollments, applications }
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const KEY = 'tesourinha-admin:v1'

type Collection = keyof DB
type Item<C extends Collection> = DB[C][number]

interface Store {
  db: DB
  upsert: <C extends Collection>(c: C, item: Item<C>) => void
  patch: <C extends Collection>(c: C, id: string, p: Partial<Item<C>>) => void
  remove: (c: Collection, id: string) => void
  reset: () => void
  session: string | null
  login: (email: string) => void
  logout: () => void
}

const Ctx = createContext<Store | null>(null)

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* ignora */
  }
  return seed()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load)
  const [session, setSession] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${KEY}:session`)
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch {
      /* ignora */
    }
  }, [db])

  const upsert = useCallback(<C extends Collection>(c: C, item: Item<C>) => {
    setDb((d) => {
      const list = d[c] as Item<C>[]
      const exists = list.some((x) => x.id === item.id)
      return { ...d, [c]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list] }
    })
  }, [])

  const patch = useCallback(<C extends Collection>(c: C, id: string, p: Partial<Item<C>>) => {
    setDb((d) => ({ ...d, [c]: (d[c] as Item<C>[]).map((x) => (x.id === id ? { ...x, ...p } : x)) }))
  }, [])

  const remove = useCallback((c: Collection, id: string) => {
    setDb((d) => ({ ...d, [c]: (d[c] as { id: string }[]).filter((x) => x.id !== id) }))
  }, [])

  const reset = useCallback(() => setDb(seed()), [])
  const login = useCallback((email: string) => {
    setSession(email)
    try {
      localStorage.setItem(`${KEY}:session`, email)
    } catch {
      /* ignora */
    }
  }, [])
  const logout = useCallback(() => {
    setSession(null)
    try {
      localStorage.removeItem(`${KEY}:session`)
    } catch {
      /* ignora */
    }
  }, [])

  const value = useMemo(() => ({ db, upsert, patch, remove, reset, session, login, logout }), [db, upsert, patch, remove, reset, session, login, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fora do StoreProvider')
  return s
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}
export const today = () => dayKey(new Date())
export const offsetDay = (n: number) => dayKey(addDays(n))
export const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
