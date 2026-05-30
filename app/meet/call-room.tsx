"use client"

import { useCallback, useState } from "react"
import {
  VideoCallExperience,
  type VideoCallInit,
} from "@/components/call/video-call-experience"
import {
  VariablesPanel,
  type VariablesState,
  type VariableKey,
} from "@/app/qualify/components/variables-panel"
// Editorial in-call layout + video tile styles (.demo-call-* and the
// minimum .qualify-notes-* declarations the reused panel needs).
import "@/components/call/call.css"
import type { MeetInitResponse } from "./lobby"
import { RitualStory, type StoryStage } from "./story/ritual-story"

// Mirrors the demo-call user-side call-room: video tile (main) +
// VariablesPanel (right rail on desktop, below on mobile). The walk-in
// shape uses the same DataChannel event name (`demo-call:variable_update`)
// because the therapist's broadcaster is shared — the message shape is
// identical regardless of which entry point the call came from.
const ALLOWED_KEYS = new Set<VariableKey>([
  "behaviour_to_change",
  "core_motivation",
  "problem_duration_self_reported",
  "life_stage_context",
  "symbolic_anchor_description",
  "alternatives_tried",
  "why_alternatives_failed",
])

function isVariableKey(name: string): name is VariableKey {
  return ALLOWED_KEYS.has(name as VariableKey)
}

const STRINGS = {
  en: {
    connecting_lead: "Connecting…",
    connecting_sub: "One moment.",
    waiting_lead: "Samuel is on his way.",
    waiting_sub: "Hang tight.",
    ended_lead: "The meeting has ended.",
    ended_sub: "Thank you.",
    notes_label: "What he's writing down",
  },
  es: {
    connecting_lead: "Conectando…",
    connecting_sub: "Un momento.",
    waiting_lead: "Samuel ya viene.",
    waiting_sub: "Aguanta un momento.",
    ended_lead: "La reunión terminó.",
    ended_sub: "Gracias.",
    notes_label: "Lo que está anotando",
  },
} as const

export function MeetCallRoom({ init }: { init: MeetInitResponse }) {
  const [variables, setVariables] = useState<VariablesState>({})
  const [storyStage, setStoryStage] = useState<StoryStage>("hidden")

  const onDataMessage = useCallback((msg: unknown) => {
    if (typeof msg !== "object" || msg === null || !("type" in msg)) return
    const type = (msg as { type?: unknown }).type

    if (type === "demo-call:variable_update") {
      const m = msg as { name?: unknown; value?: unknown }
      if (typeof m.name !== "string") return
      if (!isVariableKey(m.name)) return
      const value = typeof m.value === "string" ? m.value : ""
      setVariables((prev) => ({ ...prev, [m.name as VariableKey]: value }))
      return
    }

    if (type === "demo-call:show_visual") {
      const stage = (msg as { stage?: unknown }).stage
      if (
        stage === "hidden" ||
        stage === "doc" ||
        stage === "cycle" ||
        stage === "neuro"
      ) {
        setStoryStage(stage)
      }
      return
    }
  }, [])

  const lang = init.booking.language
  const s = STRINGS[lang]

  return (
    <div className="demo-call-room" lang={lang}>
      <section className="demo-call-room-video">
        <VideoCallExperience
          init={init as VideoCallInit}
          status={{
            connectingLead: s.connecting_lead,
            connectingSub: s.connecting_sub,
            waitingLead: s.waiting_lead,
            waitingSub: s.waiting_sub,
            endedLead: s.ended_lead,
            endedSub: s.ended_sub,
          }}
          onDataMessage={onDataMessage}
        />
      </section>
      <aside
        className="demo-call-room-notes"
        aria-label={s.notes_label}
      >
        <VariablesPanel lang={lang} variables={variables} />
        <RitualStory lang={lang} stage={storyStage} variables={variables} />
      </aside>
    </div>
  )
}
