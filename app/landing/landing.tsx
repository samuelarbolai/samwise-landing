"use client"

import { useEffect, useState } from "react"
import { LANDING_EN, LANDING_ES, type LandingCopy } from "./landing-copy"
import { cleanSrc } from "@/lib/v2/src-tag"
import { DemoVideo, type DemoVideoKey } from "../_shared/demo-video"
import { detectLang, langFromUrl, saveLang, type PageLang } from "@/lib/lang"
import "./landing.css"

/** The hero's example entry labels. */
const ENTRY_LABELS: Record<PageLang, { before: string; during: string; after: string }> = {
  en: { before: "Before", during: "During", after: "After" },
  es: { before: "Antes", during: "Durante", after: "Después" },
}

/** The house sparkle — same path as the favicon, the navbar star and the OG card. */
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg className="ld-btn__arrow" width="13" height="9" viewBox="0 0 13 9" aria-hidden="true">
      <path d="M0 4.5h11M8 1l3.5 3.5L8 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  )
}

/**
 * All three buttons go to the same sign-up. The link carries ?src= so sign-ups from
 * this page can be counted: an outreach link like samwise.life/?src=itaa-email keeps
 * its own tag, any other visit is tagged "landing".
 */
function useSignupHref(defaultSrc: string, lang: PageLang, role?: "clinician") {
  const [src, setSrc] = useState(defaultSrc)
  useEffect(() => {
    const fromUrl = cleanSrc(new URLSearchParams(window.location.search).get("src"))
    if (fromUrl) setSrc(fromUrl)
  }, [])
  // The page's language goes along, so sign-up opens in the language the visitor was reading.
  return `/v2/signup?src=${encodeURIComponent(src)}&lang=${lang}${role ? `&role=${role}` : ""}`
}

type Props = {
  /** Copy per language. Default: the home page. */
  copy?: Record<PageLang, LandingCopy>
  /** Tag for sign-ups from this page when the visitor's link has no ?src= of its own. */
  defaultSrc?: string
  /**
   * A page with its own language (e.g. /por-tu-cuenta) starts in it; only ?lang= or the
   * switch change it. Without it the page follows ?lang=, the saved choice, then the
   * browser's language.
   */
  pageLang?: PageLang
  /** "clinician": every button opens the clinician sign-up (/v2/signup?role=clinician). */
  role?: "clinician"
  /** Demo video under the hero. Default: the first week. */
  video?: DemoVideoKey
}

const HOME_COPY: Record<PageLang, LandingCopy> = { en: LANDING_EN, es: LANDING_ES }

export function Landing({ copy = HOME_COPY, defaultSrc = "landing", pageLang, role, video = "first-week" }: Props) {
  // Starts the same on server and client, then reconciles in an effect (no hydration mismatch).
  const [lang, setLang] = useState<PageLang>(pageLang ?? "en")
  useEffect(() => {
    setLang(pageLang ? (langFromUrl() ?? pageLang) : detectLang())
  }, [pageLang])
  function pick(l: PageLang) {
    setLang(l)
    saveLang(l)
  }

  const t = copy[lang]
  const labels = ENTRY_LABELS[lang]
  const signup = useSignupHref(defaultSrc, lang, role)

  return (
    <div className="ld-root" lang={lang}>
      <header className="ld-top">
        <nav aria-label="Main" className="ld-wrap ld-nav">
          <a className="ld-brand" href="#top">
            Samwise
            <Star className="ld-brand__star" />
          </a>
          <div className="ld-nav__links">
            <a href="#how">{t.nav.how}</a>
            <a href="#faq">{t.nav.questions}</a>
            <div className="ld-lang" role="group" aria-label="Language / Idioma">
              <button type="button" aria-pressed={lang === "en"} onClick={() => pick("en")}>EN</button>
              <span aria-hidden="true">/</span>
              <button type="button" aria-pressed={lang === "es"} onClick={() => pick("es")}>ES</button>
            </div>
            <a className="ld-btn ld-btn--small" href={signup}>
              {t.nav.cta}
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* 1. Hero */}
        <section id="top" className="ld-hero">
          <div className="ld-wrap ld-hero__grid">
            <div className="ld-hero__text">
              <h1 className="ld-h1">{t.hero.title}</h1>
              <p className="ld-lead">{t.hero.sub}</p>
              <div className="ld-cta">
                <a className="ld-btn" href={signup}>
                  {t.hero.cta} <Arrow />
                </a>
                <p className="ld-micro">{t.hero.under}</p>
              </div>
            </div>

            <figure className="ld-visual">
              <div className="ld-visual__stack">
                <div className="ld-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ld-chip__avatar" src="/samwise-night.png" alt="" width={40} height={40} />
                  <span>&ldquo;{t.hero.chip}&rdquo;</span>
                </div>
                <div className="ld-page">
                  <span className="ld-page__day">{t.hero.entry.day}</span>
                  <p><b>{labels.before}</b> {t.hero.entry.before}</p>
                  <p><b>{labels.during}</b> {t.hero.entry.during}</p>
                  <p><b>{labels.after}</b> {t.hero.entry.after}</p>
                  <p className="ld-page__next">{t.hero.entry.next}</p>
                </div>
              </div>
              <figcaption className="ld-caption">{t.hero.caption}</figcaption>
            </figure>
          </div>
        </section>

        {/* 1b. Demo video: the first week, in the page's language. Loads only on tap. */}
        <section aria-label="Video" className="ld-video">
          <div className="ld-wrap">
            <DemoVideo video={video} lang={lang} />
          </div>
        </section>

        {/* 2. How it works */}
        <section id="how" aria-labelledby="how-h" className="ld-section">
          <div className="ld-wrap">
            <h2 id="how-h" className="ld-h2">{t.how.title}</h2>
            <ol className="ld-steps">
              {t.how.steps.map((s, i) => (
                <li key={s.title} className="ld-step">
                  <span className="ld-step__n" aria-hidden="true">{i + 1}</span>
                  <h3 className="ld-h3">{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Safety net */}
        <section aria-labelledby="net-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="net-h" className="ld-h2 ld-h2--narrow">{t.net.title}</h2>
            <ol className="ld-net">
              {t.net.steps.map((s, i) => (
                <li key={s.label} className={i === t.net.steps.length - 1 ? "ld-net__item ld-net__item--last" : "ld-net__item"}>
                  <span className="ld-net__label">{s.label}</span>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. What stays yours */}
        <section aria-labelledby="yours-h" className="ld-section ld-section--rule">
          <div className="ld-wrap ld-yours">
            <h2 id="yours-h" className="ld-h2">{t.yours.title}</h2>
            <ul className="ld-yours__list">
              {t.yours.items.map((item) => (
                <li key={item}>
                  <Star className="ld-yours__star" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. Questions */}
        <section id="faq" aria-labelledby="faq-h" className="ld-section">
          <div className="ld-wrap">
            <h2 id="faq-h" className="ld-h2">{t.faq.title}</h2>
            <dl className="ld-faq">
              {t.faq.items.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing block */}
        <section id="start" aria-labelledby="close-h" className="ld-close-wrap">
          <div className="ld-wrap">
            <div className="ld-close">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ld-close__art" src="/samwise-night.png" alt="" width={120} height={120} />
              <h2 id="close-h" className="ld-h2">{t.close.title}</h2>
              <a className="ld-btn" href={signup}>
                {t.close.cta} <Arrow />
              </a>
              <p className="ld-micro">{t.close.under}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <div className="ld-wrap ld-foot__row">
          <span>
            {t.footer.left} ·{" "}
            <a className="ld-foot__link" href="/mac">
              {t.footer.mac}
            </a>
          </span>
          <span>{t.footer.right}</span>
        </div>
      </footer>
    </div>
  )
}
