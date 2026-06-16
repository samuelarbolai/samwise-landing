"use client"

import { useEffect, useState } from "react"
import type { Lang } from "@/lib/qualify/strings"
import { MonthGrid } from "./month-grid"
import { TimeSlots } from "./time-slots"
import { Confirm } from "./confirm"
import { Done } from "./done"
import {
  groupByLocalDay,
  type LocalDay,
  type LocalSlot,
} from "./lib"
import "./book.css"

export interface DaySlots {
  day: string
  slots: string[]
}

export interface SlotsResponse {
  days: DaySlots[]
  timeZone: string
}

export interface BookingResult {
  calEventId: string
  scheduledFor: string
  joinUrl: string
}

type View =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "month"; days: LocalDay[] }
  | { kind: "slots"; days: LocalDay[]; localDay: string }
  | {
      kind: "confirm"
      days: LocalDay[]
      slot: LocalSlot
    }
  | { kind: "done"; result: BookingResult }

export type MeetingType = "breakthrough" | "therapist"

function getSlotsUrl(type: MeetingType): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  const root = base ? base.replace(/\/$/, "") : "http://localhost:3000"
  return `${root}/api/book/slots?type=${type}`
}

function getCreateUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/book/create"
  return `${base.replace(/\/$/, "")}/api/book/create`
}

function detectDeviceTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "America/Bogota"
  }
}

export function BookRoot({
  lang,
  meetingType = "breakthrough",
}: {
  lang: Lang
  meetingType?: MeetingType
}) {
  const [deviceTz] = useState<string>(detectDeviceTz)
  const [view, setView] = useState<View>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(getSlotsUrl(meetingType), { method: "GET" })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(body.error ?? `slots failed (${res.status})`)
        }
        const data = (await res.json()) as SlotsResponse
        if (cancelled) return
        const localDays = groupByLocalDay(data.days, deviceTz)
        setView({ kind: "month", days: localDays })
      } catch (err) {
        if (cancelled) return
        setView({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Could not load availability",
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [deviceTz, meetingType])

  const headerBackHref = "/"

  return (
    <main className="book-root" lang={lang}>
      <header className="book-header">
        <a
          href={headerBackHref}
          className="book-brand"
          aria-label="Samwise"
        >
          Samwise
          <span className="book-brand-star" aria-hidden="true">
            ✦
          </span>
        </a>
      </header>

      <section className="book-stage">
        {view.kind === "loading" && (
          <p className="book-status">
            {lang === "es" ? "Cargando…" : "Loading…"}
          </p>
        )}

        {view.kind === "error" && (
          <div className="book-error-block">
            <p className="book-lead">
              {lang === "es" ? "Algo salió mal." : "Something went wrong."}
            </p>
            <p className="book-sub">{view.message}</p>
          </div>
        )}

        {view.kind === "month" && (
          <MonthGrid
            lang={lang}
            days={view.days}
            deviceTz={deviceTz}
            onSelectDay={(localDay) =>
              setView({ kind: "slots", days: view.days, localDay })
            }
          />
        )}

        {view.kind === "slots" && (
          <TimeSlots
            lang={lang}
            localDay={view.localDay}
            slots={
              view.days.find((d) => d.localDay === view.localDay)?.slots ??
              []
            }
            onBack={() => setView({ kind: "month", days: view.days })}
            onSelectSlot={(slot) =>
              setView({ kind: "confirm", days: view.days, slot })
            }
          />
        )}

        {view.kind === "confirm" && (
          <Confirm
            lang={lang}
            slot={view.slot}
            deviceTz={deviceTz}
            onBack={() =>
              setView({
                kind: "slots",
                days: view.days,
                localDay: view.slot.localDay,
              })
            }
            onSubmit={async ({ name, email }) => {
              const res = await fetch(getCreateUrl(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  day: view.slot.bogotaDay,
                  slot: view.slot.bogotaSlot,
                  name,
                  email,
                  language: lang,
                  type: meetingType,
                }),
              })
              if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as {
                  error?: string
                }
                throw new Error(
                  body.error ?? `booking failed (${res.status})`,
                )
              }
              const result = (await res.json()) as BookingResult
              setView({ kind: "done", result })
            }}
          />
        )}

        {view.kind === "done" && (
          <Done lang={lang} result={view.result} />
        )}
      </section>
    </main>
  )
}
