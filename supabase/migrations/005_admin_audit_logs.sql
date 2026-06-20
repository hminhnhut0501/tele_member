create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  target_telegram_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;
alter table public.admin_audit_logs force row level security;

create policy "service role full access audit logs"
  on public.admin_audit_logs
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists idx_admin_audit_logs_created_at
  on public.admin_audit_logs(created_at desc);
