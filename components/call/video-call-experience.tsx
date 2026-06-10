'use client'

// =====================================================================
// DUPLICATE of samwise-app/components/demo-call/VideoCallExperience.tsx.
//
// Per current-plan.md (samwise-app) Phase 8 Step 8.4: samwise-landing
// and samwise-app are independent Next.js projects with independent
// build systems; livekit-client versions can drift. Keeping a verbatim
// copy avoids a cross-project import. Mark as "extract to shared
// package" candidate if maintenance friction surfaces.
//
// When you change ONE, change the OTHER. Both files should remain
// byte-identical (modulo this header and the file path in imports).
// =====================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Room,
  RoomEvent,
  Track,
  createLocalTracks,
  type LocalTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from 'livekit-client'

type Phase =
  | 'connecting'
  | 'active'
  | 'peer-waiting'
  | 'reconnecting'
  | 'dropped'
  | 'ended'
  | 'error'

// Delay before the first auto-reconnect attempt after an involuntary drop.
const RECONNECT_DELAY_MS = 2000

export interface VideoCallInit {
  token: string
  wsUrl: string
  roomName: string
}

export interface VideoCallExperienceProps {
  init: VideoCallInit
  /** Optional aria-live status copy shown in the connecting/peer-waiting
   * overlay. Pass a { lead, sub } pair to render the same editorial
   * register as /qualify's welcome card. */
  status?: {
    connectingLead: string
    connectingSub: string
    waitingLead: string
    waitingSub: string
    reconnectingLead: string
    reconnectingSub: string
    droppedLead: string
    droppedSub: string
    rejoinLabel: string
    endedLead: string
    endedSub: string
    /** Shown centered over the tile when a remote participant is connected
     * but publishes NO video (an audio-only agent). Omit for human calls —
     * then the empty tile is left as-is. */
    audioOnlyLabel?: string
    audioOnlySub?: string
    /** Tappable overlay shown when the browser is blocking audio playback
     * (iOS autoplay / post-background suspension). Tapping re-runs
     * room.startAudio() from inside the gesture. */
    tapToEnableLabel?: string
    tapToEnableSub?: string
  }
  onDataMessage?: (msg: unknown) => void
  onRoomReady?: (room: Room) => void
  hardCapMs?: number
  onEnded?: () => void
}

export function VideoCallExperience(props: VideoCallExperienceProps) {
  const { init, status, onDataMessage, onRoomReady, onEnded } = props
  const hardCapMs = props.hardCapMs ?? 75 * 60 * 1000

  const [phase, setPhase] = useState<Phase>('connecting')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Whether the connected remote publishes video. Stays false for an
  // audio-only agent → we render an intentional voice panel, not a black tile.
  const [remoteHasVideo, setRemoteHasVideo] = useState(false)
  // iOS Safari blocks audio autoplay until a user gesture, AND suspends
  // playback when the tab is backgrounded / the phone locks. When that
  // happens `room.canPlaybackAudio` flips false; we surface a tap-to-enable
  // affordance that re-runs startAudio() from inside the tap (the only thing
  // iOS accepts). Covers both the initial autoplay block and post-background
  // resume — the inbound twin of the mic auto-mute bug.
  const [audioBlocked, setAudioBlocked] = useState(false)

  const roomRef = useRef<Room | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)
  const remoteVideoCountRef = useRef(0)
  const startingRef = useRef(false)
  const hardCapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref-mirror the callbacks + init so the connect closure always sees
  // the latest values WITHOUT re-binding `start`. Without this, a parent
  // that recreates `init` / `onRoomReady` on render (e.g. on every
  // keystroke in a sibling) would change `start`'s identity, re-run the
  // connect effect, and tear down + reconnect the room. With a shared
  // LiveKit identity that also kicks the other tab, producing a churn.
  const onDataMessageRef = useRef(onDataMessage)
  useEffect(() => {
    onDataMessageRef.current = onDataMessage
  }, [onDataMessage])
  const onRoomReadyRef = useRef(onRoomReady)
  useEffect(() => {
    onRoomReadyRef.current = onRoomReady
  }, [onRoomReady])
  const initRef = useRef(init)
  useEffect(() => {
    initRef.current = init
  }, [init])

  // Reconnect state. deliberateRef tells an involuntary drop apart from a
  // user-driven exit (End call / cap / unmount). reconnectTimerRef holds the
  // pending auto-retry. connectRoomRef lets the listener closures + the Rejoin
  // button re-enter connectRoom without re-binding it.
  const deliberateRef = useRef(false)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectRoomRef = useRef<() => Promise<void>>(async () => {})
  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      deliberateRef.current = true
      clearReconnectTimer()
      const r = roomRef.current
      if (r) {
        r.removeAllListeners()
        void r.disconnect()
      }
      roomRef.current = null
      if (hardCapTimerRef.current) clearTimeout(hardCapTimerRef.current)
    }
  }, [])

  // NOTE: we deliberately do NOT auto-mute on tab-hidden. The prior handler
  // muted on `visibilitychange → hidden` with no restore on `visible`, so any
  // backgrounding — switching windows, or on mobile locking the screen /
  // switching apps — silently killed the mic for the rest of the call. On a
  // 50–70 min demo that meant audio "lost in the middle". The mic stays under
  // explicit user control via the Mute button only.

  const endCall = useCallback(() => {
    deliberateRef.current = true
    clearReconnectTimer()
    const room = roomRef.current
    if (room) {
      room.removeAllListeners()
      void room.disconnect()
    }
    roomRef.current = null
    if (hardCapTimerRef.current) {
      clearTimeout(hardCapTimerRef.current)
      hardCapTimerRef.current = null
    }
    setPhase('ended')
    onEnded?.()
  }, [onEnded])

  // Connect — or RECONNECT — to the SAME room using the still-valid token
  // (3h TTL). Creates a fresh Room, wires listeners, publishes local tracks,
  // and re-fires onRoomReady so a parent broadcaster rebinds to the new Room.
  // On failure it strips its own listeners (so a hard error can't spin the
  // reconnect path) and rethrows for the caller to surface.
  const connectRoom = useCallback(async () => {
    clearReconnectTimer()
    // Drop any remote media + video-count left over from a previous room so a
    // reconnect re-derives remoteHasVideo from the fresh subscriptions.
    const sink = remoteContainerRef.current
    if (sink) while (sink.firstChild) sink.removeChild(sink.firstChild)
    remoteVideoCountRef.current = 0
    setRemoteHasVideo(false)

    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room

    const onTrackSubscribed = (
      track: RemoteTrack,
      _pub: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      const el = track.attach() as HTMLMediaElement
      el.autoplay = true
      if (track.kind === Track.Kind.Video) {
        const v = el as HTMLVideoElement
        v.playsInline = true
        v.dataset.role = 'remote-video'
        remoteVideoCountRef.current += 1
        setRemoteHasVideo(true)
      } else if (track.kind === Track.Kind.Audio) {
        el.dataset.role = 'remote-audio'
      }
      el.dataset.participant = participant.identity
      remoteContainerRef.current?.appendChild(el)
    }
    const onTrackUnsubscribed = (track: RemoteTrack) => {
      track.detach().forEach((el) => el.remove())
      if (track.kind === Track.Kind.Video) {
        remoteVideoCountRef.current = Math.max(0, remoteVideoCountRef.current - 1)
        setRemoteHasVideo(remoteVideoCountRef.current > 0)
      }
    }
    // Count only HUMAN remotes for the call's presence state — a silent scribe
    // (or any agent) joins as a participant but is NOT the person you're
    // meeting, so it must not flip "waiting" → "active" or hide "peer left".
    const hasHumanPeer = () =>
      [...room.remoteParticipants.values()].some((p) => !p.isAgent)
    const onParticipantConnected = () => {
      if (hasHumanPeer()) setPhase('active')
    }
    const onParticipantDisconnected = () => {
      if (!hasHumanPeer()) setPhase('peer-waiting')
    }
    // Involuntary drop ONLY — deliberate teardowns (End call / cap / unmount)
    // strip listeners first, so this never fires on a user-driven exit. Show a
    // reconnecting state and auto-retry once after a short beat; if that fails,
    // surface a manual Rejoin ('dropped'). The room is usually still alive with
    // the peer, so reconnecting lands the user right back in the same session.
    const onDisconnect = () => {
      if (deliberateRef.current) return
      setPhase('reconnecting')
      clearReconnectTimer()
      reconnectTimerRef.current = setTimeout(() => {
        connectRoomRef.current().catch(() => setPhase('dropped'))
      }, RECONNECT_DELAY_MS)
    }
    const onData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload)
        const parsed: unknown = JSON.parse(text)
        onDataMessageRef.current?.(parsed)
      } catch {
        // Ignore.
      }
    }

    const onAudioPlaybackChanged = () => setAudioBlocked(!room.canPlaybackAudio)

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected)
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
    room.on(RoomEvent.Disconnected, onDisconnect)
    room.on(RoomEvent.DataReceived, onData)
    room.on(RoomEvent.AudioPlaybackStatusChanged, onAudioPlaybackChanged)

    try {
      await room.connect(initRef.current.wsUrl, initRef.current.token)

      // Mic is required; camera is best-effort. Requesting both together
      // means a missing/denied camera (webcam-less desktop, camera in use)
      // fails BOTH and kills the voice call. Acquire audio first, then try
      // video separately and tolerate its failure → call still works audio-only.
      const localTracks: LocalTrack[] = await createLocalTracks({
        audio: true,
        video: false,
      })
      try {
        const [videoTrack] = await createLocalTracks({
          audio: false,
          video: true,
        })
        if (videoTrack) {
          localTracks.push(videoTrack)
          setCamOn(true)
        }
      } catch {
        // No camera / camera denied → audio-only. Reflect it in the control.
        setCamOn(false)
      }
      await Promise.all(
        localTracks.map((t) => room.localParticipant.publishTrack(t)),
      )
      const localVideo = localTracks.find((t) => t.kind === Track.Kind.Video)
      if (localVideo && localVideoRef.current) {
        localVideo.attach(localVideoRef.current)
      }
      try {
        await room.startAudio()
      } catch {
        // Autoplay still blocked (the live gesture was lost across the
        // connect await) — the tap-to-enable affordance recovers it.
      }
      setAudioBlocked(!room.canPlaybackAudio)

      if (hasHumanPeer()) setPhase('active')
      else setPhase('peer-waiting')

      onRoomReadyRef.current?.(room)
    } catch (err) {
      // Strip BEFORE disconnect so the Disconnected event can't drive the
      // reconnect path (or the 'ended' race) on a hard error like a denied
      // camera permission. Rethrow — the caller decides how to surface it.
      room.removeAllListeners()
      void room.disconnect()
      roomRef.current = null
      throw err
    }
  }, [])
  // Stable ref to connectRoom so listener closures + the Rejoin button can
  // re-enter it without re-binding connectRoom itself.
  useEffect(() => {
    connectRoomRef.current = connectRoom
  }, [connectRoom])

  // Manual Rejoin from the 'dropped' overlay — tries the same room again.
  const rejoin = useCallback(() => {
    setPhase('reconnecting')
    connectRoomRef.current().catch(() => setPhase('dropped'))
  }, [])

  const start = useCallback(async () => {
    if (startingRef.current) return
    startingRef.current = true
    try {
      await connectRoom()
      // Arm the wall-clock cap ONCE; it measures total session time from the
      // first connect and must survive reconnects (don't re-arm per connect).
      if (!hardCapTimerRef.current) {
        hardCapTimerRef.current = setTimeout(() => {
          console.warn('[demo-call] wall-clock cap reached, ending call')
          endCall()
        }, hardCapMs)
      }
    } catch (err) {
      console.error('[demo-call] connect failed', err)
      const sig = err instanceof Error ? `${err.name} ${err.message}` : ''
      let copy: string
      if (/NotAllowed|Permission|denied/i.test(sig)) {
        // The browser has a stored "no" for the mic — reloading will NOT
        // re-prompt. Point the user at the per-site permission UI instead.
        copy =
          'Your microphone is blocked. Open this site\u2019s permissions — ' +
          'the lock/camera icon in the address bar (on iPhone, tap ' +
          '\u201c\u1d00A\u201d \u2192 Website Settings) — set Microphone to ' +
          'Allow, then reload.'
      } else if (/NotFound|NotReadable|Overconstrained|Devices/i.test(sig)) {
        copy =
          'We couldn\u2019t reach a microphone. Check that one is connected ' +
          'and not in use by another app, then reload.'
      } else {
        copy = err instanceof Error ? err.message : 'Could not connect.'
      }
      setErrorMsg(copy)
      setPhase('error')
    } finally {
      startingRef.current = false
    }
  }, [connectRoom, endCall, hardCapMs])

  useEffect(() => {
    void start()
  }, [start])

  // Re-run the autoplay unblock from inside a real user tap. iOS only honours
  // startAudio() within a gesture, so this is wired to a visible affordance,
  // not called automatically. Clears the affordance once playback resumes.
  const enableAudio = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    try {
      await room.startAudio()
    } catch {
      // Still blocked — the affordance stays until playback actually resumes.
    }
    setAudioBlocked(!room.canPlaybackAudio)
  }, [])

  const toggleMic = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    const next = !micOn
    await room.localParticipant.setMicrophoneEnabled(next)
    setMicOn(next)
  }, [micOn])

  const toggleCam = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    const next = !camOn
    await room.localParticipant.setCameraEnabled(next)
    setCamOn(next)
  }, [camOn])

  return (
    <div className="demo-call-video-frame">
      {/* The contained tile — dark interior, rounded corners, soft
          shadow. Sits on the gallery-white page surface. */}
      <div className="demo-call-video">
        <div ref={remoteContainerRef} className="demo-call-video-remote" />

        <div className="demo-call-video-self">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="demo-call-video-self-el"
          />
        </div>

        {phase !== 'active' && (
          <div className="demo-call-video-overlay" aria-live="polite">
            {phase === 'connecting' && status && (
              <>
                <p className="demo-call-overlay-lead">{status.connectingLead}</p>
                <p className="demo-call-overlay-sub">{status.connectingSub}</p>
              </>
            )}
            {phase === 'peer-waiting' && status && (
              <>
                <p className="demo-call-overlay-lead">{status.waitingLead}</p>
                <p className="demo-call-overlay-sub">{status.waitingSub}</p>
              </>
            )}
            {phase === 'reconnecting' && status && (
              <>
                <p className="demo-call-overlay-lead">{status.reconnectingLead}</p>
                <p className="demo-call-overlay-sub">{status.reconnectingSub}</p>
              </>
            )}
            {phase === 'dropped' && status && (
              <>
                <p className="demo-call-overlay-lead">{status.droppedLead}</p>
                <p className="demo-call-overlay-sub">{status.droppedSub}</p>
                <button
                  type="button"
                  onClick={rejoin}
                  className="demo-call-control-btn"
                  style={{ pointerEvents: 'auto', marginTop: '0.75rem' }}
                >
                  {status.rejoinLabel}
                </button>
              </>
            )}
            {phase === 'ended' && status && (
              <>
                <p className="demo-call-overlay-lead">{status.endedLead}</p>
                <p className="demo-call-overlay-sub">{status.endedSub}</p>
              </>
            )}
            {phase === 'error' && (
              <p className="demo-call-overlay-lead">
                {errorMsg ?? 'Something went wrong.'}
              </p>
            )}
          </div>
        )}

        {/* Audio-only remote (e.g. the AI guide): the call is live but there's
            no video track, so render an intentional voice panel instead of a
            black tile. Only fires when the caller passes audioOnlyLabel. */}
        {phase === 'active' && !remoteHasVideo && (
          <div className="demo-call-video-overlay" aria-live="polite">
            {status?.audioOnlyLabel && (
              <p className="demo-call-overlay-lead">{status.audioOnlyLabel}</p>
            )}
            {status?.audioOnlySub && (
              <p className="demo-call-overlay-sub">{status.audioOnlySub}</p>
            )}
          </div>
        )}

        {/* iOS audio recovery: the whole tile becomes a tap target when the
            browser is blocking playback (autoplay block, or suspension after
            backgrounding / screen-lock). One tap re-runs startAudio(). */}
        {phase === 'active' && audioBlocked && (
          <button
            type="button"
            onClick={() => void enableAudio()}
            className="demo-call-video-overlay demo-call-audio-unblock"
            style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'rgba(0,0,0,0.45)', border: 0 }}
            aria-live="polite"
          >
            <span className="demo-call-overlay-lead">
              {status?.tapToEnableLabel ?? 'Tap to enable sound'}
            </span>
            {status?.tapToEnableSub && (
              <span className="demo-call-overlay-sub">{status.tapToEnableSub}</span>
            )}
          </button>
        )}
      </div>

      {/* Controls live OUTSIDE the tile, on the page surface — small
          Manrope-small-caps text buttons with hairline underline
          on hover, in keeping with the qualify register. No dark bar. */}
      <div className="demo-call-controls">
        <button
          type="button"
          onClick={() => void toggleMic()}
          className="demo-call-control-btn"
          aria-pressed={!micOn}
        >
          {micOn ? 'Mute' : 'Unmute'}
        </button>
        <button
          type="button"
          onClick={() => void toggleCam()}
          className="demo-call-control-btn"
          aria-pressed={!camOn}
        >
          {camOn ? 'Camera off' : 'Camera on'}
        </button>
        <button
          type="button"
          onClick={endCall}
          className="demo-call-control-btn demo-call-control-end"
        >
          End call
        </button>
      </div>
    </div>
  )
}
