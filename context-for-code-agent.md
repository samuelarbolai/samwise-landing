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
Public landing page for Samwise. Intentionally minimal / "styleless": it is shown to prospects and to designers, and Samuel does not want a predetermined visual style to bias the designers' proposals. Content is currently a single long-form text page in `app/page.tsx` that:
- Explains who Samwise is and what behaviours it targets.
- Lists the three onboarding steps (Fit Assessment → Diagnosis & Prescription → Ritual start).
- Provides a "Schedule your call" section with a WhatsApp link and a Google Calendar link.
- Credits Dr. Ana María Reyes Tirado.

The app uses Next.js 16 (app router), React 19, Tailwind v4, and shadcn/ui-style components in `components/ui/` (most of them currently unused on the page itself). Styling on the live page is done with inline `style={...}` props, not Tailwind classes — this keeps it deliberately bare.

## Module Structure (Directories and files)
```
samwise-landing/
├── app/
│   ├── globals.css         # Tailwind v4 base styles
│   ├── layout.tsx          # Root layout: Geist font, Vercel Analytics in prod
│   ├── page.tsx            # The canonical landing page (inline styles, long-form copy)
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
│   └── frodo-scene/        # Sacred-journey scene variant (mid-fi sketch)
│       ├── page.tsx                 # asymmetric copy-left / scene-right (sticky desktop, fixed mobile)
│       ├── scene.tsx                # silhouette stage: mountain, figure, hand, star, ring
│       ├── aperture.tsx             # static placeholder for case-study videos and Dr. Ana photo
│       └── tokens.ts                # OKLCH colour tokens + easings
├── components/
│   ├── theme-provider.tsx  # next-themes wrapper (not currently used on page.tsx)
│   └── ui/                 # shadcn/ui components (button, card, etc.) — available but mostly unused
├── hooks/                  # shadcn/ui hooks
├── lib/
│   └── utils.ts            # `cn` helper (clsx + tailwind-merge)
├── public/                 # Icons and placeholder assets
├── styles/                 # Additional stylesheet (if any)
├── components.json         # shadcn config
├── next.config.mjs
├── package.json            # next 16, react 19, tailwind 4, motion 12, radix, lucide
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
