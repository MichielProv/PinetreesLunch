# Pinetrees Lunch App

Internal tool for lunch planning at Pinetrees Lodge. Newbook is the source of truth; the app reads rosters on demand and stores only overrides (no per-person PII).

## Stack
Next.js · TypeScript · Supabase (Postgres) · Vercel · Newbook REST API

## Prereqs
- Node 20+
- Supabase project (DB)
- Newbook REST API key + region

## Setup
1. Copy `.env.example` → `.env.local` and fill values.
2. Create tables/policies (if needed): see `/supabase/migrations` or SQL in docs.
3. Install deps and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploy
- Vercel is connected to this repo; env vars are set in Project → Settings → Environment Variables.
- Pushing to **main** triggers a new production deploy.

## Key API routes
- `GET /api/newbook/roster?date=YYYY-MM-DD&room=101`
- `POST /api/forms/lunch/submit`
- `GET /api/dashboard/lunch?date=YYYY-MM-DD`

## Security
- No PII persisted (names/dietaries are rendered only).
- Supabase RLS enabled.
- API responses: `Cache-Control: no-store`.

## Roadmap
- Admin: force refresh dietaries
- Optional: Newbook webhooks
"# pinetreeslunch" 
