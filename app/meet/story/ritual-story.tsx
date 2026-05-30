"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Lang } from "@/lib/qualify/strings"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import { STORY_STRINGS } from "./strings"
import { DocSpine } from "./doc-spine"
import { CycleMap } from "./cycle-map"
import { NeuroCrossfade } from "./neuro-crossfade"
import "./story.css"

// Mirror of samwise-app's StoryStage (cross-repo dup, like
// VideoCallExperience's init type). Kept in sync by hand.
export type StoryStage = "hidden" | "doc" | "cycle" | "neuro"

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

  const scene =
    stage === "doc" ? (
      <DocSpine copy={copy} variables={variables} reduced={!!reduced} />
    ) : stage === "cycle" ? (
      <CycleMap copy={copy} reduced={!!reduced} />
    ) : stage === "neuro" ? (
      <NeuroCrossfade copy={copy} variables={variables} reduced={!!reduced} />
    ) : null

  return (
    <div className="ritual-story" aria-live="polite">
      <AnimatePresence mode="wait">
        {scene && (
          <motion.div
            key={stage}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            {scene}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
