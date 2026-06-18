"use client"

import { useReducedMotion } from "motion/react"
import { STORY_STRINGS } from "@/app/meet/story/strings"
import { DocSpine } from "@/app/meet/story/doc-spine"
import { RitualMechanism } from "@/app/meet/story/ritual-mechanism"
import { DailyLoop } from "@/app/meet/story/daily-loop"
import { CycleMap } from "@/app/meet/story/cycle-map"
import "@/app/meet/story/story.css"

import { CASES, ARTIFACT_TEMPLATES } from "@/app/therapists/case-data"
import { ArtifactAnatomy } from "@/app/therapists/artifact-anatomy"
import { Collaboration } from "@/app/therapists/collaboration"
import { OfferCard } from "@/app/therapists/offer-card"
import "@/app/therapists/therapists.css"

// The in-call counterpart to the /therapists scroll journey: Samuel drives
// these stages one at a time on the therapist's screen during the 50-min demo
// (mirrors how RitualStory drives the prospect demo). It REUSES the /therapists
// components verbatim; only the presentation is stage-by-stage instead of a
// scroll. Fed by a `therapist-demo:show_visual { stage }` DataChannel event.
//
// Order = the recruiting arc: meet the case → the ritual → the call → the arc
// over time → where the therapist fits → the offer.
export type TherapistStage =
  | "hidden"
  | "case"
  | "ritual"
  | "call"
  | "arc"
  | "collaboration"
  | "offer"

export function TherapistDemoStory({ stage }: { stage: TherapistStage }) {
  const reduced = useReducedMotion()
  const copy = STORY_STRINGS.en
  const c = CASES[0]

  if (stage === "hidden") return null

  const renderBeat = (b: string) => {
    switch (b) {
      case "doc":
        return <DocSpine copy={copy} variables={c.vars} reduced={!!reduced} />
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

  const ritualTemplate = ARTIFACT_TEMPLATES.find((t) => t.key === "ritual")!
  const callTemplate = ARTIFACT_TEMPLATES.find((t) => t.key === "call")!

  return (
    <div className="therapists-root t-demo-story" aria-live="polite">
      {stage === "case" && (
        <section className="t-section t-section--narrow">
          <p className="t-eyebrow">A real case</p>
          <h2 className="t-h2">Meet {c.name}.</h2>
          <p className="t-body">{c.intro}</p>
          <p className="t-quote">&ldquo;{c.motivation}&rdquo;</p>
          <ul className="t-list">
            {c.problems.map((p) => (
              <li key={p} className="t-list-item">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {stage === "ritual" && (
        <ArtifactAnatomy
          template={ritualTemplate}
          application={c.ritual}
          subjectName={c.name}
        >
          {ritualTemplate.beats.map((b) => (
            <div key={b} className="t-beat">
              {renderBeat(b)}
            </div>
          ))}
        </ArtifactAnatomy>
      )}

      {stage === "call" && (
        <ArtifactAnatomy
          template={callTemplate}
          application={c.call}
          subjectName={c.name}
        >
          {callTemplate.showCalls && (
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
          {callTemplate.beats.map((b) => (
            <div key={b} className="t-beat">
              {renderBeat(b)}
            </div>
          ))}
        </ArtifactAnatomy>
      )}

      {stage === "arc" && (
        <section className="t-section t-section--narrow">
          <p className="t-eyebrow">Over time</p>
          <h2 className="t-h2">Then you keep sharpening it.</h2>
          <div className="t-beat">
            <CycleMap copy={copy} reduced={!!reduced} />
          </div>
        </section>
      )}

      {stage === "collaboration" && (
        <section className="t-section t-section--narrow">
          <p className="t-eyebrow">Working together</p>
          <h2 className="t-h2">Where you fit.</h2>
          <Collaboration />
        </section>
      )}

      {stage === "offer" && (
        <section className="t-section t-section--narrow">
          <p className="t-eyebrow">The offer</p>
          <h2 className="t-h2">Your terms. Our engine.</h2>
          <OfferCard />
        </section>
      )}
    </div>
  )
}
