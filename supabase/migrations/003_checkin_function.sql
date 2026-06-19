create or replace function public.checkin_user(
  p_telegram_id text,
  p_username text default null,
  p_first_name text default null,
  p_last_name text default null,
  p_avatar_url text default null,
  p_points integer default 10,
  p_checkin_date date default (timezone('Asia/Ho_Chi_Minh', now())::date)
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_wallet public.point_wallets;
  v_existing_checkin public.daily_checkins;
  v_last_checkin public.daily_checkins;
  v_streak integer := 1;
  v_previous_day date := p_checkin_date - interval '1 day';
  v_total_points integer;
begin
  insert into public.users (telegram_id, username, first_name, last_name, avatar_url)
  values (p_telegram_id, p_username, p_first_name, p_last_name, p_avatar_url)
  on conflict (telegram_id)
  do update set
    username = excluded.username,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    avatar_url = excluded.avatar_url,
    updated_at = now()
  returning * into v_user;

  insert into public.point_wallets (user_id, balance)
  values (v_user.id, 0)
  on conflict (user_id)
  do update set updated_at = now()
  returning * into v_wallet;

  select * into v_existing_checkin
  from public.daily_checkins
  where user_id = v_user.id and checkin_date = p_checkin_date;

  if found then
    select balance into v_total_points
    from public.point_wallets
    where user_id = v_user.id;

    return jsonb_build_object(
      'telegramId', p_telegram_id,
      'today', p_checkin_date,
      'alreadyCheckedIn', true,
      'pointsGained', 0,
      'totalPoints', coalesce(v_total_points, 0),
      'streak', v_existing_checkin.streak,
      'message', format('Hôm nay bạn đã điểm danh rồi. Tổng điểm: %s', coalesce(v_total_points, 0))
    );
  end if;

  select *
  into v_last_checkin
  from public.daily_checkins
  where user_id = v_user.id
  order by checkin_date desc
  limit 1;

  if found and v_last_checkin.checkin_date = v_previous_day then
    v_streak := coalesce(v_last_checkin.streak, 0) + 1;
  end if;

  insert into public.daily_checkins (user_id, checkin_date, points, streak)
  values (v_user.id, p_checkin_date, p_points, v_streak);

  insert into public.point_transactions (user_id, amount, type, reason, metadata)
  values (
    v_user.id,
    p_points,
    'credit',
    'daily_checkin',
    jsonb_build_object('checkin_date', p_checkin_date, 'streak', v_streak)
  );

  select balance into v_total_points
  from public.point_wallets
  where user_id = v_user.id;

  return jsonb_build_object(
    'telegramId', p_telegram_id,
    'today', p_checkin_date,
    'alreadyCheckedIn', false,
    'pointsGained', p_points,
    'totalPoints', coalesce(v_total_points, 0),
    'streak', v_streak,
    'message', format('Bạn nhận được +%s điểm. Tổng điểm: %s', p_points, coalesce(v_total_points, 0))
  );
end;
$$;

grant execute on function public.checkin_user(text, text, text, text, text, integer, date) to service_role;
