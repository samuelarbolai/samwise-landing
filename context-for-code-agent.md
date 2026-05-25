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
│   ├── page.tsx            # CANONICAL — single-CTA + teaser structure:
│   │                       #   FixedScene (hero, interp+sigs)
│   │                       #   PinFadeScene (voice/lede)
│   │                       #   ChallengesFreezeScene (sticky pin + opacity fade-out,
│   │                       #     ChallengeItem one-by-one reveals + ChallengePostscript)
│   │                       #   interp-snap-anchor (scroll-snap stop at 3.5vh on mobile)
│   │                       #   StickyScene (try): one CtaBlockReveal
│   │                       #   Teaser section in natural flow:
│   │                       #     TeaserLine (label) → TeaserHeadline (manifesto h3)
│   │                       #     → TeaserLine (90-min) → TeaserLine (optimization)
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
│   │   ├── language-picker.tsx      # explicit English / Español picker + "I'd rather type" fallback
│   │   ├── voice-room.tsx           # livekit-client Room, hybrid PTT (tap-toggle <200ms / hold-to-speak >200ms / spacebar shortcut)
│   │   ├── chat.tsx                 # AI SDK 6 useChat fallback (text mode)
│   │   ├── qualify.css              # scoped high-contrast monochrome styles
│   │   └── components/
│   │       ├── message-list.tsx
│   │       ├── message-input.tsx
│   │       └── final-screen.tsx     # qualified / disqualified / safety_flagged renderings
│   └── api/
│       └── qualify/
│           ├── voice-init/route.ts  # mints LiveKit token + dispatches ritual-agent with metadata { flow:"qualification", language, persona:"nova" }
│           └── chat/route.ts        # AI SDK streamText with submitQualification tool (text-mode fallback)
├── components/
│   ├── theme-provider.tsx  # next-themes wrapper (not currently used on page.tsx)
│   └── ui/                 # shadcn/ui components (button, card, etc.) — available but mostly unused
├── hooks/                  # shadcn/ui hooks
├── lib/
│   ├── utils.ts            # `cn` helper (clsx + tailwind-merge)
│   └── qualify/            # source-of-truth for the qualification agent (worker COPIES these)
│       ├── persona.ts                 # Nova characterization, bilingual
│       ├── intake-prompt.ts           # Intake stage prompt builder (P1 + safety)
│       ├── capture-prompt.ts          # Capture stage prompt builder (P2 verbatim)
│       ├── schema.ts                  # GateDecisionSchema + QualificationPayloadSchema (zod)
│       └── strings.ts                 # bilingual UI copy (picker / voice / chat / final screens)
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

The qualification agent surface. Bilingual (English / Español), voice-first with a text fallback. Architecture:
- **Picker first.** No auto-detection — the user picks language explicitly and chooses voice (default) or text.
- **Voice mode** dispatches a LiveKit Room. The browser hits `app/api/qualify/voice-init/route.ts` which mints a token and **dispatches the existing `ritual-agent` worker** with metadata `{ flow: "qualification", language, persona: "nova" }`. The worker's qualification flow lives at `samwise-backend/ritual-agent/src/flows/qualification/` (NOT in a separate `qualification-agent` module — the multi-flow-router pattern is canonical, see `samwise-livekit-agents` skill). Push-to-talk is hybrid: tap-and-release within 200ms = toggle on/off; press-and-hold beyond 200ms = release ends the turn. Spacebar mirrors on desktop.
- **Text mode** streams Gemini 2.5 Flash via AI SDK 6 `useChat`. One combined Intake+Capture prompt, one tool (`submitQualification`).
- **Both modalities** call `submitQualification` (cloud function in `samwise-backend/cloud-functions/`) once at the end. The cloud function evaluates the rubric server-side (qualified vs disqualified vs safety_flagged) and writes a doc to Firestore `qualifications` collection.
- **Final screen** shows the same `https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment` link for qualified AND disqualified outcomes (DQ gets an assertive note). Safety_flagged shows a professional-referral message without the link.
- **Source-of-truth files** in `lib/qualify/` are copied into the worker at `ritual-agent/src/flows/qualification/`. Keep both in sync until they're hoisted to a shared package (out of scope for v1).
- **Env vars on Vercel for `/qualify`:** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`, `RITUAL_AGENT_NAME` (defaults to `ritual-agent`), `GOOGLE_GENERATIVE_AI_API_KEY` (text mode), `SUBMIT_QUALIFICATION_URL`.
- **Notes-as-main layout (both modes).** When the first agent-committed note arrives (`.qualify-voice:has(.qualify-notes)` / `.qualify-chat-layout:has(.qualify-notes)`), the layout flips from "centered mic / chat box" to "notes as main column (38em readable measure, centered) + speaker dock fixed at viewport bottom." The speaker dock is `position: fixed; bottom: 0; left: 0; right: 0` with no chrome — its only visible element is the centered mic button (voice mode) or `MessageInput` (chat mode). A `::before` pseudo-element above the dock paints a 120px gradient from `var(--bg)` to transparent so notes scrolling toward the dock dissolve into the page surface before they would visually touch it — the "fade out as objects approach" treatment the user explicitly asked for. `.qualify-voice` / `.qualify-chat-layout` get `padding-bottom: 248px` (dock ~108px + scrim 120px + ~20px breathing) so the last note clears the scrim. Pre-notes the dock is a passive flex wrapper and the layout is byte-identical to the original centered behavior. **Do not re-introduce the prior row layout (mic-left + notes-right) — it horizontally collapsed the notes and forced vertical overflow.**
