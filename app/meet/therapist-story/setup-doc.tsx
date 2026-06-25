"use client"

import { motion } from "motion/react"
import type { SetupDocCopy } from "./strings"

// The persistent THERAPIST setup document — renders BELOW the active stage,
// like RitualStory's DocSpine, as the in-call "curiosity engine". It's a
// preview of the document Samwise will set up FOR the therapist after this
// call (their seven-step process, their first user, their terms, their
// assets, their call cadence). All sections show ghosted "to come" — the
// real doc generation happens in a later session; this is the placeholder
// the therapist watches grow in their mind as Samuel walks the stages.
//
// Mirrors DocSpine's structural shape: kicker → title → body → page card
// with sections → progress meter → footer note. The page card uses the same
// .ritual-doc / .ritual-doc-section classes from story.css so the visual
// register matches the prospect-side surface byte-for-byte.
export function SetupDoc({
  copy,
  reduced,
}: {
  copy: SetupDocCopy
  reduced: boolean
}) {
  const rise = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" as const },
      }

  return (
    <section className="ritual-doc-spine">
      <p className="ritual-story-kicker">{copy.kicker}</p>
      <h3 className="ritual-story-title">{copy.title}</h3>
      <p className="ritual-story-body">{copy.body}</p>

      <motion.article className="ritual-doc" {...rise}>
        {copy.sections.map((section) => (
          <div
            key={section.label}
            className="ritual-doc-section ritual-doc-section--locked"
          >
            <span className="ritual-doc-section-label">{section.label}</span>
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
        <span className="ritual-doc-progress">{copy.progress}</span>
      </div>
      <p className="ritual-story-note">{copy.note}</p>
    </section>
  )
}
