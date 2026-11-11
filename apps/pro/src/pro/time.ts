import { toDayKey } from '@/lib/format';

/** "09:30" → 570 */
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** 570 → "09:30" */
export const fromMin = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export const endTime = (start: string, durationMin: number) => fromMin(toMin(start) + durationMin);

export const todayKey = () => toDayKey(new Date());

export const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/** Soma dias a uma data "YYYY-MM-DD". */
export const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toDayKey(new Date(y, m - 1, d + days));
};

export const weekdayOf = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

/** Data/hora do agendamento já passou? */
export const isPast = (date: string, time: string) => {
  const today = todayKey();
  return date < today || (date === today && toMin(time) <= nowMin());
};

export const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Atendimento ainda "confirmado" cujo horário já terminou: precisa ser finalizado. */
export const needsAction = (a: { status: string; date: string; time: string; durationMin: number }) =>
  a.status === 'confirmado' && isPast(a.date, fromMin(toMin(a.time) + a.durationMin));
