"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ArtifactTemplate, CaseApplication } from "./case-data"

// One built artifact (the ritual, or the call), laid out the way an organizer
// asked to see it: what your madrich+madricha pair GATHER (inputs) → what it's
// BUILT INTO (components) → then the concrete instance WITH the couple. Inputs
// + components are the framework (constant across cases); "With {couple}" is
// the application (swaps per case).
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
      className="l-artifact"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="l-artifact-label">{template.label}</p>
      <h3 className="l-artifact-title">{template.title}</h3>
      <p className="l-artifact-blurb">{template.blurb}</p>

      <div className="l-build">
        <div className="l-build-col">
          <p className="l-build-lead">{template.inputsLead}</p>
          <ul className="l-build-list">
            {template.inputs.map((it) => (
              <li key={it} className="l-build-item">
                {it}
              </li>
            ))}
          </ul>
        </div>

        <div className="l-build-arrow" aria-hidden="true">
          →
        </div>

        <div className="l-build-col">
          <p className="l-build-lead">{template.componentsLead}</p>
          <ul className="l-build-list l-build-list--components">
            {template.components.map((c) => (
              <li key={c} className="l-build-item">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="l-applied">
        <p className="l-applied-lead">With {subjectName}</p>
        <p className="l-applied-text">{application.couple}</p>
        {application.quote && (
          <p className="l-applied-quote">&ldquo;{application.quote}&rdquo;</p>
        )}
        {children}
      </div>
    </motion.section>
  )
}
