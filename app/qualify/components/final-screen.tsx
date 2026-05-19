"use client"
import { STRINGS, type Lang } from "@/lib/qualify/strings"

const DEMO_CALL_URL = "https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"

export type Outcome = "qualified" | "disqualified" | "safety_flagged"

export function FinalScreen({
  outcome,
  lang,
  name,
}: {
  outcome: Outcome
  lang: Lang
  name?: string
}) {
  const s = STRINGS[lang]
  const firstName = (name ?? "").trim().split(/\s+/)[0]

  if (outcome === "safety_flagged") {
    return (
      <div className="qualify-final qualify-final-safety">
        <h2>{s.final_safety_headline}</h2>
        <p>{s.final_safety_body}</p>
      </div>
    )
  }

  const isDQ = outcome === "disqualified"
  const baseHeadline = isDQ ? s.final_disqualified_headline : s.final_qualified_headline
  const headline = firstName ? `${firstName} — ${baseHeadline}` : baseHeadline

  return (
    <div className={`qualify-final ${isDQ ? "qualify-final-dq" : "qualify-final-qualified"}`}>
      <h2>{headline}</h2>
      {isDQ && <p className="qualify-final-note">{s.final_disqualified_note}</p>}
      <a
        href={DEMO_CALL_URL}
        className="qualify-final-cta"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="qualify-cta-text">
          {isDQ ? s.final_disqualified_cta : s.final_qualified_cta}
        </span>
      </a>
    </div>
  )
}
