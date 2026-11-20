-- Tesourinha Beauty · ajustes de catálogo para o app do cliente ler tudo do Supabase.

-- Avaliações de demonstração não têm usuário real: guardamos o nome do autor.
alter table public.reviews
  alter column user_id drop not null,
  add column author_name text,
  add constraint reviews_has_author check (user_id is not null or author_name is not null);

-- Ícone (nome Ionicons) de cursos e vagas
alter table public.courses add column icon text;
alter table public.jobs add column icon text;

-- "slug": identificador curto e estável (ex.: 'p-ana'). Links antigos, como os da landing page,
-- continuam funcionando porque o app aceita o id (uuid) ou o slug.
alter table public.services add column slug text unique;
alter table public.professionals add column slug text unique;
alter table public.courses add column slug text unique;
alter table public.jobs add column slug text unique;

-- Vagas ocupadas por curso (a tabela enrollments é privada, então contamos numa view pública)
create view public.course_enrollment_counts as
  select c.id as course_id, count(e.id) filter (where e.status in ('inscrito', 'concluído'))::int as taken
  from public.courses c
  left join public.enrollments e on e.course_id = c.id
  group by c.id;

grant select on public.course_enrollment_counts to anon, authenticated;

-- Nota e quantidade de avaliações do profissional acompanham as avaliações reais
create or replace function public.refresh_professional_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.professional_id, old.professional_id);
begin
  update public.professionals p
  set rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where professional_id = pid), 5.0),
      reviews_count = (select count(*) from public.reviews where professional_id = pid)
  where p.id = pid;
  return null;
end $$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_professional_rating();

-- A trava de campos do profissional (0002) não deve barrar:
--  - atualizações feitas por outros gatilhos (como o cálculo da nota acima);
--  - quem não está logado como usuário do app (SQL Editor / service role do Supabase).
create or replace function public.protect_professional_fields()
returns trigger language plpgsql as $$
begin
  if pg_trigger_depth() = 1 and auth.uid() is not null and not public.is_admin() and (
    new.status is distinct from old.status
    or new.rating is distinct from old.rating
    or new.reviews_count is distinct from old.reviews_count
    or new.tesourinha_alumni is distinct from old.tesourinha_alumni
    or new.profile_id is distinct from old.profile_id
  ) then
    raise exception 'Somente administradores podem alterar estes campos do profissional';
  end if;
  return new;
end $$;

-- Mesma regra para o papel do usuário (0001): o SQL Editor do Supabase pode promover alguém a admin.
create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Somente administradores podem alterar o papel do usuário';
  end if;
  return new;
end $$;
