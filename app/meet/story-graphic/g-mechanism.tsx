"use client"

import type { StoryCopy } from "../story/strings"

// Graphic mechanism — a branch: "el ritual" splits into "lo que decís"
// (mantras) and "lo que hacés" (two arms), each actionable arm tagged with
// its outcome arrow (↓ immediate / ↑ gradual), echoing the promise. The
// short outcome tag is pulled from the existing copy (text after the dash).
function outcomeTag(body: string): string {
  const parts = body.split("—")
  return parts.length > 1 ? parts[parts.length - 1].trim() : body
}

export function GMechanism({ copy }: { copy: StoryCopy; reduced: boolean }) {
  return (
    <section className="gstory-scene">
      <p className="gstory-kicker">{copy.mechanism_kicker}</p>

      <div className="gmech">
        <div className="gmech-root">El ritual</div>
        <div className="gmech-stem" aria-hidden="true" />

        <div className="gmech-split">
          <div className="gmech-col">
            <p className="gmech-col-h">{copy.mechanism_said_label}</p>
            <div className="gmech-chip">{copy.mechanism_said}</div>
          </div>

          <div className="gmech-col">
            <p className="gmech-col-h">{copy.mechanism_action_label}</p>
            {copy.mechanism_actions.map((a, i) => (
              <div key={a.head} className="gmech-chip gmech-chip--action">
                <span className="gmech-chip-head">{a.head}</span>
                <span className="gmech-out">
                  {i === 0 ? "↓" : "↑"} {outcomeTag(a.body)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
