import { categories, courses, jobs, professionals, services } from './catalog';
import { toCourse, toJob, toProfessional, toService } from './mappers';
import type { Category, CategoryId } from './types';
import { supabase } from '@/lib/supabase';

/**
 * Carrega o catálogo do Supabase e SUBSTITUI o conteúdo dos arrays de catalog.ts (mesma referência),
 * assim as telas continuam importando `professionals`, `services` etc. sem mudar.
 * Em caso de erro ou banco vazio, mantém os dados de demonstração.
 */
export async function loadRemoteCatalog(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false };
  try {
    const [cat, svc, pro, ps, wh, rev, crs, cnt, jb] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('services').select('*').eq('active', true),
      supabase.from('professionals').select('*').eq('status', 'aprovado').eq('active', true),
      supabase.from('professional_services').select('professional_id, service_id'),
      supabase.from('working_hours').select('*'),
      supabase.from('reviews').select('*'),
      supabase.from('courses').select('*').eq('published', true).order('start_date'),
      supabase.from('course_enrollment_counts').select('*'),
      supabase.from('jobs').select('*').eq('open', true).order('created_at', { ascending: false }),
    ]);
    const failed = [cat, svc, pro, ps, wh, rev, crs, cnt, jb].find((r) => r.error);
    if (failed?.error) return { ok: false, error: failed.error.message };
    if (!pro.data?.length && !svc.data?.length) return { ok: false, error: 'catálogo vazio' };

    const taken = new Map((cnt.data ?? []).map((c) => [c.course_id as string, c.taken as number]));

    categories.splice(0, categories.length, ...((cat.data ?? []).map((c) => ({ id: c.id as CategoryId, name: c.name, icon: c.icon })) as Category[]));
    services.splice(0, services.length, ...(svc.data ?? []).map(toService));
    professionals.splice(
      0,
      professionals.length,
      ...[...(pro.data ?? [])].sort((a, b) => Number(b.rating) - Number(a.rating) || b.reviews_count - a.reviews_count).map((p) =>
        toProfessional(p, {
          serviceIds: (ps.data ?? []).filter((x) => x.professional_id === p.id).map((x) => x.service_id),
          hours: (wh.data ?? []).filter((h) => h.professional_id === p.id),
          reviews: (rev.data ?? []).filter((r) => r.professional_id === p.id),
        }),
      ),
    );
    courses.splice(0, courses.length, ...(crs.data ?? []).map((c) => toCourse(c, taken.get(c.id) ?? 0)));
    jobs.splice(0, jobs.length, ...(jb.data ?? []).map(toJob));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
