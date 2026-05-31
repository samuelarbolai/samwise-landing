# current-plan.md — /meet Ritual Story redesign + notes-sync fix + sticky rep controls

> Supersedes the original 3-scene Ritual Story plan (shipped). This is a redesign
> driven by real-use feedback (2026-05-30). Spans BOTH repos: `samwise-app` (rep
> side) and `samwise-landing` (prospect side).
>
> ⚠️ **Prospect-facing copy in this plan is DRAFT and needs Samuel's sign-off
> (landing Rule 8).** Anything marked `[CONFIRM]` is a product/visual decision I
> must not settle alone (script-work Rule 8: don't invent). Structure + the bug
> fix are high-confidence; copy is for review.

---

## Plan Summary

Three things, one pass:

1. **BUG — prospect notes don't appear.** Two causes:
   - *Prefilled notes never sent:* the auto qualification-load on mount writes via `setStateRaw`, which bypasses the DataChannel broadcaster. Confirmed in code (`WalkInShell` passes `setState: setStateRaw` to `prefillFromQualification`).
   - *Live-filled notes weren't arriving:* the live path IS correct in code (`VariablesTable` → `setState` wrapper → `diffAndPublish`). They failed to deliver because the **connection churn** was erroring every `reliable` DataChannel send (the `Unknown DataChannel error on reliable` lines). The connect-once fix already landed addresses that; this plan adds a **snapshot-on-join** so prefilled + pre-join values also arrive, and a verification step.

2. **REDESIGN — the story.** Corrected model after reading the skills:
   - **Promise (reworked neuro, FIRST):** the ritual changes two things at two speeds — behaviour (now) + thoughts & emotions (gradually). Keep the old-pattern-vs-ritual base, *layer the two-changes on top*.
   - **The whole experience (six steps, kept):** map → design → live → **optimize** → live → repeat. Multi-session; optimization is its own session.
   - **The daily loop (NEW beat):** AI agent calls → you do your ritual → tracking agent calls to track. The engine inside "live your call," feeding "optimize."
   - **The document = persistent spine:** seeded by his captured words, ghosted "to-come" sections + a progress meter → the pull to fill it.

3. **REP CONTROLS — sticky.** Move `StoryControl` from top-of-column to a compact **sticky strip inside the variables column** so Samuel never scrolls up to advance the story. Re-label/re-order buttons to the new arc.

### Conceptual model (the source of truth for all copy)

| Layer | What it is |
|---|---|
| The promise (neuro) | ritual changes **behaviour** (now) + **thoughts & emotions** (gradually) |
| The whole experience (six steps) | map → design → live → optimize → live → repeat (across sessions) |
| The daily loop (engine) | agent calls → user does ritual → tracking agent calls to track |
| The *how* (mechanisms) | protection via social help · new belief via mantras · daily progressive activities |
| The document (spine) | holds it all, seeded by his words, grows = his progress |

Hard constraints (from the script/onboarding skills):
- `enemy_name` is captured in **onboarding**, not the demo — the story can only show it as a ghosted "to-come" slot, never a real value.
- Rule 7 vocab: no *paciente / recaída / terapia / comportamiento autodestructivo* anywhere on the prospect's screen.
- The four-part daily call = `el Alto / la Consciencia / la Intención / el Compromiso` (THE STOP / CONSCIOUSNESS / INTENTION / COMMITMENT), plus symbolic-help + social-help = the six ritual moments. (This is the daily call's internal shape, already referenced in step 02 copy.)

---

## Plan Architecture (Flow)

Unchanged transport. Still rides the existing LiveKit DataChannel; still `type`-discriminated JSON.

```
REP (samwise-app, WalkInShell)                 PROSPECT (samwise-landing, /meet)
─────────────────────────────                  ─────────────────────────────────
StoryControl (sticky)  ──publishVisual(stage)──▶  onDataMessage → setStoryStage → RitualStory
VariablesTable edit    ──diffAndPublish───────▶   onDataMessage → setVariables  → VariablesPanel
prospect JOINS room    ──publishSnapshot()────▶   (same variable_update events) → VariablesPanel
```

- New: `publishSnapshot()` fires on `RoomEvent.ParticipantConnected` (the prospect joining), re-emitting every non-empty `userVisible` cleaned variable as ordinary `demo-call:variable_update` events → **zero landing-side change for the bug fix.**
- `StoryStage` union changes (both repos, kept in sync by hand like the `VideoCallExperience` dup):
  `"hidden" | "promise" | "experience" | "loop"`. The document renders as a **persistent spine** whenever stage ≠ hidden (no separate "doc" stage).

---

## Plan Structure (Directories and files)

### samwise-app (rep)
- `lib/demo-call/broadcast.ts` — update `StoryStage` union; add `publishSnapshot`.
- `app/copilot/story-control.tsx` — re-order/re-label buttons; make sticky-friendly.
- `components/walk-in/WalkInShell.tsx` — sticky wrapper for StoryControl; `stateRef`; wire `ParticipantConnected → publishSnapshot`.

### samwise-landing (prospect)
- `app/meet/story/strings.ts` — copy for `promise` (reworked neuro), `experience` (kept six steps), `loop` (NEW), and doc spine (ghosted sections + progress + slot note). EN/ES.
- `app/meet/story/ritual-story.tsx` — new `StoryStage` union; stage dispatch; render the doc spine persistently + active beat.
- `app/meet/story/neuro-crossfade.tsx` → **rework** into the `promise` beat (old-vs-ritual base + two-changes layer).
- `app/meet/story/cycle-map.tsx` → the `experience` beat (mostly kept).
- `app/meet/story/doc-spine.tsx` → **rework** into the persistent spine (seeded words + ghosted sections + progress meter).
- `app/meet/story/daily-loop.tsx` → **NEW** beat (agent → ritual → tracking).
- `app/meet/story/story.css` — styles for ghosted sections, progress meter, daily-loop, the promise beat's extra curve/legend.
- `app/meet/call-room.tsx` — update the stage allow-list to the new union.

---

## Modifications (phases and steps)

### Phase 1 — Bug fix: snapshot the notes on prospect-join (samwise-app)

**Step 1.1 — `lib/demo-call/broadcast.ts`: add `publishSnapshot`.**
- In-file location: the `VariableBroadcaster` interface + `createVariableBroadcaster` return object.
- Do NOT modify: `diffAndPublish` logic, the event names, `publishVisual`.
- Code:
  ```ts
  export interface VariableBroadcaster {
    diffAndPublish: (/* unchanged */) => void
    publishVisual: (stage: StoryStage) => void
    /** Re-emit every non-empty userVisible cleaned value as variable_update
     *  events. Called when the prospect joins so prefilled / pre-join notes
     *  arrive (the diff path only fires on CHANGES while connected, and the
     *  on-mount qualification prefill bypasses the broadcaster entirely). */
    publishSnapshot: (cleaned: Record<string, string>, variables: DemoCallVariable[]) => void
  }
  // in the returned object:
  publishSnapshot(cleaned, variables) {
    for (const v of variables) {
      if (!v.userVisible) continue
      const value = (cleaned[v.name] ?? "").trim()
      if (!value) continue
      const payload = encoder.encode(
        JSON.stringify({ type: "demo-call:variable_update", name: v.name, value }),
      )
      void room.localParticipant.publishData(payload, { reliable: true })
    }
  }
  ```
- Explanation: reuses the existing `variable_update` shape, so the landing side needs no change. Only non-empty userVisible values are sent.

**Step 1.2 — `WalkInShell.tsx`: keep a `stateRef`, fire snapshot on join.**
- In-file location: alongside `broadcasterRef`/`roomReady`; and inside `handleRoomReady`.
- Do NOT modify: the `setState` wrapper's diff logic, the init effect.
- Code:
  ```ts
  // mirror latest state so the join-listener reads fresh cleaned values
  const stateRef = useRef<SessionState | null>(null)
  useEffect(() => { stateRef.current = state }, [state])

  const handleRoomReady = (room: Room) => {
    const broadcaster = createVariableBroadcaster(room)
    broadcasterRef.current = broadcaster
    setRoomReady(true)
    // When the prospect joins, re-emit current notes. Fire on connect AND
    // for anyone already present (rep may have joined second).
    const snapshot = () => {
      const s = stateRef.current
      if (s) broadcaster.publishSnapshot(s.cleaned, DEMO_CALL_VARIABLES)
    }
    room.on(RoomEvent.ParticipantConnected, snapshot)
    if (room.remoteParticipants.size > 0) snapshot()
  }
  ```
  (add `import { RoomEvent } from "livekit-client"`.)
- Explanation: covers prefilled values AND values filled before the prospect arrived. Live edits after join keep flowing through the (now-healthy) diff path.
- `[CONFIRM]` possible race: if `publishData` right at `ParticipantConnected` outruns the data channel to that peer, add a ~500 ms delay or publish on first `TrackSubscribed` instead. Verify in test (Phase 4).

**Step 1.3 — verify the live path.** No code. On the fixed/deployed build, confirm a live edit in `/copilot` shows on `/meet` within the clean round-trip, with no `Unknown DataChannel error` in console. (This is the part the connect-once fix already addresses.)

---

### Phase 2 — Story redesign (samwise-landing) — STRUCTURE

**Step 2.1 — `StoryStage` union (both repos, in lockstep).**
- `broadcast.ts` and `ritual-story.tsx`: `"hidden" | "promise" | "experience" | "loop"`.
- Document is NOT a stage — it renders as a persistent spine in `RitualStory` whenever stage ≠ hidden.

**Step 2.2 — `ritual-story.tsx`: persistent doc spine + active beat.**
- Render `<DocSpine …/>` always (when stage ≠ hidden), then the active beat below it inside the `AnimatePresence` crossfade.
- Dispatch: `promise → PromiseBeat`, `experience → CycleMap`, `loop → DailyLoop`.

**Step 2.3 — `doc-spine.tsx` → persistent spine.**
- Page card with: section list, his captured words slotted into the active "Problema y Solución" section, **ghosted "to-come" sections**, and a **progress meter** (e.g. `3 / 9`).
- `[CONFIRM]` the section list (maps to real onboarding/call-design deliverables). Draft:
  - ✅ seeded now (from his notes): *Problema y Solución* (behaviour + motivation)
  - 🔒 to-come (onboarding/call-design): *Tu ancla simbólica*, *Tu enemigo con nombre*, *Tu mantra de desidentificación*, *Tus ayudadores (protección)*, *Tu actividad diaria*, *La Llamada del Ritual (Alto · Consciencia · Intención · Compromiso)*, *El pacto*, *Metadata / progreso*
- `[CONFIRM]` show the numeric progress meter? and the count denominator.

**Step 2.4 — `neuro-crossfade.tsx` → the `promise` beat.**
- Keep old-pattern (declining) vs ritual (rising) base. **Layer the two changes:**
  - `[CONFIRM]` visual approach — proposed: split the rising side into TWO curves — **behaviour** (rises fast → "ya, en el ritual") and **thoughts & emotions** (rises gradually) — over the declining **old pattern**. Legend names all three. Alt: keep two curves, add a caption-only "two changes, two speeds" layer (no new curve).
  - `[CONFIRM]` personalization: keep his `behaviour_to_change` as the old-pattern label?

**Step 2.5 — `daily-loop.tsx` → NEW beat.**
- Three-node loop: **agent calls** → **you do your ritual** → **tracking call** → (back). Anchored to the doc.
- `[CONFIRM]` copy + whether the tracking node names the tracking agent or stays generic.

**Step 2.6 — `cycle-map.tsx` (the `experience` beat).** Keep current six steps. Minor: ensure it reads under the persistent doc spine (avoid duplicating the doc pin that doc-spine now owns).

**Step 2.7 — `story.css`.** Styles for ghosted sections (reduced-opacity + lock affordance), progress meter, the daily-loop nodes, and the promise beat's extra curve/legend.

---

### Phase 3 — Sticky rep controls (samwise-app)

**Step 3.1 — `story-control.tsx`:** re-order + re-label to the arc:
`1 · The Promise` (promise) · `2 · The Experience` (experience) · `3 · The Daily Loop` (loop) · Clear. Keep the `ready` gate + `aria-pressed`.

**Step 3.2 — `WalkInShell.tsx`:** make the StoryControl a **sticky strip** at the top of the scrolling middle column (`position: sticky; top: 0; z-index`), so it stays put while the variables table scrolls. Keep it visually compact.
- `[CONFIRM]` sticky at the very top of the column vs. a slimmer floating bar.

---

## Testing phase

- **Local:** `npx tsc --noEmit` in both repos, filtered to changed files (pre-existing unrelated errors ignored).
- **Integration (2-party):** drive a real `/copilot` ↔ `/meet` pair. Verify:
  1. Prefilled notes appear on the prospect screen at join (Phase 1).
  2. A live edit appears within the clean round-trip; no `Unknown DataChannel error`.
  3. Each sticky button advances the correct beat; doc spine persists; progress/ghosted sections read right.
  4. ES/voseo correct; no Rule-7 vocab; no horizontal overflow at 375px.
  5. Reduced-motion path (code-gated).
- **README:** n/a.

## After implementation

- Update `context-for-code-agent.md` in both repos (new beat, new union, snapshot-on-join, sticky control).
- Sweep the Demo Call Doc Phase 9 + `before_the_call.md` §3i to match the new beat order/labels (the Phase-4 doc edits become: Promise → Experience → Daily Loop). Present as paste-ready (Drive MCP is read-only).
- Commit per repo (`git commit -am`), deploy both, hard-reload `/meet`. Mark the task DONE in the master Vibe doc (manual).

---

## Open decisions blocking copy (need Samuel)

1. Daily-loop beat copy + whether the tracking node names the tracking agent.
2. Neuro `promise` beat: three-curve split vs caption-only layer; keep `behaviour_to_change` as old-pattern label.
3. Doc spine: the exact section list (✅ seeded vs 🔒 to-come) + progress meter yes/no + denominator.
4. Then: full EN/ES copy draft for all beats → your Rule-8 sign-off.
