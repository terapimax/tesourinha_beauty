import { addDays, weekdayOf } from './time';
import type { Appointment } from './types';

/** Segunda-feira da semana da data. */
export const startOfWeek = (iso: string) => addDays(iso, -((weekdayOf(iso) + 6) % 7));

export const startOfMonth = (iso: string) => `${iso.slice(0, 7)}-01`;

/** Primeiro dia do mês seguinte. */
export const nextMonth = (iso: string) => {
  const [y, m] = iso.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
};

/** Atendimentos com data em [from, to). */
export const inRange = (list: Appointment[], from: string, to: string) => list.filter((a) => a.date >= from && a.date < to);

export const done = (list: Appointment[]) => list.filter((a) => a.status === 'concluido');

export const total = (list: Appointment[]) => list.reduce((sum, a) => sum + a.price, 0);
