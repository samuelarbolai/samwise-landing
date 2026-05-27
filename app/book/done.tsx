"use client"

import type { Lang } from "@/lib/qualify/strings"
import type { BookingResult } from "./book-root"

interface DoneProps {
  lang: Lang
  result: BookingResult
}

const STRINGS = {
  en: {
    lead: "You're set.",
    sub: "We sent the link to your inbox.",
    when_label: "When",
    back_home: "Back to Samwise",
  },
  es: {
    lead: "Estás dentro.",
    sub: "Te enviamos el link por correo.",
    when_label: "Cuándo",
    back_home: "Volver a Samwise",
  },
} as const

function whenLabel(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    timeZone: "America/Bogota",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: lang === "en",
  }).format(new Date(iso))
}

export function Done({ lang, result }: DoneProps) {
  const s = STRINGS[lang]
  return (
    <div className="book-done">
      <p className="book-lead">{s.lead}</p>
      <p className="book-sub">{s.sub}</p>

      <dl className="book-done-meta">
        <dt>{s.when_label}</dt>
        <dd>{whenLabel(result.scheduledFor, lang)}</dd>
      </dl>

      <a href="/" className="book-back">
        {s.back_home}
      </a>
    </div>
  )
}
