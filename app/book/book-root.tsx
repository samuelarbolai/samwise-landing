"use client"

import { useEffect, useState } from "react"
import type { Lang } from "@/lib/qualify/strings"
import { MonthGrid } from "./month-grid"
import { TimeSlots } from "./time-slots"
import { Confirm } from "./confirm"
import { Done } from "./done"
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
  | { kind: "month"; days: DaySlots[]; timeZone: string }
  | { kind: "slots"; days: DaySlots[]; timeZone: string; day: string }
  | {
      kind: "confirm"
      days: DaySlots[]
      timeZone: string
      day: string
      slot: string
    }
  | { kind: "done"; result: BookingResult }

function getSlotsUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/book/slots"
  return `${base.replace(/\/$/, "")}/api/book/slots`
}

function getCreateUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/book/create"
  return `${base.replace(/\/$/, "")}/api/book/create`
}

export function BookRoot({ lang }: { lang: Lang }) {
  const [view, setView] = useState<View>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(getSlotsUrl(), { method: "GET" })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(body.error ?? `slots failed (${res.status})`)
        }
        const data = (await res.json()) as SlotsResponse
        if (cancelled) return
        setView({
          kind: "month",
          days: data.days,
          timeZone: data.timeZone,
        })
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
  }, [])

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
            onSelectDay={(day) =>
              setView({
                kind: "slots",
                days: view.days,
                timeZone: view.timeZone,
                day,
              })
            }
          />
        )}

        {view.kind === "slots" && (
          <TimeSlots
            lang={lang}
            day={view.day}
            slots={
              view.days.find((d) => d.day === view.day)?.slots ?? []
            }
            timeZone={view.timeZone}
            onBack={() =>
              setView({
                kind: "month",
                days: view.days,
                timeZone: view.timeZone,
              })
            }
            onSelectSlot={(slot) =>
              setView({
                kind: "confirm",
                days: view.days,
                timeZone: view.timeZone,
                day: view.day,
                slot,
              })
            }
          />
        )}

        {view.kind === "confirm" && (
          <Confirm
            lang={lang}
            day={view.day}
            slot={view.slot}
            timeZone={view.timeZone}
            onBack={() =>
              setView({
                kind: "slots",
                days: view.days,
                timeZone: view.timeZone,
                day: view.day,
              })
            }
            onSubmit={async ({ name, email }) => {
              const res = await fetch(getCreateUrl(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  day: view.day,
                  slot: view.slot,
                  name,
                  email,
                  language: lang,
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
