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

      {lang && (
        <div className="qualify-picker-rest" key={lang}>
          <input
            type="text"
            className="qualify-picker-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={STRINGS[lang].picker_name_placeholder}
            aria-label={STRINGS[lang].picker_name_label}
            autoComplete="given-name"
            maxLength={80}
          />

          <input
            type="email"
            className="qualify-picker-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={STRINGS[lang].picker_email_placeholder}
            aria-label={STRINGS[lang].picker_email_label}
            autoComplete="email"
            maxLength={120}
            inputMode="email"
          />

          <button
            type="button"
            className="qualify-picker-proceed"
            disabled={!ready}
            onClick={() => onProceed(lang, "voice", trimmedName, trimmedEmail)}
          >
            <span className="qualify-cta-text">{STRINGS[lang].picker_proceed_voice}</span>
          </button>

          <button
            type="button"
            className="qualify-picker-text-fallback"
            disabled={!ready}
            onClick={() => onProceed(lang, "text", trimmedName, trimmedEmail)}
          >
            {STRINGS[lang].picker_text_fallback}
          </button>
        </div>
      )}
    </div>
  )
}
