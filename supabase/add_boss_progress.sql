-- Progresso dos chefes por jogador ({ "<boss-id>": { "defeated": true, ... } }).
-- Sem esta coluna, a versão web esquecia os chefes vencidos a cada carga
-- (e permitia ganhar o XP deles de novo).
alter table public.profiles
  add column if not exists boss_progress jsonb not null default '{}'::jsonb;

alter table public.profiles
  drop constraint if exists profiles_boss_progress_is_object;

alter table public.profiles
  add constraint profiles_boss_progress_is_object
  check (jsonb_typeof(boss_progress) = 'object');
