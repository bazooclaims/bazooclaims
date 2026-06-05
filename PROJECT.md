# Bazoo Claims — project overview

Enterprise-style motor claims marketing site for **Bazoo Accident Management** / **Bazoo Claims**, aimed at UK drivers who need replacement vehicles, repairs, and end-to-end claim support.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **API routes** as the backend (`POST /api/claim-intake`)

## What’s included

| Area | Details |
|------|---------|
| **Pages** | Home, vehicle replacement, why it’s free, start your claim, privacy, cookies, terms |
| **Branding** | Teal `#003b49`, accent `#00d2ff`; fonts Lexend (headings) + Source Sans 3 (body) in `src/app/layout.tsx` and `src/app/globals.css` |
| **Logo** | `public/logo-bazoo.png` — used in `SiteHeader.tsx` (`logo-bazoo.svg` kept as optional fallback asset) |
| **WhatsApp** | Bottom-right FAB only (`WhatsAppFloat.tsx` + `getWhatsAppUrl()`); brand-green circle + official-style SVG glyph (no separate icon file) |
| **Brand imagery** | `public/brand/motor-*.png` used by `MotorImageryStrip.tsx` (replace files to refresh photos) |
| **Forms** | `StartClaimForm.tsx` on **`/start-your-claim`** → **`POST /api/claim-intake`** creates an **enquiry** (reference `ENQ-…`); a **claim** (`BZ-…`) is created only when staff use **Create claim** in admin |
| **Supabase** | **Not connected.** Stubs only: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`. Add `@supabase/supabase-js`, implement clients, and set env vars from `.env.example` when ready |

## Folder layout

See also `development/project-structure.txt`.

- `public/` — static assets
- `src/app/` — routes and API handlers
- `src/components/` — layout, sections, forms
- `src/config/` — site copy, nav, WhatsApp helpers
- `src/lib/` — utils, validators, Supabase placeholders
- `src/types/` — shared TypeScript types

## Environment variables

Copy `.env.example` to `.env.local` and adjust:

- **`NEXT_PUBLIC_WHATSAPP_E164`** — digits only (e.g. `447700900123`) so WhatsApp links and the float button work
- **`NEXT_PUBLIC_SITE_URL`** — canonical site URL for metadata
- **`NEXT_PUBLIC_COMPANY_PHONE`** — display phone
- **Supabase** — leave blank until you connect; no client is created and no calls are made

## Run locally

```bash
cd /Users/omar/Desktop/BAZOOCLAIMS
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API: claim intake

- **Endpoint:** `POST /api/claim-intake`
- **Behaviour:** Validates JSON body (same rules as `parseClaimIntake` in `src/lib/validators/claim-intake.ts`), returns `{ ok: true, reference, persistence: "none" }` until you add storage (e.g. Supabase).

## Next steps (optional)

- Wire **Supabase** inserts for claim intakes
- Add **email** or CRM notifications from the API route
- Replace placeholder legal pages under `/privacy-policy`, `/cookie-policy`, `/terms` with counsel-approved copy
