# current-plan.md — Pre-warmed opener acknowledgment + end-of-call hold

> Supersedes the notes-as-main layout plan (shipped — `/qualify`'s
> notes-as-main + fixed-bottom speaker dock is live).
>
> Two coordinated changes:
>   1. **Pre-warmed opener acknowledgment.** When a user comes in from
>      TikTok / Instagram / YouTube saying *"I've seen your videos, I
>      want to schedule a call,"* Nova acknowledges gladly in one beat,
>      then bridges back to the normal intake. Conversation from that
>      point is **identical** to the default flow — same grounding bar,
>      same variables, same end-of-call.
>   2. **End-of-call hold.** Between `endCall` firing and the FinalScreen
>      appearing there's a 3–10s extraction wait. Today the user sees
>      Nova's closing line, then silence + the still-active mic, then
>      suddenly the booking screen. Some users assume something broke
>      and close the tab. Fix: (a) update Nova's closing line to
>      explicitly tell the user to wait a moment; (b) the worker
>      publishes a `qualification:finalizing` data event the instant
>      `endCall` runs; (c) `voice-room` swaps the mic for a quiet
>      *"Almost there — pulling up your link."* line that breathes via
>      a slow opacity pulse, and disables PTT/spacebar; (d) a 30s safety
>      net force-routes to the qualified FinalScreen if the outcome
>      event never arrives, so the user is never stuck.

## Plan Summary

Three surfaces change:

| Surface | What changes |
|---|---|
| `samwise-landing/lib/qualify/qualification-prompt.ts` (+ worker mirror at `samwise-backend/ritual-agent/src/flows/qualification/prompts/qualification-prompt.ts`) | New `<pre-warmed-opener>` section (EN + ES) between `<exploration-and-reluctance>` and `<continuous-evaluation>`. Updated `<end-of-call>` examples (EN + ES) so the closing line MUST include a "hold on a moment" cue before endCall fires. |
| `samwise-backend/ritual-agent/src/flows/qualification/index.ts` | At the top of `submitIfNotYet`, when `reason === 'endCall'`, publish a `qualification:finalizing` data event BEFORE awaiting the cloud function. |
| `samwise-landing/app/qualify/voice-room.tsx` + `qualify.css` + `lib/qualify/strings.ts` | New `finalizing` state. On `qualification:finalizing`: replace mic with `.qualify-voice-finalizing` text line, force-disable mic + spacebar PTT, start 30s safety net that force-routes to `qualified` if the outcome event never arrives. |

### Decisions locked (from clarification)

| Decision | Choice |
|---|---|
| Wait UI feel | **Text-only, slow pulse.** Replace the whole mic+dashes with a single Fraunces italic line that breathes via slow opacity pulse. |
| Safety net | **30s after `qualification:finalizing`** without an outcome event → force `onOutcome("qualified")`, log a console error. The booking link is reachable; Firestore still gets the record once the CF eventually completes. |
| Pre-warmed flow | **Same conversation as default.** One beat of acknowledgment + bridge, then identical intake. No shorter call, no looser grounding bar. |
| Closing-line wording | Editorial register, brief. EN: "Stay with me one second — your booking link is on the way." ES: "Quédate conmigo un momento — el link para reservar ya viene." (Two example variants each, per the prompt's existing pattern of giving examples and asking Nova to phrase in her own voice.) |
| Wait-line wording | EN: "Almost there — pulling up your link." ES: "Casi listo — preparando tu enlace." Held register, names what's happening so the user knows what to wait for. |
| Pulse cadence | 2.5s ease-in-out infinite, opacity 1 → 0.5 → 1. Slow enough to feel held, not anxious. |
| Pre-warmed signals (the patterns Nova must recognize) | "I've seen your videos / TikToks / content" / "I want to schedule / book a call with Samuel / you / the team" / "I'm here from TikTok / Instagram / YouTube" / any opener that presupposes wanting the call without being prompted. |

### Out of scope

- The disconnect path (`participantDisconnected`) and `idle_timeout` path. Neither needs a finalizing event — the user is already gone.
- Any FinalScreen copy change. The wait happens before FinalScreen mounts; FinalScreen itself is unchanged.
- Text-mode (`chat.tsx`) finalize hold. Text mode is flag-gated off (`TEXT_MODE_ENABLED = false`). When/if it's re-enabled, an analogous treatment in `chat.tsx` will be a follow-up plan — not in this one.
- Any prompt change that shortens the call for pre-warmed users (explicitly rejected by user).
- Updating the `samwise-landing-page` skill file. The skill's `/qualify` section already documents the contract between the welcome card and the agent's opener; we'll add a one-line entry for the finalize-hold contract after the work lands.

## Plan Architecture (Flow)

```
Normal flow today:
  user → Nova converses → Nova says "Thanks, see you on the call." → endCall()
                                                                       ↓
                                                          worker POSTs transcript
                                                                       ↓ 3–10s
                                                       worker publishes outcome
                                                                       ↓ ~1.5s silence delay
                                                              FinalScreen mounts

New flow:
  user → (pre-warmed opener? → 1 beat acknowledge + bridge) → Nova converses
       → Nova says closing line WITH "stay with me a moment" cue → endCall()
                                                                       ↓ (immediate)
                                                worker publishes FINALIZING event
                                                                       ↓
                                                voice-room: mic → "Almost there…"
                                                            PTT + spacebar disabled
                                                            30s safety-net timer set
                                                                       ↓
                                                          worker POSTs transcript
                                                                       ↓ 3–10s
                                                       worker publishes outcome
                                                                       ↓ ~1.5s silence delay
                                                              FinalScreen mounts

Failure mode:
  After 30s in finalizing with no outcome → safety net fires → FinalScreen("qualified")
```

## Plan Structure (Directories and files)

```
samwise-landing/
├── app/qualify/
│   ├── voice-room.tsx           # MODIFIED Phase 3:
│   │                            #   - New `finalizing` state + ref
│   │                            #   - Data-event handler reacts to
│   │                            #     `qualification:finalizing`
│   │                            #   - Render branch: mic OR finalize
│   │                            #     indicator (mutually exclusive)
│   │                            #   - PTT handlers early-return when
│   │                            #     finalizing
│   │                            #   - Spacebar listener early-returns
│   │                            #   - 30s safety net timer set on
│   │                            #     finalizing-event receipt
│   └── qualify.css              # MODIFIED Phase 3:
│                                #   - .qualify-voice-finalizing rules
│                                #   - @keyframes pulse animation
├── lib/qualify/
│   ├── qualification-prompt.ts  # MODIFIED Phase 1:
│   │                            #   - New <pre-warmed-opener> section
│   │                            #     (EN + ES) between
│   │                            #     <exploration-and-reluctance> and
│   │                            #     <continuous-evaluation>
│   │                            #   - <end-of-call> examples updated
│   │                            #     (EN + ES) with hold-on cue
│   └── strings.ts               # MODIFIED Phase 3:
│                                #   - voice_finalizing_label (EN + ES)

samwise-backend/ritual-agent/
└── src/flows/qualification/
    ├── prompts/qualification-prompt.ts   # MIRROR of landing prompt
    │                                     # (Phase 2 — copy of Phase 1)
    └── index.ts                          # MODIFIED Phase 2:
                                          #   - submitIfNotYet('endCall')
                                          #     publishes finalizing event
                                          #     before awaiting CF fetch
```

No new files. No DOM restructuring.

## Modifications (in phases and steps)

### Phase 1 — Landing prompt: pre-warmed opener + closing-line hold cue

#### Step 1.1 — Add the `<pre-warmed-opener>` section (English)

- **In-file location:** `samwise-landing/lib/qualify/qualification-prompt.ts`, English branch. Insert AFTER the `</exploration-and-reluctance>` closing tag (currently at line 153) and BEFORE the `<continuous-evaluation>` opening tag.
- **Should not be modified:** the existing `<exploration-and-reluctance>` and `<continuous-evaluation>` blocks.
- **Code (insert this block):**
  ```
  <pre-warmed-opener>
  Some users come in already pre-warmed — they've seen Samwise's videos on TikTok, Instagram, or YouTube; they explicitly say they want to schedule a call, that they're here to book, or that they've been watching the founder's content. Recognize these signals when they appear in the user's first substantive turn:
    • "I've seen your videos / your content / your TikToks / your channel"
    • "I want to schedule / book a call with Samuel / with the team / with someone"
    • "I'm here from TikTok / Instagram / YouTube"
    • "I'm ready to talk to the team / to start"
    • Any opener that already presupposes wanting the call without being prompted to want it

  When you detect any of these, do TWO things in ONE warm short turn, then continue normally:
    1. Acknowledge gladly — one sentence, not a fuss. Examples (use your own phrasing): "Glad those landed — that already tells me you're showing up with intention." / "Means a lot you've been watching. Welcome." / "Good — you've already done part of the work."
    2. Bridge briefly to the intake: "Before we get to the call, let's take a few minutes so it has something real to land on." / "Quick check-in first so the call is actually useful."

  After that, the conversation is IDENTICAL to a default first-turn flow. Same behaviour grounding rules (<behaviour-grounding>). Same variables (<variables>). Same continuous evaluation (<continuous-evaluation>). Same end-of-call (<end-of-call>). Do NOT skip variables. Do NOT shorten the conversation. Pre-warmed users still need the same understanding to land on the call usefully.

  CRITICAL: this is a 1–2 beat acknowledgment, not a separate phase. By turn 3 you're already deep in the regular intake.
  </pre-warmed-opener>
  ```
- **Explanation:** placed between exploration-and-reluctance and continuous-evaluation because, like exploration-and-reluctance, it's a "specific opener handling" rule that runs once at the top of the conversation. Continuous-evaluation references the resulting state going forward, so this rule must come before it.

#### Step 1.2 — Add the `<pre-warmed-opener>` section (Spanish)

- **In-file location:** same file, Spanish branch. Insert AFTER `</exploration-and-reluctance>` and before `<continuous-evaluation>`.
- **Code:**
  ```
  <pre-warmed-opener>
  Algunos usuarios llegan ya pre-calentados — han visto los videos de Samwise en TikTok, Instagram o YouTube; dicen explícitamente que quieren agendar una llamada, que están aquí para reservar, o que han estado viendo el contenido del fundador. Reconoce estas señales cuando aparezcan en el primer turno sustancial del usuario:
    • "He visto tus videos / tu contenido / tus TikToks / tu canal"
    • "Quiero agendar / reservar una llamada con Samuel / con el equipo / con alguien"
    • "Vengo de TikTok / Instagram / YouTube"
    • "Estoy listo para hablar con el equipo / para empezar"
    • Cualquier apertura que ya presupone querer la llamada sin haber sido invitado a quererla

  Cuando detectes cualquiera de estas, haz DOS cosas en UN solo turno cálido y corto, después continúa normalmente:
    1. Reconoce con gusto — una frase, sin aspavientos. Ejemplos (usa tu propio fraseo): "Qué bueno que aterrizó eso — ya me dice que vienes con intención." / "Significa mucho que hayas estado viéndonos. Bienvenido." / "Bien — ya hiciste parte del trabajo."
    2. Puentea brevemente a la entrevista: "Antes de llegar a la llamada, démosle unos minutos a esto para que tenga algo real sobre lo cual aterrizar." / "Una pasada corta primero para que la llamada sea de verdad útil."

  Después de eso, la conversación es IDÉNTICA al flujo por defecto del primer turno. Las mismas reglas de aterrizaje del comportamiento (<behaviour-grounding>). Las mismas variables (<variables>). La misma evaluación continua (<continuous-evaluation>). El mismo cierre (<end-of-call>). NO saltes variables. NO acortes la conversación. Los usuarios pre-calentados igual necesitan la misma comprensión para que la llamada aterrice bien.

  CRÍTICO: esto es un reconocimiento de 1–2 beats, no una fase separada. Para el turno 3 ya estás de lleno en la entrevista regular.
  </pre-warmed-opener>
  ```

#### Step 1.3 — Update the `<end-of-call>` block with the hold-on cue (English)

- **In-file location:** `qualification-prompt.ts`, English branch, `<end-of-call>` block (lines 175–191).
- **What changes:** the example closing lines. The structural rule ("you MUST speak ONE short closing line BEFORE endCall") stays. The examples are replaced so each one bridges the wait that follows endCall. We also add an explicit rule that the closing line MUST tell the user to wait/hold/stay so they don't think the call broke.
- **Should not be modified:** the conditions for calling endCall (a/b/c), the "endCall takes no arguments" line, the "do not call endCall before behaviour_to_change is committed" rule, the "do not call endCall more than once" rule.
- **Code (replace the body of the `<end-of-call>` block — keep the opening tag, the cases (a)(b)(c), and the closing rules; only the closing-line guidance changes):**
  ```
  Before calling endCall, you MUST speak ONE short closing line in your own voice. The closing line MUST do two things:
    1. Acknowledge the conversation warmly (one beat — "Thanks for opening up about all of this." / "Appreciate you sharing.").
    2. Tell the user to stay/hold/wait a moment, because the booking link will appear on their screen in a few seconds. Without this cue, the user sees silence after your last word and assumes something broke.

  Examples (do not parrot — use your own phrasing):
    "Thanks for opening up about all of this. Stay with me one second — your booking link is on the way."
    "Appreciate you sharing. Hang on a moment — the link's about to appear on the screen."
    "Good talk. Give me a beat — your link is coming up now."

  Do NOT promise outcomes. Do NOT mention pricing, plans, or money. The link itself appears on the screen, not in your speech.

  endCall takes no arguments. After it returns, the conversation is over — you cannot speak again. CRITICAL: speak your closing line BEFORE calling endCall, not after.
  ```
  *(In the actual edit, this replaces the existing lines from "Before calling endCall, you MUST speak ONE short closing line in your own voice." down through "CRITICAL: speak your closing line BEFORE calling endCall, not after." — i.e. the body of the block; preserve the conditions (a/b/c) above this body and the "Do NOT call endCall before…" / "Do NOT call endCall more than once" lines below it.)*

#### Step 1.4 — Update the `<end-of-call>` block with the hold-on cue (Spanish)

- **In-file location:** `qualification-prompt.ts`, Spanish branch, `<end-of-call>` block (lines 355–371).
- **Code (replace the body analogously):**
  ```
  Antes de llamar endCall, DEBES decir UNA línea hablada corta de cierre con tus propias palabras. La línea de cierre DEBE hacer dos cosas:
    1. Reconocer la conversación con calidez (un beat — "Gracias por abrirte." / "Aprecio que hayas compartido todo esto.").
    2. Decirle al usuario que se quede/espere/aguante un momento, porque el link para reservar va a aparecer en su pantalla en unos segundos. Sin ese aviso, el usuario ve silencio después de tu última palabra y asume que algo se rompió.

  Ejemplos (no los repitas literal — usa tu propio fraseo):
    "Gracias por abrirte con todo esto. Quédate conmigo un momento — el link para reservar ya viene."
    "Aprecio tu apertura. Espera un segundo — el link va a aparecer en la pantalla."
    "Bien conversado. Aguanta un beat — tu link viene en camino."

  NO prometas resultados. NO menciones precios, planes ni dinero. El link aparece en la pantalla, no en tu voz.

  endCall no toma argumentos. Después de que retorne, la conversación termina — no puedes hablar de nuevo. CRÍTICO: di tu línea de cierre ANTES de llamar endCall, no después.
  ```

### Phase 2 — Worker: mirror the prompt + publish `qualification:finalizing`

#### Step 2.1 — Mirror the prompt changes into the worker

- **In-file location:** `samwise-backend/ritual-agent/src/flows/qualification/prompts/qualification-prompt.ts`.
- **What changes:** copy Steps 1.1, 1.2, 1.3, 1.4 verbatim into the worker mirror. The two files are kept in sync per the existing convention documented in `context-for-code-agent.md`.
- **Verification:** `diff samwise-landing/lib/qualify/qualification-prompt.ts samwise-backend/ritual-agent/src/flows/qualification/prompts/qualification-prompt.ts` should show only the documented copy-header difference (the worker file may have one comment block noting the copy origin, otherwise byte-identical).

#### Step 2.2 — Publish `qualification:finalizing` from `submitIfNotYet` on the endCall path

- **In-file location:** `samwise-backend/ritual-agent/src/flows/qualification/index.ts`, the `submitIfNotYet` function (currently ~lines 279–349). Insert the new publish BEFORE the `if (!EXTRACT_QUALIFICATION_URL)` guard and AFTER the `submitted = true` line / `buildTranscript` block.
- **Should not be modified:** the existing `submitted` guard, the transcript build, the cloud function fetch, the existing `qualification:outcome` publish (which still fires after the CF returns).
- **Code (add this block between the existing `console.log('[qualification] submitting', …)` line and the `if (!EXTRACT_QUALIFICATION_URL)` guard):**
  ```ts
  // Tell the frontend extraction is in progress — it swaps the mic for
  // the "Almost there — pulling up your link." indicator and disables
  // PTT so the user can't talk into a closing call. Only fired on the
  // endCall path; on disconnect / idle_timeout the user is already gone.
  if (reason === 'endCall') {
    try {
      await ctx.room.localParticipant?.publishData(
        new TextEncoder().encode(
          JSON.stringify({ type: 'qualification:finalizing' }),
        ),
        { reliable: true },
      );
    } catch (err) {
      console.warn('[qualification] finalizing publishData failed', err);
    }
  }
  ```
- **Explanation:** `qualification:finalizing` is a fire-and-forget signal — the frontend swaps to the wait UI immediately so the user has visible feedback during the 3–10s extraction window. The publish runs BEFORE the `await fetch` so it reaches the client without waiting for Gemini. The disconnect path explicitly skips it (the frontend is gone; nothing to render).

### Phase 3 — Voice-room: finalize state + wait UI + safety net

#### Step 3.1 — Add `voice_finalizing_label` strings

- **In-file location:** `samwise-landing/lib/qualify/strings.ts`.
- **Add to both `es` and `en` blocks** (alongside the other `voice_*` keys, ~line 28 / line 70):
  ```ts
  // es
  voice_finalizing_label: "Casi listo — preparando tu enlace.",
  // en
  voice_finalizing_label: "Almost there — pulling up your link.",
  ```

#### Step 3.2 — Add `finalizing` state + data-event branch + safety net in `voice-room.tsx`

- **In-file location:** `samwise-landing/app/qualify/voice-room.tsx`.
- **Should not be modified:** the `Outcome` type import, the `VALID_VARIABLE_KEYS` constant, the existing `MicState` machine, the existing outcome-finalize / silence-timer logic (the new finalizing state is upstream of the outcome event, NOT a replacement for the silence-handling).
- **Changes:**

  **3.2a — Add the finalizing state and a finalize-safety-net ref** (after the existing `welcomeFloorElapsed` state, ~line 86):
  ```ts
  // Set when the worker publishes `qualification:finalizing` (the
  // instant endCall fires). While true, the mic is replaced by the
  // "Almost there…" indicator and PTT/spacebar are disabled. Cleared
  // implicitly by the swap to <FinalScreen> on outcome.
  const [finalizing, setFinalizing] = useState(false)
  const finalizingRef = useRef(false)
  const finalizingSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mirror finalizing into a ref for use in PTT handlers (which are
  // memoized and don't re-bind when state changes).
  useEffect(() => {
    finalizingRef.current = finalizing
  }, [finalizing])
  ```

  **3.2b — Add a handler in the `RoomEvent.DataReceived` switch** (inside the existing try block in the data handler, ~line 138). Add the new `qualification:finalizing` branch alongside the existing `qualification:outcome` and `qualification:variable_update` branches:
  ```ts
  } else if (msg.type === "qualification:finalizing") {
    // Worker tells us extraction is in progress. Replace mic with
    // the wait indicator; force mic off in case the user was holding;
    // start the 30s safety net.
    setFinalizing(true)
    void setMicEnabled(false)
    setMicState("idle")
    if (finalizingSafetyTimerRef.current) {
      clearTimeout(finalizingSafetyTimerRef.current)
    }
    finalizingSafetyTimerRef.current = setTimeout(() => {
      // No outcome arrived in 30s. Force a transition so the user is
      // never stuck. Default to "qualified" — the booking link is the
      // same; the worker / cloud function will still write Firestore
      // when (or if) the extraction eventually completes.
      console.error("[qualify] finalizing safety net fired — no outcome event in 30s")
      deliberateDisconnectRef.current = true
      onOutcomeRef.current("qualified")
    }, 30000)
  }
  ```

  **3.2c — Clear the safety net on cleanup** (in the existing `return () =>` block of the LiveKit useEffect, ~line 226):
  ```ts
  if (finalizingSafetyTimerRef.current) clearTimeout(finalizingSafetyTimerRef.current)
  ```

  **3.2d — Also clear the safety net inside `finalizeOutcome`** (~line 105), so the safety net doesn't fire after the real outcome has been processed:
  ```ts
  if (finalizingSafetyTimerRef.current) {
    clearTimeout(finalizingSafetyTimerRef.current)
    finalizingSafetyTimerRef.current = null
  }
  ```
  (Add this alongside the existing `silenceTimerRef` and `maxWaitTimerRef` clears.)

  **3.2e — Make PTT handlers early-return when finalizing.** In `handlePressStart` (~line 249) and `handlePressEnd` (~line 270), add as the very first check:
  ```ts
  if (finalizingRef.current) return
  ```

  **3.2f — Make spacebar handlers early-return when finalizing.** In the `onKeyDown` / `onKeyUp` callbacks in the spacebar effect (~line 289), add after the `isTypingTarget` check:
  ```ts
  if (finalizingRef.current) return
  ```

  **3.2g — Change the render branch** to render the finalize indicator instead of the mic when `finalizing` is true. Replace the current `{!showWelcome && !error && (...)}` block (~lines 343–361) with:
  ```tsx
  {!showWelcome && !error && finalizing && (
    <div className="qualify-voice-mic-dock">
      <p className="qualify-voice-finalizing" aria-live="polite">
        {s.voice_finalizing_label}
      </p>
    </div>
  )}

  {!showWelcome && !error && !finalizing && (
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
  ```
  Both blocks share the same `.qualify-voice-mic-dock` parent so the dock geometry (sticky bottom, fade scrim) is identical — only the content inside swaps.

#### Step 3.3 — Add `.qualify-voice-finalizing` CSS

- **In-file location:** `samwise-landing/app/qualify/qualify.css`. Add after the existing `.qualify-voice-mic-*` rules, before any media queries that affect the voice dock.
- **Code:**
  ```css
  .qualify-voice-finalizing {
    margin: 0;
    font-family: var(--font-fraunces), Georgia, "Times New Roman", serif;
    font-style: italic;
    font-size: 20px;
    line-height: 1.4;
    color: var(--ink);
    text-align: center;
    letter-spacing: 0;
    pointer-events: none;
    animation: qualify-voice-finalizing-pulse 2.5s ease-in-out infinite;
  }

  @keyframes qualify-voice-finalizing-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @media (prefers-reduced-motion: reduce) {
    .qualify-voice-finalizing {
      animation: none;
      opacity: 0.85;
    }
  }
  ```
- **Explanation:** matches the editorial register (Fraunces italic, ink color, no chrome). The pulse cadence (2.5s) is slow enough to feel held, not anxious. `prefers-reduced-motion` degrades to a static slightly-muted line.

### Phase 4 — Browser verification

Per the samwise-landing-page skill's verification primitives. Use `preview_*` tools.

#### Step 4.1 — Pre-warmed opener acknowledgment (English)

- Start preview. Open `/qualify`, pick English, type name + email, click Talk.
- Wait through welcome card + LiveKit connect.
- When Nova greets, reply: *"Yes, that's right — I've seen your videos and I want to schedule a call with Samuel."*
- Verify Nova's reply contains: (a) a warm acknowledgment beat (e.g. "Glad those landed", "Means a lot you've been watching"), AND (b) a bridge to the intake ("let's take a few minutes", "quick check-in first"), AND (c) does NOT skip variables — her next move is to ask about the behaviour they want to change. Continue the conversation through behaviour grounding and verify variables fill normally.
- `preview_screenshot` of the transcript / notes panel to confirm normal flow.

#### Step 4.2 — Pre-warmed opener acknowledgment (Spanish)

- Repeat 4.1 with Spanish picker. Reply: *"Sí, así es — he visto tus videos en TikTok y quiero agendar una llamada con Samuel."*
- Verify the same shape (warm acknowledgment + bridge + continues into normal intake).

#### Step 4.3 — End-of-call hold (English)

- Continue an end-to-end conversation through to natural close (or use an existing conversation from 4.1).
- When Nova reaches the end, listen for the closing line. Verify it contains an explicit "stay with me a moment" / "hold on" cue, not just "see you on the call."
- The moment Nova finishes the closing line, observe the mic dock — verify it swaps from the mic button to the *"Almost there — pulling up your link."* indicator with the slow opacity pulse.
- `preview_inspect` `.qualify-voice-finalizing` → verify `font-style: italic`, animation running.
- Try pressing the dock area: nothing should happen (no PTT engagement).
- Try pressing spacebar: nothing should happen.
- After 3–10s, FinalScreen appears with the booking link.
- `preview_screenshot` at the three moments: closing line, wait indicator, FinalScreen.

#### Step 4.4 — End-of-call hold (Spanish)

- Repeat 4.3 in Spanish. Verify the closing line is bilingual-correct and the wait label reads "Casi listo — preparando tu enlace."

#### Step 4.5 — Safety net

- Hard to trigger naturally. Use `preview_eval` to manually inject a `qualification:finalizing` event without a subsequent outcome:
  ```js
  // Find the LiveKit Room (exposed via React internals — easier path:
  // dispatch into the data handler via the room reference if accessible.
  // If not easily accessible from console, skip the manual injection and
  // verify the safety net behavior by reading the code path.)
  ```
  Or, simpler: temporarily comment out the `qualification:outcome` publish in the worker locally, force `endCall`, and verify after 30s the FinalScreen appears with the qualified treatment. Re-enable the publish after the test.
- Verify console logs `[qualify] finalizing safety net fired — no outcome event in 30s`.

#### Step 4.6 — Reduced-motion

- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`.
- Trigger the finalize state. Verify the pulse animation is suppressed; the text appears static at ~0.85 opacity.

#### Step 4.7 — Pre-notes path integrity (regression check)

- The mic-button render path is unchanged in the default case. Open `/qualify`, connect, but do NOT finalize the call — verify the welcome → mic flow is byte-identical to today, the PTT collapse animations still play, and the gold dashes still expand on hover. (Insurance against accidentally regressing the two-branch refactor of Step 3.2g.)

### Testing phase

- **Local test:** Steps 4.1–4.7 above. Local browser only.
- **Worker integration:** the worker change (Step 2.2) requires the agent to be running in dev mode against the local landing page, OR deployed to LiveKit Cloud. Spin up via `pnpm dev` in `samwise-backend/ritual-agent/`. Confirm the `qualification:finalizing` event reaches the client via DevTools Network → LiveKit data channel inspection (or a temporary `console.log` in the voice-room's data handler).
- **Prompt sync check:** before commit, `diff` the two prompt files to confirm they're in sync.
- **Update README:** N/A.

### After implementation

- Add a one-line entry to `samwise-landing/context-for-code-agent.md` under the `/qualify` section about the finalize-hold contract (worker publishes `qualification:finalizing` on endCall; voice-room swaps mic → "Almost there…" indicator; 30s safety net).
- Update the `samwise-landing-page` skill file's `/qualify` section: add the finalize-hold pattern to the "Conventions specific to /qualify" list and add the closing-line wait-cue rule to the "the welcome card and Nova's 'agent speaks first' config are linked" bullet (the same kind of contract). Also add a new running-list entry: "Closing line without a 'hold on a moment' cue — leaves the user staring at silence during the 3–10s extraction wait."
- Mark task DONE in the master Vibe doc Projects tab (manual user step).
