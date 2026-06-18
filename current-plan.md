# current-plan.md — Therapist qualification call (a second audience for /qualify) (2026-06-16)

> Neurotic-implementer rules in force: ask before deducing; prospect/therapist-facing copy
> needs sign-off; never commit unless asked. THREE surfaces: samwise-landing (/qualify +
> lib/qualify), samwise-backend/ritual-agent (flows/qualification), samwise-backend/
> cloud-functions (extractQualification).
>
> **Supersedes** the prior plan (/therapists visual journey + booking meeting types) — that
> task SHIPPED (landing journey, case switcher, /therapists/book + therapist 15-min meeting
> type). This file is overwritten for the new task.
>
> ⚠️ STATUS: architecture + seams ready for review. A few open questions (DQ behaviour, the
> post-questions pitch beat, route, calendar) must be answered before I write the final
> prompt blocks. I will NOT invent the pitch copy or the DQ logic.

## Task (user 2026-06-16)
Build the **therapist version of the qualification call** — a second AUDIENCE for `/qualify`.
"Two types of qualification calls: for users, and for therapists. The therapist one is
identical, the only differences are: (1) the booking link books a **50-minute demo call**
(where the /therapists visuals get presented), and (2) the opener + the **four questions /
variables** captured. The rest of the prompt is **absolutely identical**."

The four therapist questions (verbatim, user-supplied):
> "I am helping people overcome certain addictions. I understand that you probably help some
> patients that have addictions. Can I ask you four questions and then tell you about what
> I'm doing?
> - What is usually the addiction your patients have?
> - When was the last time you had a patient with this problem?
> - What have you tried to help this patient?
> - Why has that failed to work?"

## Where this sits in the therapist funnel (mirrors the user funnel)
1. **Therapist qualification call** (AI, Nova, `/qualify` variant) — THIS task. Captures the 4
   answers, then "tells them about what I'm doing", then books →
2. **Therapist demo call** (50 min, **Samuel human-led**, drives the `/therapists` visuals) —
   the recruit/pitch. **Separate / later task** — THIS task only builds the booking target
   (a 50-min `therapist-demo` meeting type) so the qualification can book into it. (See "Scope".)

## Approach — parameterize qualification by `audience` (mirror the meeting-type pattern)
Add `audience: 'user' | 'therapist'` (default `'user'`) threaded through the whole stack. The
therapist audience swaps ONLY: the opener-framing, the `<questions>` block, the variable
DEFINITIONS, the variable labels, the extraction schema/prompt, and the final booking link.
Everything audience-agnostic (Nova persona, conversational rules, `<audio-quality>`,
`<end-of-call>` / finalize contract, pre-warmed opener, `<hard-rules>`, the converse→extract
architecture, the voice-room surface) stays byte-identical. Default-`'user'` keeps the
existing flow untouched.

## The therapist variables (NEW — snake_case, must match across prompt/schema/strings/CF per script-work Rule 4)
| key | question | 
|---|---|
| `patient_addiction_type` | What is usually the addiction your patients have? |
| `last_patient_occurrence` | When was the last time you had a patient with this problem? |
| `helped_patient_attempts` | What have you tried to help this patient? |
| `why_attempts_failed` | Why has that failed to work? |
(Captured verbatim, like the user vars. Names are my proposal — confirm or rename.)

## Seams to touch (from the stack map; default-'user' everywhere so the user flow is untouched)

### samwise-landing
- `lib/qualify/qualification-prompt.ts` — `buildQualificationPrompt(language, name, mode, audience='user')`. Swap the opener-framing + `<questions>` + variable-definitions blocks on `audience`. Keep everything else identical. (The user blocks stay as-is for `audience='user'`.)
- `lib/qualify/schema.ts` — `SetVariablesArgsSchema` variable-name union + `QualificationPayloadSchema`: allow the therapist keys (a per-audience key set, or a superset). `.nullish()` on optional fields (cross-provider rule).
- `lib/qualify/strings.ts` — therapist variable labels (`notes_label_*`) for the panel, EN/ES, + any therapist final-screen copy.
- `app/qualify/components/variables-panel.tsx` — extend the `VariableKey` union + label lookup with the 4 therapist keys (cards render only when non-empty, so a user call still shows only user vars).
- `app/qualify/voice-room.tsx` — `VALID_VARIABLE_KEYS` includes the therapist keys; accept an `audience` prop.
- `app/qualify/page.tsx` — thread `audience` (from the route/picker) → voice-init + voice-room.
- `app/qualify/components/final-screen.tsx` — booking link becomes audience-aware: therapist → the 50-min therapist-demo booking (`/therapists/book?type=therapist-demo` or a dedicated link — see open Q).
- `app/api/qualify/voice-init/route.ts` — accept `audience`, put it in dispatch metadata.
- **Entry:** a thin route (proposed `app/therapists/qualify/page.tsx`) that renders the `/qualify` surface with `audience='therapist'` preset (mirrors `/therapists/book`). [open Q: route shape]

### samwise-backend/ritual-agent
- `src/types/metadata.ts` — add `audience: 'user' | 'therapist'` to `QualificationMeta` + parse it (default `'user'`). (There's a vestigial no-op `persona:'nova'` field — repurpose or sit beside it.)
- `src/flows/qualification/prompts/qualification-prompt.ts` — mirror the landing prompt change. ⚠️ **Verify landing/worker prompt parity FIRST** (the stack map flagged a possible pre-existing drift) — sync before adding the audience swap so we don't fork 4 ways.
- `src/flows/qualification/schema.ts` — mirror schema change.
- `src/flows/qualification/agent.ts` — pass `meta.audience` to the prompt builder; `VALID_VARIABLE_KEYS` includes therapist keys.
- `src/flows/qualification/index.ts` — include `audience` in the `extractQualification` POST body.

### samwise-backend/cloud-functions
- `extractQualification` (`functions/src/index.ts`) — accept `audience`; for `'therapist'`, run a therapist extraction (the 4 vars + outcome) and store on the qualifications doc; audience-aware confirmation email copy + booking link. [depends on open Q: therapist payload + DQ]
- `extraction_qualification_prompt.txt` — either branch by audience or add a sibling therapist extraction prompt. [depends on open Q]

### samwise-app (booking target)
- `lib/book/meeting-types.ts` — add a **`therapist-demo`** meeting type: **50 min**, its event title + confirmation copy, calendar via env (reuse `THERAPIST_BOOKING_CALENDAR_ID` or a new one — open Q). The therapist-qualify final screen books this. (The existing 15-min `therapist` adoption-test type stays for the /therapists landing close.)

## Modifications (phases) — final code blocks AFTER the open questions are answered
- **Phase 1 — meeting type:** add `therapist-demo` (50 min) to `meeting-types.ts`; thread it as a `?type=` value the booking already supports.
- **Phase 2 — landing prompt + schema + strings + panel** for `audience='therapist'` (opener-framing + 4 questions + 4 vars + labels), default-'user' untouched.
- **Phase 3 — worker mirror** (parity-sync first), metadata `audience`, agent + index threading.
- **Phase 4 — extractQualification** therapist extraction + storage + email + booking link.
- **Phase 5 — entry route** (`/therapists/qualify` thin wrapper) + final-screen audience booking link + voice-init metadata.

## Testing
- **Local:** `/therapists/qualify` (or `?audience=therapist`) renders the picker; voice-init dispatches with `audience='therapist'` (verify metadata). Worker `pnpm dev` + a self-dispatch (`lk dispatch create … --metadata '{"flow":"qualification","audience":"therapist",…}'`) → confirm Nova opens with the framing + asks the 4 questions + books the 50-min demo. `tsc --noEmit` clean in all three repos. The user `/qualify` flow is unchanged (regression check: default-'user').
- **CF:** unit/manual — POST a therapist transcript to `extractQualification` with `audience:'therapist'`, confirm the 4 vars extracted + doc written + email + 50-min booking link.
- Per skills: bump `BUILD_TAG` on `lk agent deploy`; verify the live build via self-dispatch log grep.

## Decisions locked (user 2026-06-16)
1. **DQ behaviour: ALWAYS book the demo.** No hard disqualification — every therapist who
   answers the 4 questions is invited to book the 50-min demo. The therapist extraction has no
   gate verdicts; outcome is always "qualified" (→ booking). (The `<continuous-evaluation>`
   gate block is dropped for `audience='therapist'`.)
2. **Pitch beat: I draft it.** After the 4 questions, Nova delivers a short (2–3 sentence)
   Samwise pitch synthesized from the landing value (everyday rituals + AI follow-up + the
   therapist offer), THEN moves to booking. I propose the copy for sign-off before ship.
3. **Entry: a selector in the EXISTING `/qualify` flow.** NOT a separate route. Add a
   user-vs-therapist choice to the `/qualify` language picker (one extra moment); `audience`
   flows from that selection through the existing surface. (Drops the `/therapists/qualify`
   route idea.)
4. **Booking: a 50-min `therapist-demo` meeting type** (distinct from the 15-min `therapist`
   adoption test). Calendar via `THERAPIST_BOOKING_CALENDAR_ID` (reuse) unless a separate
   `THERAPIST_DEMO_CALENDAR_ID` is set (same fallback pattern). Confirmation copy therapist-flavored.
5. **Scope: INCLUDE the 50-min demo call experience too** (Part C below) — the Samuel
   human-led call that DRIVES the `/therapists` visuals. This is the large piece; it needs a
   short design pass of its own (see Part C open items) before its code.
6. **Variable names** — proceeding with the 4 proposed `snake_case` keys (adjust if you object).

## Part C — the 50-min therapist demo call (now in scope; needs a short design pass)
A Samuel human-led call (mirrors the prospect Demo Call's HUMAN mode: `/meet` + `WalkInShell`
+ `VideoCallExperience` + a copilot control) where the on-screen visuals are the **`/therapists`
artifact anatomy** instead of the prospect `RitualStory`. Requires:
- Make the `/therapists` visuals **stage-drivable** (a `TherapistStage` union, like `StoryStage`)
  + a DataChannel contract (`therapist-demo:show_visual { stage }`), rendered on the therapist's
  in-call surface.
- A **control** on Samuel's side (a StoryControl-equivalent in samwise-app) to advance the stages.
- Booking → a `/meet`-style human room dispatch (the scribe for transcription), reached from the
  50-min `therapist-demo` booking.
- **Design (decided 2026-06-17, mirrors the prospect human-demo pattern):**
  - **Reuse `/meet`** human-call infra (the prospect↔Samuel video call: landing `call-room.tsx` +
    `VideoCallExperience`, samwise-app `WalkInShell`, the scribe for transcription). The 50-min
    `therapist-demo` booking lands the therapist on `/meet/[id]` exactly like a prospect; the only
    difference is which visuals render in the notes column.
  - **Stage-drivable visuals:** a `TherapistDemoStory` component (landing `app/meet/therapist-story/`)
    mirrors `RitualStory` — renders ONE stage at a time from a `TherapistStage` union
    (`hidden | case | ritual | call | arc | collaboration | offer`), REUSING the `/therapists`
    components (`ArtifactAnatomy` for ritual+call, the beats, `Collaboration`, `OfferCard`, `CASES`).
    Driven by a `therapist-demo:show_visual { stage }` DataChannel event (its own namespace; do NOT
    reuse `demo-call:*`).
  - **Booking flag:** the `therapist-demo` calendarBooking carries `kind: "therapist-demo"` so
    `call-room.tsx` branches to `<TherapistDemoStory>` instead of `<RitualStory>`.
  - **Samuel's control:** extend the samwise-app `StoryControl` (in `WalkInShell`) with a
    therapist-demo mode that publishes the `therapist-demo:show_visual` stages.
  - **Build order within C:** (1) `TherapistDemoStory` + a `/therapist-story-preview` harness
    [landing, verifiable now]; (2) `call-room.tsx` branch on `kind`; (3) samwise-app StoryControl +
    walk-in/init `kind` plumbing. Step 1 first (foundation, no LiveKit needed).

## Build order
Part A (qualification variant) → Part B (50-min `therapist-demo` meeting type) → Part C (demo
call experience, after its design pass). Verify each part in-browser before the next.

## After implementation
- Update `context-for-code-agent.md` (landing + ritual-agent + cloud-functions) with the audience parameter + therapist variables + the `/therapists/qualify` entry + the `therapist-demo` meeting type.
- Keep lib/qualify ↔ worker mirror in lockstep (note in both headers).
- Mark task DONE in master Vibe doc (manual user step).
