"use client"

import { useEffect, useState } from "react"
import { MeetCallRoom } from "../call-room"
import type { MeetInitResponse } from "../lobby"
import type { Lang } from "@/lib/qualify/strings"
import "../meet.css"

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; init: MeetInitResponse }
  | { kind: "joining"; init: MeetInitResponse }
  | { kind: "in_call"; init: MeetInitResponse }
  | { kind: "permission_denied"; init: MeetInitResponse }
  | { kind: "not_found" }
  | { kind: "error"; message: string }

function getInitUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/walk-in/init"
  return `${base.replace(/\/$/, "")}/api/walk-in/init`
}

const STRINGS = {
  en: {
    lead: "Your meeting with Samuel.",
    sub: "Tap to join.",
    cta: "Join",
    joining: "Joining…",
    media_error_lead: "We need your camera and microphone.",
    media_error_sub:
      "Allow access in your browser, then tap Join again.",
    not_found_lead: "We couldn't find this meeting.",
    not_found_sub:
      "The link may have changed or the booking may not exist.",
    back_home: "Back to Samwise",
  },
  es: {
    lead: "Tu reunión con Samuel.",
    sub: "Toca para entrar.",
    cta: "Entrar",
    joining: "Entrando…",
    media_error_lead: "Necesitamos tu cámara y micrófono.",
    media_error_sub:
      "Permite el acceso en tu navegador y toca Entrar de nuevo.",
    not_found_lead: "No encontramos esta reunión.",
    not_found_sub:
      "Es posible que el link haya cambiado o que la reserva no exista.",
    back_home: "Volver a Samwise",
  },
} as const

// Pre-join lobby + in-call surface for SCHEDULED meetings (from /book).
//
// Why the lobby exists: mobile Safari (and to a lesser extent desktop
// Safari/Chrome) gates camera/microphone behind explicit user gesture
// + per-origin permission. If we go straight to LiveKit on mount,
// `createLocalTracks` throws when permission isn't yet granted, and
// the surface dies silently. The lobby forces a tap, requests media
// access at that gesture (which the browser honors), and only mounts
// the call room once permission is in hand.
export function ScheduledMeetClient({ id }: { id: string }) {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" })

  // Fetch the booking on mount; lobby shows once init lands.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(getInitUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "join_existing",
            walkInId: id,
            side: "user",
          }),
        })
        if (cancelled) return
        if (res.status === 404) {
          setLoad({ kind: "not_found" })
          return
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(body.error ?? `init failed (${res.status})`)
        }
        const init = (await res.json()) as MeetInitResponse
        setLoad({ kind: "ready", init })
      } catch (err) {
        if (cancelled) return
        setLoad({
          kind: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  // The tap-to-join handler — request permissions IN this gesture so
  // the browser doesn't suppress the prompt. Stop the temporary
  // tracks immediately; LiveKit re-acquires fresh ones once the call
  // room mounts. On denial, surface the message and stay on the
  // lobby so the user can retry after fixing browser settings.
  const handleJoin = async () => {
    setLoad((prev) =>
      prev.kind === "ready" ? { kind: "joining", init: prev.init } : prev,
    )
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      stream.getTracks().forEach((t) => t.stop())
      setLoad((prev) =>
        prev.kind === "joining"
          ? { kind: "in_call", init: prev.init }
          : prev,
      )
    } catch {
      setLoad((prev) =>
        prev.kind === "joining"
          ? { kind: "permission_denied", init: prev.init }
          : prev,
      )
    }
  }

  // ── Render branches ──────────────────────────────────────────

  if (load.kind === "in_call") {
    return <MeetCallRoom init={load.init} />
  }

  // Lobby chrome reused across loading / ready / joining /
  // permission_denied / not_found / error.
  const lang: Lang =
    load.kind === "ready" ||
    load.kind === "joining" ||
    load.kind === "permission_denied"
      ? load.init.booking.language
      : "en"
  const s = STRINGS[lang]

  return (
    <main className="meet-lobby" lang={lang}>
      <header className="meet-header">
        <a href="/" className="meet-brand" aria-label="Samwise">
          Samwise
          <span className="meet-brand-star" aria-hidden="true">
            ✦
          </span>
        </a>
      </header>

      <section className="meet-center">
        {load.kind === "loading" && (
          <p className="meet-sub">{lang === "es" ? "Cargando…" : "Loading…"}</p>
        )}

        {load.kind === "not_found" && (
          <>
            <p className="meet-lead">{s.not_found_lead}</p>
            <p className="meet-sub">{s.not_found_sub}</p>
            <a href="/" className="meet-prejoin-back">
              {s.back_home}
            </a>
          </>
        )}

        {load.kind === "error" && (
          <>
            <p className="meet-lead">
              {lang === "es" ? "Algo salió mal." : "Something went wrong."}
            </p>
            <p className="meet-sub">{load.message}</p>
          </>
        )}

        {(load.kind === "ready" ||
          load.kind === "joining" ||
          load.kind === "permission_denied") && (
          <>
            {load.kind === "permission_denied" ? (
              <>
                <p className="meet-lead">{s.media_error_lead}</p>
                <p className="meet-sub">{s.media_error_sub}</p>
              </>
            ) : (
              <>
                <p className="meet-lead">{s.lead}</p>
                <p className="meet-sub">{s.sub}</p>
              </>
            )}

            <button
              type="button"
              className="meet-cta"
              onClick={() => void handleJoin()}
              disabled={load.kind === "joining"}
            >
              <span className="meet-cta-dashes" aria-hidden="true">
                ―
              </span>
              <span className="meet-cta-text">
                {load.kind === "joining" ? s.joining : s.cta}
              </span>
              <span className="meet-cta-dashes" aria-hidden="true">
                ―
              </span>
            </button>
          </>
        )}
      </section>
    </main>
  )
}
