"use client"

import { motion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "./strings"

// Two curves over a row of call-dots: the old pattern descends, the
// ritual rises, they cross. SVG in a 0..100 × 0..60 viewBox.
export function NeuroCrossfade({
  copy,
  variables,
  reduced,
}: {
  copy: StoryCopy
  variables: VariablesState
  reduced: boolean
}) {
  const rawOld = variables.behaviour_to_change?.trim()
  // Use the prospect's own behaviour as the descending-curve label,
  // truncated so it fits; fall back to the neutral copy.
  const oldLabel =
    rawOld && rawOld.length > 0
      ? rawOld.length > 28
        ? rawOld.slice(0, 27) + "…"
        : rawOld
      : copy.neuro_curve_old

  const draw = reduced
    ? {}
    : {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 1.1, ease: "easeInOut" as const },
      }

  const dots = [0, 25, 50, 75, 100]

  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.neuro_kicker}</p>
      <h3 className="ritual-story-title">{copy.neuro_title}</h3>

      <svg
        className="ritual-neuro"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${oldLabel} ↓ / ${copy.neuro_curve_new} ↑`}
      >
        {/* baseline */}
        <line x1="0" y1="58" x2="100" y2="58" className="ritual-neuro-axis" />
        {/* old pattern: high → low */}
        <motion.path
          d="M0,8 C30,12 55,40 100,54"
          className="ritual-neuro-old"
          fill="none"
          {...draw}
        />
        {/* ritual: low → high */}
        <motion.path
          d="M0,54 C40,48 70,16 100,6"
          className="ritual-neuro-new"
          fill="none"
          {...draw}
        />
        {dots.map((cx) => (
          <circle key={cx} cx={cx} cy="58" r="1.2" className="ritual-neuro-dot" />
        ))}
      </svg>

      <div className="ritual-neuro-legend">
        <span className="ritual-neuro-legend-old">↓ {oldLabel}</span>
        <span className="ritual-neuro-legend-new">↑ {copy.neuro_curve_new}</span>
      </div>
      <p className="ritual-neuro-axis-label">{copy.neuro_axis}</p>

      <p className="ritual-story-body">{copy.neuro_body}</p>
    </section>
  )
}
