"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ArtifactTemplate, CaseApplication } from "./case-data"

// One built artifact (the ritual, or the call), laid out the way a therapist
// asked to see it: what you GATHER (inputs) → what it's BUILT INTO (components)
// → then the concrete instance WITH the case subject. Inputs + components are
// the framework (constant across cases); "With {name}" is the application
// (swaps per case). Reusable for the future therapist-call.
export function ArtifactAnatomy({
  template,
  application,
  subjectName,
  children,
}: {
  template: ArtifactTemplate
  application: CaseApplication
  subjectName: string
  children?: ReactNode // the imported story beat(s) + any extras (call schedule)
}) {
  const reduced = useReducedMotion()
  return (
    <motion.section
      className="t-artifact"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="t-artifact-label">{template.label}</p>
      <h3 className="t-artifact-title">{template.title}</h3>
      <p className="t-artifact-blurb">{template.blurb}</p>

      {/* The framework: inputs → components */}
      <div className="t-build">
        <div className="t-build-col">
          <p className="t-build-lead">{template.inputsLead}</p>
          <ul className="t-build-list">
            {template.inputs.map((it) => (
              <li key={it} className="t-build-item">
                {it}
              </li>
            ))}
          </ul>
        </div>

        <div className="t-build-arrow" aria-hidden="true">
          →
        </div>

        <div className="t-build-col">
          <p className="t-build-lead">{template.componentsLead}</p>
          <ul className="t-build-list t-build-list--components">
            {template.components.map((c) => (
              <li key={c} className="t-build-item">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The application: with the case subject (swaps per case) */}
      <div className="t-applied">
        <p className="t-applied-lead">With {subjectName}</p>
        <p className="t-applied-text">{application.mara}</p>
        {application.quote && (
          <p className="t-applied-quote">&ldquo;{application.quote}&rdquo;</p>
        )}
        {children}
      </div>
    </motion.section>
  )
}
