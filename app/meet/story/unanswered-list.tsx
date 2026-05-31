"use client"

import { AnimatePresence, motion } from "motion/react"
import type { StoryCopy } from "./strings"

// The non-invasive "yet to be answered" list. Open loops the rep leaves
// deliberately ("we'll explain this in the next session") to build
// anticipation for onboarding. `count` (derived from the stage) controls
// how many items are revealed; items fade in as the count grows.
export function UnansweredList({
  copy,
  count,
  reduced,
}: {
  copy: StoryCopy
  count: number
  reduced: boolean
}) {
  if (count <= 0) return null
  const items = copy.unanswered_items.slice(0, count)

  return (
    <aside className="ritual-unanswered" aria-label={copy.unanswered_kicker}>
      <p className="ritual-unanswered-kicker">{copy.unanswered_kicker}</p>
      <ul className="ritual-unanswered-list">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li
              key={it}
              className="ritual-unanswered-item"
              initial={reduced ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {it}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </aside>
  )
}
