-- Demo seed để test UI rewards và lucky wheel.
-- Chạy idempotent: các lệnh đều bỏ qua nếu dữ liệu đã tồn tại.

do $$
declare
  v_reward_voucher uuid;
  v_reward_vip uuid;
  v_reward_spin uuid;
  v_reward_bonus uuid;
  v_campaign uuid;
  v_user_id uuid;
begin
  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Voucher 50K', 'Voucher test cho UI rewards.', 'VOUCHER', 120, 25, true, jsonb_build_object('demo', true)
  where not exists (select 1 from public.rewards where name = 'Voucher 50K');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'VIP Code 7 ngày', 'Code VIP mẫu để test claim reward.', 'VIP_CODE', 220, 12, true, jsonb_build_object('demo', true)
  where not exists (select 1 from public.rewards where name = 'VIP Code 7 ngày');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Spin Ticket', 'Nhận thêm lượt quay cho lucky wheel.', 'SPIN_TICKET', 80, 50, true, jsonb_build_object('demo', true)
  where not exists (select 1 from public.rewards where name = 'Spin Ticket');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Bonus +30 điểm', 'Thưởng điểm nhanh để test redeem.', 'POINT_BONUS', 60, null, true, jsonb_build_object('demo', true, 'bonus_points', 30)
  where not exists (select 1 from public.rewards where name = 'Bonus +30 điểm');

  select id into v_reward_voucher from public.rewards where name = 'Voucher 50K' limit 1;
  select id into v_reward_vip from public.rewards where name = 'VIP Code 7 ngày' limit 1;
  select id into v_reward_spin from public.rewards where name = 'Spin Ticket' limit 1;
  select id into v_reward_bonus from public.rewards where name = 'Bonus +30 điểm' limit 1;

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_voucher, 'VC-50K-DEMO-001', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_voucher and code = 'VC-50K-DEMO-001'
  );

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_voucher, 'VC-50K-DEMO-002', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_voucher and code = 'VC-50K-DEMO-002'
  );

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_vip, 'VIP-7D-DEMO-001', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_vip and code = 'VIP-7D-DEMO-001'
  );

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_vip, 'VIP-7D-DEMO-002', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_vip and code = 'VIP-7D-DEMO-002'
  );

  insert into public.wheel_campaigns (name, description, is_active, starts_at, ends_at, metadata)
  select
    'Demo Lucky Wheel',
    'Campaign mẫu để test vòng quay may mắn.',
    true,
    now() - interval '1 day',
    now() + interval '30 day',
    jsonb_build_object('demo', true)
  where not exists (select 1 from public.wheel_campaigns where name = 'Demo Lucky Wheel');

  select id into v_campaign from public.wheel_campaigns where name = 'Demo Lucky Wheel' limit 1;

  update public.wheel_campaigns
  set is_active = false, updated_at = now()
  where is_active = true and id <> v_campaign;

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, 'Cộng 10 điểm', 'POINT', 40, null, true, jsonb_build_object('demo', true, 'point_amount', 10)
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = 'Cộng 10 điểm'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, 'Cộng 25 điểm', 'POINT', 24, null, true, jsonb_build_object('demo', true, 'point_amount', 25)
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = 'Cộng 25 điểm'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, 'Spin Ticket +1', 'SPIN_TICKET', 18, 20, true, jsonb_build_object('demo', true)
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = 'Spin Ticket +1'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, 'Voucher test', 'VOUCHER', 10, 10, true, jsonb_build_object('demo', true)
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = 'Voucher test'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, 'Không trúng', 'NOTHING', 8, null, true, jsonb_build_object('demo', true)
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = 'Không trúng'
  );

  for v_user_id in
    select id from public.users
  loop
    insert into public.spin_wallets (user_id, balance)
    values (v_user_id, 3)
    on conflict (user_id) do update
      set balance = greatest(public.spin_wallets.balance, excluded.balance),
          updated_at = now();
  end loop;
end $$;
