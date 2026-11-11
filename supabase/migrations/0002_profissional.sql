-- Tesourinha Beauty · app do profissional (Tesourinha Pro)
-- Cadastro com aprovação, agenda própria, folgas, encaixes e permissões (RLS) do profissional.

-- ---------------------------------------------------------------
-- Status do atendimento: "não compareceu"
-- (ADD VALUE não pode ser usado na mesma transação; nada abaixo usa o valor novo)
-- ---------------------------------------------------------------
alter type booking_status add value if not exists 'nao_compareceu';

-- ---------------------------------------------------------------
-- Profissionais: aprovação pela Associação e dados do perfil
-- ---------------------------------------------------------------
create type professional_status as enum ('em_analise', 'aprovado', 'suspenso');

alter table public.professionals
  add column status professional_status not null default 'em_analise',
  add column phone text,
  add column category_ids text[] not null default '{}',
  add column slot_minutes int not null default 30 check (slot_minutes in (15, 30, 60));

-- Profissionais já cadastrados pelo painel continuam visíveis
update public.professionals set status = 'aprovado';

create unique index professionals_one_per_profile on public.professionals (profile_id) where profile_id is not null;

-- Preço e duração próprios por serviço
alter table public.professional_services add column duration_min int check (duration_min > 0);

-- Id do profissional do usuário logado (ou null)
create or replace function public.my_professional_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.professionals where profile_id = auth.uid();
$$;

-- Profissional não altera sozinho status, nota, avaliações nem selo de ex-aluno
create or replace function public.protect_professional_fields()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() and (
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

create trigger professionals_protect_fields
  before update on public.professionals
  for each row execute function public.protect_professional_fields();

-- Ao aprovar, o perfil do usuário passa a ter o papel "profissional"
create or replace function public.on_professional_approved()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'aprovado' and old.status is distinct from 'aprovado' and new.profile_id is not null then
    update public.profiles set role = 'profissional' where id = new.profile_id and role = 'cliente';
  end if;
  return new;
end $$;

create trigger professionals_approved
  after update of status on public.professionals
  for each row execute function public.on_professional_approved();

-- ---------------------------------------------------------------
-- Folgas e bloqueios de agenda
-- ---------------------------------------------------------------
create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  day date not null,
  reason text,                       -- visível só para o profissional e o admin
  created_at timestamptz not null default now(),
  unique (professional_id, day)
);
alter table public.time_off enable row level security;

-- ---------------------------------------------------------------
-- Agendamentos: encaixes lançados pelo profissional
-- ---------------------------------------------------------------
alter table public.bookings
  alter column user_id drop not null,
  add column source text not null default 'app' check (source in ('app', 'encaixe')),
  add column client_name text,
  add column client_phone text,
  add column duration_min int check (duration_min > 0),
  add constraint bookings_has_client check (user_id is not null or client_name is not null);

-- ---------------------------------------------------------------
-- Disponibilidade pública (sem expor dados de clientes)
-- Views rodam com as permissões do dono, por isso mostram só o necessário.
-- ---------------------------------------------------------------
create view public.professional_busy_slots as
  select b.professional_id, b.starts_at, coalesce(b.duration_min, s.duration_min) as duration_min
  from public.bookings b
  join public.services s on s.id = b.service_id
  where b.status = 'confirmado' and b.starts_at >= now() - interval '1 day';

create view public.professional_days_off as
  select professional_id, day from public.time_off where day >= current_date;

grant select on public.professional_busy_slots, public.professional_days_off to anon, authenticated;

-- ---------------------------------------------------------------
-- RLS do profissional
-- ---------------------------------------------------------------

-- Catálogo: só aparece profissional aprovado e ativo; o próprio profissional se vê sempre
drop policy "profissionais ativos" on public.professionals;
create policy "profissionais aprovados" on public.professionals for select
  using ((active and status = 'aprovado') or profile_id = auth.uid() or public.is_admin());

create policy "cadastrar-se como profissional" on public.professionals for insert
  with check (profile_id = auth.uid() and status = 'em_analise');

create policy "editar meu perfil profissional" on public.professionals for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Serviços, horários e folgas do próprio profissional
create policy "meus serviços" on public.professional_services for all
  using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "meus horários" on public.working_hours for all
  using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "minhas folgas" on public.time_off for all
  using (professional_id = public.my_professional_id() or public.is_admin())
  with check (professional_id = public.my_professional_id() or public.is_admin());

-- Agenda: o profissional vê e atualiza (concluir, não compareceu, cancelar) os próprios atendimentos
create policy "agenda do profissional" on public.bookings for select
  using (professional_id = public.my_professional_id());

create policy "atualizar atendimento" on public.bookings for update
  using (professional_id = public.my_professional_id()) with check (professional_id = public.my_professional_id());

create policy "lançar encaixe" on public.bookings for insert
  with check (professional_id = public.my_professional_id() and source = 'encaixe');

-- Nome e telefone dos clientes que agendaram com o profissional
create policy "clientes do profissional" on public.profiles for select
  using (exists (
    select 1 from public.bookings b
    where b.user_id = profiles.id and b.professional_id = public.my_professional_id()
  ));
