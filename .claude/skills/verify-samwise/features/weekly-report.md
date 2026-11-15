# Weekly report link

Every Monday 09:00 Bogota, n8n "Samwise Weekly Ritual Report" `WMQ2C6tjzD9Uaq3Q` builds each user's last Mon-Sun check-in week, saves it in Neon `weekly_reports` (random 32-hex `token`, `data` JSON with `lang`, `grid`, `done`, `total`...), and sends the WhatsApp template `samwise_weekly_checkins` whose "See my week" button opens `https://samwise.life/report/<token>`. The page shows the image from `/api/report-image/<token>` (1080x1350 PNG). Tokens expire after 14 days.

Code: `app/report/[token]/page.tsx`, `app/api/report-image/[token]/route.tsx`.

## Sub-features
- Page `/report/<token>`: image + one line, English or Spanish from `data.lang`.
- Image `/api/report-image/<token>`: grid per push x day, slips, calls placed/answered, trend.
- Unknown, malformed or expired token -> 404.
- Delivery: `weekly_reports.status = 'sent'`, `telnyx_message_id`, `sent_at`.

## How to get to it (user POV)
Monday WhatsApp message from Samwise -> "See my week" button -> page opens in the phone browser.

## Driving it with MCP (Neon + Telnyx + Vercel fetch)
1. Precondition (Neon `run_sql`): `select id, user_id, token, data->>'lang' lang, status, telnyx_message_id, sent_at from weekly_reports where created_at > now() - interval '14 days' order by created_at desc limit 1`. No row -> FAIL "no report in the last 14 days" (next run is Monday 09:00 Bogota).
2. Delivery (Telnyx `get_message` with `telnyx_message_id`): `to[0].status = delivered`, `errors = []`.
3. Open the page (Vercel `web_fetch_vercel_url` `https://www.samwise.life/report/<token>`): 200, `x-matched-path: /report/[token]`, title "Your week of check-ins · Samwise", body has `alt="Your week of check-ins"` + "Reply to Samwise on WhatsApp if you want to talk about your week." for `lang=en` (Spanish: `alt="Tu semana de chequeos"`).
4. Image (same tool, `/api/report-image/<token>`): the result is saved to a file; `scripts/check-fetch.py <file>` -> status 200, `image/png`, `png_size [1080, 1350]`.
5. Negative: `/report/00000000000000000000000000000000` -> 404.
Record each step with `scripts/record.py` (it redacts the token). Proven PASS 2026-11-15: `/mnt/project-files/verification/2026-11-15-weekly-report-prod/steps.jsonl`.

## Gotchas
- `web_fetch_vercel_url` returns binary bodies as lossy text: you can check status, type and PNG header size, not the pixels. To look at the picture, open the URL in a real browser (Claude in Chrome, with Samuel's OK) or ask Samuel for a screenshot.
- The token is the only key to a user's report. Never paste a full token into a chat reply or a shared doc.
- Manual runs of `WMQ2C6tjzD9Uaq3Q` send real WhatsApp messages ("Manual = Samuel only"): don't run it to create a precondition.
