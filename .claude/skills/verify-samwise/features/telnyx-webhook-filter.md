# Telnyx webhook filter

Not seen by users directly, but it keeps WhatsApp chat alive: Telnyx posts every messaging event (received, sent, delivered...) to `samwise.life/api/hooks/telnyx`; the route forwards only `message.received` to n8n, so delivery receipts don't burn the n8n run budget (the quota ran out on 2026-10-18 and Samwise stopped for hours). If n8n is down the route answers 502 so Telnyx retries.

Code: `app/api/hooks/telnyx/route.ts` (and the same pattern in `app/api/hooks/cartesia/route.ts`).

## Sub-features
- `message.received` -> forwarded with signature headers, `{"ok":true,"forwarded":true}`.
- Any other event type -> `{"ok":true,"forwarded":false}`, no n8n run.
- Invalid JSON -> 400.
- n8n unreachable -> 502 `forwarded:false`.

## How to get to it (user POV)
Indirect: a user's WhatsApp message gets a reply, and the n8n counted runs stay near one per inbound message.

## Driving it with local POST + MCP reads
Local (safe; a non-received event never leaves the machine):
```bash
.claude/skills/verify-samwise/scripts/launch-local.sh telnyx-filter
U=$(cat .verify-run/url)
curl -s -X POST "$U/api/hooks/telnyx" -H 'content-type: application/json' -d '{"data":{"event_type":"message.sent"}}'   # -> {"ok":true,"forwarded":false}
curl -s -X POST "$U/api/hooks/telnyx" -d 'not json' -w ' %{http_code}\n'                                                   # -> 400
.claude/skills/verify-samwise/scripts/cleanup.sh
```
Do NOT post a `message.received` event locally: it would be forwarded to the production n8n webhook (1 counted run, and a reply attempt).
Production: n8n `search_workflow_executions` for `ut3Upvt03EfI2lIS` over a day vs Neon count of inbound WhatsApp `messages` that day -> roughly equal. Many more executions than inbound messages means the filter is leaking.

## Gotchas
- From the cloud container you cannot POST to samwise.life (network refused), and `web_fetch_vercel_url` is GET-only; production behaviour is checked by counts, not by posting.
