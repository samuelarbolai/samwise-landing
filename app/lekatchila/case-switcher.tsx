"use client"

import type { Case } from "./case-data"

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
    <div className="l-cases" role="tablist" aria-label="Case studies">
      <span className="l-cases-label">Case study</span>
      <div className="l-cases-chips">
        {cases.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={"l-case-chip" + (i === active ? " is-on" : "")}
            onClick={() => onSelect(i)}
          >
            <span className="l-case-chip-name">{c.name}</span>
            <span className="l-case-chip-tag">{c.tag}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
