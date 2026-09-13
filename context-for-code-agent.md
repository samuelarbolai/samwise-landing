# context-for-code-agent.md — samwise-landing

## Parent Project Overview
The parent project (`arbor`) is Samwise: a system that helps users overcome behavioural challenges (screens addiction, porn, social media, destructive relationships, etc.) by combining mental-health practitioners, spiritual guidance and AI agents that follow up on the user via scheduled "ritual" calls. The platform is composed of multiple services (cloud functions for ritual registration/update, a LiveKit voice agent, a chat agent, a streaming agent, a backend, and one or more user-facing web frontends).

## Parent Project Architecture (Flow)
1. Prospects discover Samwise through the public landing page (`samwise-landing`).
2. They schedule a Fit Assessment / Diagnosis call.
3. The Diagnosis session produces the user's first ritual definition, which is captured in a Google Doc.
4. The `arbor-backend` cloud function reads that Doc, organizes it via Gemini, and writes the ritual to Firestore (with `googleDocsLink`, `userID`, `phoneNumber`, `agentConfig`, `schedules`, etc.).
5. The scheduler triggers `arbor-livekit` voice agents at the scheduled times to call the user and run the ritual.
6. Progress is tracked, and optimization sessions are scheduled on top.

## Parent Project Modules
- `arbor-backend/` — Firebase cloud functions (ritual registration/update, dispatcher, etc.).
- `arbor-livekit/` — LiveKit voice agents (the runtime that actually performs the ritual call).
- `chat-agent/`, `streaming-agent/` — auxiliary agent runtimes.
- `samwise-app/` — internal/user-facing application (separate from the public landing page).
- `samwise-landing/` — **this module**, the public landing page.
- `MCPs/` — Model Context Protocol tooling.
- `samuel-2026/` — sandbox / personal scratch space.

## Module Overview — samwise-landing

**As of 2026-09-12 (Samwise v2 launch) the canonical page changed.** `app/page.tsx` is now a
high-end DTC product page built to convert cold Meta-ads traffic into free open-beta signups.
The previous editorial landing was moved verbatim to **`/v1`** (`app/v1/page.tsx`, `noindex`),
and the account app lives at **`/v2`**. See the `/` (v2 landing) and `/v2` sections below.

Everything in the rest of this Module Overview describes the **`/v1`** page, which is unchanged
apart from its CSS import path (`../styles.css`) and its brand wordmark now linking to `/v1`.

### `/v1` — the preserved editorial landing
Multi-scene scroll choreography. Structure (promoted through `/tease` → `/vingilot` → `/quiet-cta` → `/dual-cta`):

- **Collapse-to-star navbar.** 4 links in this order: `Start now` (→ `/qualify`, neutral color — emphasis from position not color) / `Us` (#us) / `Try` (#try) / `Scientific Evidence` (→ `/scientific-evidence`). Plus EN/ES toggle. `Advisors` was removed in the dual-cta promotion.
- **Hero (FixedScene).** Eyebrow `SAMWISE` + h1 + a stacked, left-aligned `.dual-cta-row` directly below the h1 with two `.cta--primary` anchors: `Start now` (→ `/qualify`, fires the gold-star transition — see below) and `Discover Samwise` (`href="#voice"`, intercepted with `handleDiscoverClick` to soft-scroll one viewport + pulse the bottom-edge `.discover-glow`). Both CTAs are sized to match the eyebrow above (Manrope 11px / weight 600 / 0.22em letter-spacing).
- **Sticky lede pin-fade**, sticky-pinned challenges freeze with one-by-one reveals, sticky-pinned `#try` block (Fit Assessment CTA — secondary touchpoint), then a teaser block in natural flow with the manifesto headline ("We watch what works. We adapt. You stop fighting alone.").

**Warm-gold (`#D4A85A`) accents (used sparingly):** the 8px star ✦ above the brand wordmark and inside the collapsed navbar; the `.cta--primary` hairline dashes that collapse inward on hover while a gold underline expands from center; the `.discover-glow` bottom-edge pulse; the gold-star transition overlay between `/` and `/qualify`.

**Start-now → /qualify transition.** `handleStartClick` (also wired to the nav Start-now link) does three things in parallel: (a) sets `isLeaving` on the root so the page opacity transitions 1→0 over 525ms; (b) sets `sessionStorage["samwise:qualify-transition"]=1` so `/qualify` knows it's arriving via the transition; (c) appends a `<div data-qualify-transition-overlay>` to `document.body` (survives the SPA route change) with an ultra-diffuse radial gradient + `filter: blur(80px)`, animated via Web Animations API through a 1500ms keyframe sequence: scale 0.05→1.4 + opacity 0→1 at 35%, hold at peak, contract scale 1.4→0.05 + opacity 1→0 by 100%. Navigation fires at 35% (peak), so `/qualify` mounts behind the gold. `/qualify`'s `useEffect` polls for the overlay's removal via rAF and only sets `isArriving=false` once the overlay is gone — strictly serial: hero+glow run together → glow contracts fully → `/qualify` fades in. Honors `prefers-reduced-motion`. Mobile (max-width 800px): arrow-only at full opacity; tap routes to cal.com; aria-label exposes the full text to screen readers. Because the link is inside the hero FixedScene, it fades out alongside the headline (0.5vh → 0.85vh). A `.tease-root .pin-fade-scene#try { scroll-margin-top: -26vh }` override is also in place so anchor jumps to `#try` (e.g. from the nav "Try" link) land **past** the CTA's fade-in end (4.46vh) instead of inside the interp scene's fade-out (4.0→4.3vh). The pre-vingilot austere version (no gold accents, ink-bordered CTA box) is preserved at `/austere`. The earlier 3-step variant is preserved at `/three-step`; the original minimal/styleless canonical is at `/previous`.

The app uses Next.js 16 (app router), React 19, Tailwind v4, motion 12 (formerly framer-motion). Canonical styling lives in `app/styles.css` with the scenes overrides scoped under `.letter-root` (used by `/` and `/three-step`) and the single-CTA + teaser overrides scoped under `.tease-root` (used only by `/`). The root element uses both classes: `<div class="editorial-root letter-root tease-root">`. shadcn/ui-style components in `components/ui/` are available but mostly unused.

## Module Structure (Directories and files)
```
samwise-landing/
├── app/
│   ├── globals.css         # Tailwind v4 base styles
│   ├── layout.tsx          # Root layout: Geist font, Vercel Analytics in prod
│   │                       # + site metadata (title/description/openGraph/twitter,
│   │                       #   metadataBase https://samwise.life) — replaced the v0 default
│   ├── opengraph-image.tsx # Generated 1200×630 link-preview poster (next/og ImageResponse):
│   │                       #   RESTRAINED — just the brand mark, NO tagline (a tagline speaking
│   │                       #   to whoever the link is shared with reads as needy/pushy; the
│   │                       #   landing voice is held, not gated). Gold Eärendil star (the nav
│   │                       #   .nav-star sparkle, thin concave path) top-center · "Samwise" in
│   │                       #   FRAUNCES ITALIC 400 opsz 36 (the .brand wordmark, NOT upright) as
│   │                       #   the whole statement · Manrope SAMWISE.LIFE at the foot as a quiet
│   │                       #   colophon (not a CTA). Fonts fetched from Google Fonts css2 at
│   │                       #   runtime with pinned axes; star is inline SVG (Satori has no glyph).
│   │                       #   Layout uses justify-content:space-between + padding (NOT
│   │                       #   justify-content:center — Satori main-axis centering was unreliable
│   │                       #   and rendered top-weighted). Verify by reading PNG bytes to a
│   │                       #   canvas, not preview screenshots (DPR + stale <img> cache mislead).
│   ├── page.tsx            # CANONICAL — single-CTA + teaser structure:
│   │                       #   FixedScene (hero, interp+sigs)
│   │                       #   PinFadeScene (voice/lede)
│   │                       #   ChallengesFreezeScene (sticky pin + opacity fade-out,
│   │                       #     ChallengeItem one-by-one reveals + ChallengePostscript)
│   │                       #   interp-snap-anchor (scroll-snap stop at 3.5vh on mobile)
│   │                       #   StickyScene (try): one CtaBlockReveal
│   │                       #   Teaser section in natural flow:
│   │                       #     TeaserLine (label) → TeaserHeadline (manifesto h3)
│   │                       #     → TeaserLine (150-min) → TeaserLine (optimization)
│   │                       # Collapse-to-star navbar (FourPointStar SVG, 4 links:
│   │                       #   Us / Try / Advisors / Scientific Evidence)
│   │                       # Root: `editorial-root letter-root tease-root` — letter-root
│   │                       # for the scenes overrides, tease-root for the single-CTA
│   │                       # + teaser overrides.
│   ├── styles.css          # Canonical CSS:
│   │                       #   editorial base + scenes overrides (.letter-root scope)
│   │                       #   + single-CTA & teaser overrides (.tease-root scope).
│   ├── previous/           # Previous canonical, preserved as a variant.
│   │   └── page.tsx                 # minimal editorial page with hero + challenges
│   │                                # + interp + steps + schedule + advisors. No
│   │                                # scroll choreography — natural flow with
│   │                                # IntersectionObserver `.reveal` only.
│   ├── austere/            # Pre-vingilot canonical snapshot. No warm-gold
│   │   │                                # accents — ink-black star + ink-bordered
│   │   │                                # CTA box with hover-fill. Preserved as a
│   │   │                                # rollback point of the canonical state
│   │   │                                # before warm-gold was promoted.
│   │   ├── page.tsx
│   │   └── austere.css
│   ├── three-step/         # Multi-step variant (former canonical, before the
│   │   │                                # single-CTA promotion). Same scenes-style
│   │   │                                # scroll choreography but the steps section
│   │   │                                # is three StepItem/ViewTriggeredStep blocks
│   │   │                                # with the Fit Assessment CTA inside Step 1.
│   │   │                                # Root: `editorial-root letter-root` (no
│   │   │                                # tease-root, so .tease-root rules don't
│   │   │                                # apply — uses canonical .step layout).
│   │   └── page.tsx
│   ├── held*/              # Earlier visual variants (out of scope for new work)
│   ├── frodo-literal/      # Frodo-journey variant — small literal motion glyphs
│   │   ├── page.tsx
│   │   ├── motion-section.tsx     # whileInView wrapper + reduced-motion fade
│   │   ├── motion-cues.tsx        # Vingilot star, offered hand, struggle, horizon
│   │   └── video-placeholder.tsx  # neutral 16:9 dashed-border placeholder
│   ├── frodo-abstract/     # Frodo-journey variant — typographic/layout motion only
│   │   ├── page.tsx
│   │   ├── motion-section.tsx     # tone-driven (rise|lift|settle|offered|stillness)
│   │   └── video-placeholder.tsx
│   ├── frodo-scene/        # Sacred-journey scene variant (mid-fi sketch)
│   │   ├── page.tsx                 # asymmetric copy-left / scene-right (sticky desktop, fixed mobile)
│   │   ├── scene.tsx                # silhouette stage: mountain, figure, hand, star, ring
│   │   ├── aperture.tsx             # static placeholder for case-study videos and Dr. Ana photo
│   │   └── tokens.ts                # OKLCH colour tokens + easings
│   ├── content-formats/    # INTERNAL DOC — Content Format Bible v1 (founder's content strategy).
│   │   │                                # Canonical at `/content-formats` is the constellation grid
│   │   │                                # with focus mode: 3×3 tiles of the nine formats;
│   │   │                                # clicking a tile morphs (motion `layoutId`) into a
│   │   │                                # full-screen detail card with prev/next + ESC + arrow-key
│   │   │                                # navigation; backdrop click or ✕ Close returns to the grid.
│   │   │                                # Two preserved alternative views as sub-variants.
│   │   ├── page.tsx                 # CANONICAL — constellation grid + focus mode (motion 12).
│   │   ├── content-formats.css      # scoped under `.content-formats-root`. Covers brief grid,
│   │   │                                # notes grid, scroll-view format cards, AND the canonical
│   │   │                                # grid tiles + focus overlay (merged in on promotion).
│   │   ├── data.ts                  # source of truth: `brief` (6 items) + `formats` (9 items
│   │   │                                # with num/name/tag/desc/components/tones). All three
│   │   │                                # pages read from here so copy stays in sync.
│   │   ├── rail/                    # sub-variant: long-scroll cards + sticky vertical index rail
│   │   │   │                                # on the right (collapses to a sticky chip strip
│   │   │   │                                # below 1180px). Active rail item tracks scroll via
│   │   │   │                                # IntersectionObserver; click to smooth-scroll.
│   │   │   ├── page.tsx
│   │   │   └── rail.css
│   │   └── scroll/                  # sub-variant: original long-scroll, one format per card,
│   │       │                                # preserved from pre-grid promotion as a rollback /
│   │       │                                # comparison view.
│   │       └── page.tsx
│   ├── qualify/            # FIRST-CLASS ROUTE (not a variant) — Qualification Agent landing surface
│   │   ├── page.tsx                 # client-state orchestrator: picker → voice|text → final
│   │   ├── language-picker.tsx      # English / Español picker + email-gated proceed. Text fallback button gated by TEXT_MODE_ENABLED feature flag (currently false — voice only)
│   │   ├── voice-room.tsx           # livekit-client Room, hybrid PTT (tap-toggle <200ms / hold-to-speak >200ms / spacebar shortcut). Subscribes to qualification:variable_update + qualification:outcome data events.
│   │   ├── chat.tsx                 # AI SDK 6 useChat — text mode (currently unreachable via UI; flag-gated)
│   │   ├── qualify.css              # scoped editorial styles (brand tokens, picker, voice + chat layouts, variables panel)
│   │   └── components/
│   │       ├── message-list.tsx
│   │       ├── message-input.tsx
│   │       ├── final-screen.tsx     # qualified / disqualified renderings (same booking link, different copy)
│   │       └── variables-panel.tsx  # live notes surface — 7 user-facing variable cards fading in as the agent commits via setVariables
│   └── api/
│       └── qualify/
│           ├── voice-init/route.ts  # mints LiveKit token + dispatches ritual-agent with metadata { flow:"qualification", language, prospect_name, prospect_email }
│           └── chat/route.ts        # AI SDK streamText with setVariables + endCall tools; endCall.execute POSTs the transcript to extractQualification cloud function
├── components/
│   ├── theme-provider.tsx  # next-themes wrapper (not currently used on page.tsx)
│   └── ui/                 # shadcn/ui components (button, card, etc.) — available but mostly unused
├── hooks/                  # shadcn/ui hooks
├── lib/
│   ├── utils.ts            # `cn` helper (clsx + tailwind-merge)
│   └── qualify/            # source-of-truth for the qualification agent (worker COPIES these)
│       ├── persona.ts                 # Nova characterization, bilingual
│       ├── qualification-prompt.ts    # single prompt for the agent, mode: 'voice' | 'text'
│       ├── schema.ts                  # SetVariablesArgsSchema + EndCallArgsSchema + QualificationPayloadSchema (zod)
│       └── strings.ts                 # bilingual UI copy (picker / voice / chat / final screens + variable labels)
├── public/                 # Icons and placeholder assets
├── styles/                 # Additional stylesheet (if any)
├── components.json         # shadcn config
├── next.config.mjs
├── package.json            # next 16, react 19, tailwind 4, motion 12, radix, lucide, ai 6, @ai-sdk/google, @ai-sdk/react, livekit-client, livekit-server-sdk, zod
├── postcss.config.mjs
└── tsconfig.json
```

## Conventions specific to this module
- Keep the page **styleless / canvas-like**. Prefer plain HTML elements and inline `style` over Tailwind classes or shadcn components, so designers see content with no aesthetic suggestion.
- Existing scheduling links are anchors (`<a href="...">`), not buttons. New scheduling controls should match that visual restraint.
- All copy is in English.
- **Variant pattern:** experimental designs live as sibling folders under `app/` (e.g. `app/frodo-literal/`, `app/frodo-abstract/`, `app/frodo-scene/`). Each variant is fully self-contained — no shared components across variants — so any losing variant can be deleted as a single folder. The canonical page (`app/page.tsx`) is never modified by variant work.
- **Motion:** when a variant needs animation, use the `motion` package (formerly `framer-motion`) with `whileInView` + `viewport={{ once: true, amount: 0.3 }}`, and always honor `prefers-reduced-motion` via `useReducedMotion()` (degrade to a single short opacity fade and skip decorative glyphs).
- **Mobile-first:** all variants must render without horizontal overflow at 375px viewport, video placeholders use `aspectRatio: "16 / 9"`, no `100vh` (use `dvh` units if needed).

## `/qualify` (first-class route, not a variant)

The qualification agent surface. Bilingual (English / Español), voice-only in the current UI (text mode is built end-to-end but feature-flagged off via `TEXT_MODE_ENABLED = false` in `language-picker.tsx`). Architecture (post-redesign 2026-05-25 — see `current-plan.md`):

- **Two audiences (user / therapist), added 2026-06-17.** The `/qualify` picker now has a **user-vs-therapist selector** (`language-picker.tsx` → `Audience = "user" | "therapist"`), threaded through `page.tsx` → `voice-room.tsx` → `app/api/qualify/voice-init` (which dispatches `flow: "qualification"` for users, **`flow: "qualification-therapist"`** for therapists) and into `final-screen.tsx` (therapist → books the **50-min therapist demo**, `/book?type=therapist-demo`; user → the Breakthrough Call). The therapist flow is a **literal mirror** of the user qualification — a NEW worker flow `ritual-agent/src/flows/qualification-therapist/` (its own prompt/agent/index), a NEW cloud function `extractQualificationTherapist` (writes `qualifications/{prospectKey}-{ts}` tagged `audience:"therapist"`, always `outcome:"qualified"` — no gate), and the SAME `/qualify` surface reused verbatim. It differs ONLY in: the opener framing, the **four therapist questions** (`patient_addiction_type` / `last_patient_occurrence` / `helped_patient_attempts` / `why_attempts_failed`, added to the shared `<VariablesPanel>` + `strings.ts`), a short Samwise pitch beat, and the always-books close. Nova persona, audio-quality, finalize-hold, one-question-per-turn — all identical. Money is kept OUT of the therapist call (it lives in the 50-min demo). The DataChannel event names stay `qualification:*` (surface reused). New worker secret: `EXTRACT_QUALIFICATION_THERAPIST_URL`. (Chosen as a duplicate flow, NOT an `audience` parameter — "mirror the existing infrastructure", per the user.)
- **Picker first.** No auto-detection — the user picks language explicitly. Name + valid email required to proceed.
- **Voice mode** dispatches a LiveKit Room. The browser hits `app/api/qualify/voice-init/route.ts` which mints a token and **dispatches the existing `ritual-agent` worker** with metadata `{ flow: "qualification", language, prospect_name, prospect_email }`. The worker's qualification flow lives at `samwise-backend/ritual-agent/src/flows/qualification/` (NOT in a separate `qualification-agent` module — the multi-flow-router pattern is canonical, see `samwise-livekit-agents` skill). Push-to-talk is hybrid: tap-and-release within 200ms = toggle on/off; press-and-hold beyond 200ms = release ends the turn. Spacebar mirrors on desktop. **Samuel notification (2026-06-11):** `voice-init` also fires a best-effort server-to-server POST to `${NEXT_PUBLIC_SAMWISE_APP_URL}/api/notify/qualify-start { name, email, language }` (started in parallel with the dispatch, awaited before returning so Vercel flushes it) — landing has no Firestore, so the `mail/` write happens on samwise-app. A notify failure never blocks the prospect's token.
- **Agent / scribe split.** The agent's job is conversation + taking live notes via `setVariables`. It does NOT produce structured gate verdicts during the call. Each `setVariables` tool call publishes one `qualification:variable_update` data event per committed variable; `voice-room.tsx` accumulates these into state and renders `<VariablesPanel>` on the right (desktop) / below the mic (mobile). At end-of-call — `endCall` tool OR `participantDisconnected` OR 10-min idle timeout — the worker POSTs the full transcript to `extractQualification` cloud function. The cloud function runs Gemini 2.5 Flash extraction over the transcript, produces the authoritative `QualificationPayload`, writes `qualifications/{prospectKey}-{ts}`, and dispatches a post-call confirmation email via the Firebase Trigger Email extension. The worker publishes a `qualification:outcome` data event on the CF's response; voice-room swaps to `<FinalScreen>`.
- **Text mode (flag-gated).** When `TEXT_MODE_ENABLED` is `true`, the picker exposes "I'd rather type." It uses the same prompt (`qualification-prompt.ts` with `mode: 'text'`) and the same tools (`setVariables`, `endCall`). The chat client observes tool-call INPUTs in the streamed parts to fill `<VariablesPanel>` live. `endCall.execute` POSTs the transcript to `extractQualification` directly from the API route (no LiveKit data channel involved).
- **Final screen** shows the same `https://cal.com/samuel-giraldo-concha-yqvtot/breakthrough` link for qualified AND disqualified outcomes (DQ gets an assertive note). The legacy `safety_flagged` outcome no longer exists.
- **Source-of-truth files** in `lib/qualify/` are copied into the worker at `ritual-agent/src/flows/qualification/`. Keep both in sync. Worker mirrors: `schema.ts`, `prompts/qualification-prompt.ts`, `prompts/persona.ts`.
- **Env vars on Vercel for `/qualify`:** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`, `RITUAL_AGENT_NAME` (defaults to `ritual-agent`), `AI_GATEWAY_API_KEY` (text mode via Vercel AI Gateway), `EXTRACT_QUALIFICATION_URL` (text mode; voice mode uses the worker's env var of the same name).
- **Notes-as-main layout (both modes).** When the first agent-committed note arrives (`.qualify-voice:has(.qualify-notes)` / `.qualify-chat-layout:has(.qualify-notes)`), the layout flips from "centered mic / chat box" to "notes as main column (38em readable measure, centered) + speaker dock fixed at viewport bottom." The speaker dock is `position: fixed; bottom: 0; left: 0; right: 0` with no chrome — its only visible element is the centered mic button (voice mode) or `MessageInput` (chat mode). A `::before` pseudo-element above the dock paints a 120px gradient from `var(--bg)` to transparent so notes scrolling toward the dock dissolve into the page surface before they would visually touch it — the "fade out as objects approach" treatment the user explicitly asked for. `.qualify-voice` / `.qualify-chat-layout` get `padding-bottom: 248px` (dock ~108px + scrim 120px + ~20px breathing) so the last note clears the scrim. Pre-notes the dock is a passive flex wrapper and the layout is byte-identical to the original centered behavior. **Do not re-introduce the prior row layout (mic-left + notes-right) — it horizontally collapsed the notes and forced vertical overflow.**
- **End-of-call finalize hold.** Between Nova's `endCall` tool firing and `<FinalScreen>` mounting there's a 3–10s extraction wait (Gemini reads the transcript via the `extractQualification` cloud function). Without bridging that wait, users see Nova's closing line, then silence + the still-active mic, then suddenly the booking screen — voice-skeptical users assume something broke and close the tab. Three-part contract: (a) the prompt's `<end-of-call>` block REQUIRES the closing line to include an explicit "stay with me / hold on a moment" cue plus naming the screen as where the link will appear; (b) the worker's `submitIfNotYet` publishes a `qualification:finalizing` data event BEFORE awaiting the extract-CF, only on the endCall path (disconnect / idle_timeout / hard_cap skip it since the user is already gone); (c) `voice-room.tsx` flips a `finalizing` state on receipt, swaps the mic for `<p class="qualify-voice-finalizing">` (Fraunces italic line, slow 2.5s opacity pulse 1→0.5→1, copy from `voice_finalizing_label` in `strings.ts` — *"Almost there — pulling up your link."* / *"Casi listo — preparando tu enlace."*), force-disables the mic, and the PTT + spacebar handlers early-return on `finalizingRef.current`. A 30s safety net force-routes to `onOutcome("qualified")` if the outcome event never arrives. The finalize indicator lives INSIDE `.qualify-voice-mic-dock` so the dock geometry (fixed bottom, fade scrim) is identical to the mic state.
- **Pre-warmed opener (TikTok / Instagram / YouTube funnel).** The prompt's `<pre-warmed-opener>` block (EN + ES, placed between `<exploration-and-reluctance>` and `<continuous-evaluation>`) lists the recognition signals (*"I've seen your videos / I want to schedule a call with Samuel / I'm here from TikTok"*) and forces a 1–2-beat handling: warm acknowledgment + bridge to the intake. **The conversation from that point is identical to the default flow** — same behaviour grounding, same variables, same end-of-call. No lighter qualification, no shortened call — the fit gate is not a sales filter and pre-warmed users still need the same understanding for the breakthrough call to land.

## `/book` — from-scratch booking picker against Google Calendar (first-class route)

Booking surface for the Breakthrough Call. Replaces the prior Cal.com embed (and earlier Cal.com webhook flow) — both retired 2026-05 after `{{uid}}` templating in Cal locations + Cal Workflows paywalls made the Cal path unworkable. Now: custom Samwise-styled picker → call to samwise-app's `/api/book/slots` (Google Calendar `freeBusy.query`) → confirm form → call to samwise-app's `/api/book/create` (Calendar `events.insert` + Firestore mirror + Samwise email with .ics).

- **Route structure** (`app/book/`): `page.tsx` (server, thin, reads `?lang=es`) → `book-root.tsx` (client orchestrator: state machine `loading | month | slots | confirm | done`) → `month-grid.tsx` → `time-slots.tsx` → `confirm.tsx` → `done.tsx`. Single CSS file `book.css`. ~700 lines total, **zero new deps on the picker side** (calendar grid is hand-rolled with native `Date` + `Intl.DateTimeFormat`).
- **Cross-origin to samwise-app.** Both routes (`/api/book/slots` + `/api/book/create`) live on samwise-app where `FIREBASE_SERVICE_ACCOUNT` + `BOOKING_CALENDAR_ID` env vars are available. samwise-landing reaches them via `${NEXT_PUBLIC_SAMWISE_APP_URL}` (defaults to `http://localhost:3000` in dev).
- **Done screen shows the WHEN only, no join URL.** Per user 2026-05-27 — the join link only lives in the email, never on a public page. The DONE view shows just "You're set." / "Estás dentro." + a humanized scheduledFor date.
- **Bilingual via `?lang=es`**. UI language passes through to `/api/book/create` and into the confirmation email language.
- **Aesthetic.** Same register as `/qualify`'s picker: gallery white, Fraunces italic lead, Manrope small-caps weekday headers, hairline gold ring on available days, hairline gold-dash CTA. Brand tokens local in `book.css`, literal `'Fraunces' / 'Manrope'` stacks (no `var(--font-fraunces)`).

## `/meet` (walk-in lobby) and `/meet/[id]` (scheduled-meet join)

Two sibling routes that both end in the same `<MeetCallRoom>` component:

- **`/meet`** — lobby form for **walk-in** flow. Name + email + language (all optional per 2026-05-27 — "free to enter for testing"). On submit, POSTs `${NEXT_PUBLIC_SAMWISE_APP_URL}/api/walk-in/init` with `mode: "create"`. Lobby state machine → `<MeetCallRoom>` in-page transition (no navigation). When the prospect enters with a real email, samwise-app sends Samuel a notification email with `app.samwise.life/meet/{walkInId}`.
- **`/meet/[id]`** — auto-join for **scheduled** flow (post-`/book`). The prospect's confirmation email link lands here. On mount: POSTs `/api/walk-in/init { mode: "join_existing", walkInId: id, side: "user" }` — samwise-app's route resolves the id against `calendarBookings` first (book.tsx path), falls back to `walkIns` (lobby path). Either way returns the same init shape. Auto-renders `<MeetCallRoom>` — no pre-join lobby because the prospect already committed at `/book`. 404 → warm "couldn't find this meeting" screen.
- **In-call layout (`<MeetCallRoom>`).** Editorial register per user 2026-05-27 ("the screen takes the entire screen and the notes and the panel are separated by a straight line in the middle" — rejected). New shape: gallery-white page background, contained video tile (max-width 1.55fr column, 16:9, soft shadow, rounded 8px), notes column floating right with NO border and NO panel background — quote cards as Fraunces-italic on white. Self-view PiP **inside** the tile (bottom-right, 132×96 desktop, 96×72 mobile). Controls below the tile as editorial text-buttons (`[Mute] [Camera off] [End call]`), hover-underline expand-from-center, gold tint for pressed state, hairline red for end-call. No dark bar. Mobile: video stacks above notes, same air. Layout CSS lives in `components/call/call.css`.
- **Shared call wiring.** `components/call/video-call-experience.tsx` is the canonical user-side LiveKit Room wiring (a verbatim sibling of `samwise-app/components/demo-call/VideoCallExperience.tsx` used by `WalkInShell` on Samuel's side). Keep the two in lockstep; if the duplication ever bites, extract to a shared workspace package. Mic is open by default (NOT push-to-talk — this is human-to-human). 75-min wall-clock hard cap on both sides + LiveKit `emptyTimeout` (~30s) covers the room.
- **Notes hydration.** `<VariablesPanel>` from `/qualify/components/` is reused unchanged, fed from `demo-call:variable_update` DataChannel events published by Samuel's copilot when a `userVisible: true` variable's cleaned value changes. Client-side `ALLOWED_KEYS` set is a defensive filter. (The event-name namespace stayed `demo-call:*` for backwards compat after the `/demo-call/*` routes were retired.)
- **The Ritual Story (`app/meet/story/`).** An in-call explainer Samuel drives from his copilot to offload the Phase-9 roadmap onto the prospect's screen — he says ONE line per beat and clicks through. When live it **leads** the `.demo-call-room-notes` aside — `call-room.tsx` renders `<RitualStory>` ABOVE `<VariablesPanel>`, top-aligned with the sticky therapist video; the notes flow below it (separator on `.ritual-story`'s BOTTOM edge). **Fade-in-place (2026-06-01):** beats crossfade where they sit (pure opacity, `AnimatePresence mode="wait"`, strictly serial — old beat fully out, then new in); there is NO per-beat scroll. `call-room.tsx` scrolls to the story exactly ONCE, the first time it appears (hidden→live), then never again. This replaced the prior `scrollIntoView` auto-advance + the story-renders-below-notes order. **Redesigned 2026-05-30/31** (corrected across several rounds after reviewing the ritual/onboarding/script + landing-page + negotiation skills). Three layers, all bilingual EN/ES voseo in `strings.ts`:
  - **(1) The document spine** (`doc-spine.tsx`) — a page card **synced to the REAL Ritual Doc template** (Google Doc `1fiQX…`, verified against a filled instance `1AlFh…`). Three top-level sections mirroring the doc: **Problema y Solución** (active; first lines seeded LIVE from `behaviour_to_change` + `core_motivation`, with the ritual details nested ghosted *inside* it — *Realidad inquietante · La solución · El enemigo, con nombre · El ritual — mantras y protección · Tus horarios*) → **La Llamada del Ritual** (ghosted) → **Metadata** (ghosted), plus a `1 / 3 — por ahora` meter. **HARD LESSON: mirror the real template — do NOT invent doc sections** (an earlier draft invented 9 top-level sections; teaser and doc drifted). `enemy_name` shows only as a ghosted slot (captured in onboarding, not the demo).
  - **(2) The "Aún por responder" list** (`unanswered-list.tsx`) — a non-invasive, hairline-dashed open-loops list (gold italic `?` markers) the rep leaves to build anticipation for onboarding. Item count is DERIVED FROM the stage (appears at the `loop` beat, grows at `mechanism`, then persists).
  - **(3) The active beat**, advanced by the rep. StoryControl order = Phase 9 order: **`doc`** (spine alone) → **`promise`** (`neuro-crossfade.tsx` `PromiseBeat` — old-pattern-vs-ritual base with the two changes layered: behaviour fast / thoughts & feelings slow, three curves) → **`loop`** (`daily-loop.tsx` — agent call → ritual → tracking call; generic, doesn't name the tracking agent) → **`mechanism`** (`ritual-mechanism.tsx` — the ritual's 3 components: *said* mantras + *actionable* protection→immediate / new belief system→gradual, echoing the promise's two changes) → **`experience`** (`cycle-map.tsx` — the six-step multi-session journey: map → design → live → **optimize** → live → repeat).

  `StoryStage = "hidden" | "doc" | "promise" | "loop" | "mechanism" | "experience"` (hand-synced mirror of samwise-app's `lib/demo-call/broadcast.ts` union). `ritual-story.tsx` renders the spine + the unanswered list persistently, with the beat crossfading below via `AnimatePresence`. Transport: `demo-call:show_visual` `{ stage }` on the SAME DataChannel; `call-room.tsx`'s `onDataMessage` validates the stage and sets `storyStage`. Personalization is free (reads the same `variables` the panel holds). **Copy is editorial, NOT sloganeering** — "Dos cambios. Dos velocidades." was rejected; restore the original approved neuro/doc voice and thread tactical-empathy (negotiation skill) into the prospect's real fears. `story.css` reuses `call.css`'s `:root` tokens (literal Fraunces/Manrope). Reduced-motion via `useReducedMotion()`. The rep-side broadcaster + sticky `<StoryControl>` (Doc/Promise/Daily Loop/Mechanism/Six-Step Loop) live in samwise-app.
- **No "demo" in user-facing copy.** Lead reads "Your meeting with Samuel." / "Tu reunión con Samuel." Waiting state reads "Samuel is on his way." / "Samuel ya viene." Per the running rejected-list — copy says "your call" / "your session" / "your meeting," never "demo call."
- **Strings.** `lib/demo-call/strings.ts` was retired in the 2026-05 cleanup — `/meet` inlines its STRINGS in the components (`lobby.tsx`, `call-room.tsx`, `meet/[id]/scheduled-meet-client.tsx`).
- **Env vars on Vercel for `/book` + `/meet`:** `NEXT_PUBLIC_SAMWISE_APP_URL` only. LiveKit env vars are NOT needed on samwise-landing — token minting happens server-side on samwise-app.

## `/therapists` — visual journey for recruiting behavioural-change experts (first-class route, added 2026-06-15)

A standalone, presentable English journey at `/therapists` (pullable up anytime, incl. in-person meetings) that recruits behavioural-change experts. NOT a variant, NOT a lead-capture funnel. It walks through ONE real anonymized case (Sarah) end-to-end, **adapting the existing `/meet` Ritual Story beats as shared visuals**, then states the offer + collaboration and closes on a functional, on-the-spot personalization-capture step.

- **Route structure** (`app/therapists/`): `page.tsx` (server, thin, route metadata — the app-root `opengraph-image.tsx` auto-applies the canonical brand-mark OG card here too) → `therapists-journey.tsx` (client orchestrator; 10 sections in natural flow with `motion` `whileInView` reveals + `useReducedMotion()`; header wordmark links to `/`). Self-contained CSS `therapists.css` scoped under `.therapists-root`.
- **Reuses the story beats, never forks them.** Imports `DocSpine`, `PromiseBeat` (`neuro-crossfade`), `DailyLoop`, `RitualMechanism`, `CycleMap` from `app/meet/story/` + `STORY_STRINGS` (`lang="en"`) + `VariablesState`, rendered statically (the `/story-preview` pattern). `therapists.css` re-declares the `--bg/--ink/--ink-soft/--ink-mute/--rule/--gold/--accent` token context the story SVG strokes depend on (verified the strokes resolve to gold/ink, not white-on-white). Also `import "@/app/meet/story/story.css"`. Beats are placed per-section (no `.ritual-story` wrapper).
- **New reusable components** (built self-contained so the FUTURE therapist-Demo-Call surface can recycle them, mirroring how `demo-voice-room.tsx` recycled `/qualify`): `artifact-anatomy.tsx` (the case unit — see below), `seven-steps.tsx` (the 7 steps the therapist commits to, verbatim from the offer), `offer-card.tsx` (the user's verbatim ask/offer — 50% / $25-of-$50 + the "yet to be proven" caveat), `collaboration.tsx` (where the therapist plugs into onboarding / call design / optimization), `personalization-capture.tsx` (the close).
- **The flow is organized around the therapist's real question (user 2026-06-16, after a therapist call): "what INPUTS and what COMPONENTS build the ritual and the call?"** So the spine is TWO artifacts — **The ritual** and **The call that runs it** — each rendered by `artifact-anatomy.tsx` (`ArtifactAnatomy`) as: **what you gather (inputs) → what it's built into (components)** [the framework] → **"With {name}"** (the concrete application + the mantra quote + the imported beat). This keeps the framework⇄application comparison, reorganized around the build. Artifacts are driven by `ARTIFACTS` in `case-data.ts`; `therapists-journey.tsx` maps them and a `renderBeat(key)` switch attaches the beats (ritual → `RitualMechanism` + `DocSpine`; call → `DailyLoop` + the 3-call schedule). Sourcing (NOT invented — confirm with Samuel): ritual inputs = the seven steps; ritual components = mantras/protection/new belief/schedule/accountability (RitualMechanism + ritual-doc template); call inputs = symbol·gratitude·intentions·commitment·company (ritual-doc "Ritual Call" section); call components = the four-part call (the Stop · the Consciousness · the Intention · the Commitment). Build row is `1fr auto 1fr` (inputs · gold arrow · components) on desktop, stacks to 1-col (arrow rotates 90°) under 720px. `CycleMap` (the optimization loop) follows the two artifacts as "then you keep sharpening it." (The `PromiseBeat` two-changes curve was dropped in this reorg.)
- **Multiple cases + a switcher (user 2026-06-16).** `case-data.ts` separates the constant FRAMEWORK (`ARTIFACT_TEMPLATES` — inputs/components/labels/beats, shared across cases) from per-case data (`CASES: Case[]` — `name`, `tag`, `intro`, `motivation`, `problems`, `vars`, `calls`, and a `ritual`/`call` `CaseApplication` = the "with {name}" text + optional `quote`). **To add a success case, append one `Case` object to `CASES` — nothing else changes.** `case-switcher.tsx` (`CaseSwitcher`) renders hairline chips (name + tag, gold ring/underline on the active one) and is shown only when `CASES.length > 1`; `therapists-journey.tsx` holds `useState(active)`, and the whole case region (Meet {name}, the overview, both `ArtifactAnatomy`s + their beats via `renderBeat(b, c.vars)`) re-renders from `CASES[active]`. The `.t-artifacts` wrapper is keyed by `c.id` so a switch swaps the application + beats cleanly. `ArtifactAnatomy` now takes `template` (shared framework) + `application` (per-case) + `subjectName`. Verified switching in-browser with a throwaway second case (removed after).
- **The case (display name "Mara")** is the first entry in `CASES` (the `MARA` object), sourced from the real ritual doc, PII STRIPPED (display name CHANGED from the source, no surname, no phone). Motivation + the disidentification mantra translated FULLY to English. **First presentation ("Meet Mara") leads with the concrete behaviour (screen addiction)**, not the meta-emotional picture. The three daily calls (Morning Protection / Afternoon Faith-Building / Evening Prep) feed the `DailyLoop` beat's "frequency & type of agent calls". `MARA.vars` (behaviour_to_change = "reaching for my phone", core_motivation, etc.) feeds the `DocSpine` slots + the descending-curve label.
- **The close = on-the-spot personalization capture** (`personalization-capture.tsx`), FULLY FUNCTIONAL frontend, NO backend / NO email. Three process paths (use template as-is / bring your own process / edit the script here) + the personalization fields (you, region/tz, languages, price, pace, behaviours, first user, per-step fit signal, current note tools, default cadence, revenue-model checkbox). On "Assemble" it builds a plain-text summary shown on screen + a copy-to-clipboard button (Samuel grabs it live). Below it, a quiet link to **`/therapists/book`**: "Book a quick 15-minute test of adopting Samwise" (`PersonalizationCapture` takes `bookHref`, passed as `/therapists/book` from the journey). **SAFETY: never collect payment credentials here** — email + free-text only. Backend personalization is manual/later (Samuel's decision).
- **`/therapists/book` — the therapist's 15-min adoption test (distinct meeting type, 2026-06-16).** A thin route (`app/therapists/book/page.tsx`) that renders the SHARED `/book` `BookRoot` with `meetingType="therapist"` (English only) — NO duplicated picker or calendar plumbing. The booking flow is now **meeting-type-aware**: `/book` reads `?type=therapist` (defaults to `breakthrough`); `BookRoot` takes a `meetingType` prop and threads it into the slots URL (`?type=`) + the create POST body (`type`). The type's behaviour lives on **samwise-app** in `lib/book/meeting-types.ts` (`MEETING_TYPES`): the therapist test is **15 min** (vs the Breakthrough Call's 50), **15-min granularity**, a distinct calendar event title + confirmation-email copy, and an optional dedicated calendar via the **`THERAPIST_BOOKING_CALENDAR_ID`** env on samwise-app (falls back to `BOOKING_CALENDAR_ID` if unset). `app/api/book/slots` + `/create` resolve the type and pass `durationMin`/`granularityMin`/calendar/summary/email through. So the therapist test reuses the entire Google-Calendar + .ics + Samuel-notify infra — only the knobs differ. (Cross-repo: a `type` change touches `samwise-app/lib/book/meeting-types.ts` only.)
- **Aesthetic.** Same editorial register as canonical/`/qualify` — gallery white (`#FFFFFF`/`#000000`), Fraunces + Manrope literal stacks (NO `var(--font-fraunces)`), one warm-gold accent, hairline rules, `.t-cta` = gold-dash-collapse + center-expanding underline (mirrors `.cta--primary`), forest-green eyebrows. Audience is a professional PEER, so the "prepared" pillar leads (competence + concrete path + fair partnership), not "we hold you." Hero: eyebrow "For behavioural change experts" + h1 "Your work, *made daily.*" (headline is iterable). Mobile-first verified (no overflow at 375px; 2-col capture / 3-col collab grids collapse to 1-col under 720px).
- **Future (separate task):** recycle these visuals into a therapist version of the Demo Call (the LiveKit call experience). The new components are already props-driven for that.

## `/lekatchila` — Lekatchila variant case study (first-class route, added 2026-06-24)

A standalone English journey for a Lekatchila organizer (the Charedi first-year-of-marriage guidance system) modeled 1:1 on `/therapists` — walks through ONE real anonymized couple end-to-end (Avi & Chaya), reuses the same shared story beats from `app/meet/story/` (`DocSpine` / `RitualMechanism` / `DailyLoop` / `CycleMap`) + `STORY_STRINGS.en`, then states a partnership ask and closes on a 3-option pick for the in-room conversation. NOT a lead-capture funnel, NOT a variant in the experimental-redesign sense — a first-class route built for a specific opportunity, recyclable when more organizer audiences appear.

- **Route structure** (`app/lekatchila/`, `.l-*` class prefix scoped under `.lekatchila-root`): `page.tsx` (server, thin, route metadata) → `lekatchila-journey.tsx` (client orchestrator; 10 sections in natural flow with `motion` `whileInView` reveals + `useReducedMotion()`; header wordmark links to `/`) → `case-data.ts` (`ARTIFACT_TEMPLATES` + `COUPLES: Case[]`) → `artifact-anatomy.tsx` (inputs → components → "with {couple}") → `case-switcher.tsx` (hidden when `COUPLES.length === 1`) → `seven-steps.tsx` (Lekatchila-flavoured verbs) → `collaboration.tsx` (Onboarding / Call-Design / Alignment-Points plug-points) → `offer-card.tsx` (3-block partnership card, NO money) → `personalization-capture.tsx` (three radio options only, no intake form) → `lekatchila.css`.
- **The Avi & Chaya case** (`case-data.ts`'s `AVI_AND_CHAYA`): behaviour-to-change = "going quiet after a disagreement"; the desidentification line (Avi's prayer): *"The silence is an enemy I learned in childhood — it is not my marriage."* Ritual application FOREGROUNDS the madrich+madricha pair as the builders (active expert verbs, couple in receiving position) — *"Their madrich and madricha built the ritual with them, session by session — they named Avi's silence, chose the prayer he says when it rises; named Chaya's panic, chose hers."* The 3 daily calls use the **canonical Mara names** — Morning Protection / Afternoon Faith-Building / Evening Preparation — with case-specific bodies that make the framework pieces VISIBLE: Morning = naming the risk + asking for merciful language at re-entry; Afternoon = Avi shares one vulnerable thing → Chaya answers with mercy + faith + thanks (shifting his fear-of-sharing → willingness); Evening = schedule tomorrow's share-and-mercy + name one thing today's prayer held.
- **Framework labels diverge from `/therapists`** deliberately: ritual components use **"Prayer"** (not "Mantras") and call components use the current canonical 4 — **Exit from the day / Entry into the work / Intentions / The pact** (the 2026-06-23 renames). The `/therapists` `case-data.ts` still has the old names; do NOT edit `/therapists` for this (variant pattern), but any NEW surface using these structures uses the current names.
- **Seven steps are Lekatchila-flavoured** (Listen / Map the pattern / Name the enemies / Design the daily ritual — prayer, protection, new belief, schedule / Design the call / Adapt the script — Hebrew, Yiddish, register / Run with the AI follow-up agent) — NOT the `/therapists` clinical verbs. The audience is an organizer, not a clinician.
- **Collaboration plug-points** name surfaces Lekatchila already runs (Your onboarding / Your call-design seminar / Your alignment points). The variant fits the existing model, doesn't replace it.
- **Offer/partnership card is THREE BLOCKS** — *What we'd build for Lekatchila* / *What we'd ask of Lekatchila* / *Yet to be proven* — with NO MONEY anywhere (peer-organizer register). Adjacent `.l-offer-block` siblings share one hairline via `.l-offer-block + .l-offer-block { border-top: none; }` to avoid doubled rules.
- **The close is THREE PICKS, NO INTAKE.** `personalization-capture.tsx` is a single fieldset with three radio options (*Use the Samwise template process as-is / Bring your own process / Edit the Samwise script with us*), styled as plain options (no card chrome), no submit, no booking link. Section heading: *"Pick the path."* The conversation happens in the room; this surface is the menu shown during it. Reframe required when audience is in-the-room (vs. a recruit/funnel surface like `/therapists`).
- **Light cultural register only.** No invented kollel schedules / niggun anchors / minhag specifics. Touches that earn their space: *"first year, no children yet"* (case `vars`), *"Hebrew, Yiddish, register"* (seven-steps step 6).
- **Aesthetic identical to `/therapists`** — gallery white, Fraunces + Manrope literal stacks (NO `var(--font-fraunces)`), warm-gold accent, hairline rules, `.l-cta` gold-dash-collapse (mirrors `.t-cta` / `.cta--primary`). Eyebrow *"FOR LEKATCHILA"*, h1 *"The first year, *made daily.*"* with italic-forest emphasis. Header is canonical Samwise wordmark only — Lekatchila is named in eyebrow + body copy, NOT co-branded.
- **Metadata** (`page.tsx`): *"Samwise for Lekatchila — a variant for the first year of marriage"* + matching openGraph. App-root `opengraph-image.tsx` auto-applies the canonical brand-mark card.
- **Verified at 1280px + 375px** (no horizontal overflow at 375). All four story beats render with strokes resolving to gold/ink via the `story.css` import.

## `/goals` — private printable monthly goal board (first-class route, added 2026-08-01)

A personal utility for Samuel, NOT a marketing/public surface — same unindexed treatment as `/framework` (`robots: { index: false, follow: false }`, no nav link, English only, reached by typing the URL). Lets him type 4 goal names (1 northstar + 3 others), pick a month, and print a blank calendar-style grid (goal rows × day columns) to physically log progress on a real board by hand — the page's only job is to produce a clean print-ready template, not to track anything itself.

- **Route structure** (`app/goals/`): `page.tsx` (server, thin, noindex metadata) → `goals-board.tsx` (client: 4 text inputs, a native `<input type="month">`, an orientation toggle, a Print button calling `window.print()`, and the live grid preview) → `goals.css` (scoped `.goals-root`, literal Fraunces/Manrope stacks, `@media print` rules).
- **No backend.** State (`northstar`/`goal2`/`goal3`/`goal4`/`month`/`orientation`) round-trips to `localStorage` under `samwise:goals-board` so goal names persist across visits without retyping — consistent with landing having no Firestore access.
- **Grid mechanics.** Day count is computed from the picked month (`new Date(year, month, 0).getDate()`), so it correctly renders 28–31 columns. Weekend columns get a faint `rgba(0,0,0,0.035)` tint for scannability. Every goal×day cell is deliberately blank (no placeholder content) — sized for a physical sticker/token. Row labels get `padding-left: 14px` so goal names don't sit flush against the table's left border.
- **Northstar row is visually featured** — taller (68px vs 44px), larger Fraunces italic label with a gold ✦ marker, and set apart from the other 3 rows by a `var(--gold)` rule instead of the default hairline `var(--rule)`.
- **Print is the browser's native dialog** — no PDF library, no server rendering. `.goals-controls` (header + form) is hidden via `@media print`; only `.goals-grid` remains.
- **Print-column width bug (fixed 2026-08-01).** The first shipped version used `table-layout: fixed; width: 100%` with `width: auto` on all 31 day columns — Chrome's print rasterizer dropped hairline vertical borders on most columns (only ~5 of 31 kept their divider lines; a real printed PDF confirmed it, screenshots didn't catch it). Root cause: `width: auto` forces the browser to divide remaining space across many columns at layout time, and print-DPI rounding on that computed fractional width makes borders vanish unpredictably. **Fix: every column gets an identical explicit width** (currently `1.9in` label / `0.25in` per day column — see next bullet for why label grew) instead of `auto` — removes the rounding ambiguity entirely. `.goals-grid { border: 1px solid var(--rule) }` also closes the outer box edges.
- **Orientation toggle + portrait-rotation clipping bug (both 2026-08-01).** A Landscape/Portrait control next to Print, persisted in state. Portrait is a literal 90° rotation of the SAME landscape-shaped grid (user's explicit call — not a transposed goals-as-columns/days-as-rows layout). The `@page` rule is no longer static in `goals.css`; it's injected via an inline `<style>` tag in `goals-board.tsx` (`@page { size: letter ${orientation}; margin: 12mm }`) so it can react to the toggle.
  - **First rotation attempt** used `position: fixed; top/left: 50%; transform: translate(-50%,-50%) rotate(90deg)` on `.goals-grid-wrap`. A real printed PDF showed goal-name text missing from the START of the label (e.g. "Main Push Night" → "Push Night") — that's physical clipping against the page edge, not CSS `text-overflow: ellipsis` (which only ever truncates the end). Root cause: percentage `top`/`left` on a `position: fixed` element resolve against the page's initial containing block, and that resolution isn't reliable once a `transform` is layered on in Chrome's print pipeline.
  - **Fix:** center via normal document flow instead of `position: fixed` + percentage math — `.goals-orientation-portrait .goals-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; }` plus a plain `.goals-orientation-portrait .goals-grid-wrap { transform: rotate(90deg); transform-origin: center center; }`. Flexbox centers the pre-rotation box via ordinary layout; rotating around its own center never moves that centerpoint, so there's no containing-block ambiguity left to get wrong.
  - **Label width grew from 1.5in → 1.9in** (day columns shrank 0.26in → 0.25in to keep the total within budget) once the clipping was fixed, so real goal names ("Main Push Morning") render in full instead of hitting ellipsis immediately — only genuinely long names still truncate.
  - On-screen preview uses the same rotate approach (no fixed-position) via `.goals-grid-wrap--rotated` for a rough live preview.
  - **Follow-up bug: the northstar row still truncated its label after the fix above.** `.goals-grid-row--northstar .goals-grid-rowlabel { font-size: 18px }` (a base, non-print rule, 2-class specificity) outranks the plain `.goals-grid-rowlabel { font-size: 13px }` print override (1-class specificity) regardless of source order or media context — specificity always wins ties like this. So the northstar label kept rendering at the screen-only 18px in print, overflowed the identical 1.9in column harder than the other rows, and hit the ellipsis sooner (a real printed PDF caught this too, same 1.9in-fits-fine result the other three rows got wasn't shared by northstar). **Fix:** added `.goals-grid-row--northstar .goals-grid-rowlabel { font-size: 13px }` inside `@media print` — matching specificity, later in the cascade, wins. The featured look for northstar still comes through in print via the ✦ marker, the taller row, and the gold underline; it doesn't need a bigger font too.
- **Verification method: real headless-printed PDFs, not screenshots.** Both bugs above were invisible in the dev-server screenshot/preview and only showed up in an actual printed PDF — the same lesson as the OG-image work elsewhere in this file. Reproduce with `google-chrome --headless=new --disable-gpu --no-sandbox --print-to-pdf=<path> --print-to-pdf-no-header --run-all-compositor-stages-before-draw --virtual-time-budget=5000 <url>`, then read the PDF back (Read tool renders PDF pages as images). To test specific goal names/orientation without clicking through the UI in headless mode, temporarily hardcode the values into `defaultState()`, print, verify, then revert — localStorage doesn't carry over into a fresh headless Chrome profile.

## `/` — Samwise v2 landing (canonical since 2026-09-12)

The conversion surface for the paid Meta-ads operation. Replaces the editorial landing, which
now lives at `/v1`.

**Files**
```
app/page.tsx        server component — owns metadata (title/description/canonical/OG/twitter)
app/home.tsx        "use client" — the whole page; EN/ES state + motion reveals
app/home-copy.ts    HOME_COPY: Record<Lang, HomeCopy>, explicitly typed (no `as const`)
app/home.css        scoped under `.sw-root`, all classes `.sw-*`
```

**Register — a deliberate departure from the editorial doctrine, approved by the user
2026-09-12.** Held from the brand system: Fraunces *italic* wordmark + the 8px gold ✦ (same
sparkle path as the navbar/OG star), gallery white / ink / `#555` mute / `#E0E0E0` rule /
forest `#1F3023` / gold `#D4A85A`, Fraunces display + Manrope UI on literal font stacks, no
emoji, no gradients-as-decoration, no testimonials. **Departures (do not "fix" these back):**
filled black CTA buttons, the CTA repeated 4× plus a sticky mobile bar, ~96–120px section
rhythm instead of the editorial 160–180px, full-bleed forest and ink bands, and a top announce
bar. These are scoped to `.sw-root` only — `app/styles.css` and every other route are untouched.

**Section order:** announce bar → sticky nav → hero (h1 + the call card) → forest band (the
loop) → 3 numbered steps → the daily call + spec list → forest band (support group) → clinical
credibility → FAQ (`<details>`, no JS) → ink band final CTA → footer → sticky mobile CTA.

- **The call card** is the one memorable object: hairline card, gold ✦ with two CSS `sw-ping`
  rings on a 2.8s stagger, "Samwise / calling… / 07:00 / Your time. Every day." It states the
  whole product in one glance, which is what cold paid traffic needs in two seconds.
- **Every CTA points at `/v2/signup`** (`?lang=es` when Spanish). `/qualify` is NOT in this
  funnel — the v2 product has no qualification gate during the open beta.
- **The support-group section is badged "Rolling out during the open beta."** The feature is
  not built. Do not remove the badge or upgrade the copy to present tense until it ships —
  it is both honest and a Meta-ads claims liability.
- **Language** is EN default + ES toggle, persisted to `localStorage["samwise:v2-lang"]` —
  the SAME key the `/v2` app reads, so the choice carries from the landing into signup.
- `.sw-root` deliberately does NOT set `overflow-x: hidden` — that would break the sticky nav
  (the same trap documented for `.editorial-root` in the landing skill).

## `/v2` — account app for Ritual Calls (added 2026-09-12)

Login / signup / settings for the scheduled AI phone-call service. A separate n8n automation
reads `users` + active `call_schedules` daily and places the calls; this app never calls anyone
and never writes `call_logs`.

**Files**
```
app/v2/layout.tsx              noindex metadata + `.v2-root` wrapper + v2.css
app/v2/page.tsx                session? → /v2/settings : /v2/login
app/v2/{login,signup}/page.tsx server session gate → client form
app/v2/settings/page.tsx       server gate; loads user + schedules + logs, passes to <Dashboard>
app/v2/strings.ts              V2_STRINGS EN/ES (no `as const` — literals break Record<Lang,…>)
app/v2/v2.css                  scoped under `.v2-root`
app/v2/_components/            brand · lang · timezone-select · login-form · signup-form · dashboard
app/api/v2/…                   auth/{signup,login,logout} · me · schedules · schedules/[id]
                               · contacts · contacts/[id] · call-history
lib/v2/                        db · queries · session · validate · http
```

**Schema is fixed and external — never invent or rename tables/columns.** `users`
(id identity, name, phone, email, password_hash, timezone), `call_schedules`
(id, user_id, call_time `time`, active), `support_contacts` (id identity, user_id, name,
phone, relationship nullable, active default true), `call_logs` (READ-ONLY here).

**Non-negotiables encoded in the code:**
- `call_schedules.call_time` is the user's **local wall clock, stored verbatim** (`HH:MM` →
  `HH:MM:SS`). No UTC conversion on the way in or out, ever — the n8n automation reads each
  user's `timezone` and converts itself. `called_at` (timestamptz) IS rendered in the user's
  timezone via `Intl.DateTimeFormat`.
- Passwords: bcryptjs, cost 12. `password_hash` is selected only inside `verifyCredentials`
  and is destructured off before the row leaves that function. No endpoint returns it.
- Every `call_schedules` / `call_logs` query carries `WHERE user_id = $n`. Schedule PATCH and
  DELETE put ownership in the WHERE clause, so another user's row matches nothing and the
  route returns 404 — indistinguishable from missing.
- Parameterised queries only. `buildSetClause` interpolates **column names from our own literal
  whitelist**, never request data; values are always bound.
- Session is a `jose` HS256 JWT in an httpOnly / sameSite=lax cookie (`samwise_v2_session`,
  30 days), signed with `SESSION_SECRET`. Logout sends a clearing `Set-Cookie` (empty value,
  1970 expiry). Note the stateless-JWT tradeoff: logout clears the browser cookie but does not
  revoke the token server-side. Fine here; revisit if sessions ever need remote kill.

**`bigint` reads back as a STRING — coerce it (cost a full debugging pass, 2026-09-12).**
Postgres `int8` exceeds `Number.MAX_SAFE_INTEGER`, so the driver returns it as a string to
preserve precision. Every `id` in this schema is `bigint`. Symptom: signup and login returned
200 but *every* authenticated request 401'd — `createSession` had signed `uid: "5"` and
`getSessionUserId`'s `typeof uid === "number"` check rejected it. Nothing in the type system
catches this; the row is cast `as PublicUser` and TypeScript believes it.
- The fix is `asUser` / `asSchedule` / `asContact` / `asCallLog` in `queries.ts` — every read
  passes through one, so `id: number` is true at runtime.
- **Do NOT try to fix this via the driver's `types` option.** `neon()` destructures a fixed
  option list (`arrayMode`, `fullResults`, `fetchOptions`, `isolationLevel`, `readOnly`,
  `deferrable`, `authToken`, `disableWarningInBrowsers`) and silently ignores `types` at
  construction — it is per-query only. I tried; it no-ops with no error.
- Same applies to `numeric`: `call_logs.score` and `tts_ttfb` arrive as strings. `score` is
  typed `string | number | null`; `tts_ttfb` is rendered through `Number(...)`.
- Any NEW column of type `bigint` or `numeric` needs the same treatment.

**Schema drift the n8n side introduced (found 2026-09-12).** `call_logs` gained `call_type`
(text NOT NULL, default `'ritual'`) and `contact_id` (bigint, nullable). `'ritual'` = we called
the user; anything else is outreach placed on their behalf, with `contact_id` naming the
support contact phoned. `listCallLogs` LEFT JOINs `support_contacts` — **scoped to the same
`user_id` as the log row**, so a contact can never resolve across accounts — and the history UI
badges non-ritual rows "Support call to {name}". Showing these is deliberate: it is the
landing's "your people get called" promise made visible. Also note `goal_achieved` is a
**boolean**, not text, and `users.email` / `password_hash` are nullable (rows 1 and 2 were
created directly by n8n with NULL emails and cannot log in until they have a password).

**Env vars required:** `DATABASE_URL` (Neon) and `SESSION_SECRET`. Both must be set in Vercel
for Production, Preview and Development.

### Support Contacts (added 2026-09-12, same day)
People the service may phone when the user misses or struggles with their calls — the outreach
goes to the contact, never back to the user, and the settings copy says so explicitly in both
languages. `user_id` is always taken from the session; a client-supplied one is ignored. The
`POST /contacts` body is `{ name, phone, relationship? }` — `active` is deliberately NOT
accepted on insert (the column defaults true), matching the REST contract; it is only settable
via PATCH.

**Patterns adopted from samwise-app's `/outreach` + `/trip` (see those skills):**
- **Click-to-cycle status chip.** The Active/Paused pill IS the control — dashed border as the
  affordance, solid on hover. There is no separate pause/resume button. Applied to BOTH support
  contacts and call schedules so the two lists behave identically. The chip's accessible name
  comes from `title` ("Pause this contact"), since "Active" alone would not convey the action.
- **Optimistic-first mutations.** `toggleActive` flips local state, then reverts if the server
  disagrees. Verified against a 401.
- **Status palette.** `--moss #2D5A3D` (active) and `--ash #B5AFA1` (paused), borrowed from the
  paper-module tokens so status reads the same across Samwise tools.

**What was deliberately NOT adopted:** the paper-module aesthetic itself (warm `#FAF6EE` paper,
Geist Mono, dBase boxes, no motion) and the right-rail `EditPanel`. Those primitives live in
`samwise-app/app/outreach/_components/` — a different repo, so they cannot be imported — and
the register belongs to Samuel's operator tools. `/v2` is the consumer surface at the end of a
paid-ads funnel and stays on the landing's brand system. Contact editing is an inline row
expand rather than a right rail, because the rail is awkward on mobile and this list is short.

### Call language (added 2026-09-12)
`users.language` and `support_contacts.language` are NOT NULL ISO 639-1 codes (both default
`'es'` in the DB), restricted app-side to **`es` | `en` | `he`** via `SUPPORTED_LANGUAGES` in
`lib/v2/validate.ts`. A contact's language is independent of the user's. Selectors live on
signup, the settings profile, and the contact add/edit forms; codes are stored, friendly
localized names are displayed.

- **It is labelled "Call language", never just "Language".** The app already has an EN/ES
  *interface* toggle in the header. Unqualified "Language" made testers read the Hebrew option
  as "switch the UI to Hebrew". The help text says so outright: *"Separate from the language of
  this page."* The UI itself stays EN/ES — Hebrew is a call language only, so no RTL work.
- `language_agents` is **READ-ONLY**. `listActiveAgentLanguages()` is the only query against it
  and there is no INSERT/UPDATE/DELETE anywhere in `app/` or `lib/`.
- `GET /api/v2/language-agents/active` is **public** (no session) — the signup form needs it
  before a session exists, and it leaks nothing but which languages have a live agent.
- The "agent coming soon" notice is non-blocking: the choice still saves and the backend
  queues the agent. `useActiveAgentLanguages()` returns `null` while loading and **callers must
  not render the notice until it resolves**, or every language flashes as unsupported on first
  paint. A failed lookup falls back to "all supported" — a false alarm is worse than a missing
  hint.

**⚠️ The notice cannot currently fire.** As of 2026-09-12 all three `language_agents` rows have
`active = true` (the column defaults to true), but `en` and `he` hold placeholder agent ids
(`REPLACE_ritual_en`, `REPLACE_support_he`, …) — only `es` has real ones
(`agent_vyUHSK69o2kCmfsrYBNYYh` / `agent_yYNnKy3K8CfmsCZUa996tr`). The app implements the agreed
contract (`SELECT active … WHERE language = $1 AND active`) exactly, so English and Hebrew read
as ready and will be dispatched against placeholder ids. The fix belongs on the n8n side —
set `active = false` until the real agent ids land. Do NOT add `REPLACE_%` string-matching
app-side; that invents a convention on data this app does not own.

**Known debt (mirrors `/outreach`):** delete still uses `window.confirm()`.

**Deferred:** password reset, email verification, account deletion.
