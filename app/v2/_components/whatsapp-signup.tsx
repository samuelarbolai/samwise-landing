"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Brand } from "./brand"
import { LangToggle, useLang } from "./lang"
import { TimezoneSelect, detectTimezone } from "./timezone-select"
import { LanguageSelect, useActiveAgentLanguages } from "./language-select"
import type { LanguageCode } from "@/lib/v2/validate"
import { COUNTRIES, countryFromTimezone, toE164, type CountryIso } from "@/lib/v2/phone"

// Samwise's WhatsApp number (Telnyx). After verifying, the person says hi there and setup starts.
const WA_NUMBER = "15079201622"
const RESEND_SECONDS = 30

type Step = "details" | "code" | "done"

export function WhatsappSignup() {
  const { lang, setLang, s } = useLang()
  const [step, setStep] = useState<Step>("details")
  const [name, setName] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [language, setLanguage] = useState<LanguageCode>("es")
  const [country, setCountry] = useState<CountryIso>("CO")
  const [number, setNumber] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeId, setCodeId] = useState<number | null>(null)
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [resendIn, setResendIn] = useState(0)
  const [done, setDone] = useState<{ name: string; existing: boolean } | null>(null)
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const activeLanguages = useActiveAgentLanguages()

  useEffect(() => {
    const tz = detectTimezone()
    setTimezone(tz)
    setCountry(countryFromTimezone(tz))
  }, [])
  useEffect(() => setLanguage(lang === "es" ? "es" : "en"), [lang])
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const dial = COUNTRIES.find((c) => c.iso === country)?.dial ?? "57"
  const phone = toE164(dial, number)

  async function sendCode() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v2/phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, timezone, language }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? s.genericError)
      } else {
        setCodeId(data.id)
        setDigits(Array(6).fill(""))
        setResendIn(RESEND_SECONDS)
        setStep("code")
        setTimeout(() => boxes.current[0]?.focus(), 50)
      }
    } catch {
      setError(s.genericError)
    }
    setBusy(false)
  }

  async function verify(code: string) {
    if (codeId === null) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v2/phone-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: codeId, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? s.genericError)
        setDigits(Array(6).fill(""))
        setTimeout(() => boxes.current[0]?.focus(), 50)
      } else {
        setDone({ name: data.name, existing: data.existing })
        setStep("done")
      }
    } catch {
      setError(s.genericError)
    }
    setBusy(false)
  }

  function fill(from: number, text: string) {
    const incoming = text.replace(/\D/g, "").split("")
    if (!incoming.length) return
    const next = [...digits]
    let i = from
    for (const d of incoming) {
      if (i > 5) break
      next[i++] = d
    }
    setDigits(next)
    boxes.current[Math.min(i, 5)]?.focus()
    if (next.every(Boolean)) verify(next.join(""))
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ""
      setDigits(next)
      boxes.current[i - 1]?.focus()
      e.preventDefault()
    }
  }

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(s.waMessage)}`

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
        {step === "done" && done ? (
          <>
            <h1 className="v2-title">{(done.existing ? s.doneExisting : s.doneTitle).replace("NAME", done.name)}</h1>
            {!done.existing && <p className="v2-sub">{s.doneSub}</p>}
            <a className="v2-btn" href={waLink} style={{ marginTop: 32, display: "block", textAlign: "center" }}>
              {s.waOpen}
            </a>
            <p className="v2-help" style={{ marginTop: 12 }}>{s.waManual}</p>
          </>
        ) : step === "code" ? (
          <>
            <h1 className="v2-title">{s.codeTitle}</h1>
            <p className="v2-sub">
              {s.codeSub} <strong>{phone}</strong>.
            </p>

            {error && <p className="v2-error" role="alert" style={{ marginTop: 24 }}>{error}</p>}

            <div className="v2-otp" style={{ marginTop: 28 }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el
                  }}
                  className="v2-input v2-otp-box"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${i + 1}`}
                  maxLength={i === 0 ? 6 : 1}
                  value={d}
                  disabled={busy}
                  onChange={(e) => fill(i, e.target.value.slice(-6))}
                  onKeyDown={(e) => onKey(i, e)}
                  onPaste={(e) => {
                    e.preventDefault()
                    fill(0, e.clipboardData.getData("text"))
                  }}
                />
              ))}
            </div>
            {busy && <p className="v2-help">{s.codeBusy}</p>}

            <p className="v2-help" style={{ marginTop: 24, fontSize: 13 }}>
              {s.codeHelp}{" "}
              {resendIn > 0 ? (
                <span>
                  {s.codeResendIn} {resendIn}s
                </span>
              ) : (
                <button type="button" className="v2-linkbtn" onClick={sendCode} disabled={busy}>
                  {s.codeResend}
                </button>
              )}{" "}
              {s.codeOr}{" "}
              <button
                type="button"
                className="v2-linkbtn"
                onClick={() => {
                  setStep("details")
                  setError(null)
                }}
              >
                {s.codeChange}
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="v2-title">{s.signupTitle}</h1>
            <p className="v2-sub">{s.signupSub}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendCode()
              }}
              style={{ marginTop: 32 }}
            >
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

              <div className="v2-field">
                <label className="v2-label" htmlFor="phone">
                  {s.waPhone}
                </label>
                <div className="v2-phone">
                  <select
                    className="v2-input v2-phone-country"
                    aria-label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value as CountryIso)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {c.flag} +{c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    className="v2-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={s.waPhonePh}
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>
                <p className="v2-help">{s.waPhoneHelp}</p>
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
                onChange={(tz) => {
                  setTimezone(tz)
                  if (!number) setCountry(countryFromTimezone(tz))
                }}
                label={s.timezone}
                help={s.timezoneHelp}
                searchPlaceholder={s.tzSearch}
                emptyLabel={s.tzNoResults}
              />

              <button className="v2-btn" type="submit" disabled={busy} style={{ marginTop: 26 }}>
                {busy ? s.signupBusy : s.signupCta}
              </button>
              <p className="v2-help" style={{ marginTop: 12 }}>
                {s.consentText} <Link href="/privacy">{s.privacy}</Link> {s.and} <Link href="/terms">{s.terms}</Link>.
              </p>
            </form>

            <p className="v2-altline">
              {s.waHaveAccount} <a href={waLink}>{s.waGoChat}</a>
            </p>
          </>
        )}
      </main>
    </>
  )
}
