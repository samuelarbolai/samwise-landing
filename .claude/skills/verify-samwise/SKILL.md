---
name: verify-samwise
description: Prove a Samwise change works the way a user experiences it - samwise.life sign-up and report pages (this repo, Next.js on Vercel), WhatsApp chat, check-in calls, emails and the journal doc - by driving the real path and capturing evidence. Use after changing samwise-landing, an n8n Samwise workflow, a Cartesia prompt or a Neon table, before saying "it works", or when a Health Check finding needs reproducing.
---

# verify-samwise

Samwise is a chat-first agent. A user touches four things, in this order of weight:

1. **WhatsApp chat** with +1 507 920 1622 (Telnyx -> samwise.life/api/hooks/telnyx -> n8n "Samwise WhatsApp Chat" `ut3Upvt03EfI2lIS` -> "Samwise Chat Brain" `dw1xl4U1AzpzvXkB`).
2. **Check-in calls** from the same number (Cartesia agents, dispatched by n8n).
3. **samwise.life pages** from this repo: sign-up `/v2/signup`, the weekly report `/report/<token>`, settings `/v2/settings`, the landing `/`.
4. **Email** (samuelgiraldoconcha+samwise@gmail.com) and the **Google Doc journal**.

There is no staging. Production is Vercel project `v0-samwise` (`prj_6aFvaRfkfAWkfdVJpZyPN8AGez1E`, team `team_kf8lUumHWoIdqARo5hsrGwFJ`), n8n `samuelgiraldoconcha.app.n8n.cloud`, Neon `calm-rice-55664901` (one branch, `production`). Vercel previews use the SAME `DATABASE_URL` and the same n8n hooks as production, so a preview is production data with new code.

Feature map: [features/README.md](features/README.md). Read the feature file before driving it; it lists every entry point. A proof that drives one convenient entry point is incomplete when the map lists others.

## Rules that bind every run (project instructions, 2026-11-15)

- Never place a live call without Samuel's OK **for that call**. Never message anyone but Samuel. Samuel's own WhatsApp (user 16) is fine for chat tests, but not 22:00-07:00 Bogota (it wakes him) and never with slip/relapse/risk words (Chat Brain and the Health Check treat them as real).
- n8n budget: about 80 counted runs a day. Each inbound WhatsApp = 1 counted run; each sign-up code = 1. Say the count in your report. Manual and sub-workflow runs don't count.
- Neon is production: read freely; a temporary test user may be created and must be deleted afterwards (say so). Any other delete needs Samuel.
- Evidence goes in `/mnt/project-files/verification/<YYYY-MM-DD>-<feature>/` (shared project folder, survives the thread). Redact tokens and phone numbers (`scripts/record.py` does it).

## Launch

Pick the target first:

| Target | When | Launch |
|---|---|---|
| **Production** `https://www.samwise.life` | after merge/publish; anything that needs DB, n8n, WhatsApp, calls | nothing to start |
| **Preview** `https://v0-samwise-<hash>-samuel-2452s-projects.vercel.app` | a samwise-landing PR before merge | push the branch; find the URL with Vercel `list_deployments` (`projectId` above, `branch=<branch>`), wait for `state: READY` |
| **Local** `next dev` | UI-only checks of this repo: rendering, client logic, form validation, API input validation | `scripts/launch-local.sh <run-name>` |

Local launch (from the repo root):

```bash
.claude/skills/verify-samwise/scripts/launch-local.sh signup-validation
# -> READY http://localhost:3100  evidence=/mnt/project-files/verification/2026-11-15-signup-validation
```

It installs deps if `node_modules` is missing, picks a free port from 3100 (never touches :3000), starts `next dev` in its own process group, and only prints READY when `/v2/signup` renders the form (first compile 10-40 s). State is in `.verify-run/` (gitignored). It refuses to start a second instance.

Local runs get **no production secrets on purpose**: `DATABASE_URL` points at a dead local port and `SESSION_SECRET` is random. Every route that reaches Neon or n8n fails with 500 "Something went wrong" (e.g. `/api/v2/language-agents/active` on the sign-up page). Input validation in the API routes runs before any DB call, so validation errors are real. Do not paste the production `DATABASE_URL` into a local run: local writes would hit real users' data.

Network fact (checked 2026-11-15): from the Claude cloud container and from the desktop sandbox, direct HTTPS to samwise.life, n8n.cloud and neon.tech is refused. Production is reached only through MCP tools: Vercel `web_fetch_vercel_url` (GET only), Neon `run_sql`, n8n, Telnyx `get_message`, Samuel's WhatsApp (`Samuel_s_Personal_WS` tools), Gmail. If `doctor.sh` shows 200s for the net lines, plain curl/Playwright against production works too.

## Doctor

Run first, and again whenever anything looks off. Read-only.

```bash
.claude/skills/verify-samwise/scripts/doctor.sh
```

It prints the repo HEAD, whether the local pid is alive, whether the port is owned by **our** process group (if not, do not drive it), whether `/v2/signup` renders the form, and which remote hosts this shell can reach.

For production/preview, the doctor is three MCP reads:
1. Vercel `list_deployments` (projectId above, limit 3): newest `target: production` is `READY` and its `githubCommitSha` equals `git rev-parse origin/main` (or, for a preview, the branch head).
2. Vercel `web_fetch_vercel_url` `https://www.samwise.life/v2/signup` -> 200 and the body contains `id="phone"`. Use `www.`: the bare domain answers 307.
3. For chat/call work: n8n `search_workflows` shows the workflow `active: true`, and `search_workflow_executions` (workflowId, status `error`, last 24 h) is empty or explained.

## Drive

**Web, local or preview with network:** `scripts/drive-page.mjs` (Playwright, phone viewport 390x844, waits for React hydration before typing).

```bash
E=$(cat .verify-run/evidence)/attempt-1; U=$(cat .verify-run/url)
node .claude/skills/verify-samwise/scripts/drive-page.mjs "$U/v2/signup" "$E" \
 '[{"fill":"#name","value":"Verify Bot"},{"fill":"#phone","value":"12"},
   {"click":"button[type=submit]","shot":"after-submit"},
   {"waitText":"Enter a valid phone number","shot":"error-shown"},
   {"expectRequest":"/api/v2/phone-code"}]'
```

Steps: `fill`, `select`, `click`, `waitText`, `expectRequest`, `shot`. Use a new `attempt-N` folder per try so old screenshots never mix in. Stable handles in this repo: `#name`, `#phone`, `select[aria-label=Country]`, `input[name=signup-language][value=en]`, `#tz-input`, `button[type=submit]`, `.v2-error[role=alert]`, code boxes `input[aria-label="Digit 1"]`..`"Digit 6"`. Use `http://localhost:<port>`, never `127.0.0.1`: next dev blocks its dev resources for other origins and the page never hydrates (the form then submits as a plain GET).

**Web, production via MCP:** Vercel `web_fetch_vercel_url` on `https://www.samwise.life/<path>`. GET only, no JS, so it proves server-rendered output (status, `x-matched-path`, title, text). Big responses are saved to a file; check them with:

```bash
.claude/skills/verify-samwise/scripts/check-fetch.py <saved-file> 'expected text' ...
```

The tool adds a `_vercel_share` link to the deployment (expires in 23 h); harmless on the public production site.

**WhatsApp:** see [features/whatsapp-chat.md](features/whatsapp-chat.md). **Calls:** see [features/check-in-calls.md](features/check-in-calls.md).

## Evidence

Proof standards:
- Drive the real user path (the page the WhatsApp button opens, the message a user sends). Never call n8n webhooks, Cartesia or Telnyx APIs directly to fake a user event, and never use test-only endpoints.
- Capture the action AND the resulting state: screenshot or fetched HTML, plus the Neon row it wrote or read, the n8n execution id, and the Telnyx delivery status for anything sent.
- Check side effects, not only the screen: `messages`, `phone_codes`, `call_logs`, `weekly_reports`, `health_findings` rows; Telnyx `get_message` status `delivered`.
- Write each MCP step with `scripts/record.py <evidence-dir> <step> key=value ...` (appends to `steps.jsonl`, redacts tokens and phone numbers). End with a `verdict` step: PASS or FAIL and why.
- If the safe path is a dry run, observe what it skipped (no `messages` row, no n8n execution) instead of trusting its name.
- A missing precondition (no report in the last 14 days, no test user) is a FAIL with the reason in the feature's Gotchas, never a weaker check.

## Cleanup

```bash
.claude/skills/verify-samwise/scripts/cleanup.sh
```

Kills only the process group `launch-local.sh` recorded, copies `server.log` into the evidence folder, deletes `.verify-run/`, restores `next-env.d.ts` (next dev rewrites it), and lists the evidence it kept. It never deletes evidence. Run it after every failed attempt too.

Remote runs: delete any temporary Neon test user you created (`users`, `user_onboarding`, `phone_codes`, `messages` rows for that user id) and say so in the report. Nothing else is created by a read-only run.

## Helpers (all in `scripts/`, executable)

| Script | Does |
|---|---|
| `launch-local.sh [run-name]` | start `next dev` for UI checks, print URL + evidence dir |
| `doctor.sh` | read-only health of the local instance + network reach |
| `drive-page.mjs <url> <dir> '<steps>'` | Playwright drive with screenshots, `/api/` network log, console log, `result.json` |
| `check-fetch.py <file> [texts]` | check a saved Vercel fetch result (status, type, route, title, PNG size) |
| `record.py <dir> <step> k=v ...` | append a redacted proof step to `steps.jsonl` |
| `cleanup.sh` | stop what we started, keep evidence |

## Last proven

2026-11-15: local launch -> doctor -> sign-up validation drive -> cleanup (evidence `verification/2026-11-15-signup-validation-local/attempt-3`), and the weekly report feature end to end on production through MCP (evidence `verification/2026-11-15-weekly-report-prod/steps.jsonl`, PASS).
