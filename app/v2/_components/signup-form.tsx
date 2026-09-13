"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brand } from "./brand"
import { LangToggle, useLang } from "./lang"
import { TimezoneSelect, detectTimezone } from "./timezone-select"
import { LanguageSelect, useActiveAgentLanguages } from "./language-select"
import type { LanguageCode } from "@/lib/v2/validate"

export function SignupForm() {
  const router = useRouter()
  const { lang, setLang, s } = useLang()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [language, setLanguage] = useState<LanguageCode>("es")
  const [callTime, setCallTime] = useState("07:00")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeLanguages = useActiveAgentLanguages()

  // Browser auto-detect is the default; the user can change it here or later.
  useEffect(() => setTimezone(detectTimezone()), [])

  // Seed the call language from the page language — most people want the
  // agent to speak whatever they are reading. Still fully editable.
  useEffect(() => setLanguage(lang === "es" ? "es" : "en"), [lang])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v2/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          timezone,
          language,
          call_time: callTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? s.genericError)
        setBusy(false)
        return
      }
      router.push("/v2/settings")
      router.refresh()
    } catch {
      setError(s.genericError)
      setBusy(false)
    }
  }

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
              autoComplete="name"
              placeholder={s.namePh}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="v2-field">
            <label className="v2-label" htmlFor="phone">
              {s.phone}
            </label>
            <input
              id="phone"
              className="v2-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+573001234567"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
            />
            <p className="v2-help">{s.phoneHelp}</p>
          </div>

          <div className="v2-field">
            <label className="v2-label" htmlFor="email">
              {s.email}
            </label>
            <input
              id="email"
              className="v2-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="v2-field">
            <label className="v2-label" htmlFor="password">
              {s.password}
            </label>
            <input
              id="password"
              className="v2-input"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="v2-help">{s.passwordHelp}</p>
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
              {s.firstCall}
            </label>
            <input
              id="call_time"
              className="v2-input"
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
            />
            <p className="v2-help">{s.firstCallHelp}</p>
          </div>

          <button className="v2-btn" type="submit" disabled={busy} style={{ marginTop: 26 }}>
            {busy ? s.signupBusy : s.signupCta}
          </button>
        </form>

        <p className="v2-altline">
          {s.haveAccount} <Link href="/v2/login">{s.goLogin}</Link>
        </p>
      </main>
    </>
  )
}
