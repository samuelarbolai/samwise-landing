"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import "../styles.css"
import "./content-formats.css"
import { brief, formats, type Format } from "./data"

export default function ContentFormatsPage() {
  const [focusNum, setFocusNum] = useState<string | null>(null)
  const focused: Format | null =
    focusNum ? formats.find((f) => f.num === focusNum) ?? null : null

  const closeFocus = useCallback(() => setFocusNum(null), [])
  const stepFocus = useCallback((delta: 1 | -1) => {
    setFocusNum((cur) => {
      if (!cur) return cur
      const i = formats.findIndex((f) => f.num === cur)
      if (i === -1) return cur
      const next = (i + delta + formats.length) % formats.length
      return formats[next].num
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible")
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFocus()
      else if (e.key === "ArrowRight") stepFocus(1)
      else if (e.key === "ArrowLeft") stepFocus(-1)
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [focused, closeFocus, stepFocus])

  return (
    <div className="editorial-root content-formats-root">
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
          <a href="/content-formats/rail" className="nav-link">Rail view</a>
          <a href="/content-formats/scroll" className="nav-link">Scroll view</a>
          <a href="/" className="nav-link">← Home</a>
        </div>
      </nav>

      <div className="editorial-wrap">
        <header className="hero">
          <div className="eyebrow reveal">Content Strategy · Format Bible v1</div>
          <h1 className="editorial-h1 reveal">
            Samwise <em>content formats.</em>
          </h1>
          <p className="lede reveal">
            All nine, at a glance. Pick one to see it big — Esc, ← →, or close returns to the grid.
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

        <section className="grid-section">
          <div className="section-label">
            <span>Nine content formats</span>
            <span className="count">Click to focus</span>
          </div>

          <div className="format-grid">
            {formats.map((f) => (
              <motion.button
                key={f.num}
                layoutId={`format-shell-${f.num}`}
                className="format-tile"
                onClick={() => setFocusNum(f.num)}
                aria-label={`Open ${f.name}`}
              >
                <motion.span layoutId={`format-num-${f.num}`} className="tile-num">
                  {f.num}
                </motion.span>
                <motion.h3 layoutId={`format-name-${f.num}`} className="tile-name">
                  {f.name}
                </motion.h3>
                <motion.div layoutId={`format-tag-${f.num}`} className="tile-tag">
                  {f.tag}
                </motion.div>
                <div className="tile-tones">{f.tones.join(" · ")}</div>
                <span className="tile-open" aria-hidden="true">Open →</span>
              </motion.button>
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
          Content Format Bible · v1
        </footer>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            key="focus-backdrop"
            className="focus-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeFocus()
            }}
          >
            <motion.article
              layoutId={`format-shell-${focused.num}`}
              className="focus-card"
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
            >
              <motion.div layoutId={`format-num-${focused.num}`} className="focus-num">
                {focused.num}
              </motion.div>
              <motion.h2 layoutId={`format-name-${focused.num}`} className="focus-name">
                {focused.name}
              </motion.h2>
              <motion.div layoutId={`format-tag-${focused.num}`} className="focus-tag">
                {focused.tag}
              </motion.div>

              <motion.p
                className="focus-desc"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                {focused.desc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.3 }}
              >
                <div className="components-label">Key components</div>
                <ul className="focus-components">
                  {focused.components.map((c, i) => (
                    <li key={i}>
                      <strong>{c.lead}.</strong> {c.rest}
                    </li>
                  ))}
                </ul>

                <div className="focus-tone-bar">
                  <span className="tone-label">Tone</span>
                  {focused.tones.map((t) => (
                    <span className="tone-pill" key={t}>{t}</span>
                  ))}
                </div>
              </motion.div>
            </motion.article>

            <motion.button
              key="focus-close"
              type="button"
              className="focus-close"
              onClick={closeFocus}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              ✕ Close
            </motion.button>

            <motion.div
              key="focus-nav"
              className="focus-nav"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ delay: 0.25, duration: 0.22 }}
            >
              <button type="button" onClick={() => stepFocus(-1)}>← Prev</button>
              <span className="focus-nav-current">{focused.num} / 09</span>
              <button type="button" onClick={() => stepFocus(1)}>Next →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
