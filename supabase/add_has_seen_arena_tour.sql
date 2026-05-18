alter table public.profiles
  add column if not exists has_seen_arena_tour boolean not null default false;
