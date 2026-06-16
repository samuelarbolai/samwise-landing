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

import { CASES, ARTIFACT_TEMPLATES } from "./case-data"
import { ArtifactAnatomy } from "./artifact-anatomy"
import { CaseSwitcher } from "./case-switcher"
import { OfferCard } from "./offer-card"
import { Collaboration } from "./collaboration"
import { PersonalizationCapture } from "./personalization-capture"
import "./therapists.css"

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
      className={"t-section" + (narrow ? " t-section--narrow" : "")}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      {heading && <h2 className="t-h2">{heading}</h2>}
      {children}
    </motion.section>
  )
}

// Centers an imported story beat in a readable measure (the beats were drawn
// for a ~28em notes column). No .ritual-story wrapper — we place beats per
// section ourselves.
function BeatFrame({ children }: { children: ReactNode }) {
  return <div className="t-beat">{children}</div>
}

export function TherapistsJourney() {
  const reduced = useReducedMotion()
  const copy = STORY_STRINGS.en
  const [active, setActive] = useState(0)
  const c = CASES[active]

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
    <div className="therapists-root">
      <header className="t-header">
        <a href="/" className="t-brand">
          Samwise
          <span className="t-brand-star" aria-hidden="true">
            <Star size={8} />
          </span>
        </a>
      </header>

      {/* 2 — Hero */}
      <section className="t-section t-hero">
        <p className="t-eyebrow">For behavioural change experts</p>
        <h1 className="t-h1">
          Your work, <em>made daily.</em>
        </h1>
        <p className="t-lede">
          You do the clinical work you already do. Samwise turns it into a daily
          ritual and an agent that calls to keep it, so the change survives the
          week, not just the session.
        </p>
      </section>

      {/* 3 — Case switcher + first presentation (behaviour-forward) */}
      <Section eyebrow="A real case" heading={<>Meet {c.name}.</>} narrow>
        {CASES.length > 1 && (
          <CaseSwitcher cases={CASES} active={active} onSelect={setActive} />
        )}
        <p className="t-body">{c.intro}</p>
        <p className="t-quote">&ldquo;{c.motivation}&rdquo;</p>
        <ul className="t-list">
          {c.problems.map((p) => (
            <li key={p} className="t-list-item">
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* 4 — Overview: from your sessions, two things get built */}
      <Section
        eyebrow="How it's built"
        heading="From your sessions, two things get built."
        narrow
      >
        <p className="t-body">
          Everything you gather becomes a <em>ritual</em> the person lives —
          and the daily <em>call</em> that runs it. Here is exactly what goes
          into each, and what each is made of, with {c.name} as the worked
          example.
        </p>
      </Section>

      {/* 5/6 — The two artifacts: inputs → components → with the case subject.
          Keyed by case id so switching swaps the application + beats cleanly. */}
      <div className="t-artifacts" key={c.id}>
        {ARTIFACT_TEMPLATES.map((template) => (
          <ArtifactAnatomy
            key={template.key}
            template={template}
            application={template.key === "ritual" ? c.ritual : c.call}
            subjectName={c.name}
          >
            {template.showCalls && (
              <ul className="t-calls">
                {c.calls.map((call) => (
                  <li key={call.name} className="t-call">
                    <span className="t-call-name">{call.name}</span>
                    <span className="t-call-time">{call.time}</span>
                    <span className="t-call-body">{call.body}</span>
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

      {/* 7 — Over time: how the ritual + call get sharpened */}
      <Section eyebrow="Over time" heading="Then you keep sharpening it." narrow>
        <p className="t-body">
          Neither artifact is final. Each optimization session is where you
          rewrite the part that stopped holding — the ritual, or the call.
        </p>
        <BeatFrame>
          <CycleMap copy={copy} reduced={!!reduced} />
        </BeatFrame>
      </Section>

      {/* 8 — Collaboration */}
      <Section eyebrow="Working together" heading="Where you fit." narrow>
        <Collaboration />
      </Section>

      {/* 9 — The offer */}
      <Section eyebrow="The offer" heading="Your terms. Our engine." narrow>
        <OfferCard />
      </Section>

      {/* 10 — Close: personalization capture */}
      <Section
        id="set-up"
        eyebrow="Set it up"
        heading="Build your assets, and pick your first user."
        narrow
      >
        <p className="t-body">
          Choose how your process maps onto ours, tell us what we need to
          personalize, and name the first person you&rsquo;d pilot with. We set
          the rest up together.
        </p>
        <PersonalizationCapture bookHref="/therapists/book" />
      </Section>

      <footer className="t-foot">
        <span className="t-foot-mark">Samwise</span>
        <span className="t-foot-colophon">SAMWISE.LIFE</span>
      </footer>
    </div>
  )
}
