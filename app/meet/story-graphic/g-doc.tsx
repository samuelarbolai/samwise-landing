"use client"

import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "../story/strings"

// Graphic document spine — a page glyph. The top (their words) is washed in
// gold; the sections below are ghosted "to-come" bars; a progress bar fills
// ~1/3. The persistent spine, rendered above every beat.
function clip(s: string | undefined, n: number): string | null {
  const t = s?.trim()
  if (!t) return null
  return t.length > n ? t.slice(0, n - 1) + "…" : t
}

export function GDoc({
  copy,
  variables,
}: {
  copy: StoryCopy
  variables: VariablesState
}) {
  const behaviour = clip(variables.behaviour_to_change, 30)
  const motivation = clip(variables.core_motivation, 30)
  // ghosted to-come sections (skip the active first one)
  const ghosts = copy.doc_sections.slice(1).map((s) => s.label)

  return (
    <section className="gstory-scene">
      <svg className="gsvg" viewBox="0 0 300 180" role="img" aria-label={copy.doc_kicker}>
        {/* page */}
        <rect x="6" y="4" width="288" height="168" rx="6" className="g-chip" />
        {/* active accent */}
        <rect x="6" y="4" width="3" height="64" className="g-fill-gold" />

        {/* active section label */}
        <text x="22" y="24" className="g-t-gold">{copy.doc_sections[0].label.toUpperCase()}</text>

        {/* their words, gold-washed */}
        {behaviour && (
          <>
            <rect x="22" y="32" width="256" height="16" rx="2" className="g-fill-soft" />
            <text x="28" y="44" className="g-t-serif">&ldquo;{behaviour}&rdquo;</text>
          </>
        )}
        {motivation && (
          <>
            <rect x="22" y="50" width="256" height="16" rx="2" className="g-fill-soft" />
            <text x="28" y="62" className="g-t-serif">&ldquo;{motivation}&rdquo;</text>
          </>
        )}

        {/* ghosted to-come sections */}
        {ghosts.slice(0, 4).map((label, i) => {
          const y = 86 + i * 18
          return (
            <g key={label}>
              <rect x="22" y={y} width="120" height="9" rx="2" className="g-fill-rule" opacity="0.7" />
              <text x="150" y={y + 8} className="g-t-mute">{label}</text>
            </g>
          )
        })}

        {/* progress bar */}
        <rect x="22" y="160" width="200" height="4" rx="2" className="g-fill-rule" />
        <rect x="22" y="160" width="66" height="4" rx="2" className="g-fill-gold" />
        <text x="278" y="164" textAnchor="end" className="g-t-gold">{copy.doc_progress.split("—")[0].trim()}</text>
      </svg>
    </section>
  )
}
