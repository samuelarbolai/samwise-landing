# current-plan.md — Samwise v2 launch: account app at `/v2` + new canonical landing (2026-09-12)

> Supersedes the `/goals` plan (shipped). Status: **implemented, awaiting `DATABASE_URL`
> to verify the database paths end-to-end.**

## Task (user 2026-09-12)
Three pieces, all inside `samwise-landing`:
1. Build the "Ritual Calls" account app (signup / login / settings / read-only call history)
   against the existing Neon Postgres, served at `/v2`.
2. Move the current editorial landing to `/v1`, unchanged.
3. Ship a new canonical landing at `/` — simpler, aggressive on the sale, high-end
   e-commerce register — to convert cold Meta-ads traffic. No paywall (open beta).

## Answered decisions (from user)
1. **Location:** inside `samwise-landing` at `app/v2/` — one Vercel project, one deploy, no
   rewrites, and the landing → signup link stays internal.
2. **Language:** EN default + ES toggle, for both the landing and the v2 app.
3. **CTA target:** straight to `/v2/signup`. `/qualify` is not in this funnel.
4. **Register:** high-end DTC product page. Explicitly approved departures from the editorial
   doctrine: filled CTA buttons, repeated CTAs + sticky mobile bar, denser rhythm, full-bleed
   bands, announce bar.

## Plan Architecture (Flow)
```
Meta ad → /  (sw-root DTC landing, EN/ES)
            → /v2/signup  → POST /api/v2/auth/signup → users + first call_schedules row
                          → session cookie → /v2/settings
         → /v2/login      → POST /api/v2/auth/login  → session cookie → /v2/settings

/v2/settings (server-gated) → profile PATCH /api/v2/me
                            → schedules  GET/POST /api/v2/schedules, PATCH/DELETE /:id
                            → history    read-only from call_logs

n8n (separate, not this app) reads users + active call_schedules daily, places the calls,
writes call_logs.
```

## Plan Structure (Directories and files)
```
NEW  app/page.tsx            server shell + metadata  (was the editorial landing)
NEW  app/home.tsx            client DTC landing
NEW  app/home-copy.ts        EN/ES copy, explicitly typed
NEW  app/home.css            `.sw-*`, scoped under `.sw-root`
MOVE app/v1/page.tsx         the old canonical, verbatim (git mv)
NEW  app/v1/layout.tsx       noindex metadata
NEW  app/v2/**               layout · page · login · signup · settings · strings · v2.css
                             _components/{brand,lang,timezone-select,login-form,
                                          signup-form,dashboard}
NEW  app/api/v2/**           auth/{signup,login,logout} · me · schedules · schedules/[id]
                             · call-history
NEW  lib/v2/**               db · queries · session · validate · http
DEPS @neondatabase/serverless · bcryptjs · jose
```

## Modifications — what shipped

### Phase 1 — data + auth layer (`lib/v2/`)
- `db.ts` — lazy `neon()` singleton (missing env fails at request time, not build time),
  `query(text, params)`, and `buildSetClause` for dynamic UPDATEs. Column names come from our
  own literal whitelist; every value is bound.
- `queries.ts` — all DB access. bcrypt cost 12. `password_hash` is read only inside
  `verifyCredentials` and destructured off before returning. Every schedules/logs query carries
  `WHERE user_id = $n`; PATCH/DELETE put ownership in the WHERE so a foreign row 404s.
- `session.ts` — `jose` HS256 JWT in an httpOnly / sameSite=lax cookie `samwise_v2_session`,
  30-day expiry, `SESSION_SECRET`.
- `validate.ts` — E.164 `/^\+[1-9]\d{7,14}$/`, 24h `HH:MM`, IANA via `Intl` try/catch,
  `toPgTime` (`HH:MM` → `HH:MM:SS`) and `toHHMM`.
- **Should NOT be modified:** the table/column names. The schema is owned by the n8n side.

### Phase 2 — API routes (`app/api/v2/`)
Mirrors the requested REST contract under a `/api/v2` prefix. Login returns one message for
both unknown-email and wrong-password (no account enumeration). `handleError` maps
`UnauthorizedError` → 401 and logs everything else server-side without leaking internals.

### Phase 3 — v2 UI (`app/v2/`)
Server components gate the session and redirect before any protected UI renders; client
components own forms and language. Timezone is a from-scratch searchable combobox over
`Intl.supportedValuesOf('timeZone')` with GMT offsets — no new dependency. Signup defaults the
zone from `Intl.DateTimeFormat().resolvedOptions().timeZone`.

### Phase 4 — `/v1` move
`git mv app/page.tsx app/v1/page.tsx`; CSS import `./styles.css` → `../styles.css`; brand
wordmark `href="/"` → `/v1`; added `app/v1/layout.tsx` with `robots: { index: false }`.
`app/styles.css` was NOT touched, so every other route is unaffected.

### Phase 5 — new canonical landing
See `context-for-code-agent.md` → "`/` — Samwise v2 landing" for the section order, the call
card, and the held-vs-departed brand rules.

### Phase 6 — Support Contacts (added 2026-09-12, after n8n shipped the outreach side)
- `lib/v2/queries.ts` — `SupportContact` type + `listContacts` / `createContact` /
  `updateContact` / `deleteContact`. Same ownership-in-the-WHERE rule as schedules.
- `app/api/v2/contacts/route.ts` (GET, POST) and `contacts/[id]/route.ts` (PATCH, DELETE).
  `user_id` always from the session. `active` is not accepted on insert — the column defaults
  true and the REST contract's POST body is `{ name, phone, relationship? }`.
- `ContactsSection` in `dashboard.tsx` — list with inline row-expand editing + an add form.
- **House patterns pulled from samwise-app `/outreach` + `/trip`:** click-to-cycle status chip
  (dashed pill replaces the pause/resume button, applied to schedules too), optimistic-first
  mutations with revert, and the `--moss` / `--ash` status palette.
- **Landing updated** — the support section badge changed from "Rolling out during the open
  beta" to "New — live now in the open beta" (EN) / "Nuevo — ya disponible…" (ES), and FAQ #3
  moved from future to present tense in both languages.
- **Should NOT be modified:** the `support_contacts` column names, and the "you will not
  receive this call" framing in `contactsSub` — that is the sentence that prevents users
  misreading the feature as more calls to themselves.

### Phase 7 — Call language (added 2026-09-12)
- `lib/v2/validate.ts` — `SUPPORTED_LANGUAGES = ["es","en","he"]` + `isLanguage`; anything else
  is rejected with a 400 on all four write endpoints.
- `language` threaded through `POST /auth/signup`, `PATCH /me`, `POST /contacts`,
  `PATCH /contacts/:id`; new **public** `GET /api/v2/language-agents/active`.
- `app/v2/_components/language-select.tsx` — segmented 3-option selector, `languageName`,
  `useActiveAgentLanguages`, and the non-blocking `AgentComingSoon` notice.
- Wired into signup, the settings profile, and contact add/edit; contact rows show the language
  with a gold ring when its agent is pending, and the contacts section shows an aggregate
  notice listing every contact still waiting.
- **Should NOT be modified:** the "Call language" label and its *"Separate from the language of
  this page"* help text — without them the Hebrew option reads as a UI-language switch. And
  never write to `language_agents`.

## Testing phase
- **Local test — DONE.** `tsc --noEmit` clean for all new files (pre-existing errors remain in
  `held-aurora`, `held-chamber`, `frodo-*`). Verified in-browser at 1440×900 and 375×812:
  landing renders end-to-end with no console errors; EN↔ES toggle swaps every string;
  `/v2/signup` and `/v2/login` render; timezone combobox filters ("madrid" → Europe/Madrid
  GMT+2) and shows offsets; `/v1` still renders with its gold-dash CTAs intact.
  Support Contacts verified via a throwaway `app/v2/dash-test` harness (since `/v2/settings`
  needs a DB): list renders EN + ES, inline edit opens prefilled, the click-to-cycle chip flips
  optimistically and **reverts on a 401** — which also confirmed the API refuses unauthenticated
  writes. Harness deleted; build output confirms no stray `/v2/dash-test` route.
- **Integration test — DONE 2026-09-12, 35/35 against the real Neon database.** Script kept at
  the session scratchpad (`itest.sh`): signup (+201, no `password_hash` in body), duplicate
  email 409, non-E.164 400, bad timezone 400, GET/PATCH `/me`, schedules CRUD with
  `07:30 → 07:30:00` and `22:45 → 22:45:00` verified **unconverted**, contacts CRUD with
  `active` defaulting true, call-history read, full session lifecycle, and a second user
  proving cross-user isolation (404 on PATCH/DELETE of the other user's schedule AND contact,
  empty contact list, victim row verified unmodified afterwards).
  Test rows were deleted afterwards; the DB is back to its pre-test state (2 users,
  3 schedules, 0 contacts, 0 logs). **Bugs this pass caught — see
  `context-for-code-agent.md` for detail:** the `bigint`-as-string session bug (every
  authenticated request 401'd), `goal_achieved` mistyped as text when it is boolean, the
  unhandled `23505` unique-violation race on signup, and the undiscovered
  `call_type` / `contact_id` columns.
- **Call language — 10/10 against Neon (2026-09-12).** `GET /language-agents/active` public and
  returning `["es","en","he"]`; signup with `language:"he"` persisted; `fr`, `de`, `klingon` and
  a missing language all rejected 400 on signup, `PATCH /me`, `POST /contacts` and
  `PATCH /contacts/:id`. The "coming soon" notice was verified through a throwaway
  `app/v2/lang-test` harness forcing `activeLanguages=["es"]` (deleted after) — **not** by
  editing `language_agents`, which this app must never write to. Both languages render the
  spec copy verbatim, and picking an active language hides the notice reactively.
  Test rows deleted; DB back to 2 users / 3 schedules / 0 contacts, `language_agents` untouched.
- **Update README:** n/a (landing has none).

## After implementation
- `context-for-code-agent.md` — updated (Module Overview reframed for `/v1`; new `/` and `/v2`
  sections appended).
- Mark the task DONE in the master Vibe doc Projects tab — manual user step.
