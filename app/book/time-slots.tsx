"use client"

import type { Lang } from "@/lib/qualify/strings"
import type { LocalSlot } from "./lib"

interface TimeSlotsProps {
  lang: Lang
  localDay: string // YYYY-MM-DD in device tz
  slots: LocalSlot[]
  onBack: () => void
  onSelectSlot: (slot: LocalSlot) => void
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
  const [y, m, d] = dayISO.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date)
}

function timeLabel(localHHmm: string, lang: Lang): string {
  const [h, m] = localHHmm.split(":").map(Number)
  if (lang === "es") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

export function TimeSlots({
  lang,
  localDay,
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
      <p className="book-lead">{dayLabel(localDay, lang)}</p>

      {slots.length === 0 ? (
        <p className="book-sub">{s.none}</p>
      ) : (
        <ul className="book-slot-list">
          {slots.map((slot) => (
            <li key={slot.startMs}>
              <button
                type="button"
                className="book-slot"
                onClick={() => onSelectSlot(slot)}
              >
                <span className="book-slot-dashes" aria-hidden="true">―</span>
                <span className="book-slot-time">
                  {timeLabel(slot.localHHmm, lang)}
                </span>
                <span className="book-slot-dashes" aria-hidden="true">―</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
