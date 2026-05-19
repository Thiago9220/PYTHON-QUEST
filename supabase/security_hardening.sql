-- =====================================================================
-- Python Quest - hardening de seguranca para bancos existentes
-- =====================================================================
-- Rode este arquivo no SQL Editor do Supabase se o schema principal ja foi
-- aplicado antes das correcoes de seguranca.

-- Impede valores negativos em campos de progresso.
do $$
begin
  alter table public.profiles
    add constraint profiles_total_xp_nonnegative check (total_xp >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_streak_nonnegative check (streak >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.challenge_progress
    add constraint challenge_progress_attempts_nonnegative check (attempts >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.challenge_progress
    add constraint challenge_progress_hints_used_nonnegative check (hints_used >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.challenge_progress
    add constraint challenge_progress_best_score_nonnegative check (best_score >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.challenge_progress
    add constraint challenge_progress_best_chars_nonnegative check (best_chars is null or best_chars >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.user_purchases
    add constraint user_purchases_valid_status check (status in ('pending', 'approved', 'rejected', 'refunded'));
exception
  when duplicate_object then null;
end $$;

-- Compras/desbloqueios pagos: usuario final pode apenas ler as proprias linhas.
alter table public.user_purchases enable row level security;

drop policy if exists "purchases_select_own" on public.user_purchases;
drop policy if exists "purchases_insert_own" on public.user_purchases;
drop policy if exists "purchases_update_own" on public.user_purchases;
drop policy if exists "purchases_delete_own" on public.user_purchases;

create policy "purchases_select_own"
  on public.user_purchases for select
  using (auth.uid() = user_id);
