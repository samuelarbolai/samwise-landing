import type { VariablesState } from "@/app/qualify/components/variables-panel"

// The anonymized case ("caso del amigo") — sourced from Sarah's real ritual
// document. PII STRIPPED for a public page: first name only (no surname), and
// the family member's phone number is never rendered. English throughout; her
// motivation and disidentification mantra are translated fully from the
// original Spanish (user decision 2026-06-15).
//
// Keep the case SIMPLE: the point to land is that once she desidentified from
// her problem (the enemy reframe), she opened up far more easily and adopted
// the ritual readily. NOT a granular step-by-step walk.

// Feeds the imported story beats (DocSpine slots + PromiseBeat's descending
// "old pattern" label). Only the first four VariableKeys are used by the beats.
export const SARAH_VARS: VariablesState = {
  // Short clause — PromiseBeat truncates the descending-curve label at ~24 chars.
  behaviour_to_change: "avoidance and isolation",
  core_motivation: "to become my most self-sufficient, capable self",
  problem_duration_self_reported: "years",
  life_stage_context: "building a family and her businesses",
}

export interface CaseCopy {
  name: string
  intro: string
  motivation: string
  problems: string[]
  // The desidentification turn — the simple narrative beat.
  turn_lead: string
  turn_body: string
  mantra: string
  // Her ritual's specifics (caption around the generic RitualMechanism beat).
  protection: string
  new_belief: string
  // Her three daily calls (caption + schedule around the generic DailyLoop beat).
  calls_lead: string
  calls: { name: string; time: string; body: string }[]
}

export const SARAH: CaseCopy = {
  name: "Sarah",
  intro:
    "Sarah came to us avoiding the work that mattered most and pulling away from people when things got hard. She held every new task to a standard no first attempt could meet, so she rarely started.",
  motivation:
    "to become my most self-sufficient, capable self — someone who can hold a family and her businesses",
  problems: [
    "Self-destruction through avoidance — isolating instead of facing the work.",
    "A perfectionist expectation on anything new, so effort never felt like enough.",
  ],
  turn_lead: "The turn came when she stopped identifying with the problem.",
  turn_body:
    "Once she could name it as an enemy acting on her — not as who she was — the defensiveness dropped. She opened up far more easily, and the ritual we built became something she could actually live, not another standard to fail.",
  mantra: "I am being attacked by an enemy that makes me mistreat myself.",
  protection:
    "Protection broke the isolation first: each morning she assesses her vulnerable state and activates a family member for support, then coordinates the day's logistics and meals.",
  new_belief:
    "The new belief replaced first-attempt perfection with effort-based pride: each afternoon she documents what she attempted and names the learning from whatever failed or stayed unknown.",
  calls_lead:
    "Sarah's ritual runs on three short calls a day — the cadence is hers, not a default.",
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
}
