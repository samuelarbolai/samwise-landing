"use client"
import { useState } from "react"
import { STRINGS, type Lang } from "@/lib/qualify/strings"

export type QualifyMode = "voice" | "text"

// Minimal RFC-flavoured email regex. Catches obvious typos without
// being strict about full RFC compliance (browsers do extra validation
// via the type="email" input).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LanguagePicker({
  onProceed,
}: {
  onProceed: (lang: Lang, mode: QualifyMode, name: string, email: string) => void
}) {
  const [lang, setLang] = useState<Lang | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Show both-language heading until the user picks a language.
  const heading = lang ?
    STRINGS[lang].picker_heading :
    `${STRINGS.en.picker_heading}  /  ${STRINGS.es.picker_heading}`

  const namePlaceholder = lang ?
    STRINGS[lang].picker_name_placeholder :
    `${STRINGS.en.picker_name_placeholder}  /  ${STRINGS.es.picker_name_placeholder}`

  const emailPlaceholder = lang ?
    STRINGS[lang].picker_email_placeholder :
    `${STRINGS.en.picker_email_placeholder}  /  ${STRINGS.es.picker_email_placeholder}`

  const proceedLabel = lang ?
    STRINGS[lang].picker_proceed_voice :
    "↑"

  const textFallbackLabel = lang ?
    STRINGS[lang].picker_text_fallback :
    null

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const emailValid = EMAIL_RE.test(trimmedEmail)
  const ready = !!lang && trimmedName.length > 0 && emailValid

  return (
    <div className="qualify-picker">
      <h1 className="qualify-picker-heading">{heading}</h1>

      <div className="qualify-picker-langs" role="radiogroup" aria-label="Language">
        <button
          type="button"
          role="radio"
          aria-checked={lang === "en"}
          onClick={() => setLang("en")}
          className={`qualify-picker-lang ${lang === "en" ? "is-selected" : ""}`}
        >
          English
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={lang === "es"}
          onClick={() => setLang("es")}
          className={`qualify-picker-lang ${lang === "es" ? "is-selected" : ""}`}
        >
          Español
        </button>
      </div>

      <input
        type="text"
        className="qualify-picker-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        aria-label={lang ? STRINGS[lang].picker_name_label : "Your name / Tu nombre"}
        autoComplete="given-name"
        maxLength={80}
      />

      <input
        type="email"
        className="qualify-picker-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailPlaceholder}
        aria-label={lang ? STRINGS[lang].picker_email_label : "Your email / Tu correo"}
        autoComplete="email"
        maxLength={120}
        inputMode="email"
      />

      <button
        type="button"
        className="qualify-picker-proceed"
        disabled={!ready}
        onClick={() => lang && onProceed(lang, "voice", trimmedName, trimmedEmail)}
      >
        <span className="qualify-cta-text">{proceedLabel}</span>
      </button>

      {textFallbackLabel && (
        <button
          type="button"
          className="qualify-picker-text-fallback"
          disabled={!ready}
          onClick={() => lang && onProceed(lang, "text", trimmedName, trimmedEmail)}
        >
          {textFallbackLabel}
        </button>
      )}
    </div>
  )
}
