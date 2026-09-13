"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brand } from "./brand"
import { LangToggle, useLang } from "./lang"

export function LoginForm() {
  const router = useRouter()
  const { lang, setLang, s } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/v2/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        <h1 className="v2-title">{s.loginTitle}</h1>
        <p className="v2-sub">{s.loginSub}</p>

        <form onSubmit={submit} style={{ marginTop: 32 }}>
          {error && <p className="v2-error" role="alert">{error}</p>}

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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="v2-btn" type="submit" disabled={busy} style={{ marginTop: 26 }}>
            {busy ? s.loginBusy : s.loginCta}
          </button>
        </form>

        <p className="v2-altline">
          {s.noAccount} <Link href="/v2/signup">{s.goSignup}</Link>
        </p>
      </main>
    </>
  )
}
