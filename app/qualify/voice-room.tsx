"use client"
import {
  Room,
  RoomEvent,
  type Participant,
  type RemoteParticipant,
  type RemoteTrackPublication,
  type RemoteTrack,
} from "livekit-client"
import { useCallback, useEffect, useRef, useState } from "react"
import { STRINGS, type Lang } from "@/lib/qualify/strings"
import type { Outcome } from "./components/final-screen"
import {
  VariablesPanel,
  type VariableKey,
  type VariablesState,
} from "./components/variables-panel"

// Valid VariableKey values, as a Set for O(1) defensive filtering of
// inbound variable-update events (in case the agent emits a name we
// don't yet render — e.g. a future-added field shipped on the worker
// side ahead of the landing).
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

// After we receive the outcome event from the agent's tool, we don't
// immediately swap to <FinalScreen> — the LLM still has a closing line
// to speak. We listen for ActiveSpeakersChanged and only swap once the
// agent has been silent for SILENCE_BEFORE_SWAP_MS. The MAX_WAIT cap
// guarantees we never hang if the speaker events misbehave.
const SILENCE_BEFORE_SWAP_MS = 1500
const OUTCOME_MAX_WAIT_MS = 12000

export function VoiceRoom({
  lang,
  name,
  email,
  onOutcome,
}: {
  lang: Lang
  name: string
  email: string
  onOutcome: (outcome: Outcome) => void
}) {
  const s = STRINGS[lang]

  const roomRef = useRef<Room | null>(null)
  const audioSinkRef = useRef<HTMLAudioElement | null>(null)
  const deliberateDisconnectRef = useRef(false)
  const armedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const micStateRef = useRef<MicState>("idle")

  // Pending outcome — set when the agent's tool publishes the outcome
  // event. We don't swap to FinalScreen until the agent finishes its
  // closing utterance (see SILENCE_BEFORE_SWAP_MS logic below).
  const pendingOutcomeRef = useRef<Outcome | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onOutcomeRef = useRef(onOutcome)
  onOutcomeRef.current = onOutcome

  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [micState, setMicStateUI] = useState<MicState>("idle")

  // Live notes the agent has committed via setVariables. Updated when
  // the worker publishes `qualification:variable_update` data events.
  // Renders into <VariablesPanel> on the right (desktop) / below mic
  // (mobile). Empty until the agent commits its first note.
  const [variables, setVariables] = useState<VariablesState>({})

  // Minimum welcome-card display time. Even on fast connects, hold the
  // welcome long enough for the user to read it and settle. The mic UI
  // appears only when BOTH the room is connected AND this floor has elapsed.
  const [welcomeFloorElapsed, setWelcomeFloorElapsed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setWelcomeFloorElapsed(true), 3000)
    return () => clearTimeout(t)
  }, [])
  const showWelcome = connecting || !welcomeFloorElapsed

  // Mirror state into a ref so async handlers see the current value.
  const setMicState = useCallback((next: MicState) => {
    micStateRef.current = next
    setMicStateUI(next)
  }, [])

  // ---- LiveKit room lifecycle ----
  useEffect(() => {
    let cancelled = false
    const room = new Room()
    roomRef.current = room

    const finalizeOutcome = () => {
      const out = pendingOutcomeRef.current
      if (!out) return
      pendingOutcomeRef.current = null
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      if (maxWaitTimerRef.current) {
        clearTimeout(maxWaitTimerRef.current)
        maxWaitTimerRef.current = null
      }
      onOutcomeRef.current(out)
    }

    const scheduleSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = setTimeout(finalizeOutcome, SILENCE_BEFORE_SWAP_MS)
    }

    room.on(RoomEvent.DataReceived, (payload) => {
      // Two message types come through this channel:
      //   - qualification:outcome — published once at end-of-call by the
      //     worker after extractQualification returns.
      //   - qualification:variable_update — published per-variable each
      //     time the agent calls setVariables. Drives the live panel.
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as {
          type?: string
          outcome?: string
          name?: string
          value?: string
        }
        if (
          msg.type === "qualification:outcome" &&
          (msg.outcome === "qualified" ||
            msg.outcome === "disqualified")
        ) {
          deliberateDisconnectRef.current = true
          pendingOutcomeRef.current = msg.outcome
          scheduleSilenceTimer()
          maxWaitTimerRef.current = setTimeout(finalizeOutcome, OUTCOME_MAX_WAIT_MS)
        } else if (
          msg.type === "qualification:variable_update" &&
          typeof msg.name === "string" &&
          typeof msg.value === "string" &&
          VALID_VARIABLE_KEYS.has(msg.name)
        ) {
          // Functional update so React batches multiple in-flight updates
          // (the agent often commits 2+ variables in one setVariables call;
          // each becomes its own data event).
          setVariables((prev) => ({
            ...prev,
            [msg.name as VariableKey]: msg.value as string,
          }))
        }
      } catch {
        // ignore non-JSON
      }
    })

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      if (!pendingOutcomeRef.current) return
      const agentSpeaking = speakers.some(
        (s) => s.identity !== room.localParticipant?.identity,
      )
      if (agentSpeaking) {
        // Agent is mid-goodbye — pause the silence timer; wait it out.
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else {
        // No remote speakers active — start (or restart) the silence countdown.
        scheduleSilenceTimer()
      }
    })

    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, _pub: RemoteTrackPublication, _p: RemoteParticipant) => {
        // Pipe inbound audio (the agent's TTS) to the hidden sink.
        if (track.kind === "audio" && audioSinkRef.current) {
          track.attach(audioSinkRef.current)
        }
      },
    )

    room.on(RoomEvent.Disconnected, () => {
      // If we didn't disconnect ourselves, surface a generic error.
      // The outcome event always sets deliberateDisconnectRef first.
      if (!deliberateDisconnectRef.current && !cancelled) {
        setError(s.error_generic)
      }
    })

    ;(async () => {
      try {
        const resp = await fetch("/api/qualify/voice-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang, name, email }),
        })
        if (!resp.ok) throw new Error(`voice-init failed: ${resp.status}`)
        const { token, url } = (await resp.json()) as { token: string; url: string }

        if (cancelled) return
        await room.connect(url, token)
        // Important: enable inbound audio output (autoplay-unblock).
        await room.startAudio()
        // Mic stays DISABLED — PTT controls it.
        await room.localParticipant.setMicrophoneEnabled(false)
        if (!cancelled) setConnecting(false)
      } catch (e) {
        if (!cancelled) {
          console.error("voice-room init failed", e)
          setError(s.error_generic)
        }
      }
    })()

    return () => {
      cancelled = true
      deliberateDisconnectRef.current = true
      if (armedTimerRef.current) clearTimeout(armedTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (maxWaitTimerRef.current) clearTimeout(maxWaitTimerRef.current)
      room.disconnect().catch(() => {})
    }
  }, [lang, name, email, s.error_generic])

  // ---- Mic on/off helper ----
  const setMicEnabled = useCallback(async (enabled: boolean) => {
    const room = roomRef.current
    if (!room) return
    try {
      await room.localParticipant.setMicrophoneEnabled(enabled)
    } catch (e) {
      console.error("setMicrophoneEnabled failed", e)
      setError(s.voice_mic_blocked)
    }
  }, [s.voice_mic_blocked])

  // ---- Hybrid PTT state machine ----
  const handlePressStart = useCallback(() => {
    const cur = micStateRef.current
    // Tap-toggle currently on → second tap turns it off.
    if (cur === "speaking-toggle") {
      setMicState("idle")
      void setMicEnabled(false)
      return
    }
    // Already in another state → ignore (prevents double-press / focus jitter).
    if (cur !== "idle") return

    setMicState("armed")
    armedTimerRef.current = setTimeout(() => {
      // Held past the threshold → enter hold mode.
      if (micStateRef.current === "armed") {
        setMicState("speaking-hold")
        void setMicEnabled(true)
      }
    }, TAP_VS_HOLD_THRESHOLD_MS)
  }, [setMicEnabled, setMicState])

  const handlePressEnd = useCallback(() => {
    const cur = micStateRef.current
    if (cur === "armed") {
      // Released before threshold → tap-toggle ON.
      if (armedTimerRef.current) {
        clearTimeout(armedTimerRef.current)
        armedTimerRef.current = null
      }
      setMicState("speaking-toggle")
      void setMicEnabled(true)
    } else if (cur === "speaking-hold") {
      // Released after holding → end the turn.
      setMicState("idle")
      void setMicEnabled(false)
    }
    // speaking-toggle: no-op on release (toggle ends via second tap).
  }, [setMicEnabled, setMicState])

  // ---- Spacebar shortcut on desktop ----
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

  // ---- Mic button label ----
  const micLabel: string =
    micState === "armed" ? s.voice_mic_armed_label :
    micState === "speaking-hold" ? s.voice_mic_speaking_hold_label :
    micState === "speaking-toggle" ? s.voice_mic_speaking_toggle_label :
    s.voice_mic_idle_label

  return (
    <div className="qualify-voice">
      {/* Hidden audio sink for inbound agent audio. Required for autoplay
          on iOS Safari — the element must exist BEFORE startAudio(). */}
      <audio ref={audioSinkRef} autoPlay playsInline style={{ display: "none" }} />

      {/* Primary column: welcome card while connecting, then mic button.
          When the VariablesPanel renders alongside (desktop, see CSS
          :has() rule), this becomes the left column; on mobile and pre-
          notes desktop, it centers as it always did. */}
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
                // If the user holds and drags away, treat as end-of-turn.
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

      {/* Variables panel — fills live as the agent commits notes via
          setVariables. Renders nothing while empty (the agent hasn't
          committed yet); appears as soon as the first note lands. */}
      <VariablesPanel lang={lang} variables={variables} />
    </div>
  )
}
