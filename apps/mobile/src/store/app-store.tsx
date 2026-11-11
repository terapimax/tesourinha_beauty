import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Booking, Resume, UserProfile } from '@/data/types';

/**
 * Estado global do app (MVP). Persistido localmente com AsyncStorage.
 * A interface foi pensada para ser trocada por chamadas ao Supabase
 * sem mudar as telas.
 */

interface PersistedState {
  user: UserProfile | null;
  favorites: string[]; // ids de profissionais
  bookings: Booking[];
  enrollments: string[]; // ids de cursos
  applications: string[]; // ids de vagas
  resume: Resume | null;
}

const initialState: PersistedState = {
  user: null,
  favorites: [],
  bookings: [],
  enrollments: [],
  applications: [],
  resume: null,
};

const STORAGE_KEY = 'tesourinha:v1';

interface AppStore extends PersistedState {
  ready: boolean;
  signIn: (user: UserProfile) => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  toggleFavorite: (professionalId: string) => void;
  isFavorite: (professionalId: string) => boolean;
  createBooking: (b: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Booking;
  cancelBooking: (id: string) => void;
  enroll: (courseId: string) => void;
  apply: (jobId: string) => void;
  saveResume: (r: Resume) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const signIn = useCallback((user: UserProfile) => setState((s) => ({ ...s, user })), []);
  const signOut = useCallback(() => setState(initialState), []);
  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s)),
    [],
  );
  const toggleFavorite = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
      })),
    [],
  );
  const isFavorite = useCallback((id: string) => state.favorites.includes(id), [state.favorites]);

  const createBooking = useCallback((b: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const booking: Booking = {
      ...b,
      id: `b-${Date.now()}`,
      status: 'confirmado',
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
    return booking;
  }, []);

  const cancelBooking = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelado' } : b)),
      })),
    [],
  );

  const enroll = useCallback(
    (id: string) => setState((s) => (s.enrollments.includes(id) ? s : { ...s, enrollments: [...s.enrollments, id] })),
    [],
  );
  const apply = useCallback(
    (id: string) => setState((s) => (s.applications.includes(id) ? s : { ...s, applications: [...s.applications, id] })),
    [],
  );
  const saveResume = useCallback((resume: Resume) => setState((s) => ({ ...s, resume })), []);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      ready,
      signIn,
      signOut,
      updateUser,
      toggleFavorite,
      isFavorite,
      createBooking,
      cancelBooking,
      enroll,
      apply,
      saveResume,
    }),
    [state, ready, signIn, signOut, updateUser, toggleFavorite, isFavorite, createBooking, cancelBooking, enroll, apply, saveResume],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
