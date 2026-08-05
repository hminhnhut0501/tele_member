alter table public.reward_redemptions
  add column if not exists delivery_status text not null default 'COMPLETED',
  add column if not exists delivery_mode text not null default 'immediate',
  add column if not exists delivery_target text not null default 'reward_inbox',
  add column if not exists delivery_payload jsonb not null default '{}'::jsonb;

alter table public.wheel_spins
  add column if not exists delivery_status text not null default 'COMPLETED',
  add column if not exists delivery_mode text not null default 'immediate',
  add column if not exists delivery_target text not null default 'reward_inbox',
  add column if not exists delivery_payload jsonb not null default '{}'::jsonb;

create table if not exists public.reward_inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null check (source_type in ('wheel', 'reward_redemption', 'manual', 'checkin')),
  source_id uuid,
  kind text not null check (kind in ('POINT', 'SPIN_TICKET', 'VOUCHER', 'VIP_CODE', 'ITEM', 'BADGE', 'NOTHING', 'CUSTOM')),
  status text not null default 'new' check (status in ('new', 'delivered', 'claimed', 'expired', 'failed')),
  claimable boolean not null default false,
  title text not null,
  subtitle text,
  payload jsonb not null default '{}'::jsonb,
  claim_url text,
  expires_at timestamptz,
  viewed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null check (source_type in ('wheel', 'reward_redemption', 'manual', 'checkin')),
  source_id uuid,
  reward_id uuid references public.rewards(id) on delete set null,
  prize_id uuid references public.wheel_prizes(id) on delete set null,
  delivery_mode text not null,
  delivery_target text not null,
  status text not null check (status in ('success', 'failed', 'pending')),
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_reward_inbox_items_user_created on public.reward_inbox_items(user_id, created_at desc);
create index if not exists idx_reward_inbox_items_user_status on public.reward_inbox_items(user_id, status, created_at desc);
create index if not exists idx_reward_delivery_logs_user_created on public.reward_delivery_logs(user_id, created_at desc);

alter table public.reward_inbox_items enable row level security;
alter table public.reward_delivery_logs enable row level security;
alter table public.reward_inbox_items force row level security;
alter table public.reward_delivery_logs force row level security;

create policy "service role full access reward_inbox_items"
  on public.reward_inbox_items
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access reward_delivery_logs"
  on public.reward_delivery_logs
  for all
  to service_role
  using (true)
  with check (true);

create policy "authenticated users can read own reward inbox"
  on public.reward_inbox_items
  for select
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  );

create policy "authenticated users can update own reward inbox"
  on public.reward_inbox_items
  for update
  to authenticated
  using (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  )
  with check (
    user_id in (
      select id from public.users where telegram_id = public.current_telegram_id()
    )
  );

create or replace function public.add_reward_inbox_item(
  p_user_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_kind text,
  p_status text,
  p_claimable boolean,
  p_title text,
  p_subtitle text default null,
  p_payload jsonb default '{}'::jsonb,
  p_claim_url text default null,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.reward_inbox_items (
    user_id,
    source_type,
    source_id,
    kind,
    status,
    claimable,
    title,
    subtitle,
    payload,
    claim_url,
    expires_at
  )
  values (
    p_user_id,
    p_source_type,
    p_source_id,
    p_kind,
    coalesce(p_status, 'new'),
    coalesce(p_claimable, false),
    p_title,
    p_subtitle,
    coalesce(p_payload, '{}'::jsonb),
    p_claim_url,
    p_expires_at
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.log_reward_delivery(
  p_user_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_reward_id uuid,
  p_prize_id uuid,
  p_delivery_mode text,
  p_delivery_target text,
  p_status text,
  p_message text default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.reward_delivery_logs (
    user_id,
    source_type,
    source_id,
    reward_id,
    prize_id,
    delivery_mode,
    delivery_target,
    status,
    message,
    payload
  )
  values (
    p_user_id,
    p_source_type,
    p_source_id,
    p_reward_id,
    p_prize_id,
    p_delivery_mode,
    p_delivery_target,
    p_status,
    p_message,
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.reward_policy_mode(
  p_kind text,
  p_metadata jsonb
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'deliveryMode',
      case upper(coalesce(p_kind, ''))
        when 'POINT' then coalesce(p_metadata ->> 'deliveryMode', 'immediate')
        when 'SPIN_TICKET' then coalesce(p_metadata ->> 'deliveryMode', 'immediate')
        when 'VOUCHER' then coalesce(p_metadata ->> 'deliveryMode', 'external_code')
        when 'VIP_CODE' then coalesce(p_metadata ->> 'deliveryMode', 'external_code')
        when 'ITEM' then coalesce(p_metadata ->> 'deliveryMode', 'inbox')
        when 'BADGE' then coalesce(p_metadata ->> 'deliveryMode', 'inbox')
        when 'NOTHING' then 'log_only'
        else coalesce(p_metadata ->> 'deliveryMode', 'inbox')
      end,
    'deliveryTarget',
      case upper(coalesce(p_kind, ''))
        when 'POINT' then coalesce(p_metadata ->> 'deliveryTarget', 'point_wallet')
        when 'SPIN_TICKET' then coalesce(p_metadata ->> 'deliveryTarget', 'spin_wallet')
        when 'VOUCHER' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
        when 'VIP_CODE' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
        when 'ITEM' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
        when 'BADGE' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
        when 'NOTHING' then 'log_only'
        else coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
      end,
    'token', coalesce(p_metadata ->> 'glyph', p_metadata ->> 'wheelGlyph', p_metadata ->> 'icon', p_metadata ->> 'emoji')
  );
$$;

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
  v_inbox_id uuid;
  v_delivery_id uuid;
  v_policy jsonb;
  v_delivery_mode text;
  v_delivery_target text;
  v_payload jsonb;
  v_claimable boolean := false;
  v_status text := 'delivered';
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

  v_policy := public.reward_policy_mode(v_reward.type, v_reward.metadata);
  v_delivery_mode := coalesce(v_reward.metadata ->> 'deliveryMode', v_policy ->> 'deliveryMode');
  v_delivery_target := coalesce(v_reward.metadata ->> 'deliveryTarget', v_policy ->> 'deliveryTarget');

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

  v_payload := jsonb_build_object(
    'rewardId', p_reward_id,
    'rewardName', v_reward.name,
    'rewardType', v_reward.type,
    'code', case when v_code.id is not null then v_code.code else null end,
    'pointCost', v_reward.point_cost,
    'deliveryMode', v_delivery_mode,
    'deliveryTarget', v_delivery_target,
    'metadata', coalesce(v_reward.metadata, '{}'::jsonb)
  );

  v_delivery_id := public.log_reward_delivery(
    p_user_id,
    'reward_redemption',
    null,
    p_reward_id,
    null,
    v_delivery_mode,
    v_delivery_target,
    'success',
    'reward redeemed',
    v_payload
  );

  v_inbox_id := public.add_reward_inbox_item(
    p_user_id,
    'reward_redemption',
    v_delivery_id,
    v_reward.type,
    'delivered',
    v_claimable,
    v_reward.name,
    coalesce(v_reward.description, v_reward.metadata ->> 'description'),
    v_payload,
    case when v_reward.type in ('VOUCHER', 'VIP_CODE') then null else null end,
    null
  );

  insert into public.reward_redemptions (user_id, reward_id, code_id, point_cost, status, metadata, delivery_status, delivery_mode, delivery_target, delivery_payload)
  values (
    p_user_id,
    p_reward_id,
    case when v_reward.type in ('VOUCHER', 'VIP_CODE') then v_code.id else null end,
    v_reward.point_cost,
    'COMPLETED',
    jsonb_build_object('reward_type', v_reward.type, 'inbox_item_id', v_inbox_id, 'delivery_log_id', v_delivery_id),
    'COMPLETED',
    v_delivery_mode,
    v_delivery_target,
    v_payload
  )
  returning * into v_redemption;

  return jsonb_build_object(
    'ok', true,
    'redemptionId', v_redemption.id,
    'inboxItemId', v_inbox_id,
    'deliveryLogId', v_delivery_id,
    'rewardId', p_reward_id,
    'rewardName', v_reward.name,
    'rewardType', v_reward.type,
    'code', case when v_code.id is not null then v_code.code else null end,
    'spinBalance', coalesce((select balance from public.spin_wallets where user_id = p_user_id), 0),
    'pointBalance', coalesce(v_new_balance, 0)
  );
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
  v_policy jsonb;
  v_delivery_mode text;
  v_delivery_target text;
  v_payload jsonb;
  v_delivery_id uuid;
  v_inbox_id uuid;
  v_history_metadata jsonb;
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

  v_policy := public.reward_policy_mode(v_prize.type, v_prize.metadata);
  v_delivery_mode := coalesce(v_prize.metadata ->> 'deliveryMode', v_policy ->> 'deliveryMode');
  v_delivery_target := coalesce(v_prize.metadata ->> 'deliveryTarget', v_policy ->> 'deliveryTarget');

  if v_prize.stock is not null then
    update public.wheel_prizes set stock = stock - 1, updated_at = now() where id = v_prize.id;
  end if;

  if v_prize.type = 'POINT' then
    v_point_amount := coalesce((v_prize.metadata ->> 'points')::int, (v_prize.metadata ->> 'point_amount')::int, (v_prize.metadata ->> 'value')::int, 0);
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

  v_payload := jsonb_build_object(
    'campaignId', p_campaign_id,
    'prizeId', v_prize.id,
    'prizeName', v_prize.name,
    'prizeType', v_prize.type,
    'glyph', coalesce(v_prize.metadata ->> 'glyph', v_prize.metadata ->> 'wheelGlyph', v_prize.metadata ->> 'icon', v_prize.metadata ->> 'emoji'),
    'code', coalesce(v_code.code, null),
    'deliveryMode', v_delivery_mode,
    'deliveryTarget', v_delivery_target,
    'metadata', coalesce(v_prize.metadata, '{}'::jsonb)
  );

  v_delivery_id := public.log_reward_delivery(
    p_user_id,
    'wheel',
    null,
    null,
    v_prize.id,
    v_delivery_mode,
    v_delivery_target,
    'success',
    'wheel spin resolved',
    v_payload
  );

  if v_prize.type <> 'NOTHING' then
    v_inbox_id := public.add_reward_inbox_item(
      p_user_id,
      'wheel',
      v_delivery_id,
      v_prize.type,
      case when v_prize.type in ('POINT', 'SPIN_TICKET') then 'delivered' else 'new' end,
      v_prize.type not in ('POINT', 'SPIN_TICKET'),
      coalesce(v_prize.metadata ->> 'inboxTitle', v_prize.name),
      coalesce(v_prize.metadata ->> 'inboxSubtitle', v_prize.metadata ->> 'description'),
      v_payload,
      null,
      null
    );
  end if;

  v_history_metadata := jsonb_build_object(
    'prize_type', v_prize.type,
    'prize_name', v_prize.name,
    'code', coalesce(v_code.code, null),
    'delivery_mode', v_delivery_mode,
    'delivery_target', v_delivery_target,
    'inbox_item_id', v_inbox_id,
    'delivery_log_id', v_delivery_id
  );

  insert into public.wheel_spins (user_id, campaign_id, prize_id, cost_spins, result_metadata, delivery_status, delivery_mode, delivery_target, delivery_payload)
  values (
    p_user_id,
    p_campaign_id,
    v_prize.id,
    1,
    v_history_metadata,
    'COMPLETED',
    v_delivery_mode,
    v_delivery_target,
    v_payload
  );

  return jsonb_build_object(
    'ok', true,
    'campaignId', p_campaign_id,
    'deliveryStatus', 'COMPLETED',
    'deliveryMode', v_delivery_mode,
    'deliveryTarget', v_delivery_target,
    'inboxItemId', v_inbox_id,
    'deliveryLogId', v_delivery_id,
    'prize', jsonb_build_object(
      'id', v_prize.id,
      'name', v_prize.name,
      'type', v_prize.type,
      'code', coalesce(v_code.code, null),
      'glyph', coalesce(v_prize.metadata ->> 'glyph', v_prize.metadata ->> 'wheelGlyph', v_prize.metadata ->> 'icon', v_prize.metadata ->> 'emoji')
    )
  );
end;
$$;

create or replace function public.wheel_campaign_probability_preview(
  p_campaign_id uuid
)
returns jsonb
language sql
stable
as $$
  with prizes as (
    select
      id,
      name,
      type,
      weight,
      stock,
      is_active,
      metadata,
      created_at,
      coalesce(nullif(metadata ->> 'glyph', ''), nullif(metadata ->> 'wheelGlyph', ''), nullif(metadata ->> 'icon', ''), nullif(metadata ->> 'emoji', ''), case upper(type)
        when 'POINT' then '⭐'
        when 'SPIN_TICKET' then '🎞'
        when 'VOUCHER' then '🎁'
        when 'VIP_CODE' then '👑'
        when 'NOTHING' then '😢'
        else '✦'
      end) as glyph
    from public.wheel_prizes
    where campaign_id = p_campaign_id
  ),
  totals as (
    select coalesce(sum(weight), 0) as total_weight
    from prizes
    where is_active = true and coalesce(stock, 1) > 0
  ),
  prize_rows as (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', prizes.id,
        'name', prizes.name,
        'type', prizes.type,
        'weight', prizes.weight,
        'stock', prizes.stock,
        'isActive', prizes.is_active,
        'glyph', prizes.glyph,
        'chance', case when totals.total_weight > 0 and prizes.is_active and coalesce(prizes.stock, 1) > 0
          then round((prizes.weight::numeric / totals.total_weight::numeric) * 100, 2)
          else 0 end,
        'deliveryMode', coalesce(prizes.metadata ->> 'deliveryMode', case upper(prizes.type)
          when 'POINT' then 'immediate'
          when 'SPIN_TICKET' then 'immediate'
          when 'VOUCHER' then 'external_code'
          when 'VIP_CODE' then 'external_code'
          when 'NOTHING' then 'log_only'
          else 'inbox'
        end),
        'deliveryTarget', coalesce(prizes.metadata ->> 'deliveryTarget', case upper(prizes.type)
          when 'POINT' then 'point_wallet'
          when 'SPIN_TICKET' then 'spin_wallet'
          when 'VOUCHER' then 'reward_inbox'
          when 'VIP_CODE' then 'reward_inbox'
          when 'NOTHING' then 'log_only'
          else 'reward_inbox'
        end),
        'wheelLabel', coalesce(prizes.metadata ->> 'wheelLabel', prizes.name),
        'railLabel', coalesce(prizes.metadata ->> 'railLabel', prizes.name)
      ) order by prizes.created_at asc, prizes.id asc
    ) filter (where prizes.id is not null), '[]'::jsonb) as prizes
    from totals, prizes
  )
  select jsonb_build_object(
    'campaignId', p_campaign_id,
    'totalWeight', totals.total_weight,
    'prizes', prize_rows.prizes
  )
  from totals, prize_rows;
$$;

grant execute on function public.add_reward_inbox_item(uuid, text, uuid, text, text, boolean, text, text, jsonb, text, timestamptz) to service_role;
grant execute on function public.log_reward_delivery(uuid, text, uuid, uuid, uuid, text, text, text, text, jsonb) to service_role;
grant execute on function public.reward_policy_mode(text, jsonb) to authenticated, service_role;
grant execute on function public.reward_policy_mode(text, jsonb) to service_role;
grant execute on function public.redeem_reward(uuid, uuid) to service_role;
grant execute on function public.spin_wheel(uuid, uuid) to service_role;
grant execute on function public.wheel_campaign_probability_preview(uuid) to authenticated, service_role;
