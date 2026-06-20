create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'POINT_BONUS', 'CUSTOM')),
  point_cost integer not null default 0,
  stock integer,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_codes (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete cascade,
  code text not null,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'USED', 'EXPIRED')),
  assigned_to uuid references public.users(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reward_id, code)
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  code_id uuid references public.reward_codes(id) on delete set null,
  point_cost integer not null,
  status text not null default 'COMPLETED' check (status in ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.spin_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('REDEEM_REWARD', 'ADMIN_ADJUST', 'SPIN_USED', 'SPIN_PRIZE', 'SYSTEM_REFUND')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.wheel_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wheel_prizes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.wheel_campaigns(id) on delete cascade,
  name text not null,
  type text not null check (type in ('POINT', 'VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'NOTHING', 'CUSTOM')),
  weight integer not null,
  stock integer,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wheel_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  campaign_id uuid not null references public.wheel_campaigns(id) on delete cascade,
  prize_id uuid references public.wheel_prizes(id) on delete set null,
  cost_spins integer not null default 1,
  result_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_reward_codes_reward_status on public.reward_codes(reward_id, status);
create index if not exists idx_reward_redemptions_user_created on public.reward_redemptions(user_id, created_at desc);
create index if not exists idx_spin_transactions_user_created on public.spin_transactions(user_id, created_at desc);
create index if not exists idx_wheel_prizes_campaign_active on public.wheel_prizes(campaign_id, is_active);
create index if not exists idx_wheel_spins_user_created on public.wheel_spins(user_id, created_at desc);

create or replace function public.redeem_reward(
  p_user_id uuid,
  p_reward_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward public.rewards;
  v_wallet public.point_wallets;
  v_code public.reward_codes;
  v_redemption public.reward_redemptions;
  v_new_balance integer;
  v_spin_wallet public.spin_wallets;
begin
  select * into v_reward
  from public.rewards
  where id = p_reward_id and is_active = true
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'reward_inactive');
  end if;

  insert into public.point_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select * into v_wallet
  from public.point_wallets
  where user_id = p_user_id
  for update;

  if coalesce(v_wallet.balance, 0) < v_reward.point_cost then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_points');
  end if;

  if v_reward.stock is not null and v_reward.stock <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'out_of_stock');
  end if;

  update public.point_wallets
  set balance = balance - v_reward.point_cost, updated_at = now()
  where user_id = p_user_id
  returning balance into v_new_balance;

  insert into public.point_transactions (user_id, amount, type, reason, metadata)
  values (
    p_user_id,
    -v_reward.point_cost,
    'debit',
    'redeem_reward',
    jsonb_build_object('reward_id', p_reward_id)
  );

  if v_reward.type in ('VOUCHER', 'VIP_CODE') then
    select * into v_code
    from public.reward_codes
    where reward_id = p_reward_id and status = 'AVAILABLE'
    order by created_at asc
    limit 1
    for update skip locked;

    if not found then
      update public.point_wallets set balance = balance + v_reward.point_cost, updated_at = now()
      where user_id = p_user_id;
      insert into public.point_transactions (user_id, amount, type, reason, metadata)
      values (p_user_id, v_reward.point_cost, 'credit', 'reward_refund_no_code', jsonb_build_object('reward_id', p_reward_id));
      return jsonb_build_object('ok', false, 'reason', 'no_code_available');
    end if;

    update public.reward_codes
    set status = 'USED', assigned_to = p_user_id, assigned_at = now()
    where id = v_code.id;
  end if;

  if v_reward.type = 'SPIN_TICKET' then
    insert into public.spin_wallets (user_id, balance)
    values (p_user_id, 0)
    on conflict (user_id) do nothing;
    update public.spin_wallets set balance = balance + 1, updated_at = now()
    where user_id = p_user_id
    returning * into v_spin_wallet;

    insert into public.spin_transactions (user_id, amount, type, reason, metadata)
    values (p_user_id, 1, 'REDEEM_REWARD', 'spin_ticket_reward', jsonb_build_object('reward_id', p_reward_id));
  end if;

  if v_reward.type = 'POINT_BONUS' then
    update public.point_wallets
    set balance = balance + coalesce((v_reward.metadata ->> 'bonus_points')::int, 0), updated_at = now()
    where user_id = p_user_id
    returning balance into v_new_balance;
    insert into public.point_transactions (user_id, amount, type, reason, metadata)
    values (
      p_user_id,
      coalesce((v_reward.metadata ->> 'bonus_points')::int, 0),
      'credit',
      'reward_bonus',
      jsonb_build_object('reward_id', p_reward_id)
    );
  end if;

  if v_reward.stock is not null then
    update public.rewards set stock = stock - 1, updated_at = now() where id = p_reward_id;
  end if;

  insert into public.reward_redemptions (user_id, reward_id, code_id, point_cost, status, metadata)
  values (
    p_user_id,
    p_reward_id,
    case when v_reward.type in ('VOUCHER', 'VIP_CODE') then v_code.id else null end,
    v_reward.point_cost,
    'COMPLETED',
    jsonb_build_object('reward_type', v_reward.type)
  )
  returning * into v_redemption;

  return jsonb_build_object(
    'ok', true,
    'redemptionId', v_redemption.id,
    'rewardId', p_reward_id,
    'rewardName', v_reward.name,
    'rewardType', v_reward.type,
    'code', case when v_code.id is not null then v_code.code else null end,
    'spinBalance', coalesce((select balance from public.spin_wallets where user_id = p_user_id), 0),
    'pointBalance', coalesce(v_new_balance, 0)
  );
end;
$$;

create or replace function public.add_spins(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.spin_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.spin_wallets
  set balance = balance + p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.spin_transactions (user_id, amount, type, reason, metadata)
  values (p_user_id, p_amount, p_type, p_reason, coalesce(p_metadata, '{}'::jsonb));

  return jsonb_build_object('ok', true, 'balance', (select balance from public.spin_wallets where user_id = p_user_id));
end;
$$;

create or replace function public.subtract_spins(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_balance integer;
begin
  insert into public.spin_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.spin_wallets
  where user_id = p_user_id
  for update;

  if coalesce(v_balance, 0) < p_amount then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_spins');
  end if;

  update public.spin_wallets
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.spin_transactions (user_id, amount, type, reason, metadata)
  values (p_user_id, -p_amount, p_type, p_reason, coalesce(p_metadata, '{}'::jsonb));

  return jsonb_build_object('ok', true, 'balance', (select balance from public.spin_wallets where user_id = p_user_id));
end;
$$;

create or replace function public.spin_wheel(
  p_user_id uuid,
  p_campaign_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign public.wheel_campaigns;
  v_balance integer;
  v_prize public.wheel_prizes;
  v_total_weight integer;
  v_roll integer;
  v_running integer := 0;
  v_code public.reward_codes;
  v_point_amount integer;
begin
  select * into v_campaign
  from public.wheel_campaigns
  where id = p_campaign_id and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'campaign_inactive');
  end if;

  insert into public.spin_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.spin_wallets
  where user_id = p_user_id
  for update;

  if coalesce(v_balance, 0) < 1 then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_spins');
  end if;

  update public.spin_wallets
  set balance = balance - 1, updated_at = now()
  where user_id = p_user_id;

  insert into public.spin_transactions (user_id, amount, type, reason, metadata)
  values (p_user_id, -1, 'SPIN_USED', 'wheel_spin', jsonb_build_object('campaign_id', p_campaign_id));

  select coalesce(sum(weight), 0) into v_total_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and is_active = true and (stock is null or stock > 0);

  if v_total_weight <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'no_prizes_available');
  end if;

  v_roll := floor(random() * v_total_weight) + 1;

  for v_prize in
    select *
    from public.wheel_prizes
    where campaign_id = p_campaign_id and is_active = true and (stock is null or stock > 0)
    order by created_at asc
    for update skip locked
  loop
    v_running := v_running + v_prize.weight;
    if v_roll <= v_running then
      exit;
    end if;
  end loop;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_prizes_available');
  end if;

  if v_prize.stock is not null then
    update public.wheel_prizes set stock = stock - 1, updated_at = now() where id = v_prize.id;
  end if;

  if v_prize.type = 'POINT' then
    v_point_amount := coalesce((v_prize.metadata ->> 'points')::int, 0);
    update public.point_wallets set balance = balance + v_point_amount, updated_at = now()
    where user_id = p_user_id;
    insert into public.point_transactions (user_id, amount, type, reason, metadata)
    values (p_user_id, v_point_amount, 'credit', 'wheel_prize_points', jsonb_build_object('campaign_id', p_campaign_id, 'prize_id', v_prize.id));
  elsif v_prize.type in ('VOUCHER', 'VIP_CODE') then
    select * into v_code
    from public.reward_codes
    where reward_id = (v_prize.metadata ->> 'reward_id')::uuid and status = 'AVAILABLE'
    order by created_at asc
    limit 1
    for update skip locked;

    if found then
      update public.reward_codes
      set status = 'USED', assigned_to = p_user_id, assigned_at = now()
      where id = v_code.id;
    end if;
  elsif v_prize.type = 'SPIN_TICKET' then
    perform public.add_spins(p_user_id, 1, 'SPIN_PRIZE', 'wheel_prize_spin_ticket', jsonb_build_object('campaign_id', p_campaign_id, 'prize_id', v_prize.id));
  end if;

  insert into public.wheel_spins (user_id, campaign_id, prize_id, cost_spins, result_metadata)
  values (
    p_user_id,
    p_campaign_id,
    v_prize.id,
    1,
    jsonb_build_object('prize_type', v_prize.type, 'prize_name', v_prize.name, 'code', coalesce(v_code.code, null))
  );

  return jsonb_build_object(
    'ok', true,
    'campaignId', p_campaign_id,
    'prize', jsonb_build_object(
      'id', v_prize.id,
      'name', v_prize.name,
      'type', v_prize.type,
      'code', coalesce(v_code.code, null)
    )
  );
end;
$$;

grant execute on function public.redeem_reward(uuid, uuid) to service_role;
grant execute on function public.add_spins(uuid, integer, text, text, jsonb) to service_role;
grant execute on function public.subtract_spins(uuid, integer, text, text, jsonb) to service_role;
grant execute on function public.spin_wheel(uuid, uuid) to service_role;
