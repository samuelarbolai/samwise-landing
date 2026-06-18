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
import type { Audience } from "./language-picker"
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
  // Therapist audience (the four questions).
  "patient_addiction_type",
  "last_patient_occurrence",
  "helped_patient_attempts",
  "why_attempts_failed",
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

// Lightweight, greppable client-side tracing for the qualify voice flow.
// Filter the browser console by "[qualify]" to follow the whole lifecycle:
//   voice-init → room.connect → agent-join (participantConnected) →
//   audio (trackSubscribed) → speech (activeSpeakers) → data events.
// Diagnostic reads:
//   • "room.connect resolved" but never "participantConnected" → the agent
//     isn't joining (dispatch / worker side, NOT this page).
//   • "participantConnected" + "trackSubscribed audio" but you hear nothing
//     → audio routing / autoplay (client side).
//   • init throws before "room.connect resolved" → voice-init / env / token.
const qlog = (...args: unknown[]) => {
  console.log("[qualify]", ...args)
}

export function VoiceRoom({
  lang,
  name,
  email,
  audience,
  onOutcome,
}: {
  lang: Lang
  name: string
  email: string
  audience: Audience
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

  // Set when the worker publishes `qualification:finalizing` (the instant
  // endCall fires). While true, the mic is replaced by the "Almost there…"
  // indicator and PTT/spacebar are disabled. Cleared implicitly by the
  // swap to <FinalScreen> on outcome.
  const [finalizing, setFinalizing] = useState(false)
  const finalizingRef = useRef(false)
  const finalizingSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    finalizingRef.current = finalizing
  }, [finalizing])

  // ---- Auto-follow the newest note ----
  // Once notes fill the viewport, new cards append below the fold (the
  // speaker dock is fixed at the bottom — see qualify.css :has(.qualify-notes)).
  // We scroll the newest note into view, but ONLY if the user is already at
  // the bottom — never yank someone who scrolled up to re-read. A scroll
  // listener tracks that intent: a new note doesn't move scrollY, so the
  // flag reflects where the user last left the page, not the post-growth
  // position. The .qualify-voice 248px padding-bottom lands the last note
  // above the fixed dock + scrim.
  const stickToBottomRef = useRef(true)
  useEffect(() => {
    const NEAR_BOTTOM_PX = 150
    const onScroll = () => {
      const dist =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight
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
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: reduce ? "auto" : "smooth",
      })
    })
  }, [noteCount])

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
    qlog("voice room mounting", { lang, hasName: !!name, hasEmail: !!email })

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
      if (finalizingSafetyTimerRef.current) {
        clearTimeout(finalizingSafetyTimerRef.current)
        finalizingSafetyTimerRef.current = null
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
        qlog("data ←", msg.type, msg.name ?? msg.outcome ?? "")
        if (
          msg.type === "qualification:outcome" &&
          (msg.outcome === "qualified" ||
            msg.outcome === "disqualified")
        ) {
          deliberateDisconnectRef.current = true
          pendingOutcomeRef.current = msg.outcome
          scheduleSilenceTimer()
          maxWaitTimerRef.current = setTimeout(finalizeOutcome, OUTCOME_MAX_WAIT_MS)
        } else if (msg.type === "qualification:finalizing") {
          // Worker tells us extraction is in progress. Replace mic with
          // the wait indicator; force mic off in case the user was
          // holding when the agent called endCall; start 30s safety net.
          setFinalizing(true)
          void setMicEnabled(false)
          setMicState("idle")
          if (finalizingSafetyTimerRef.current) {
            clearTimeout(finalizingSafetyTimerRef.current)
          }
          finalizingSafetyTimerRef.current = setTimeout(() => {
            // No outcome arrived in 30s. Force a transition so the user
            // is never stuck. Default to "qualified" — the booking link
            // is the same; the worker / cloud function will still write
            // Firestore when (or if) the extraction eventually completes.
            console.error(
              "[qualify] finalizing safety net fired — no outcome event in 30s",
            )
            deliberateDisconnectRef.current = true
            onOutcomeRef.current("qualified")
          }, 30000)
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
      qlog("activeSpeakers", speakers.map((p) => p.identity))
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
      (track: RemoteTrack, _pub: RemoteTrackPublication, p: RemoteParticipant) => {
        qlog("trackSubscribed", { kind: track.kind, from: p.identity })
        // Pipe inbound audio (the agent's TTS) to the hidden sink.
        if (track.kind === "audio" && audioSinkRef.current) {
          track.attach(audioSinkRef.current)
          qlog("agent audio attached → sink")
        } else if (track.kind === "audio") {
          console.warn("[qualify] audio track arrived but no sink element yet")
        }
      },
    )

    room.on(RoomEvent.ParticipantConnected, (p) => {
      qlog("participantConnected", p.identity, {
        remotes: room.remoteParticipants.size,
      })
    })
    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      qlog("participantDisconnected", p.identity)
    })
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      qlog("connectionState", state)
    })

    room.on(RoomEvent.Disconnected, (reason) => {
      qlog("disconnected", {
        reason,
        deliberate: deliberateDisconnectRef.current,
        cancelled,
      })
      // If we didn't disconnect ourselves, surface a generic error.
      // The outcome event always sets deliberateDisconnectRef first.
      if (!deliberateDisconnectRef.current && !cancelled) {
        setError(s.error_generic)
      }
    })

    ;(async () => {
      try {
        qlog("POST /api/qualify/voice-init …")
        const resp = await fetch("/api/qualify/voice-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang, name, email, audience }),
        })
        qlog("voice-init status", resp.status)
        if (!resp.ok) throw new Error(`voice-init failed: ${resp.status}`)
        const { token, url } = (await resp.json()) as { token: string; url: string }
        qlog("voice-init ok", { hasToken: !!token, url })

        if (cancelled) return
        await room.connect(url, token)
        qlog("room.connect resolved", {
          name: room.name,
          state: room.state,
          remotes: room.remoteParticipants.size,
        })
        // Important: enable inbound audio output (autoplay-unblock).
        await room.startAudio()
        qlog("startAudio resolved", { canPlaybackAudio: room.canPlaybackAudio })
        // Mic stays DISABLED — PTT controls it.
        await room.localParticipant.setMicrophoneEnabled(false)
        if (!cancelled) setConnecting(false)
        qlog("connected — waiting for the agent to join + speak")
        // Watchdog: the agent should join within a couple of seconds. If no
        // remote participant after 10s, the dispatch never produced a worker
        // — that's server/agent side, NOT this page.
        setTimeout(() => {
          if (cancelled) return
          const r = roomRef.current
          if (r && r.remoteParticipants.size === 0) {
            console.warn(
              "[qualify] NO agent joined 10s after connect — dispatch/worker side, not the client",
            )
          }
        }, 10000)
      } catch (e) {
        if (!cancelled) {
          console.error("[qualify] voice-room init FAILED", e)
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
      if (finalizingSafetyTimerRef.current) clearTimeout(finalizingSafetyTimerRef.current)
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
    if (finalizingRef.current) return
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
    if (finalizingRef.current) return
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
      if (finalizingRef.current) return
      e.preventDefault()
      handlePressStart()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return
      if (isTypingTarget(e.target)) return
      if (finalizingRef.current) return
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

        {!showWelcome && !error && finalizing && (
          <div className="qualify-voice-mic-dock">
            <p className="qualify-voice-finalizing" aria-live="polite">
              {s.voice_finalizing_label}
            </p>
          </div>
        )}

        {!showWelcome && !error && !finalizing && (
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
