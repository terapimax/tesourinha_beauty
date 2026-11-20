-- Tesourinha Beauty · configuração completa do banco (gerado por supabase/scripts/generate-seed.mjs)
-- Cole tudo no SQL Editor do Supabase e clique em Run. Rode só uma vez em um projeto novo.

-- ======== 0001_init.sql ========
-- Tesourinha Beauty · esquema inicial (Supabase / Postgres)
-- Aplique com: supabase db push   (ou cole no SQL Editor do Supabase)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------
create type user_role as enum ('cliente', 'aluno', 'profissional', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  city text,
  avatar_url text,
  role user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data ->> 'phone');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------
create table public.categories (
  id text primary key,            -- 'cabelo', 'barba', ...
  name text not null,
  icon text not null,
  sort_order int not null default 0
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories (id),
  name text not null,
  description text,
  duration_min int not null check (duration_min > 0),
  price_from numeric(10, 2) not null check (price_from >= 0),
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  role text not null,
  bio text,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  years_experience int not null default 0,
  tesourinha_alumni boolean not null default false,
  avatar_url text,
  rating numeric(2, 1) not null default 5.0,
  reviews_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.professional_services (
  professional_id uuid references public.professionals (id) on delete cascade,
  service_id uuid references public.services (id) on delete cascade,
  price numeric(10, 2),
  primary key (professional_id, service_id)
);

-- Grade semanal de atendimento (0 = domingo)
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 60
);

-- ---------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------
create type booking_status as enum ('confirmado', 'concluido', 'cancelado');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (id),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  status booking_status not null default 'confirmado',
  price numeric(10, 2),
  notes text,
  created_at timestamptz not null default now()
);

-- Impede dois agendamentos ativos no mesmo horário do mesmo profissional
create unique index bookings_no_double_booking
  on public.bookings (professional_id, starts_at)
  where status <> 'cancelado';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid references public.profiles (id) on delete cascade,
  professional_id uuid references public.professionals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

-- ---------------------------------------------------------------
-- Cursos (Associação Tesourinha)
-- ---------------------------------------------------------------
create type course_modality as enum ('Presencial', 'Online', 'Híbrido');
create type enrollment_status as enum ('inscrito', 'lista de espera', 'concluído', 'cancelado');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  area text not null,
  level text not null default 'Iniciante',
  duration_hours int not null,
  modality course_modality not null default 'Presencial',
  start_date date,
  seats int not null,
  description text,
  modules text[] not null default '{}',
  certificate boolean not null default true,
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status enrollment_status not null default 'inscrito',
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

-- ---------------------------------------------------------------
-- Vagas de emprego
-- ---------------------------------------------------------------
create type application_status as enum ('nova', 'em análise', 'aprovada', 'recusada');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  job_type text not null,
  salary text,
  description text,
  requirements text[] not null default '{}',
  benefits text[] not null default '{}',
  open boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.resumes (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  city text,
  role text,
  experience text,
  about text,
  file_url text,
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status application_status not null default 'nova',
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.jobs enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;

-- Perfis: cada um vê/edita o seu; admin vê todos
create policy "perfil próprio" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "editar perfil próprio" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Só admin pode mudar o papel (role) de alguém
create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Somente administradores podem alterar o papel do usuário';
  end if;
  return new;
end $$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
create policy "admin gerencia perfis" on public.profiles for all using (public.is_admin());

-- Catálogo público (somente itens ativos/publicados); escrita só admin
create policy "categorias públicas" on public.categories for select using (true);
create policy "serviços ativos" on public.services for select using (active or public.is_admin());
create policy "profissionais ativos" on public.professionals for select using (active or public.is_admin());
create policy "serviços do profissional" on public.professional_services for select using (true);
create policy "horários públicos" on public.working_hours for select using (true);
create policy "cursos publicados" on public.courses for select using (published or public.is_admin());
create policy "vagas abertas" on public.jobs for select using (open or public.is_admin());
create policy "avaliações públicas" on public.reviews for select using (true);

create policy "admin categorias" on public.categories for all using (public.is_admin());
create policy "admin serviços" on public.services for all using (public.is_admin());
create policy "admin profissionais" on public.professionals for all using (public.is_admin());
create policy "admin serviços do profissional" on public.professional_services for all using (public.is_admin());
create policy "admin horários" on public.working_hours for all using (public.is_admin());
create policy "admin cursos" on public.courses for all using (public.is_admin());
create policy "admin vagas" on public.jobs for all using (public.is_admin());

-- Dados do usuário
create policy "meus agendamentos" on public.bookings for select using (user_id = auth.uid() or public.is_admin());
create policy "criar agendamento" on public.bookings for insert with check (user_id = auth.uid());
create policy "cancelar meu agendamento" on public.bookings for update using (user_id = auth.uid() or public.is_admin());

create policy "minha avaliação" on public.reviews for insert with check (user_id = auth.uid());
create policy "meus favoritos" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "minhas inscrições" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "inscrever-se" on public.enrollments for insert with check (user_id = auth.uid());
create policy "admin inscrições" on public.enrollments for update using (public.is_admin());

create policy "meu currículo" on public.resumes for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

create policy "minhas candidaturas" on public.applications for select using (user_id = auth.uid() or public.is_admin());
create policy "candidatar-se" on public.applications for insert with check (user_id = auth.uid());
create policy "admin candidaturas" on public.applications for update using (public.is_admin());

-- ---------------------------------------------------------------
-- Categorias iniciais
-- ---------------------------------------------------------------
insert into public.categories (id, name, icon, sort_order) values
  ('cabelo', 'Cabelo', 'cut-outline', 1),
  ('barba', 'Barba', 'man-outline', 2),
  ('estetica', 'Estética', 'sparkles-outline', 3),
  ('unhas', 'Manicure', 'hand-left-outline', 4),
  ('depilacao', 'Depilação', 'leaf-outline', 5),
  ('spa', 'Spa', 'water-outline', 6),
  ('maquiagem', 'Maquiagem', 'color-palette-outline', 7);


-- ======== 0002_profissional.sql ========
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


-- ======== 0003_catalogo.sql ========
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


-- ======== 0004_seed_demo.sql ========
-- Tesourinha Beauty · dados de demonstração (gerado por supabase/scripts/generate-seed.mjs)
-- Pode rodar mais de uma vez: usa ids fixos e "on conflict do nothing".

insert into public.services (id, slug, category_id, name, description, duration_min, price_from, icon) values
  ('1b476aac-045f-5006-a01e-21acdbf9aa1c', 's-corte-fem', 'cabelo', 'Corte Feminino', 'Corte personalizado com lavagem e finalização.', 60, 80, 'cut-outline'),
  ('edc8ba54-fa27-5cb7-a5ea-b129a504f08f', 's-corte-masc', 'cabelo', 'Corte Masculino', 'Corte clássico ou moderno, com acabamento na navalha.', 40, 45, 'cut-outline'),
  ('b0a9545f-4879-578d-a038-039aa8ba6b80', 's-coloracao', 'cabelo', 'Coloração / Mechas', 'Coloração global, mechas, luzes ou morena iluminada.', 180, 220, 'color-fill-outline'),
  ('b0e64556-3a63-547d-a2c0-50f568ef4b6d', 's-escova', 'cabelo', 'Escova', 'Escova modelada ou lisa com produtos profissionais.', 45, 55, 'flame-outline'),
  ('3be7eb14-ea3d-533d-aaac-d103994386ac', 's-tratamento', 'cabelo', 'Tratamentos Capilares', 'Hidratação, nutrição, reconstrução e cronograma capilar.', 60, 90, 'flask-outline'),
  ('2195add6-cc39-5832-a2a6-392bf3e913e5', 's-barba', 'barba', 'Barba', 'Barba desenhada com toalha quente e hidratação.', 30, 40, 'man-outline'),
  ('4322b555-bd40-5d55-ad06-f9c6254ccc6c', 's-manicure', 'unhas', 'Manicure e Pedicure', 'Cutilagem, esmaltação tradicional ou em gel.', 75, 60, 'hand-left-outline'),
  ('359f7654-a975-5d52-ac02-517276271b48', 's-facial', 'estetica', 'Estética Facial', 'Limpeza de pele profunda, peeling e revitalização.', 70, 130, 'happy-outline'),
  ('ad277cf4-e5cd-56d8-ab7a-68b76ad7ec4c', 's-sobrancelha', 'estetica', 'Design de Sobrancelhas', 'Design com pinça, henna ou brow lamination.', 40, 50, 'eye-outline'),
  ('bcb87c1a-4742-5df5-a01f-05dc816ded56', 's-depilacao', 'depilacao', 'Depilação', 'Depilação com cera quente, fria ou linha.', 45, 45, 'leaf-outline'),
  ('e6bfc133-9329-59a2-acc1-7957a17fa46e', 's-spa', 'spa', 'Spa e Bem-estar', 'Massagem relaxante, pedras quentes e aromaterapia.', 60, 140, 'water-outline'),
  ('ef81c637-8a45-5c43-afdf-90137cbdac03', 's-make', 'maquiagem', 'Maquiagem Social', 'Make para eventos, festas e ensaios.', 60, 150, 'color-palette-outline')
on conflict (id) do nothing;

insert into public.professionals (id, slug, name, role, bio, neighborhood, years_experience, tesourinha_alumni, rating, reviews_count, status, category_ids, slot_minutes) values
  ('876a9045-e4fb-5c9f-adf3-efaf112061c3', 'p-ana', 'Ana Paula', 'Cabeleireira', 'Especialista em cortes femininos e finalização. Formada pela Associação Tesourinha, apaixonada por realçar a beleza natural de cada cliente.', 'Santo Amaro, SP', 9, true, 5, 120, 'aprovado', array['cabelo']::text[], 60),
  ('0b184185-5374-5ccc-a098-5c14c49b4fef', 'p-carlos', 'Carlos Silva', 'Barbeiro', 'Barbeiro clássico com toque moderno. Degradê, navalhado e barba terapia.', 'Campo Limpo, SP', 7, true, 4.9, 98, 'aprovado', array['barba', 'cabelo']::text[], 60),
  ('de96d93a-5b43-5dc2-aa93-2b40792cbd01', 'p-mariana', 'Mariana Costa', 'Colorista', 'Colorista com foco em loiros saudáveis, morena iluminada e correção de cor.', 'Moema, SP', 11, false, 5, 76, 'aprovado', array['cabelo']::text[], 60),
  ('254a93a2-5049-592e-a80b-c9ec6ec49975', 'p-lucas', 'Lucas Mendes', 'Especialista em Mechas', 'Mechas, balayage e técnicas de iluminação. Aluno destaque da turma 2019 da Tesourinha.', 'Jardim São Luís, SP', 6, true, 4.8, 62, 'aprovado', array['cabelo']::text[], 60),
  ('93c2c29e-8939-55ed-abcc-6b1894530c1e', 'p-fernanda', 'Fernanda Alves', 'Esteticista', 'Esteticista facial e corporal. Protocolos personalizados para cada tipo de pele.', 'Capão Redondo, SP', 8, true, 5, 84, 'aprovado', array['estetica', 'depilacao', 'spa']::text[], 60),
  ('ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 'p-jessica', 'Jéssica Rocha', 'Manicure e Nail Designer', 'Alongamento em gel, nail art e cuidados completos com mãos e pés.', 'Santo Amaro, SP', 5, true, 4.9, 143, 'aprovado', array['unhas']::text[], 60),
  ('29cccfc1-90d0-54a3-ac84-2f555951459e', 'p-renata', 'Renata Lima', 'Maquiadora', 'Maquiagem social, noivas e editoriais. Pele iluminada e duradoura.', 'Vila Andrade, SP', 10, false, 4.9, 57, 'aprovado', array['maquiagem', 'estetica']::text[], 60)
on conflict (id) do nothing;

insert into public.professional_services (professional_id, service_id) values
  ('876a9045-e4fb-5c9f-adf3-efaf112061c3', '1b476aac-045f-5006-a01e-21acdbf9aa1c'),
  ('876a9045-e4fb-5c9f-adf3-efaf112061c3', 'b0e64556-3a63-547d-a2c0-50f568ef4b6d'),
  ('876a9045-e4fb-5c9f-adf3-efaf112061c3', '3be7eb14-ea3d-533d-aaac-d103994386ac'),
  ('876a9045-e4fb-5c9f-adf3-efaf112061c3', 'b0a9545f-4879-578d-a038-039aa8ba6b80'),
  ('0b184185-5374-5ccc-a098-5c14c49b4fef', 'edc8ba54-fa27-5cb7-a5ea-b129a504f08f'),
  ('0b184185-5374-5ccc-a098-5c14c49b4fef', '2195add6-cc39-5832-a2a6-392bf3e913e5'),
  ('de96d93a-5b43-5dc2-aa93-2b40792cbd01', 'b0a9545f-4879-578d-a038-039aa8ba6b80'),
  ('de96d93a-5b43-5dc2-aa93-2b40792cbd01', '3be7eb14-ea3d-533d-aaac-d103994386ac'),
  ('de96d93a-5b43-5dc2-aa93-2b40792cbd01', 'b0e64556-3a63-547d-a2c0-50f568ef4b6d'),
  ('254a93a2-5049-592e-a80b-c9ec6ec49975', 'b0a9545f-4879-578d-a038-039aa8ba6b80'),
  ('254a93a2-5049-592e-a80b-c9ec6ec49975', '1b476aac-045f-5006-a01e-21acdbf9aa1c'),
  ('93c2c29e-8939-55ed-abcc-6b1894530c1e', '359f7654-a975-5d52-ac02-517276271b48'),
  ('93c2c29e-8939-55ed-abcc-6b1894530c1e', 'ad277cf4-e5cd-56d8-ab7a-68b76ad7ec4c'),
  ('93c2c29e-8939-55ed-abcc-6b1894530c1e', 'bcb87c1a-4742-5df5-a01f-05dc816ded56'),
  ('93c2c29e-8939-55ed-abcc-6b1894530c1e', 'e6bfc133-9329-59a2-acc1-7957a17fa46e'),
  ('ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', '4322b555-bd40-5d55-ad06-f9c6254ccc6c'),
  ('29cccfc1-90d0-54a3-ac84-2f555951459e', 'ef81c637-8a45-5c43-afdf-90137cbdac03'),
  ('29cccfc1-90d0-54a3-ac84-2f555951459e', 'ad277cf4-e5cd-56d8-ab7a-68b76ad7ec4c')
on conflict (professional_id, service_id) do nothing;

insert into public.working_hours (id, professional_id, weekday, start_time, end_time, slot_minutes) values
  ('9a98ec79-e09f-52c6-acc2-98a50b641da3', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 1, '09:00', '12:00', 60),
  ('7ccbae9d-6883-5690-a89d-a07c14545862', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 1, '13:00', '19:00', 60),
  ('7be5f91b-8270-5566-a317-47580d103afa', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 2, '09:00', '12:00', 60),
  ('4c37d634-1fc9-5796-a168-501be65c9b33', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 2, '13:00', '19:00', 60),
  ('538af359-54d8-5fa6-a85d-bb03958439b6', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 3, '09:00', '12:00', 60),
  ('cd50a162-71ae-5507-ae95-5600b0fab24f', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 3, '13:00', '19:00', 60),
  ('1223e4f3-97b0-5ca7-a48a-79d0088759b8', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 4, '09:00', '12:00', 60),
  ('7df2d589-a001-54ae-a5eb-4b91303b652e', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 4, '13:00', '19:00', 60),
  ('405ec49e-9ab1-58a9-a748-d792e6ffe108', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 5, '09:00', '12:00', 60),
  ('59753450-f553-5f9d-af7c-1f87f0af393a', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 5, '13:00', '19:00', 60),
  ('0489590c-d180-5a81-a95d-30bb8400836c', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 6, '09:00', '12:00', 60),
  ('77b5cc73-f372-5852-a5a5-0e5266e34951', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 6, '13:00', '19:00', 60),
  ('d5ec979c-edfc-5aa4-af8d-75536e2a37df', '0b184185-5374-5ccc-a098-5c14c49b4fef', 1, '09:00', '12:00', 60),
  ('37b0488f-f1c5-5367-a009-a00eab3435d0', '0b184185-5374-5ccc-a098-5c14c49b4fef', 1, '13:00', '19:00', 60),
  ('dee54af5-0168-5473-a25e-69a0cc1a884d', '0b184185-5374-5ccc-a098-5c14c49b4fef', 2, '09:00', '12:00', 60),
  ('f847d1d0-7e01-5d88-a5a7-538627259a80', '0b184185-5374-5ccc-a098-5c14c49b4fef', 2, '13:00', '19:00', 60),
  ('5ce47b6f-38f5-5a66-a194-b8586a8b1b55', '0b184185-5374-5ccc-a098-5c14c49b4fef', 3, '09:00', '12:00', 60),
  ('e10f09a0-4fed-5120-ae2a-648e46822b72', '0b184185-5374-5ccc-a098-5c14c49b4fef', 3, '13:00', '19:00', 60),
  ('19282c1e-fe31-5b8c-a7c9-be4eba2f326e', '0b184185-5374-5ccc-a098-5c14c49b4fef', 4, '09:00', '12:00', 60),
  ('ac673391-7cdf-5cc3-a381-a77c70b75607', '0b184185-5374-5ccc-a098-5c14c49b4fef', 4, '13:00', '19:00', 60),
  ('ccdc4b70-9d63-587c-adad-e0e78bc628ae', '0b184185-5374-5ccc-a098-5c14c49b4fef', 5, '09:00', '12:00', 60),
  ('be76f006-d76c-5c33-a8a4-2b5c5c719123', '0b184185-5374-5ccc-a098-5c14c49b4fef', 5, '13:00', '19:00', 60),
  ('4fbec093-a13d-58ba-ac13-e234e45d73b3', '0b184185-5374-5ccc-a098-5c14c49b4fef', 6, '09:00', '12:00', 60),
  ('3f632ba9-3eb7-5ebc-a9d3-a95a653f8ce2', '0b184185-5374-5ccc-a098-5c14c49b4fef', 6, '13:00', '19:00', 60),
  ('96a2383e-4838-5616-ac85-bb79baf0e34f', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 1, '09:00', '12:00', 60),
  ('521af1ba-38cb-5c69-a7ee-110751bf5e0a', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 1, '13:00', '19:00', 60),
  ('28e2b9b0-8cf2-5d05-a3fc-b7bea7752783', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 2, '09:00', '12:00', 60),
  ('b406d9a0-6374-5845-a4dd-d7ab1813cb89', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 2, '13:00', '19:00', 60),
  ('f47f6bb3-de36-5f09-a15d-7fe26e27ac6a', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 3, '09:00', '12:00', 60),
  ('6c46503f-73ae-5b49-a92d-8a93765d653d', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 3, '13:00', '19:00', 60),
  ('e94bc111-a7aa-50fd-af58-10ec4f64b2e6', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 4, '09:00', '12:00', 60),
  ('d1c139ca-319e-5453-a1bb-1593106f1495', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 4, '13:00', '19:00', 60),
  ('f2bec8ad-9ff5-569e-ad6c-388460fb8fc5', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 5, '09:00', '12:00', 60),
  ('a3bf4771-c9b9-5400-a6b1-886be6178d10', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 5, '13:00', '19:00', 60),
  ('3fd60df6-f3de-54a6-a0a4-f6eb7d68fc1e', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 6, '09:00', '12:00', 60),
  ('65670cef-dd9a-58ba-a27b-4373fb95693d', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 6, '13:00', '19:00', 60),
  ('defccfc6-ce13-5427-a83a-6583a284ce2e', '254a93a2-5049-592e-a80b-c9ec6ec49975', 1, '09:00', '12:00', 60),
  ('8b6c5ee5-b640-59af-a9f0-bcda9bfd43a2', '254a93a2-5049-592e-a80b-c9ec6ec49975', 1, '13:00', '19:00', 60),
  ('add0e360-b46d-54ce-a6b3-a0e328dcd119', '254a93a2-5049-592e-a80b-c9ec6ec49975', 2, '09:00', '12:00', 60),
  ('b8237086-ac15-56ef-a8ed-0cbdc070f3a0', '254a93a2-5049-592e-a80b-c9ec6ec49975', 2, '13:00', '19:00', 60),
  ('29a563a4-fdb7-5a3f-a78c-fcab8a6d2b50', '254a93a2-5049-592e-a80b-c9ec6ec49975', 3, '09:00', '12:00', 60),
  ('60085ed0-9706-5496-a10b-1f0d1a6ff7e0', '254a93a2-5049-592e-a80b-c9ec6ec49975', 3, '13:00', '19:00', 60),
  ('bee71c71-7ca3-536d-aac2-797bf997b82b', '254a93a2-5049-592e-a80b-c9ec6ec49975', 4, '09:00', '12:00', 60),
  ('a9c54da0-d6f5-539f-a231-a087aed444d5', '254a93a2-5049-592e-a80b-c9ec6ec49975', 4, '13:00', '19:00', 60),
  ('a06eb6c0-c237-56e3-a8ee-61630fc70226', '254a93a2-5049-592e-a80b-c9ec6ec49975', 5, '09:00', '12:00', 60),
  ('12640d21-b0f2-5d70-af86-6cf6d2b885df', '254a93a2-5049-592e-a80b-c9ec6ec49975', 5, '13:00', '19:00', 60),
  ('26608ca6-6150-5891-aee7-b2e468aa3cd0', '254a93a2-5049-592e-a80b-c9ec6ec49975', 6, '09:00', '12:00', 60),
  ('289eb534-4830-5848-a226-1d56b7608d52', '254a93a2-5049-592e-a80b-c9ec6ec49975', 6, '13:00', '19:00', 60),
  ('c6f8bede-439b-50ab-a9a2-7aa914b29ace', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 1, '09:00', '12:00', 60),
  ('9e53c743-ea24-551a-a303-97fb63a95270', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 1, '13:00', '19:00', 60),
  ('dc85d7cb-1b59-50c2-ac42-456ac787921d', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 2, '09:00', '12:00', 60),
  ('fec75643-c775-5142-ad87-90465f11918f', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 2, '13:00', '19:00', 60),
  ('3aad30c1-bd5d-56ac-a3ae-9665c193b7d5', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 3, '09:00', '12:00', 60),
  ('d3c7afbc-7e38-5ed7-ad62-f152103608f8', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 3, '13:00', '19:00', 60),
  ('14bdf908-aff5-5979-ac7b-d97a4c1ba2a2', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 4, '09:00', '12:00', 60),
  ('9925aefb-ee5e-561e-a313-7849e3769b4b', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 4, '13:00', '19:00', 60),
  ('9149280a-3d35-55d8-a848-9565f7429ee8', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 5, '09:00', '12:00', 60),
  ('dea2fde5-76f6-5de3-a064-7b1b8f7edb33', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 5, '13:00', '19:00', 60),
  ('1b878da1-6ca6-587f-aff3-c66989081c99', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 6, '09:00', '12:00', 60),
  ('d2ffe54f-35d6-5c4b-aca5-1091a877fc7d', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 6, '13:00', '19:00', 60),
  ('f963c799-4565-550e-a665-91b412f7f280', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 1, '09:00', '12:00', 60),
  ('f5541713-7f55-5fc5-a8d5-5cc8b669d446', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 1, '13:00', '19:00', 60),
  ('63639cdf-ed11-5354-aab1-3c4ef6a8be60', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 2, '09:00', '12:00', 60),
  ('f1f917c7-def1-57f8-ad60-6406b573ac04', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 2, '13:00', '19:00', 60),
  ('3c0a89be-96b7-5c7c-a2b6-dee1eb5d3255', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 3, '09:00', '12:00', 60),
  ('933d637a-a597-556b-ae3c-2039583ad99a', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 3, '13:00', '19:00', 60),
  ('0da1df7c-202e-5556-a94f-2851a327681b', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 4, '09:00', '12:00', 60),
  ('460aa44b-9280-5dd6-a26b-5082fb1cd9bc', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 4, '13:00', '19:00', 60),
  ('a3cd5db3-61a5-59e5-a118-77b8878e0adf', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 5, '09:00', '12:00', 60),
  ('b8e8d630-bd1d-5493-a3a9-68f28afe7128', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 5, '13:00', '19:00', 60),
  ('6e3f38c9-be81-5509-a808-5a962036d502', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 6, '09:00', '12:00', 60),
  ('67d7972b-8f87-5327-a797-fa5cc21b8648', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 6, '13:00', '19:00', 60),
  ('09f85098-d583-5835-a219-f0e43c1b8c7f', '29cccfc1-90d0-54a3-ac84-2f555951459e', 1, '09:00', '12:00', 60),
  ('d981b6a2-968a-5b56-aabf-9927f0232a1e', '29cccfc1-90d0-54a3-ac84-2f555951459e', 1, '13:00', '19:00', 60),
  ('77d4edd0-1d19-5ccf-af12-1244179901f5', '29cccfc1-90d0-54a3-ac84-2f555951459e', 2, '09:00', '12:00', 60),
  ('8fb0a2aa-690c-5a97-ae78-a1ef61a55e73', '29cccfc1-90d0-54a3-ac84-2f555951459e', 2, '13:00', '19:00', 60),
  ('da976520-8ec5-5bda-ad14-2bd5d2089628', '29cccfc1-90d0-54a3-ac84-2f555951459e', 3, '09:00', '12:00', 60),
  ('4751a9eb-fbce-5ea8-a4f5-8fdfa3f5f1d7', '29cccfc1-90d0-54a3-ac84-2f555951459e', 3, '13:00', '19:00', 60),
  ('e65358ff-18f0-5cbd-a563-88f2d8761a8d', '29cccfc1-90d0-54a3-ac84-2f555951459e', 4, '09:00', '12:00', 60),
  ('c719cdbf-52d5-5e48-a6cb-bc3bb7054e83', '29cccfc1-90d0-54a3-ac84-2f555951459e', 4, '13:00', '19:00', 60),
  ('58827807-784e-5936-a617-6e84cfa9bb85', '29cccfc1-90d0-54a3-ac84-2f555951459e', 5, '09:00', '12:00', 60),
  ('fb2ce68a-c849-5d7b-a576-dbe5582a65e1', '29cccfc1-90d0-54a3-ac84-2f555951459e', 5, '13:00', '19:00', 60),
  ('91b314f2-393a-5d64-a202-c5bd56ec87e5', '29cccfc1-90d0-54a3-ac84-2f555951459e', 6, '09:00', '12:00', 60),
  ('f21c62f9-ced8-5e75-a257-55c681fb7aab', '29cccfc1-90d0-54a3-ac84-2f555951459e', 6, '13:00', '19:00', 60)
on conflict (id) do nothing;

insert into public.reviews (id, professional_id, author_name, rating, comment, created_at) values
  ('8a6f1f34-2981-5510-a799-aa49f9d8b713', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 'Juliana M.', 5, 'Atendimento impecável! Saí do salão me sentindo outra pessoa.', '2026-10-28'),
  ('12130002-dc99-50b9-ad34-dde4c931bcb5', '876a9045-e4fb-5c9f-adf3-efaf112061c3', 'Patrícia S.', 5, 'A Ana entende exatamente o que a gente quer. Recomendo muito.', '2026-10-12'),
  ('0fcf71b6-d531-53bd-a666-e81ed1efc91b', '0b184185-5374-5ccc-a098-5c14c49b4fef', 'Rafael T.', 5, 'Melhor degradê da região. Pontual e caprichoso.', '2026-11-02'),
  ('ddba7ab3-d9bf-5fc8-ad5b-d9fb57dd9967', '0b184185-5374-5ccc-a098-5c14c49b4fef', 'Bruno L.', 5, 'Ambiente top e atendimento rápido.', '2026-10-20'),
  ('1e1de711-e27d-5e24-a71e-b058b5b7670c', 'de96d93a-5b43-5dc2-aa93-2b40792cbd01', 'Camila R.', 5, 'Meu loiro nunca ficou tão bonito e o cabelo continua saudável!', '2026-10-30'),
  ('e2a082a1-db9d-5b52-a671-df36222a753d', '254a93a2-5049-592e-a80b-c9ec6ec49975', 'Fernanda P.', 5, 'Balayage perfeito, muito profissional.', '2026-10-08'),
  ('b7967e1a-8c99-5b1d-acd9-12cd0eba0e54', '93c2c29e-8939-55ed-abcc-6b1894530c1e', 'Larissa C.', 5, 'Limpeza de pele maravilhosa, mãos de fada!', '2026-11-05'),
  ('64619fc4-ff18-5a5f-a010-2420b316fed3', 'ac242b2c-eadd-5e43-aa05-d0dc3e6f6b9d', 'Aline F.', 5, 'Unhas lindas e duram muito. Super caprichosa.', '2026-11-01'),
  ('225067b3-c471-586b-adcd-61abb356b890', '29cccfc1-90d0-54a3-ac84-2f555951459e', 'Bianca O.', 5, 'Make perfeita para meu casamento, durou a noite toda!', '2026-09-21')
on conflict (id) do nothing;

insert into public.courses (id, slug, title, subtitle, area, level, duration_hours, modality, start_date, seats, description, modules, certificate, icon, published) values
  ('650a3fde-8e9c-536b-a84a-d42f722ea881', 'c-cabeleireiro', 'Curso de Cabeleireiro', 'Básico e Avançado', 'cabelo', 'Iniciante', 120, 'Presencial', '2026-12-01', 30, 'Formação completa em cabeleireiro: visagismo, cortes, escovas, química e atendimento. Turmas práticas com modelos reais.', array['Fundamentos e visagismo', 'Técnicas de corte feminino', 'Escova e finalização', 'Coloração e química', 'Atendimento e postura profissional']::text[], true, 'cut-outline', true),
  ('93e7979a-4991-5bc4-a1e1-0542b2d7d3cf', 'c-barbeiro', 'Curso de Barbeiro', 'Do básico ao profissional', 'barba', 'Iniciante', 80, 'Presencial', '2026-12-08', 25, 'Aprenda cortes masculinos clássicos e modernos, degradê, navalha e barboterapia.', array['Ferramentas e higiene', 'Cortes clássicos', 'Degradê e freestyle', 'Barba e barboterapia']::text[], true, 'man-outline', true),
  ('fe857ced-9017-5be6-a194-89c416d6ee28', 'c-manicure', 'Manicure e Pedicure', 'Beleza e saúde nas suas mãos', 'unhas', 'Iniciante', 40, 'Presencial', '2026-11-24', 20, 'Técnicas de cutilagem, esmaltação, biossegurança e introdução à nail art.', array['Biossegurança', 'Cutilagem', 'Esmaltação perfeita', 'Nail art básica']::text[], true, 'hand-left-outline', true),
  ('ae5fc051-522e-5a21-a211-828a6176087e', 'c-depilacao', 'Depilação', 'Técnicas profissionais', 'estetica', 'Iniciante', 24, 'Presencial', '2026-12-15', 18, 'Depilação com cera quente e fria, linha e cuidados pós-depilação.', array['Tipos de pele e pelos', 'Cera quente e fria', 'Depilação com linha']::text[], true, 'leaf-outline', true),
  ('aabf69ed-60ce-5c3f-a5f4-6828a42815e3', 'c-facial', 'Estética Facial', 'Cuidados e bem-estar', 'estetica', 'Intermediário', 60, 'Híbrido', '2027-01-12', 20, 'Limpeza de pele, protocolos faciais, análise de pele e cosmetologia.', array['Anatomia da pele', 'Limpeza de pele', 'Protocolos e peelings', 'Cosmetologia']::text[], true, 'sparkles-outline', true),
  ('2a47954b-8f77-59f3-a414-9093e109687f', 'c-empreender', 'Empreendedorismo', 'Gestão e atendimento', 'gestao', 'Iniciante', 16, 'Online', '2026-11-20', 200, 'Como abrir seu próprio negócio de beleza: precificação, redes sociais, MEI e fidelização.', array['Precificação', 'Marketing nas redes sociais', 'Formalização e MEI', 'Fidelização de clientes']::text[], true, 'briefcase-outline', true)
on conflict (id) do nothing;

insert into public.jobs (id, slug, title, company, location, job_type, salary, description, requirements, benefits, icon, open, created_at) values
  ('82c88169-2ba9-540b-a4ba-e0eeab550a7e', 'j-cabeleireiro', 'Cabeleireiro(a)', 'Salão Bella Vista', 'Zona Sul - SP', 'Tempo integral', 'R$ 2.500 + comissão', 'Buscamos cabeleireiro(a) com experiência em cortes e escovas para equipe em crescimento.', array['Experiência mínima de 1 ano', 'Disponibilidade aos sábados', 'Boa comunicação']::text[], array['Vale-transporte', 'Comissão de 40%', 'Cursos de atualização']::text[], 'cut-outline', true, '2026-11-09'),
  ('b408f935-fefd-53e6-af2d-cbd8856ecaac', 'j-barbeiro', 'Barbeiro(a)', 'Barbearia Parceira', 'Campo Limpo - SP', 'Meio período', 'Comissionado', 'Barbearia parceira da Tesourinha contrata barbeiro(a) para período da tarde.', array['Domínio de degradê', 'Curso de barbeiro concluído']::text[], array['Comissão de 50%', 'Ambiente climatizado']::text[], 'man-outline', true, '2026-11-07'),
  ('5684e58a-1d8a-5143-a717-8181f4fa02a9', 'j-manicure', 'Manicure', 'Clínica de Estética Lumi', 'Moema - SP', 'Tempo integral', 'R$ 1.900 + comissão', 'Vaga para manicure e pedicure com conhecimento em esmaltação em gel.', array['Certificado de biossegurança', 'Experiência com gel']::text[], array['Vale-refeição', 'Plano de saúde após 3 meses']::text[], 'hand-left-outline', true, '2026-11-05'),
  ('6a241ef1-5d34-5ace-a751-1f02cbf0e024', 'j-esteticista', 'Esteticista', 'Spa e Bem-estar Aura', 'Vila Mariana - SP', 'Meio período', null, 'Atendimento facial e corporal em spa urbano.', array['Formação em estética', 'Experiência com protocolos faciais']::text[], array['Horário flexível', 'Desconto em tratamentos']::text[], 'sparkles-outline', true, '2026-11-03'),
  ('9670f83c-d287-5ebe-a3a4-d8819781c033', 'j-recepcionista', 'Recepcionista', 'Salão de Beleza Glow', 'Santo Amaro - SP', 'Tempo integral', 'R$ 1.800', 'Recepção, agenda de clientes e atendimento via WhatsApp.', array['Ensino médio completo', 'Boa organização']::text[], array['Vale-transporte', 'Vale-refeição']::text[], 'call-outline', true, '2026-11-01')
on conflict (id) do nothing;
