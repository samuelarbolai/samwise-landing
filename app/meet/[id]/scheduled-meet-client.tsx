"use client"

import { useEffect, useState } from "react"
import { MeetCallRoom } from "../call-room"
import type { MeetInitResponse } from "../lobby"
import "../meet.css"

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; init: MeetInitResponse }
  | { kind: "not_found" }
  | { kind: "error"; message: string }

function getInitUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/walk-in/init"
  return `${base.replace(/\/$/, "")}/api/walk-in/init`
}

// Auto-joins the scheduled meeting on mount. No pre-join lobby —
// the prospect already committed when they booked at /book; the
// browser's mic/camera permission prompt fires when LiveKit publishes
// local tracks on the next page. If the booking id resolves to
// nothing (link is wrong / expired), show a warm not-found screen.
export function ScheduledMeetClient({ id }: { id: string }) {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(getInitUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "join_existing",
            walkInId: id, // route accepts any id (calendarBookings or walkIns)
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

  if (load.kind === "loading") {
    return (
      <main className="meet-lobby">
        <header className="meet-header">
          <a href="/" className="meet-brand" aria-label="Samwise">
            Samwise
            <span className="meet-brand-star" aria-hidden="true">✦</span>
          </a>
        </header>
        <section className="meet-center">
          <p className="meet-sub">Joining…</p>
        </section>
      </main>
    )
  }

  if (load.kind === "not_found") {
    return (
      <main className="meet-lobby">
        <header className="meet-header">
          <a href="/" className="meet-brand" aria-label="Samwise">
            Samwise
            <span className="meet-brand-star" aria-hidden="true">✦</span>
          </a>
        </header>
        <section className="meet-center">
          <p className="meet-lead">We couldn&apos;t find this meeting.</p>
          <p className="meet-sub">
            The link may have changed or the booking may not exist.
          </p>
          <a href="/" className="meet-prejoin-back">Back to Samwise</a>
        </section>
      </main>
    )
  }

  if (load.kind === "error") {
    return (
      <main className="meet-lobby">
        <header className="meet-header">
          <a href="/" className="meet-brand" aria-label="Samwise">
            Samwise
            <span className="meet-brand-star" aria-hidden="true">✦</span>
          </a>
        </header>
        <section className="meet-center">
          <p className="meet-lead">Hmm — something went wrong.</p>
          <p className="meet-sub">{load.message}</p>
        </section>
      </main>
    )
  }

  return <MeetCallRoom init={load.init} />
}
