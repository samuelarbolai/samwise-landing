"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Lang } from "@/lib/qualify/strings"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import { STORY_STRINGS } from "../story/strings"
import type { StoryStage } from "../story/ritual-story"
import { UnansweredList } from "../story/unanswered-list"
import { GDoc } from "./g-doc"
import { GPromise } from "./g-promise"
import { GLoop } from "./g-loop"
import { GMechanism } from "./g-mechanism"
import { GExperience } from "./g-experience"
import "../story/story.css" // for the reused <UnansweredList> styles
import "./story-graphic.css"

// GRAPHIC variant of <RitualStory>. Same StoryStage contract + the same
// copy/data; the beats render as diagrams instead of text. Sibling module —
// canonical `app/meet/story/` is untouched.
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

export function RitualStoryGraphic({
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

  if (stage === "hidden") return null

  const beat =
    stage === "promise" ? (
      <GPromise copy={copy} variables={variables} reduced={!!reduced} />
    ) : stage === "loop" ? (
      <GLoop copy={copy} reduced={!!reduced} />
    ) : stage === "mechanism" ? (
      <GMechanism copy={copy} reduced={!!reduced} />
    ) : stage === "experience" ? (
      <GExperience copy={copy} reduced={!!reduced} />
    ) : null // "doc" → spine only

  return (
    <div className="gstory" aria-live="polite">
      <UnansweredList copy={copy} count={unansweredCount(stage)} reduced={!!reduced} />
      <GDoc copy={copy} variables={variables} />
      <AnimatePresence mode="wait">
        {beat && (
          <motion.div
            key={stage}
            className="gstory-beat"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            {beat}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
