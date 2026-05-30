"use client"

import { motion } from "motion/react"
import type { StoryCopy } from "./strings"

export function CycleMap({
  copy,
  reduced,
}: {
  copy: StoryCopy
  reduced: boolean
}) {
  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.cycle_kicker}</p>
      <h3 className="ritual-story-title">{copy.cycle_title}</h3>

      {/* The doc, pinned at the top as the spine the steps write into. */}
      <div className="ritual-cycle-doc">
        <span className="ritual-cycle-doc-mark" aria-hidden="true">
          ✦
        </span>
        <span className="ritual-cycle-doc-label">{copy.cycle_doc_label}</span>
      </div>

      <ol className="ritual-cycle">
        {copy.cycle_steps.map((step, i) => (
          <motion.li
            key={step.n}
            className="ritual-cycle-step"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.36,
              ease: "easeOut",
              delay: reduced ? 0 : i * 0.05,
            }}
          >
            <span className="ritual-cycle-num" aria-hidden="true">
              {step.n}
            </span>
            <div className="ritual-cycle-text">
              <p className="ritual-cycle-out">{step.out}</p>
              <p className="ritual-cycle-head">{step.head}</p>
              <p className="ritual-cycle-body">{step.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
