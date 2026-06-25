"use client"

import { motion, useReducedMotion } from "motion/react"

// The seven steps the madrich+madricha pair runs, adapted from the /therapists
// framework for couples work in Lekatchila's existing intake + alignment-point
// pattern. The first step ("Listen") is Lekatchila's own Pillar 2 — kept as
// theirs, never replaced.
export const SEVEN_STEPS: string[] = [
  "Listen — to each spouse's story, in your existing format",
  "Map the pattern — both spouses, withdrawal AND chase",
  "Name the enemies — one per spouse, both present",
  "Design the daily ritual — prayer, protection, new belief, schedule",
  "Design the call — in the couple's voice, their language",
  "Adapt the script — Hebrew, Yiddish, register",
  "Run with the AI follow-up agent — between alignment points",
]

export function SevenSteps({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion()
  return (
    <ol className={"l-steps" + (compact ? " l-steps--compact" : "")}>
      {SEVEN_STEPS.map((step, i) => (
        <motion.li
          key={step}
          className="l-step"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.34,
            ease: "easeOut",
            delay: reduced ? 0 : i * 0.05,
          }}
        >
          <span className="l-step-num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="l-step-label">{step}</span>
        </motion.li>
      ))}
    </ol>
  )
}
