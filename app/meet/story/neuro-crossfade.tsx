"use client"

import { motion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "./strings"

// Beat 1 — "the promise". Keeps the old-pattern-vs-ritual base (the old
// pattern descends) and LAYERS the two changes on top: behaviour rises
// FAST (changes now, inside the ritual) and thoughts & emotions rise
// SLOWLY (gradual). Three curves over a 0..100 × 0..60 viewBox (y down).
export function PromiseBeat({
  copy,
  variables,
  reduced,
}: {
  copy: StoryCopy
  variables: VariablesState
  reduced: boolean
}) {
  const rawOld = variables.behaviour_to_change?.trim()
  // The descending curve carries the prospect's own behaviour (truncated
  // to fit); fall back to the neutral copy.
  const oldLabel =
    rawOld && rawOld.length > 0
      ? rawOld.length > 24
        ? rawOld.slice(0, 23) + "…"
        : rawOld
      : copy.promise_curve_old

  const draw = reduced
    ? {}
    : {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 1.1, ease: "easeInOut" as const },
      }

  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.promise_kicker}</p>
      <h3 className="ritual-story-title">{copy.promise_title}</h3>

      <svg
        className="ritual-neuro"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${oldLabel} ↓ / ${copy.promise_curve_behaviour} / ${copy.promise_curve_mind}`}
      >
        {/* baseline */}
        <line x1="0" y1="58" x2="100" y2="58" className="ritual-neuro-axis" />
        {/* old pattern: high → low (the base "phase one out") */}
        <motion.path
          d="M0,8 C30,12 55,40 100,54"
          className="ritual-neuro-old"
          fill="none"
          {...draw}
        />
        {/* behaviour: rises FAST and plateaus high */}
        <motion.path
          d="M0,52 C18,30 34,12 100,9"
          className="ritual-neuro-fast"
          fill="none"
          {...draw}
        />
        {/* thoughts & emotions: rises GRADUALLY */}
        <motion.path
          d="M0,55 C40,52 72,42 100,24"
          className="ritual-neuro-slow"
          fill="none"
          {...draw}
        />
      </svg>

      <div className="ritual-neuro-legend ritual-neuro-legend--triple">
        <span className="ritual-neuro-legend-old">↓ {oldLabel}</span>
        <span className="ritual-neuro-legend-fast">
          ↑ {copy.promise_curve_behaviour}
        </span>
        <span className="ritual-neuro-legend-slow">
          ↑ {copy.promise_curve_mind}
        </span>
      </div>
      <p className="ritual-neuro-axis-label">{copy.promise_axis}</p>

      <p className="ritual-story-body">{copy.promise_body}</p>
    </section>
  )
}
