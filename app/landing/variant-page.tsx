"use client"

import { useEffect, useState } from "react"
import { cleanSrc } from "@/lib/v2/src-tag"
import { DemoVideo } from "../_shared/demo-video"
import { detectLang, langFromUrl, saveLang, type PageLang } from "@/lib/lang"
import { findRoute } from "./variants"
import type { HeroCard, Section } from "./variants/types"
import "./landing.css"
import "./clinicians.css"

/** The hero's example entry labels. */
const ENTRY_LABELS: Record<PageLang, { before: string; during: string; after: string }> = {
  en: { before: "Before", during: "During", after: "After" },
  es: { before: "Antes", during: "Durante", after: "Después" },
}

const COPY_LABEL: Record<PageLang, { copy: string; copied: string }> = {
  en: { copy: "Copy link", copied: "Copied" },
  es: { copy: "Copiar enlace", copied: "Copiado" },
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

function Card({ card, lang }: { card: HeroCard; lang: PageLang }) {
  if (card.kind === "entry") {
    const labels = ENTRY_LABELS[lang]
    return (
      <div className="ld-visual__stack">
        <div className="ld-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ld-chip__avatar" src="/samwise-night.png" alt="" width={40} height={40} />
          <span>{card.chipQuoted ? <>&ldquo;{card.chip}&rdquo;</> : card.chip}</span>
        </div>
        <div className="ld-page">
          <span className="ld-page__day">{card.entry.day}</span>
          <p><b>{labels.before}</b> {card.entry.before}</p>
          <p><b>{labels.during}</b> {card.entry.during}</p>
          <p><b>{labels.after}</b> {card.entry.after}</p>
          <p className="ld-page__next">{card.entry.next}</p>
        </div>
      </div>
    )
  }
  if (card.kind === "plan") {
    return (
      <div className="ld-visual__stack">
        <div className="cl-plan">
          <span className="cl-plan__label">{card.label}</span>
          <ol>
            {card.questions.map((q) => (
              <li key={q.text} className={q.yours ? "cl-plan__yours" : undefined}>{q.text}</li>
            ))}
          </ol>
        </div>
        <div className="ld-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ld-chip__avatar" src="/samwise-night.png" alt="" width={40} height={40} />
          <span>{card.chip}</span>
        </div>
        <div className="cl-sent">
          <b>{card.sentLabel}</b>
          {card.sent.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="ld-visual__stack">
      <div className="ld-chip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ld-chip__avatar" src="/samwise-night.png" alt="" width={40} height={40} />
        <span>{card.chip}</span>
      </div>
      <div className="cl-plan">
        <span className="cl-plan__label">{card.label}</span>
        <dl className="cl-journal">
          {card.rows.map((r) => (
            <div key={r.q}>
              <dt>{r.q}</dt>
              <dd>{r.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="cl-sent">
        <b>{card.sentLabel}</b>
      </div>
    </div>
  )
}

function SectionBlock({ s }: { s: Section }) {
  if (s.kind === "steps") {
    return (
      <section id="how" aria-labelledby="how-h" className="ld-section">
        <div className="ld-wrap">
          <h2 id="how-h" className="ld-h2">{s.title}</h2>
          <ol className="ld-steps">
            {s.items.map((it, i) => (
              <li key={it.title} className="ld-step">
                <span className="ld-step__n" aria-hidden="true">{i + 1}</span>
                <h3 className="ld-h3">{it.title}</h3>
                <p>{it.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }
  if (s.kind === "columns") {
    return (
      <section aria-labelledby="net-h" className="ld-section ld-section--paper">
        <div className="ld-wrap">
          <h2 id="net-h" className="ld-h2 ld-h2--narrow">{s.title}</h2>
          <ol className="ld-net">
            {s.items.map((it, i) => (
              <li key={it.label} className={i === s.items.length - 1 ? "ld-net__item ld-net__item--last" : "ld-net__item"}>
                <span className="ld-net__label">{it.label}</span>
                <p>{it.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }
  if (s.kind === "list") {
    return (
      <section aria-labelledby="yours-h" className="ld-section ld-section--rule">
        <div className="ld-wrap ld-yours">
          <h2 id="yours-h" className="ld-h2">{s.title}</h2>
          <ul className="ld-yours__list">
            {s.items.map((item) => (
              <li key={item}>
                <Star className="ld-yours__star" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }
  return (
    <section id="faq" aria-labelledby="faq-h" className="ld-section">
      <div className="ld-wrap">
        <h2 id="faq-h" className="ld-h2">{s.title}</h2>
        <dl className="ld-faq">
          {s.items.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function ShareLink({ src, lang }: { src: string; lang: PageLang }) {
  const [copied, setCopied] = useState(false)
  const link = `samwise.life/?src=${src}`
  const t = COPY_LABEL[lang]
  return (
    <div className="cl-share">
      <span className="cl-share__link">{link}</span>
      <button
        type="button"
        className="ld-btn ld-btn--small"
        onClick={() => {
          navigator.clipboard?.writeText(`https://${link}`).then(() => setCopied(true), () => {})
        }}
      >
        {copied ? t.copied : t.copy}
      </button>
    </div>
  )
}

/**
 * Renders one landing route from the config (app/landing/variants). The page's buttons carry ?src=
 * so sign-ups can be counted: an outreach link's own ?src= wins, else the route's tag.
 */
export function VariantPage({ path }: { path: string }) {
  const found = findRoute(path)
  if (!found) throw new Error(`No landing variant for ${path}`)
  const { variant, route } = found
  const pageLang = route.lang

  // Starts the same on server and client, then reconciles in an effect (no hydration mismatch).
  const [lang, setLang] = useState<PageLang>(pageLang ?? "en")
  const [src, setSrc] = useState(route.src)
  useEffect(() => {
    setLang(pageLang ? (langFromUrl() ?? pageLang) : detectLang())
    const fromUrl = cleanSrc(new URLSearchParams(window.location.search).get("src"))
    if (fromUrl) setSrc(fromUrl)
  }, [pageLang])
  function pick(l: PageLang) {
    setLang(l)
    saveLang(l)
  }

  const t = variant.copy[lang]
  const signup =
    variant.signup === "share-link"
      ? "#start"
      : variant.signup === "clinician"
        ? `/v2/signup?role=clinician&src=${encodeURIComponent(src)}&lang=${lang}`
        : `/v2/signup?src=${encodeURIComponent(src)}&lang=${lang}`
  const shareSrc = cleanSrc(route.src) ?? route.src

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
              {t.hero.tag && <span className="cl-tag">{t.hero.tag}</span>}
              <h1 className="ld-h1">{t.hero.title}</h1>
              <p className="ld-lead">{t.hero.sub}</p>
              <div className="ld-cta">
                <a className="ld-btn" href={signup}>
                  {t.hero.cta} <Arrow />
                </a>
                <p className="ld-micro">{t.hero.under}</p>
              </div>
            </div>

            {t.hero.card && (
              <figure className="ld-visual">
                <Card card={t.hero.card} lang={lang} />
                {t.hero.caption && <figcaption className="ld-caption">{t.hero.caption}</figcaption>}
              </figure>
            )}
          </div>
        </section>

        {variant.video && (
          <section aria-label="Video" className="ld-video">
            <div className="ld-wrap">
              <DemoVideo video={variant.video} lang={lang} />
            </div>
          </section>
        )}

        {t.sections.map((s) => (
          <SectionBlock key={s.kind + s.title} s={s} />
        ))}

        <section id="start" aria-labelledby="close-h" className="ld-close-wrap">
          <div className="ld-wrap">
            <div className="ld-close">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ld-close__art" src="/samwise-night.png" alt="" width={120} height={120} />
              <h2 id="close-h" className="ld-h2">{t.close.title}</h2>
              {variant.signup === "share-link" ? (
                <>
                  {t.close.text && <p>{t.close.text}</p>}
                  <ShareLink src={shareSrc} lang={lang} />
                </>
              ) : (
                <a className="ld-btn" href={signup}>
                  {t.close.cta} <Arrow />
                </a>
              )}
              <p className="ld-micro">{t.close.under}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <div className="ld-wrap ld-foot__row">
          {t.footer.mac ? (
            <span>
              {t.footer.left} ·{" "}
              <a className="ld-foot__link" href="/mac">
                {t.footer.mac}
              </a>
            </span>
          ) : (
            <span>{t.footer.left}</span>
          )}
          <span>{t.footer.right}</span>
        </div>
      </footer>
    </div>
  )
}
