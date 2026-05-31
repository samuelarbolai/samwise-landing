"use client"

import { motion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { StoryCopy } from "./strings"

// The persistent document spine — rendered above every beat. The first
// section is seeded LIVE from the prospect's captured notes (behaviour +
// motivation); the rest are ghosted "to-come" sections he fills in
// onboarding. The progress meter + the locked sections are the curiosity
// engine: he can see how much of his own document is still his to write.
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
    <section className="ritual-doc-spine">
      <p className="ritual-story-kicker">{copy.doc_kicker}</p>
      <h3 className="ritual-story-title">{copy.doc_title}</h3>
      <p className="ritual-story-body">{copy.doc_body}</p>

      {/* The doc, as a page card: one seeded section + ghosted to-come. */}
      <motion.article className="ritual-doc" {...rise}>
        {copy.doc_sections.map((section) => (
          <div
            key={section.label}
            className={
              "ritual-doc-section" +
              (section.locked
                ? " ritual-doc-section--locked"
                : " ritual-doc-section--active")
            }
          >
            <span className="ritual-doc-section-label">{section.label}</span>
            {section.sub && (
              <span className="ritual-doc-section-sub">{section.sub}</span>
            )}
            {!section.locked && (behaviour || motivation) && (
              <div className="ritual-doc-slots">
                {behaviour && (
                  <p className="ritual-doc-slot">&ldquo;{behaviour}&rdquo;</p>
                )}
                {motivation && (
                  <p className="ritual-doc-slot">&ldquo;{motivation}&rdquo;</p>
                )}
              </div>
            )}
            {section.items && section.items.length > 0 && (
              <ul className="ritual-doc-items">
                {section.items.map((it) => (
                  <li key={it} className="ritual-doc-item">
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </motion.article>

      <div className="ritual-doc-foot">
        <span className="ritual-doc-progress">{copy.doc_progress}</span>
      </div>
      <p className="ritual-story-note">{copy.doc_slot_note}</p>
    </section>
  )
}
