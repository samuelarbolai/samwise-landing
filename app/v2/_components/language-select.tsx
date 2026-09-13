"use client"

import { useEffect, useState } from "react"
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/v2/validate"
import type { V2Strings } from "../strings"

export function languageName(code: string, s: V2Strings): string {
  if (code === "en") return s.langEn
  if (code === "he") return s.langHe
  if (code === "es") return s.langEs
  return code
}

/**
 * Languages with a live voice agent, from the read-only `language_agents`
 * table. `null` while loading — callers must not render the "coming soon"
 * notice until it resolves, or every language flashes as unsupported.
 */
export function useActiveAgentLanguages(): string[] | null {
  const [langs, setLangs] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/v2/language-agents/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return
        setLangs(Array.isArray(d.languages) ? d.languages : [])
      })
      .catch(() => {
        // Treat an unreachable lookup as "all fine" rather than warning about
        // every language — a false alarm is worse than a missing hint.
        if (!cancelled) setLangs([...SUPPORTED_LANGUAGES])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return langs
}

export function AgentComingSoon({ code, s }: { code: string; s: V2Strings }) {
  return (
    <p className="v2-soon" role="status">
      <strong className="v2-soon__title">{s.agentSoonTitle}</strong>
      {s.agentSoonBody.replace("{language}", languageName(code, s))}
    </p>
  )
}

export function LanguageSelect({
  value,
  onChange,
  s,
  help,
  idPrefix,
  activeLanguages,
}: {
  value: string
  onChange: (code: LanguageCode) => void
  s: V2Strings
  help?: string
  idPrefix: string
  activeLanguages: string[] | null
}) {
  const showNotice = activeLanguages !== null && !activeLanguages.includes(value)

  return (
    <div className="v2-field">
      <span className="v2-label">{s.callLanguage}</span>
      <div className="v2-langrow" role="radiogroup" aria-label={s.callLanguage}>
        {SUPPORTED_LANGUAGES.map((code) => (
          <label className="v2-langopt" key={code} data-on={value === code}>
            <input
              type="radio"
              name={`${idPrefix}-language`}
              value={code}
              checked={value === code}
              onChange={() => onChange(code)}
            />
            <span>{languageName(code, s)}</span>
          </label>
        ))}
      </div>
      {help && <p className="v2-help">{help}</p>}
      {showNotice && <AgentComingSoon code={value} s={s} />}
    </div>
  )
}
