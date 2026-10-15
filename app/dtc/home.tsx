"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { HOME_COPY, type HomeCopy, type Lang } from "./home-copy"
import "./home.css"

const SIGNUP = "/v2/signup"
const LOGIN = "/v2/login"
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

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

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
  const loginHref = lang === "es" ? `${LOGIN}?lang=es` : LOGIN

  return (
    <div className="sw-root" lang={lang}>
      <p className="sw-announce">{t.announce}</p>

      <nav className="sw-nav">
        <Link href="/" className="sw-brand">
          Samwise
          <Star className="sw-brand__star" />
        </Link>

        <div className="sw-nav-links">
          <a className="sw-nav-link" href="#how">{t.navHow}</a>
          <a className="sw-nav-link" href="#call">{t.navCall}</a>
          <a className="sw-nav-link" href="#faq">{t.navFaq}</a>
        </div>

        <div className="sw-nav-right">
          <div className="sw-lang">
            <button type="button" aria-pressed={lang === "en"} onClick={() => pick("en")}>EN</button>
            <span>/</span>
            <button type="button" aria-pressed={lang === "es"} onClick={() => pick("es")}>ES</button>
          </div>
          <Link className="sw-nav-link" href={loginHref}>{t.navLogin}</Link>
          <Link className="sw-btn sw-btn--sm" href={signupHref}>{t.navCta}</Link>
        </div>
      </nav>

      <main>
        {/* ── hero ── */}
        <section className="sw-hero">
          <div className="sw-wrap sw-hero-grid">
            <div>
              <p className="sw-eyebrow sw-hero-eyebrow">{t.heroEyebrow}</p>
              <h1 className="sw-h1">
                {t.heroH1a}
                <br />
                <em>{t.heroH1b}</em>
              </h1>
              <p className="sw-lead sw-hero-sub">{t.heroSub}</p>
              <div className="sw-hero-actions">
                <Link className="sw-btn sw-btn--lg" href={signupHref}>
                  {t.heroCta} <Arrow />
                </Link>
                <p className="sw-micro">{t.heroMicro}</p>
              </div>
            </div>

            <figure className="sw-hero-card">
              <div className="sw-call-card">
                <div className="sw-call-ring">
                  <Star className="sw-call-ring__star" />
                </div>
                <p className="sw-call-caller">{t.cardCaller}</p>
                <p className="sw-call-state">{t.cardState}</p>
                <p className="sw-call-time">{t.cardTime}</p>
                <p className="sw-call-foot">{t.cardFoot}</p>
              </div>
            </figure>
          </div>
        </section>

        {/* ── the loop ── */}
        <section className="sw-band sw-band--forest">
          <div className="sw-wrap sw-wrap--narrow">
            <Reveal>
              <p className="sw-eyebrow">{t.loopEyebrow}</p>
              <h2 className="sw-h2 sw-band-h2">{t.loopH2}</h2>
              <p className="sw-body sw-band-body">{t.loopBody}</p>
            </Reveal>
          </div>
        </section>

        {/* ── how it works ── */}
        <section className="sw-section" id="how">
          <div className="sw-wrap">
            <Reveal>
              <div className="sw-section-head">
                <p className="sw-eyebrow">{t.howEyebrow}</p>
                <h2 className="sw-h2">{t.howH2}</h2>
              </div>
            </Reveal>

            <div className="sw-steps">
              {t.steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.08}>
                  <div className="sw-step">
                    <p className="sw-step-n">{step.n}</p>
                    <h3 className="sw-step-title">{step.title}</h3>
                    <p className="sw-step-body">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── the daily call ── */}
        <section className="sw-section" id="call">
          <div className="sw-wrap sw-split">
            <Reveal>
              <div>
                <p className="sw-eyebrow">{t.callEyebrow}</p>
                <h2 className="sw-h2" style={{ marginTop: 16 }}>{t.callH2}</h2>
                <p className="sw-body" style={{ marginTop: 22 }}>{t.callBody}</p>
                <Link className="sw-btn" href={signupHref} style={{ marginTop: 32 }}>
                  {t.heroCta} <Arrow />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="sw-specs">
                {t.specs.map((spec) => (
                  <li className="sw-spec" key={spec}>
                    <Star className="sw-spec__star" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── the support group ── */}
        <section className="sw-band sw-band--forest">
          <div className="sw-wrap sw-wrap--narrow">
            <Reveal>
              <p className="sw-eyebrow">{t.helpEyebrow}</p>
              <h2 className="sw-h2 sw-band-h2">{t.helpH2}</h2>
              <p className="sw-body sw-band-body">{t.helpBody}</p>
              <p className="sw-help-badge">{t.helpBadge}</p>
            </Reveal>
          </div>
        </section>

        {/* ── clinical guidance ── */}
        <section className="sw-cred">
          <div className="sw-wrap sw-wrap--narrow">
            <Reveal>
              <p className="sw-eyebrow">{t.credEyebrow}</p>
              <p className="sw-cred-name">{t.credName}</p>
              <p className="sw-cred-line">{t.credLine1}</p>
              <p className="sw-cred-line">{t.credLine2}</p>
            </Reveal>
          </div>
        </section>

        {/* ── faq ── */}
        <section className="sw-section" id="faq">
          <div className="sw-wrap sw-wrap--narrow">
            <Reveal>
              <p className="sw-eyebrow">{t.faqEyebrow}</p>
              <h2 className="sw-h2" style={{ marginTop: 16 }}>{t.faqH2}</h2>
            </Reveal>

            <div className="sw-faq">
              {t.faq.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p className="sw-faq-a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── final CTA ── */}
        <section className="sw-band sw-band--ink">
          <div className="sw-wrap sw-wrap--narrow">
            <Reveal>
              <h2 className="sw-h2">{t.finalH2}</h2>
              <p className="sw-body">{t.finalBody}</p>
              <div className="sw-final-actions">
                <Link className="sw-btn sw-btn--lg sw-btn--invert" href={signupHref}>
                  {t.finalCta} <Arrow />
                </Link>
                <p className="sw-micro">{t.finalMicro}</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="sw-wrap sw-footer">
        <span>{t.footerRights}</span>
        <Link href="/v1">{t.footerV1}</Link>
      </footer>

      <div className="sw-sticky">
        <Link className="sw-btn" href={signupHref}>
          {t.heroCta} <Arrow />
        </Link>
      </div>
    </div>
  )
}
