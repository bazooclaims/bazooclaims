-- Vendors directory (partners / suppliers) — primary store when using Supabase CRM.

create table if not exists public.vendors (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists vendors_updated_idx on public.vendors (updated_at desc);

alter table public.vendors enable row level security;

comment on table public.vendors is 'CRM vendors[]; payload = full Vendor JSON from src/types/admin.ts.';
