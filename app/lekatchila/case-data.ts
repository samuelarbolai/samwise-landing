import type { VariablesState } from "@/app/qualify/components/variables-panel"

// Case studies for the /lekatchila journey. Mirrors /therapists' shape: the
// FRAMEWORK (inputs + components of the ritual and the call) is constant —
// it's the model the madrich+madricha pair would deploy. Only the APPLICATION
// changes per case: the intro, the variables that feed the beats, the
// "with {couple}" text, the prayer, and the daily-call schedule.
//
// To ADD A CASE: append one `Case` object to `COUPLES`. The switcher and the
// whole case region pick it up automatically. PII rule: first names only,
// changed from source; no surnames; no phone.

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
      "Prayer — what each spouse says, including to themselves.",
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
      "The daily call that carries the couple into the ritual, so keeping it never rests on memory. You gather its inputs in the call-design session — your seminar pattern; we write the call.",
    inputsLead: "What you gather (the call-design session)",
    inputs: [
      "A symbol — what they anchor to.",
      "Consciousness — what they hold gratitude or awareness for, together.",
      "Their intentions — for this week, for the marriage.",
      "A pact — a small, concrete commitment they can both keep.",
      "Their company — who is with them (your madrich+madricha pair, and each other).",
    ],
    componentsLead: "What the call is built into (its four parts)",
    components: [
      "Exit from the day.",
      "Entry into the work.",
      "Intentions.",
      "The pact.",
    ],
    beats: ["loop"],
    showCalls: true,
  },
]

// ── A single case study ──────────────────────────────────────────────────────
export interface CaseApplication {
  couple: string // the "with {couple}" text for this artifact
  quote?: string // optional verbatim line the spouse says
}

export interface Case {
  id: string
  name: string // display name — first names only, anonymized
  tag: string // short label for the switcher
  intro: string
  motivation: string
  problems: string[]
  vars: VariablesState // feeds DocSpine slots + descending-curve label
  calls: { name: string; time: string; body: string }[]
  ritual: CaseApplication
  call: CaseApplication
}

const AVI_AND_CHAYA: Case = {
  id: "avi-chaya",
  name: "Avi & Chaya",
  tag: "Withdrawal & chase",
  intro:
    "Three months in, Avi and Chaya found a pattern. After a disagreement, Avi went quiet and went to bed. Chaya read the silence as the end.",
  motivation: "to stay in the room with each other",
  problems: [
    "His silence.",
    "Her panic at the silence.",
    "The loop between them.",
  ],
  vars: {
    // Short clause — DocSpine label truncates around ~24 chars.
    behaviour_to_change: "going quiet after a disagreement",
    core_motivation: "to stay in the room with each other",
    problem_duration_self_reported: "since the wedding (3 months)",
    life_stage_context: "first year, no children yet",
  },
  calls: [
    {
      name: "Morning Protection",
      time: "7:30am (8:30am fallback)",
      body: "If either spouse feels at risk of going distant today, they name it aloud and ask, specifically, for merciful language at re-entry. Naming it disarms it.",
    },
    {
      name: "Afternoon Faith-Building",
      time: "2pm (3pm fallback)",
      body: "Avi shares one vulnerable thing from the day — an insecurity, a small failure. Chaya answers with mercy, names her faith in him, and thanks him for sharing. Over weeks, his fear of sharing becomes willingness.",
    },
    {
      name: "Evening Preparation",
      time: "9pm (10pm fallback)",
      body: "Schedule tomorrow's share-and-mercy — when, where, what each is bringing. Then name one thing today's prayer held.",
    },
  ],
  ritual: {
    couple:
      "Their madrich and madricha built the ritual with them, session by session — they named Avi's silence, chose the prayer he says when it rises; named Chaya's panic, chose hers. They set the moments in the day when the prayers happen, with fallbacks.",
    quote: "The silence is an enemy I learned in childhood — it is not my marriage.",
  },
  call: {
    couple:
      "Their ritual runs on three short calls a day, paced for the first year of marriage — designed by their madrich+madricha pair, run by the agent between alignment points:",
  },
}

export const COUPLES: Case[] = [AVI_AND_CHAYA]
