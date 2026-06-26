# current-plan.md — `/framework` variant (2026-06-25)

> Neurotic-implementer rules: ask before deducing; nothing below ships until
> signed off. Supersedes the prior `/lekatchila` plan (shipped).

## Task (user 2026-06-25)
A private internal blueprint for Samuel. NOT a public/recruiting surface. The
user wants to **visualize the Onboarding framework in order, as a mind map**,
so he can plan the **automation of each step with multiple AI agents**.

Two jobs the page does:
1. **Hold the whole framework on one scrollable canvas** — phase by phase,
   variable lineage explicit, the new "build the practice" sub-structure
   (agency cycle + escalation ladder + pairing protocol) drawn as its own
   diagram.
2. **Reserve a labeled slot per phase for "the agent that runs this step"** —
   empty today; filled in as Samuel assigns agents. The page becomes the
   working surface for the automation plan.

## Naming + access
- **Route:** `/framework` (proposal — short, self-explanatory, not user-facing).
- **Access:** unindexed (`robots: noindex, nofollow` in metadata). No nav link
  from canonical. Samuel reaches it by typing the URL.
- **Lang:** English only.

## Hard rules (per skill)
- It's a variant. Lives under `app/framework/`. Self-contained. Never touch
  canonical or other variants.
- **Editorial register stays** for visual consistency, but the page is
  MORE diagrammatic than other variants — blueprint, not journey. Allowed:
  hairline grid, monospace for variable names (Manrope tabular nums), gold
  dashed boxes for "agent slot" placeholders, gold connecting lines for
  variable flow.
- Reuse story beats where they fit (`DailyLoop`, `CycleMap`) by importing
  from `app/meet/story/` like `/therapists` and `/lekatchila` do. No fork.
- Brand tokens local in `framework.css`. Literal Fraunces/Manrope stacks
  (per the rejected-list note — `var(--font-fraunces)` resolves empty).
- Mobile-first at 375px (Samuel reads this on phone too). Phase cards
  collapse to single column under 720px; the agency-cycle diagram becomes
  a vertical list under 720px.

## File tree

```
app/framework/
├── page.tsx                  server, thin. Metadata: noindex/nofollow.
├── framework-blueprint.tsx   client orchestrator. Renders the spine of phase
│                             cards + the methodology diagrams + the legend.
│                             motion `whileInView` reveals + useReducedMotion().
├── phase-card.tsx            one card per onboarding phase. Layout:
│                             [num | title | goal] · [vars in → vars out] ·
│                             [spoken-beats summary, collapsible] ·
│                             [AGENT SLOT — dashed gold rectangle, empty]
├── methodology-diagrams.tsx  the new "build the practice" visuals:
│                             - three-beat surrender (3 stacked frase cards)
│                             - agency cycle (4-beat loop drawn as a circle
│                               with arrows; nested escalation ladder of 5
│                               rungs to the right; pairing-protocol bookends
│                               above and below)
├── variable-lineage.tsx      a small static SVG showing which variables flow
│                             where (unsettling_reality → frase 1, mantra →
│                             frase 2, lists → escalator, etc.). Optional —
│                             include if it doesn't clutter; otherwise drop.
├── framework-data.ts         source of truth — the 14 phases with their goal,
│                             vars_in, vars_out, beat_summaries, and an
│                             AGENT_SLOT field (string | null) for the future
│                             agent assignment. Currently all null.
└── framework.css             scoped under .framework-root. Brand tokens,
                              phase-card layout, agent-slot dashed-box,
                              cycle/ladder/pairing SVG styles.
```

## Page structure (top → bottom)

1. **Header** — Fraunces italic *"Framework blueprint"* + Manrope small-caps
   *"Onboarding · 14 phases · 90 min · 1 clinician → N agents"*. Header
   wordmark links to `/`.
2. **Legend** (small, top-right or below header) — what the visual conventions
   mean:
   - solid gold dash = capture moment
   - dashed gold box = AGENT SLOT (empty = unassigned)
   - hairline gold line = variable flow between phases
3. **Phase spine** — Phases 1 → 14 as cards in natural vertical flow. Each
   card has the layout described above. Sub-phases (4a, 7a, 7b, 10a, 12a-d)
   nest visually inside their parent.
4. **The methodology diagrams** — rendered INSIDE Phase 12's card (since
   that's where the new "build the practice" lives). Three diagrams stacked:
   - the three-beat surrender
   - the agency cycle (+ ladder + pairing bookends)
   - the community-witness step pattern
5. **The variable lineage** (if included) — a single static SVG at the
   bottom showing the full variable-flow graph across phases.
6. **Phase 15 — REBOUNDS (collapsed)** — listed as a single card with the 8
   rebounds inside, since they're opt-in, not part of the linear automation.

## What goes in each phase card (source of truth = `framework-data.ts`)

For each phase (built from the v0.3 Onboarding script that's already in
samwise-script-work):
- `num` — phase number (1, 2, … 14)
- `title` — e.g. "Open and reflect"
- `duration_min` — 5
- `goal` — one line
- `vars_in` — variables this phase reads (pre-session or earlier phase)
- `vars_out` — variables this phase captures
- `beat_summaries` — array of one-line summaries of each SAY beat (NOT the
  full SAY text — the card stays scannable)
- `agent_slot` — `null` initially. Future: `{ name, model, prompt_ref, notes }`.
- `subphases` — optional array of the same shape (4a, 7a, 7b, 10a, 12a-d)

## Aesthetic decisions to confirm

- **Phase card width:** 720px max on desktop, full bleed (with 24px gutters)
  on mobile. One card per row, not a 2-col grid (the variable flow lines
  need vertical space).
- **AGENT SLOT placeholder:** dashed gold rectangle (1px dashed `--gold`),
  Manrope small-caps label *"AGENT: unassigned"*, ~60px tall, full card
  width. Click reveals a textarea where Samuel can type the agent assignment
  (saved to localStorage for v1; no backend).
- **Variable flow lines:** off by default (visual noise). Toggle button at
  the top right: *"Show variable flow"* draws hairline gold lines between
  variable mentions across phase cards.
- **The agency cycle diagram:** a 4-beat circular loop (Aprender → Idear →
  Decidir → Intentar → back to Aprender). Each beat is a labeled node;
  arrows between them. The escalation ladder draws as 5 horizontal rungs
  to the right of the cycle (Rung 1 = "just the two lists" → Rung 5 =
  "decisions with real cost"). The pairing protocol shows as two small
  cards above and below the cycle (Before 60s / After 30s).

## Open questions before I write code

1. **Route name** — `/framework` OK, or do you prefer `/blueprint` / `/map` /
   `/plan` / something else?
2. **Variable flow toggle** — worth building, or skip the SVG and just rely
   on `vars_in`/`vars_out` columns on each card?
3. **Agent slot persistence** — localStorage is fine for v1, or do you want
   a Firestore write so the assignments survive across devices?
4. **Include Phase 15 (rebounds)** as a collapsed card, or omit entirely?
   (They're opt-in for the clinician, may not need an agent slot.)
5. **Methodology diagrams** — do you want the three diagrams I described
   (three-beat surrender / agency cycle+ladder+pairing / community-witness
   ladder), or a different visual decomposition?

Answer these and I'll commit the file tree.
