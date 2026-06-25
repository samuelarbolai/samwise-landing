# current-plan.md — `/lekatchila` variant (2026-06-24)

> Neurotic-implementer rules in force: ask before deducing; all copy below is a
> PROPOSAL — needs sign-off before code. Supersedes the prior plan (therapist
> qualification + Part C — Part A/B/C shipped, /therapists journey is live).

## Task (user 2026-06-24)
A Lekatchila organizer reached out about a Samwise variant exclusive to their
couples-counseling program (the Charedi first-year-of-marriage guidance system
at `https://land-page-omega-ruddy.vercel.app/`). Build `/lekatchila` as a
**first-class route mirroring `/therapists` structurally**, with the worked case
being **a madrich+madricha pair applying Samwise with a young couple to solve a
specific marital behaviour**.

**Locked answers (asked-and-answered above):**
1. **Audience:** Lekatchila organizers / leadership (the people deciding whether to adopt the variant).
2. **Behaviour-to-change:** husband withdraws after disagreement → wife reads it as abandonment (matches Lekatchila's own diagnostic frame: abandonment anxiety + projecting parental expectations).
3. **Language:** English-only, like `/therapists`. (Hebrew bilingual is a future task if this becomes a real handoff.)
4. **Scope:** full `/therapists` clone — case + two artifacts + cycle map + collaboration + ask + personalization-capture.

## Why this mirrors `/therapists` so cleanly
- `/therapists` recruits behavioural-change experts by walking through ONE real case (Mara) and showing how their existing process maps onto Samwise's "ritual + call" framework.
- For Lekatchila, the equivalents:
  - `/therapists`'s "behavioural-change expert" ↔ Lekatchila's **madrich/madricha pair** (one per spouse).
  - Mara's "the seven steps" intake ↔ Lekatchila's **first listening + alignment-point sessions**.
  - The daily ritual + the call that runs it ↔ a **daily re-entry micro-practice + an AI follow-up call** that fills the gap between the 5 strategic alignment points.
  - "Where you fit" (Onboarding / Call Design / Optimization) ↔ where Lekatchila's existing surfaces (intake, seminars, alignment points) plug in.

The framework stays constant; only the application (the couple, the inputs, the "with {couple}" text, the daily-call schedule) is new.

## Hard rules (per skill)
- **It's a variant.** Lives under `app/lekatchila/`. Self-contained. Never modify `app/page.tsx` or `app/therapists/*` for this work.
- **Reuse the story beats, never fork them.** Import `DocSpine` / `DailyLoop` / `RitualMechanism` / `CycleMap` + `STORY_STRINGS.en` from `app/meet/story/`, exactly like `/therapists` does. Add `import "@/app/meet/story/story.css"` so SVG strokes resolve.
- **Editorial aesthetic, byte-identical to `/therapists`.** Gallery white + ink + warm-gold accent. Fraunces + Manrope LITERAL stacks. Hairline rules. `.l-cta` gold-dash-collapse pattern. No marketing tropes (the skill's rejected-list).
- **Couple display name is PROPOSED + anonymized.** Charedi-feel placeholder names (Avi & Chaya). User can swap before ship. No surnames.
- **All prospect-facing copy is a proposal pending sign-off** — flagged inline below.
- **Mobile-first** at 375px; no `100vh` (use `dvh` if needed).

## File tree (mirrors `/therapists` 1:1)

```
app/lekatchila/
├── page.tsx                  server, thin. Route metadata only (app-root opengraph-image auto-applies)
├── lekatchila-journey.tsx    client orchestrator — 10 sections in natural flow with motion whileInView reveals
├── case-data.ts              ARTIFACT_TEMPLATES (constant framework, Lekatchila-flavoured)
│                             + COUPLES: Case[] (the Avi & Chaya case as the first/only entry)
├── case-switcher.tsx         hairline chips (only renders when COUPLES.length > 1)
├── artifact-anatomy.tsx      the inputs → components → "with {couple}" three-row card
├── seven-steps.tsx           the 7 steps the madrich/madricha pair commits to
├── offer-card.tsx            the partnership ask (NO money/credit — organizer audience)
├── collaboration.tsx         where Lekatchila plugs into onboarding / call design / optimization
├── personalization-capture.tsx   the on-the-spot capture (organizer-audience fields, no payment)
└── lekatchila.css            scoped under `.lekatchila-root` — local brand tokens
```

**Reused without modification** (imported from elsewhere):
- `@/app/meet/story/{doc-spine,daily-loop,ritual-mechanism,cycle-map}` — the four beats
- `@/app/meet/story/strings` → `STORY_STRINGS.en` (the EN copy keys the beats consume)
- `@/app/meet/story/story.css` (the `:root` tokens the beats' SVGs need)
- `VariablesState` type from `@/app/qualify/components/variables-panel`

**NOT reused** from `/therapists` (variants are self-contained per skill rule):
- We **copy** the shape of `artifact-anatomy.tsx` / `case-switcher.tsx` / `seven-steps.tsx` / `offer-card.tsx` / `collaboration.tsx` / `personalization-capture.tsx` into `app/lekatchila/`, then adapt copy. This is the variant pattern the skill prescribes — no shared variant components.
- `lekatchila.css` is a fresh stylesheet; it can crib token + reveal patterns from `therapists.css` (literal Fraunces/Manrope stacks, gallery white, gold accents, `.l-section`/`.l-h1`/`.l-cta` prefixed classes).

## The case — `AVI_AND_CHAYA` (PROPOSAL, all copy below pending sign-off)

```ts
// case-data.ts (sketched copy — final names + phrasing pending sign-off)

const AVI_AND_CHAYA: Case = {
  id: "avi-chaya",
  name: "Avi & Chaya",                  // PII-stripped, anonymized first names only
  tag: "Withdrawal & chase",
  intro:
    "Three months in, Avi and Chaya found a pattern. After almost every disagreement, Avi went quiet — answering in single words, drifting to his sefer or to bed. Chaya read the silence as the end. By the time he could speak again, she was already running scenarios of being left.",
  motivation:
    "to stay in the room with each other, even when it's hard",
  problems: [
    "Avi withdraws — silence as the safest response, a pattern learned long before the marriage.",
    "Chaya panics at the silence — an old fear of being left, instantly triggered.",
    "The pattern compounds: his withdrawal grows her fear; her chase grows his withdrawal.",
  ],
  vars: {
    behaviour_to_change: "going quiet after a disagreement",   // ≤24 chars goal for the spine label
    core_motivation: "to stay in the room with each other",
    problem_duration_self_reported: "since the wedding (3 months)",
    life_stage_context: "first year, no children yet",
  },
  calls: [
    { name: "Morning Reentry",       time: "7:30am (8:30am fallback)",
      body: "Each spouse names what is unresolved from yesterday; pick one sentence to say first." },
    { name: "Late-afternoon Anchor", time: "5pm",
      body: "Surface anything that tightened since morning; rehearse the re-entry mantra." },
    { name: "Night Seal",            time: "10pm (11pm fallback)",
      body: "Close the day — one thing held, one thing forgiven, one thing chosen for tomorrow." },
  ],
  ritual: {
    couple:
      "Avi named the silence (\"the wall I learned\") and built protection: a 90-second pause + a single spoken sentence — \"I need a minute, I'm coming back\" — instead of disappearing. Chaya named the panic (\"the running\") and built her own: four breaths and one written line before she follows him out of the room.",
    quote: "The silence is an enemy I learned in childhood — it is not my marriage.",
  },
  call: {
    couple:
      "Their ritual runs on three short calls a day, paced for the first year of marriage — designed by their madrich+madricha pair, run by the agent between alignment points:",
  },
}
```

**Note on the field name:** I renamed `CaseApplication.mara` → `.couple` in this file's copy of `case-data.ts` (the `/therapists` file used `.mara` for the worked subject; here the subject is the couple). The shape is otherwise identical.

## The framework — `ARTIFACT_TEMPLATES` (Lekatchila-flavoured)

Same TWO artifacts as `/therapists`: **the ritual** + **the call that runs it**. The components stay the same five (ritual) / four (call) — that's the framework. The INPUTS get a small Lekatchila reframe so they describe what the madrich/madricha pair already gathers in the existing intake + alignment-point work.

```ts
ARTIFACT_TEMPLATES = [
  {
    key: "ritual",
    label: "What you build · 1",
    title: "The ritual",
    blurb:
      "The daily practice the couple lives. Your madrich+madricha pair produces the raw material in your existing intake and alignment-point sessions; we assemble it into a ritual they can keep.",
    inputsLead: "What you gather (your existing listening work yields these)",
    inputs: [
      "The pattern, functionally analyzed — one concrete moment from this week, grounded.",
      "Each spouse's role in it — the withdrawal AND the chase — desidentified, named.",
      "Its origin — for each spouse, what they learned before the marriage.",
      "The triggers that feed it.",
      "The current belief each spouse holds about the other in the moment.",
    ],
    componentsLead: "What the ritual is built into",
    components: [
      "Mantras — what each spouse says, including to themselves.",
      "Protection — what each spouse does to stop the pattern now.",
      "A new belief system — what each spouse does to shift thoughts and feelings over time.",
      "A schedule — re-entry windows, with fallbacks.",
      "Accountability — your madrich+madricha pair, and each other.",
    ],
    beats: ["mechanism", "doc"],
  },
  {
    key: "call",
    label: "What you build · 2",
    title: "The call that runs it",
    blurb:
      "The daily call that carries the couple into the ritual, so keeping it never rests on memory. You gather its inputs in the call-design session (your seminar pattern); we write the call.",
    inputsLead: "What you gather (the call-design session)",
    inputs: [
      "A symbol — what they anchor to (often something from their wedding, a niggun, a posuk).",
      "Consciousness — what they hold gratitude or awareness for, together.",
      "Their intentions — for this week, for the marriage.",
      "A pact — a small, concrete commitment they can both keep.",
      "Their company — who is with them (the madrich pair, and each other).",
    ],
    componentsLead: "What the call is built into (its four parts)",
    components: ["The Stop.", "The Consciousness.", "The Intention.", "The Commitment."],
    beats: ["loop"],
    showCalls: true,
  },
]
```

## Hero, journey, copy (PROPOSAL — pending sign-off)

```tsx
// lekatchila-journey.tsx structure (sections in order):

// Header (same star + wordmark as /therapists)

// 2 — Hero
eyebrow:  "For Lekatchila"
h1:       "The first year, made daily."        // or "Your madrichim, kept daily."
lede:     "Your madrich+madricha pair does the listening you already do. Samwise turns each couple's first-year work into a daily ritual and a call that keeps it — so the calm survives the week, not just the alignment-point meeting."

// 3 — Case switcher + first presentation (behaviour-forward)
eyebrow:  "A real case"
heading:  "Meet Avi & Chaya."
body:     [c.intro]
quote:    [c.motivation]
list:     [c.problems]

// 4 — Overview
eyebrow:  "How it's built"
heading:  "From your sessions, two things get built."
body:     "Everything you gather becomes a ritual the couple lives — and the daily call that runs it. Here is exactly what goes into each, and what each is made of, with Avi & Chaya as the worked example."

// 5/6 — Two artifacts (ArtifactAnatomy ×2, with beats attached per template — same renderBeat switch as /therapists)

// 7 — Over time
eyebrow:  "Over time"
heading:  "Then you keep sharpening it."
body:     "Neither artifact is final. Each alignment-point session is where you rewrite the part that stopped holding — the ritual, or the call."
beat:     <CycleMap>

// 8 — Collaboration (Onboarding / Call Design / Optimization)
eyebrow:  "Working together"
heading:  "Where you fit."

// 9 — The offer (partnership ask, NO money)
eyebrow:  "The partnership"
heading:  "Your model. Our engine."

// 10 — Close: personalization capture
eyebrow:  "Set it up"
heading:  "Sketch the variant, and pick your first couples."
```

## Seven steps (PROPOSAL — for `seven-steps.tsx`)
The seven steps Samwise asks the madrich+madricha pair to run. Designed to slot into Lekatchila's existing intake and seminar pattern, not replace it.

1. **Listen** to each spouse's story in your existing format. (Lekatchila Pillar 2 — already canonical.)
2. **Map the pattern** with both names — withdrawal AND chase — and what each fears.
3. **Name the enemies** — one per spouse, with both spouses present.
4. **Design the daily ritual** — mantras, protection, new belief, schedule, accountability.
5. **Design the call** with the couple — symbol · consciousness · intentions · pact · company — in their voice, their language.
6. **Adapt the script** — Hebrew, Yiddish, register, niggun if it belongs.
7. **Run with the AI follow-up agent** between alignment points; review what held and what didn't at the next one.

## Collaboration (`collaboration.tsx`)
Three plug-points, mirroring the `/therapists` shape:
- **Onboarding** — your intake conversation (the madrich+madricha pair's first listening) captures the inputs.
- **Call Design** — your alignment-point seminar becomes the call-design surface.
- **Optimization** — your existing 5-points-a-year cadence becomes the optimization loop. The AI follow-up agent fills the gap between points.

## The offer / partnership ask (`offer-card.tsx`)
Reframed from `/therapists`' $25-of-$50 split (peer-recruit register) → an **organizer partnership** register. No money is in this card; money is a separate conversation. PROPOSAL:

> **What we'd build for Lekatchila.** A Samwise variant tuned to your model — your madrichim's voice, your alignment-point cadence, your language(s), no English defaults. The technical and AI cost is ours.
>
> **What we'd ask of Lekatchila.** A pilot with 5 couples through their first year. 30 minutes after each agent call, the next morning, so we can sharpen. Honest signal — when something doesn't fit, you tell us. Permission to learn from what you've already built.
>
> **Yet to be proven.** This variant has not run yet. The framework runs with non-Charedi clinicians today; the Charedi-couples adaptation is what we'd build together.

## Personalization capture (`personalization-capture.tsx`) — organizer-audience fields
Fields tuned to what an organizer can answer in the room, NOT what a clinician would fill. Removes the price + revenue-model fields; adds cohort/language/seminar fields. **No backend** — same client-only assemble-to-clipboard pattern as `/therapists`.

Fields (PROPOSAL):
- Your name (the organizer)
- Region / community
- Languages your madrichim work in (HE / EN / YI / multiselect)
- Couple cohort size today + projected
- For each of the 7 steps, a fit signal (1–5) — does this match how your madrichim already work?
- Names (first-name-only) of the first 5 couples you'd pilot with
- Note-taking tools your madrichim use today
- Madrich+madricha pair coverage cadence today
- "Anything that doesn't fit yet" — free text
- (No payment, no revenue-share)

CTA below the assemble button — quiet link "Book a follow-up sync with Samuel." **`bookHref` proposal: `"/therapists/book"`** (reuses the existing 15-min `therapist` meeting type; the copy on the booking page is English-neutral and works for an organizer call). If the user wants a distinct meeting type, that's a small addition on samwise-app's `lib/book/meeting-types.ts` and a `lekatchila` `?type=` value — flagged for the user.

## CSS (`lekatchila.css`)
Brand tokens redeclared local-to-route (matches `/therapists` convention):
```css
.lekatchila-root {
  --bg: #ffffff;
  --ink: #000000;
  --ink-soft: #1a1a1a;
  --ink-mute: #555555;
  --rule: #e0e0e0;
  --gold: #d4a85a;
  --accent: #1f3023;        /* forest */
  font-family: 'Fraunces', Georgia, serif;
  background: var(--bg);
  color: var(--ink);
}

/* Eyebrow / hero / sections / artifact cards / cta / capture — copied from
   therapists.css, prefixed .l-* instead of .t-*, same proportions. */
```

Reveal pattern is identical: `motion.section` with `initial={{ opacity:0, y:16 }}` / `whileInView={{ opacity:1, y:0 }}` / `viewport={{ once:true, amount:0.25 }}` / honors `useReducedMotion`.

## Metadata (`page.tsx`)
```ts
export const metadata: Metadata = {
  title: "Samwise for Lekatchila — a variant exclusive to your madrichim",
  description:
    "A Samwise variant for Lekatchila — built so each couple's first-year work survives the gap between alignment points.",
  openGraph: {
    title: "Samwise for Lekatchila",
    description:
      "A Samwise variant for Lekatchila — built so each couple's first-year work survives the gap between alignment points.",
  },
}
```
(App-root `opengraph-image.tsx` auto-applies the canonical brand-mark card. No new OG file.)

## Verification before claiming done
- Visit `/lekatchila` at 1280 / 720 / 375 viewports — no horizontal overflow at 375.
- The four story beats render with strokes resolving to gold/ink (NOT white-on-white) — `story.css` import is in place.
- Reveals run on scroll; `prefers-reduced-motion` reduces to plain opacity.
- Personalization-capture's "Assemble" produces a plain-text summary in clipboard; "Book a follow-up sync with Samuel" links correctly.
- Curl `/lekatchila` → 200; no console errors.
- The page does NOT change anything on `/`, `/therapists`, `/qualify`, or `/meet` (variant rule).

## After approval — build order
1. `app/lekatchila/page.tsx` (server, thin) + `lekatchila.css` skeleton.
2. `case-data.ts` (template + Avi & Chaya).
3. `artifact-anatomy.tsx` + `case-switcher.tsx` (copy from `/therapists`, adapt class prefix + field name `.mara` → `.couple`).
4. `seven-steps.tsx` + `collaboration.tsx` + `offer-card.tsx`.
5. `personalization-capture.tsx` (drop price/revenue fields, add cohort/language/seminar).
6. `lekatchila-journey.tsx` — wire everything in the section order above; verify motion + reduced-motion paths.
7. In-browser verify per the checklist.
8. Hand back to user. Do not mark DONE in master Vibe doc — that's user's manual step.

## Open questions before I write code
1. **Couple names** — Avi & Chaya OK as placeholders? Or pick two from a real (PII-stripped) couple if Lekatchila has shared one?
2. **The behaviour specifics** — the case copy (silence/withdrawal/panic/chase) is my best read on Lekatchila's own diagnostic language. Anything to add (a niggun reference, a specific Shabbos-letdown moment, the kollel-schedule angle) or remove (too presumptuous on Charedi-life detail)?
3. **The mantra** — *"The silence is an enemy I learned in childhood — it is not my marriage."* is my proposal for the desidentification line. Fits Lekatchila's "abandonment anxiety + parental projection" frame. Sign off or replace.
4. **Hero h1** — *"The first year, made daily."* or *"Your madrichim, kept daily."* — which (or a third)?
5. **CTA at the close** — reuse `/therapists/book` (the existing 15-min meeting type, English-neutral copy works) OR a new `lekatchila` meeting type on samwise-app? Reuse is faster (1 line); new is cleaner (event title + email copy say "Lekatchila variant sync").
6. **Lekatchila brand on the page** — do we want their name in the hero / footer (e.g. "Samwise × Lekatchila — a variant for the first year of marriage"), or keep the page Samwise-branded only and let the URL + organizer's prior context carry the association?

Once you sign off on these I'll write the files.
