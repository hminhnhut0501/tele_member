create or replace function public.current_telegram_id()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'telegram_id', auth.jwt() ->> 'telegramId')
$$;

drop policy if exists "authenticated users can read own profile" on public.users;
drop policy if exists "authenticated users can update own profile" on public.users;
drop policy if exists "authenticated users can read own wallet" on public.point_wallets;
drop policy if exists "authenticated users can read own transactions" on public.point_transactions;
drop policy if exists "authenticated users can read own checkins" on public.daily_checkins;

create policy "authenticated users can read own profile"
  on public.users
  for select
  to authenticated
  using (telegram_id = public.current_telegram_id());

create policy "authenticated users can update own profile"
  on public.users
  for update
  to authenticated
  using (telegram_id = public.current_telegram_id())
  with check (telegram_id = public.current_telegram_id());

create policy "authenticated users can read own wallet"
  on public.point_wallets
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  );

create policy "authenticated users can read own transactions"
  on public.point_transactions
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  );

create policy "authenticated users can read own checkins"
  on public.daily_checkins
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  );

grant execute on function public.current_telegram_id() to authenticated, service_role;
