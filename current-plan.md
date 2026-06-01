# current-plan.md — /meet fade-in-place + samwise-app editorial deepening (2026-05-31)

> Neurotic-implementer rules in force: ask before deducing; prospect-facing copy needs
> sign-off; never commit unless asked. Two repos: samwise-landing + samwise-app.

## Reconciliation vs the handoff (git state moved on)
The handoff was written when this work was uncommitted. It is now committed + pushed:
- **samwise-app** `fe3eb90` (notes fix), `9e95f82` (story stages + sticky StoryControl), editorial token pass — working tree was clean.
- **samwise-landing** `7b8ae5c` (sticky video + scrollIntoView auto-advance) — clean except this file.
- ⚠️ **The committed notes fix was dead code:** `prospectPresent` in `WalkInShell.tsx` was never set
  true, so the reactive re-broadcast never fired. **Fixed this session** (see Phase 0).
- ⚠️ **`app/meet/story-graphic-test/page.tsx` got committed** → it's a live `/meet/story-graphic-test`
  route in prod. Needs a deletion commit (see After-implementation).

## Decisions locked this session
- **Task-1 layout:** "Story leads, notes below." When the story goes live, the Ritual Story leads the
  right column (top-aligned with the sticky video) and beats fade out→in **in place**; the live notes
  flow beneath, still scrollable. One gentle scroll brings the story into view the first time it
  appears; after that, no per-beat scroll-jump.
- **Notes-fix bug:** fix now, ship first (DONE — Phase 0).

---

## Phase 0 — DONE this session: notes-fix (samwise-app, ship-first)
`components/walk-in/WalkInShell.tsx` `handleRoomReady`: wire `setProspectPresent` to the room's
`ParticipantConnected`/`ParticipantDisconnected` events (+ an initial `syncPresence()`), so the
reactive snapshot effect actually fires and re-broadcasts notes on every cleaned-value change while
the prospect is present. Scoped to one file. **Commit message in After-implementation.**

---

## Phase 1 — /meet story fade-in-place ("story leads, notes below")
Files: `app/meet/call-room.tsx`, `app/meet/story/ritual-story.tsx`, `app/meet/story/story.css`.
(No `call.css` change needed — the column reorder is pure JSX + the story's own CSS.)

### Step 1.1 — `app/meet/call-room.tsx`: import `useRef`
- **Location:** line 3.
- **Code:** `import { useCallback, useEffect, useRef, useState } from "react"`

### Step 1.2 — `app/meet/call-room.tsx`: replace the per-beat auto-scroll with one-time scroll-on-appear
- **Location:** the `useEffect` at lines 92–114 (the `scrollIntoView` block).
- **Should NOT modify:** the `onDataMessage` callback, the `storyStage` state, the DataChannel handling.
- **Code (replaces the whole effect):**
  ```tsx
  // Fade-in-place: bring the story into view ONCE, when it first appears
  // (hidden → live). After that, beats fade out/in in place — no per-beat
  // scroll-jump (the prospect isn't yanked around as Samuel advances).
  // Honours reduced-motion.
  const prevStageRef = useRef<StoryStage>("hidden")
  useEffect(() => {
    const prev = prevStageRef.current
    prevStageRef.current = storyStage
    // Only on the first reveal: previous was hidden AND now we're live.
    if (prev !== "hidden" || storyStage === "hidden") return
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t = setTimeout(
      () => {
        document
          .querySelector(".ritual-story")
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
      },
      reduce ? 0 : 80,
    )
    return () => clearTimeout(t)
  }, [storyStage])
  ```
- **Explanation:** `prevStageRef` lets us detect the single hidden→live transition. Subsequent
  live→live changes return early (no scroll). The beat itself crossfades via AnimatePresence (Step 1.3).

### Step 1.3 — `app/meet/call-room.tsx`: render the story ABOVE the notes
- **Location:** the `<aside className="demo-call-room-notes">` block (lines 135–141).
- **Code:**
  ```tsx
  <aside className="demo-call-room-notes" aria-label={s.notes_label}>
    <RitualStory lang={lang} stage={storyStage} variables={variables} />
    <VariablesPanel lang={lang} variables={variables} />
  </aside>
  ```
- **Explanation:** `RitualStory` returns null when `stage==="hidden"`, so during phases 1–8 the column
  is notes-only — byte-identical to today. When the story goes live it leads; notes follow beneath.

### Step 1.4 — `app/meet/story/ritual-story.tsx`: pure-opacity fade (no slide)
- **Location:** the `<motion.div className="ritual-story-beat">` props (lines 82–86).
- **Should NOT modify:** `mode="wait"` on AnimatePresence (keeps it strict-serial: old fully out, then
  new in — the landing's no-cross-fade rule), the persistent DocSpine/UnansweredList outside it.
- **Code:**
  ```tsx
  initial={reduced ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: reduced ? 0 : 0.5, ease: "easeInOut" }}
  ```
- **Explanation:** "fade in place" = opacity only, no `y` translate. `mode="wait"` already gives the
  serial exit→enter the landing choreography uses.

### Step 1.5 — `app/meet/story/story.css`: the story now LEADS (separator below, not above)
- **Location:** the `.ritual-story` rule (lines 5–10).
- **Code:**
  ```css
  .ritual-story {
    max-width: 28em; /* match .qualify-notes */
    padding-bottom: 40px;
    margin-bottom: 44px;
    border-bottom: 1px solid var(--rule);
  }
  ```
- **Explanation:** dropped the top `margin/padding/border` (it used to "continue the notes column
  downward"); now it leads, with a hairline rule + air separating it from the notes that follow.
  `.ritual-story-beat`'s own top rule (separating spine from beat) stays.

### Phase 1 verification (browser preview)
The live path needs a real LiveKit room, so verify with the existing harness:
`app/meet/story-test/page.tsx` (stage + lang switches, sample vars) — already in the repo. Drive it
through doc→promise→loop→mechanism→experience and confirm: (a) story leads, notes below;
(b) beats crossfade in place with NO page scroll on live→live; (c) one smooth scroll on first reveal;
(d) reduced-motion → instant. Use `preview_eval` to read `getComputedStyle(.ritual-story-beat).opacity`
across a stage change and `window.scrollY` before/after a live→live change (should be unchanged).

---

## Phase 2 — samwise-app editorial deepening (product surfaces ONLY)
NEVER touch `/trip` or `/outreach` (`.paper-module`). All edits are scoped to `.brand-editorial`.
Card titles are ALREADY Fraunces 400 (the `[data-slot="card-title"]` heading rule in globals.css) —
so the remaining work is shapes, the sidebar mark, the dark surfaces, and forms.

### Step 2.1 — Gold ✦ wordmark in the sidebar (`app/page.tsx` + `app/globals.css`)
- **globals.css** (add after the `.brand-editorial ::selection` rule, ~line 270):
  ```css
  /* ── Brand wordmark — Fraunces italic + tiny gold ✦ (mirrors the landing
     navbar mark). ──────────────────────────────────────────────────────── */
  .brand-editorial .brand-wordmark {
    font-family: var(--app-fraunces), 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--foreground);
    display: inline-flex;
    align-items: baseline;
    line-height: 1;
  }
  .brand-editorial .brand-wordmark__star {
    color: var(--accent-gold);
    font-size: 0.5em;
    vertical-align: super;
    padding-left: 3px;
    font-style: normal;
  }
  ```
- **page.tsx** `<SidebarHeader>` (lines 88–95) — replace the Sparkles-in-a-box:
  ```tsx
  <SidebarHeader>
    <div className="flex items-center px-2 py-1.5">
      <span className="brand-wordmark text-[17px]">
        Samwise<span className="brand-wordmark__star">✦</span>
      </span>
    </div>
  </SidebarHeader>
  ```
  (Keep the `Sparkles` import — still used by NAV + the copilot sidebar link.)

### Step 2.2 — Cards: hairline border, no heavy shadow, calmer radius (`app/globals.css`)
- Add (scoped):
  ```css
  /* ── Cards — hairline border, no shadow, calmer radius (titles are
     already Fraunces 400 via the heading rule). ──────────────────────── */
  .brand-editorial [data-slot="card"] {
    box-shadow: none;
    border-color: var(--border);
    border-radius: var(--radius);
  }
  /* Inputs / select triggers — drop the shadcn inner shadow; hairline +
     gold focus ring already come from the brand tokens. */
  .brand-editorial [data-slot="input"],
  .brand-editorial [data-slot="select-trigger"] {
    box-shadow: none;
  }
  ```

### Step 2.3 — Card-header icon blobs (`app/page.tsx`) — JUDGMENT CALL ⚠️
The two card headers + the (now-replaced) sidebar use a `bg-primary/10` filled circle with a lucide
icon — the most "SaaS-default" shape left. **Recommend** replacing each with a small gold ✦ above the
title (matches the brand mark, drops the blob):
```tsx
<div className="mx-auto mb-3 text-[var(--accent-gold)] text-lg leading-none">✦</div>
```
Alternative (keep the icon, lose the fill): hairline gold ring —
`border border-[color:var(--accent-gold)]/40` with `text-[var(--accent-gold)]` icon.
**Need your nod on which** (both operator-facing, no prospect copy).

### Step 2.4 — Forms/inputs register — JUDGMENT CALL ⚠️
Inputs already inherit hairline border + gold focus ring from the tokens; 2.2 drops their inner
shadow. **Recommend stopping there** (keep them boxed — appropriate for an operator form), rather than
converting to the landing's full hairline-underline inputs (too stylized for utility forms). Operator
buttons stay ink-filled (`bg-primary` = ink) — that reads editorial-restrained, not marketing-y, so I
**won't** convert them to gold-dash CTAs. Confirm.

### Step 2.5 — `/ritual-call` dark → editorial (`components/ritual-call/RitualCallExperience.tsx`) ⚠️ BIG
This 380-line surface is hardcoded dark (`bg-neutral-950 text-neutral-100`, `border-neutral-700
bg-neutral-900`, …) and ignores the brand tokens — so it stays dark inside the editorial skin and
clashes. Convert all states (idle/identifying/connecting/active/disconnected/error) to the editorial
register: gallery-white bg, ink text, hairline `border`/`text-muted-foreground`, gold accents, the
brand ✦ where a mark appears. Mirrors the landing's gallery-white in-call register (not dark). This is
the largest visual change — **confirm the gallery-white direction.** Verify each state in-browser.

### Step 2.6 — `/meet` WalkInShell dark edge-states (`components/walk-in/WalkInShell.tsx`)
The error + "Joining the call…" screens (lines 199–216) hardcode `bg-neutral-950 text-neutral-100`.
Drop those classes so they inherit the brand-editorial white/ink (the shell is already wrapped by
`app/meet/layout.tsx`):
```tsx
// error
<main className="flex h-screen items-center justify-center p-6 text-foreground"> …
  <p className="mt-2 text-sm text-muted-foreground">{error}</p>
// loading
<main className="flex h-screen items-center justify-center text-foreground">
  <p className="text-sm text-muted-foreground">Joining the call…</p>
```

### Step 2.7 — Shared copilot panes (low priority, optional)
`story-control.tsx`, `variables-table.tsx`, `script-pane.tsx` already use brand tokens (ink/white via
the wrapper). Light polish only (Manrope eyebrow labels, gold active accents) IF time — not load-
bearing. Skip unless it reads ugly in the preview.

### Phase 2 verification (browser preview)
`preview_start`, then for each surface: `/` (sidebar star + cards), `/ritual-call` (all states),
`/meet/[id]` (WalkInShell — error/loading + StoryControl). `preview_screenshot` the before/after of
each; `preview_inspect` card `box-shadow` (should be `none`) and the wordmark `font-family` (Fraunces)
+ star `color` (`#D4A85A`). `preview_console_logs level:error` to catch nothing regressed.

---

## Testing phase
- **Local (browser preview):** per-phase as above. No prospect copy changes → no sign-off gate here.
- **Live 2-party test (you run):** `/copilot` (or `/meet/[id]` therapist) ↔ `/meet` (prospect) — confirm
  in one pass: (a) **notes fix** — prospect sees filled notes even when cleaning finishes after they
  joined; (b) **sticky video** — Samuel's tile stays put while the column scrolls; (c) **fade-in-place** —
  beats crossfade with no per-beat scroll-jump, one scroll on first reveal.
- **Integration / README:** n/a (frontend-only).

## After implementation
- **Refresh `context-for-code-agent.md` (both repos):**
  - samwise-landing: /meet story now "leads, notes below" + fade-in-place (replaces scrollIntoView).
  - samwise-app: the editorial skin's component-shape pass (gold ✦ wordmark, hairline/flat cards,
    /ritual-call + WalkInShell de-darkened); note the notes-fix presence wiring.
- **Scoped commit messages (you commit — one `git commit -am` per repo):**
  - samwise-app, SHIP FIRST (Phase 0, already in the tree, scoped to one file):
    `git commit -am "fix(/meet): wire prospectPresent so the reactive notes snapshot actually fires"`
    → push + deploy, then run the 2-party notes test. (Will only sweep WalkInShell.tsx if you commit
    before starting Phase 2; Phase 2 also touches app files, so commit this first.)
  - samwise-app, Phase 2 (after): `feat(app): deepen editorial skin — gold ✦ wordmark, flat hairline
    cards, de-dark /ritual-call + /meet edge states` (sweeps page.tsx, globals.css,
    RitualCallExperience.tsx, WalkInShell.tsx).
  - samwise-landing, Phase 1 + stray-route deletion: `feat(/meet): story leads + fade-in-place beats;
    rm stray story-graphic-test route` (sweeps call-room.tsx, ritual-story.tsx, story.css, current-plan.md).
- **DELETE the stray prod route:** `rm -rf app/meet/story-graphic-test/` (it's tracked; the deletion
  lands in the landing commit above). The `story-graphic/` components have no page.tsx → harmless, leave
  for the promote-or-drop decision.
- Mark task DONE in the master Vibe doc Projects tab (your manual step).
