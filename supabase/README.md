# Supabase

When **`NEXT_PUBLIC_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** are both set, the admin CRM uses **Postgres as the source of truth** for claims, enquiries, invoices, staff, vendors, activity, company profile, and invoice templates. **`data/admin-db.json` is not used** in that mode.

If those env vars are **not** set, the app falls back to **`data/admin-db.json`** (local file) as before.

## Migrations (run in order)

| File | Purpose |
|------|---------|
| `001_enquiries.sql` | `public.enquiries` |
| `002_admin_crm.sql` | `company_profile`, `staff`, `claims`, `invoices`, `invoice_templates`, `activity` |
| `003_claim_vehicle_fields_comment.sql` | Documentation only |
| `004_vendors.sql` | `public.vendors` (required for Supabase-primary mode) |

Run in the Supabase SQL editor or via the Supabase CLI (`supabase db push` / `psql`).

All tables use **RLS enabled** with no public policies: use the **service role** key only from trusted server code (never in the browser).

## Admin sign-in & registration

1. Apply migrations `001`–`004`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_SUPABASE_AUTH_ONLY=true`.
3. Open **`/admin/register`** and create the **first admin** (creates Supabase Auth user + staff row, then signs you in).
4. Sign in at **`/admin/login`** with the same email/password.

- **`ADMIN_SUPABASE_AUTH_ONLY=true`** or Supabase-primary mode: **no local password** fallback; no `ADMIN_BOOTSTRAP_*` auto-user.
- **`ADMIN_ALLOW_PUBLIC_REGISTER=false`**: blocks `/admin/register` once staff exist (default is open registration).
- Each login still requires a **staff** row whose email matches Supabase Auth.

Optional: `POST /api/admin/auth/supabase-bridge` with `{ "access_token": "..." }` for native clients.

## Migrating from `admin-db.json`

There is no automatic importer yet. Options:

1. **Fresh start**: apply migrations, set env, open `/admin/login` to bootstrap staff, then recreate or import data manually.
2. **Manual**: use SQL or a one-off script to insert rows shaped like the app expects (`payload` JSONB mirrors `src/types/admin.ts`).

## Legacy enquiry sync

`src/lib/supabase/sync-enquiry.ts` only runs when **not** in Supabase-primary mode (it mirrored JSON → Postgres). In primary mode, `writeDb` already persists enquiries.
