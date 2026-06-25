"use client"

import { SevenSteps } from "./seven-steps"

// Where Lekatchila plugs into Samwise. Three plug-points, named after surfaces
// Lekatchila already runs — intake, alignment-point seminars, the optimization
// cadence — so the variant fits the existing model instead of replacing it.
const PLUGINS: { head: string; body: string }[] = [
  {
    head: "Your onboarding",
    body: "The first listening session your madrich+madricha pair already runs becomes the intake — it produces the inputs the ritual needs.",
  },
  {
    head: "Your call-design seminar",
    body: "The alignment-point seminar where you design how the couple is held becomes the call-design surface. Samwise turns that work into the daily call.",
  },
  {
    head: "Your alignment points",
    body: "Your existing 5-points-a-year cadence becomes the optimization loop. The AI follow-up agent carries the days between, so nothing rests on memory.",
  },
]

export function Collaboration() {
  return (
    <div className="l-collab">
      <p className="l-body">
        Lekatchila keeps its model, its madrichim, its language. What we ask of
        the pair is the work itself — the seven steps that produce a ritual a
        couple can actually keep:
      </p>

      <SevenSteps />

      <div className="l-collab-grid">
        {PLUGINS.map((p) => (
          <div key={p.head} className="l-collab-cell">
            <p className="l-collab-head">{p.head}</p>
            <p className="l-collab-body">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
