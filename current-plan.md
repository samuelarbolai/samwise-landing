# current-plan.md — Qualify notes: notes-first layout with sticky-bottom speaker dock

> Supersedes the Qualification Agent build plan (shipped — `/qualify`
> is live with voice + text modes and the live-notes panel). This
> plan reshapes the LAYOUT of the notes experience.

## Plan Summary

The `/qualify` notes UI today flips to a desktop row layout the moment
the first note arrives — mic on the left (~280px) and notes on the
right capped at `max-width: 24em` (~384px). Long verbatim agent
quotes (1–3 sentences each) wrap many lines inside that narrow column;
with seven cards stacked at `gap: 2rem`, the notes overflow the
viewport vertically and the user has to scroll past their own notes
to find the mic.

**Hierarchy inversion.** The notes are the *content* — what the user
came to see. The mic is a *control*. We invert the layout so notes
become the main column (centered, ~38em readable measure) and the
"speaker" element (mic in voice mode, `MessageInput` in chat mode)
docks at the bottom of the viewport — sticky, full-width, no painted
chrome. A gradient fade scrim above the dock dissolves notes as they
approach it, avoiding the "ugly box" appearance the user explicitly
rejected.

The shift activates only when the first note exists (same
`:has(.qualify-notes)` trigger as today). Pre-notes the layout stays
exactly as it is: welcome card centered, mic centered in the stage.

### Decisions locked

| Decision | Choice |
|---|---|
| Speaker anchoring | **Sticky bottom**, unreactive to scroll. Position: sticky; bottom: 0 within the viewport-scrolled stage. |
| Speaker container | **Dock spans the full horizontal area**; chrome-less (no border, no background swatch). Mic button stays centered inside the dock with its existing short gold dashes intact — Interpretation A from the design pass. PTT collapse animations preserved exactly. |
| Approaching content | **Gradient fade scrim** above the dock (~120px tall, transparent → page bg color). Notes scrolling toward the mic dissolve into the page surface before they would visually touch the button. |
| Notes width as main | **`max-width: 38em`** (~600px), centered in the stage. Comfortable Fraunces italic reading measure; the page still reads as a column, not a dashboard. |
| Trigger | First note arrives (`.qualify-voice:has(.qualify-notes)` / `.qualify-chat-layout:has(.qualify-notes)`). Pre-notes layout unchanged. |
| Mode coverage | **Both modes.** Voice in Phase 1; text-mode chat in Phase 2 (same patterns, mirrored). |
| Mobile | Same patterns apply on mobile — even more impactful since vertical real estate is tighter. The dock and fade scrim become sticky at viewport bottom; notes column relaxes to `max-width: 100%` minus side padding. |
| Layout transition | **Instant CSS snap** at the moment of first note. The notes panel itself fades/animates in via its existing entry keyframes — that motion provides the visual anchor for the change; no separate dock-relocation animation. |
| Stage cap | `.qualify-stage:has(.qualify-notes)` reverts from `max-width: 1100px` (chosen for the side-by-side row) to the standard `max-width` so the centered ~38em column reads as the page measure, not as a narrow column inside a wide frame. |

### Out of scope

- Animating the mic's relocation from "centered in flow" to "docked at bottom" (View Transitions API). Instant snap is the chosen behavior — the notes' own entry animation provides the moment of change.
- Reworking the PTT mic button's internal geometry (Interpretation B). The dashes stay short; the dock provides the full-width feel.
- Any prompt / agent / cloud-function changes. The data flow stays identical.
- `/copilot` or any consumer of qualification data — purely a `/qualify` UI change.

## Plan Architecture (Flow)

```
Before first note (unchanged):
┌─────────────────────────────────────┐
│           .qualify-stage            │
│                                     │
│        [ welcome card OR mic ]      │
│         centered in column          │
│                                     │
└─────────────────────────────────────┘

After first note (NEW):
┌─────────────────────────────────────┐
│           .qualify-stage            │
│                                     │
│        ┌─── ~38em column ───┐       │
│        │  NOTES CARD #1     │       │
│        │  NOTES CARD #2     │       │
│        │  …                 │       │
│        │  NOTES CARD #N     │       │
│        └────────────────────┘       │
│                                     │
│  (page scrolls under the dock)      │
│                                     │
│  ░░░░░░░░░░░ fade scrim ░░░░░░░░░░  │ ← gradient transparent → white
│ ─────────  TAP TO SPEAK  ────────── │ ← sticky bottom dock (full width)
└─────────────────────────────────────┘
```

DOM order stays mic-first → notes-second (matches current `voice-room.tsx`); CSS reorders visually via `order:` so the JSX doesn't change. This keeps the React tree stable across the layout change (no remounts, no state loss).

## Plan Structure (Directories and files)

```
samwise-landing/app/qualify/
├── voice-room.tsx              # MODIFIED Phase 1: wrap the mic in a
│                               #   .qualify-voice-mic-dock element so
│                               #   the dock can be sticky-positioned
│                               #   independently of .qualify-voice-primary
│                               #   (which still holds the welcome card
│                               #   when needed).
├── chat.tsx                    # MODIFIED Phase 2: same dock pattern for
│                               #   MessageInput.
└── qualify.css                 # MODIFIED Phases 1+2:
                                #   - Remove the row-layout block under
                                #     `.qualify-voice:has(.qualify-notes)`
                                #     (and the analogous chat block)
                                #   - Add notes-first column layout with
                                #     ~38em readable-measure cap
                                #   - Add .qualify-voice-mic-dock styling
                                #     (sticky bottom, gradient scrim, no
                                #     chrome) + .qualify-chat-input-dock
                                #     analog
                                #   - Update .qualify-stage:has(.qualify-notes)
                                #     to not widen to 1100px (revert to
                                #     standard cap so 38em reads centered)
```

No new files. No DOM restructuring beyond adding one wrapper `<div>` around the mic in `voice-room.tsx` and one around the `MessageInput` in `chat.tsx`.

## Modifications (in phases and steps)

### Phase 1 — Voice mode: notes-as-main + sticky-bottom mic dock

#### Step 1.1 — Wrap the mic in a dock element

- **In-file location:** `samwise-landing/app/qualify/voice-room.tsx`, the JSX block that today renders the welcome card / error / mic button (around lines 331–360).
- **Should not be modified:** the PTT state machine, the mic button's `onPointer*` handlers, the welcome card structure, the error block, the hidden `<audio>` sink, the variables-panel render call, the variables-state logic.
- **Code (diff intent — full block shown for clarity):**
  ```tsx
  <div className="qualify-voice">
    <audio ref={audioSinkRef} autoPlay playsInline style={{ display: "none" }} />

    <div className="qualify-voice-primary">
      {showWelcome && !error && (
        <div className="qualify-voice-welcome">
          <p className="qualify-voice-welcome-lead">{s.voice_welcome_lead}</p>
          <p className="qualify-voice-welcome-sub">{s.voice_welcome_sub}</p>
        </div>
      )}

      {error && (
        <div className="qualify-voice-status qualify-voice-error">{error}</div>
      )}

      {!showWelcome && !error && (
        <div className="qualify-voice-mic-dock">
          <button
            type="button"
            className={`qualify-voice-mic qualify-voice-mic-${micState}`}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerCancel={handlePressEnd}
            onPointerLeave={(e) => {
              if (e.buttons === 0) return
              handlePressEnd()
            }}
            aria-pressed={micState === "speaking-hold" || micState === "speaking-toggle"}
          >
            <span className="qualify-mic-text">{micLabel}</span>
          </button>
        </div>
      )}
    </div>

    <VariablesPanel lang={lang} variables={variables} />
  </div>
  ```
- **Explanation:** the dock wrapper is the element CSS sticky-positions. We keep it INSIDE `.qualify-voice-primary` so the welcome-card/error path is untouched. The dock's CSS rules below only kick in when notes exist (the parent `.qualify-voice` matches `:has(.qualify-notes)`), so pre-notes the dock is just a passive `<div>` and the mic centers exactly as it does today.

#### Step 1.2 — Rewrite the voice layout CSS

- **In-file location:** `samwise-landing/app/qualify/qualify.css`, lines 362–401 (the `.qualify-voice` block + the `:has(.qualify-notes)` row-layout block).
- **Should not be modified:** `.qualify-voice-status`, `.qualify-voice-welcome*`, `.qualify-voice-mic` (the button itself — colors, padding, dashes, PTT state transitions), the `@media (max-width: 540px) .qualify-voice-mic { ... }` mobile rule.
- **Code (replace lines 362–401):**
  ```css
  /* Pre-notes: centered column, unchanged. The dock sits in normal flow
     and looks identical to the bare button. */
  .qualify-voice {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    width: 100%;
  }

  .qualify-voice-primary {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
  }

  /* Post-notes: notes become the main column, dock pins to viewport
     bottom, full width, chrome-less. CSS `order` flips visual order
     so the DOM stays mic-first → notes-second (no React remounts). */
  .qualify-voice:has(.qualify-notes) {
    /* Notes column readable measure — match max-width on .qualify-notes
       below. Container is full-width; notes self-center via margin auto. */
    align-items: stretch;
    gap: 0;
    /* Reserve viewport bottom space for the dock so the last note card
       isn't permanently hidden beneath it. The dock is ~96px tall plus
       the fade scrim above (~120px); 200px is a safe combined buffer. */
    padding-bottom: 200px;
  }

  .qualify-voice:has(.qualify-notes) .qualify-voice-primary {
    /* The primary block now contains only the dock (welcome/error are
       both gone by the time notes exist). Order 2 → renders below the
       notes panel in the column. */
    order: 2;
    align-items: stretch;
    /* The dock handles its own width; primary stops constraining it. */
    width: 100%;
  }

  .qualify-voice:has(.qualify-notes) .qualify-notes {
    /* Notes lead the column. ~38em readable measure, centered. */
    order: 1;
    margin: 0 auto;
    max-width: 38em;
    width: 100%;
  }

  /* ── Speaker dock ── pre-notes: passive; post-notes: sticky bottom. */
  .qualify-voice-mic-dock {
    /* Pre-notes default: a simple flex centerer, indistinguishable
       from the bare button. */
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .qualify-voice:has(.qualify-notes) .qualify-voice-mic-dock {
    /* Post-notes: lock to viewport bottom. Sticky (not fixed) keeps it
       in document flow so it respects the stage's horizontal padding
       and doesn't escape the page measure. Negative inset trick: the
       dock's parent stage has horizontal padding; the dock matches
       that surface. */
    position: sticky;
    bottom: 0;
    /* Vertical breathing room above and below the mic inside the dock. */
    padding: 32px 0 28px;
    z-index: 2;
    /* No background, no border, no shadow — the fade scrim above does
       the visual work without painting a box. */
    background: transparent;
  }

  /* Fade scrim above the dock. Sits as a ::before pseudo-element that
     extends UPWARD from the dock's top edge into the scrollable area
     so notes scrolling toward the mic dissolve into the page surface
     before they would visually touch the button. Pointer-events none
     so it doesn't intercept clicks/taps. */
  .qualify-voice:has(.qualify-notes) .qualify-voice-mic-dock::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 120px;
    background: linear-gradient(
      to top,
      var(--bg) 0%,
      var(--bg) 28%,
      transparent 100%
    );
    pointer-events: none;
  }
  ```
- **Explanation:**
  - Pre-notes the layout is byte-for-byte equivalent to today (column, centered, dock collapses to a plain flex centerer).
  - Post-notes:
    - `order: 1` on notes, `order: 2` on primary → visual reordering without JSX change.
    - Notes get `max-width: 38em`, self-centered.
    - The dock becomes `position: sticky; bottom: 0` — full-width within the stage's horizontal padding, no chrome.
    - `::before` extends the page background upward as a gradient mask, dissolving any content that scrolls under it.
  - `padding-bottom: 200px` on `.qualify-voice` reserves space so the last note card is reachable above the dock (without this, the dock would visually overlap the final card when scrolled to the bottom of the page).

#### Step 1.3 — Revert the stage's widened cap

- **In-file location:** `samwise-landing/app/qualify/qualify.css`, lines 96–100.
- **Should not be modified:** the base `.qualify-stage` rules outside this `@media` block.
- **Change:** REMOVE the `.qualify-stage:has(.qualify-notes) { max-width: 1100px }` rule entirely. With the new notes-as-main column layout, the stage doesn't need to widen — the ~38em notes column centers comfortably inside the standard 640px stage cap (since 38em ≈ 608px and `.qualify-stage` will widen via its own `max-width` if set; we want the standard editorial measure).
- **Code:**
  ```css
  /* DELETE this entire block (lines 91–100):
     The notes-as-main layout uses the standard .qualify-stage cap. The
     38em readable measure for notes already fits the editorial column.
  @media (min-width: 720px) {
    .qualify-stage:has(.qualify-notes) {
      max-width: 1100px;
    }
  }
  */
  ```
  *(In the actual edit, delete the lines; this comment block is for explanation only.)*

#### Step 1.4 — Mobile: verify the dock works without changes

- **In-file location:** check `.qualify-voice-mic` mobile rules in qualify.css (around lines 869–877).
- **Verification:** the existing mobile rule `min-width: 0; width: 100%` for the mic at `max-width: 540px` already lets the button fill its parent. With the dock as parent and centered flex, this becomes a full-width button on mobile — exactly what we want for thumb reach.
- **Possible adjustment:** if the gold dashes look too "floating" on a 320–375px viewport, add `padding: 0 1.5rem` to the dock on mobile to inset the button from the page edges. Decision deferred to browser verification (Step 3.1).

### Phase 2 — Chat mode parity

#### Step 2.1 — Wrap MessageInput in a dock

- **In-file location:** `samwise-landing/app/qualify/chat.tsx`, the JSX inside `.qualify-chat`.
- **Should not be modified:** `useChat` wiring, the variables-sniffing effect, the outcome-finalize effect, `handleSend`, the `MessageList` props, the `MessageInput` props.
- **Code (diff intent):**
  ```tsx
  <div className="qualify-chat-layout">
    <div className="qualify-chat">
      <MessageList messages={messages} status={status} />
      <div className="qualify-chat-input-dock">
        <MessageInput
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={status === "submitted" || status === "streaming"}
          placeholder={lang === "es" ? "Escribe…" : "Type…"}
        />
      </div>
      {status === "error" && (
        <div className="qualify-chat-error">{s.error_generic}</div>
      )}
    </div>
    <VariablesPanel lang={lang} variables={variables} />
  </div>
  ```

#### Step 2.2 — Rewrite the chat layout CSS

- **In-file location:** `samwise-landing/app/qualify/qualify.css`, lines 545–576 (the chat-layout flex block + the `:has(.qualify-notes)` row-layout block + the `.qualify-chat` height-clamp block).
- **Should not be modified:** `.qualify-chat-list`, `.qualify-chat-error`, the bubble/transcript styles inside the chat.
- **Code:**
  ```css
  /* Pre-notes: column layout, chat container self-contained with its
     own height clamp (unchanged). */
  .qualify-chat-layout {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    width: 100%;
    align-items: stretch;
  }

  /* Post-notes (both desktop and mobile): notes become the main column,
     chat container abandons its height clamp and flows in-page, input
     docks at the viewport bottom. Mirrors the voice-mode pattern. */
  .qualify-chat-layout:has(.qualify-notes) {
    align-items: stretch;
    gap: 0;
    padding-bottom: 200px;
  }

  .qualify-chat-layout:has(.qualify-notes) .qualify-notes {
    order: 1;
    margin: 0 auto;
    max-width: 38em;
    width: 100%;
  }

  .qualify-chat-layout:has(.qualify-notes) > .qualify-chat {
    order: 2;
    /* Abandon the height clamp — transcript flows in-page above the
       sticky input dock. */
    height: auto;
    max-width: 38em;
    margin: 0 auto;
    width: 100%;
  }

  .qualify-chat-layout:has(.qualify-notes) .qualify-chat-list {
    /* In post-notes mode, the list is no longer the scrollable area
       (the page is). Remove the flex:1 fill behavior so it sizes to
       its content. */
    flex: 0 0 auto;
    overflow: visible;
  }

  /* Input dock — pre-notes: passive; post-notes: sticky bottom. */
  .qualify-chat-input-dock {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .qualify-chat-layout:has(.qualify-notes) .qualify-chat-input-dock {
    position: sticky;
    bottom: 0;
    padding: 24px 0 28px;
    z-index: 2;
    background: transparent;
  }

  .qualify-chat-layout:has(.qualify-notes) .qualify-chat-input-dock::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 120px;
    background: linear-gradient(
      to top,
      var(--bg) 0%,
      var(--bg) 28%,
      transparent 100%
    );
    pointer-events: none;
  }

  /* .qualify-chat base — keep the gap, drop the unconditional height
     clamp (it's now conditional on pre-notes; CSS-wise easier to keep
     height clamp here and override it post-notes as we did above). */
  .qualify-chat {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: clamp(420px, 70vh, 720px);
    gap: 1rem;
  }
  ```
- **Explanation:**
  - Pre-notes: chat container is the same self-contained card with internal scroll list and input pinned to its bottom (unchanged).
  - Post-notes: container abandons the height clamp; `MessageList` becomes a natural flow element; the input dock sticky-positions to the viewport bottom with the same gradient scrim as voice mode.
  - The chat container caps at 38em like the notes column so the two visual elements align.
  - Removes the desktop row-layout block (`.qualify-chat-layout:has(.qualify-notes) { flex-direction: row; ... }`) and the inner `.qualify-chat-layout:has(.qualify-notes) > .qualify-chat { max-width: 36em; flex: 1 1 0 }` rule from the old layout.

### Phase 3 — Browser verification

Per the samwise-landing-page skill's "Verification primitives that actually catch bugs" section. Use `preview_*` tools — never claim the layout works without testing.

#### Step 3.1 — Voice mode dry run with simulated notes

- Start preview: `preview_start` for samwise-landing.
- Open `/qualify`, pick English, type a name + email, click Talk.
- Wait through the welcome card (3s floor) and the LiveKit connect — verify pre-notes layout is unchanged (centered welcome → centered mic with gold dashes).
- **Simulate the first note via DevTools** (faster than waiting for a real agent turn): `preview_eval` to dispatch a synthetic data event:
  ```js
  // Inject a variable-update event the same shape the agent publishes.
  const payload = JSON.stringify({
    type: "qualification:variable_update",
    name: "behaviour_to_change",
    value: "stop scrolling my phone every time I feel anxious",
  })
  window.dispatchEvent(new CustomEvent('test-qualify-note', { detail: payload }))
  ```
  *(This requires temporarily wiring a `window.addEventListener('test-qualify-note', ...)` test hook into `voice-room.tsx`'s `RoomEvent.DataReceived` handler — gated behind `process.env.NODE_ENV !== 'production'`. Decide at implementation time: either add the test hook OR trigger via a real call.)*
- Verify:
  - Notes panel appears at the top with the new ~38em column width (`preview_inspect` `.qualify-notes` → `max-width: 38em`).
  - Mic dock becomes sticky at viewport bottom (`preview_inspect` `.qualify-voice-mic-dock` → `position: sticky`, `bottom: 0px`).
  - Fade scrim renders (`preview_inspect` `.qualify-voice-mic-dock::before` — check for non-zero height and the gradient background).
  - Inject 6 more notes (one for each `VariableKey`); verify they stack vertically inside the 38em column and the page scrolls — the mic remains visible at the bottom throughout.
  - `preview_screenshot` at three scroll positions: top of notes, middle of notes, bottom of notes. Verify the gradient fade dissolves notes gracefully into the page surface above the mic — no visible "edge" between content and dock.
- `preview_console_logs` `{ level: 'error' }` — confirm no warnings.

#### Step 3.2 — Pre-notes layout integrity

- Reload `/qualify`, repeat the connect flow without injecting notes.
- Verify the welcome card centers, then the mic centers (NO sticky behavior, NO scrim).
- `preview_inspect` `.qualify-voice-mic-dock` → `position: static` (the pre-notes default).

#### Step 3.3 — Mobile

- `preview_resize` to 375×667 (iPhone SE-ish).
- Repeat Step 3.1 with simulated notes.
- Verify the dock is full-width on mobile, the gold dashes don't visually clip the page edges (if they do, add the `padding: 0 1.5rem` mobile override mentioned in Step 1.4).
- `preview_screenshot` for visual confirmation.

#### Step 3.4 — Text mode (Phase 2)

- Repeat Steps 3.1–3.3 on the text-mode chat (click "I'd rather type" on the picker, then send a couple of messages that prompt the agent to commit variables — easier to verify with real conversation than to inject test events for chat mode since variables come from tool-call sniffing on the streamed message parts).

#### Step 3.5 — PTT state animations intact

- With the post-notes layout active, hold and release the mic button; tap and tap. Verify the gold-dash collapse-inward + center-expanding-underline animations still play exactly as before. (The button's geometry didn't change — only its parent's positioning did — so this should be a no-op verification, but worth a direct check.)

### Testing phase

- **Local test:** Steps 3.1–3.5 above. Local browser only; no integration test needed (no API or backend touched).
- **Integration test:** N/A — purely a CSS + DOM wrap change. No worker, no cloud function, no env var, no schema.
- **Update README:** N/A — there's no public README documenting the `/qualify` layout. The `context-for-code-agent.md` update below covers internal documentation.

### After implementation

- Update `samwise-landing/context-for-code-agent.md`:
  - In the `/qualify` section, replace the "side-by-side row layout when notes exist" description with the new "notes-as-main column + sticky-bottom speaker dock" description.
  - Mention the gradient fade scrim and the 38em readable measure as a defining detail of the post-notes layout (so future variants don't accidentally re-introduce the row layout).
- Update the **samwise-landing-page skill file** (`.claude/skills/samwise-landing-page/SKILL.md`) "/qualify — first-class route" section:
  - Replace the line "Layout: this rule styles the panel internals only..." block-comment guidance to reflect the new column-first geometry.
  - Add to the "What the user explicitly rejected" running list: "The row layout (mic-left + notes-right) for the post-first-note phase of /qualify — the notes get horizontally collapsed and overflow vertically. Notes-as-main + sticky-bottom dock is the landed pattern."
- Mark task DONE in the master Vibe doc Projects tab (manual user step).
