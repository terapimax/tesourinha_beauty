import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { loadRemoteCatalog } from '@/data/remote-catalog';
import { fromResume, toBooking, toProfile, toResume, toStartsAt } from '@/data/mappers';
import type { Booking, Resume, UserProfile } from '@/data/types';
import { friendlyError, isRemote, supabase } from '@/lib/supabase';

/**
 * Estado global do app.
 *
 * - Com Supabase configurado (EXPO_PUBLIC_SUPABASE_*): login real, e agendamentos, favoritos,
 *   inscrições, candidaturas e currículo ficam no banco (protegidos por RLS).
 * - Sem as variáveis: "modo demonstração", tudo local com AsyncStorage.
 *
 * As telas usam sempre a mesma interface (useApp).
 */

interface UserData {
  user: UserProfile | null;
  favorites: string[]; // ids de profissionais
  bookings: Booking[];
  enrollments: string[]; // ids de cursos
  applications: string[]; // ids de vagas
  resume: Resume | null;
}

const empty: UserData = { user: null, favorites: [], bookings: [], enrollments: [], applications: [], resume: null };

const STORAGE_KEY = 'tesourinha:v1';

export interface Availability {
  /** Horários (HH:mm) já ocupados no dia. */
  busy: Set<string>;
  /** O profissional marcou folga neste dia. */
  dayOff: boolean;
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

interface AppStore extends UserData {
  ready: boolean;
  /** true quando conectado ao Supabase; false no modo demonstração. */
  remote: boolean;
  /** Modo demonstração: entra sem senha. */
  signIn: (user: UserProfile) => void;
  signInWithEmail: (email: string, password: string) => Promise<Result>;
  signUpWithEmail: (data: { name: string; email: string; phone: string; password: string }) => Promise<Result<{ needsConfirmation: boolean }>>;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  toggleFavorite: (professionalId: string) => void;
  isFavorite: (professionalId: string) => boolean;
  createBooking: (b: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<Result<Booking>>;
  cancelBooking: (id: string) => void;
  getAvailability: (professionalId: string, day: string) => Promise<Availability>;
  enroll: (courseId: string) => void;
  apply: (jobId: string) => void;
  saveResume: (r: Resume) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserData>(empty);
  const [ready, setReady] = useState(false);
  const userId = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const loadUserData = useCallback(async (uid: string, email?: string) => {
    if (!supabase) return;
    const [profile, bookings, favs, enr, apps, resume] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('bookings').select('*').eq('user_id', uid).order('starts_at', { ascending: false }),
      supabase.from('favorites').select('professional_id').eq('user_id', uid),
      supabase.from('enrollments').select('course_id, status').eq('user_id', uid),
      supabase.from('applications').select('job_id').eq('user_id', uid),
      supabase.from('resumes').select('*').eq('user_id', uid).maybeSingle(),
    ]);
    setState((s) => ({
      user: profile.data ? toProfile(profile.data, email ?? s.user?.email ?? '') : s.user,
      bookings: bookings.error ? s.bookings : (bookings.data ?? []).map(toBooking),
      favorites: favs.error ? s.favorites : (favs.data ?? []).map((f) => f.professional_id),
      enrollments: enr.error ? s.enrollments : (enr.data ?? []).filter((e) => e.status !== 'cancelado').map((e) => e.course_id),
      applications: apps.error ? s.applications : (apps.data ?? []).map((a) => a.job_id),
      resume: resume.data ? toResume(resume.data) : s.resume,
    }));
  }, []);

  /** Sincroniza com o banco; em caso de erro, recarrega o estado verdadeiro. */
  const sync = useCallback(async (run: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await run();
    if (error) {
      console.warn('[supabase]', error.message);
      if (userId.current) void loadUserData(userId.current);
    }
  }, [loadUserData]);

  // Inicialização: catálogo + sessão (remoto) ou AsyncStorage (demonstração).
  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      AsyncStorage.getItem(STORAGE_KEY)
        .then((raw) => {
          if (raw && !cancelled) setState({ ...empty, ...JSON.parse(raw) });
        })
        .catch(() => {})
        .finally(() => !cancelled && setReady(true));
      return () => { cancelled = true; };
    }

    const applySession = async (session: Session | null) => {
      if (session) {
        userId.current = session.user.id;
        await loadUserData(session.user.id, session.user.email ?? '');
      } else {
        userId.current = null;
        setState(empty);
      }
    };

    (async () => {
      const [, { data }] = await Promise.all([loadRemoteCatalog(), supabase.auth.getSession()]);
      if (cancelled) return;
      await applySession(data.session);
      if (!cancelled) setReady(true);
    })().catch(() => !cancelled && setReady(true));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // O carregamento inicial acima já cuida de INITIAL_SESSION.
      if (event === 'INITIAL_SESSION') return;
      // Adia para fora do callback (o supabase-js recomenda não chamar o cliente de dentro dele).
      setTimeout(() => void applySession(session), 0);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [loadUserData]);

  // Persistência local somente no modo demonstração.
  useEffect(() => {
    if (!ready || isRemote) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const signIn = useCallback((user: UserProfile) => setState((s) => ({ ...s, user })), []);

  const signInWithEmail = useCallback<AppStore['signInWithEmail']>(async (email, password) => {
    if (!supabase) return { ok: false, error: 'Servidor não configurado.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.session) return { ok: false, error: friendlyError(error) };
    userId.current = data.session.user.id;
    await loadUserData(data.session.user.id, data.session.user.email ?? email);
    return { ok: true, data: undefined };
  }, [loadUserData]);

  const signUpWithEmail = useCallback<AppStore['signUpWithEmail']>(async ({ name, email, phone, password }) => {
    if (!supabase) return { ok: false, error: 'Servidor não configurado.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim(), phone: phone.trim() || null } },
    });
    if (error) return { ok: false, error: friendlyError(error) };
    // Com "Confirm email" ligado no Supabase, não vem sessão até o e-mail ser confirmado.
    if (!data.session) return { ok: true, data: { needsConfirmation: true } };
    userId.current = data.session.user.id;
    await loadUserData(data.session.user.id, data.session.user.email ?? email);
    return { ok: true, data: { needsConfirmation: false } };
  }, [loadUserData]);

  const signOut = useCallback(() => {
    if (supabase) {
      userId.current = null;
      void supabase.auth.signOut();
    }
    setState(empty);
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
    if (supabase && userId.current) {
      const row: Record<string, string> = {};
      if (patch.name !== undefined) row.full_name = patch.name;
      if (patch.phone !== undefined) row.phone = patch.phone;
      if (patch.city !== undefined) row.city = patch.city;
      if (Object.keys(row).length) void sync(() => supabase!.from('profiles').update(row).eq('id', userId.current!));
    }
  }, [sync]);

  const toggleFavorite = useCallback((id: string) => {
    const adding = !stateRef.current.favorites.includes(id);
    setState((s) => ({ ...s, favorites: adding ? (s.favorites.includes(id) ? s.favorites : [...s.favorites, id]) : s.favorites.filter((f) => f !== id) }));
    if (supabase && userId.current) {
      const uid = userId.current;
      void sync(() =>
        adding
          ? supabase!.from('favorites').insert({ user_id: uid, professional_id: id })
          : supabase!.from('favorites').delete().eq('user_id', uid).eq('professional_id', id),
      );
    }
  }, [sync]);
  const isFavorite = useCallback((id: string) => state.favorites.includes(id), [state.favorites]);

  const createBooking = useCallback<AppStore['createBooking']>(async (b) => {
    if (supabase && userId.current) {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId.current,
          professional_id: b.professionalId,
          service_id: b.serviceId,
          starts_at: toStartsAt(b.date, b.time),
          notes: b.notes ?? null,
        })
        .select('*')
        .single();
      if (error || !data) return { ok: false, error: friendlyError(error) };
      const booking = toBooking(data);
      setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
      return { ok: true, data: booking };
    }
    const booking: Booking = { ...b, id: `b-${Date.now()}`, status: 'confirmado', createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
    return { ok: true, data: booking };
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelado' } : b)) }));
    if (supabase && userId.current) void sync(() => supabase!.from('bookings').update({ status: 'cancelado' }).eq('id', id));
  }, [sync]);

  const getAvailability = useCallback<AppStore['getAvailability']>(async (professionalId, day) => {
    const busy = new Set<string>();
    let dayOff = false;
    if (supabase) {
      const from = toStartsAt(day, '00:00');
      const to = toStartsAt(day, '23:59');
      const [slots, off] = await Promise.all([
        supabase.from('professional_busy_slots').select('starts_at, duration_min').eq('professional_id', professionalId).gte('starts_at', from).lte('starts_at', to),
        supabase.from('professional_days_off').select('day').eq('professional_id', professionalId).eq('day', day),
      ]);
      for (const r of slots.data ?? []) {
        const t = toBooking({ starts_at: r.starts_at, id: '', professional_id: '', service_id: '', created_at: '', status: 'confirmado' });
        busy.add(t.time);
      }
      dayOff = (off.data ?? []).length > 0;
    }
    return { busy, dayOff };
  }, []);

  const enroll = useCallback((id: string) => {
    if (stateRef.current.enrollments.includes(id)) return;
    setState((s) => (s.enrollments.includes(id) ? s : { ...s, enrollments: [...s.enrollments, id] }));
    if (supabase && userId.current) void sync(() => supabase!.from('enrollments').insert({ course_id: id, user_id: userId.current! }));
  }, [sync]);

  const apply = useCallback((id: string) => {
    if (stateRef.current.applications.includes(id)) return;
    setState((s) => (s.applications.includes(id) ? s : { ...s, applications: [...s.applications, id] }));
    if (supabase && userId.current) void sync(() => supabase!.from('applications').insert({ job_id: id, user_id: userId.current! }));
  }, [sync]);

  const saveResume = useCallback((resume: Resume) => {
    setState((s) => ({ ...s, resume }));
    if (supabase && userId.current) void sync(() => supabase!.from('resumes').upsert(fromResume(resume, userId.current!)));
  }, [sync]);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      ready,
      remote: isRemote,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateUser,
      toggleFavorite,
      isFavorite,
      createBooking,
      cancelBooking,
      getAvailability,
      enroll,
      apply,
      saveResume,
    }),
    [state, ready, signIn, signInWithEmail, signUpWithEmail, signOut, updateUser, toggleFavorite, isFavorite, createBooking, cancelBooking, getAvailability, enroll, apply, saveResume],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
