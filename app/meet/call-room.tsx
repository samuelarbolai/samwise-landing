"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
    reconnecting_lead: "Reconnecting…",
    reconnecting_sub: "Hold on — bringing you back.",
    dropped_lead: "Connection lost.",
    dropped_sub: "Your session is still open.",
    rejoin_cta: "Rejoin",
    ended_lead: "The meeting has ended.",
    ended_sub: "Thank you.",
    notes_label: "What he's writing down",
  },
  es: {
    connecting_lead: "Conectando…",
    connecting_sub: "Un momento.",
    waiting_lead: "Samuel ya viene.",
    waiting_sub: "Aguanta un momento.",
    reconnecting_lead: "Reconectando…",
    reconnecting_sub: "Un momento — te traemos de vuelta.",
    dropped_lead: "Se perdió la conexión.",
    dropped_sub: "Tu sesión sigue abierta.",
    rejoin_cta: "Volver a entrar",
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
        stage === "promise" ||
        stage === "loop" ||
        stage === "mechanism" ||
        stage === "experience"
      ) {
        setStoryStage(stage)
      }
      return
    }
  }, [])

  // Fade-in-place: the story LEADS the right column (top-aligned with the
  // sticky video) and beats fade out/in where they sit — no per-beat scroll.
  // We scroll ONCE, only the first time the story appears (hidden → live), to
  // bring it into view if the prospect had scrolled down into the notes. After
  // that, beats just crossfade. Honours reduced-motion.
  const prevStageRef = useRef<StoryStage>("hidden")
  useEffect(() => {
    const prev = prevStageRef.current
    prevStageRef.current = storyStage
    if (prev !== "hidden" || storyStage === "hidden") return
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t = setTimeout(
      () => {
        document.querySelector(".ritual-story")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        })
      },
      reduce ? 0 : 80,
    )
    return () => clearTimeout(t)
  }, [storyStage])

  const lang = init.booking.language
  const s = STRINGS[lang]
  // Autonomous demo: the "other side" is the AI guide, not Samuel. Use
  // guide-neutral waiting copy and pass the audio-only voice-panel labels —
  // the agent publishes no video, so the remote tile would otherwise be a
  // black box.
  const autonomous = init.booking.autonomous === true
  const waitingLead = autonomous
    ? lang === "es"
      ? "Tu guía se está conectando."
      : "Your guide is connecting."
    : s.waiting_lead
  const waitingSub = autonomous
    ? lang === "es"
      ? "Un momento."
      : "One moment."
    : s.waiting_sub

  return (
    <div className="demo-call-room" lang={lang}>
      <section className="demo-call-room-video">
        <VideoCallExperience
          init={init as VideoCallInit}
          status={{
            connectingLead: s.connecting_lead,
            connectingSub: s.connecting_sub,
            waitingLead,
            waitingSub,
            reconnectingLead: s.reconnecting_lead,
            reconnectingSub: s.reconnecting_sub,
            droppedLead: s.dropped_lead,
            droppedSub: s.dropped_sub,
            rejoinLabel: s.rejoin_cta,
            endedLead: s.ended_lead,
            endedSub: s.ended_sub,
            ...(autonomous
              ? {
                  audioOnlyLabel:
                    lang === "es" ? "Tu guía de Samwise" : "Your Samwise guide",
                  audioOnlySub:
                    lang === "es" ? "En vivo · por voz" : "Live · voice",
                }
              : {}),
          }}
          onDataMessage={onDataMessage}
        />
      </section>
      <aside
        className="demo-call-room-notes"
        aria-label={s.notes_label}
      >
        <RitualStory lang={lang} stage={storyStage} variables={variables} />
        <VariablesPanel lang={lang} variables={variables} />
      </aside>
    </div>
  )
}
