"use client"

import type { Lang } from "@/lib/qualify/strings"

interface TimeSlotsProps {
  lang: Lang
  day: string // YYYY-MM-DD
  slots: string[] // HH:mm
  timeZone: string
  onBack: () => void
  onSelectSlot: (slot: string) => void
}

const STRINGS = {
  en: {
    back: "← Back",
    none: "No times left on this day.",
  },
  es: {
    back: "← Atrás",
    none: "No hay horarios en este día.",
  },
} as const

function dayLabel(dayISO: string, lang: Lang): string {
  // Render as "Wednesday, May 28" — using UTC for the date math since
  // the dayISO is already in Bogotá-local calendar (no tz conversion
  // needed; just format the literal date).
  const [y, m, d] = dayISO.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date)
}

function timeLabel(slot: string, lang: Lang): string {
  // Slot is HH:mm in 24-hour. For en: "10:00 AM" / "2:30 PM"; for es: "10:00" / "14:30".
  const [h, m] = slot.split(":").map(Number)
  if (lang === "es") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

export function TimeSlots({
  lang,
  day,
  slots,
  onBack,
  onSelectSlot,
}: TimeSlotsProps) {
  const s = STRINGS[lang]
  return (
    <div className="book-slots">
      <button type="button" className="book-back" onClick={onBack}>
        {s.back}
      </button>
      <p className="book-lead">{dayLabel(day, lang)}</p>

      {slots.length === 0 ? (
        <p className="book-sub">{s.none}</p>
      ) : (
        <ul className="book-slot-list">
          {slots.map((slot) => (
            <li key={slot}>
              <button
                type="button"
                className="book-slot"
                onClick={() => onSelectSlot(slot)}
              >
                <span className="book-slot-dashes" aria-hidden="true">―</span>
                <span className="book-slot-time">{timeLabel(slot, lang)}</span>
                <span className="book-slot-dashes" aria-hidden="true">―</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
