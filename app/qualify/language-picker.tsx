"use client"
import { useState } from "react"
import { STRINGS, type Lang } from "@/lib/qualify/strings"

export type QualifyMode = "voice" | "text"

export function LanguagePicker({
  onProceed,
}: {
  onProceed: (lang: Lang, mode: QualifyMode, name: string) => void
}) {
  const [lang, setLang] = useState<Lang | null>(null)
  const [name, setName] = useState("")

  // Show both-language heading until the user picks a language.
  const heading = lang ?
    STRINGS[lang].picker_heading :
    `${STRINGS.en.picker_heading}  /  ${STRINGS.es.picker_heading}`

  const namePlaceholder = lang ?
    STRINGS[lang].picker_name_placeholder :
    `${STRINGS.en.picker_name_placeholder}  /  ${STRINGS.es.picker_name_placeholder}`

  const proceedLabel = lang ?
    STRINGS[lang].picker_proceed_voice :
    "↑"

  const textFallbackLabel = lang ?
    STRINGS[lang].picker_text_fallback :
    null

  const trimmedName = name.trim()
  const ready = !!lang && trimmedName.length > 0

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

      <button
        type="button"
        className="qualify-picker-proceed"
        disabled={!ready}
        onClick={() => lang && onProceed(lang, "voice", trimmedName)}
      >
        <span className="qualify-cta-text">{proceedLabel}</span>
      </button>

      {textFallbackLabel && (
        <button
          type="button"
          className="qualify-picker-text-fallback"
          disabled={!ready}
          onClick={() => lang && onProceed(lang, "text", trimmedName)}
        >
          {textFallbackLabel}
        </button>
      )}
    </div>
  )
}
