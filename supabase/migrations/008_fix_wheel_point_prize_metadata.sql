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
    v_point_amount := coalesce(
      nullif(v_prize.metadata ->> 'points', '')::int,
      nullif(v_prize.metadata ->> 'point_amount', '')::int,
      0
    );
    insert into public.point_wallets (user_id, balance)
    values (p_user_id, 0)
    on conflict (user_id) do nothing;
    update public.point_wallets set balance = balance + v_point_amount, updated_at = now()
    where user_id = p_user_id;
    insert into public.point_transactions (user_id, amount, type, reason, metadata)
    values (p_user_id, v_point_amount, 'credit', 'wheel_prize_points', jsonb_build_object('campaign_id', p_campaign_id, 'prize_id', v_prize.id, 'points', v_point_amount));
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
    jsonb_build_object('prize_type', v_prize.type, 'prize_name', v_prize.name, 'code', coalesce(v_code.code, null), 'points', v_point_amount)
  );

return jsonb_build_object(
    'ok', true,
    'campaignId', p_campaign_id,
    'prize', jsonb_build_object(
      'id', v_prize.id,
      'name', v_prize.name,
      'type', v_prize.type,
      'code', coalesce(v_code.code, null),
      'points', v_point_amount
    )
  );
end;
$$;

grant execute on function public.spin_wheel(uuid, uuid) to service_role;
