"use client"

import { motion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "./strings"

export function DocSpine({
  copy,
  variables,
  reduced,
}: {
  copy: StoryCopy
  variables: VariablesState
  reduced: boolean
}) {
  const behaviour = variables.behaviour_to_change?.trim()
  const motivation = variables.core_motivation?.trim()
  const rise = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" as const },
      }

  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.doc_kicker}</p>
      <h3 className="ritual-story-title">{copy.doc_title}</h3>
      <p className="ritual-story-body">{copy.doc_body}</p>

      {/* The doc, as a page card with its three real sections. */}
      <motion.article className="ritual-doc" {...rise}>
        {copy.doc_sections.map((label, i) => (
          <div
            key={label}
            className={
              "ritual-doc-section" + (i === 0 ? " ritual-doc-section--active" : "")
            }
          >
            <span className="ritual-doc-section-label">{label}</span>
            {i === 0 && (behaviour || motivation) && (
              <div className="ritual-doc-slots">
                {behaviour && (
                  <p className="ritual-doc-slot">&ldquo;{behaviour}&rdquo;</p>
                )}
                {motivation && (
                  <p className="ritual-doc-slot">&ldquo;{motivation}&rdquo;</p>
                )}
              </div>
            )}
          </div>
        ))}
      </motion.article>

      <p className="ritual-story-note">{copy.doc_slot_note}</p>
    </section>
  )
}
