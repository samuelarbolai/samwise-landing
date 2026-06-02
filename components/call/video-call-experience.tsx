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

  useEffect(() => {
    if (phase !== 'active' && phase !== 'peer-waiting') return
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        const room = roomRef.current
        if (!room) return
        void room.localParticipant.setMicrophoneEnabled(false)
        setMicOn(false)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [phase])

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
    const onParticipantConnected = () => setPhase('active')
    const onParticipantDisconnected = () => {
      if (room.remoteParticipants.size === 0) setPhase('peer-waiting')
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

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected)
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
    room.on(RoomEvent.Disconnected, onDisconnect)
    room.on(RoomEvent.DataReceived, onData)

    try {
      await room.connect(initRef.current.wsUrl, initRef.current.token)

      const localTracks: LocalTrack[] = await createLocalTracks({
        audio: true,
        video: true,
      })
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
        // user can re-trigger via mic button
      }

      if (room.remoteParticipants.size > 0) setPhase('active')
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
      const isMediaErr =
        err instanceof Error &&
        /Permission|NotAllowed|NotReadable|denied/i.test(
          `${err.name} ${err.message}`,
        )
      setErrorMsg(
        isMediaErr
          ? 'We couldn\'t access your camera or microphone. Grant permission and reload the page.'
          : err instanceof Error
            ? err.message
            : 'Could not connect.',
      )
      setPhase('error')
    } finally {
      startingRef.current = false
    }
  }, [connectRoom, endCall, hardCapMs])

  useEffect(() => {
    void start()
  }, [start])

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

        {/* TEMP black-tile diagnostic — remove once resolved. If you don't see
            this green line at all, the new build isn't live. */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 5,
            font: '10px monospace',
            color: '#39ff14',
            background: 'rgba(0,0,0,0.55)',
            padding: '2px 5px',
            borderRadius: 3,
            pointerEvents: 'none',
          }}
        >
          {`phase=${phase} · remoteVideo=${String(remoteHasVideo)} · label=${status?.audioOnlyLabel ? 'yes' : 'no'}`}
        </div>
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
