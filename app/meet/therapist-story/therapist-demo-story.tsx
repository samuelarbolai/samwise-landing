"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import type { Lang } from "@/lib/qualify/strings"
import { STORY_STRINGS } from "@/app/meet/story/strings"
import { RitualMechanism } from "@/app/meet/story/ritual-mechanism"
import { DailyLoop } from "@/app/meet/story/daily-loop"
import { CycleMap } from "@/app/meet/story/cycle-map"
import "@/app/meet/story/story.css"
import "@/app/therapists/therapists.css"

import {
  THERAPIST_DEMO_STRINGS,
  type ArtifactTemplate,
  type CaseApplication,
  type InCallStrings,
} from "./strings"
import { SetupDoc } from "./setup-doc"

// Mirror of samwise-app's TherapistStage (cross-repo dup, like
// VideoCallExperience's init type). Kept in sync by hand. The setup doc is
// NOT a stage in the usual sense — it renders as a persistent layer below
// the active stage; "hidden" hides both the active stage and the doc.
// Order matches Samuel's recruiting arc: case → ritual → call → arc →
// collaboration → offer.
export type TherapistStage =
  | "hidden"
  | "case"
  | "ritual"
  | "call"
  | "arc"
  | "collaboration"
  | "offer"

export function TherapistDemoStory({
  lang,
  stage,
}: {
  lang: Lang
  stage: TherapistStage
}) {
  const reduced = useReducedMotion()
  const s = THERAPIST_DEMO_STRINGS[lang]
  const storyCopy = STORY_STRINGS[lang]

  // Nothing live → render nothing at all (no stray setup-doc, no border rule).
  if (stage === "hidden") return null

  // Beat slot: which embedded story-beat the active stage renders, if any.
  // Mirrors the renderBeat() switch from the landing /therapists journey, but
  // uses lang-aware STORY_STRINGS (the beats are already bilingual).
  const renderBeat = (b: "doc" | "mechanism" | "loop" | "cycle") => {
    switch (b) {
      case "mechanism":
        return <RitualMechanism copy={storyCopy} reduced={!!reduced} />
      case "loop":
        return <DailyLoop copy={storyCopy} reduced={!!reduced} />
      case "cycle":
        return <CycleMap copy={storyCopy} reduced={!!reduced} />
      // "doc" is dropped on the in-call surface — the persistent SetupDoc
      // below plays that role for the therapist.
      case "doc":
      default:
        return null
    }
  }

  // Pick the stage component to render (inline; one per case so we keep the
  // render tree shallow and the JSX greppable). Each returns a self-contained
  // <section> using the same .t-* class register as the /therapists landing.
  const stageNode =
    stage === "case" ? (
      <CaseStage strings={s} />
    ) : stage === "ritual" ? (
      <ArtifactStage
        template={s.artifact_ritual}
        application={s.mara.ritual}
        subjectName={s.mara.name}
        appliedTag={s.artifact.appliedTag}
        frameworkTag={s.artifact.frameworkTag}
      >
        {s.artifact_ritual.beats.map((b) => (
          <BeatFrame key={b}>{renderBeat(b)}</BeatFrame>
        ))}
      </ArtifactStage>
    ) : stage === "call" ? (
      <ArtifactStage
        template={s.artifact_call}
        application={s.mara.call}
        subjectName={s.mara.name}
        appliedTag={s.artifact.appliedTag}
        frameworkTag={s.artifact.frameworkTag}
      >
        {s.artifact_call.showCalls && (
          <ul className="t-calls">
            {s.mara.calls.map((c) => (
              <li key={c.name} className="t-call">
                <span className="t-call-name">{c.name}</span>
                <span className="t-call-time">{c.time}</span>
                <span className="t-call-body">{c.body}</span>
              </li>
            ))}
          </ul>
        )}
        {s.artifact_call.beats.map((b) => (
          <BeatFrame key={b}>{renderBeat(b)}</BeatFrame>
        ))}
      </ArtifactStage>
    ) : stage === "arc" ? (
      <ArcStage strings={s}>
        <BeatFrame>
          <CycleMap copy={storyCopy} reduced={!!reduced} />
        </BeatFrame>
      </ArcStage>
    ) : stage === "collaboration" ? (
      <CollaborationStage strings={s} />
    ) : (
      <OfferStage strings={s} />
    )

  return (
    <div className="therapists-root t-demo-story" aria-live="polite">
      {/* The active stage LEADS the column. Each freshly-introduced stage takes
          the top and the focus; the setup doc below slides down to make room.
          Mirrors RitualStory's "beat leads, spine follows" architecture. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          className="ritual-story-beat"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.42, ease: "easeInOut" }}
        >
          {stageNode}
        </motion.div>
      </AnimatePresence>

      {/* The setup doc persists BELOW the active stage — the curiosity engine
          the therapist keeps watching as Samuel walks the arc. */}
      <SetupDoc copy={s.setup_doc} reduced={!!reduced} />
    </div>
  )
}

// ── Inline stage components ─────────────────────────────────────────────────

function BeatFrame({ children }: { children: ReactNode }) {
  return <div className="t-beat">{children}</div>
}

function CaseStage({ strings }: { strings: InCallStrings }) {
  const c = strings.mara
  return (
    <section className="t-section t-section--narrow">
      <p className="t-eyebrow">{strings.headers.case.eyebrow}</p>
      <h2 className="t-h2">{strings.headers.case.heading}</h2>
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
  )
}

function ArtifactStage({
  template,
  application,
  subjectName,
  appliedTag,
  frameworkTag,
  children,
}: {
  template: ArtifactTemplate
  application: CaseApplication
  subjectName: string
  appliedTag: string
  frameworkTag: string
  children?: ReactNode
}) {
  return (
    <section className="t-artifact">
      <p className="t-artifact-label">{template.label}</p>
      <h3 className="t-artifact-title">{template.title}</h3>
      <p className="t-artifact-blurb">{template.blurb}</p>

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

      <div className="t-applied">
        <p className="t-applied-lead">
          {appliedTag} {subjectName}
        </p>
        <p className="t-applied-text">{application.text}</p>
        {application.quote && (
          <p className="t-applied-quote">&ldquo;{application.quote}&rdquo;</p>
        )}
        {children}
      </div>
    </section>
  )
}

function ArcStage({
  strings,
  children,
}: {
  strings: InCallStrings
  children: ReactNode
}) {
  return (
    <section className="t-section t-section--narrow">
      <p className="t-eyebrow">{strings.headers.arc.eyebrow}</p>
      <h2 className="t-h2">{strings.headers.arc.heading}</h2>
      {children}
    </section>
  )
}

function CollaborationStage({ strings }: { strings: InCallStrings }) {
  return (
    <section className="t-section t-section--narrow">
      <p className="t-eyebrow">{strings.headers.collaboration.eyebrow}</p>
      <h2 className="t-h2">{strings.headers.collaboration.heading}</h2>
      <div className="t-collab">
        <p className="t-body">{strings.collab_lead}</p>
        <ol className="t-steps">
          {strings.seven_steps.map((step, i) => (
            <li key={step} className="t-step">
              <span className="t-step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="t-step-label">{step}</span>
            </li>
          ))}
        </ol>
        <div className="t-collab-grid">
          {strings.collab_plugins.map((p) => (
            <div key={p.head} className="t-collab-cell">
              <p className="t-collab-head">{p.head}</p>
              <p className="t-collab-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OfferStage({ strings }: { strings: InCallStrings }) {
  const o = strings.offer
  return (
    <section className="t-section t-section--narrow">
      <p className="t-eyebrow">{strings.headers.offer.eyebrow}</p>
      <h2 className="t-h2">{strings.headers.offer.heading}</h2>
      <div className="t-offer">
        <p className="t-offer-line">{o.paragraph1}</p>
        <div className="t-offer-figure" aria-hidden="true">
          <span className="t-offer-share">50%</span>
          <span className="t-offer-share-note">{o.figureLabel}</span>
          <span className="t-offer-math">{o.figureMath}</span>
        </div>
        <p className="t-offer-line">{o.paragraph2}</p>
        <p className="t-offer-caveat">{o.caveat}</p>
      </div>
    </section>
  )
}

