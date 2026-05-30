# current-plan.md — The Ritual Story (in-call visual that lets Samuel speak less)

> **Supersedes** the prior `/book` device-timezone plan + the Demo
> Call Phase 17 live-referral companion. Both are recoverable from git
> (HEAD at write time = commit `4513d94`). **Confirm those shipped
> before relying on this file** — if either is unshipped, pull it back
> from git history; it is not lost.

---

## Plan Summary

**The problem (Samuel's words):** "I need to find a way for me to
speak less in the demo call. The roadmap-to-solution part and all the
explanation of the service is too fucking long."

**The fix:** offload the long Phase 9 monologue onto an on-screen
**story** that unfolds in the prospect's own notes column — the same
column where they're already watching their words get captured live.
Samuel clicks through it scene by scene and says *one line per scene*
instead of narrating the whole roadmap.

This is the locked direction **1 + 2 + 4** (live cycle map, broadcast
to the prospect's screen · personalized with their own captured data ·
cut the long SAY blocks to one-liners) **+ Visual B** (the
neuroprogramming phase-out/phase-in crossfade). Reveal-as-dialogue (#3)
is the *tonal* layer, deferred until the visual exists and feels right.

**The through-line is the Ritual Doc.** Per Samuel: the cycle must be
"much more emphasized on the ritual object," "focused on the output of
each phase," and the prospect "should include this document from the
beginning… see all this as a story, and have expectation on what is
next." So the doc isn't a step in the cycle — it's the **spine** the
whole cycle writes into and reads from.

| Side | Repo | What changes |
|---|---|---|
| **Rep** | `samwise-app` | `lib/demo-call/broadcast.ts` gains a `publishVisual(stage)` method + a `StoryStage` type, riding the existing `demo-call:*` DataChannel. `WalkInShell.tsx` gains a small `<StoryControl>` (4 buttons: Doc · Cycle · Neuro · Clear) that broadcasts the current stage. |
| **Prospect** | `samwise-landing` | New `app/meet/story/` components render BELOW `<VariablesPanel>` in the existing `.demo-call-room-notes` aside — continuing the notes "like a story." `call-room.tsx` listens for the new `demo-call:show_visual` event and crossfades between scenes. |
| **Script** | Demo Call Doc + prep doc | **Phase 4, gated** — once the visual is built and approved, cut Phase 9's three long SAY monologues to one-liners that point at the screen, and sweep `before_the_call.md`. |

**Personalization is free.** The prospect side already holds the
broadcast `variables` (their `behaviour_to_change`, `core_motivation`,
…) from the existing `demo-call:variable_update` events. The story
components read that same state — so the new `show_visual` event only
needs to carry the *stage*, not re-send any data. Minimal event,
maximal reuse.

**Design horizon, NOT a v1 constraint (Samuel's words):** "the end
goal… is that perhaps this UI is integrated into the document somehow.
Or perhaps gets exported into it. I tell you this only as design
considerations, but not as current technical considerations, so don't
overengineer this." → v1 builds none of that. No doc integration, no
export. The visual is a self-contained in-call surface.

---

## The Story (design spec — the centerpiece)

The prospect's notes column today shows `<VariablesPanel>`: their own
words, as Fraunces-italic quote cards, captured live. The story
**continues that same column downward**, in the same register (gallery
white, Fraunces italic, Manrope small-caps labels, single gold
hairline). Three scenes, advanced by Samuel:

### Scene 1 — The Ritual Doc (the spine)

Introduce the artifact before the cycle. A single document holds
everything. Rendered as a tall "page" card with its three real
sections named down the side:

- **Problem & Solution**  ·  **The Ritual Call**  ·  **Metadata**

The prospect's already-captured words (their `behaviour_to_change`,
their `core_motivation`) are shown *slotting into* the "Problem &
Solution" section — the visual proof that "your words above become the
first page." Copy sets the expectation: *this page is yours, it holds
the whole ritual, and everything we do from here writes into it.*

> Output emphasis: the scene's payload is **the doc itself** — the
> object the rest of the story revolves around.

### Scene 2 — The cycle (six steps, the doc at the center)

Six steps, **each headlined by its OUTPUT into the doc**, not by the
activity. The Ritual Doc card is pinned at the top as the spine; the
steps flow down the column as a numbered story and the loop arcs back
to the doc (`↻`). Steps 01–02 *write* pages into the doc; 03–06 *read
from and refine* it.

| # | Step | **Output (the headline)** | One-line body |
|---|---|---|---|
| 01 | Map & create your ritual | **→ the Problem & Solution page** | We turn your words into a ritual: the activity, the time, the fallback, the people who hold you to it. |
| 02 | Design your call | **→ the Ritual Call page** | We write the four-part call that runs your ritual — the Stop, the Consciousness, the Intention, the Commitment. |
| 03 | Live your first call | **→ a real run** | You live it once. We watch what holds and what slips. |
| 04 | Optimize | **→ a sharper page** | We rewrite the part that didn't hold — the ritual, or the call. |
| 05 | Live the next call | **→ the sharper run** | You live the better version. |
| 06 | Repeat | **↻ back to the page** | Each loop the document gets truer to you — and the old pattern gets quieter. |

> Why a vertical column and not a radial diagram: the notes column is
> narrow and mobile-first, and Samuel asked the visual to "continue the
> notes… like a story." A downward story-flow with the doc pinned as
> origin emphasizes the doc-as-spine and survives 375px. A radial
> "orbit" layout is a candidate for the later tonal pass (#3), not v1.

The four-part **Ritual Call** in step 02 is taken verbatim from the
Ritual Template Doc (the Stop / the Consciousness / the Intention / the
Commitment). **See open flag #1** — the Demo script's "Paso 2" narrates
*six* daily-call moments; the doc spine has *four* parts. The visual
uses the doc's four. Samuel to confirm the script collapses to four.

### Scene 3 — The neuroprogramming crossfade (Visual B)

The "phase one out, phase the other in" mechanism, as two curves over a
row of call-dots (call 1, 2, 3, …): the **old-pattern** curve descends,
the **ritual** curve rises, and they cross. The descending curve is
labeled with the prospect's own `behaviour_to_change` when present
(else a neutral "the old pattern"); the rising curve is labeled "your
ritual."

> ⚠️ **Open flag #3 — copy needs Samuel's sign-off (Rule 8).** The plan
> ships a *draft* body line for this scene. I will not bake an invented
> neuroscience mechanism claim into prospect-facing copy. The draft
> stays behavioural ("each time you live the ritual instead of the old
> pattern, that path gets stronger and the other gets quieter") and is
> flagged inline for Samuel to approve, replace, or soften.

### Register & motion (all three scenes)

- Tokens reused verbatim from `call.css`: `--bg #FFFFFF`, `--ink
  #000000`, `--ink-soft #1A1A1A`, `--ink-mute #555555`, `--rule
  #E0E0E0`, `--gold #D4A85A`. Literal `'Fraunces'` / `'Manrope'` stacks
  (no `--font-*` — that var doesn't exist here, per the running
  rejected-list).
- Scene-to-scene transitions: `AnimatePresence` crossfade (opacity +
  small `y`), matching the existing `demo-notes-fade-in` feel.
- Within a scene: cards stagger in on mount; the neuro curves draw in
  via SVG `pathLength`.
- `useReducedMotion()` from `motion/react` → static fallbacks
  everywhere (no draw-in, no stagger), mirroring the
  `@media (prefers-reduced-motion: reduce)` block already in `call.css`.
- Mobile-first: the story sits in the same single column as the notes
  on <900px; no horizontal overflow; `dvh` already handled by the
  parent `.demo-call-room`.

---

## Plan Architecture (Flow)

```
REP (samwise-app, WalkInShell)                 PROSPECT (samwise-landing, MeetCallRoom)
──────────────────────────────                 ────────────────────────────────────────
handleRoomReady(room)                           (already) onDataMessage receives
  → broadcasterRef = createVariableBroadcaster   demo-call:variable_update
                                                  → setVariables({...})   → <VariablesPanel>

Samuel clicks <StoryControl> "2 · Cycle"
  → broadcasterRef.current.publishVisual("cycle")
      → room.localParticipant.publishData(
          {type:"demo-call:show_visual", stage:"cycle"}, {reliable:true})
                          ───────────  DataChannel  ───────────▶
                                                  onDataMessage receives
                                                  demo-call:show_visual
                                                  → setStoryStage("cycle")
                                                  → <RitualStory stage="cycle"
                                                       variables={variables} />
                                                     renders BELOW <VariablesPanel>,
                                                     reading the already-captured vars
```

Two event types now share the one DataChannel, distinguished by
`type`: `demo-call:variable_update` (existing) and
`demo-call:show_visual` (new). No new transport, no new room, no
server changes.

---

## Plan Structure (Directories and files)

```
samwise-app/
├── lib/demo-call/broadcast.ts          # EDIT — add StoryStage + publishVisual()
└── components/walk-in/WalkInShell.tsx   # EDIT — mount <StoryControl>, track roomReady
    └── (new) app/copilot/story-control.tsx  # NEW — rep's 4-button broadcaster panel

samwise-landing/
├── app/meet/call-room.tsx              # EDIT — listen for show_visual, render <RitualStory>
└── app/meet/story/                     # NEW folder
    ├── ritual-story.tsx                #   container; AnimatePresence stage switch; StoryStage type
    ├── doc-spine.tsx                   #   Scene 1
    ├── cycle-map.tsx                   #   Scene 2
    ├── neuro-crossfade.tsx             #   Scene 3
    ├── strings.ts                      #   bilingual EN/ES copy for all three scenes
    └── story.css                       #   .ritual-story-* classes (imported by ritual-story.tsx)

Demo Call Doc (id 1sBHuGaXCFaP8cmQdUgNpoQYwCq3L4-OfDMDoPR73a5g)  # Phase 4 — Phase 9 SAY cut
before_the_call.md (id 14ZNKJu-g7MqWrVE6akZWLz3fBTI-6Atnt6TvZYR-V30)  # Phase 4 — propagation sweep
```

---

## Modifications (in phases and steps)

### Phase 1 / Step 1 — Add the `show_visual` event to the broadcaster

- **In-file location:** `samwise-app/lib/demo-call/broadcast.ts`.
- **Should not be modified:** the existing `diffAndPublish` method, the
  `createVariableBroadcaster` signature, the `VariableBroadcaster`
  interface's existing member.
- **Code (full new file):**
  ```ts
  "use client"

  import type { Room } from "livekit-client"
  import type { DemoCallVariable } from "@/app/copilot/demo-call-config"

  // The story stages Samuel can broadcast to the prospect's screen.
  // "hidden" clears the visual; the other three map 1:1 to the three
  // scenes of the Ritual Story (doc spine → cycle → neuro crossfade).
  // Kept here next to the publisher; the landing side declares its own
  // copy of this union (cross-repo dup, same as VideoCallExperience).
  export type StoryStage = "hidden" | "doc" | "cycle" | "neuro"

  // Publishes two kinds of data events over the LiveKit DataChannel:
  //   - demo-call:variable_update — a userVisible variable's cleaned
  //     value changed (existing; mirrors /qualify's shape).
  //   - demo-call:show_visual — Samuel advanced the in-call story to a
  //     new stage (new). Carries only the stage; the prospect side
  //     already holds the captured variables from the update events.
  export interface VariableBroadcaster {
    diffAndPublish: (
      prevCleaned: Record<string, string>,
      nextCleaned: Record<string, string>,
      variables: DemoCallVariable[],
    ) => void
    publishVisual: (stage: StoryStage) => void
  }

  export function createVariableBroadcaster(room: Room): VariableBroadcaster {
    const encoder = new TextEncoder()
    return {
      diffAndPublish(prev, next, variables) {
        for (const v of variables) {
          if (!v.userVisible) continue
          const before = prev[v.name] ?? ""
          const after = next[v.name] ?? ""
          if (before === after) continue
          const payload = encoder.encode(
            JSON.stringify({
              type: "demo-call:variable_update",
              name: v.name,
              value: after,
            }),
          )
          // Reliable transport — order is important for the user's
          // "watching their notes get rewritten" experience.
          void room.localParticipant.publishData(payload, { reliable: true })
        }
      },
      publishVisual(stage) {
        const payload = encoder.encode(
          JSON.stringify({ type: "demo-call:show_visual", stage }),
        )
        // Reliable + ordered: the prospect must never see a stale stage
        // after Samuel advances. Same transport flags as the variables.
        void room.localParticipant.publishData(payload, { reliable: true })
      },
    }
  }
  ```
- **Explanation:** One new method, one new type. The publisher already
  owns the `room` and an encoder; `publishVisual` is the same
  `publishData` pattern with a different payload `type`. Nothing about
  the existing variable broadcasting changes.

### Phase 2 / Step 1 — `<StoryControl>` (rep's broadcast panel)

- **In-file location:** new file `samwise-app/app/copilot/story-control.tsx`.
- **Should not be modified:** n/a (new file).
- **Code:**
  ```tsx
  "use client"

  import { useState } from "react"
  import type { StoryStage } from "@/lib/demo-call/broadcast"

  // Samuel's in-call control for the Ritual Story shown on the
  // prospect's screen. Four buttons; clicking publishes the stage over
  // the DataChannel. Local state tracks what the prospect is currently
  // seeing so the active stage is highlighted. Disabled until the
  // LiveKit room is ready (publish would no-op before then).
  const STAGES: { stage: StoryStage; label: string }[] = [
    { stage: "doc", label: "1 · The Doc" },
    { stage: "cycle", label: "2 · The Cycle" },
    { stage: "neuro", label: "3 · The Neuro" },
  ]

  export function StoryControl({
    ready,
    onPublish,
  }: {
    ready: boolean
    onPublish: (stage: StoryStage) => void
  }) {
    const [active, setActive] = useState<StoryStage>("hidden")

    function go(stage: StoryStage) {
      onPublish(stage)
      setActive(stage)
    }

    return (
      <div className="flex flex-col gap-2 border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Story on prospect's screen
          </span>
          {active !== "hidden" && (
            <button
              type="button"
              onClick={() => go("hidden")}
              disabled={!ready}
              className="text-xs text-muted-foreground underline disabled:opacity-40"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGES.map(({ stage, label }) => (
            <button
              key={stage}
              type="button"
              onClick={() => go(stage)}
              disabled={!ready}
              aria-pressed={active === stage}
              className={
                "rounded-md border px-3 py-1.5 text-sm transition disabled:opacity-40 " +
                (active === stage
                  ? "border-foreground bg-foreground text-background"
                  : "border-input hover:bg-muted")
              }
            >
              {label}
            </button>
          ))}
        </div>
        {!ready && (
          <span className="text-xs text-muted-foreground">
            Waiting for the call to connect…
          </span>
        )}
      </div>
    )
  }
  ```
- **Explanation:** Pure presentational control. It does not touch the
  `room` directly — it calls an `onPublish` callback the shell wires to
  `broadcasterRef.current.publishVisual`. `ready` gates the buttons
  until the room connects. Tailwind utility classes match the existing
  rep-surface chrome (the `QualifyPrefillRow` row uses the same
  `border-b bg-muted/30 p-4` block).

### Phase 2 / Step 2 — Wire `<StoryControl>` into `WalkInShell`

- **In-file location:** `samwise-app/components/walk-in/WalkInShell.tsx`.
- **Should not be modified:** the init `useEffect`, the `setState`
  wrapper + `diffAndPublish` logic, the `loadQualification` /
  `prefillFromQualification` flow, the error/loading early returns, the
  3-column grid template, the `<VideoCallExperience>` /
  `<VariablesTable>` / `<ScriptPane>` props.
- **Code (the three edits):**

  **(a)** add an import alongside the existing ones:
  ```tsx
  import { StoryControl } from "@/app/copilot/story-control"
  ```

  **(b)** add a `roomReady` state flag and set it in `handleRoomReady`:
  ```tsx
  // near the other useState calls (after broadcasterRef):
  const [roomReady, setRoomReady] = useState(false)

  // replace the existing handleRoomReady:
  const handleRoomReady = (room: Room) => {
    broadcasterRef.current = createVariableBroadcaster(room)
    setRoomReady(true)
  }
  ```

  **(c)** mount `<StoryControl>` at the top of the middle column,
  above the `QualifyPrefillRow` block:
  ```tsx
  <section className="overflow-auto border-r">
    <StoryControl
      ready={roomReady}
      onPublish={(stage) => broadcasterRef.current?.publishVisual(stage)}
    />
    {/* Manual qualification-load fallback — always available. … */}
    <div className="border-b bg-muted/30 p-4">
      <QualifyPrefillRow
        script={script}
        setState={setState}
        initialIdentifier={init.booking.prospect.email}
      />
    </div>
    <VariablesTable
      variables={DEMO_CALL_VARIABLES}
      state={state}
      setState={setState}
      docUrl={DEFAULT_DEMO_SCRIPT_DOC_URL}
      script={script}
    />
  </section>
  ```
- **Explanation:** The `onPublish` callback reads `broadcasterRef.current`
  at click time (null-safe), so no re-render plumbing is needed; the
  `roomReady` flag just disables the buttons until the broadcaster
  exists. Placing it at the top of the column Samuel already watches
  (variables + prefill) keeps it in his eyeline during the call.

### Phase 3 / Step 1 — Story copy (`strings.ts`)

- **In-file location:** new file `samwise-landing/app/meet/story/strings.ts`.
- **Code:**
  ```ts
  import type { Lang } from "@/lib/qualify/strings"

  export interface CycleStep {
    n: string
    head: string
    out: string
    body: string
  }

  export interface StoryCopy {
    doc_kicker: string
    doc_title: string
    doc_body: string
    doc_sections: [string, string, string]
    doc_slot_note: string

    cycle_kicker: string
    cycle_title: string
    cycle_doc_label: string
    cycle_steps: CycleStep[]

    neuro_kicker: string
    neuro_title: string
    neuro_body: string // ⚠️ DRAFT — see open flag #3, needs sign-off
    neuro_curve_old: string
    neuro_curve_new: string
    neuro_axis: string
  }

  export const STORY_STRINGS: Record<Lang, StoryCopy> = {
    en: {
      doc_kicker: "Your Ritual",
      doc_title: "One document holds all of it.",
      doc_body:
        "Everything we build lives on one page — your ritual, the call that runs it, and how it sharpens over time. It's yours, and it travels with you.",
      doc_sections: ["Problem & Solution", "The Ritual Call", "Metadata"],
      doc_slot_note: "Your words above become the first page.",

      cycle_kicker: "How it works",
      cycle_title: "Six steps. One loop. The document at the center.",
      cycle_doc_label: "Your Ritual Document",
      cycle_steps: [
        {
          n: "01",
          head: "Map & create your ritual",
          out: "→ the Problem & Solution page",
          body: "We turn your words into a ritual: the activity, the time, the fallback, the people who hold you to it.",
        },
        {
          n: "02",
          head: "Design your call",
          out: "→ the Ritual Call page",
          body: "We write the four-part call that runs your ritual — the Stop, the Consciousness, the Intention, the Commitment.",
        },
        {
          n: "03",
          head: "Live your first call",
          out: "→ a real run",
          body: "You live it once. We watch what holds and what slips.",
        },
        {
          n: "04",
          head: "Optimize",
          out: "→ a sharper page",
          body: "We rewrite the part that didn't hold — the ritual, or the call.",
        },
        {
          n: "05",
          head: "Live the next call",
          out: "→ the sharper run",
          body: "You live the better version.",
        },
        {
          n: "06",
          head: "Repeat",
          out: "↻ back to the page",
          body: "Each loop the document gets truer to you — and the old pattern gets quieter.",
        },
      ],

      neuro_kicker: "What's happening underneath",
      neuro_title: "We phase one out as we phase the other in.",
      // ⚠️ DRAFT — behavioural framing, no clinical claim. Needs sign-off.
      neuro_body:
        "Each time you live the ritual instead of the old pattern, that path gets stronger and the other gets quieter. We don't erase anything overnight — we trade one for the other, call by call.",
      neuro_curve_old: "the old pattern",
      neuro_curve_new: "your ritual",
      neuro_axis: "call by call",
    },
    es: {
      doc_kicker: "Tu Ritual",
      doc_title: "Un solo documento lo contiene todo.",
      doc_body:
        "Todo lo que construimos vive en una página — tu ritual, la llamada que lo activa, y cómo se va afinando con el tiempo. Es tuyo, y va con vos.",
      doc_sections: ["Problema y Solución", "La Llamada del Ritual", "Metadata"],
      doc_slot_note: "Tus palabras de arriba se vuelven la primera página.",

      cycle_kicker: "Cómo funciona",
      cycle_title: "Seis pasos. Un ciclo. El documento en el centro.",
      cycle_doc_label: "Tu Documento del Ritual",
      cycle_steps: [
        {
          n: "01",
          head: "Mapear y crear tu ritual",
          out: "→ la página de Problema y Solución",
          body: "Convertimos tus palabras en un ritual: la actividad, la hora, el plan B, y las personas que te sostienen.",
        },
        {
          n: "02",
          head: "Diseñar tu llamada",
          out: "→ la página de la Llamada del Ritual",
          body: "Escribimos la llamada de cuatro partes que activa tu ritual — el Alto, la Consciencia, la Intención, el Compromiso.",
        },
        {
          n: "03",
          head: "Vivir tu primera llamada",
          out: "→ una ronda real",
          body: "La vivís una vez. Vemos qué sostiene y qué se afloja.",
        },
        {
          n: "04",
          head: "Optimizar",
          out: "→ una página más afilada",
          body: "Reescribimos la parte que no sostuvo — el ritual, o la llamada.",
        },
        {
          n: "05",
          head: "Vivir la siguiente llamada",
          out: "→ la ronda afilada",
          body: "Vivís la versión mejor.",
        },
        {
          n: "06",
          head: "Repetir",
          out: "↻ de vuelta a la página",
          body: "Cada vuelta el documento se vuelve más fiel a vos — y el viejo patrón se hace más callado.",
        },
      ],

      neuro_kicker: "Lo que pasa por debajo",
      neuro_title: "Vamos sacando uno mientras metemos el otro.",
      // ⚠️ DRAFT — marco conductual, sin afirmación clínica. Requiere visto bueno.
      neuro_body:
        "Cada vez que vivís el ritual en lugar del viejo patrón, ese camino se hace más fuerte y el otro más callado. No borramos nada de un día para otro — cambiamos uno por el otro, llamada por llamada.",
      neuro_curve_old: "el viejo patrón",
      neuro_curve_new: "tu ritual",
      neuro_axis: "llamada por llamada",
    },
  }
  ```
- **Explanation:** All prospect-facing copy in one place, bilingual,
  voseo for ES (consistent with the rest of the demo scripts). Rule 7
  honoured: no "paciente" / "comportamiento autodestructivo" /
  "recaída" / "terapia". The `neuro_body` line is the one flagged for
  Samuel's sign-off (open flag #3).

### Phase 3 / Step 2 — `ritual-story.tsx` (container + stage type)

- **In-file location:** new file `samwise-landing/app/meet/story/ritual-story.tsx`.
- **Code:**
  ```tsx
  "use client"

  import { AnimatePresence, motion, useReducedMotion } from "motion/react"
  import type { Lang } from "@/lib/qualify/strings"
  import type { VariablesState } from "@/app/qualify/components/variables-panel"
  import { STORY_STRINGS } from "./strings"
  import { DocSpine } from "./doc-spine"
  import { CycleMap } from "./cycle-map"
  import { NeuroCrossfade } from "./neuro-crossfade"
  import "./story.css"

  // Mirror of samwise-app's StoryStage (cross-repo dup, like
  // VideoCallExperience's init type). Kept in sync by hand.
  export type StoryStage = "hidden" | "doc" | "cycle" | "neuro"

  export function RitualStory({
    lang,
    stage,
    variables,
  }: {
    lang: Lang
    stage: StoryStage
    variables: VariablesState
  }) {
    const reduced = useReducedMotion()
    const copy = STORY_STRINGS[lang]

    const scene =
      stage === "doc" ? (
        <DocSpine copy={copy} variables={variables} reduced={!!reduced} />
      ) : stage === "cycle" ? (
        <CycleMap copy={copy} reduced={!!reduced} />
      ) : stage === "neuro" ? (
        <NeuroCrossfade copy={copy} variables={variables} reduced={!!reduced} />
      ) : null

    return (
      <div className="ritual-story" aria-live="polite">
        <AnimatePresence mode="wait">
          {scene && (
            <motion.div
              key={stage}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              {scene}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  ```
- **Explanation:** A thin switch with an `AnimatePresence` crossfade
  between scenes (`mode="wait"` so the old scene leaves before the new
  one enters — reads as one story turning a page). `useReducedMotion`
  disables the y-translation. `stage === "hidden"` renders nothing.

### Phase 3 / Step 3 — `doc-spine.tsx` (Scene 1)

- **In-file location:** new file `samwise-landing/app/meet/story/doc-spine.tsx`.
- **Code:**
  ```tsx
  "use client"

  import { motion } from "motion/react"
  import type { VariablesState } from "@/app/qualify/components/variables-panel"
  import type { StoryCopy } from "./strings"

  export function DocSpine({
    copy,
    variables,
    reduced,
  }: {
    copy: StoryCopy
    variables: VariablesState
    reduced: boolean
  }) {
    const behaviour = variables.behaviour_to_change?.trim()
    const motivation = variables.core_motivation?.trim()
    const rise = reduced
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: "easeOut" as const },
        }

    return (
      <section className="ritual-story-scene">
        <p className="ritual-story-kicker">{copy.doc_kicker}</p>
        <h3 className="ritual-story-title">{copy.doc_title}</h3>
        <p className="ritual-story-body">{copy.doc_body}</p>

        {/* The doc, as a page card with its three real sections. */}
        <motion.article className="ritual-doc" {...rise}>
          {copy.doc_sections.map((label, i) => (
            <div
              key={label}
              className={
                "ritual-doc-section" + (i === 0 ? " ritual-doc-section--active" : "")
              }
            >
              <span className="ritual-doc-section-label">{label}</span>
              {i === 0 && (behaviour || motivation) && (
                <div className="ritual-doc-slots">
                  {behaviour && (
                    <p className="ritual-doc-slot">&ldquo;{behaviour}&rdquo;</p>
                  )}
                  {motivation && (
                    <p className="ritual-doc-slot">&ldquo;{motivation}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.article>

        <p className="ritual-story-note">{copy.doc_slot_note}</p>
      </section>
    )
  }
  ```
- **Explanation:** Renders the doc as a page card with its three named
  sections; the first ("Problem & Solution") is active and shows the
  prospect's own captured `behaviour_to_change` / `core_motivation`
  slotting in (Fraunces-italic quotes, same register as the notes
  above). If neither is captured yet, the slot area is simply omitted —
  graceful. This is the "include the document from the beginning"
  beat.

### Phase 3 / Step 4 — `cycle-map.tsx` (Scene 2)

- **In-file location:** new file `samwise-landing/app/meet/story/cycle-map.tsx`.
- **Code:**
  ```tsx
  "use client"

  import { motion } from "motion/react"
  import type { StoryCopy } from "./strings"

  export function CycleMap({
    copy,
    reduced,
  }: {
    copy: StoryCopy
    reduced: boolean
  }) {
    return (
      <section className="ritual-story-scene">
        <p className="ritual-story-kicker">{copy.cycle_kicker}</p>
        <h3 className="ritual-story-title">{copy.cycle_title}</h3>

        {/* The doc, pinned at the top as the spine the steps write into. */}
        <div className="ritual-cycle-doc">
          <span className="ritual-cycle-doc-mark" aria-hidden="true">
            ✦
          </span>
          <span className="ritual-cycle-doc-label">{copy.cycle_doc_label}</span>
        </div>

        <ol className="ritual-cycle">
          {copy.cycle_steps.map((step, i) => (
            <motion.li
              key={step.n}
              className="ritual-cycle-step"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.36,
                ease: "easeOut",
                delay: reduced ? 0 : i * 0.05,
              }}
            >
              <span className="ritual-cycle-num" aria-hidden="true">
                {step.n}
              </span>
              <div className="ritual-cycle-text">
                <p className="ritual-cycle-out">{step.out}</p>
                <p className="ritual-cycle-head">{step.head}</p>
                <p className="ritual-cycle-body">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>
    )
  }
  ```
- **Explanation:** Doc pinned at top (the spine), six steps as a
  numbered story-flow beneath it. **The OUTPUT line (`step.out`) is
  rendered first and gold-accented** so the eye lands on what each phase
  *produces* — exactly Samuel's "focused on the output of each phase."
  Steps stagger in on scroll. The loop-back to the doc (`↻ back to the
  page`) is carried by step 06's copy in v1; a literal arc connector is
  a candidate for the later tonal pass.

### Phase 3 / Step 5 — `neuro-crossfade.tsx` (Scene 3)

- **In-file location:** new file `samwise-landing/app/meet/story/neuro-crossfade.tsx`.
- **Code:**
  ```tsx
  "use client"

  import { motion } from "motion/react"
  import type { VariablesState } from "@/app/qualify/components/variables-panel"
  import type { StoryCopy } from "./strings"

  // Two curves over a row of call-dots: the old pattern descends, the
  // ritual rises, they cross. SVG in a 0..100 × 0..60 viewBox.
  export function NeuroCrossfade({
    copy,
    variables,
    reduced,
  }: {
    copy: StoryCopy
    variables: VariablesState
    reduced: boolean
  }) {
    const rawOld = variables.behaviour_to_change?.trim()
    // Use the prospect's own behaviour as the descending-curve label,
    // truncated so it fits; fall back to the neutral copy.
    const oldLabel =
      rawOld && rawOld.length > 0
        ? rawOld.length > 28
          ? rawOld.slice(0, 27) + "…"
          : rawOld
        : copy.neuro_curve_old

    const draw = reduced
      ? {}
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 1.1, ease: "easeInOut" as const },
        }

    const dots = [0, 25, 50, 75, 100]

    return (
      <section className="ritual-story-scene">
        <p className="ritual-story-kicker">{copy.neuro_kicker}</p>
        <h3 className="ritual-story-title">{copy.neuro_title}</h3>

        <svg
          className="ritual-neuro"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${oldLabel} ↓ / ${copy.neuro_curve_new} ↑`}
        >
          {/* baseline */}
          <line x1="0" y1="58" x2="100" y2="58" className="ritual-neuro-axis" />
          {/* old pattern: high → low */}
          <motion.path
            d="M0,8 C30,12 55,40 100,54"
            className="ritual-neuro-old"
            fill="none"
            {...draw}
          />
          {/* ritual: low → high */}
          <motion.path
            d="M0,54 C40,48 70,16 100,6"
            className="ritual-neuro-new"
            fill="none"
            {...draw}
          />
          {dots.map((cx) => (
            <circle key={cx} cx={cx} cy="58" r="1.2" className="ritual-neuro-dot" />
          ))}
        </svg>

        <div className="ritual-neuro-legend">
          <span className="ritual-neuro-legend-old">↓ {oldLabel}</span>
          <span className="ritual-neuro-legend-new">↑ {copy.neuro_curve_new}</span>
        </div>
        <p className="ritual-neuro-axis-label">{copy.neuro_axis}</p>

        <p className="ritual-story-body">{copy.neuro_body}</p>
      </section>
    )
  }
  ```
- **Explanation:** Two SVG curves draw in on a shared call-by-call
  axis. The descending curve is labeled with the prospect's own
  `behaviour_to_change` (truncated) when present — the "phase out" of
  *their* pattern, not an abstraction. Reduced-motion renders the
  curves statically. The body line is the sign-off-pending copy.

### Phase 3 / Step 6 — `story.css`

- **In-file location:** new file `samwise-landing/app/meet/story/story.css`.
- **Should not be modified:** `components/call/call.css` is untouched —
  this file is imported by `ritual-story.tsx` and relies on the same
  `:root` tokens already defined globally by `call.css` on the route.
- **Code (scaffold — the load-bearing rules; spacing/polish iterates):**
  ```css
  /* The Ritual Story — continues the notes column downward. Reuses the
     call.css :root tokens (--bg/--ink/--ink-soft/--ink-mute/--rule/
     --gold) and the literal 'Fraunces'/'Manrope' stacks. */

  .ritual-story {
    margin-top: 44px;
    padding-top: 36px;
    border-top: 1px solid var(--rule);
    max-width: 28em; /* match .qualify-notes */
  }

  .ritual-story-scene {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ritual-story-kicker {
    font-family: 'Manrope', sans-serif;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .ritual-story-title {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: 24px;
    line-height: 1.25;
    color: var(--ink);
    margin: 0;
  }

  .ritual-story-body {
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .ritual-story-note,
  .ritual-neuro-axis-label {
    font-family: 'Manrope', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--ink-mute);
  }

  /* Scene 1 — the doc card */
  .ritual-doc {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--rule);
    border-radius: 8px;
    overflow: hidden;
  }
  .ritual-doc-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--rule);
  }
  .ritual-doc-section:last-child {
    border-bottom: none;
  }
  .ritual-doc-section--active {
    border-left: 2px solid var(--gold);
  }
  .ritual-doc-section-label {
    font-family: 'Manrope', sans-serif;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }
  .ritual-doc-slots {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }
  .ritual-doc-slot {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-size: 17px;
    line-height: 1.4;
    color: var(--ink);
  }

  /* Scene 2 — the cycle */
  .ritual-cycle-doc {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid var(--gold);
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .ritual-cycle-doc-mark {
    color: var(--gold);
    font-size: 16px;
  }
  .ritual-cycle-doc-label {
    font-family: 'Manrope', sans-serif;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .ritual-cycle {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .ritual-cycle-step {
    display: flex;
    gap: 14px;
    padding: 16px 0;
    border-bottom: 1px solid var(--rule);
  }
  .ritual-cycle-step:last-child {
    border-bottom: none;
  }
  .ritual-cycle-num {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-size: 18px;
    color: var(--ink-mute);
    min-width: 1.6em;
  }
  .ritual-cycle-out {
    font-family: 'Manrope', sans-serif;
    font-weight: 600;
    font-size: 13px;
    color: var(--gold);
    margin: 0 0 2px;
  }
  .ritual-cycle-head {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-size: 19px;
    color: var(--ink);
    margin: 0 0 4px;
  }
  .ritual-cycle-body {
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-soft);
    margin: 0;
  }

  /* Scene 3 — the crossfade */
  .ritual-neuro {
    width: 100%;
    height: 120px;
    margin: 8px 0 4px;
  }
  .ritual-neuro-axis {
    stroke: var(--rule);
    stroke-width: 0.4;
  }
  .ritual-neuro-old {
    stroke: var(--ink-mute);
    stroke-width: 1.2;
    stroke-dasharray: 2 2;
    vector-effect: non-scaling-stroke;
  }
  .ritual-neuro-new {
    stroke: var(--gold);
    stroke-width: 1.6;
    vector-effect: non-scaling-stroke;
  }
  .ritual-neuro-dot {
    fill: var(--ink-mute);
  }
  .ritual-neuro-legend {
    display: flex;
    justify-content: space-between;
    font-family: 'Manrope', sans-serif;
    font-size: 12px;
    letter-spacing: 0.02em;
  }
  .ritual-neuro-legend-old {
    color: var(--ink-mute);
  }
  .ritual-neuro-legend-new {
    color: var(--gold);
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .ritual-neuro-old,
    .ritual-neuro-new {
      /* drawn statically — motion component falls back via useReducedMotion */
    }
  }
  ```
- **Explanation:** Same register as the notes above (Fraunces italic
  headings/quotes, Manrope small-caps labels, single gold hairline as
  the only chromatic note). The story column matches `.qualify-notes`'
  `28em` max-width and opens with a `--rule` hairline so it reads as a
  continuation of the notes, not a separate panel.

### Phase 3 / Step 7 — Wire `<RitualStory>` into `call-room.tsx`

- **In-file location:** `samwise-landing/app/meet/call-room.tsx`.
- **Should not be modified:** the `ALLOWED_KEYS` set, `isVariableKey`,
  the `STRINGS` table, the `<VideoCallExperience>` block and its
  `status` props, the `variables` state + its update logic.
- **Code (the four edits):**

  **(a)** imports + a local `StoryStage` import:
  ```tsx
  import { RitualStory, type StoryStage } from "./story/ritual-story"
  ```

  **(b)** new state beside `variables`:
  ```tsx
  const [storyStage, setStoryStage] = useState<StoryStage>("hidden")
  ```

  **(c)** extend `onDataMessage` to branch on `type` (replace the body):
  ```tsx
  const onDataMessage = useCallback((msg: unknown) => {
    if (typeof msg !== "object" || msg === null || !("type" in msg)) return
    const type = (msg as { type?: unknown }).type

    if (type === "demo-call:variable_update") {
      const m = msg as { name?: unknown; value?: unknown }
      if (typeof m.name !== "string") return
      if (!isVariableKey(m.name)) return
      const value = typeof m.value === "string" ? m.value : ""
      setVariables((prev) => ({ ...prev, [m.name as VariableKey]: value }))
      return
    }

    if (type === "demo-call:show_visual") {
      const stage = (msg as { stage?: unknown }).stage
      if (
        stage === "hidden" ||
        stage === "doc" ||
        stage === "cycle" ||
        stage === "neuro"
      ) {
        setStoryStage(stage)
      }
      return
    }
  }, [])
  ```

  **(d)** render `<RitualStory>` inside the notes aside, below the panel:
  ```tsx
  <aside className="demo-call-room-notes" aria-label={s.notes_label}>
    <VariablesPanel lang={lang} variables={variables} />
    <RitualStory lang={lang} stage={storyStage} variables={variables} />
  </aside>
  ```
- **Explanation:** The notes aside now holds the live notes *and* the
  story beneath them, one continuous column. The story reads the same
  `variables` state the panel does, so personalization needs no new
  data. `storyStage` defaults to `"hidden"` → nothing shows until
  Samuel clicks.

### Phase 4 — Cut Phase 9's SAY monologues (Demo Call Doc + prep sweep) — GATED

> **Do this only after Phases 1–3 ship and Samuel has watched the
> visual carry the explanation on a real call.** This is direction #4
> ("cut the long SAY blocks to one-liners") and the whole point of the
> feature — but cutting before the visual is proven would leave a hole.

- **Demo Call Doc (id `1sBHuGaXCFaP8cmQdUgNpoQYwCq3L4-OfDMDoPR73a5g`),
  Phase 9** (gated `[CONDITION: fit_state=qualified]`): replace each of
  the three long SAY monologues (Paso 1 onboarding · Paso 2 daily-call
  structure · Paso 3 optimization) with a **one-liner that points at
  the screen** + a `☞` cue telling Samuel which `<StoryControl>` button
  to click. Draft shape (final copy drafted at implementation, once the
  scenes are visually locked):
  - Paso 1 → click **1 · The Doc**; say: *"Mirá tu pantalla — todo lo
    que hagamos vive acá, en un solo documento. Estas son tus palabras,
    ya en la primera página."*
  - Paso 2 → click **2 · The Cycle**; say: *"Y así se mueve todo: seis
    pasos, un ciclo, con el documento en el centro. Fijate en lo que
    sale de cada paso."*
  - Paso 3 → click **3 · The Neuro**; say: *"Y por debajo está pasando
    esto —"* then let the curves do the talking; close in one line.
- **`before_the_call.md` (id
  `14ZNKJu-g7MqWrVE6akZWLz3fBTI-6Atnt6TvZYR-V30`) propagation sweep:**
  update Section 3i (mandatory beats) so Phase 9's beat is "drive the
  on-screen story, one line per scene — do NOT narrate the roadmap"; and
  add one logistics line (Section 1) reminding Samuel the `<StoryControl>`
  panel sits at the top of the middle column on his surface.
- **Explanation:** This is where Samuel actually "speaks less." The
  visual must exist and be trusted first; hence the gate.

---

## Testing phase

- **Local test (two dev servers):**
  1. `samwise-app` on :3000, `samwise-landing` on :3001.
  2. Open the rep surface at `/meet/[walkInId]` (samwise-app) and the
     prospect surface at the matching `/meet/[id]` (samwise-landing) in
     a second browser/profile; join the same room.
  3. Confirm the prospect notes column shows nothing below the panel
     initially (`stage = "hidden"`).
  4. Rep clicks **1 · The Doc** → prospect sees Scene 1 crossfade in
     below their notes, with their captured `behaviour_to_change` /
     `core_motivation` slotted into the "Problem & Solution" section.
  5. Rep clicks **2 · The Cycle** → Scene 1 leaves, Scene 2 enters; the
     six steps stagger in, OUTPUT lines gold-accented, doc pinned on
     top.
  6. Rep clicks **3 · The Neuro** → the two curves draw in; the
     descending curve is labeled with the prospect's behaviour.
  7. Rep clicks **Clear** → story crossfades out to nothing.
  8. Spanish: repeat with a booking whose `language = "es"`; verify all
     copy switches and voseo reads naturally.
- **Reduced-motion:** toggle OS "reduce motion"; confirm scenes appear
  without translate/stagger and the neuro curves render statically.
- **Mobile (375px):** confirm the story column doesn't overflow
  horizontally and reads as a continuation of the notes (stacked under
  the video).
- **Resilience:** click stages rapidly; confirm `AnimatePresence
  mode="wait"` doesn't strand a half-mounted scene. Click a stage
  before the prospect has joined; confirm the rep buttons were disabled
  until `roomReady`.
- **Integration test:** the DataChannel path is the same one
  `demo-call:variable_update` already uses in production — no server
  changes — so a single end-to-end room test is sufficient.
- **Update README:** none (landing route has no README; rep surface
  change is a UI control, not a service).

## After implementation

- **Update `samwise-landing/context-for-code-agent.md`:** document the
  new `app/meet/story/` module (the three scenes, the `demo-call:show_visual`
  event shape, that personalization rides the existing variables state).
- **Update `samwise-app/context-for-code-agent.md`:** note `broadcast.ts`
  now also publishes `show_visual`, and `<StoryControl>` in `WalkInShell`.
- **Mark task DONE in master Vibe doc Projects tab:** manual user step.

---

## Open flags (need Samuel's call — do not guess)

1. **Daily-call structure: 4 vs 6.** The Ritual Template Doc's "Ritual
   Call" has **four** parts (the Stop · the Consciousness · the
   Intention · the Commitment). The Demo script's Phase 9 "Paso 2"
   narrates **six** moments. The visual (Scene 2, step 02) uses the
   doc's **four**, since the doc is the spine/source of truth.
   **Confirm the script's six collapse to the doc's four**, or tell me
   the visual should show six.
2. **The "Design your call" step.** Samuel's 6-step cycle includes a
   "design call" node, and the template's "Ritual Call" page is its
   output — so the visual treats step 02 as "we write the four-part
   call." Confirm step 02's output is the Ritual Call page (and that
   "design your call" isn't a separate live session that needs its own
   node).
3. **Neuro copy needs sign-off (Rule 8).** Scene 3's body line is a
   *draft* (behavioural framing, no clinical claim). Approve it,
   replace it, or soften it before this ships to a prospect.
4. **Prior plan check.** This file replaced the `/book` device-tz +
   Phase 17 plan (recoverable from git, HEAD `4513d94`). If either of
   those is still unshipped, say so and I'll restore it somewhere safe
   before it scrolls out of easy reach.
