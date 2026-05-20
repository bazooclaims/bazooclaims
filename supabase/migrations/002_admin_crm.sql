-- BAZOOCLAIMS — optional Postgres mirror for the full admin / CRM JSON store.
-- The app still uses data/admin-db.json as the source of truth unless you wire repositories.
-- Apply after 001_enquiries.sql (or merge). Service role bypasses RLS for server writes.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Company profile (single logical row; id is a fixed sentinel)
-- ---------------------------------------------------------------------------
create table if not exists public.company_profile (
  id text primary key default 'default' check (id = 'default'),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Staff (mirror of app staff; password_hash optional when using Supabase Auth only)
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'handler')),
  active boolean not null default true,
  password_hash text,
  auth_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_active_email_idx on public.staff (active, email);

-- ---------------------------------------------------------------------------
-- Claims, invoices, templates — JSONB payloads match TypeScript types in src/types/admin.ts
-- ---------------------------------------------------------------------------
create table if not exists public.claims (
  id text primary key,
  reference text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists claims_reference_idx on public.claims (reference);
create index if not exists claims_status_idx on public.claims (status);
create index if not exists claims_updated_idx on public.claims (updated_at desc);

create table if not exists public.invoices (
  id text primary key,
  number text not null,
  claim_id text references public.claims (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists invoices_number_idx on public.invoices (number);
create index if not exists invoices_claim_idx on public.invoices (claim_id);
create index if not exists invoices_updated_idx on public.invoices (updated_at desc);

create table if not exists public.invoice_templates (
  id text primary key,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists invoice_templates_name_idx on public.invoice_templates (name);

-- ---------------------------------------------------------------------------
-- Activity log (audit)
-- ---------------------------------------------------------------------------
create table if not exists public.activity (
  id text primary key,
  at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists activity_at_idx on public.activity (at desc);

-- ---------------------------------------------------------------------------
-- RLS: locked down by default; use service role from Next.js API routes only.
-- ---------------------------------------------------------------------------
alter table public.company_profile enable row level security;
alter table public.staff enable row level security;
alter table public.claims enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_templates enable row level security;
alter table public.activity enable row level security;

comment on table public.company_profile is 'Mirror: companyProfile object from admin JSON store.';
comment on table public.staff is 'Mirror: staff[]; link auth_user_id to Supabase Auth users for SSO.';
comment on table public.claims is 'Mirror: claims[]; payload = full AdminClaim JSON.';
comment on table public.invoices is 'Mirror: invoices[]; payload = full Invoice JSON.';
comment on table public.invoice_templates is 'Mirror: invoiceTemplates[]; payload = template fields beyond id/name.';
comment on table public.activity is 'Mirror: activity[]; payload = ActivityEntry JSON.';
