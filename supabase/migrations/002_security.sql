alter table public.users enable row level security;
alter table public.point_wallets enable row level security;
alter table public.point_transactions enable row level security;
alter table public.daily_checkins enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_roles where rolname = 'service_role'
  ) then
    raise notice 'service_role role not found; policies will still be created for future use';
  end if;
end $$;

create policy "service role full access users"
  on public.users
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access point_wallets"
  on public.point_wallets
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access point_transactions"
  on public.point_transactions
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access daily_checkins"
  on public.daily_checkins
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.sync_wallet_balance()
returns trigger
language plpgsql
as $$
begin
  update public.point_wallets
  set balance = balance + new.amount,
      updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists trg_sync_wallet_balance on public.point_transactions;
create trigger trg_sync_wallet_balance
after insert on public.point_transactions
for each row
execute function public.sync_wallet_balance();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_users_updated_at on public.users;
create trigger trg_touch_users_updated_at
before update on public.users
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_touch_wallets_updated_at on public.point_wallets;
create trigger trg_touch_wallets_updated_at
before update on public.point_wallets
for each row
execute function public.touch_updated_at();
