# ADR-0001: Newbook on-demand (no webhooks)
Date: 2025-09-15
Status: Accepted

## Context
We need up-to-date lunch rosters with minimal PII retention. Webhooks optional.

## Decision
Use on-demand reads from Newbook per date, with "always-fresh dietaries" and DB fallback.
Store only overrides (exclusions, notes) — no per-person PII.

## Consequences
- Simple deployment, low data risk.
- One NB call per date load; acceptable under rate limits.
- If NB is down, show fallback or retry.
