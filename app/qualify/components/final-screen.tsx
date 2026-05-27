"use client"
import { STRINGS, type Lang } from "@/lib/qualify/strings"

// All qualify outcomes (qualified AND disqualified) route to the
// in-house /book page where the Cal `breakthrough` event is embedded.
// Single source of truth for "go book the call" — keeps the prospect
// on samwise.life through the whole flow, no cal.com redirect.
const BOOKING_URL = "/book"

export type Outcome = "qualified" | "disqualified"

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

  const isDQ = outcome === "disqualified"
  const baseHeadline = isDQ ? s.final_disqualified_headline : s.final_qualified_headline
  const headline = firstName ? `${firstName} — ${baseHeadline}` : baseHeadline

  // Pass `?lang=es` through so the booking page renders in the same
  // language the qualify session was in.
  const href = lang === "es" ? `${BOOKING_URL}?lang=es` : BOOKING_URL

  return (
    <div className={`qualify-final ${isDQ ? "qualify-final-dq" : "qualify-final-qualified"}`}>
      <h2>{headline}</h2>
      {isDQ && <p className="qualify-final-note">{s.final_disqualified_note}</p>}
      {!isDQ && <p className="qualify-final-body">{s.final_qualified_body}</p>}
      <a href={href} className="qualify-final-cta">
        <span className="qualify-cta-text">
          {isDQ ? s.final_disqualified_cta : s.final_qualified_cta}
        </span>
      </a>
    </div>
  )
}
