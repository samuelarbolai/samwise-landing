"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Lang } from "@/lib/qualify/strings"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import { STORY_STRINGS } from "./strings"
import { DocSpine } from "./doc-spine"
import { PromiseBeat } from "./neuro-crossfade"
import { DailyLoop } from "./daily-loop"
import { RitualMechanism } from "./ritual-mechanism"
import { CycleMap } from "./cycle-map"
import { UnansweredList } from "./unanswered-list"
import "./story.css"

// Mirror of samwise-app's StoryStage (cross-repo dup, like
// VideoCallExperience's init type). Kept in sync by hand. The document is
// NOT a stage in the usual sense — it renders as a persistent spine; the
// "doc" stage shows it on its own (Phase 9 Paso 1, before the promise).
// Order mirrors Phase 9: doc → promise → loop → mechanism → experience.
export type StoryStage =
  | "hidden"
  | "doc"
  | "promise"
  | "loop"
  | "mechanism"
  | "experience"

// How many "yet to be answered" items are revealed at each stage. The list
// appears at the daily-loop beat (the daily calls' reason) and grows at the
// mechanism beat (the mantras' reason), then persists.
function unansweredCount(stage: StoryStage): number {
  switch (stage) {
    case "loop":
      return 1
    case "mechanism":
    case "experience":
      return 2
    default:
      return 0
  }
}

export function RitualStory({
  lang,
  stage,
  variables,
}: {
  lang: Lang
  stage: StoryStage
  variables: VariablesState
}) {
  const reduced = useReducedMotion()
  const copy = STORY_STRINGS[lang]

  // Nothing live → render nothing at all (no stray spine, no border rule).
  if (stage === "hidden") return null

  const beat =
    stage === "promise" ? (
      <PromiseBeat copy={copy} variables={variables} />
    ) : stage === "loop" ? (
      <DailyLoop copy={copy} reduced={!!reduced} />
    ) : stage === "mechanism" ? (
      <RitualMechanism copy={copy} reduced={!!reduced} />
    ) : stage === "experience" ? (
      <CycleMap copy={copy} reduced={!!reduced} />
    ) : null // "doc" → spine only, no beat below

  return (
    <div className="ritual-story" aria-live="polite">
      {/* The active beat LEADS the column. Each freshly-introduced beat takes
          the top and the focus; the spine below slides down to make room. The
          doc is never stitched to the top — but (per its "persistent spine"
          intent) it never disappears either, it just follows the live beat. */}
      <AnimatePresence mode="wait">
        {beat && (
          <motion.div
            key={stage}
            className="ritual-story-beat"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.42, ease: "easeInOut" }}
          >
            {beat}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-invasive open-loops list (appears from the daily-loop beat on). */}
      <UnansweredList copy={copy} count={unansweredCount(stage)} reduced={!!reduced} />

      {/* The document spine persists BELOW the active beat — the curiosity
          engine the prospect keeps watching fill in, no longer hogging the top. */}
      <DocSpine copy={copy} variables={variables} reduced={!!reduced} />
    </div>
  )
}
