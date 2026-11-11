import { findProfessional, findService } from '@/data/catalog';
import type { Review } from '@/data/types';
import { addDays, fromMin, isPast, todayKey, toMin, weekdayOf } from './time';
import type { Appointment, OfferedService, ProProfile, ProState, WorkDay } from './types';

/**
 * Conta de demonstração: a Ana Paula do catálogo, com agenda gerada em torno de hoje
 * para que a demo sempre tenha movimento. Em produção tudo isso vem do Supabase.
 */

export const DEFAULT_WEEK: WorkDay[] = [
  { weekday: 0, enabled: false, start: '09:00', end: '13:00' },
  { weekday: 1, enabled: true, start: '09:00', end: '19:00' },
  { weekday: 2, enabled: true, start: '09:00', end: '19:00' },
  { weekday: 3, enabled: true, start: '09:00', end: '19:00' },
  { weekday: 4, enabled: true, start: '09:00', end: '19:00' },
  { weekday: 5, enabled: true, start: '09:00', end: '19:00' },
  { weekday: 6, enabled: true, start: '09:00', end: '15:00' },
];

const CLIENTS = [
  'Juliana Martins', 'Patrícia Souza', 'Camila Ribeiro', 'Beatriz Santos', 'Larissa Oliveira', 'Aline Ferreira',
  'Vanessa Lima', 'Gabriela Rocha', 'Tatiane Alves', 'Renata Gomes', 'Daniela Costa', 'Priscila Nunes',
  'Fernanda Dias', 'Carolina Teixeira', 'Bruna Carvalho', 'Letícia Moura', 'Mônica Araújo', 'Sabrina Pires',
];

const NOTES = [
  'Quer manter o comprimento, só tirar as pontas.',
  'Cabelo com química, usar produtos sem sulfato.',
  'Prefere ser atendida pontualmente, tem compromisso depois.',
  'Primeira vez, veio por indicação da Juliana.',
];

const EXTRA_REVIEWS: Review[] = [
  { id: 'rd1', author: 'Beatriz S.', rating: 5, comment: 'Corte lindo e a escova durou a semana toda!', date: '2026-11-05' },
  { id: 'rd2', author: 'Larissa O.', rating: 4, comment: 'Ótimo resultado, só atrasou uns 10 minutos.', date: '2026-10-25' },
  { id: 'rd3', author: 'Aline F.', rating: 5, comment: 'Profissional atenciosa, explicou todo o cuidado em casa.', date: '2026-10-18' },
];

/** Gerador pseudoaleatório determinístico (mesma demo a cada login). */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const phoneFor = (i: number) => `(11) 9${String(8100 + ((i * 37) % 1800)).padStart(4, '0')}-${String(1000 + ((i * 7919) % 9000)).padStart(4, '0')}`;

function seedAppointments(services: OfferedService[], week: WorkDay[]): Appointment[] {
  const rand = rng(20261111);
  const today = todayKey();
  const out: Appointment[] = [];
  let n = 0;

  for (let offset = -35; offset <= 12; offset++) {
    const date = addDays(today, offset);
    const day = week[weekdayOf(date)];
    if (!day?.enabled) continue;
    const isToday = offset === 0;
    const target = isToday ? 5 : Math.floor(rand() * 4) + (offset > 7 ? 0 : 2);
    let cursor = toMin(day.start) + (rand() < 0.4 ? 60 : 0);
    const end = toMin(day.end);

    for (let k = 0; k < target; k++) {
      const svc = services[Math.floor(rand() * services.length)]!;
      if (cursor + svc.durationMin > end) break;
      const time = fromMin(cursor);
      const clientIdx = Math.floor(rand() * CLIENTS.length);
      const past = isPast(date, time);
      let status: Appointment['status'] = 'confirmado';
      if (past) {
        const r = rand();
        status = r < 0.86 ? 'concluido' : r < 0.94 ? 'cancelado' : 'nao_compareceu';
      } else if (rand() < 0.05) {
        status = 'cancelado';
      }
      out.push({
        id: `a-${++n}`,
        clientName: CLIENTS[clientIdx]!,
        clientPhone: phoneFor(clientIdx),
        serviceId: svc.serviceId,
        date,
        time,
        durationMin: svc.durationMin,
        price: svc.price,
        status,
        source: rand() < 0.85 ? 'app' : 'encaixe',
        notes: rand() < 0.3 ? NOTES[Math.floor(rand() * NOTES.length)] : undefined,
        firstVisit: rand() < 0.2,
        createdAt: new Date().toISOString(),
      });
      // intervalo entre atendimentos: 0, 30 ou 60 min
      cursor += Math.ceil(svc.durationMin / 30) * 30 + [0, 30, 60][Math.floor(rand() * 3)]!;
    }
  }

  // Hoje: o atendimento mais recente que já passou fica "confirmado" para mostrar a ação pendente.
  const todayPast = out.filter((a) => a.date === today && isPast(a.date, a.time));
  const last = todayPast[todayPast.length - 1];
  if (last) last.status = 'confirmado';
  return out;
}

export function demoState(email: string): ProState {
  const ana = findProfessional('p-ana')!;
  const services: OfferedService[] = ana.serviceIds.map((id) => {
    const s = findService(id)!;
    return { serviceId: id, price: s.priceFrom + (id === 's-coloracao' ? 30 : 10), durationMin: s.durationMin };
  });
  const profile: ProProfile = {
    name: ana.name,
    email,
    phone: '(11) 98123-4567',
    role: ana.role,
    bio: ana.bio,
    neighborhood: ana.neighborhood,
    yearsExperience: ana.yearsExperience,
    tesourinhaAlumni: ana.tesourinhaAlumni,
    categoryIds: ana.categoryIds,
    avatarColor: ana.avatarColor,
  };
  return {
    profile,
    approval: 'aprovado',
    rating: ana.rating,
    reviews: [...ana.reviews, ...EXTRA_REVIEWS].sort((a, b) => b.date.localeCompare(a.date)),
    services,
    week: DEFAULT_WEEK,
    slotMinutes: 30,
    timeOff: [{ id: 't-1', date: addDays(todayKey(), 9), reason: 'Curso de colorimetria na Associação' }],
    appointments: seedAppointments(services, DEFAULT_WEEK),
  };
}
