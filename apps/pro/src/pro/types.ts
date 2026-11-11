import type { CategoryId, Review } from '@/data/types';

/** Tipos exclusivos do app do profissional (Tesourinha Pro). */

export type AppointmentStatus = 'confirmado' | 'concluido' | 'cancelado' | 'nao_compareceu';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  /** "app" = cliente agendou pelo Tesourinha Beauty; "encaixe" = lançado pelo próprio profissional */
  source: 'app' | 'encaixe';
  notes?: string;
  firstVisit?: boolean;
  createdAt: string;
}

/** Serviço do catálogo que o profissional oferece, com preço e duração próprios. */
export interface OfferedService {
  serviceId: string;
  price: number;
  durationMin: number;
}

/** Expediente de um dia da semana (0 = domingo). */
export interface WorkDay {
  weekday: number;
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
}

/** Dia bloqueado (folga, curso, compromisso). */
export interface TimeOff {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface ProProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  neighborhood: string;
  yearsExperience: number;
  tesourinhaAlumni: boolean;
  categoryIds: CategoryId[];
  avatarColor: string;
}

/** Cadastro novo passa por análise da Associação (feita no painel admin). */
export type ApprovalStatus = 'em_analise' | 'aprovado';

export interface ProState {
  profile: ProProfile | null;
  approval: ApprovalStatus;
  rating: number;
  reviews: Review[];
  services: OfferedService[];
  week: WorkDay[];
  slotMinutes: number;
  timeOff: TimeOff[];
  appointments: Appointment[];
}
