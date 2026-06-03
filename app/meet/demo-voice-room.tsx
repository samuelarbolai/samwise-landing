"use client"

import {
  Room,
  RoomEvent,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client"
import { useCallback, useEffect, useRef, useState } from "react"
import { STRINGS } from "@/lib/qualify/strings"
import {
  VariablesPanel,
  type VariableKey,
  type VariablesState,
} from "@/app/qualify/components/variables-panel"
import type { MeetInitResponse } from "./lobby"
import { RitualStory, type StoryStage } from "./story/ritual-story"
// Recycle the /qualify voice experience verbatim (welcome card, PTT mic dock,
// layout, styling). The ONLY demo differences: the notes are the demo's
// user-visible variables, the story visuals are added, and the demo-call agent
// drives it (backend). Import the qualify styles so it is pixel-identical.
import "@/app/qualify/qualify.css"
import "./story/story.css"

// The agent's user-visible variables — identical set to /qualify's panel.
const VALID_VARIABLE_KEYS: Set<string> = new Set<VariableKey>([
  "behaviour_to_change",
  "core_motivation",
  "problem_duration_self_reported",
  "life_stage_context",
  "symbolic_anchor_description",
  "alternatives_tried",
  "why_alternatives_failed",
])

type MicState = "idle" | "armed" | "speaking-hold" | "speaking-toggle"
const TAP_VS_HOLD_THRESHOLD_MS = 200

// Voice surface for an AUTONOMOUS (AI-guide) demo call. A near-verbatim recycle
// of /qualify's VoiceRoom — same connect/audio/PTT/welcome/scroll behaviour —
// minus the qualify-only outcome→FinalScreen machinery (the demo just runs and
// ends), plus the RitualStory visual the agent drives via showVisual.
export function DemoVoiceRoom({ init }: { init: MeetInitResponse }) {
  const lang = init.booking.language
  const s = STRINGS[lang]

  const roomRef = useRef<Room | null>(null)
  const audioSinkRef = useRef<HTMLAudioElement | null>(null)
  const deliberateDisconnectRef = useRef(false)
  const armedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const micStateRef = useRef<MicState>("idle")

  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [micState, setMicStateUI] = useState<MicState>("idle")
  const [variables, setVariables] = useState<VariablesState>({})
  const [storyStage, setStoryStage] = useState<StoryStage>("hidden")

  // Minimum welcome-card display time (same as qualify) — hold the welcome
  // long enough to read even on a fast connect. Mic appears once connected AND
  // this floor elapses.
  const [welcomeFloorElapsed, setWelcomeFloorElapsed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setWelcomeFloorElapsed(true), 3000)
    return () => clearTimeout(t)
  }, [])
  const showWelcome = connecting || !welcomeFloorElapsed

  // ---- Auto-follow the newest note (verbatim from qualify) ----
  const stickToBottomRef = useRef(true)
  useEffect(() => {
    const NEAR_BOTTOM_PX = 150
    const onScroll = () => {
      const dist =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      stickToBottomRef.current = dist <= NEAR_BOTTOM_PX
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const noteCount = Object.values(variables).filter(
    (v) => typeof v === "string" && v.trim().length > 0,
  ).length
  const prevNoteCountRef = useRef(0)
  useEffect(() => {
    const grew = noteCount > prevNoteCountRef.current
    prevNoteCountRef.current = noteCount
    if (!grew || !stickToBottomRef.current) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: reduce ? "auto" : "smooth",
      })
    })
  }, [noteCount])

  const setMicState = useCallback((next: MicState) => {
    micStateRef.current = next
    setMicStateUI(next)
  }, [])

  // ---- LiveKit room lifecycle ----
  useEffect(() => {
    let cancelled = false
    const room = new Room()
    roomRef.current = room

    room.on(RoomEvent.DataReceived, (payload) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as {
          type?: string
          name?: string
          value?: string
          stage?: string
        }
        if (
          msg.type === "demo-call:variable_update" &&
          typeof msg.name === "string" &&
          typeof msg.value === "string" &&
          VALID_VARIABLE_KEYS.has(msg.name)
        ) {
          setVariables((prev) => ({
            ...prev,
            [msg.name as VariableKey]: msg.value as string,
          }))
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
        if (track.kind === "audio" && audioSinkRef.current) {
          track.attach(audioSinkRef.current)
        }
      },
    )

    room.on(RoomEvent.Disconnected, () => {
      if (!deliberateDisconnectRef.current && !cancelled) {
        setError(s.error_generic)
      }
    })

    ;(async () => {
      try {
        if (cancelled) return
        // Demo difference vs qualify: token comes from walk-in/init (already in
        // `init`), not a voice-init fetch.
        await room.connect(init.wsUrl, init.token)
        await room.startAudio() // autoplay unblock — sink exists already
        await room.localParticipant.setMicrophoneEnabled(false) // PTT controls it
        if (!cancelled) setConnecting(false)
      } catch (e) {
        if (!cancelled) {
          console.error("[demo-voice] init FAILED", e)
          setError(s.error_generic)
        }
      }
    })()

    return () => {
      cancelled = true
      deliberateDisconnectRef.current = true
      if (armedTimerRef.current) clearTimeout(armedTimerRef.current)
      room.disconnect().catch(() => {})
    }
  }, [init, s.error_generic])

  // ---- Mic on/off helper ----
  const setMicEnabled = useCallback(
    async (enabled: boolean) => {
      const room = roomRef.current
      if (!room) return
      try {
        await room.localParticipant.setMicrophoneEnabled(enabled)
      } catch (e) {
        console.error("setMicrophoneEnabled failed", e)
        setError(s.voice_mic_blocked)
      }
    },
    [s.voice_mic_blocked],
  )

  // ---- Hybrid PTT state machine (verbatim from qualify) ----
  const handlePressStart = useCallback(() => {
    const cur = micStateRef.current
    if (cur === "speaking-toggle") {
      setMicState("idle")
      void setMicEnabled(false)
      return
    }
    if (cur !== "idle") return
    setMicState("armed")
    armedTimerRef.current = setTimeout(() => {
      if (micStateRef.current === "armed") {
        setMicState("speaking-hold")
        void setMicEnabled(true)
      }
    }, TAP_VS_HOLD_THRESHOLD_MS)
  }, [setMicEnabled, setMicState])

  const handlePressEnd = useCallback(() => {
    const cur = micStateRef.current
    if (cur === "armed") {
      if (armedTimerRef.current) {
        clearTimeout(armedTimerRef.current)
        armedTimerRef.current = null
      }
      setMicState("speaking-toggle")
      void setMicEnabled(true)
    } else if (cur === "speaking-hold") {
      setMicState("idle")
      void setMicEnabled(false)
    }
  }, [setMicEnabled, setMicState])

  // ---- Spacebar shortcut (verbatim from qualify) ----
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      handlePressStart()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      handlePressEnd()
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [handlePressStart, handlePressEnd])

  const micLabel: string =
    micState === "armed"
      ? s.voice_mic_armed_label
      : micState === "speaking-hold"
        ? s.voice_mic_speaking_hold_label
        : micState === "speaking-toggle"
          ? s.voice_mic_speaking_toggle_label
          : s.voice_mic_idle_label

  return (
    <div className="qualify-voice" lang={lang}>
      {/* Hidden audio sink for the agent's TTS — must exist before startAudio(). */}
      <audio ref={audioSinkRef} autoPlay playsInline style={{ display: "none" }} />

      {/* Story visual the agent drives via showVisual. Renders nothing until the
          first one fires (~Phase 5a); leads the column above the notes. */}
      <RitualStory lang={lang} stage={storyStage} variables={variables} />

      <div className="qualify-voice-primary">
        {showWelcome && !error && (
          <div className="qualify-voice-welcome">
            <p className="qualify-voice-welcome-lead">{s.voice_welcome_lead}</p>
            <p className="qualify-voice-welcome-sub">{s.voice_welcome_sub}</p>
          </div>
        )}

        {error && (
          <div className="qualify-voice-status qualify-voice-error">{error}</div>
        )}

        {!showWelcome && !error && (
          <div className="qualify-voice-mic-dock">
            <button
              type="button"
              className={`qualify-voice-mic qualify-voice-mic-${micState}`}
              onPointerDown={handlePressStart}
              onPointerUp={handlePressEnd}
              onPointerCancel={handlePressEnd}
              onPointerLeave={(e) => {
                if (e.buttons === 0) return
                handlePressEnd()
              }}
              aria-pressed={micState === "speaking-hold" || micState === "speaking-toggle"}
            >
              <span className="qualify-mic-text">{micLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notes — fills live as the agent commits user-visible values. */}
      <VariablesPanel lang={lang} variables={variables} />
    </div>
  )
}
