create table if not exists public.ops_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  category text not null,
  severity text not null check (severity in ('info', 'warning', 'error', 'critical')),
  title text not null,
  message text not null,
  target_telegram_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ops_events_created_at on public.ops_events(created_at desc);
create index if not exists idx_ops_events_severity_created_at on public.ops_events(severity, created_at desc);
create index if not exists idx_ops_events_category_created_at on public.ops_events(category, created_at desc);

alter table public.ops_events enable row level security;
alter table public.ops_events force row level security;

create policy "service role full access ops events"
  on public.ops_events
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.log_ops_event(
  p_source text,
  p_category text,
  p_severity text,
  p_title text,
  p_message text,
  p_target_telegram_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.ops_events (
    source,
    category,
    severity,
    title,
    message,
    target_telegram_id,
    metadata
  )
  values (
    p_source,
    p_category,
    p_severity,
    p_title,
    p_message,
    p_target_telegram_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.log_ops_event(text, text, text, text, text, text, jsonb) to service_role;
