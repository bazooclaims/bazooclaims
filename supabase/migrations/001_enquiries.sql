-- Bazoo Claims — optional Supabase mirror for enquiries (local JSON remains primary).
-- Run in Supabase SQL editor or via CLI after creating a project.

create extension if not exists "uuid-ossp";

create table if not exists public.enquiries (
  id text primary key,
  reference text not null,
  status text not null default 'new',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries (status);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

-- Service role bypasses RLS; no policies needed for server-only access.
-- If you later read from the browser with anon key, add appropriate policies.

comment on table public.enquiries is 'Mirror of website enquiries; app writes via service role.';
