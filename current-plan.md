# current-plan.md — Qualification Agent (`/qualify`)

> Previous plan (`/quiet-cta` variant) is FINISHED — the corner CTA was
> promoted to canonical and the variant folder is no longer the active
> work. This plan supersedes it.

> **MIGRATION NOTE (2026-05-19):** Phase 2 was originally drafted and
> partially built as a new standalone agent module at
> `samwise-backend/qualification-agent/`. Mid-implementation the user
> corrected the approach — the canonical pattern (encoded in the
> `samwise-livekit-agents` skill) is **one worker serving multiple
> flows via dispatch metadata**. The qualification flow now lives at
> `samwise-backend/ritual-agent/src/flows/qualification/` alongside
> `flows/call/` and `flows/onboarding/`. The standalone module was
> deleted. **Phase 2 step-by-step references below to
> `samwise-backend/qualification-agent/` are STALE PATHS** — the real
> code lives in `ritual-agent/src/flows/qualification/`. Steps that
> referenced `lk agent create` / new Dockerfile / new livekit.toml /
> new package.json no longer apply: the flow rides on
> `ritual-agent`'s existing deploy. Deploy = re-deploy `ritual-agent`.

## Plan Summary

A first-touch web agent at `samwise-landing/app/qualify/` that runs the **Fit Assessment Call** in conversation. **Voice is the primary modality**, text is a fallback toggle. The route opens to a language picker (`English` / `Español`), then drops the user into a LiveKit voice room (default) or a streaming chat (if they clicked "use text instead").

Both modalities share:
- one system prompt (`samwise-landing/lib/qualify/prompt.ts`)
- one Zod schema (`samwise-landing/lib/qualify/schema.ts`)
- one tool — `submitQualification` — called exactly once at the end of the conversation

The tool posts to a new Firebase cloud function (`submitQualification`) which evaluates the rubric server-side and writes `qualifications/{prospectKey}-{ts}` to Firestore. The outcome (`qualified` / `disqualified` / `safety_flagged`) is returned to the frontend (text: tool-result; voice: data channel) and the chat/room is replaced by `<FinalScreen>`.

`/copilot` in `samwise-app` gets a small additive change: a "Load qualification" UI block that reads the doc by prospect identifier (new cloud function `loadQualification`) and pre-fills matching variables.

### Decisions locked

| Decision | Choice |
|---|---|
| Host | `samwise-landing/app/qualify/` — real first-class route (not a variant) |
| Modality | **Voice-first** + text fallback toggle. Both in v1. |
| Language UX | Explicit picker as the first screen ("English" / "Español"). No auto-detection. |
| Persona | **Nova** — curious interviewer; brief + observation-led |
| Rubric | Fit Assessment doc (Google Doc `1pcE3Y7BZB_xUBFHK3der_CEvgaKazHZabV2utFZfCKM`). 3 Priority-1 gates + 2 safety gates. |
| Persistence | Firestore `qualifications` collection, keyed by `prospectKey` |
| DQ outcome | Same demo-call link, **assertive** note. Copy reviewed during build. |
| Safety outcome | No demo link — professional-referral message. |
| Entrypoint | Both existing landing Cal CTAs (hero corner + primary `#try`) retarget to `/qualify` |
| Demo-call link | `https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment` |
| LLM | `gemini-2.5-flash` (both modes) |
| STT (voice) | Deepgram |
| TTS (voice) | Cartesia. Voice ids reused from `samwise-backend/ritual-agent/src/config/voiceIds.ts`:<br>• `en`: `5ee9feff-1265-424a-9d7f-8e4d431a12c7`<br>• `es`: `b042270c-d46f-4d4f-8fb0-7dd7c5fe5615` |
| VAD | Silero |
| Worker deploy | **No new agent.** The qualification flow runs as a new `flows/qualification/` inside the existing `samwise-backend/ritual-agent/` worker (alongside `call` and `onboarding`). Deploys via the existing `lk agent deploy` for `ritual-agent`. Selected at runtime via dispatch metadata `flow: "qualification"`. |
| Agent shape | **Two agents with one handoff.** **Intake Agent** (greeter + P1 gates + safety). **Capture Agent** (P2 verbatim, only loaded on the qualified path). Decision tool: `gateDecision({ qualified, safetyFlagged, p1AndSafetyData })` — either ends the session via `submitQualification` (DQ/safety) or hands off to Capture. |
| Voice UX | **Push-to-talk, hybrid hold-or-tap-toggle.** Press-and-release within 200ms → toggle mic on (tap again to end turn). Press-and-hold beyond 200ms → mic on while held, release ends turn. Spacebar mirrors the on-screen button on desktop. |

### Out of scope

- Live human-rep handoff at end-of-conversation.
- Multi-prospect dashboard / inbox.
- A/B persona testing.
- `next-intl` or any i18n framework — bilingual is prompt-driven + 2-file string maps.
- Cal.com API pre-fill (we hand out a plain link).
- Touching `samwise-app/current-plan.md` or `samwise-backend/cloud-functions/functions/src/current-plan.md`. Phase 1 + Phase 6 are additive.

## Plan Architecture (Flow)

```
User clicks landing CTA → /qualify
                            │
                            ▼
            ┌───────── language picker ─────────┐
            │   [English]    [Español]          │
            │   "use text instead" link below   │
            └─────────────────┬─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼ (default)                      ▼ (toggle)
        VOICE ROOM (PTT)                   TEXT CHAT
        livekit-client Room                AI SDK useChat
        ↳ POST /api/qualify/voice-init     ↳ POST /api/qualify/chat
          (mints token + dispatches          (streamText with tools)
           agent with metadata
           { language, persona: "nova" })
        ↳ worker spawns Intake Agent
                              │
                ┌─────────────┴──────────────┐
                ▼                            ▼
            INTAKE AGENT               (text mode uses the same prompt
            greeter + P1 + safety       skeleton — handoff is simulated
                              │         via a single agent stage; tool
                              ▼         decisions still gate the calls)
            calls gateDecision({ qualified, safetyFlagged, p1AndSafetyData })
                              │
                ┌─────────────┴──────────────┐
                ▼                            ▼
       DQ or safety path             qualified path
       → submitQualification          → HANDOFF to Capture Agent
         immediately                  → P2 verbatim capture
         (P1+safety data only)        → submitQualification (full payload)
                              │
                              ▼
        Cloud function evaluates rubric, writes Firestore
                              │
                              ▼
        Outcome reaches frontend
        (text: tool-result; voice: data channel "qualification:outcome")
                              │
                              ▼
        <FinalScreen outcome="qualified"|"disqualified"|"safety_flagged" />
                              │
                qualified / DQ: demo-call link (+assertive note if DQ)
                safety: professional-referral message, no link
```

## Plan Structure (Directories and files)

```
samwise-landing/
├── app/
│   ├── page.tsx                       # MODIFIED Phase 4: retarget hero corner + primary CTA → /qualify
│   ├── qualify/
│   │   ├── page.tsx                   # NEW: language picker → voice room (default) | text chat (toggle)
│   │   ├── language-picker.tsx        # NEW: client component, two buttons + text-mode link
│   │   ├── voice-room.tsx             # NEW: client, livekit-client Room
│   │   ├── chat.tsx                   # NEW: client, useChat
│   │   ├── qualify.css                # NEW: scoped styles
│   │   └── components/
│   │       ├── message-list.tsx       # NEW (text mode)
│   │       ├── message-input.tsx      # NEW (text mode)
│   │       └── final-screen.tsx       # NEW: qualified / DQ / safety
│   └── api/
│       └── qualify/
│           ├── voice-init/route.ts    # NEW: LiveKit token + dispatch
│           └── chat/route.ts          # NEW: AI SDK streamText with tool
├── lib/
│   └── qualify/
│       ├── persona.ts                 # NEW: Nova characterization (es/en)
│       ├── intake-prompt.ts           # NEW: Intake stage prompt builder (Nova, P1+safety)
│       ├── capture-prompt.ts          # NEW: Capture stage prompt builder (Nova, P2 verbatim)
│       ├── schema.ts                  # NEW: Zod schemas — gateDecisionPayload + submitQualificationPayload
│       └── strings.ts                 # NEW: { es, en } string map for UI copy
└── package.json                       # MODIFIED: + ai, @ai-sdk/google, @ai-sdk/react, zod, livekit-client, livekit-server-sdk

samwise-backend/cloud-functions/functions/src/
└── index.ts                           # MODIFIED Phase 1: + submitQualification + loadQualification

samwise-backend/ritual-agent/        # EXISTING worker — gains a new flow (Phase 2)
├── src/
│   ├── main.ts                      # MODIFIED: + case 'qualification' in the flow switch
│   ├── types/metadata.ts            # MODIFIED: + QualificationMeta in DispatchMeta union; + 'qualification' branch in parseDispatchMetadata
│   └── flows/
│       └── qualification/           # NEW FLOW (in-place; no new agent name, no new deploy)
│           ├── index.ts             # NEW: runQualificationFlow (builds AgentSession, starts IntakeAgent)
│           ├── intake.ts            # NEW: IntakeAgent (greeter + P1 + safety) + gateDecision tool
│           ├── capture.ts           # NEW: CaptureAgent (P2 verbatim) + submitQualification tool
│           ├── schema.ts            # NEW: COPY of samwise-landing/lib/qualify/schema.ts
│           └── prompts/
│               ├── persona.ts         # NEW: COPY of samwise-landing/lib/qualify/persona.ts
│               ├── intake-prompt.ts   # NEW: COPY of samwise-landing/lib/qualify/intake-prompt.ts
│               └── capture-prompt.ts  # NEW: COPY of samwise-landing/lib/qualify/capture-prompt.ts

samwise-app/                           # Phase 6 (deferred — gated on Session-copilot reaching FINISHED)
├── app/copilot/page.tsx               # MODIFIED: + "Load qualification" UI block
└── lib/copilot/load-qualification.ts  # NEW: wrapper around loadQualification cloud function
```

## Modifications (in phases and steps)

### Phase 1 — Cloud functions: `submitQualification` + `loadQualification`

#### Step 1.1 — `submitQualification`

- **In-file location:** new export at end of `samwise-backend/cloud-functions/functions/src/index.ts`.
- **Should not be modified:** all existing exports, the `cors`, `requireEnv`, `getFirestore`, Drive/Gemini clients.
- **Code:**
  ```ts
  export const submitQualification = onRequest({ cors: true }, async (req, res) => {
    interface QualificationPayload {
      prospect_name: string
      contact_email?: string
      contact_phone?: string
      language: "es" | "en"

      decision_taken: "Y" | "N"
      behaviour_clarity: "clear" | "vague"
      motivation_clarity: "clear" | "vague"

      acute_risk_flag: "Y" | "N"
      ownership_self_reported: "self" | "external"

      behaviour_to_change?: string
      core_motivation?: string
      problem_duration_self_reported?: string
      life_stage_context?: string
      symbolic_anchor_type?: "religious" | "philosophical" | "esoteric" | "hyper-rational" | "none"
      symbolic_anchor_description?: string
      alternatives_tried?: string
      why_alternatives_failed?: string
      alternatives_exhaustion_level?: "low" | "medium" | "high"
    }

    if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return }

    const payload = req.body as QualificationPayload

    const qualified =
      payload.decision_taken === "Y" &&
      payload.behaviour_clarity === "clear" &&
      payload.motivation_clarity === "clear"

    const safetyFlagged =
      payload.acute_risk_flag === "Y" ||
      payload.ownership_self_reported === "external"

    const outcome: "qualified" | "disqualified" | "safety_flagged" =
      safetyFlagged ? "safety_flagged" : qualified ? "qualified" : "disqualified"

    const prospectKey = (payload.contact_phone || payload.contact_email || payload.prospect_name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const db = getFirestore()
    const docId = `${prospectKey}-${Date.now()}`
    await db.collection("qualifications").doc(docId).set({
      ...payload,
      outcome,
      qualified,
      safetyFlagged,
      createdAt: new Date().toISOString(),
      prospectKey,
    })

    res.status(200).json({ ok: true, docId, outcome, prospectKey })
  })
  ```
- **Explanation:** rubric is evaluated server-side — never trust the client. Always writes the doc (we want the data even from DQ users).

#### Step 1.2 — `loadQualification`

- **In-file location:** export immediately after `submitQualification`.
- **Code:**
  ```ts
  export const loadQualification = onRequest({ cors: true }, async (req, res) => {
    interface LoadQueryPayload { identifier: string }
    if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return }
    const { identifier } = req.body as LoadQueryPayload

    const normalized = identifier
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const db = getFirestore()
    const snap = await db.collection("qualifications")
      .where("prospectKey", "==", normalized)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get()

    if (snap.empty) { res.status(200).json({ ok: false, reason: "not_found" }); return }
    res.status(200).json({ ok: true, qualification: snap.docs[0].data() })
  })
  ```
- **Explanation:** simplest read — most recent doc by prospect key. Firestore composite index (`prospectKey` + `createdAt desc`) is auto-prompted on first call.

#### Step 1.3 — Deploy + capture URLs

- `firebase deploy --only functions:submitQualification,functions:loadQualification` from the cloud-functions root.
- Capture the run URLs (e.g. `https://submitqualification-<hash>-uc.a.run.app`). These become env vars in Phases 2–6.

### Phase 2 — Backend voice agent (LiveKit worker)

#### Step 2.0 — Create the module's working files

Before any code:
- `samwise-backend/qualification-agent/context-for-code-agent.md` — copy structure from `ritual-agent`'s file; document: parent project, agent role (web qualification agent), tools, env vars, deploy target.
- `samwise-backend/qualification-agent/current-plan.md` — points back at this master plan; describes Phase 2 in detail.
- `samwise-backend/qualification-agent/programming-style.md` — LiveKit Agent patterns (XML prompting, Zod tools, lifecycle state capturing) per the canonical samwise programming-style.md.

#### Step 2.1 — Scaffold

- From `samwise-backend/`: `lk agent init qualification-agent --template agent-starter-node`.
- Lift `Dockerfile`, `livekit.toml`, `pnpm-workspace.yaml`, `tsconfig.json` from `ritual-agent/` (per `samwise-livekit-agents` skill — project-specific Dockerfile patches required for production deployment).
- Deps: `@livekit/agents`, `@livekit/agents-plugin-deepgram`, `@livekit/agents-plugin-google`, `@livekit/agents-plugin-cartesia`, `@livekit/agents-plugin-silero`, `zod`.

#### Step 2.2 — Copy shared files from the landing module

- `samwise-landing/lib/qualify/intake-prompt.ts` → `samwise-backend/qualification-agent/src/prompts/intake-prompt.ts`
- `samwise-landing/lib/qualify/capture-prompt.ts` → `samwise-backend/qualification-agent/src/prompts/capture-prompt.ts`
- `samwise-landing/lib/qualify/schema.ts` → `samwise-backend/qualification-agent/src/schema.ts`
- `samwise-backend/ritual-agent/src/config/voiceIds.ts` → `samwise-backend/qualification-agent/src/config/voiceIds.ts`

Add a one-line comment at the top of each copied file: `// COPY of samwise-landing/lib/qualify/… — keep in sync. Future task: extract to shared package.`

#### Step 2.2.5 — Verify LiveKit Agents handoff SDK surface

Before writing `intake.ts`, lock the exact handoff API for the installed SDK version:

- Run `lk docs get-page /agents/build/workflows` and skim for the canonical Node SDK handoff pattern.
- Cross-check against `node_modules/@livekit/agents/dist/**/*.d.ts` — search for `handoff`, `transferTo`, and `Agent`'s class members. The `agent.handoff(new CaptureAgent(...))` call in Step 2.4 is illustrative; the real API may instead be `return new CaptureAgent(...)` from the tool's `execute`, or a session-level call.
- Update Step 2.4's `execute` body to match. If the SDK doesn't expose handoffs in Node, fall back to one of:
  - **Fallback A:** single `AgentSession` with `session.updateInstructions(...)` and `session.tools = {...}` to mutate in place. Less clean but always available.
  - **Fallback B:** a state-machine-in-a-single-Agent, where one agent's `<closing>` includes the Capture instructions and a marker the tool's `execute` looks for. (This collapses to the text-mode shape — only do this if A doesn't work.)
- Capture the resolved API in a short comment at the top of `intake.ts` so future readers can find the source quickly.

#### Step 2.3 — Worker entry + shared session

- **`src/main.ts`** — standard worker entry, mirror `ritual-agent/src/main.ts`. On a new job:
  - Read dispatch metadata `{ language: "es"|"en", persona: "nova" }`.
  - Build the shared `AgentSession` (Step 2.4).
  - Construct `IntakeAgent` (Step 2.5) and `session.start({ agent: intakeAgent, room })`.

- **`src/session.ts`** — single function `buildSession(language: "es" | "en")` that returns an `AgentSession` wired with:
  - Deepgram STT (language-aware: `nova-2` with `language: "es"` or `"en"`).
  - Google Gemini 2.5 Flash LLM.
  - Cartesia TTS using `VOICE_ID_BY_LANGUAGE[language]`.
  - Silero VAD + LiveKit turn detector (multilingual).
  - PTT-aware turn detection: `disable_vad_during_off_mic = true` so the session only listens to user audio when the frontend has the mic open.
  - Lifecycle state on the session: `userTurnCount`, `p1ResultsSeen`, `handoffOccurred`. Tracked via `session.on(ConversationItemAdded, ...)` and used in the shutdown callback to log success/abandonment.

#### Step 2.4 — Intake Agent

- **Location:** `src/agents/intake.ts`.
- **Job:** warm greeter, weave in P1 gates (`decision_taken`, `behaviour_clarity`, `motivation_clarity`), check safety (`acute_risk_flag`, `ownership_self_reported`). Calls `gateDecision` exactly once when it has the answers.
- **Instructions source:** `buildIntakePrompt(meta.language)` from `src/prompts/intake-prompt.ts` (see Phase 3 Step 3.2 for the body and shape).
- **Tool: `gateDecision`** — the only tool registered on this agent.
  ```ts
  import { llm, defineAgent, Agent } from "@livekit/agents"
  import { GateDecisionSchema, QualificationPayloadSchema } from "../schema"
  import { buildIntakePrompt } from "../prompts/intake-prompt"
  import { CaptureAgent } from "./capture"

  const SUBMIT_QUALIFICATION_URL = process.env.SUBMIT_QUALIFICATION_URL!

  export class IntakeAgent extends Agent {
    constructor(private readonly meta: { language: "es" | "en"; persona: "nova" }) {
      super({
        instructions: buildIntakePrompt(meta.language),
        tools: {
          gateDecision: llm.tool({
            description:
              "Call EXACTLY ONCE when you have established P1 and safety. Either ends the call (DQ/safety) or hands off to the Capture agent (qualified).",
            parameters: GateDecisionSchema,
            execute: async (payload, { agent, ctx }) => {
              const qualified =
                payload.decision_taken === "Y" &&
                payload.behaviour_clarity === "clear" &&
                payload.motivation_clarity === "clear"

              const safetyFlagged =
                payload.acute_risk_flag === "Y" ||
                payload.ownership_self_reported === "external"

              // DQ or safety: submit immediately with the P1+safety data only.
              if (!qualified || safetyFlagged) {
                const fullPayload = { ...payload, language: this.meta.language }
                const resp = await fetch(SUBMIT_QUALIFICATION_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(fullPayload),
                })
                const data = await resp.json() as { outcome: string }
                await ctx.room.localParticipant.publishData(
                  new TextEncoder().encode(JSON.stringify({ type: "qualification:outcome", outcome: data.outcome })),
                  { reliable: true }
                )
                return { handedOff: false, outcome: data.outcome }
              }

              // Qualified path: hand off to Capture.
              return agent.handoff(new CaptureAgent(this.meta, payload))
            },
          }),
        },
      })
    }
  }
  ```
- **Explanation:** the tool is the only place rubric evaluation happens. The LLM provides the raw inputs; we never trust the model to decide "qualified" — we compute it. `agent.handoff(new CaptureAgent(...))` is the LiveKit Agents handoff primitive — STT/TTS/VAD stay, only instructions + tools swap. The P1+safety data is passed to Capture's constructor so the Capture prompt can reference it.

#### Step 2.5 — Capture Agent

- **Location:** `src/agents/capture.ts`.
- **Job:** capture P2 verbatim (behaviour_to_change, core_motivation, problem_duration_self_reported, life_stage_context, symbolic_anchor_{type,description}, alternatives_tried, why_alternatives_failed, alternatives_exhaustion_level). When done → call `submitQualification` with the full payload (P1+safety+P2). One short human close, then session ends.
- **Instructions source:** `buildCapturePrompt(meta.language, p1AndSafety)` — the prompt embeds the P1+safety data so the LLM doesn't ask the user to repeat themselves.
- **Tool: `submitQualification`** — the only tool.
  ```ts
  import { llm, Agent } from "@livekit/agents"
  import { QualificationPayloadSchema, type GateDecisionPayload } from "../schema"
  import { buildCapturePrompt } from "../prompts/capture-prompt"

  const SUBMIT_QUALIFICATION_URL = process.env.SUBMIT_QUALIFICATION_URL!

  export class CaptureAgent extends Agent {
    constructor(
      private readonly meta: { language: "es" | "en"; persona: "nova" },
      private readonly p1AndSafety: GateDecisionPayload,
    ) {
      super({
        instructions: buildCapturePrompt(meta.language, p1AndSafety),
        tools: {
          submitQualification: llm.tool({
            description: "Submit the full qualification payload (P1+safety+P2). Call EXACTLY ONCE at the end.",
            parameters: QualificationPayloadSchema,
            execute: async (payload, { ctx }) => {
              const resp = await fetch(SUBMIT_QUALIFICATION_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })
              const data = await resp.json() as { ok: boolean; outcome: string; docId: string; prospectKey: string }
              await ctx.room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({ type: "qualification:outcome", outcome: data.outcome })),
                { reliable: true }
              )
              return data
            },
          }),
        },
      })
    }
  }
  ```
- **Explanation:** Capture's prompt is narrower than Intake's — it's pure verbatim-capture mode, no gate-running language, no safety prompts. Lower drift, sharper instruction.

#### Step 2.6 — Deploy

- `lk agent deploy` from `qualification-agent/`.
- Set env on the deployed worker: `SUBMIT_QUALIFICATION_URL`, `DEEPGRAM_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `CARTESIA_API_KEY`.
- Capture the deployed agent name (call it `qualification-agent` — matches `livekit.toml`).

#### Step 2.7 — Local smoke test

- `pnpm run download-files` (downloads Silero VAD + turn-detector weights).
- `pnpm run dev` — worker listens for dispatches.
- Use the LiveKit Playground with metadata `{"language":"es","persona":"nova"}`:
  - **DQ path**: respond "no estoy seguro de si quiero cambiar" → Intake should set `decision_taken=N` and call `gateDecision` → outcome event "disqualified", no handoff to Capture, session ends.
  - **Safety path**: indicate crisis → `acute_risk_flag=Y` → outcome event "safety_flagged", no handoff, session ends.
  - **Qualified path**: clear decision + clear behaviour + clear motivation → `gateDecision` → handoff event observed → Capture takes over → verbatim P2 → `submitQualification` → outcome event "qualified".
- Verify in logs: agent transitions happen cleanly, no STT/TTS reinitialization at the handoff.

### Phase 3 — Landing `/qualify` route

#### Step 3.1 — Add deps

From `samwise-landing/`:
```
pnpm add ai @ai-sdk/google @ai-sdk/react zod livekit-client livekit-server-sdk
```

#### Step 3.2 — Persona + prompt

- **`samwise-landing/lib/qualify/persona.ts`** (Nova, locked):
  ```ts
  export const NOVA = {
    name_es: "Nova",
    name_en: "Nova",
    voice_es: "calmada, breve, curiosa. No habla como vendedor, no habla como clínico — habla como alguien que ya escuchó muchas historias y quiere entender la tuya. Refleja la palabra exacta del usuario cuando aparece algo importante.",
    voice_en: "calm, brief, curious. Doesn't sound like a sales rep, doesn't sound like a clinician — sounds like someone who has heard a lot of stories and wants to understand yours. Mirrors the user's exact word when something important surfaces.",
  } as const
  ```

- **`samwise-landing/lib/qualify/intake-prompt.ts`** (Intake stage — XML-tagged structural prompting per the `programming-style.md` LiveKit Agent pattern). Sections:
  - `<personality>` — Nova characterization in the active language.
  - `<opener>` — ONE warm opening line. No questions in the first turn beyond a friendly greeting and an open invitation to share what brought them.
  - `<priority-1>` — the three gates (`decision_taken`, `behaviour_clarity`, `motivation_clarity`) woven into natural conversation, in order. Hard rule: do NOT ask all three in rapid succession.
  - `<safety>` — `acute_risk_flag` always checked; `ownership_self_reported` inferred from how they describe what they want. If acute_risk_flag = Y → professional referral framing, then call `gateDecision`.
  - `<closing>` — when (and only when) all five gate fields are known, call `gateDecision` EXACTLY ONCE with the captured values. After the tool returns: if the tool indicates DQ/safety, deliver a brief, honest close in voice; if the tool says "handed off", do nothing — the Capture Agent takes over.
  - `<hard-rules>` — never money/plans/budgets; never introduce "Dra. Ana María" by name; respond to off-topic Samwise questions briefly then return to the gate-running.

- **`samwise-landing/lib/qualify/capture-prompt.ts`** (Capture stage). Sections:
  - `<personality>` — same Nova voice; tone shifts subtly to *patient capturer* mode.
  - `<context>` — embeds the P1+safety data passed from Intake so Nova doesn't re-ask: "El usuario ya nos dijo que quiere cambiar {behaviour_shorthand}. Avanza desde ahí."
  - `<priority-2>` — the nine fields to capture, in order. Verbatim rules: keep the user's exact phrasing, never paraphrase, preserve metaphors.
  - `<closing>` — when all nine fields are captured (or the user signals they're done), call `submitQualification` EXACTLY ONCE with the full payload (P1+safety+P2). Then one short human close.
  - `<hard-rules>` — same as Intake.

- **`samwise-landing/lib/qualify/schema.ts`** — two schemas:
  - `GateDecisionSchema` — shape used by Intake's `gateDecision` tool. Contains prospect identifiers + the 5 gate fields (P1 + safety).
  - `QualificationPayloadSchema` — shape used by Capture's `submitQualification` tool. Extends the gate fields with the 9 P2 fields. (Re-uses `GateDecisionSchema.shape` via Zod's `extend`.)

- **`samwise-landing/lib/qualify/strings.ts`** (UI copy in both languages):
  ```ts
  export const STRINGS = {
    es: {
      picker_heading: "¿Cómo prefieres hablar?",
      picker_lang_label: "Idioma",
      picker_text_fallback: "Prefiero escribir",
      voice_starting: "Conectando…",
      voice_mic_blocked: "Necesitamos acceso al micrófono para empezar.",
      final_qualified_headline: "Hablemos.",
      final_qualified_cta: "Agendar la demo →",
      final_disqualified_headline: "Te damos el link.",
      final_disqualified_note: "Antes de agendar: vas a necesitar trabajar en definir mejor qué quieres cambiar para que esta sesión te dé valor real. Te damos el link igual, pero entra con esto en mente.",
      final_safety_headline: "Esto no es el lugar adecuado por ahora.",
      final_safety_body: "Lo que describes necesita atención profesional inmediata. No te dejamos solo — aquí van recursos…",
    },
    en: {
      picker_heading: "How would you like to talk?",
      picker_lang_label: "Language",
      picker_text_fallback: "I'd rather type",
      voice_starting: "Connecting…",
      voice_mic_blocked: "We need microphone access to start.",
      final_qualified_headline: "Let's talk.",
      final_qualified_cta: "Schedule the demo →",
      final_disqualified_headline: "Here's the link.",
      final_disqualified_note: "Before you book: you'll need to work on defining what you want to change before this session can give you real value. We're still giving you the link — go in with that in mind.",
      final_safety_headline: "This isn't the right place right now.",
      final_safety_body: "What you're describing needs immediate professional attention. We're not leaving you alone — here are resources…",
    },
  } as const

  export type Lang = keyof typeof STRINGS
  ```
  > Copy reviewed during build. The DQ note tone target is **firm-honest** — not gentle, not punishing.

#### Step 3.3 — Language picker

- **`samwise-landing/app/qualify/language-picker.tsx`** (client component, uses local state to keep the choice in memory until the user proceeds):
  ```tsx
  "use client"
  import { useState } from "react"

  type Mode = "voice" | "text"
  type Lang = "es" | "en"

  export function LanguagePicker({ onProceed }: { onProceed: (lang: Lang, mode: Mode) => void }) {
    const [lang, setLang] = useState<Lang | null>(null)
    return (
      <div className="qualify-picker">
        <h1>How would you like to talk? / ¿Cómo prefieres hablar?</h1>
        <div className="qualify-picker-langs">
          <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>English</button>
          <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>Español</button>
        </div>
        <button
          className="qualify-picker-proceed"
          disabled={!lang}
          onClick={() => lang && onProceed(lang, "voice")}
        >
          {lang === "es" ? "Hablar" : lang === "en" ? "Talk" : "↑ pick one"}
        </button>
        <button
          className="qualify-picker-text-fallback"
          disabled={!lang}
          onClick={() => lang && onProceed(lang, "text")}
        >
          {lang === "es" ? "Prefiero escribir" : "I'd rather type"}
        </button>
      </div>
    )
  }
  ```

#### Step 3.4 — Voice room (PTT, hybrid hold-or-tap-toggle)

- **`samwise-landing/app/qualify/voice-room.tsx`** — full client component built on `livekit-client`. Architecture pattern lifted from the `samwise-app-livekit-integration` skill for `/ritual-call`. Shape:
  - On mount: POST `/api/qualify/voice-init` with `{ language, persona: "nova" }` → get `{ token, url }`.
  - Construct `Room`, connect with token, autoplay-unblock on user gesture (`room.startAudio()` inside the first user-driven click), hidden `<audio>` sink for inbound audio. Microphone starts DISABLED.
  - Listen for `RoomEvent.DataReceived` → on `type === "qualification:outcome"`, call `onOutcome(outcome)`.
  - On unmount (clean React unmount or user-driven "end" button): `room.disconnect()`. Distinguish from accidental disconnects (network) via a `deliberateDisconnect` ref — only call `onOutcome` for accidental.

- **Hybrid PTT input model.** The mic button (and `Space` keypress on desktop) drives the same state machine:
  ```ts
  type MicState = "idle" | "armed" | "speaking-hold" | "speaking-toggle"

  // pointerdown / keydown(Space):
  //   if state === "idle": state="armed", await 200ms; if still armed → "speaking-hold", mic on.
  //   if state === "speaking-toggle": state="idle", mic off.
  //
  // pointerup / keyup(Space):
  //   if state === "armed": cancel the 200ms timer → state="speaking-toggle", mic on. (Tap-to-talk)
  //   if state === "speaking-hold": state="idle", mic off. (Hold-to-talk, release ends)
  //   if state === "speaking-toggle": no-op (toggle is tap-driven, not release-driven).
  ```
  Mic on/off is implemented via `room.localParticipant.setMicrophoneEnabled(true|false)`. The button's visual state mirrors the state machine.
- **Visual affordances** — button label changes with state:
  - `idle`: "Hold to speak, or tap and release to toggle"
  - `armed`: "…"
  - `speaking-hold`: "Listening… (release to send)"
  - `speaking-toggle`: "Listening… (tap to end)"
  - Spacebar shortcut: `e.preventDefault()` on keydown to stop page scroll. Disabled if focus is in a form input.

#### Step 3.5 — Text chat (fallback)

- **`samwise-landing/app/qualify/chat.tsx`** — useChat client; same prompt and schema as the voice path. Outcome arrives as `result.outcome` on the tool result.
- **`samwise-landing/app/qualify/components/{message-list,message-input}.tsx`** — minimal shadcn-style components.

#### Step 3.6 — Final screen

- **`samwise-landing/app/qualify/components/final-screen.tsx`** — reads `STRINGS[lang]` for headline/note/CTA. `safety_flagged` shows no demo link.

#### Step 3.7 — Route entry — orchestrates picker → mode

- **`samwise-landing/app/qualify/page.tsx`** (client component because state lives across picker → mode → final):
  ```tsx
  "use client"
  import { useState } from "react"
  import { LanguagePicker } from "./language-picker"
  import { VoiceRoom } from "./voice-room"
  import { QualifyChat } from "./chat"
  import { FinalScreen } from "./components/final-screen"
  import "./qualify.css"

  type Outcome = "qualified" | "disqualified" | "safety_flagged"

  export default function QualifyPage() {
    const [lang, setLang] = useState<"es" | "en" | null>(null)
    const [mode, setMode] = useState<"voice" | "text" | null>(null)
    const [outcome, setOutcome] = useState<Outcome | null>(null)

    if (outcome && lang) return <FinalScreen outcome={outcome} lang={lang} />

    if (!lang || !mode) return (
      <LanguagePicker onProceed={(l, m) => { setLang(l); setMode(m) }} />
    )

    if (mode === "voice") return <VoiceRoom lang={lang} onOutcome={setOutcome} />
    return <QualifyChat lang={lang} onOutcome={setOutcome} />
  }
  ```

#### Step 3.8 — API routes

- **`samwise-landing/app/api/qualify/voice-init/route.ts`**:
  - POST body: `{ language: "es"|"en" }`.
  - Mints LiveKit access token (room name = `qualify-${randomId}`, identity = `prospect-${randomId}`).
  - Creates an agent dispatch via `AgentDispatchClient` with metadata `JSON.stringify({ language, persona: "nova" })` and `agentName = process.env.QUALIFICATION_AGENT_NAME`.
  - Returns `{ token, url: process.env.NEXT_PUBLIC_LIVEKIT_URL }`.

- **`samwise-landing/app/api/qualify/chat/route.ts`**:
  - POST body: `{ messages, language }`.
  - **Text mode does NOT replicate the handoff workflow** — it runs as a single agent with one tool (`submitQualification`) taking the full payload (P1+safety+P2). Rationale: text mode is the fallback path; the voice path is where the handoff's clean instruction-narrowing matters. Mixing both Intake and Capture concerns into one slightly fatter prompt is cheaper than orchestrating two stateful API calls.
  - Concretely:
    ```ts
    import { google } from "@ai-sdk/google"
    import { streamText, tool } from "ai"
    import { QualificationPayloadSchema } from "@/lib/qualify/schema"
    import { buildIntakePrompt } from "@/lib/qualify/intake-prompt"
    import { buildCapturePrompt } from "@/lib/qualify/capture-prompt"

    const SUBMIT_QUALIFICATION_URL = process.env.SUBMIT_QUALIFICATION_URL!
    export const maxDuration = 60

    export async function POST(req: Request) {
      const { messages, language } = await req.json() as {
        messages: { role: "user" | "assistant"; content: string }[]
        language: "es" | "en"
      }
      // Combined system prompt for text mode: gate-running + verbatim capture
      // in one document. The model decides when to gate vs capture; the cloud
      // function evaluates qualified/DQ/safety server-side.
      const system = [
        buildIntakePrompt(language),
        "\n\n---\n\n",
        "Si las tres puertas de Prioridad 1 pasan Y safety está limpio, sigue con esta segunda etapa:",
        buildCapturePrompt(language, null),
        "Llama submitQualification una sola vez con TODO el payload (P1+safety+P2).",
      ].join("")

      const result = streamText({
        model: google("gemini-2.5-flash"),
        system,
        messages,
        tools: {
          submitQualification: tool({
            description: "Submit the full qualification payload at the end. Call exactly ONCE.",
            parameters: QualificationPayloadSchema,
            execute: async (payload) => {
              const resp = await fetch(SUBMIT_QUALIFICATION_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })
              return await resp.json()
            },
          }),
        },
      })
      return result.toDataStreamResponse()
    }
    ```
  - Note: `buildCapturePrompt(language, null)` is called with `null` for the P1+safety context — the combined prompt doesn't have that context yet because there's no handoff. The Capture instructions still apply as a SECOND phase the model self-enters when the gates pass.

#### Step 3.9 — Env vars (landing Vercel — Production + Preview + Development)

| Var | Purpose |
|---|---|
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Token minting + dispatch (server-side) |
| `NEXT_PUBLIC_LIVEKIT_URL` | Client `Room.connect()` |
| `QUALIFICATION_AGENT_NAME` | Matches the worker's `livekit.toml` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Text-mode Gemini call (AI SDK reads this name by default) |
| `SUBMIT_QUALIFICATION_URL` | Text-mode tool target |

Mirror to `.env.local` for local dev.

### Phase 4 — Landing CTA wiring

#### Step 4.1 — Hero corner CTA in `app/page.tsx`

- **Should not be modified:** scroll choreography, FixedScene structure, warm-gold accents, navbar, the bottom-right positioning + reveal animation of `.hero-quiet-cta`.
- **Change:** the underlying `<a>`'s `href` → `/qualify`. Remove `target="_blank"` (same-origin). Update copy from "Schedule a fit assessment →" to a phrase consistent with the agent-led flow — exact copy reviewed during build (candidate: "Start your fit assessment →").

#### Step 4.2 — Primary CTA block

- **Should not be modified:** the warm-gold dashes, underline animation, hover behaviour.
- **Change:** anchor `href` → `/qualify`. Update copy to match.

#### Step 4.3 — Tease section + any inline links

- Audit `app/page.tsx` for any remaining direct `cal.com` URLs (rg `cal.com`); retarget all to `/qualify` EXCEPT where the user explicitly wants the raw Cal link preserved (e.g. footer / fallback — none currently planned).

#### Step 4.4 — Local test

- `pnpm dev`. Visit `/`. Click hero corner CTA → lands on `/qualify`. Click primary CTA → lands on `/qualify`. Cmd+click → opens in new tab (default `<a>` behaviour).

### Phase 5 — End-to-end test

#### Step 5.1 — Three scripted conversations × 2 modalities × 2 languages

Run the matrix locally (`pnpm dev` for landing + `pnpm dev` in `qualification-agent`):

- Conversation: **qualified** (clear decision, clear behaviour, clear motivation). Expect (voice): `gateDecision` called → **handoff** event in worker logs → Capture takes over → `submitQualification` called with full payload → outcome event "qualified" → final screen with demo link, no note. Expect (text): `submitQualification` called once with full payload → outcome "qualified".
- Conversation: **disqualified** (vague behaviour OR vague motivation). Expect (voice): `gateDecision` called → **no handoff** → outcome event "disqualified" → final screen with demo link **and** assertive note. Expect (text): `submitQualification` called once → outcome "disqualified".
- Conversation: **safety** (acute crisis OR external ownership). Expect (voice): `gateDecision` called → **no handoff** → outcome event "safety_flagged" → safety final screen, no link. Expect (text): same shape via `submitQualification`.

Verify in Firestore Console:
- `qualifications/{prospectKey}-{ts}` doc exists per session.
- `outcome` field matches.
- All captured P2 fields are verbatim (Spanish stays Spanish, etc.).

#### Step 5.2 — Integration test

- Deploy cloud functions + worker + landing preview.
- Run one real end-to-end voice conversation in Spanish, one in English.
- Confirm `prospectKey` is reachable from a real `/copilot` test in Phase 6.

### Phase 6 — `/copilot` prefill (samwise-app) — DEFERRED

> Ship Phase 6 only after the Session-copilot task is closer to FINISHED in the Vibe doc. The change is additive but should not destabilize an in-progress plan.

#### Step 6.1 — Wrapper

- **`samwise-app/lib/copilot/load-qualification.ts`**:
  ```ts
  const LOAD_QUALIFICATION_URL = "https://loadqualification-<HASH>-uc.a.run.app"

  export async function loadQualification(identifier: string) {
    const resp = await fetch(LOAD_QUALIFICATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    })
    return resp.json() as Promise<{ ok: boolean; qualification?: Record<string, unknown>; reason?: string }>
  }
  ```

#### Step 6.2 — UI in `/copilot`

- In `samwise-app/app/copilot/page.tsx`, add a "Load qualification" Field group above the variables table:
  - Input + button.
  - On click → `loadQualification(identifier)`.
  - On success → for each variable in the response that matches a `DEMO_CALL_VARIABLES` entry with `cleanable: true`, populate the rep-notes input as if the rep had typed it (triggers the existing debounce-clean flow).
  - Toast on `not_found` / error via `sonner`.

### Testing phase

- **Phase 1 local:** `firebase emulators:start --only functions`; curl both endpoints with sample payloads (qualified / DQ / safety / load by phone / load by name).
- **Phase 2 local:** `pnpm run download-files`, `pnpm run dev` in `qualification-agent/`; smoke-test from LiveKit Playground with metadata.
- **Phase 3 local:** see Step 5.1.
- **Phase 4 local:** see Step 4.4.
- **Integration:** see Step 5.2.
- **Phase 6 local:** open `/copilot`, type a prospect identifier matching a real qualification, click Load, verify variables populate and the existing debounce-clean fires.

- **Update READMEs:**
  - `samwise-backend/qualification-agent/README.md` — new (mirror `ritual-agent/README.md`).
  - `samwise-backend/cloud-functions/functions/src/index.ts` — header comment lists the two new exports.

### After implementation

- Update `samwise-landing/context-for-code-agent.md`:
  - Add `/qualify` route description (voice-first + text-fallback, language picker, Nova persona).
  - Note the new AI SDK + LiveKit deps in `package.json`.
- Update `samwise-app/context-for-code-agent.md`:
  - Add `loadQualification` to the cloud-function list.
  - Add the "Load qualification" UI block to `/copilot`'s description (when Phase 6 ships).
- Update `samwise-backend/cloud-functions/functions/src/context-for-code-agent.md`:
  - Add `submitQualification` and `loadQualification` to the functions list.
- Update `samwise-backend/qualification-agent/context-for-code-agent.md` — module exists as of this task.
- Mark **Qualification Agent** task DONE in the master Vibe doc Projects tab (manual user step).
