"use client"
import { STRINGS, type Lang } from "@/lib/qualify/strings"

// The user-facing variables that can appear on the prospect's notes screen.
// This panel is SHARED: the Fit Assessment (/qualify) AND the Demo Call
// (/meet) both render it. The Fit Assessment now commits only the first four
// (symbolic_anchor_description, alternatives_tried, why_alternatives_failed
// moved to the Demo Call, captured live in its Phase 1.5) — but the Demo
// still broadcasts all seven, so the type, display order and labels keep the
// full set. Cards render only when their value is non-empty, so /qualify
// naturally shows four and the Demo shows seven from the same component.
//
// The LLM-inferred gate fields (decision_taken, behaviour_clarity,
// motivation_clarity) are deliberately NOT exposed here — the user
// shouldn't see judgmental "behaviour_clarity: vague" cards during their
// call. Those live only in Firestore for the rep's view in /copilot.
export type VariableKey =
  | "behaviour_to_change"
  | "core_motivation"
  | "problem_duration_self_reported"
  | "life_stage_context"
  | "symbolic_anchor_description"
  | "alternatives_tried"
  | "why_alternatives_failed"

export type VariablesState = Partial<Record<VariableKey, string>>

// Display order. Roughly follows the order facts surface in a typical
// conversation: what + why first, then duration + life stage, then anchor,
// then alternatives. Cards only render when their value is non-empty, so the
// panel grows from top-down as the agent commits notes. (The last three only
// populate on the Demo Call; the Fit Assessment leaves them empty.)
const DISPLAY_ORDER: VariableKey[] = [
  "behaviour_to_change",
  "core_motivation",
  "problem_duration_self_reported",
  "life_stage_context",
  "symbolic_anchor_description",
  "alternatives_tried",
  "why_alternatives_failed",
]

// Label keys in STRINGS for each variable. Kept as a lookup table per
// the cloud-functions programming-style.md "Lookup Tables over switches"
// pattern (also followed throughout the landing).
const LABEL_KEY: Record<VariableKey, keyof (typeof STRINGS)["en"]> = {
  behaviour_to_change: "notes_label_behaviour_to_change",
  core_motivation: "notes_label_core_motivation",
  problem_duration_self_reported: "notes_label_problem_duration_self_reported",
  life_stage_context: "notes_label_life_stage_context",
  symbolic_anchor_description: "notes_label_symbolic_anchor_description",
  alternatives_tried: "notes_label_alternatives_tried",
  why_alternatives_failed: "notes_label_why_alternatives_failed",
}

export function VariablesPanel({
  lang,
  variables,
}: {
  lang: Lang
  variables: VariablesState
}) {
  const s = STRINGS[lang]

  // Filter to only the variables that have a non-empty value, preserving
  // display order. If nothing committed yet, render nothing (parent
  // decides whether to allocate space — the empty panel is invisible).
  const visible = DISPLAY_ORDER
    .map((key) => {
      const value = variables[key]
      if (!value || value.trim().length === 0) return null
      return { key, value: value.trim() }
    })
    .filter((x): x is { key: VariableKey; value: string } => x !== null)

  if (visible.length === 0) return null

  return (
    <aside className="qualify-notes" aria-label="Your notes">
      {visible.map(({ key, value }) => (
        <article key={key} className="qualify-notes-card">
          <div className="qualify-notes-label">{s[LABEL_KEY[key]]}</div>
          {/*
            Keying the quote span by value forces React to remount when
            the agent overwrites — this re-triggers the entry animation
            so an update reads as the card "rewriting itself" rather than
            silently changing.
          */}
          <div key={value} className="qualify-notes-quote">
            “{value}”
          </div>
        </article>
      ))}
    </aside>
  )
}
