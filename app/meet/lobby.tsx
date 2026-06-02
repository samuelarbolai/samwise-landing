"use client"

import { useState, type FormEvent } from "react"
import type { Lang } from "@/lib/qualify/strings"

// What /api/walk-in/init returns on mode === "create". Includes everything
// the call-room needs to construct the LiveKit Room without a second fetch.
export interface MeetInitResponse {
  token: string
  wsUrl: string
  roomName: string
  walkInId: string
  booking: {
    roomName: string
    therapistName: string
    prospectFirstName: string
    language: Lang
    scheduledFor: string
    /** True when this room runs with the autonomous AI guide instead of a
     * human therapist — the call-room uses it for guide-neutral copy + the
     * audio-only voice panel. */
    autonomous?: boolean
  }
}

function getInitUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  if (!base) return "http://localhost:3000/api/walk-in/init"
  return `${base.replace(/\/$/, "")}/api/walk-in/init`
}

const STRINGS = {
  en: {
    lead: "Your meeting with Samuel.",
    sub: "Tell us who you are to join.",
    name_placeholder: "Your name",
    email_placeholder: "Your email",
    lang_label: "Language",
    lang_en: "English",
    lang_es: "Español",
    cta: "Join",
    submitting: "Joining…",
    email_invalid: "That doesn't look like an email.",
    error_generic: "Couldn't join. Try again in a moment.",
    autonomous_label: "Run with the AI guide",
    call_language_label: "Your call will be in",
  },
  es: {
    lead: "Tu reunión con Samuel.",
    sub: "Dinos quién eres para entrar.",
    name_placeholder: "Tu nombre",
    email_placeholder: "Tu correo",
    lang_label: "Idioma",
    lang_en: "English",
    lang_es: "Español",
    cta: "Entrar",
    submitting: "Entrando…",
    email_invalid: "Eso no se ve como un correo.",
    error_generic: "No pudimos entrar. Intenta en un momento.",
    autonomous_label: "Hablar con el guía de IA",
    call_language_label: "Tu llamada será en",
  },
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface MeetLobbyProps {
  onJoined: (init: MeetInitResponse) => void
}

// Lobby form. Visual register mirrors /qualify's language picker:
// Fraunces italic lead, Manrope small-caps sub, hairline-underline inputs,
// gold-dash CTA. UI language toggles on the page based on the language
// the user picks.
export function MeetLobby({ onJoined }: MeetLobbyProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [lang, setLang] = useState<Lang>("en")
  const [autonomous, setAutonomous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const s = STRINGS[lang]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Both fields are optional now (per user 2026-05-27 — "make the room
    // free to enter for now"). Defaults: name = "Guest", email = "" so
    // testing is one-click. If email IS provided, still validate format
    // so a typo doesn't silently produce a bogus prospectKey.
    const trimmedName = name.trim() || "Guest"
    const trimmedEmail = email.trim()
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setError(s.email_invalid)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(getInitUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "create",
          name: trimmedName,
          email: trimmedEmail,
          language: lang,
          autonomous,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(body.error ?? `init failed (${res.status})`)
      }
      const init = (await res.json()) as MeetInitResponse
      onJoined(init)
    } catch (err) {
      setError(err instanceof Error ? err.message : s.error_generic)
      setSubmitting(false)
    }
  }

  // Always enabled — empty fields are valid. The only gate is the
  // submitting state (so you can't double-fire while a request is in
  // flight).
  const canSubmit = !submitting

  return (
    <main className="meet-lobby" lang={lang}>
      <header className="meet-header">
        <a href="/" className="meet-brand" aria-label="Samwise">
          Samwise
          <span className="meet-brand-star" aria-hidden="true">
            ✦
          </span>
        </a>
        <div className="meet-lang-toggle" role="radiogroup" aria-label={s.lang_label}>
          <button
            type="button"
            role="radio"
            aria-checked={lang === "en"}
            className={`meet-lang-btn${lang === "en" ? " is-active" : ""}`}
            onClick={() => setLang("en")}
          >
            {s.lang_en}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={lang === "es"}
            className={`meet-lang-btn${lang === "es" ? " is-active" : ""}`}
            onClick={() => setLang("es")}
          >
            {s.lang_es}
          </button>
        </div>
      </header>

      <section className="meet-center">
        <p className="meet-lead">{s.lead}</p>
        <p className="meet-sub">{s.sub}</p>

        <form className="meet-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="meet-input meet-input-name"
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
            className="meet-input meet-input-email"
            placeholder={s.email_placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            disabled={submitting}
            autoComplete="email"
          />

          <label
            className="meet-autonomous-toggle"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              opacity: 0.7,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autonomous}
              onChange={(e) => setAutonomous(e.target.checked)}
              disabled={submitting}
            />
            <span>{s.autonomous_label}</span>
          </label>

          {autonomous && (
            <div
              className="meet-call-lang"
              role="radiogroup"
              aria-label={s.call_language_label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ opacity: 0.7 }}>{s.call_language_label}</span>
              <button
                type="button"
                role="radio"
                aria-checked={lang === "en"}
                className={`meet-lang-btn${lang === "en" ? " is-active" : ""}`}
                onClick={() => setLang("en")}
                disabled={submitting}
              >
                {s.lang_en}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={lang === "es"}
                className={`meet-lang-btn${lang === "es" ? " is-active" : ""}`}
                onClick={() => setLang("es")}
                disabled={submitting}
              >
                {s.lang_es}
              </button>
            </div>
          )}

          <button
            type="submit"
            className="meet-cta"
            disabled={!canSubmit}
          >
            <span className="meet-cta-dashes" aria-hidden="true">
              ―
            </span>
            <span className="meet-cta-text">
              {submitting ? s.submitting : s.cta}
            </span>
            <span className="meet-cta-dashes" aria-hidden="true">
              ―
            </span>
          </button>

          {error ? <p className="meet-error">{error}</p> : null}
        </form>
      </section>
    </main>
  )
}
