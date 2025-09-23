# Security & Privacy Notes

- Newbook is the source of truth. The app fetches rosters on-demand and **does not persist** per-person PII (no names/dietaries stored).
- Supabase RLS is enabled; only server-side service role writes data.
- API responses that include guest data are sent with `Cache-Control: no-store`.
- No secrets are exposed client-side. Newbook keys are server-only environment variables.
- Logs must not include guest names or dietaries (use redaction).
