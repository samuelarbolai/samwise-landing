"use client"

import { useMemo, useState } from "react"
import type { Lang } from "@/lib/qualify/strings"
import type { DaySlots } from "./book-root"

interface MonthGridProps {
  lang: Lang
  days: DaySlots[]
  onSelectDay: (day: string) => void
}

const STRINGS = {
  en: {
    lead: "Pick a day.",
    sub: "Times shown in Bogotá time.",
    weekday_mon: "Mon",
    weekday_tue: "Tue",
    weekday_wed: "Wed",
    weekday_thu: "Thu",
    weekday_fri: "Fri",
    weekday_sat: "Sat",
    weekday_sun: "Sun",
    prev: "Previous",
    next: "Next",
    no_slots:
      "No times available in the next two weeks. Try again in a few days.",
  },
  es: {
    lead: "Elige un día.",
    sub: "Horas en hora de Bogotá.",
    weekday_mon: "Lun",
    weekday_tue: "Mar",
    weekday_wed: "Mié",
    weekday_thu: "Jue",
    weekday_fri: "Vie",
    weekday_sat: "Sáb",
    weekday_sun: "Dom",
    prev: "Anterior",
    next: "Siguiente",
    no_slots:
      "No hay horarios en las próximas dos semanas. Vuelve en unos días.",
  },
} as const

// First day of the visible month grid. If the user passes a month
// containing no available days, we still render it; navigation arrows
// let them step forward.
function firstOfMonth(year: number, month: number): Date {
  // month is 1-12. Use Date.UTC for stability.
  return new Date(Date.UTC(year, month - 1, 1))
}

function monthLabel(year: number, month: number, lang: Lang): string {
  const d = new Date(Date.UTC(year, month - 1, 1))
  const fmt = new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  })
  return fmt.format(d)
}

// Build the 42-cell grid for the given month. Cells before the first
// of the month and after the last are filled with the bracketing days
// so the grid is always 6 rows × 7 cols.
function buildGridCells(year: number, month: number): string[] {
  // Day-of-week of the 1st. Mon-first (Mon=0..Sun=6).
  const first = firstOfMonth(year, month)
  const jsDow = first.getUTCDay() // 0=Sun..6=Sat
  const monFirstDow = (jsDow + 6) % 7 // Mon=0..Sun=6

  // Start the grid on the Monday of the week containing the 1st.
  const gridStart = new Date(first)
  gridStart.setUTCDate(first.getUTCDate() - monFirstDow)

  const cells: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setUTCDate(gridStart.getUTCDate() + i)
    cells.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`,
    )
  }
  return cells
}

export function MonthGrid({ lang, days, onSelectDay }: MonthGridProps) {
  const s = STRINGS[lang]
  const availableSet = useMemo(
    () => new Set(days.map((d) => d.day)),
    [days],
  )

  // Earliest available day determines the starting month view.
  const firstAvailable = days[0]?.day
  const initialMonth = useMemo(() => {
    const base = firstAvailable ?? new Date().toISOString().slice(0, 10)
    const [y, m] = base.split("-").map(Number)
    return { year: y, month: m }
  }, [firstAvailable])

  const [{ year, month }, setMonth] = useState(initialMonth)

  const cells = useMemo(() => buildGridCells(year, month), [year, month])
  const monthStr = String(month).padStart(2, "0")

  const goPrev = () => {
    if (month === 1) setMonth({ year: year - 1, month: 12 })
    else setMonth({ year, month: month - 1 })
  }
  const goNext = () => {
    if (month === 12) setMonth({ year: year + 1, month: 1 })
    else setMonth({ year, month: month + 1 })
  }

  if (days.length === 0) {
    return (
      <div className="book-empty-block">
        <p className="book-lead">{s.no_slots}</p>
      </div>
    )
  }

  return (
    <div className="book-month">
      <div className="book-month-head">
        <p className="book-lead">{s.lead}</p>
        <p className="book-sub">{s.sub}</p>
      </div>

      <div className="book-month-nav">
        <button
          type="button"
          className="book-month-arrow"
          onClick={goPrev}
          aria-label={s.prev}
        >
          ←
        </button>
        <span className="book-month-label">{monthLabel(year, month, lang)}</span>
        <button
          type="button"
          className="book-month-arrow"
          onClick={goNext}
          aria-label={s.next}
        >
          →
        </button>
      </div>

      <div className="book-month-weekdays">
        {[s.weekday_mon, s.weekday_tue, s.weekday_wed, s.weekday_thu, s.weekday_fri, s.weekday_sat, s.weekday_sun].map(
          (w) => (
            <span key={w} className="book-weekday">
              {w}
            </span>
          ),
        )}
      </div>

      <div className="book-month-grid">
        {cells.map((dayISO) => {
          const inMonth = dayISO.startsWith(`${year}-${monthStr}`)
          const available = availableSet.has(dayISO)
          const dayNum = Number(dayISO.split("-")[2])
          return (
            <button
              key={dayISO}
              type="button"
              disabled={!available}
              className={`book-day ${inMonth ? "" : "book-day-outside"} ${available ? "is-available" : ""}`}
              onClick={() => available && onSelectDay(dayISO)}
              aria-label={dayISO}
            >
              {dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}
