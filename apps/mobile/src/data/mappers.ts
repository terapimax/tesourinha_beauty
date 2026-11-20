import type {
  Booking, BookingStatus, Course, CourseLevel, IconName, Job, JobType, Professional, Resume, Review, Service, UserProfile,
} from './types';

/** Conversões entre as linhas do Supabase (snake_case) e os tipos do app. Funções puras, fáceis de testar. */

const PALETTE = ['#FF8A3D', '#3A3A3C', '#E5560A', '#1C1C1E', '#FF6A13', '#5B5B60', '#C2410C'];

export function colorFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

type Row = Record<string, any>;

export const toService = (r: Row): Service => ({
  id: r.id,
  slug: r.slug ?? undefined,
  categoryId: r.category_id,
  name: r.name,
  description: r.description ?? '',
  durationMin: r.duration_min,
  priceFrom: Number(r.price_from),
  icon: (r.icon ?? 'sparkles-outline') as IconName,
});

export const toReview = (r: Row): Review => ({
  id: r.id,
  author: r.author_name ?? 'Cliente',
  rating: Number(r.rating),
  comment: r.comment ?? '',
  date: String(r.created_at).slice(0, 10),
});

/** "09:00:00" -> "09:00" */
const hhmm = (t: string) => t.slice(0, 5);

/** Gera os horários de início (HH:mm) de uma faixa de atendimento. */
export function slotsBetween(start: string, end: string, slotMinutes: number): string[] {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const out: string[] = [];
  for (let m = toMin(start); m + slotMinutes <= toMin(end); m += slotMinutes) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

export function toProfessional(
  r: Row,
  opts: { serviceIds: string[]; hours: Row[]; reviews: Row[] },
): Professional {
  const byDay: Record<number, string[]> = {};
  for (const h of opts.hours) {
    const list = slotsBetween(hhmm(h.start_time), hhmm(h.end_time), h.slot_minutes ?? r.slot_minutes ?? 60);
    byDay[h.weekday] = [...(byDay[h.weekday] ?? []), ...list].sort();
  }
  const all = [...new Set(Object.values(byDay).flat())].sort();
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    role: r.role,
    categoryIds: r.category_ids ?? [],
    serviceIds: opts.serviceIds,
    rating: Number(r.rating),
    reviewsCount: r.reviews_count,
    distanceKm: 0,
    neighborhood: r.neighborhood ?? '',
    bio: r.bio ?? '',
    yearsExperience: r.years_experience ?? 0,
    tesourinhaAlumni: !!r.tesourinha_alumni,
    avatarColor: colorFor(r.name),
    imageUrl: r.avatar_url ?? undefined,
    workingHours: all,
    hoursByWeekday: byDay,
    reviews: opts.reviews.map(toReview).sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export const toCourse = (r: Row, taken = 0): Course => ({
  id: r.id,
  slug: r.slug ?? undefined,
  title: r.title,
  subtitle: r.subtitle ?? '',
  categoryId: r.area,
  level: (r.level ?? 'Iniciante') as CourseLevel,
  durationHours: r.duration_hours,
  modality: r.modality,
  startDate: r.start_date ?? '',
  seats: r.seats,
  seatsTaken: taken,
  icon: (r.icon ?? 'school-outline') as IconName,
  description: r.description ?? '',
  modules: r.modules ?? [],
  certificate: !!r.certificate,
});

export const toJob = (r: Row): Job => ({
  id: r.id,
  slug: r.slug ?? undefined,
  title: r.title,
  company: r.company,
  location: r.location ?? '',
  type: r.job_type as JobType,
  salary: r.salary ?? undefined,
  postedAt: String(r.created_at).slice(0, 10),
  icon: (r.icon ?? 'briefcase-outline') as IconName,
  description: r.description ?? '',
  requirements: r.requirements ?? [],
  benefits: r.benefits ?? [],
});

export const toProfile = (r: Row, email: string): UserProfile => ({
  name: r.full_name,
  email,
  phone: r.phone ?? '',
  city: r.city ?? '',
});

export const toResume = (r: Row): Resume => ({
  fullName: r.full_name,
  phone: r.phone,
  email: r.email ?? '',
  city: r.city ?? '',
  role: r.role ?? '',
  experience: r.experience ?? '',
  about: r.about ?? '',
});

export const fromResume = (r: Resume, userId: string) => ({
  user_id: userId,
  full_name: r.fullName,
  phone: r.phone,
  email: r.email,
  city: r.city,
  role: r.role,
  experience: r.experience,
  about: r.about,
  updated_at: new Date().toISOString(),
});

/** Fuso do Brasil (sem horário de verão desde 2019): o horário local do salão é UTC-3. */
const BR_OFFSET = '-03:00';

/** "2026-12-01" + "14:00" -> ISO UTC */
export const toStartsAt = (date: string, time: string) => new Date(`${date}T${time}:00${BR_OFFSET}`).toISOString();

/** ISO UTC -> { date, time } no horário de Brasília */
export function fromStartsAt(iso: string): { date: string; time: string } {
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000);
  const s = d.toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}

export const toBooking = (r: Row): Booking => {
  const { date, time } = fromStartsAt(r.starts_at);
  const status: BookingStatus = r.status === 'cancelado' || r.status === 'nao_compareceu' ? 'cancelado' : r.status === 'concluido' ? 'concluido' : 'confirmado';
  return {
    id: r.id,
    professionalId: r.professional_id,
    serviceId: r.service_id,
    date,
    time,
    status,
    createdAt: r.created_at,
    notes: r.notes ?? undefined,
  };
};

/** Dia da semana (0 = domingo) de uma data YYYY-MM-DD. */
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();
