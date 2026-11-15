# Samwise feature map

One file per user-facing feature: what it is, how a user reaches it, how to drive it, and what end state proves it. Keep it honest as the product changes (see `/maintain-verification-skill`).

| Feature | Surface | Driven with | Safe to run any time? | Last proven |
|---|---|---|---|---|
| [Sign-up with WhatsApp code](signup.md) | samwise.life `/v2/signup` | Playwright (local), MCP (prod) | validation: yes. Sending a code: Samuel's number, daytime only | 2026-11-15 (validation, local) |
| [WhatsApp chat](whatsapp-chat.md) | WhatsApp +1 507 920 1622 | Samuel's WhatsApp tools + Neon + n8n | daytime only, neutral text, 1 counted run each | not yet (2026-11-15: Samuel's WhatsApp tool session FAILED) |
| [Check-in calls](check-in-calls.md) | phone call | n8n + Neon + Cartesia reads; live call needs Samuel's OK each time | reading past calls: yes; placing a call: no | 2026-11-15 audit FAIL: user 16 not reached since 11-10, agent still speaks on voicemail |
| [Weekly report link](weekly-report.md) | WhatsApp button -> `/report/<token>` | Vercel `web_fetch_vercel_url` + Neon + Telnyx | yes (read-only) | 2026-11-15 PASS (prod) |
| [Telnyx webhook filter](telnyx-webhook-filter.md) | samwise.life `/api/hooks/telnyx` (protects the n8n budget) | Vercel runtime logs + n8n executions; local POST | yes | 2026-11-15 PASS (local: non-received event + invalid JSON) |
| Landing page | samwise.life `/` | Vercel `web_fetch_vercel_url` | yes | 2026-11-15 PASS (prod: 200, title, CTAs `/v2/signup?src=landing`) |
| Clinician plan pages | `/v2/signup?role=clinician`, `/p/<code>` (see [signup.md](signup.md)) | Vercel fetch + Neon | pages: yes; sign-up sends a code | 2026-11-15 PASS (prod pages; bad code shows "no longer active") |

## Failure rules
Every live feature has a failure rule in Samwise Health Check `n0c7zZBjAk5fwx8P` (daily 21:30 Bogota). The registry is `/mnt/project-files/logs/metrics.md`. A feature without a row there has no alarm: add one (skill samwise-feature-metrics) before calling it done.
