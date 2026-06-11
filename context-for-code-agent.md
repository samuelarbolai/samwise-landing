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
Public landing page for Samwise. The canonical page (`app/page.tsx`) uses a multi-scene scroll choreography. Structure (promoted through `/tease` → `/vingilot` → `/quiet-cta` → `/dual-cta`):

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
