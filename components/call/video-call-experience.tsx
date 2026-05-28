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

type Phase = 'connecting' | 'active' | 'peer-waiting' | 'ended' | 'error'

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
    endedLead: string
    endedSub: string
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

  const roomRef = useRef<Room | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)
  const startingRef = useRef(false)
  const hardCapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onDataMessageRef = useRef(onDataMessage)
  useEffect(() => {
    onDataMessageRef.current = onDataMessage
  }, [onDataMessage])

  useEffect(() => {
    return () => {
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

  const start = useCallback(async () => {
    if (startingRef.current) return
    startingRef.current = true

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
      } else if (track.kind === Track.Kind.Audio) {
        el.dataset.role = 'remote-audio'
      }
      el.dataset.participant = participant.identity
      remoteContainerRef.current?.appendChild(el)
    }
    const onTrackUnsubscribed = (track: RemoteTrack) => {
      track.detach().forEach((el) => el.remove())
    }
    const onParticipantConnected = () => setPhase('active')
    const onParticipantDisconnected = () => {
      if (room.remoteParticipants.size === 0) setPhase('peer-waiting')
    }
    const onDisconnect = () => setPhase('ended')
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
      await room.connect(init.wsUrl, init.token)

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

      hardCapTimerRef.current = setTimeout(() => {
        console.warn('[demo-call] wall-clock cap reached, ending call')
        endCall()
      }, hardCapMs)

      if (room.remoteParticipants.size > 0) setPhase('active')
      else setPhase('peer-waiting')

      onRoomReady?.(room)
    } catch (err) {
      console.error('[demo-call] connect failed', err)
      // STRIP LISTENERS BEFORE disconnect — otherwise the Disconnected
      // event fires and our onDisconnect handler overwrites this
      // 'error' phase with 'ended', so the user sees "The meeting
      // has ended" instead of the actual error (e.g. denied camera
      // permission on mobile Safari). Real bug observed in prod.
      room.removeAllListeners()
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
      void room.disconnect()
      roomRef.current = null
    } finally {
      startingRef.current = false
    }
  }, [init, hardCapMs, endCall, onRoomReady])

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
