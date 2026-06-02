"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    Lenis?: any
    __samwiseChamberInit?: boolean
  }
}

const ink = "#e8dec8"
const inkSoft = "rgba(232, 222, 200, 0.62)"
const inkFaint = "rgba(232, 222, 200, 0.28)"
const inkGhost = "rgba(232, 222, 200, 0.10)"
const gold = "#c9a96e"
const goldSoft = "rgba(201, 169, 110, 0.55)"
const bg = "#0a0807"

// ────────────────────────────────────────────────────────────────────
// THE STAGES — each is one full-viewport ceremonial moment.
// Content cross-fades between them as the user scrolls.
// ────────────────────────────────────────────────────────────────────

const STAGES = [
  { numeral: "I", label: "Invocation" },
  { numeral: "II", label: "What stays in the dark" },
  { numeral: "III", label: "The Solution" },
  { numeral: "IV", label: "The Mechanism" },
  { numeral: "V", label: "The Path" },
  { numeral: "VI", label: "The Threshold" },
  { numeral: "VII", label: "The Witness" },
  { numeral: "VIII", label: "Estamos aquí" },
] as const

function CornerOrnament({ rotation }: { rotation: number }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      style={{ transform: `rotate(${rotation}deg)`, overflow: "visible" }}
      aria-hidden
    >
      <line x1="0" y1="0" x2="14" y2="0" stroke={gold} strokeWidth="0.8" />
      <line x1="0" y1="0" x2="0" y2="14" stroke={gold} strokeWidth="0.8" />
      <circle cx="0" cy="0" r="1.2" fill={gold} />
    </svg>
  )
}

function Sigil({ size = 44, dataAttr = "data-sigil" }: { size?: number; dataAttr?: string }) {
  const props: any = { [dataAttr]: "" }
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      <circle
        className="sigil-stroke"
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke={gold}
        strokeWidth="0.7"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
      />
      <line
        className="sigil-stroke"
        x1="40"
        y1="10"
        x2="40"
        y2="70"
        stroke={gold}
        strokeWidth="0.7"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
      />
      <line
        className="sigil-stroke"
        x1="20"
        y1="40"
        x2="60"
        y2="40"
        stroke={gold}
        strokeWidth="0.5"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
      />
      <circle
        className="sigil-dot"
        cx="40"
        cy="40"
        r="1.6"
        fill={gold}
        opacity="0"
      />
    </svg>
  )
}

export default function Chamber({
  displayClass,
  bodyClass,
  monoClass,
}: {
  displayClass: string
  bodyClass: string
  monoClass: string
}) {
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.__samwiseChamberInit) return

    let lenis: any = null
    const cleanupFns: Array<() => void> = []
    let cancelled = false

    const tryInit = () => {
      if (cancelled) return
      const { gsap, ScrollTrigger, Lenis } = window
      if (!gsap || !ScrollTrigger || !Lenis) {
        setTimeout(tryInit, 60)
        return
      }
      window.__samwiseChamberInit = true

      gsap.registerPlugin(ScrollTrigger)

      lenis = new Lenis({ wheelMultiplier: 0.85, lerp: 0.1 })
      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add((t: number) => lenis.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)
      lenis.stop()

      // ── candle-glow cursor ──
      const supportsHover =
        window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches
      const cursor = document.querySelector<HTMLElement>("[data-cursor]")
      if (cursor && supportsHover) {
        let mx = window.innerWidth / 2
        let my = window.innerHeight / 2
        let cx = mx
        let cy = my
        const onMove = (e: MouseEvent) => {
          mx = e.clientX
          my = e.clientY
        }
        window.addEventListener("mousemove", onMove)
        const tickerFn = () => {
          cx += (mx - cx) * 0.1
          cy += (my - cy) * 0.1
          cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
        }
        gsap.ticker.add(tickerFn)
        gsap.to(cursor, { opacity: 1, duration: 1.6, delay: 1.4, ease: "power2.out" })
        cleanupFns.push(() => {
          window.removeEventListener("mousemove", onMove)
          gsap.ticker.remove(tickerFn)
        })
      } else if (cursor) {
        cursor.style.display = "none"
      }

      // ── intro: curtain + sigil + first stage ──
      const curtain = document.querySelector("[data-curtain]")
      const sigilStrokes = document.querySelectorAll("[data-sigil] .sigil-stroke")
      const sigilDot = document.querySelector("[data-sigil] .sigil-dot")
      const frame = document.querySelector("[data-frame]")
      const numerals = document.querySelector("[data-numerals]")
      const chapterLabel = document.querySelector("[data-chapter-label]")
      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]")

      // initial state — only stage 0 visible, frame off
      gsap.set(stages, { opacity: 0, y: 14 })
      gsap.set(stages[0], { opacity: 1, y: 0 })
      if (frame) gsap.set(frame, { opacity: 0 })
      if (numerals) gsap.set(numerals, { opacity: 0, x: 12 })
      if (chapterLabel) gsap.set(chapterLabel, { opacity: 0 })

      const intro = gsap.timeline({
        onComplete: () => {
          if (lenis) lenis.start()
        },
      })

      if (curtain) {
        intro.to(curtain, { yPercent: -100, duration: 1.4, ease: "expo.inOut" }, 0.4)
        intro.set(curtain, { display: "none" })
      }

      if (sigilStrokes.length) {
        intro.to(
          sigilStrokes,
          {
            strokeDashoffset: 0,
            duration: 1.6,
            stagger: 0.16,
            ease: "expo.out",
          },
          0.8
        )
      }
      if (sigilDot) {
        intro.to(sigilDot, { opacity: 1, duration: 0.8, ease: "power2.out" }, ">-0.4")
      }

      if (frame) {
        intro.to(frame, { opacity: 1, duration: 1.4, ease: "power2.out" }, 1.2)
      }
      if (numerals) {
        intro.to(numerals, { opacity: 1, x: 0, duration: 1.2, ease: "power2.out" }, 1.4)
      }
      if (chapterLabel) {
        intro.to(chapterLabel, { opacity: 1, duration: 1.2, ease: "power2.out" }, 1.6)
      }

      // ── master scroll timeline: cross-fade stages ──
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      })

      const HOLD = 0.9
      const TRANSITION = 0.35

      for (let i = 0; i < stages.length - 1; i++) {
        masterTl.to({}, { duration: HOLD })
        masterTl.to(stages[i], { opacity: 0, y: -14, duration: TRANSITION, ease: "power2.in" }, ">")
        masterTl.fromTo(
          stages[i + 1],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: TRANSITION, ease: "power2.out" },
          "<"
        )
      }
      masterTl.to({}, { duration: HOLD })

      // ── numerals: highlight active ──
      const numeralEls = gsap.utils.toArray<HTMLElement>("[data-numeral]")
      const labelEls = gsap.utils.toArray<HTMLElement>("[data-stage-label]")
      gsap.set(numeralEls, { opacity: 0.22, color: ink })
      gsap.set(labelEls, { opacity: 0 })
      if (numeralEls[0]) gsap.set(numeralEls[0], { opacity: 1, color: gold })
      if (labelEls[0]) gsap.set(labelEls[0], { opacity: 1 })

      // progress rule: fills as scroll progresses
      const progressFill = document.querySelector("[data-progress-fill]")
      if (progressFill) {
        gsap.fromTo(
          progressFill,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: outerRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        )
      }

      // per-stage scroll trigger to drive the active numeral & label
      stages.forEach((stage, i) => {
        ScrollTrigger.create({
          trigger: outerRef.current,
          start: () => `top+=${(i / stages.length) * 100}% top`,
          end: () => `top+=${((i + 1) / stages.length) * 100}% top`,
          onToggle: (self: any) => {
            if (self.isActive) {
              numeralEls.forEach((el, idx) => {
                gsap.to(el, {
                  opacity: idx === i ? 1 : 0.22,
                  color: idx === i ? gold : ink,
                  duration: 0.6,
                  ease: "power2.out",
                })
              })
              labelEls.forEach((el, idx) => {
                gsap.to(el, {
                  opacity: idx === i ? 1 : 0,
                  duration: 0.5,
                  ease: "power2.out",
                })
              })
            }
          },
        })
      })

      cleanupFns.push(() => {
        ScrollTrigger.getAll().forEach((t: any) => t.kill())
        if (lenis) lenis.destroy()
        window.__samwiseChamberInit = false
      })
    }

    tryInit()

    return () => {
      cancelled = true
      cleanupFns.forEach((fn) => fn())
    }
  }, [])

  // ────────────────────────────────────────────────
  // STAGE CONTENT — original wording, reframed for stage presentation.
  // ────────────────────────────────────────────────

  const stageContent: React.ReactNode[] = [
    // I — Invocation
    <div key="i" className="stage-inner">
      <p className={`kicker ${monoClass}`}>i · invocation</p>
      <p className="prose lead">
        We are a team of <em>mental health professionals</em>, <em>spiritual guidance practitioners</em>,
        and <em>technology experts</em> — building a definitive solution to overcome the
        toughest, untreated and most insidious behavioural challenges we have faced
        in our lives, the lives of our loved ones, and in the lives of our patients.
      </p>
    </div>,

    // II — What stays in the dark
    <div key="ii" className="stage-inner">
      <p className={`kicker ${monoClass}`}>ii · what stays in the dark</p>
      <ul className="ritual-list">
        <li>
          <span className="dot" /> Screens addiction.
        </li>
        <li>
          <span className="dot" /> Need for approval. Impulsive love-seeking behaviour.
        </li>
        <li>
          <span className="dot" /> Addiction to porn.
        </li>
        <li>
          <span className="dot" /> Social media addiction.
        </li>
        <li>
          <span className="dot" /> Destructive relationships.
        </li>
      </ul>
      <p className="prose-soft small">
        — and many more. All behavioural issues out of the patient&apos;s control.
      </p>
    </div>,

    // III — The Solution
    <div key="iii" className="stage-inner">
      <p className={`kicker ${monoClass}`}>iii · the solution</p>
      <p className="prose">
        We are building a solution that <em>remains with you</em> at all times of your
        journey of getting rid of the disease of self-destruction —
      </p>
      <p className="prose" style={{ marginTop: "1.6rem" }}>
        — and <em>will not let go</em> until you are completely cleared.
      </p>
      <p className="signature">We call it <span className="samwise">Samwise</span>.</p>
    </div>,

    // IV — The Mechanism
    <div key="iv" className="stage-inner">
      <p className={`kicker ${monoClass}`}>iv · the mechanism</p>
      <p className="prose lead">
        Samwise is a system that helps you act <em>against your own biology</em>
        {" "}— to be able to do what you need to do.
      </p>
    </div>,

    // V — The Path
    <div key="v" className="stage-inner stage-path">
      <p className={`kicker ${monoClass}`}>v · the path</p>
      <h2 className={`display ${displayClass}`}>How can you make Samwise<br />part of your life?</h2>
      <div className="rites">
        <div className="rite">
          <div className={`rite-num ${monoClass}`}>step one · 20 min</div>
          <div className="rite-title">Schedule a Fit Assessment call.</div>
          <div className="rite-body">
            All questions answered. The outcome — whether we are a good fit for your
            needs, or whether we should point you elsewhere.
          </div>
        </div>
        <div className="rite">
          <div className={`rite-num ${monoClass}`}>step two · 150 min</div>
          <div className="rite-title">
            Problem Clarification &amp; Belief System.
          </div>
          <div className="rite-body">
            A clear picture of your problem. A clear path to the solution. The first
            set-up of your ritual and your AI Agent.
          </div>
        </div>
        <div className="rite">
          <div className={`rite-num ${monoClass}`}>step three · the days that follow</div>
          <div className="rite-title">You will start your ritual.</div>
          <div className="rite-body">
            We monitor progress. We schedule optimization sessions to help you
            achieve progress faster.
          </div>
        </div>
      </div>
    </div>,

    // VI — The Threshold
    <div key="vi" className="stage-inner">
      <p className={`kicker ${monoClass}`}>vi · the threshold</p>
      <h2 className={`display ${displayClass}`}>Schedule your call.</h2>
      <div className="thresholds">
        <a className="threshold" href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment">
          <div className="threshold-name">Fit Assessment</div>
          <div className={`threshold-meta ${monoClass}`}>start here, if it&apos;s your first time</div>
        </a>
        <a className="threshold soft" href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief">
          <div className="threshold-name">Problem Clarification &amp; Belief System</div>
          <div className={`threshold-meta ${monoClass}`}>
            only after the Fit Assessment, or for current subscribers
          </div>
        </a>
      </div>
    </div>,

    // VII — The Witness
    <div key="vii" className="stage-inner stage-witness">
      <p className={`kicker ${monoClass}`}>vii · the witness</p>
      <p className="prose-soft small">
        The Samwise program has been designed with the close advice of —
      </p>
      <div className="portrait">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
          alt="Dr. Ana María Reyes Tirado"
        />
      </div>
      <h3 className={`witness-name ${displayClass}`}>Dr. Ana María Reyes Tirado</h3>
      <p className={`witness-credit ${monoClass}`}>
        Specialist in Neurofeedback · New Wind Academy, USA
        <br />
        Clinical Director · Fundación Syncronía
      </p>
    </div>,

    // VIII — Estamos aquí
    <div key="viii" className="stage-inner stage-close">
      <Sigil size={56} dataAttr="data-sigil-end" />
      <h2 className={`display ${displayClass}`}>Estamos aquí.</h2>
      <p className={`kicker ${monoClass}`}>we are here</p>
    </div>,
  ]

  return (
    <>
      <style>{`
        :root { color-scheme: dark; }
        html, body { background: ${bg}; margin: 0; padding: 0; }
        body { overflow-x: hidden; color: ${ink}; }
        ::selection { background: ${gold}; color: ${bg}; }

        .candle-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(1100px 700px at 50% 30%, rgba(201,169,110,0.07), rgba(201,169,110,0) 60%),
            radial-gradient(900px 600px at 50% 80%, rgba(201,169,110,0.05), rgba(201,169,110,0) 65%);
        }
        .grain {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.06;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.91  0 0 0 0 0.87  0 0 0 0 0.78  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .cursor-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.16), rgba(201,169,110,0.04) 45%, rgba(201,169,110,0) 70%);
          pointer-events: none;
          opacity: 0;
          z-index: 2;
          mix-blend-mode: screen;
          will-change: transform;
        }
        .curtain {
          position: fixed;
          inset: 0;
          background: ${bg};
          z-index: 100;
          pointer-events: none;
        }

        /* ── the chamber ── */
        .outer { position: relative; z-index: 3; }
        .chamber {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .frame {
          position: absolute;
          top: 28px;
          left: 28px;
          right: 28px;
          bottom: 28px;
          border: 1px solid ${inkFaint};
          pointer-events: none;
          z-index: 5;
        }
        .frame .corner {
          position: absolute;
          z-index: 6;
        }
        .frame .corner.tl { top: -1px; left: -1px; }
        .frame .corner.tr { top: -1px; right: -1px; }
        .frame .corner.bl { bottom: -1px; left: -1px; }
        .frame .corner.br { bottom: -1px; right: -1px; }

        .anchor-sigil {
          position: absolute;
          top: 56px;
          left: 56px;
          z-index: 7;
        }
        .anchor-wordmark {
          position: absolute;
          top: 60px;
          right: 56px;
          z-index: 7;
          font-family: var(--font-display), serif;
          font-size: 0.78rem;
          letter-spacing: 0.42em;
          color: ${inkSoft};
          text-transform: uppercase;
        }

        .numerals {
          position: absolute;
          top: 50%;
          right: 56px;
          transform: translateY(-50%);
          z-index: 7;
          display: flex;
          flex-direction: column;
          gap: 1.05rem;
          font-family: var(--font-display), serif;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          align-items: flex-end;
        }
        .numerals .num {
          color: ${ink};
          opacity: 0.22;
          transition: color 0.6s, opacity 0.6s;
          font-variant-numeric: tabular-nums;
        }

        .chapter-label {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 76px;
          display: flex;
          justify-content: center;
          z-index: 7;
          pointer-events: none;
        }
        .chapter-label-inner {
          position: relative;
          font-family: var(--font-display), serif;
          font-size: 0.7rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: ${gold};
          opacity: 0.85;
          height: 1.2em;
        }
        .chapter-label-inner > span {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .progress {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 32px;
          height: 1px;
          background: ${inkGhost};
          z-index: 6;
        }
        .progress-fill {
          height: 100%;
          background: ${goldSoft};
          transform-origin: left center;
          transform: scaleX(0);
        }

        /* ── stages ── */
        .stage-deck {
          position: absolute;
          inset: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6vw;
        }
        .stage-inner {
          width: 100%;
          max-width: 720px;
          text-align: center;
        }
        .stage-inner.stage-path { max-width: 880px; }
        .stage-inner.stage-witness { max-width: 540px; }
        .stage-inner.stage-close { max-width: 520px; }

        .kicker {
          font-size: 0.66rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: ${gold};
          opacity: 0.85;
          margin: 0 0 2.4rem;
        }

        .prose {
          font-family: var(--font-body), serif;
          font-size: 1.45rem;
          line-height: 1.55;
          color: ${ink};
          margin: 0;
          font-weight: 400;
        }
        .prose.lead { font-size: 1.7rem; line-height: 1.5; }
        .prose-soft {
          font-family: var(--font-body), serif;
          color: ${inkSoft};
          font-style: italic;
          margin: 0;
        }
        .prose-soft.small { font-size: 1.05rem; margin-top: 1.6rem; }

        .signature {
          font-family: var(--font-display), serif;
          font-size: 1.4rem;
          letter-spacing: 0.06em;
          margin: 3rem 0 0;
          color: ${ink};
        }
        .samwise {
          color: ${gold};
          font-style: italic;
          font-family: var(--font-body), serif;
          font-weight: 500;
        }

        em { font-style: italic; color: ${ink}; }

        .display {
          font-family: var(--font-display), serif;
          font-size: 2.4rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.18;
          margin: 0 0 3rem;
          color: ${ink};
        }

        .ritual-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: inline-block;
          text-align: left;
        }
        .ritual-list li {
          font-family: var(--font-body), serif;
          font-size: 1.35rem;
          font-style: italic;
          color: ${ink};
          padding: 0.45rem 0;
          display: flex;
          align-items: center;
        }
        .ritual-list .dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${gold};
          margin-right: 1.1rem;
          flex-shrink: 0;
        }

        .rites {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.4rem;
          margin-top: 1rem;
          text-align: left;
        }
        .rite {
          padding-left: 1.4rem;
          border-left: 1px solid ${inkFaint};
        }
        .rite-num {
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${gold};
          margin-bottom: 0.65rem;
        }
        .rite-title {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.18rem;
          color: ${ink};
          margin-bottom: 0.55rem;
          line-height: 1.3;
        }
        .rite-body {
          font-family: var(--font-body), serif;
          font-size: 0.96rem;
          color: ${inkSoft};
          line-height: 1.65;
        }
        @media (max-width: 820px) {
          .rites { grid-template-columns: 1fr; gap: 1.8rem; }
        }

        .thresholds {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          align-items: center;
          margin-top: 1rem;
        }
        .threshold {
          display: block;
          color: ${ink};
          text-decoration: none;
          padding: 0.6rem 1.4rem 0.85rem;
          border-bottom: 1px solid ${inkFaint};
          transition: border-color 0.6s, color 0.6s;
        }
        .threshold:hover { border-color: ${gold}; }
        .threshold:hover .threshold-name { color: ${gold}; }
        .threshold-name {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.4rem;
          color: ${ink};
          transition: color 0.6s;
        }
        .threshold.soft .threshold-name {
          font-size: 1.18rem;
          color: ${inkSoft};
        }
        .threshold-meta {
          font-size: 0.66rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${inkFaint};
          margin-top: 0.5rem;
        }

        .stage-witness .portrait {
          width: 150px;
          height: 150px;
          margin: 1.6rem auto;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid ${inkFaint};
          box-shadow: 0 0 60px rgba(201,169,110,0.18);
        }
        .stage-witness .portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.2) sepia(0.18) brightness(0.95);
        }
        .witness-name {
          font-size: 1.4rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          margin: 0.4rem 0 0.7rem;
        }
        .witness-credit {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${inkSoft};
          line-height: 2;
        }

        .stage-close { display: flex; flex-direction: column; align-items: center; gap: 1.6rem; }
        .stage-close .display { margin: 0; }

        @media (max-width: 720px) {
          .anchor-sigil { top: 40px; left: 40px; }
          .anchor-wordmark { top: 44px; right: 40px; font-size: 0.66rem; }
          .numerals { right: 40px; gap: 0.8rem; font-size: 0.7rem; }
          .frame { top: 20px; left: 20px; right: 20px; bottom: 20px; }
          .progress { left: 20px; right: 20px; bottom: 24px; }
          .chapter-label { bottom: 64px; }
          .display { font-size: 1.7rem; }
          .prose { font-size: 1.18rem; }
          .prose.lead { font-size: 1.3rem; }
          .ritual-list li { font-size: 1.1rem; }
          .stage { padding: 0 8vw; }
        }
      `}</style>

      <div data-cursor className="cursor-glow" aria-hidden />
      <div data-curtain className="curtain" aria-hidden />
      <div className="candle-bg" aria-hidden />
      <div className="grain" aria-hidden />

      {/* ── outer scroll container ── */}
      <div ref={outerRef} className="outer" style={{ height: `${STAGES.length * 100}vh` }}>
        <div className={`chamber ${bodyClass}`}>
          {/* fixed frame */}
          <div data-frame className="frame">
            <div className="corner tl"><CornerOrnament rotation={0} /></div>
            <div className="corner tr"><CornerOrnament rotation={90} /></div>
            <div className="corner br"><CornerOrnament rotation={180} /></div>
            <div className="corner bl"><CornerOrnament rotation={270} /></div>
          </div>

          {/* sigil top-left */}
          <div className="anchor-sigil">
            <Sigil size={36} />
          </div>

          {/* wordmark top-right */}
          <div className="anchor-wordmark">Samwise</div>

          {/* numerals on the right */}
          <div data-numerals className="numerals">
            {STAGES.map((s, i) => (
              <span key={s.numeral} className="num" data-numeral={i}>
                {s.numeral}
              </span>
            ))}
          </div>

          {/* chapter label bottom */}
          <div data-chapter-label className="chapter-label">
            <div className="chapter-label-inner">
              {STAGES.map((s, i) => (
                <span key={s.numeral} data-stage-label={i}>
                  {s.numeral.toLowerCase()} · {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* progress rule bottom */}
          <div className="progress">
            <div data-progress-fill className="progress-fill" />
          </div>

          {/* stages — all stacked, cross-fade */}
          <div className="stage-deck">
            {stageContent.map((node, i) => (
              <div key={i} className="stage" data-stage={i}>
                {node}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
