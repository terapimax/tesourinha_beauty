const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatPrice = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

/** Converte "YYYY-MM-DD" em Date local (sem fuso). */
export const parseDay = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toDayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const monthLabel = (d: Date) => `${capitalize(MONTHS[d.getMonth()])} ${d.getFullYear()}`;

export const formatDayLong = (iso: string) => {
  const d = parseDay(iso);
  return `${capitalize(WEEKDAYS[d.getDay()])}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

export const formatDayShort = (iso: string) => {
  const d = parseDay(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export const dayParts = (iso: string) => {
  const d = parseDay(iso);
  return { day: String(d.getDate()).padStart(2, '0'), month: MONTHS_SHORT[d.getMonth()].toUpperCase(), weekday: WEEKDAYS[d.getDay()] };
};

export const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - parseDay(iso).getTime()) / 86400000);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 30) return `há ${diff} dias`;
  return formatDayShort(iso);
};

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};
