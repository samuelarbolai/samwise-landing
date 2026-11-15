# Sign-up with WhatsApp code

A new person enters name, WhatsApp number, call language and timezone, gets a 6-digit code on WhatsApp (Meta AUTHENTICATION template `samwise_login_code`), types it, and is told to say hi to Samwise on WhatsApp. An existing number just signs in.

Code: `app/v2/signup/page.tsx`, `app/v2/_components/whatsapp-signup.tsx`, `app/api/v2/phone-code/route.ts` (step 1), `app/api/v2/phone-code/verify/route.ts` (step 2). n8n "Samwise Phone Code" `OlwdkNyAuPR2Ig8R` (webhook `samwise-phone-code`, actions `send` and `verified`).

## Sub-features
- Input validation (name, E.164 phone, timezone, language) - errors shown in `.v2-error[role=alert]`.
- Rate limit: 1 code per 30 s and 5 per hour per number -> 429 "Wait a moment before asking for another code".
- Code send -> `phone_codes` row, `sent_at` set by n8n; failure -> 502 "We couldn't send a WhatsApp code...".
- Verify: 5 tries, 10 min (`410` expired, `401` wrong code). New number -> `users` + `user_onboarding(status in_setup, preferred_channel whatsapp)` and n8n `verified`; existing number -> sign in only.
- `?src=<tag>` on the link is saved in `phone_codes.src`. `?role=clinician` and `/p/<code>` patient invites exist on the clinician-plan branch (not on main as of 2026-11-15).
- ES/EN page toggle (`.v2-lang` buttons); call language radios `input[name=signup-language]`.

## How to get to it (user POV)
samwise.life home -> sign-up button, or a direct link `https://www.samwise.life/v2/signup?src=<tag>`. On the phone screen: name, number (country select defaults from timezone), call language, timezone, "Send code". Then the 6 code boxes. Then "Open WhatsApp".

## Driving it with Playwright (local) and MCP (production)
Validation (local, safe, no message sent):
```bash
.claude/skills/verify-samwise/scripts/launch-local.sh signup-validation
E=$(cat .verify-run/evidence)/attempt-1; U=$(cat .verify-run/url)
node .claude/skills/verify-samwise/scripts/drive-page.mjs "$U/v2/signup" "$E" '[{"fill":"#name","value":"Verify Bot"},{"fill":"#phone","value":"12"},{"click":"button[type=submit]","shot":"after-submit"},{"waitText":"Enter a valid phone number","shot":"error-shown"},{"expectRequest":"/api/v2/phone-code"}]'
.claude/skills/verify-samwise/scripts/cleanup.sh
```
Proof: `network.json` shows `POST /api/v2/phone-code` -> 400 `{"error":"Enter a valid phone number"}` and `03-error-shown.png` shows the red line above Name.

Full flow (production, sends 1 WhatsApp + 1 counted n8n run): only with Samuel's own number, 07:00-22:00 Bogota, and he must be told it is coming. Needs a real browser on production (Claude in Chrome on Samuel's Mac, ask which browser first) because `web_fetch_vercel_url` cannot POST. After "Send code": Neon `select id, sent_at, send_error from phone_codes order by id desc limit 1` -> `sent_at` set, no error; Samuel's WhatsApp (`read_messages`) shows the code from Samwise; type it from Neon `phone_codes.code`; existing number -> page says signed in, `phone_codes.verified_at` and `setup_done_at` set, no new `users` row.
New-user path: use a temporary test number only if Samuel provides one he controls; delete the created `users`/`user_onboarding`/`phone_codes` rows afterwards and say so.

## Gotchas
- Locally the page calls `/api/v2/language-agents/active` -> 500 (no DB). Expected; the form still works.
- The call-language radio starts on Spanish in server HTML and switches to the page language (English) after hydration; the request body shows `"language":"en"`.
- `127.0.0.1` breaks hydration in next dev; use `localhost` (launch-local.sh does).
- `phone_codes.src` insert falls back without the tag if the column is missing (42703) - a missing tag is not a failure of sign-up itself.
- The bare `samwise.life` 307-redirects to `www.`.
