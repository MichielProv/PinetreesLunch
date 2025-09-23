# Newbook Core Integration Pack

Drop these files into your Next.js app to add:
- Property-wide "staying" pull for a date, with ID→label dietaries (always fresh)
- Flattened roster table per day/room/guest
- Optional webhook endpoint (Bookings push) with shared-secret validation
- Dashboard API that composes effective roster = Newbook − exclusions + manual

## Env vars (Vercel → Project Settings → Environment Variables)
- NEWBOOK_REGION
- NEWBOOK_API_KEY    (server-side only)
- NEWBOOK_WEBHOOK_SECRET  (for /api/newbook/webhook, optional)
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-side only)

## Endpoints
- GET  /api/newbook/staying?date=YYYY-MM-DD
- POST /api/newbook/webhook   (optional, set header: X-Webhook-Secret)
- GET  /api/dashboard/lunch?date=YYYY-MM-DD

## Apply DB migration
Run the SQL in `supabase/migrations/002_newbook_core.sql`.
