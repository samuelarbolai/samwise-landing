"use client"
import { useEffect, useState } from "react"
import { LanguagePicker, type QualifyMode } from "./language-picker"
import { VoiceRoom } from "./voice-room"
import { QualifyChat } from "./chat"
import { FinalScreen, type Outcome } from "./components/final-screen"
import type { Lang } from "@/lib/qualify/strings"
import "./qualify.css"

export default function QualifyPage() {
  const [lang, setLang] = useState<Lang | null>(null)
  const [mode, setMode] = useState<QualifyMode | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  // When arriving via the gold-star transition from /dual-cta, /qualify
  // stays at opacity 0 for the ENTIRE glow cycle (expand → hold →
  // contract) and only starts fading in once the glow's overlay has
  // fully removed itself from document.body. This enforces the strict
  // sequence: hero fade-out → glow full cycle → /qualify fade-in.
  //
  // The overlay carries `data-qualify-transition-overlay`. We poll for
  // its removal via rAF — cheap, and exits as soon as the overlay is
  // gone (which happens via animation.finished in the dual-cta handler).
  const [isArriving, setIsArriving] = useState(true)

  useEffect(() => {
    let fromTransition = false
    try {
      fromTransition = sessionStorage.getItem("samwise:qualify-transition") === "1"
    } catch {
      // sessionStorage unavailable (private mode, iframe) — treat as direct nav.
    }

    if (!fromTransition) {
      // Direct navigation: skip the wait, render immediately.
      setIsArriving(false)
      return
    }

    // Transition arrival: wait until the glow's overlay is gone, then
    // start the fade-in. We DO NOT clear the sessionStorage flag at the
    // top of this effect — in React StrictMode (dev) the effect runs
    // twice and the first invocation would consume the flag, making the
    // second invocation behave like a direct navigation. We only clear
    // the flag at the moment we actually reveal the page.
    let cancelled = false
    let rafId = 0
    const reveal = () => {
      try { sessionStorage.removeItem("samwise:qualify-transition") } catch {}
      setIsArriving(false)
    }
    // Hard cap: if for some reason the overlay never appears or never
    // disappears, force the reveal after 4s so the page is never stuck
    // invisible.
    const failsafe = setTimeout(() => {
      if (!cancelled) reveal()
    }, 4000)

    const wait = () => {
      if (cancelled) return
      const overlay = document.querySelector("[data-qualify-transition-overlay]")
      if (!overlay) {
        reveal()
        return
      }
      rafId = requestAnimationFrame(wait)
    }
    rafId = requestAnimationFrame(wait)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      clearTimeout(failsafe)
    }
  }, [])

  const onProceed = (l: Lang, m: QualifyMode, n: string, em: string) => {
    setLang(l)
    setMode(m)
    setName(n)
    setEmail(em)
  }

  return (
    <main className={`qualify-root${isArriving ? " is-arriving" : ""}`}>
      <header className="qualify-header">
        <a href="/" className="qualify-brand" aria-label="Back to Samwise">
          Samwise
          <span className="qualify-brand-star" aria-hidden="true">✦</span>
        </a>
      </header>

      <section className="qualify-stage">
        {outcome && lang ? (
          <FinalScreen outcome={outcome} lang={lang} name={name} />
        ) : !lang || !mode ? (
          <LanguagePicker onProceed={onProceed} />
        ) : mode === "voice" ? (
          <VoiceRoom lang={lang} name={name} email={email} onOutcome={setOutcome} />
        ) : (
          <QualifyChat lang={lang} name={name} email={email} onOutcome={setOutcome} />
        )}
      </section>
    </main>
  )
}
