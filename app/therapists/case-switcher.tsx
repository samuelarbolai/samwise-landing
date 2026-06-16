"use client"

import type { Case } from "./case-data"

// Lets you (and a therapist) flip between success cases instantly. The whole
// case region below reflects the active case. Editorial register: hairline
// chips, gold underline on the active one — no filled buttons. Renders even
// with a single case (ready for more to be appended to CASES).
export function CaseSwitcher({
  cases,
  active,
  onSelect,
}: {
  cases: Case[]
  active: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="t-cases" role="tablist" aria-label="Case studies">
      <span className="t-cases-label">Case study</span>
      <div className="t-cases-chips">
        {cases.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={"t-case-chip" + (i === active ? " is-on" : "")}
            onClick={() => onSelect(i)}
          >
            <span className="t-case-chip-name">{c.name}</span>
            <span className="t-case-chip-tag">{c.tag}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
