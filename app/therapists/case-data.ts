import type { VariablesState } from "@/app/qualify/components/variables-panel"

// Case studies for the /therapists journey. The FRAMEWORK (inputs + components
// of the ritual and the call) is constant across cases — it's the model. Only
// the APPLICATION changes per case: the intro, the variables that feed the
// beats, the "with {name}" text, the mantra, and the daily-call schedule.
//
// To ADD A CASE (Samuel uploads more): append one `Case` object to `CASES`
// below. The switcher and the whole case region pick it up automatically — no
// other edits needed. PII rule: change the display name from the source, no
// surname, no phone numbers.

// ── The framework, shared across all cases ──────────────────────────────────
export interface ArtifactTemplate {
  key: "ritual" | "call"
  label: string
  title: string
  blurb: string
  inputsLead: string
  inputs: string[]
  componentsLead: string
  components: string[]
  beats: ("doc" | "mechanism" | "loop" | "cycle")[]
  showCalls?: boolean
}

export const ARTIFACT_TEMPLATES: ArtifactTemplate[] = [
  {
    key: "ritual",
    label: "What you build · 1",
    title: "The ritual",
    blurb:
      "The daily practice the person lives. You produce its raw material in session; we assemble it into a ritual they can keep.",
    inputsLead: "What you gather (the seven steps yield these)",
    inputs: [
      "The last relapse, functionally analyzed — one concrete moment, grounded.",
      "The behaviour, desidentified — named as an enemy, not the person.",
      "Its origin, mapped.",
      "The enablers that feed it.",
      "The current belief system.",
    ],
    componentsLead: "What the ritual is built into",
    components: [
      "Mantras — what they say.",
      "Protection — what they do to stop the behaviour now.",
      "A new belief system — what they do to shift thoughts and feelings over time.",
      "A schedule — times, with fallbacks.",
      "Accountability — the people who hold them to it.",
    ],
    beats: ["mechanism", "doc"],
  },
  {
    key: "call",
    label: "What you build · 2",
    title: "The call that runs it",
    blurb:
      "The daily call that carries the person into the ritual, so keeping it never rests on memory. You gather its inputs in the call-design session; we write the call.",
    inputsLead: "What you gather (the call-design session)",
    inputs: [
      "A symbol — the symbolic help they anchor to.",
      "Consciousness — what they hold gratitude or awareness for.",
      "Their intentions.",
      "A pact — a small, concrete commitment.",
      "Their company — who is with them.",
    ],
    componentsLead: "What the call is built into (its four parts)",
    components: [
      "The Stop.",
      "The Consciousness.",
      "The Intention.",
      "The Commitment.",
    ],
    beats: ["loop"],
    showCalls: true,
  },
]

// ── A single case study ──────────────────────────────────────────────────────
export interface CaseApplication {
  mara: string // the "with {name}" text for this artifact
  quote?: string // optional verbatim line (e.g. the desidentification mantra)
}

export interface Case {
  id: string
  name: string // display name (changed from source for anonymity)
  tag: string // short label for the switcher, e.g. "Screen addiction"
  intro: string // first presentation — lead with the concrete behaviour
  motivation: string
  problems: string[]
  vars: VariablesState // feeds DocSpine slots + PromiseBeat's descending label
  calls: { name: string; time: string; body: string }[]
  ritual: CaseApplication
  call: CaseApplication
}

const MARA: Case = {
  id: "mara",
  name: "Mara",
  tag: "Screen addiction",
  intro:
    "Mara was losing her days to her phone. The moment a task felt too big, she reached for it — scrolling, checking, anything but starting — until whole afternoons disappeared into the screen.",
  motivation:
    "to become my most self-sufficient, capable self — someone who can hold a family and her businesses",
  problems: [
    "Screen addiction: reaching for the phone the moment the real work got hard, then losing hours to it.",
    "Underneath it, a perfectionist standard that made starting feel pointless — so the screen always won.",
  ],
  vars: {
    // Short clause — PromiseBeat/DocSpine truncate the label at ~24 chars.
    behaviour_to_change: "reaching for my phone",
    core_motivation: "to become my most self-sufficient, capable self",
    problem_duration_self_reported: "years",
    life_stage_context: "building a family and her businesses",
  },
  calls: [
    {
      name: "Morning Protection",
      time: "8am (10am fallback; 6am Tuesdays)",
      body: "Assess the vulnerable state, activate support, coordinate logistics and meals.",
    },
    {
      name: "Afternoon Faith-Building",
      time: "2pm (3pm fallback)",
      body: "Document the tasks attempted; name the learning from failures or unknowns.",
    },
    {
      name: "Evening Preparation",
      time: "9pm (10pm fallback)",
      body: "Plan the next morning's logistics.",
    },
  ],
  ritual: {
    mara:
      "She named her enemy, then built protection that breaks her isolation each morning — assess the vulnerable state, activate a family member, instead of disappearing into the screen — and a new belief that trades first-attempt perfection for effort-based pride.",
    quote: "I am being attacked by an enemy that makes me mistreat myself.",
  },
  call: {
    mara:
      "Her ritual runs on three short calls a day, on her cadence, not a default:",
  },
}

export const CASES: Case[] = [MARA]
