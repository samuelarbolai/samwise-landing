# current-plan.md — /therapists visual journey (recruiting behavioural-change experts) (2026-06-15)

> Neurotic-implementer rules in force: ask before deducing; therapist-facing copy needs
> sign-off; never commit unless asked. ONE repo: samwise-landing.
>
> **Supersedes** the prior plan (/meet fade-in-place + samwise-app editorial deepening,
> 2026-05-31) — that task SHIPPED. This file is fully overwritten for the new task.

## Task (master Vibe doc, Projects tab — IN PROGRESS)
"Visual Journey for recruiting therapists." Prepare a visual journey of the *consultante*
+ the *therapist* using a real anonymized case ("caso del amigo"), covering: first
sessions, what the ritual is, and the agent-call frequency/type. Adapt the existing
end-user materials for a therapist audience. Add: the "Sarah" success case,
desidentification steps, a therapist ask/offer section, and a collaboration framework.

## What this deliverable IS (user clarification, 2026-06-15)
A **standalone visual journey** that lives at `/therapists` and is **pullable up anytime**
(incl. in-person meetings on a laptop/screen). It is **NOT a lead-capture funnel** — it does
NOT end in a form. It ends by laying out the **offer + collaboration + "your first user"** as
the live next step Samuel sets up *with* the person there.

Second venue (FUTURE, separate task): the same visuals get recycled into a **therapist
version of the Demo Call** (reusing the existing LiveKit call experience, the way
`demo-voice-room.tsx` recycled `/qualify`). **Consequence for THIS task:** build every new
therapist-specific visual as a **self-contained, reusable component** (mirroring how
`app/meet/story/` beats are reusable), so the future therapist-call can import them without
a rewrite. Do NOT build the therapist-call itself in this task.

## Decisions locked with the user (2026-06-15)
- **Location:** NEW first-class route `app/therapists/` (NOT a variant, NOT canonical).
- **Language:** English. Sarah's disidentification mantra translated FULLY to English (no
  Spanish kept); her motivation translated to English.
- **Visuals:** ADAPT the existing Ritual Story beats (`app/meet/story/`) as the shared
  single source of truth; build only the NEW pieces (offer, collaboration, personalization
  capture) as reusable components.
- **Eyebrow:** "for behavioural change experts" (general, less clinically committed).
- **Case is SIMPLE:** show how the process HELPED Sarah, not a granular step walk (see below).
- **Close:** NOT a lead-capture form — a FUNCTIONAL personalization-capture step
  (frontend-only) offering three process paths (use our template as-is / send us your own
  process doc / edit our script right here) + the fields we need to personalize + "pick your
  first user." **Delivery = on the spot:** captured live/in-person, assembled into an
  on-screen structured summary + copy-to-clipboard (NO email, NO backend — Samuel grabs it in
  the room). PLUS a quiet `/book` link framed as **"Book a quick 15-minute test of adopting
  Samwise"** (for remote viewing / async follow-up). Capture **field list CONFIRMED** (incl.
  the three likely-missed: per-step fit signal, current note tools, default cadence).
  Wordmark links to `/`. OG/share card: reuse the existing canonical brand-mark card.
- **Content:** SUPPLIED — ask/offer (verbatim below) + Sarah's ritual doc (Google Doc
  `1AlFhHPkBB9n4eDIpAg4GtXw7IhANvyNv4ziNTBqEbaI`). PII stripped (no surname, no phone).

## Plan Summary
A first-class English route at `/therapists`, scroll-told, designed to be presented live.
It walks a behavioural-change expert through ONE real anonymized case (Sarah) end-to-end —
structured around the **seven steps a Samwise therapist delivers** and using the EXISTING
Ritual Story diagrams as the visual spine — then states the **ask/offer** and the
**collaboration framework**, closing on "bring your first user." Editorial register
identical to canonical (gallery white, Fraunces/Manrope, warm-gold accent, hairline-dash
CTA, generous vertical space, restraint over polish). Beats imported from `app/meet/story/`
(never forked); new pieces built self-contained for future reuse in the therapist-call.
Static render (the `/story-preview` pattern: `lang="en"` + a case `VariablesState`, wrapped
in the token context the SVG strokes need). No LiveKit / agent / DataChannel in this task.

## The seven steps a Samwise therapist delivers (from the ask/offer)
The case section is structured around these (they're literally what the therapist commits to):
1. Functional analysis of the last relapse
2. Desidentification
3. Mapping of origin
4. Identification of enablers
5. Design of protection
6. Identification of current belief system
7. Design of action toward the new belief system

## The ask / offer (verbatim — user-supplied, do not reword without sign-off)
> We offer you to supply the sessions at your own price, pace and language, as long as you
> fulfill the steps (functional analysis of last relapse, desidentification, mapping of
> origin, identification of enablers, design of protection, identification of current belief
> system, design of action to new belief system).
> We offer you 50% of the revenue coming from the AI system. Which is 25 USD per month, since
> we charge the AI agent at 50 USD monthly.
> We have the goal of increasing the availability of therapists thanks to efficiencies gained
> from Samwise, but this is yet to be proven.

## Personalization capture — fields (close, Section 10) — PROPOSAL for sign-off
The expert chooses ONE of the three process paths, then we capture what we need to set them
up. Proposed fields (Samuel: trim/extend — these are my proposal incl. things you might be
missing):
- **You:** name · email (so we can reach you + arrange the 50% payout — see safety note).
- **Region & time zone** — needed to schedule the agent calls for your users.
- **Session language(s)** you'll run.
- **Your price** per user / month (you set it) · **your pace** (how many users, what cadence).
- **The behaviours you work with** (free text — e.g. screens, substances, relationships,
  work avoidance).
- **Process path** (a / b / c) + the payload:
  - (b) → a link to / description of your own process document.
  - (c) → the specific changes you'd make to our script (free text).
- **Your first user** — initials/context + the behaviour they want to change + a rough
  start date. (Anchors the "pick your first user" close.)
- **Fit signal (likely-missed):** which of the seven steps you're fully comfortable delivering
  vs. would want to adapt — surfaces objections/fit early, and tells Samuel where to coach.
- **Your current note-taking / tools (likely-missed):** how you capture session notes today —
  informs how your process maps onto ours.
- **Default agent-call cadence (likely-missed):** the rhythm you'd want for your users by
  default (Sarah ran 3/day — most won't).
- **Anything else we should know to personalize** (free text).
- **Revenue model acknowledgement** — a checkbox confirming the 50% / $25-of-$50 terms.
> ⚠️ **Safety rule:** do NOT collect bank/card/account numbers or any payment credentials on
> the page (prohibited). Capture email + "preferred payout method" as free text at most;
> actual payout details are arranged off-page, directly with Samuel.

## The case (Sarah) — source + mapping (PII stripped)
Source: Sarah's ritual document. Strip "Coral" (surname) and the phone number; render
"Sarah" + "a family member."
- **Motivation (translate to EN):** "to be my most self-sufficient, capable self — able to
  support a family and her businesses."
- **Problems:** (1) self-destructive avoidance / isolation; (2) perfectionist expectation on
  new tasks (the unsettling reality).
- **Solution approach:** break isolation immediately + retrain expectations toward
  effort-based pride over first-attempt perfection.
- **The ritual = three daily agent calls (this IS the "frequency & type of agent calls"):**
  - *Morning Protection* (8am / 10am fallback; 6am Tuesdays): assess vulnerable state,
    activate social support, coordinate logistics & meals.
  - *Afternoon Faith-Building* (2pm / 3pm fallback): document tasks attempted, name the
    learning from failures/unknowns.
  - *Evening Preparation* (9pm / 10pm fallback): plan morning logistics.
- **Disidentification mantra (keep Spanish + EN gloss):** "Estoy siendo atacada por un
  enemigo que me hace maltratarme" → *"I'm being attacked by an enemy that makes me mistreat
  myself."* Reframes the struggle as external opposition.
- **Belief reframe:** unconditional faith in facing discomfort; control her *response*, not
  outcomes.
> **Keep the case SIMPLE (user 2026-06-15):** do NOT walk every step granularly. Show how the
> process HELPED Sarah — once she desidentified from her problem with our help (the enemy
> reframe), she opened up much more easily and adopted everything (the ritual) far more
> readily. The functional analysis is only the means by which we read identification level;
> the point to land is the EASE that followed desidentification. The seven steps live in the
> collaboration/offer section (what the therapist commits to), NOT as a granular case walk.

## Why "adapt the beats" maps cleanly (the visual spine)
| Existing beat (`app/meet/story/`) | Section in `/therapists` |
|---|---|
| `DocSpine` (`doc-spine.tsx`) | the Ritual Doc the therapist co-creates with the consultante |
| `PromiseBeat` (`neuro-crossfade.tsx`) | what behaviour change looks like (two changes, two speeds) |
| `DailyLoop` (`daily-loop.tsx`) | **agent-call frequency & type** — Sarah's 3 daily calls |
| `RitualMechanism` (`ritual-mechanism.tsx`) | the ritual's components (said mantras + actionable protection / new belief) |
| `CycleMap` (`cycle-map.tsx`) | the six-step multi-session arc — where the therapist's recurring work lives |

## Plan Architecture (Flow)
Server route `app/therapists/page.tsx` (thin) → client orchestrator
`app/therapists/therapists-journey.tsx` laying out ordered sections in NATURAL FLOW with
`motion` `whileInView` reveals (`viewport={{ once: true, amount: 0.3 }}`, honoring
`useReducedMotion()`) — NOT the heavy canonical FixedScene/PinFade choreography (reserved for
the homepage). Existing beats render statically beneath their section headings; new pieces
are self-contained components. Self-contained CSS `app/therapists/therapists.css`
(`.therapists-root` scope; local brand tokens; literal `'Fraunces'`/`'Manrope'`; NO
`var(--font-fraunces)`).

### Section order (the journey)
1. **Header** — gold ✦ + "Samwise" italic wordmark (reuse canonical `.brand`/`.brand-star`),
   wordmark links to `/`. Quiet EN colophon.
2. **Hero** — eyebrow `FOR BEHAVIOURAL CHANGE EXPERTS` + editorial headline + invitation.
   `[[PLACEHOLDER: hero headline — I'll propose 2–3 for sign-off; "We help people change
   behavior…" is sloganeering, must be re-voiced editorially]]`.
3. **Meet Sarah** — anonymized intro: her motivation, the two problems, where she started.
4. **How the process helped Sarah** (SIMPLE — one clean narrative beat, not a 7-step walk).
   The desidentification turn: once she stopped identifying with her problem (the enemy
   reframe, translated mantra), she opened up far more easily and adopted the ritual readily.
   Visual: `PromiseBeat` (the two-changes view) + `DocSpine` (her doc being filled).
5. **Her ritual** — what Sarah's ritual became. Visual: `RitualMechanism`.
6. **Her daily calls** — the three daily agent calls + cadence. Visual: `DailyLoop`.
7. **The arc over time** — multi-session journey; names the therapist's recurring optimization
   work. Visual: `CycleMap`.
8. **Working with Samwise — the collaboration** — the seven steps you commit to; your price,
   pace, language; where you plug in (onboarding / call design / optimization).
9. **The offer** — 50% of AI revenue (25 USD/mo of the 50 USD/mo agent), at your own price/
   pace/language; the availability-goal caveat ("yet to be proven"). From the verbatim block.
10. **Set it up — personalization capture** (the close; FULLY FUNCTIONAL frontend, no backend
    in v1). Three process paths the expert chooses between:
    (a) **Use our template process as-is.**
    (b) **Send us your own process** — describe it / paste a link to their document.
    (c) **Edit our script right here** — write the specific changes they'd make.
    Plus the personalization fields (see "Personalization capture — fields") and the "pick
    your first user" prompt. **Delivery = ON THE SPOT:** on completion, assemble an on-screen
    structured summary + a copy-to-clipboard button (Samuel grabs it live; NO email, NO
    backend). Below it, a quiet hairline gold-dash `/book` link: **"Book a quick 15-minute
    test of adopting Samwise"** (the remote/async path).

## Plan Structure (Directories and files)
```
app/therapists/
├── page.tsx                 # server, thin; real Samwise metadata (reuse canonical OG card)
├── therapists-journey.tsx   # client orchestrator: ordered sections + motion reveals
├── case-data.ts             # Sarah case as a typed object (PII stripped) + case VariablesState
├── seven-steps.tsx          # NEW reusable: the 7-step delivery the therapist commits to (collab/offer use, NOT a case walk)
├── offer-card.tsx           # NEW reusable: ask/offer (verbatim copy)
├── collaboration.tsx        # NEW reusable: where the therapist plugs in (onboarding/call design/optimization)
├── personalization-capture.tsx  # NEW reusable: the 3-path capture + fields; copy-to-clipboard + mailto (no backend)
├── sections/                # thin per-section wrappers (page-local layout only)
│   ├── hero.tsx
│   ├── case-intro.tsx       # "Meet Sarah"
│   ├── how-it-helped.tsx    # SIMPLE desidentification narrative; wraps DocSpine + PromiseBeat
│   ├── the-ritual.tsx       # wraps RitualMechanism
│   ├── the-calls.tsx        # wraps DailyLoop
│   ├── the-arc.tsx          # wraps CycleMap
│   └── close.tsx            # wraps personalization-capture ("set it up + your first user")
└── therapists.css           # .therapists-root scope + the token context the beats need
```
Imports (single source of truth, NOT copied): `@/app/meet/story/doc-spine`,
`/neuro-crossfade`, `/daily-loop`, `/ritual-mechanism`, `/cycle-map`,
`@/app/meet/story/strings` (STORY_STRINGS), `@/app/qualify/components/variables-panel`
(VariablesState type), `@/lib/qualify/strings` (Lang). Plus `@/app/meet/story/story.css` +
the qualify token context (verify the strokes render — see Testing).

## Modifications (in phases and steps)

### Phase 1 — Route scaffold + token context (no content)
- **1.1 `page.tsx`** — thin server; `export const metadata` (real Samwise, no v0 default;
  reuse canonical OG); renders `<TherapistsJourney/>`.
- **1.2 `therapists.css`** — `.therapists-root` scope; redeclare brand tokens AND the
  `--ink`/`--ink-mute`/`--ink-soft`/`--rule`/`--gold` tokens the story SVGs read (mirror
  `.qualify-root`). Literal font stacks. Section padding 120–160px.
- **1.3 `therapists-journey.tsx`** — `"use client"`; lays out the 10 sections; `motion`
  `whileInView` + `useReducedMotion()`; header wordmark links to `/`.
- **Verify:** 200, beats render visibly (not white-on-white), no console errors.

### Phase 2 — Wire beats + build the new reusable components
- **2.1 `case-data.ts`** — Sarah's case `VariablesState` (`behaviour_to_change`,
  `core_motivation`, `problem_duration_self_reported`, `life_stage_context`) + typed
  narrative (PII stripped). Real values from the ritual doc.
- **2.2** the beat-wrapping sections render `<Beat copy={STORY_STRINGS["en"]}
  variables={sarahVars} …/>`. Risk: STORY_STRINGS labels are demo-call voice; if any reads
  wrong for therapists, override via a thin local copy object (same shape), don't edit shared
  strings. Verify in browser.
- **2.3** build `seven-steps.tsx`, `offer-card.tsx`, `collaboration.tsx`,
  `personalization-capture.tsx` as self-contained reusable components (props-driven, no
  page-only coupling) so the future therapist-call can import them.
- **2.4** `personalization-capture.tsx`: the 3-path chooser + the CONFIRMED fields (see
  "Personalization capture — fields"); on complete, assemble a structured plain-text summary
  shown ON SCREEN + a copy-to-clipboard button (delivery is on-the-spot/live — no email, no
  persistence, no samwise-app route). Then a quiet hairline gold-dash `/book` anchor:
  **"Book a quick 15-minute test of adopting Samwise."**
  > Caveat: `/book` is currently the Breakthrough Call picker (against Samuel's calendar). For
  > v1 reuse it as-is with the 15-min-test label; a distinct 15-min therapist slot type is a
  > later follow-up if the duration/copy mismatch matters.

### Phase 3 — Copy pass + sign-off
- Hero headline: propose 2–3 options for sign-off. Offer card uses the verbatim ask/offer.
  Mantra Spanish+gloss (confirm). Translate Sarah's motivation. No invented case behaviour
  beyond the ritual doc.

### Testing phase
- **Local (always):** `npm run dev` in `samwise-landing/`; open `/therapists`.
  - `curl -s -o /dev/null -w "%{http_code}" localhost:3000/therapists` → 200.
  - `preview_console_logs` level error → no motion NaN / missing-CSS warnings.
  - `preview_inspect` a beat SVG stroke → computed `stroke` is an ink/gold token (not
    transparent/white) → token context present.
  - `preview_screenshot` desktop + 375px (mobile-first: no horizontal overflow, beats legible,
    `aspectRatio` intact). Also test as a presentation surface (large viewport, legible from
    a few feet — it's shown in meetings).
  - Reduced-motion: beats degrade to opacity fade.
- **Integration test:** none (static route).
- **README:** n/a.

### After implementation
- Update `context-for-code-agent.md`: add `/therapists` (first-class route; imports story
  beats as shared visuals; new reusable seven-steps/offer/collaboration components intended
  for future therapist-call reuse; English; section order; token-context note; PII rule).
- Mark task DONE in master Vibe doc Projects tab (manual user step — NOT me).

## Open questions — ALL RESOLVED (2026-06-15)
- Capture delivery: ON THE SPOT — on-screen summary + copy-to-clipboard, no email/backend. ✓
- Capture fields: CONFIRMED as proposed (incl. fit-signal per step, current note tools,
  default cadence). ✓
- `/book` link in the close: INCLUDED, framed as "Book a quick 15-minute test of adopting
  Samwise." ✓

The plan is fully specified. Only remaining gate: hero-headline wording (2–3 options proposed
in Phase 3 for sign-off) — does NOT block scaffolding (Phases 1–2).
