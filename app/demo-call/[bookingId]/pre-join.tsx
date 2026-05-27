"use client"

import { useCallback, useEffect, useState } from "react"
import { DEMO_CALL_STRINGS } from "@/lib/demo-call/strings"
import type { Lang } from "@/lib/qualify/strings"

// Init response from /api/demo-call/init (samwise-app), side="user".
export interface UserInitResponse {
  token: string
  wsUrl: string
  roomName: string
  booking: {
    roomName: string
    therapistName: string
    prospectFirstName: string
    language: Lang
    scheduledFor: string
  }
}

// The cross-origin URL of samwise-app's /api/demo-call/init endpoint.
// In dev: NEXT_PUBLIC_SAMWISE_APP_URL=http://localhost:3000.
// In prod: NEXT_PUBLIC_SAMWISE_APP_URL=https://app.samwise.life.
function getInitUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) {
    // Sensible default for local dev — most contributors run samwise-app
    // on :3000 and samwise-landing on :3001. The error surfaces in the
    // toast if this assumption is wrong.
    return "http://localhost:3000/api/demo-call/init"
  }
  return `${base.replace(/\/$/, "")}/api/demo-call/init`
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; init: UserInitResponse }
  | { kind: "not_found" }
  | { kind: "cancelled" }
  | { kind: "error"; message: string }

interface PreJoinProps {
  bookingId: string
  onJoined: (init: UserInitResponse) => void
}

// Lobby surface. POSTs to /api/demo-call/init at mount, then waits for
// the user to grant mic/camera and click Join. Visual register mirrors
// /qualify's picker exactly: Fraunces italic lead, Manrope small-caps
// sub, hairline gold-dash CTA. Bilingual driven by the booking's
// `language` field (Cal.com booking-form question).
export function PreJoin({ bookingId, onJoined }: PreJoinProps) {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" })
  const [permissionState, setPermissionState] = useState<
    "untested" | "granted" | "denied"
  >("untested")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(getInitUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, side: "user" }),
        })
        if (cancelled) return
        if (res.status === 404) {
          setLoad({ kind: "not_found" })
          return
        }
        if (res.status === 410) {
          setLoad({ kind: "cancelled" })
          return
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(body.error ?? `Init failed (${res.status})`)
        }
        const init = (await res.json()) as UserInitResponse
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
  }, [bookingId])

  // Surface the browser's mic/camera permission prompt BEFORE the user
  // commits to joining — gives them a chance to test their setup. Stops
  // the tracks immediately; the call itself re-acquires fresh tracks.
  const testAv = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionState("granted")
    } catch {
      setPermissionState("denied")
    }
  }, [])

  // Loading state — use English fallback strings until we know the
  // booking's language.
  if (load.kind === "loading") {
    return (
      <main className="demo-call-prejoin">
        <header className="demo-call-prejoin-header">
          <a href="/" className="demo-call-prejoin-brand" aria-label="Samwise">
            Samwise
            <span className="demo-call-prejoin-brand-star" aria-hidden="true">
              ✦
            </span>
          </a>
        </header>
        <section className="demo-call-prejoin-center">
          <p className="demo-call-prejoin-loading">
            {DEMO_CALL_STRINGS.en.pre_join_loading}
          </p>
        </section>
      </main>
    )
  }

  // Strings — once we know the language, use the right translation.
  const lang: Lang =
    load.kind === "ready" ? load.init.booking.language : "en"
  const s = DEMO_CALL_STRINGS[lang]

  if (load.kind === "not_found" || load.kind === "cancelled") {
    const leadKey =
      load.kind === "not_found"
        ? "pre_join_not_found_lead"
        : "pre_join_cancelled_lead"
    const subKey =
      load.kind === "not_found"
        ? "pre_join_not_found_sub"
        : "pre_join_cancelled_sub"
    return (
      <main className="demo-call-prejoin">
        <header className="demo-call-prejoin-header">
          <a href="/" className="demo-call-prejoin-brand" aria-label="Samwise">
            Samwise
            <span className="demo-call-prejoin-brand-star" aria-hidden="true">
              ✦
            </span>
          </a>
        </header>
        <section className="demo-call-prejoin-center">
          <p className="demo-call-prejoin-lead">{s[leadKey]}</p>
          <p className="demo-call-prejoin-sub">{s[subKey]}</p>
          <a href="/" className="demo-call-prejoin-back">
            {s.pre_join_back_home}
          </a>
        </section>
      </main>
    )
  }

  if (load.kind === "error") {
    return (
      <main className="demo-call-prejoin">
        <header className="demo-call-prejoin-header">
          <a href="/" className="demo-call-prejoin-brand" aria-label="Samwise">
            Samwise
            <span className="demo-call-prejoin-brand-star" aria-hidden="true">
              ✦
            </span>
          </a>
        </header>
        <section className="demo-call-prejoin-center">
          <p className="demo-call-prejoin-lead">Hmm — something went wrong.</p>
          <p className="demo-call-prejoin-sub">{load.message}</p>
        </section>
      </main>
    )
  }

  // Ready.
  const { init } = load
  return (
    <main className="demo-call-prejoin">
      <header className="demo-call-prejoin-header">
        <a href="/" className="demo-call-prejoin-brand" aria-label="Samwise">
          Samwise
          <span className="demo-call-prejoin-brand-star" aria-hidden="true">
            ✦
          </span>
        </a>
      </header>
      <section className="demo-call-prejoin-center">
        <p className="demo-call-prejoin-lead">{s.pre_join_lead}</p>
        <p className="demo-call-prejoin-sub">{s.pre_join_sub}</p>

        <button
          type="button"
          className="demo-call-cta"
          onClick={() => onJoined(init)}
        >
          <span className="demo-call-cta-dashes" aria-hidden="true">
            ―
          </span>
          <span className="demo-call-cta-text">{s.pre_join_cta}</span>
          <span className="demo-call-cta-dashes" aria-hidden="true">
            ―
          </span>
        </button>

        <button
          type="button"
          className="demo-call-prejoin-test"
          onClick={() => void testAv()}
        >
          {s.pre_join_test_av}
          {permissionState === "granted" ? "  ✓" : null}
          {permissionState === "denied" ? "  ✗" : null}
        </button>
      </section>
    </main>
  )
}
