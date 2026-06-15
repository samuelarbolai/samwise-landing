"use client"

import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "./strings"

// Beat 1 — "the promise". Keeps the old-pattern-vs-ritual base (the old
// pattern descends) and LAYERS the two changes on top: behaviour rises
// FAST (changes now, inside the ritual) and thoughts & emotions rise
// SLOWLY (gradual). Three curves over a 0..100 × 0..60 viewBox (y down).
// Entrance is handled by the parent beat's opacity crossfade (RitualStory's
// AnimatePresence) — these paths are static. We deliberately do NOT animate
// `pathLength` here: Motion drives that via an absolute-px `stroke-dasharray`,
// which collides with `vector-effect: non-scaling-stroke` and leaves the
// curves permanently dotted/broken.
export function PromiseBeat({
  copy,
  variables,
}: {
  copy: StoryCopy
  variables: VariablesState
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
        <path d="M0,8 C30,12 55,40 100,54" className="ritual-neuro-old" fill="none" />
        {/* behaviour: rises FAST and plateaus high */}
        <path d="M0,52 C18,30 34,12 100,9" className="ritual-neuro-fast" fill="none" />
        {/* thoughts & emotions: rises GRADUALLY */}
        <path d="M0,55 C40,52 72,42 100,24" className="ritual-neuro-slow" fill="none" />
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
