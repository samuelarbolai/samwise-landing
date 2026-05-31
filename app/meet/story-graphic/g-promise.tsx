"use client"

import { motion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "../story/strings"

// Graphic promise — the three curves carry it; the paragraph is gone, the
// two-speeds labels sit inline at the curve ends. Aspect-preserved viewBox
// (no preserveAspectRatio="none") so the SVG text isn't distorted.
export function GPromise({
  copy,
  variables,
  reduced,
}: {
  copy: StoryCopy
  variables: VariablesState
  reduced: boolean
}) {
  const raw = variables.behaviour_to_change?.trim()
  const oldLabel =
    raw && raw.length > 0
      ? raw.length > 18
        ? raw.slice(0, 17) + "…"
        : raw
      : copy.promise_curve_old

  const draw = reduced
    ? {}
    : {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 1.1, ease: "easeInOut" as const },
      }

  return (
    <section className="gstory-scene">
      <p className="gstory-kicker">{copy.promise_kicker}</p>
      <svg className="gsvg" viewBox="0 0 320 210" role="img" aria-label={copy.promise_title}>
        <line x1="6" y1="180" x2="314" y2="180" className="g-line" />

        {/* old pattern: high → low */}
        <motion.path d="M6,42 C100,56 175,150 314,172" className="g-curve-old" {...draw} />
        {/* behaviour: fast up */}
        <motion.path d="M6,166 C70,96 110,42 314,34" className="g-curve-fast" {...draw} />
        {/* thoughts & feelings: slow up */}
        <motion.path d="M6,174 C130,166 220,138 314,96" className="g-curve-slow" {...draw} />

        <text x="314" y="28" textAnchor="end" className="g-t-gold">
          {copy.promise_curve_behaviour}
        </text>
        <text x="314" y="92" textAnchor="end" className="g-t">
          {copy.promise_curve_mind}
        </text>
        <text x="314" y="196" textAnchor="end" className="g-t-mute">
          ↓ {oldLabel}
        </text>
      </svg>
    </section>
  )
}
