import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_WEEK, demoState } from '@/pro/demo';
import { fromMin, nowMin, todayKey, toMin, weekdayOf } from '@/pro/time';
import type { Appointment, AppointmentStatus, OfferedService, ProProfile, ProState, WorkDay } from '@/pro/types';

/**
 * Estado global do Tesourinha Pro (MVP), salvo no aparelho com AsyncStorage.
 * A interface foi pensada para ser trocada por chamadas ao Supabase sem mudar as telas
 * (ver supabase/migrations/0002_profissional.sql).
 */

const STORAGE_KEY = 'tesourinha-pro:v1';

const empty: ProState = {
  profile: null,
  approval: 'em_analise',
  rating: 0,
  reviews: [],
  services: [],
  week: DEFAULT_WEEK,
  slotMinutes: 30,
  timeOff: [],
  appointments: [],
};

export type NewAppointment = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'source'>;

interface ProStore extends ProState {
  ready: boolean;
  signInDemo: (email: string) => void;
  signUp: (profile: ProProfile) => void;
  approve: () => void;
  signOut: () => void;
  updateProfile: (patch: Partial<ProProfile>) => void;
  setStatus: (id: string, status: AppointmentStatus) => void;
  addAppointment: (a: NewAppointment) => Appointment;
  offers: (serviceId: string) => OfferedService | undefined;
  toggleService: (serviceId: string, defaults: OfferedService) => void;
  updateService: (serviceId: string, patch: Partial<OfferedService>) => void;
  setWorkDay: (weekday: number, patch: Partial<WorkDay>) => void;
  setSlotMinutes: (min: number) => void;
  addTimeOff: (date: string, reason: string) => void;
  removeTimeOff: (id: string) => void;
  /** Horários livres para um serviço de `durationMin` minutos na data. */
  freeSlots: (date: string, durationMin: number) => string[];
  isDayOff: (date: string) => boolean;
}

const Ctx = createContext<ProStore | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...empty, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const signInDemo = useCallback((email: string) => setState(demoState(email)), []);
  const signUp = useCallback((profile: ProProfile) => setState({ ...empty, profile, approval: 'em_analise' }), []);
  const approve = useCallback(() => setState((s) => ({ ...s, approval: 'aprovado' })), []);
  const signOut = useCallback(() => setState(empty), []);
  const updateProfile = useCallback(
    (patch: Partial<ProProfile>) => setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s)),
    [],
  );

  const setStatus = useCallback(
    (id: string, status: AppointmentStatus) =>
      setState((s) => ({ ...s, appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)) })),
    [],
  );

  const addAppointment = useCallback((a: NewAppointment) => {
    const appt: Appointment = { ...a, id: `a-${Date.now()}`, status: 'confirmado', source: 'encaixe', createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, appointments: [...s.appointments, appt] }));
    return appt;
  }, []);

  const offers = useCallback((serviceId: string) => state.services.find((o) => o.serviceId === serviceId), [state.services]);

  const toggleService = useCallback(
    (serviceId: string, defaults: OfferedService) =>
      setState((s) => ({
        ...s,
        services: s.services.some((o) => o.serviceId === serviceId)
          ? s.services.filter((o) => o.serviceId !== serviceId)
          : [...s.services, defaults],
      })),
    [],
  );

  const updateService = useCallback(
    (serviceId: string, patch: Partial<OfferedService>) =>
      setState((s) => ({ ...s, services: s.services.map((o) => (o.serviceId === serviceId ? { ...o, ...patch } : o)) })),
    [],
  );

  const setWorkDay = useCallback(
    (weekday: number, patch: Partial<WorkDay>) =>
      setState((s) => ({ ...s, week: s.week.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)) })),
    [],
  );

  const setSlotMinutes = useCallback((slotMinutes: number) => setState((s) => ({ ...s, slotMinutes })), []);

  const addTimeOff = useCallback(
    (date: string, reason: string) =>
      setState((s) =>
        s.timeOff.some((t) => t.date === date)
          ? s
          : { ...s, timeOff: [...s.timeOff, { id: `t-${Date.now()}`, date, reason }].sort((a, b) => a.date.localeCompare(b.date)) },
      ),
    [],
  );
  const removeTimeOff = useCallback((id: string) => setState((s) => ({ ...s, timeOff: s.timeOff.filter((t) => t.id !== id) })), []);

  const isDayOff = useCallback(
    (date: string) => !state.week[weekdayOf(date)]?.enabled || state.timeOff.some((t) => t.date === date),
    [state.week, state.timeOff],
  );

  const freeSlots = useCallback(
    (date: string, durationMin: number) => {
      if (isDayOff(date)) return [];
      const day = state.week[weekdayOf(date)]!;
      const busy = state.appointments
        .filter((a) => a.date === date && (a.status === 'confirmado' || a.status === 'concluido'))
        .map((a) => [toMin(a.time), toMin(a.time) + a.durationMin] as const);
      const isToday = date === todayKey();
      const out: string[] = [];
      for (let t = toMin(day.start); t + durationMin <= toMin(day.end); t += state.slotMinutes) {
        if (isToday && t <= nowMin()) continue;
        if (busy.some(([s, e]) => t < e && t + durationMin > s)) continue;
        out.push(fromMin(t));
      }
      return out;
    },
    [isDayOff, state.week, state.appointments, state.slotMinutes],
  );

  const value = useMemo<ProStore>(
    () => ({
      ...state,
      ready,
      signInDemo,
      signUp,
      approve,
      signOut,
      updateProfile,
      setStatus,
      addAppointment,
      offers,
      toggleService,
      updateService,
      setWorkDay,
      setSlotMinutes,
      addTimeOff,
      removeTimeOff,
      freeSlots,
      isDayOff,
    }),
    [state, ready, signInDemo, signUp, approve, signOut, updateProfile, setStatus, addAppointment, offers, toggleService, updateService, setWorkDay, setSlotMinutes, addTimeOff, removeTimeOff, freeSlots, isDayOff],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePro() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePro must be used within ProProvider');
  return ctx;
}

/** Atendimentos de um dia, em ordem de horário. */
export function dayAppointments(appointments: Appointment[], date: string) {
  return appointments.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time));
}
