"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { STORY_STRINGS } from "@/app/meet/story/strings"
import { DocSpine } from "@/app/meet/story/doc-spine"
import { PromiseBeat } from "@/app/meet/story/neuro-crossfade"
import { DailyLoop } from "@/app/meet/story/daily-loop"
import { RitualMechanism } from "@/app/meet/story/ritual-mechanism"
import { CycleMap } from "@/app/meet/story/cycle-map"
import "@/app/meet/story/story.css"

import { SARAH, SARAH_VARS } from "./case-data"
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

      {/* 3 — Meet Sarah */}
      <Section eyebrow="A real case" heading={<>Meet {SARAH.name}.</>} narrow>
        <p className="t-body">{SARAH.intro}</p>
        <p className="t-quote">&ldquo;{SARAH.motivation}&rdquo;</p>
        <ul className="t-list">
          {SARAH.problems.map((p) => (
            <li key={p} className="t-list-item">
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* 4 — How the process helped (the desidentification turn) */}
      <Section eyebrow="The turn" heading={SARAH.turn_lead} narrow>
        <p className="t-body">{SARAH.turn_body}</p>
        <p className="t-mantra">&ldquo;{SARAH.mantra}&rdquo;</p>
        <BeatFrame>
          <PromiseBeat copy={copy} variables={SARAH_VARS} />
        </BeatFrame>
        <BeatFrame>
          <DocSpine copy={copy} variables={SARAH_VARS} reduced={!!reduced} />
        </BeatFrame>
      </Section>

      {/* 5 — Her ritual */}
      <Section eyebrow="Her ritual" heading="What she says, and what she does." narrow>
        <BeatFrame>
          <RitualMechanism copy={copy} reduced={!!reduced} />
        </BeatFrame>
        <p className="t-body">{SARAH.protection}</p>
        <p className="t-body">{SARAH.new_belief}</p>
      </Section>

      {/* 6 — Her daily calls */}
      <Section eyebrow="The cadence" heading="Three short calls a day." narrow>
        <p className="t-body">{SARAH.calls_lead}</p>
        <ul className="t-calls">
          {SARAH.calls.map((c) => (
            <li key={c.name} className="t-call">
              <span className="t-call-name">{c.name}</span>
              <span className="t-call-time">{c.time}</span>
              <span className="t-call-body">{c.body}</span>
            </li>
          ))}
        </ul>
        <BeatFrame>
          <DailyLoop copy={copy} reduced={!!reduced} />
        </BeatFrame>
      </Section>

      {/* 7 — The arc over time */}
      <Section eyebrow="Over time" heading="The loop you keep running with them." narrow>
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
        <PersonalizationCapture />
      </Section>

      <footer className="t-foot">
        <span className="t-foot-mark">Samwise</span>
        <span className="t-foot-colophon">SAMWISE.LIFE</span>
      </footer>
    </div>
  )
}
