-- Fixed three-segment wheel with nested, server-side outcomes.
alter table public.wheel_prizes
  add column if not exists group_key text not null default 'gift';

alter table public.wheel_prizes
  drop constraint if exists wheel_prizes_group_key_check;

alter table public.wheel_prizes
  add constraint wheel_prizes_group_key_check
  check (group_key in ('gift', 'peach', 'nothing'));

create index if not exists idx_wheel_prizes_campaign_group_active
  on public.wheel_prizes(campaign_id, group_key, is_active);

-- Preserve existing campaigns while giving old rows a sensible group.
update public.wheel_prizes
set group_key = case
  when upper(type) = 'NOTHING' then 'nothing'
  when coalesce(metadata ->> 'groupKey', '') in ('gift', 'peach', 'nothing') then metadata ->> 'groupKey'
  when upper(type) = 'POINT' and (
    lower(name) like '%đào%' or lower(name) like '%peach%' or coalesce(metadata ->> 'points', '') <> ''
  ) then 'peach'
  else 'gift'
end
where group_key = 'gift' or group_key is null;

update public.wheel_campaigns
set metadata = jsonb_set(
  coalesce(metadata, '{}'::jsonb),
  '{groupWeights}',
  coalesce(metadata -> 'groupWeights', '{"gift":40,"peach":45,"nothing":15}'::jsonb),
  true
)
where not (coalesce(metadata, '{}'::jsonb) ? 'groupWeights');

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
  v_group_key text;
  v_group_roll numeric;
  v_group_running numeric := 0;
  v_group_total numeric := 0;
  v_gift_weight numeric := 0;
  v_peach_weight numeric := 0;
  v_nothing_weight numeric := 0;
  v_group_outcome_weight numeric;
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

  select
    coalesce((v_campaign.metadata -> 'groupWeights' ->> 'gift')::numeric, 40),
    coalesce((v_campaign.metadata -> 'groupWeights' ->> 'peach')::numeric, 45),
    coalesce((v_campaign.metadata -> 'groupWeights' ->> 'nothing')::numeric, 15)
  into v_gift_weight, v_peach_weight, v_nothing_weight;

  select coalesce(sum(weight), 0) into v_group_outcome_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and group_key = 'gift'
    and is_active = true and weight > 0 and (stock is null or stock > 0);
  if v_group_outcome_weight > 0 then v_group_total := v_group_total + greatest(v_gift_weight, 0); end if;

  select coalesce(sum(weight), 0) into v_group_outcome_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and group_key = 'peach'
    and is_active = true and weight > 0 and (stock is null or stock > 0);
  if v_group_outcome_weight > 0 then v_group_total := v_group_total + greatest(v_peach_weight, 0); end if;

  select coalesce(sum(weight), 0) into v_group_outcome_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and group_key = 'nothing'
    and is_active = true and weight > 0 and (stock is null or stock > 0);
  if v_group_outcome_weight > 0 then v_group_total := v_group_total + greatest(v_nothing_weight, 0); end if;

  if v_group_total <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'no_prizes_available');
  end if;

  update public.spin_wallets
  set balance = balance - 1, updated_at = now()
  where user_id = p_user_id;

  insert into public.spin_transactions (user_id, amount, type, reason, metadata)
  values (p_user_id, -1, 'SPIN_USED', 'wheel_spin', jsonb_build_object('campaign_id', p_campaign_id));

  v_group_roll := random() * v_group_total;

  select coalesce(sum(weight), 0) into v_group_outcome_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and group_key = 'gift'
    and is_active = true and weight > 0 and (stock is null or stock > 0);
  if v_group_outcome_weight > 0 then
    v_group_running := v_group_running + greatest(v_gift_weight, 0);
    if v_group_roll <= v_group_running then v_group_key := 'gift'; end if;
  end if;

  if v_group_key is null then
    select coalesce(sum(weight), 0) into v_group_outcome_weight
    from public.wheel_prizes
    where campaign_id = p_campaign_id and group_key = 'peach'
      and is_active = true and weight > 0 and (stock is null or stock > 0);
    if v_group_outcome_weight > 0 then
      v_group_running := v_group_running + greatest(v_peach_weight, 0);
      if v_group_roll <= v_group_running then v_group_key := 'peach'; end if;
    end if;
  end if;

  if v_group_key is null then v_group_key := 'nothing'; end if;

  select coalesce(sum(weight), 0) into v_total_weight
  from public.wheel_prizes
  where campaign_id = p_campaign_id and group_key = v_group_key
    and is_active = true and weight > 0 and (stock is null or stock > 0);
  v_roll := floor(random() * v_total_weight) + 1;

  for v_prize in
    select *
    from public.wheel_prizes
    where campaign_id = p_campaign_id and group_key = v_group_key
      and is_active = true and weight > 0 and (stock is null or stock > 0)
    order by created_at asc
    for update skip locked
  loop
    v_running := v_running + v_prize.weight;
    if v_roll <= v_running then exit; end if;
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
    update public.point_wallets set balance = balance + v_point_amount, updated_at = now() where user_id = p_user_id;
    insert into public.point_transactions (user_id, amount, type, reason, metadata)
    values (p_user_id, v_point_amount, 'credit', 'wheel_prize_points', jsonb_build_object('campaign_id', p_campaign_id, 'prize_id', v_prize.id));
  elsif v_prize.type in ('VOUCHER', 'VIP_CODE') then
    select * into v_code from public.reward_codes
    where reward_id = (v_prize.metadata ->> 'reward_id')::uuid and status = 'AVAILABLE'
    order by created_at asc limit 1 for update skip locked;
    if found then
      update public.reward_codes set status = 'USED', assigned_to = p_user_id, assigned_at = now() where id = v_code.id;
    end if;
  elsif v_prize.type = 'SPIN_TICKET' then
    perform public.add_spins(p_user_id, 1, 'SPIN_PRIZE', 'wheel_prize_spin_ticket', jsonb_build_object('campaign_id', p_campaign_id, 'prize_id', v_prize.id));
  end if;

  v_payload := jsonb_build_object(
    'campaignId', p_campaign_id,
    'prizeId', v_prize.id,
    'groupKey', v_group_key,
    'prizeName', v_prize.name,
    'prizeType', v_prize.type,
    'glyph', coalesce(v_prize.metadata ->> 'glyph', v_prize.metadata ->> 'wheelGlyph', v_prize.metadata ->> 'icon', v_prize.metadata ->> 'emoji'),
    'code', coalesce(v_code.code, null),
    'deliveryMode', v_delivery_mode,
    'deliveryTarget', v_delivery_target,
    'metadata', coalesce(v_prize.metadata, '{}'::jsonb)
  );

  v_delivery_id := public.log_reward_delivery(p_user_id, 'wheel', null, null, v_prize.id, v_delivery_mode, v_delivery_target, 'success', 'wheel spin resolved', v_payload);

  if v_prize.type <> 'NOTHING' then
    v_inbox_id := public.add_reward_inbox_item(
      p_user_id, 'wheel', v_delivery_id, v_prize.type,
      case when v_prize.type in ('POINT', 'SPIN_TICKET') then 'delivered' else 'new' end,
      v_prize.type not in ('POINT', 'SPIN_TICKET'),
      coalesce(v_prize.metadata ->> 'inboxTitle', v_prize.name),
      coalesce(v_prize.metadata ->> 'inboxSubtitle', v_prize.metadata ->> 'description'),
      v_payload, null, null
    );
  end if;

  v_history_metadata := jsonb_build_object(
    'groupKey', v_group_key,
    'prize_type', v_prize.type,
    'prize_name', v_prize.name,
    'code', coalesce(v_code.code, null),
    'delivery_mode', v_delivery_mode,
    'delivery_target', v_delivery_target,
    'inbox_item_id', v_inbox_id,
    'delivery_log_id', v_delivery_id
  );

  insert into public.wheel_spins (user_id, campaign_id, prize_id, cost_spins, result_metadata, delivery_status, delivery_mode, delivery_target, delivery_payload)
  values (p_user_id, p_campaign_id, v_prize.id, 1, v_history_metadata, 'COMPLETED', v_delivery_mode, v_delivery_target, v_payload);

  return jsonb_build_object(
    'ok', true,
    'campaignId', p_campaign_id,
    'groupKey', v_group_key,
    'deliveryStatus', 'COMPLETED',
    'deliveryMode', v_delivery_mode,
    'deliveryTarget', v_delivery_target,
    'inboxItemId', v_inbox_id,
    'deliveryLogId', v_delivery_id,
    'prize', jsonb_build_object('id', v_prize.id, 'name', v_prize.name, 'type', v_prize.type, 'code', coalesce(v_code.code, null), 'glyph', coalesce(v_prize.metadata ->> 'glyph', v_prize.metadata ->> 'wheelGlyph', v_prize.metadata ->> 'icon', v_prize.metadata ->> 'emoji'))
  );
end;
$$;

create or replace function public.wheel_campaign_probability_preview(p_campaign_id uuid)
returns jsonb
language sql
stable
as $$
  with campaign as (
    select coalesce(metadata -> 'groupWeights', '{"gift":40,"peach":45,"nothing":15}'::jsonb) as weights
    from public.wheel_campaigns where id = p_campaign_id
  ),
  groups as (
    select key as group_key, value::numeric as weight
    from campaign, jsonb_each_text(campaign.weights)
    where key in ('gift', 'peach', 'nothing')
  ),
  outcomes as (
    select group_key, coalesce(sum(weight) filter (where is_active and weight > 0 and (stock is null or stock > 0)), 0) as outcome_weight
    from public.wheel_prizes where campaign_id = p_campaign_id group by group_key
  ),
  eligible as (
    select groups.group_key, groups.weight, coalesce(outcomes.outcome_weight, 0) as outcome_weight
    from groups left join outcomes using (group_key)
  ),
  total as (
    select coalesce(sum(weight) filter (where outcome_weight > 0), 0) as total_weight from eligible
  ),
  group_rows as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'groupKey', eligible.group_key,
      'weight', eligible.weight,
      'chance', case when total.total_weight > 0 and eligible.outcome_weight > 0 then round(eligible.weight / total.total_weight * 100, 2) else 0 end,
      'outcomeWeight', eligible.outcome_weight,
      'available', eligible.outcome_weight > 0
    ) order by case eligible.group_key when 'gift' then 1 when 'peach' then 2 else 3 end), '[]'::jsonb) as rows
    from eligible, total
  ),
  prize_rows as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.name, 'type', p.type, 'groupKey', p.group_key, 'weight', p.weight, 'stock', p.stock, 'isActive', p.is_active,
      'chance', case when e.outcome_weight > 0 and p.is_active and p.weight > 0 and (p.stock is null or p.stock > 0) then round((p.weight::numeric / e.outcome_weight::numeric) * 100, 2) else 0 end,
      'glyph', coalesce(nullif(p.metadata ->> 'glyph', ''), nullif(p.metadata ->> 'emoji', ''), case upper(p.type) when 'POINT' then '🍑' when 'NOTHING' then '✦' when 'VOUCHER' then '🎁' else '✦' end)
    ) order by case p.group_key when 'gift' then 1 when 'peach' then 2 else 3 end, p.created_at, p.id), '[]'::jsonb) as rows
    from public.wheel_prizes p join eligible e on e.group_key = p.group_key
    where p.campaign_id = p_campaign_id
  )
  select jsonb_build_object('campaignId', p_campaign_id, 'totalWeight', total.total_weight, 'groups', group_rows.rows, 'prizes', prize_rows.rows)
  from total, group_rows, prize_rows;
$$;

grant execute on function public.spin_wheel(uuid, uuid) to service_role;
grant execute on function public.wheel_campaign_probability_preview(uuid) to authenticated, service_role;
