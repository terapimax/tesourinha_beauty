import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase. Só existe quando as variáveis de ambiente estão configuradas;
 * sem elas o app funciona em "modo demonstração", com dados locais.
 *
 * EXPO_PUBLIC_SUPABASE_URL      -> Project URL
 * EXPO_PUBLIC_SUPABASE_ANON_KEY -> chave "anon" (pública). Nunca use a service_role aqui.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isRemote = supabase !== null;

/** Traduz erros comuns do Supabase para mensagens amigáveis. */
export function friendlyError(error: { message?: string; code?: string } | null | undefined): string {
  const msg = (error?.message ?? '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'Este e-mail já tem cadastro. Use "Entrar".';
  if (msg.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde um instante e tente de novo.';
  if (error?.code === '23505' || msg.includes('duplicate key')) return 'Este horário acabou de ser reservado. Escolha outro.';
  if (msg.includes('network') || msg.includes('failed to fetch')) return 'Sem conexão. Verifique sua internet.';
  return error?.message ?? 'Algo deu errado. Tente novamente.';
}
