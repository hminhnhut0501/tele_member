create table if not exists public.policy_configs (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null unique,
  scope text not null check (scope in ('system', 'currency', 'reward', 'delivery', 'wheel', 'feature_flag')),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  current_version integer not null default 1,
  published_version integer not null default 0,
  draft_data jsonb not null default '{}'::jsonb,
  published_data jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text,
  published_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policy_configs(id) on delete cascade,
  version integer not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  data jsonb not null default '{}'::jsonb,
  note text,
  created_by text,
  published_by text,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (policy_id, version)
);

create index if not exists idx_policy_configs_scope_status on public.policy_configs(scope, status, updated_at desc);
create index if not exists idx_policy_configs_key on public.policy_configs(policy_key);
create index if not exists idx_policy_versions_policy_created on public.policy_versions(policy_id, created_at desc);
create index if not exists idx_policy_versions_policy_version on public.policy_versions(policy_id, version desc);

alter table public.policy_configs enable row level security;
alter table public.policy_versions enable row level security;
alter table public.policy_configs force row level security;
alter table public.policy_versions force row level security;

create policy "service role full access policy configs"
  on public.policy_configs
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access policy versions"
  on public.policy_versions
  for all
  to service_role
  using (true)
  with check (true);

create policy "authenticated users can read published policy configs"
  on public.policy_configs
  for select
  to authenticated
  using (status = 'published');

create policy "authenticated users can read published policy versions"
  on public.policy_versions
  for select
  to authenticated
  using (status = 'published');

create or replace function public.get_active_policy_json(
  p_policy_key text
)
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    (
      select coalesce(published_data, draft_data, '{}'::jsonb)
      from public.policy_configs
      where policy_key = p_policy_key
        and status = 'published'
      order by updated_at desc
      limit 1
    ),
    '{}'::jsonb
  );
$$;

create or replace function public.get_policy_config(
  p_policy_key text
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with policy as (
    select *
    from public.policy_configs
    where policy_key = p_policy_key
    order by updated_at desc
    limit 1
  ),
  versions as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'policyId', v.policy_id,
          'version', v.version,
          'status', v.status,
          'data', v.data,
          'note', v.note,
          'createdBy', v.created_by,
          'publishedBy', v.published_by,
          'createdAt', v.created_at,
          'publishedAt', v.published_at
        ) order by v.version desc
      ),
      '[]'::jsonb
    ) as items
    from public.policy_versions v
    join policy p on p.id = v.policy_id
  )
  select coalesce(
    (
      select jsonb_build_object(
        'id', policy.id,
        'policyKey', policy.policy_key,
        'scope', policy.scope,
        'title', policy.title,
        'description', policy.description,
        'status', policy.status,
        'currentVersion', policy.current_version,
        'publishedVersion', policy.published_version,
        'draftData', policy.draft_data,
        'publishedData', policy.published_data,
        'createdBy', policy.created_by,
        'updatedBy', policy.updated_by,
        'publishedBy', policy.published_by,
        'createdAt', policy.created_at,
        'updatedAt', policy.updated_at,
        'publishedAt', policy.published_at,
        'versions', versions.items
      )
      from policy, versions
    ),
    jsonb_build_object('policyKey', p_policy_key, 'notFound', true, 'versions', '[]'::jsonb)
  );
$$;

create or replace function public.save_policy_config(
  p_policy_key text,
  p_scope text,
  p_title text,
  p_description text default null,
  p_data jsonb default '{}'::jsonb,
  p_note text default null,
  p_actor_email text default null,
  p_publish boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_policy public.policy_configs;
  v_next_version integer;
  v_status text;
begin
  insert into public.policy_configs (
    policy_key,
    scope,
    title,
    description,
    status,
    current_version,
    published_version,
    draft_data,
    published_data,
    created_by,
    updated_by,
    published_by,
    created_at,
    updated_at,
    published_at
  )
  values (
    p_policy_key,
    p_scope,
    p_title,
    p_description,
    case when p_publish then 'published' else 'draft' end,
    1,
    case when p_publish then 1 else 0 end,
    coalesce(p_data, '{}'::jsonb),
    case when p_publish then coalesce(p_data, '{}'::jsonb) else '{}'::jsonb end,
    p_actor_email,
    p_actor_email,
    case when p_publish then p_actor_email else null end,
    now(),
    now(),
    case when p_publish then now() else null end
  )
  on conflict (policy_key) do update
    set scope = excluded.scope,
        title = excluded.title,
        description = excluded.description,
        draft_data = excluded.draft_data,
        current_version = public.policy_configs.current_version + 1,
        status = case when p_publish then 'published' else 'draft' end,
        updated_by = p_actor_email,
        updated_at = now(),
        published_version = case when p_publish then public.policy_configs.current_version + 1 else public.policy_configs.published_version end,
        published_data = case when p_publish then excluded.draft_data else public.policy_configs.published_data end,
        published_by = case when p_publish then p_actor_email else public.policy_configs.published_by end,
        published_at = case when p_publish then now() else public.policy_configs.published_at end
  returning * into v_policy;

  v_next_version := coalesce(v_policy.current_version, 1);
  v_status := case when p_publish then 'published' else 'draft' end;

  insert into public.policy_versions (
    policy_id,
    version,
    status,
    data,
    note,
    created_by,
    published_by,
    created_at,
    published_at
  )
  values (
    v_policy.id,
    v_next_version,
    v_status,
    coalesce(p_data, '{}'::jsonb),
    p_note,
    p_actor_email,
    case when p_publish then p_actor_email else null end,
    now(),
    case when p_publish then now() else null end
  );

  if p_publish then
    update public.policy_configs
    set published_version = v_next_version,
        published_data = coalesce(p_data, '{}'::jsonb),
        published_by = p_actor_email,
        published_at = now(),
        status = 'published',
        updated_by = p_actor_email,
        updated_at = now()
    where id = v_policy.id;

    update public.policy_versions
    set status = 'published',
        published_by = p_actor_email,
        published_at = now()
    where policy_id = v_policy.id
      and version = v_next_version;
  end if;

  return public.get_policy_config(p_policy_key);
end;
$$;

insert into public.policy_configs (
  policy_key,
  scope,
  title,
  description,
  status,
  current_version,
  published_version,
  draft_data,
  published_data,
  created_by,
  updated_by,
  published_by,
  published_at
)
values
  (
    'currency_policy',
    'currency',
    'Chính sách 🍑',
    'Quy ước điểm đào, tốc độ tích lũy và quy đổi sang lượt quay.',
    'published',
    1,
    1,
    jsonb_build_object(
      'currencyEmoji', '🍑',
      'currencyLabel', 'đào',
      'checkinPeaches', 1,
      'spinExchangeRate', 3,
      'spinExchangeCost', 3,
      'walletTitle', 'Ví đào',
      'checkinHint', 'Mỗi lần check-in nhận 1 🍑',
      'exchangeHint', '3 🍑 = 1 lượt quay'
    ),
    jsonb_build_object(
      'currencyEmoji', '🍑',
      'currencyLabel', 'đào',
      'checkinPeaches', 1,
      'spinExchangeRate', 3,
      'spinExchangeCost', 3,
      'walletTitle', 'Ví đào',
      'checkinHint', 'Mỗi lần check-in nhận 1 🍑',
      'exchangeHint', '3 🍑 = 1 lượt quay'
    ),
    'system',
    'system',
    'system',
    now()
  ),
  (
    'reward_policy',
    'reward',
    'Chính sách quà đổi',
    'Định nghĩa cách giao quà theo loại quà và đích nhận.',
    'published',
    1,
    1,
    jsonb_build_object(
      'POINT', jsonb_build_object('deliveryMode', 'immediate', 'deliveryTarget', 'point_wallet', 'title', 'Cộng 🍑 ngay'),
      'SPIN_TICKET', jsonb_build_object('deliveryMode', 'immediate', 'deliveryTarget', 'spin_wallet', 'title', 'Cộng lượt quay'),
      'VOUCHER', jsonb_build_object('deliveryMode', 'external_code', 'deliveryTarget', 'reward_inbox', 'title', 'Mã voucher'),
      'VIP_CODE', jsonb_build_object('deliveryMode', 'external_code', 'deliveryTarget', 'reward_inbox', 'title', 'Mã VIP'),
      'ITEM', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Quà hộp'),
      'BADGE', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Huy hiệu'),
      'NOTHING', jsonb_build_object('deliveryMode', 'log_only', 'deliveryTarget', 'log_only', 'title', 'Không trúng'),
      'CUSTOM', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Tuỳ chỉnh')
    ),
    jsonb_build_object(
      'POINT', jsonb_build_object('deliveryMode', 'immediate', 'deliveryTarget', 'point_wallet', 'title', 'Cộng 🍑 ngay'),
      'SPIN_TICKET', jsonb_build_object('deliveryMode', 'immediate', 'deliveryTarget', 'spin_wallet', 'title', 'Cộng lượt quay'),
      'VOUCHER', jsonb_build_object('deliveryMode', 'external_code', 'deliveryTarget', 'reward_inbox', 'title', 'Mã voucher'),
      'VIP_CODE', jsonb_build_object('deliveryMode', 'external_code', 'deliveryTarget', 'reward_inbox', 'title', 'Mã VIP'),
      'ITEM', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Quà hộp'),
      'BADGE', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Huy hiệu'),
      'NOTHING', jsonb_build_object('deliveryMode', 'log_only', 'deliveryTarget', 'log_only', 'title', 'Không trúng'),
      'CUSTOM', jsonb_build_object('deliveryMode', 'inbox', 'deliveryTarget', 'reward_inbox', 'title', 'Tuỳ chỉnh')
    ),
    'system',
    'system',
    'system',
    now()
  ),
  (
    'delivery_policy',
    'delivery',
    'Chính sách giao quà',
    'Thiết lập luồng giao quà, inbox và mã bên ngoài.',
    'published',
    1,
    1,
    jsonb_build_object(
      'defaultInboxStatus', 'new',
      'defaultInboxClaimable', false,
      'externalCodeClaimable', true,
      'manualReviewEnabled', true,
      'fallbackDeliveryMode', 'inbox',
      'fallbackDeliveryTarget', 'reward_inbox'
    ),
    jsonb_build_object(
      'defaultInboxStatus', 'new',
      'defaultInboxClaimable', false,
      'externalCodeClaimable', true,
      'manualReviewEnabled', true,
      'fallbackDeliveryMode', 'inbox',
      'fallbackDeliveryTarget', 'reward_inbox'
    ),
    'system',
    'system',
    'system',
    now()
  ),
  (
    'wheel_policy',
    'wheel',
    'Chính sách vòng quay',
    'Quy ước emoji, nhãn, preset slot và hành vi preview.',
    'published',
    1,
    1,
    jsonb_build_object(
      'defaultRenderMode', 'emoji-only',
      'presetRules', jsonb_build_object(
        'five', jsonb_build_object('mobileDensity', 'low', 'clampLabelLength', 6),
        'six', jsonb_build_object('mobileDensity', 'low', 'clampLabelLength', 6),
        'eight', jsonb_build_object('mobileDensity', 'medium', 'clampLabelLength', 5),
        'tenPlus', jsonb_build_object('mobileDensity', 'high', 'clampLabelLength', 4)
      ),
      'glyphRules', jsonb_build_object(
        'POINT', '🍑',
        'SPIN_TICKET', '🎞',
        'VOUCHER', '🎁',
        'VIP_CODE', '👑',
        'NOTHING', '😢',
        'CUSTOM', '✦'
      ),
      'renderHints', jsonb_build_object(
        'useEmojiOnly', true,
        'useLabelOnly', false,
        'fallbackStrategy', 'emoji-only'
      )
    ),
    jsonb_build_object(
      'defaultRenderMode', 'emoji-only',
      'presetRules', jsonb_build_object(
        'five', jsonb_build_object('mobileDensity', 'low', 'clampLabelLength', 6),
        'six', jsonb_build_object('mobileDensity', 'low', 'clampLabelLength', 6),
        'eight', jsonb_build_object('mobileDensity', 'medium', 'clampLabelLength', 5),
        'tenPlus', jsonb_build_object('mobileDensity', 'high', 'clampLabelLength', 4)
      ),
      'glyphRules', jsonb_build_object(
        'POINT', '🍑',
        'SPIN_TICKET', '🎞',
        'VOUCHER', '🎁',
        'VIP_CODE', '👑',
        'NOTHING', '😢',
        'CUSTOM', '✦'
      ),
      'renderHints', jsonb_build_object(
        'useEmojiOnly', true,
        'useLabelOnly', false,
        'fallbackStrategy', 'emoji-only'
      )
    ),
    'system',
    'system',
    'system',
    now()
  ),
  (
    'feature_flags',
    'feature_flag',
    'Feature flags',
    'Cờ bật/tắt cho các khu vực vận hành và phát hành.',
    'published',
    1,
    1,
    jsonb_build_object(
      'adminPolicyCenter', true,
      'rewardPolicyCenter', true,
      'wheelPolicyCenter', true,
      'policyPreviewEnabled', true,
      'policyPublishFlowEnabled', true
    ),
    jsonb_build_object(
      'adminPolicyCenter', true,
      'rewardPolicyCenter', true,
      'wheelPolicyCenter', true,
      'policyPreviewEnabled', true,
      'policyPublishFlowEnabled', true
    ),
    'system',
    'system',
    'system',
    now()
  )
on conflict (policy_key) do nothing;

drop function if exists public.reward_policy_mode(text, jsonb);

create or replace function public.reward_policy_mode(
  p_kind text,
  p_metadata jsonb
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with policy as (
    select public.get_active_policy_json('reward_policy') as data
  )
  select coalesce(
    jsonb_build_object(
      'deliveryMode',
        coalesce(
          policy.data -> upper(coalesce(p_kind, '')) ->> 'deliveryMode',
          case upper(coalesce(p_kind, ''))
            when 'POINT' then coalesce(p_metadata ->> 'deliveryMode', 'immediate')
            when 'SPIN_TICKET' then coalesce(p_metadata ->> 'deliveryMode', 'immediate')
            when 'VOUCHER' then coalesce(p_metadata ->> 'deliveryMode', 'external_code')
            when 'VIP_CODE' then coalesce(p_metadata ->> 'deliveryMode', 'external_code')
            when 'ITEM' then coalesce(p_metadata ->> 'deliveryMode', 'inbox')
            when 'BADGE' then coalesce(p_metadata ->> 'deliveryMode', 'inbox')
            when 'NOTHING' then 'log_only'
            else coalesce(p_metadata ->> 'deliveryMode', 'inbox')
          end
        ),
      'deliveryTarget',
        coalesce(
          policy.data -> upper(coalesce(p_kind, '')) ->> 'deliveryTarget',
          case upper(coalesce(p_kind, ''))
            when 'POINT' then coalesce(p_metadata ->> 'deliveryTarget', 'point_wallet')
            when 'SPIN_TICKET' then coalesce(p_metadata ->> 'deliveryTarget', 'spin_wallet')
            when 'VOUCHER' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
            when 'VIP_CODE' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
            when 'ITEM' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
            when 'BADGE' then coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
            when 'NOTHING' then 'log_only'
            else coalesce(p_metadata ->> 'deliveryTarget', 'reward_inbox')
          end
        )
    )
  from policy;
$$;

grant execute on function public.get_active_policy_json(text) to authenticated, service_role;
grant execute on function public.get_policy_config(text) to authenticated, service_role;
grant execute on function public.save_policy_config(text, text, text, text, jsonb, text, text, boolean) to service_role;
grant execute on function public.reward_policy_mode(text, jsonb) to authenticated, service_role;
grant execute on function public.reward_policy_mode(text, jsonb) to service_role;
