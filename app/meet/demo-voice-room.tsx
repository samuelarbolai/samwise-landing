"use client"

import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client"
import { useCallback, useEffect, useRef, useState } from "react"
import type { MeetInitResponse } from "./lobby"
import { RitualStory, type StoryStage } from "./story/ritual-story"
import {
  VariablesPanel,
  type VariableKey,
  type VariablesState,
} from "@/app/qualify/components/variables-panel"
// Reuse the /qualify voice-room styling (gallery-white, editorial) — the
// autonomous demo handles its no-video agent the same way qualify does.
import "@/app/qualify/qualify.css"
import "./story/story.css"

// The 7 user-visible variables the agent broadcasts (mirrors call-room +
// the landing /qualify panel).
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

type Phase = "connecting" | "live" | "ended" | "error"

const STRINGS = {
  en: {
    connecting: "Connecting…",
    guide: "Your Samwise guide",
    live: "Live · voice",
    mute: "Mute",
    unmute: "Unmute",
    end: "Leave",
    ended: "The session has ended.",
    error: "Couldn't connect. Reload to try again.",
  },
  es: {
    connecting: "Conectando…",
    guide: "Tu guía de Samwise",
    live: "En vivo · por voz",
    mute: "Silenciar",
    unmute: "Activar micrófono",
    end: "Salir",
    ended: "La sesión terminó.",
    error: "No pudimos conectar. Recarga para reintentar.",
  },
} as const

// Voice-only room for an AUTONOMOUS (AI-guide) demo call: open mic (no camera,
// no video tile), the agent's TTS piped to a hidden sink, and the RitualStory +
// notes panel as the surface. Mirrors /qualify's VoiceRoom wiring, minus the
// PTT + outcome→FinalScreen machinery (this is a long, open conversation).
export function DemoVoiceRoom({ init }: { init: MeetInitResponse }) {
  const lang = init.booking.language
  const s = STRINGS[lang]

  const roomRef = useRef<Room | null>(null)
  const audioSinkRef = useRef<HTMLAudioElement | null>(null)
  const deliberateRef = useRef(false)

  const [phase, setPhase] = useState<Phase>("connecting")
  const [micOn, setMicOn] = useState(true)
  const [variables, setVariables] = useState<VariablesState>({})
  const [storyStage, setStoryStage] = useState<StoryStage>("hidden")
  const [agentSpeaking, setAgentSpeaking] = useState(false)

  // ── Room lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room

    room.on(RoomEvent.DataReceived, (payload) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as {
          type?: string
          name?: unknown
          value?: unknown
          stage?: unknown
        }
        if (msg.type === "demo-call:variable_update") {
          if (typeof msg.name !== "string" || !isVariableKey(msg.name)) return
          const value = typeof msg.value === "string" ? msg.value : ""
          setVariables((prev) => ({ ...prev, [msg.name as VariableKey]: value }))
        } else if (msg.type === "demo-call:show_visual") {
          const stage = msg.stage
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
        }
      } catch {
        // ignore non-JSON
      }
    })

    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, _pub: RemoteTrackPublication, _p: RemoteParticipant) => {
        // Pipe the agent's TTS audio to the hidden sink (autoplay-safe).
        if (track.kind === Track.Kind.Audio && audioSinkRef.current) {
          track.attach(audioSinkRef.current)
        }
      },
    )

    // Drive the voice indicator's "speaking" pulse from the agent's audio.
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const agent = speakers.some(
        (p) => p.identity !== room.localParticipant?.identity,
      )
      setAgentSpeaking(agent)
    })

    room.on(RoomEvent.Disconnected, () => {
      if (cancelled) return
      setPhase((p) => (deliberateRef.current ? "ended" : p === "ended" ? p : "error"))
    })

    ;(async () => {
      try {
        await room.connect(init.wsUrl, init.token)
        await room.startAudio() // autoplay unblock — sink exists before this
        await room.localParticipant.setMicrophoneEnabled(true) // open mic, no camera
        if (!cancelled) setPhase("live")
      } catch (err) {
        if (!cancelled) {
          console.error("[demo-voice] connect failed", err)
          setPhase("error")
        }
      }
    })()

    return () => {
      cancelled = true
      deliberateRef.current = true
      room.disconnect().catch(() => {})
      roomRef.current = null
    }
  }, [init])

  // Auto-mute when the tab is hidden (privacy contract, same as the video flow).
  useEffect(() => {
    if (phase !== "live") return
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        void roomRef.current?.localParticipant.setMicrophoneEnabled(false)
        setMicOn(false)
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [phase])

  const toggleMic = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    const next = !micOn
    try {
      await room.localParticipant.setMicrophoneEnabled(next)
      setMicOn(next)
    } catch (e) {
      console.error("[demo-voice] setMicrophoneEnabled failed", e)
    }
  }, [micOn])

  return (
    <div className="qualify-voice" lang={lang}>
      {/* Hidden audio sink for the agent's TTS — must exist before startAudio(). */}
      <audio ref={audioSinkRef} autoPlay playsInline style={{ display: "none" }} />

      <div className="qualify-voice-primary">
        {/* Guide presence — the "who's on the other side" anchor, alive via a
            soft pulse that quickens while the guide speaks. Replaces the black
            video tile entirely. */}
        <div className="qualify-voice-welcome" aria-live="polite">
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 14,
              height: 14,
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: phase === "error" ? "#b00" : "var(--ink, #111)",
              opacity: phase === "live" ? 1 : 0.45,
              transform: agentSpeaking ? "scale(1.35)" : "scale(1)",
              transition: "transform 180ms ease, opacity 300ms ease",
              boxShadow: agentSpeaking
                ? "0 0 0 8px rgba(0,0,0,0.06)"
                : "0 0 0 0 rgba(0,0,0,0)",
            }}
          />
          <p className="qualify-voice-welcome-lead">
            {phase === "error" ? s.error : s.guide}
          </p>
          <p className="qualify-voice-welcome-sub">
            {phase === "connecting"
              ? s.connecting
              : phase === "ended"
                ? s.ended
                : s.live}
          </p>
        </div>

        {/* The evolving story — the agent drives it via showVisual. Empty (no
            visual) in the early phases until it fires the first one. */}
        <RitualStory lang={lang} stage={storyStage} variables={variables} />

        {phase === "live" && (
          <div className="qualify-voice-mic-dock">
            <button
              type="button"
              className="qualify-voice-mic"
              onClick={() => void toggleMic()}
              aria-pressed={!micOn}
            >
              <span className="qualify-mic-text">{micOn ? s.mute : s.unmute}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notes panel — fills live as the agent commits user-visible values. */}
      <VariablesPanel lang={lang} variables={variables} />
    </div>
  )
}
