"use client"

import { motion, useReducedMotion } from "motion/react"

// The seven steps a Samwise behavioural-change expert delivers — verbatim from
// the offer's parenthetical (do NOT reword; "relapse" is the user's own
// professional wording, and this is a peer-facing surface, not prospect copy).
// Reusable: the future therapist-call surface can mount this unchanged.
export const SEVEN_STEPS: string[] = [
  "Functional analysis of the last relapse",
  "Desidentification",
  "Mapping of origin",
  "Identification of enablers",
  "Design of protection",
  "Identification of the current belief system",
  "Design of action toward the new belief system",
]

export function SevenSteps({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion()
  return (
    <ol className={"t-steps" + (compact ? " t-steps--compact" : "")}>
      {SEVEN_STEPS.map((step, i) => (
        <motion.li
          key={step}
          className="t-step"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.34,
            ease: "easeOut",
            delay: reduced ? 0 : i * 0.05,
          }}
        >
          <span className="t-step-num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="t-step-label">{step}</span>
        </motion.li>
      ))}
    </ol>
  )
}
