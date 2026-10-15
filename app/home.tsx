"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HOME_COPY, type HomeCopy, type Lang } from "./home-copy"
import "./home.css"

const SIGNUP = "/v2/signup"
const WA_NUMBER = "15079201622"
const LANG_KEY = "samwise:v2-lang"

/** The house sparkle — same path as the navbar star and the OG card. */
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg className="sw-btn__arrow" width="13" height="9" viewBox="0 0 13 9" aria-hidden="true">
      <path d="M0 4.5h11M8 1l3.5 3.5L8 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  )
}

/** Minimal front door: Samwise is chat-first, so the page only explains in a
    sentence and sends people straight to sign-up. */
export function Home() {
  const [lang, setLang] = useState<Lang>("en")
  const t: HomeCopy = HOME_COPY[lang]

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY)
    if (stored === "es") setLang("es")
  }, [])

  function pick(l: Lang) {
    setLang(l)
    try {
      window.localStorage.setItem(LANG_KEY, l)
    } catch {
      // Storage blocked — the toggle still applies to this view.
    }
  }

  const signupHref = lang === "es" ? `${SIGNUP}?lang=es` : SIGNUP
  // Sign-up has no password, so returning users pick up the chat on WhatsApp.
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t.waMessage)}`

  return (
    <div className="sw-root" lang={lang}>
      <header className="sw-top">
        <span className="sw-brand">
          Samwise
          <Star className="sw-brand__star" />
        </span>
        <div className="sw-lang">
          <button type="button" aria-pressed={lang === "en"} onClick={() => pick("en")}>EN</button>
          <span>/</span>
          <button type="button" aria-pressed={lang === "es"} onClick={() => pick("es")}>ES</button>
        </div>
      </header>

      <main className="sw-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sw-art" src="/samwise-night.png" alt={t.imageAlt} width={220} height={220} />

        <h1 className="sw-h1">
          {t.title}
          <br />
          <em>{t.titleEm}</em>
        </h1>
        <p className="sw-lead">{t.body}</p>

        <Link className="sw-btn" href={signupHref}>
          {t.cta} <Arrow />
        </Link>
        <p className="sw-micro">{t.micro}</p>
      </main>

      <footer className="sw-foot">
        {t.loginLead} <a href={waHref}>{t.login}</a>
      </footer>
    </div>
  )
}
