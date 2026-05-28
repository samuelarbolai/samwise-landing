"use client"

import { useState, type FormEvent } from "react"
import type { Lang } from "@/lib/qualify/strings"
import type { LocalSlot } from "./lib"

interface ConfirmProps {
  lang: Lang
  slot: LocalSlot
  deviceTz: string
  onBack: () => void
  onSubmit: (args: { name: string; email: string }) => Promise<void>
}

const STRINGS = {
  en: {
    back: "← Back",
    lead: "One last thing.",
    sub: "We'll send the call link to your inbox.",
    name_placeholder: "Your name",
    email_placeholder: "Your email",
    cta: "Confirm",
    submitting: "Booking…",
    email_invalid: "That doesn't look like an email.",
    name_required: "Your name, please.",
    error_generic: "Couldn't book. Try again in a moment.",
    bogotaClarifier: (hhmm: string) => `Samuel is in Bogotá — ${hhmm} there.`,
  },
  es: {
    back: "← Atrás",
    lead: "Una última cosa.",
    sub: "Te enviamos el link de la llamada por correo.",
    name_placeholder: "Tu nombre",
    email_placeholder: "Tu correo",
    cta: "Confirmar",
    submitting: "Reservando…",
    email_invalid: "Eso no se ve como un correo.",
    name_required: "Tu nombre, por favor.",
    error_generic: "No pudimos reservar. Intenta en un momento.",
    bogotaClarifier: (hhmm: string) => `Samuel está en Bogotá — ${hhmm} allá.`,
  },
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function whenLabel(slot: LocalSlot, deviceTz: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    timeZone: deviceTz,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: lang === "en",
  }).format(new Date(slot.startMs))
}

function formatBogotaHHmm(bogotaSlot: string, lang: Lang): string {
  const [h, m] = bogotaSlot.split(":").map(Number)
  if (lang === "es") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

export function Confirm({
  lang,
  slot,
  deviceTz,
  onBack,
  onSubmit,
}: ConfirmProps) {
  const s = STRINGS[lang]
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) {
      setError(s.name_required)
      return
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(s.email_invalid)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: trimmedName, email: trimmedEmail })
    } catch (err) {
      setError(err instanceof Error ? err.message : s.error_generic)
      setSubmitting(false)
    }
  }

  const canSubmit = !submitting && name.trim() && EMAIL_RE.test(email.trim())
  const showBogotaClarifier = deviceTz !== "America/Bogota"

  return (
    <div className="book-confirm">
      <button type="button" className="book-back" onClick={onBack}>
        {s.back}
      </button>
      <p className="book-lead">{s.lead}</p>
      <p className="book-sub">{whenLabel(slot, deviceTz, lang)}</p>
      {showBogotaClarifier && (
        <p className="book-tz-bogota-clarifier">
          {s.bogotaClarifier(formatBogotaHHmm(slot.bogotaSlot, lang))}
        </p>
      )}

      <form className="book-confirm-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="book-input book-input-name"
          placeholder={s.name_placeholder}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          disabled={submitting}
          autoFocus
          autoComplete="name"
        />
        <input
          type="email"
          className="book-input book-input-email"
          placeholder={s.email_placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          disabled={submitting}
          autoComplete="email"
        />
        <button type="submit" className="book-cta-confirm" disabled={!canSubmit}>
          <span className="book-cta-dashes" aria-hidden="true">―</span>
          <span className="book-cta-text">
            {submitting ? s.submitting : s.cta}
          </span>
          <span className="book-cta-dashes" aria-hidden="true">―</span>
        </button>
        {error ? <p className="book-error">{error}</p> : null}
      </form>
    </div>
  )
}
