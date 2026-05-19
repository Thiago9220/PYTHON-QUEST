-- =====================================================================
-- Python Quest — Schema completo do Supabase
-- =====================================================================
-- Como usar:
--   1. Crie um projeto novo em https://supabase.com
--   2. Vá em "SQL Editor" no painel
--   3. Cole TODO este arquivo e clique em "Run"
--   4. (Opcional) Em "Authentication > Providers" habilite "Email" e "Google"
--   5. Copie URL + anon key de "Project Settings > API" para o .env
-- =====================================================================

-- ----- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- =====================================================================
-- TABELA: profiles
-- Estende auth.users com dados de exibição e estado do jogador.
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Aventureiro',
  avatar_emoji text not null default '👤',
  avatar_url text,
  total_xp integer not null default 0 check (total_xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  equipped_title text,
  is_muted boolean not null default false,
  has_seen_tutorial boolean not null default false,
  has_seen_world_tour boolean not null default false,
  has_seen_profile_tour boolean not null default false,
  has_seen_arena_tour boolean not null default false,
  has_seen_cybersec_intro boolean not null default false,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- TABELA: challenge_progress
-- Um registro por (usuário, desafio).
-- =====================================================================
create table if not exists public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null,
  completed boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  best_chars integer check (best_chars is null or best_chars >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create index if not exists idx_challenge_progress_user
  on public.challenge_progress (user_id);

-- =====================================================================
-- TABELA: user_achievements
-- Conquistas desbloqueadas (1 linha por conquista).
-- =====================================================================
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user
  on public.user_achievements (user_id);

-- =====================================================================
-- TABELA: user_purchases
-- Mundos pagos / desbloqueados via compra.
-- =====================================================================
create table if not exists public.user_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  world_id text not null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  created_at timestamptz not null default now(),
  unique (user_id, world_id)
);

create index if not exists idx_user_purchases_user
  on public.user_purchases (user_id);

-- =====================================================================
-- TRIGGER: cria profile automaticamente quando um usuário se registra
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Aventureiro'),
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '👤')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- TRIGGER: updated_at auto em profiles e challenge_progress
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_challenge_progress_updated_at on public.challenge_progress;
create trigger trg_challenge_progress_updated_at
  before update on public.challenge_progress
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- Cada usuário acessa apenas as próprias linhas.
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.challenge_progress  enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.user_purchases      enable row level security;

-- ----- profiles
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_insert_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_delete_own"  on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ----- challenge_progress
drop policy if exists "progress_select_own" on public.challenge_progress;
drop policy if exists "progress_insert_own" on public.challenge_progress;
drop policy if exists "progress_update_own" on public.challenge_progress;
drop policy if exists "progress_delete_own" on public.challenge_progress;

create policy "progress_select_own"
  on public.challenge_progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.challenge_progress for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.challenge_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_delete_own"
  on public.challenge_progress for delete
  using (auth.uid() = user_id);

-- ----- user_achievements
drop policy if exists "achievements_select_own" on public.user_achievements;
drop policy if exists "achievements_insert_own" on public.user_achievements;
drop policy if exists "achievements_delete_own" on public.user_achievements;

create policy "achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

create policy "achievements_delete_own"
  on public.user_achievements for delete
  using (auth.uid() = user_id);

-- ----- user_purchases
-- Inserts geralmente vêm do back-end de pagamento (service role bypassa RLS),
-- mas mantemos política para o cliente conseguir LER suas próprias compras.
drop policy if exists "purchases_select_own" on public.user_purchases;
drop policy if exists "purchases_insert_own" on public.user_purchases;
drop policy if exists "purchases_update_own" on public.user_purchases;
drop policy if exists "purchases_delete_own" on public.user_purchases;

create policy "purchases_select_own"
  on public.user_purchases for select
  using (auth.uid() = user_id);

-- Nao crie policies de INSERT/UPDATE/DELETE para usuarios finais nesta tabela.
-- Compras e desbloqueios pagos devem ser gravados exclusivamente por backend,
-- webhook ou Edge Function usando service role; a service role bypassa RLS.
