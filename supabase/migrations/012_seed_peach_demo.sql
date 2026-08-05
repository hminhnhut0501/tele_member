-- Demo seed theo hệ đào 🍑:
-- - Reward store dùng point_cost như số đào cần đổi
-- - Wheel prizes dùng emoji/glyph để render ngắn gọn trong UI
-- - Seed spin wallet để test wheel ngay sau khi đổi đào

do $$
declare
  v_reward_voucher uuid;
  v_reward_spin uuid;
  v_reward_bonus uuid;
  v_reward_badge uuid;
  v_campaign uuid;
  v_user_id uuid;
begin
  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Voucher 20 🍑', 'Voucher test theo hệ đào.', 'VOUCHER', 20, 25, true, jsonb_build_object('demo', true, 'glyph', '🎁', 'currency', 'peach', 'emoji', '🎁')
  where not exists (select 1 from public.rewards where name = 'Voucher 20 🍑');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Spin Ticket +3', 'Đổi đào lấy thêm lượt quay.', 'SPIN_TICKET', 9, 50, true, jsonb_build_object('demo', true, 'glyph', '🎞', 'currency', 'peach', 'emoji', '🎞', 'spin_ticket_amount', 3)
  where not exists (select 1 from public.rewards where name = 'Spin Ticket +3');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Bonus +10 🍑', 'Thưởng đào nhanh để test redeem.', 'POINT_BONUS', 12, null, true, jsonb_build_object('demo', true, 'glyph', '🍑', 'currency', 'peach', 'bonus_points', 10)
  where not exists (select 1 from public.rewards where name = 'Bonus +10 🍑');

  insert into public.rewards (name, description, type, point_cost, stock, is_active, metadata)
  select 'Badge Peach Lover', 'Badge mẫu cho inbox.', 'CUSTOM', 6, null, true, jsonb_build_object('demo', true, 'glyph', '💠', 'currency', 'peach', 'deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox')
  where not exists (select 1 from public.rewards where name = 'Badge Peach Lover');

  select id into v_reward_voucher from public.rewards where name = 'Voucher 20 🍑' limit 1;
  select id into v_reward_spin from public.rewards where name = 'Spin Ticket +3' limit 1;
  select id into v_reward_bonus from public.rewards where name = 'Bonus +10 🍑' limit 1;
  select id into v_reward_badge from public.rewards where name = 'Badge Peach Lover' limit 1;

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_voucher, 'PCH-VOUCHER-001', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_voucher and code = 'PCH-VOUCHER-001'
  );

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_voucher, 'PCH-VOUCHER-002', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_voucher and code = 'PCH-VOUCHER-002'
  );

  insert into public.reward_codes (reward_id, code, status)
  select v_reward_spin, 'PCH-SPIN-003', 'AVAILABLE'
  where not exists (
    select 1 from public.reward_codes where reward_id = v_reward_spin and code = 'PCH-SPIN-003'
  );

  insert into public.wheel_campaigns (name, description, is_active, starts_at, ends_at, metadata)
  select
    'Peach Lobby Wheel',
    'Wheel demo theo style game lobby xanh dương đồng nhất.',
    true,
    now() - interval '1 day',
    now() + interval '45 day',
    jsonb_build_object('demo', true, 'theme', 'blue_lobby', 'currency', 'peach')
  where not exists (select 1 from public.wheel_campaigns where name = 'Peach Lobby Wheel');

  select id into v_campaign from public.wheel_campaigns where name = 'Peach Lobby Wheel' limit 1;

  update public.wheel_campaigns
  set is_active = false, updated_at = now()
  where is_active = true and id <> v_campaign;

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, '🍑 +1', 'POINT', 36, null, true, jsonb_build_object('demo', true, 'points', 1, 'glyph', '🍑', 'emojiCount', 1, 'wheelLabel', '🍑', 'railLabel', 'Nhận 1 🍑')
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = '🍑 +1'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, '🍑 +3', 'POINT', 24, null, true, jsonb_build_object('demo', true, 'points', 3, 'glyph', '🍑', 'emojiCount', 1, 'wheelLabel', '🍑×3', 'railLabel', 'Nhận 3 🍑')
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = '🍑 +3'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, '🎞 +1', 'SPIN_TICKET', 16, 25, true, jsonb_build_object('demo', true, 'glyph', '🎞', 'emojiCount', 1, 'wheelLabel', '🎞', 'railLabel', '1 lượt quay')
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = '🎞 +1'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, '🎁 Voucher', 'VOUCHER', 12, 18, true, jsonb_build_object('demo', true, 'glyph', '🎁', 'emojiCount', 1, 'wheelLabel', '🎁', 'railLabel', 'Voucher inbox')
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = '🎁 Voucher'
  );

  insert into public.wheel_prizes (campaign_id, name, type, weight, stock, is_active, metadata)
  select v_campaign, '😢 Không trúng', 'NOTHING', 12, null, true, jsonb_build_object('demo', true, 'glyph', '😢', 'emojiCount', 1, 'wheelLabel', '😢', 'railLabel', 'Không trúng')
  where not exists (
    select 1 from public.wheel_prizes where campaign_id = v_campaign and name = '😢 Không trúng'
  );

  for v_user_id in
    select id from public.users
  loop
    insert into public.point_wallets (user_id, balance)
    values (v_user_id, 12)
    on conflict (user_id) do update
      set balance = greatest(public.point_wallets.balance, excluded.balance),
          updated_at = now();

    insert into public.spin_wallets (user_id, balance)
    values (v_user_id, 3)
    on conflict (user_id) do update
      set balance = greatest(public.spin_wallets.balance, excluded.balance),
          updated_at = now();
  end loop;
end $$;
