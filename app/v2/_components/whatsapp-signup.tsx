"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Brand } from "./brand"
import { LangToggle, useLang } from "./lang"
import { TimezoneSelect, detectTimezone } from "./timezone-select"
import { LanguageSelect, useActiveAgentLanguages } from "./language-select"
import type { LanguageCode } from "@/lib/v2/validate"

// Samwise's WhatsApp number (Telnyx). The code message is what verifies the phone.
const WA_NUMBER = "15079201622"

export function WhatsappSignup() {
  const { lang, setLang, s } = useLang()
  const [name, setName] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [language, setLanguage] = useState<LanguageCode>("es")
  const [callTime, setCallTime] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const activeLanguages = useActiveAgentLanguages()

  useEffect(() => setTimezone(detectTimezone()), [])
  useEffect(() => setLanguage(lang === "es" ? "es" : "en"), [lang])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v2/signup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone, language, call_time: callTime }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? s.genericError)
      } else {
        setCode(data.code)
      }
    } catch {
      setError(s.genericError)
    }
    setBusy(false)
  }

  const waText = code ? `${s.waMessage} ${code}` : ""
  const waLink = code ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}` : ""

  return (
    <>
      <header className="v2-header">
        <Brand />
        <div className="v2-header-right">
          <LangToggle lang={lang} setLang={setLang} />
          <Link className="v2-headerlink" href="/">
            {s.backHome}
          </Link>
        </div>
      </header>

      <main className="v2-main v2-main--narrow">
        {code ? (
          <>
            <h1 className="v2-title">{s.waStepTitle}</h1>
            <p className="v2-sub">{s.waStepSub}</p>
            <a className="v2-btn" href={waLink} style={{ marginTop: 32, display: "block", textAlign: "center" }}>
              {s.waOpen}
            </a>
            <div className="v2-field" style={{ marginTop: 28 }}>
              <p className="v2-label">{s.waCodeLabel}</p>
              <p style={{ fontSize: 32, letterSpacing: "0.2em", fontVariantNumeric: "tabular-nums" }}>{code}</p>
              <p className="v2-help">
                {s.waManual} <strong>{waText}</strong>
              </p>
              <p className="v2-help">{s.waExpires}</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="v2-title">{s.signupTitle}</h1>
            <p className="v2-sub">{s.signupSub}</p>

            <form onSubmit={submit} style={{ marginTop: 32 }}>
              {error && <p className="v2-error" role="alert">{error}</p>}

              <div className="v2-field">
                <label className="v2-label" htmlFor="name">
                  {s.name}
                </label>
                <input
                  id="name"
                  className="v2-input"
                  autoComplete="given-name"
                  placeholder={s.namePh}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <LanguageSelect
                value={language}
                onChange={setLanguage}
                s={s}
                help={s.callLanguageHelpUser}
                idPrefix="signup"
                activeLanguages={activeLanguages}
              />

              <TimezoneSelect
                value={timezone}
                onChange={setTimezone}
                label={s.timezone}
                help={s.timezoneHelp}
                searchPlaceholder={s.tzSearch}
                emptyLabel={s.tzNoResults}
              />

              <div className="v2-field">
                <label className="v2-label" htmlFor="call_time">
                  {s.firstCallOptional}
                </label>
                <input
                  id="call_time"
                  className="v2-input"
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                />
                <p className="v2-help">{s.firstCallHelpWa}</p>
              </div>

              <button className="v2-btn" type="submit" disabled={busy} style={{ marginTop: 26 }}>
                {busy ? s.signupBusy : s.signupCta}
              </button>
            </form>

            <p className="v2-altline">
              {s.haveAccount} <Link href="/v2/login">{s.goLogin}</Link>
            </p>
          </>
        )}
      </main>
    </>
  )
}
