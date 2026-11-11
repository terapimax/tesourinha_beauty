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
