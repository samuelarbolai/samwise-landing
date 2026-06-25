"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import { STORY_STRINGS } from "@/app/meet/story/strings"
import { DocSpine } from "@/app/meet/story/doc-spine"
import { DailyLoop } from "@/app/meet/story/daily-loop"
import { RitualMechanism } from "@/app/meet/story/ritual-mechanism"
import { CycleMap } from "@/app/meet/story/cycle-map"
import "@/app/meet/story/story.css"

import { COUPLES, ARTIFACT_TEMPLATES } from "./case-data"
import { ArtifactAnatomy } from "./artifact-anatomy"
import { CaseSwitcher } from "./case-switcher"
import { OfferCard } from "./offer-card"
import { Collaboration } from "./collaboration"
import { PersonalizationCapture } from "./personalization-capture"
import "./lekatchila.css"

// Thin four-point sparkle — same path as the canonical brand star.
function Star({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

function Section({
  id,
  eyebrow,
  heading,
  children,
  narrow,
}: {
  id?: string
  eyebrow?: string
  heading?: ReactNode
  children: ReactNode
  narrow?: boolean
}) {
  const reduced = useReducedMotion()
  return (
    <motion.section
      id={id}
      className={"l-section" + (narrow ? " l-section--narrow" : "")}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {eyebrow && <p className="l-eyebrow">{eyebrow}</p>}
      {heading && <h2 className="l-h2">{heading}</h2>}
      {children}
    </motion.section>
  )
}

function BeatFrame({ children }: { children: ReactNode }) {
  return <div className="l-beat">{children}</div>
}

export function LekatchilaJourney() {
  const reduced = useReducedMotion()
  const copy = STORY_STRINGS.en
  const [active, setActive] = useState(0)
  const c = COUPLES[active]

  const renderBeat = (b: string, vars: VariablesState) => {
    switch (b) {
      case "doc":
        return <DocSpine copy={copy} variables={vars} reduced={!!reduced} />
      case "mechanism":
        return <RitualMechanism copy={copy} reduced={!!reduced} />
      case "loop":
        return <DailyLoop copy={copy} reduced={!!reduced} />
      case "cycle":
        return <CycleMap copy={copy} reduced={!!reduced} />
      default:
        return null
    }
  }

  return (
    <div className="lekatchila-root">
      <header className="l-header">
        <a href="/" className="l-brand">
          Samwise
          <span className="l-brand-star" aria-hidden="true">
            <Star size={8} />
          </span>
        </a>
      </header>

      {/* Hero */}
      <section className="l-section l-hero">
        <p className="l-eyebrow">For Lekatchila</p>
        <h1 className="l-h1">
          The first year, <em>made daily.</em>
        </h1>
        <p className="l-lede">
          Your madrich+madricha pair does the listening you already do. Samwise
          turns each couple&rsquo;s first-year work into a daily ritual and a
          call that keeps it — so the calm survives the week, not just the
          alignment-point meeting.
        </p>
      </section>

      {/* Case switcher + first presentation (behaviour-forward) */}
      <Section eyebrow="A real case" heading={<>Meet {c.name}.</>} narrow>
        {COUPLES.length > 1 && (
          <CaseSwitcher cases={COUPLES} active={active} onSelect={setActive} />
        )}
        <p className="l-body">{c.intro}</p>
        <p className="l-quote">&ldquo;{c.motivation}&rdquo;</p>
        <ul className="l-list">
          {c.problems.map((p) => (
            <li key={p} className="l-list-item">
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* Overview */}
      <Section
        eyebrow="How it's built"
        heading="From your sessions, two things get built."
        narrow
      >
        <p className="l-body">
          Everything your madrich+madricha pair gathers becomes a{" "}
          <em>ritual</em> the couple lives — and the daily <em>call</em> that
          runs it. Here is exactly what goes into each, and what each is made
          of, with {c.name} as the worked example.
        </p>
      </Section>

      {/* The two artifacts: inputs → components → with the couple. Keyed by
          case id so a switch swaps the application + beats cleanly. */}
      <div className="l-artifacts" key={c.id}>
        {ARTIFACT_TEMPLATES.map((template) => (
          <ArtifactAnatomy
            key={template.key}
            template={template}
            application={template.key === "ritual" ? c.ritual : c.call}
            subjectName={c.name}
          >
            {template.showCalls && (
              <ul className="l-calls">
                {c.calls.map((call) => (
                  <li key={call.name} className="l-call">
                    <span className="l-call-name">{call.name}</span>
                    <span className="l-call-time">{call.time}</span>
                    <span className="l-call-body">{call.body}</span>
                  </li>
                ))}
              </ul>
            )}
            {template.beats.map((b) => (
              <BeatFrame key={b}>{renderBeat(b, c.vars)}</BeatFrame>
            ))}
          </ArtifactAnatomy>
        ))}
      </div>

      {/* Over time */}
      <Section eyebrow="Over time" heading="Then you keep sharpening it." narrow>
        <p className="l-body">
          Neither artifact is final. Each alignment-point session is where you
          rewrite the part that stopped holding — the ritual, or the call.
        </p>
        <BeatFrame>
          <CycleMap copy={copy} reduced={!!reduced} />
        </BeatFrame>
      </Section>

      {/* Collaboration */}
      <Section eyebrow="Working together" heading="Where you fit." narrow>
        <Collaboration />
      </Section>

      {/* The partnership */}
      <Section eyebrow="The partnership" heading="Your model. Our engine." narrow>
        <OfferCard />
      </Section>

      {/* Close: pick the path */}
      <Section
        id="set-up"
        eyebrow="Set it up"
        heading="Pick the path."
        narrow
      >
        <PersonalizationCapture />
      </Section>

      <footer className="l-foot">
        <span className="l-foot-mark">Samwise</span>
        <span className="l-foot-colophon">SAMWISE.LIFE</span>
      </footer>
    </div>
  )
}
