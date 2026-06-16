"use client"

import { SevenSteps } from "./seven-steps"

// Where the behavioural-change expert plugs into Samwise. The "prepared"
// pillar: concrete division of labour, not a pitch. You run the sessions that
// build and re-sharpen the ritual (the seven steps); Samwise turns your output
// into the daily ritual + the AI calls and carries the day-to-day. Reusable.
const PLUGINS: { head: string; body: string }[] = [
  {
    head: "You build the ritual",
    body: "In your onboarding session you run the seven steps and map the loop — the work you already do, in your own room.",
  },
  {
    head: "We make it daily",
    body: "Samwise turns your output into the ritual document and the AI calls that run it, and carries the day-to-day so nothing rests on memory.",
  },
  {
    head: "You re-sharpen it",
    body: "When the ritual stops holding, you run an optimization session. We rewrite the part that slipped. The document gets truer each loop.",
  },
]

export function Collaboration() {
  return (
    <div className="t-collab">
      <p className="t-body">
        You keep your price, your pace, and your language. What you commit to is
        the work itself — the seven steps that produce a ritual worth running:
      </p>

      <SevenSteps />

      <div className="t-collab-grid">
        {PLUGINS.map((p) => (
          <div key={p.head} className="t-collab-cell">
            <p className="t-collab-head">{p.head}</p>
            <p className="t-collab-body">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
