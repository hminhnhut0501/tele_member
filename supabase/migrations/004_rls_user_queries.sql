alter table public.users force row level security;
alter table public.point_wallets force row level security;
alter table public.point_transactions force row level security;
alter table public.daily_checkins force row level security;

create policy "authenticated users can read own profile"
  on public.users
  for select
  to authenticated
  using (telegram_id = (auth.jwt() ->> 'telegram_id'));

create policy "authenticated users can update own profile"
  on public.users
  for update
  to authenticated
  using (telegram_id = (auth.jwt() ->> 'telegram_id'))
  with check (telegram_id = (auth.jwt() ->> 'telegram_id'));

create policy "authenticated users can read own wallet"
  on public.point_wallets
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = (auth.jwt() ->> 'telegram_id')
    )
  );

create policy "authenticated users can read own transactions"
  on public.point_transactions
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = (auth.jwt() ->> 'telegram_id')
    )
  );

create policy "authenticated users can read own checkins"
  on public.daily_checkins
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = (auth.jwt() ->> 'telegram_id')
    )
  );
