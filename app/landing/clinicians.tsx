"use client"

import { useEffect, useState } from "react"
import { CLINICIAN_COPY } from "./clinician-copy"
import { cleanSrc } from "@/lib/v2/src-tag"
import { DemoVideo } from "../_shared/demo-video"
import { langFromUrl, saveLang, type PageLang } from "@/lib/lang"
import "./landing.css"
import "./clinicians.css"

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
 * Clinician marketing page: /clinicians (EN, ?src=clinicians) and /clinicos (ES, ?src=clinicos).
 * Every button goes to the clinician sign-up; an outreach link's own ?src= wins.
 */
export function CliniciansLanding({ pageLang, defaultSrc }: { pageLang: PageLang; defaultSrc: string }) {
  const [lang, setLang] = useState<PageLang>(pageLang)
  const [src, setSrc] = useState(defaultSrc)
  useEffect(() => {
    setLang(langFromUrl() ?? pageLang)
    const fromUrl = cleanSrc(new URLSearchParams(window.location.search).get("src"))
    if (fromUrl) setSrc(fromUrl)
  }, [pageLang])
  function pick(l: PageLang) {
    setLang(l)
    saveLang(l)
  }

  const t = CLINICIAN_COPY[lang]
  const signup = `/v2/signup?role=clinician&src=${encodeURIComponent(src)}&lang=${lang}`

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
        <section id="top" className="ld-hero">
          <div className="ld-wrap ld-hero__grid">
            <div className="ld-hero__text">
              <span className="cl-tag">{t.hero.tag}</span>
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
                <div className="cl-plan">
                  <span className="cl-plan__label">{t.hero.planLabel}</span>
                  <ol>
                    {t.hero.questions.map((q) => (
                      <li key={q.text} className={q.yours ? "cl-plan__yours" : undefined}>{q.text}</li>
                    ))}
                  </ol>
                </div>
                <div className="ld-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ld-chip__avatar" src="/samwise-night.png" alt="" width={40} height={40} />
                  <span>{t.hero.chip}</span>
                </div>
                <div className="cl-sent">
                  <b>{t.hero.sentLabel}</b>
                  {t.hero.sent.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <figcaption className="ld-caption">{t.hero.caption}</figcaption>
            </figure>
          </div>
        </section>

        <section aria-label="Video" className="ld-video">
          <div className="ld-wrap">
            <DemoVideo video="clinician-plan" lang={lang} />
          </div>
        </section>

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

        <section aria-labelledby="ctrl-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="ctrl-h" className="ld-h2 ld-h2--narrow">{t.control.title}</h2>
            <ol className="ld-net">
              {t.control.items.map((s, i) => (
                <li key={s.title} className={i === t.control.items.length - 1 ? "ld-net__item ld-net__item--last" : "ld-net__item"}>
                  <span className="ld-net__label">{s.title}</span>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="not-h" className="ld-section ld-section--rule">
          <div className="ld-wrap ld-yours">
            <h2 id="not-h" className="ld-h2">{t.not.title}</h2>
            <ul className="ld-yours__list">
              {t.not.items.map((item) => (
                <li key={item}>
                  <Star className="ld-yours__star" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

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
          <span>{t.footer.left}</span>
          <span>{t.footer.right}</span>
        </div>
      </footer>
    </div>
  )
}
