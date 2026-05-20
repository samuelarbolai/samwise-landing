"use client"

import { useEffect, useRef, useState } from "react"
import "../../styles.css"
import "../content-formats.css"
import "./rail.css"
import { brief, formats } from "../data"

export default function ContentFormatsRailPage() {
  const [activeNum, setActiveNum] = useState<string>(formats[0].num)
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cards = Array.from(cardRefs.current.entries())
    if (cards.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          const num = (visible[0].target as HTMLElement).dataset.formatNum
          if (num) setActiveNum(num)
        }
      },
      {
        rootMargin: "-30% 0px -40% 0px",
        threshold: [0, 0.1, 0.3, 0.5],
      },
    )
    cards.forEach(([, el]) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const jumpTo = (num: string) => {
    const el = cardRefs.current.get(num)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: "smooth" })
  }

  return (
    <div className="editorial-root content-formats-root content-formats-rail-root">
      <nav className="editorial-nav">
        <a href="/" className="brand">
          Samwise
          <span className="brand-star" aria-hidden="true">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <path d="M4 0 L4.6 3.4 L8 4 L4.6 4.6 L4 8 L3.4 4.6 L0 4 L3.4 3.4 Z" />
            </svg>
          </span>
        </a>
        <div className="nav-right">
          <a href="/content-formats" className="nav-link">Overview</a>
          <a href="/content-formats/scroll" className="nav-link">Scroll view</a>
          <a href="/" className="nav-link">← Home</a>
        </div>
      </nav>

      <nav className="format-rail-mobile" aria-label="Format index (mobile)">
        {formats.map((f) => (
          <a
            key={f.num}
            href={`#format-${f.num}`}
            className={`rail-chip${activeNum === f.num ? " is-active" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              jumpTo(f.num)
            }}
          >
            {f.num} · {f.name}
          </a>
        ))}
      </nav>

      <nav className="format-rail" aria-label="Format index">
        {formats.map((f) => (
          <button
            key={f.num}
            type="button"
            className={`rail-item${activeNum === f.num ? " is-active" : ""}`}
            onClick={() => jumpTo(f.num)}
          >
            <span className="rail-name">{f.name}</span>
            <span className="rail-num">
              <span className="rail-num-label">{f.num}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="editorial-wrap">
        <header className="hero">
          <div className="eyebrow reveal">Content Strategy · Format Bible v1 · Rail</div>
          <h1 className="editorial-h1 reveal">
            Samwise <em>content formats.</em>
          </h1>
          <p className="lede reveal">
            Same nine formats — the index on the right keeps every one in reach while you read.
            Click a number to jump.
          </p>
        </header>

        <section className="brief-section">
          <div className="section-label">
            <span>The brief</span>
            <span className="count">Working draft</span>
          </div>
          <div className="brief-grid">
            {brief.map((b) => (
              <div className="brief-item reveal" key={b.key}>
                <div className="brief-key">{b.key}</div>
                <div className="brief-val">{b.val}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="formats-section">
          <div className="section-label">
            <span>Nine content formats</span>
            <span className="count">In order of use, not priority</span>
          </div>

          <div className="format-list">
            {formats.map((f) => (
              <article
                className="format-card reveal"
                id={`format-${f.num}`}
                key={f.num}
                data-format-num={f.num}
                ref={(el) => {
                  if (el) cardRefs.current.set(f.num, el)
                  else cardRefs.current.delete(f.num)
                }}
              >
                <div className="format-num">{f.num}</div>
                <div className="format-body">
                  <h2 className="format-name">{f.name}</h2>
                  <div className="format-tag">{f.tag}</div>
                  <p className="format-desc">{f.desc}</p>

                  <div className="components-label">Key components</div>
                  <ul className="components">
                    {f.components.map((c, i) => (
                      <li className="component" key={i}>
                        <strong>{c.lead}.</strong> {c.rest}
                      </li>
                    ))}
                  </ul>

                  <div className="tone-bar">
                    <span className="tone-label">Tone</span>
                    {f.tones.map((t) => (
                      <span className="tone-pill" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="notes-section">
          <div className="section-label">
            <span>Notes for every format</span>
          </div>
          <div className="notes-grid">
            <div className="note-block reveal">
              <div className="note-title">North star</div>
              <p>
                Every piece of content should make the audience feel{" "}
                <strong>seen before it makes them feel advised.</strong> The brand earns the right
                to suggest change by first proving it understands the problem from the inside.
              </p>
            </div>
            <div className="note-block reveal">
              <div className="note-title">What to avoid</div>
              <p>
                Guru energy. Overly polished. Selling before trust is built. Generic mental-health
                aesthetics. Anything that sounds like a wellness brand or a therapy app.{" "}
                <strong>Samwise is for people who already know what their problem is.</strong>
              </p>
            </div>
            <div className="note-block reveal">
              <div className="note-title">Platform priority</div>
              <p>
                <strong>TikTok</strong> is the engine. Everything else feeds from it or feeds into
                it. LinkedIn and Substack are for the audience that wants more after TikTok hooks
                them.
              </p>
            </div>
            <div className="note-block reveal">
              <div className="note-title">Where to start</div>
              <p>
                Test <strong>03 (Deep Dive)</strong> + <strong>05 (Ironic)</strong> +{" "}
                <strong>02 (Roadmap)</strong> first. They cover depth, reach, and humanity — the
                three things that build an audience worth having.
              </p>
            </div>
          </div>
        </section>

        <footer className="editorial-footer">
          <span className="ornament">·</span>
          Content Format Bible · v1 · Rail
        </footer>
      </div>
    </div>
  )
}
