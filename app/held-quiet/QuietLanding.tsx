"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    gsap?: any
    Lenis?: any
    __samwiseQuietInit?: boolean
  }
}

const ink = "#e8dec8"
const inkSoft = "rgba(232, 222, 200, 0.62)"
const inkFaint = "rgba(232, 222, 200, 0.32)"
const gold = "#c9a96e"
const bg = "#0a0807"

function Hairline() {
  return (
    <div
      aria-hidden
      className="hairline"
      style={{
        width: "1px",
        height: "64px",
        background: `linear-gradient(to bottom, transparent, ${inkFaint}, transparent)`,
        margin: "0 auto",
      }}
    />
  )
}

function Sigil({ size = 56, dataAttr = "data-sigil" }: { size?: number; dataAttr?: string }) {
  const props: any = { [dataAttr]: "" }
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <circle
        className="sigil-stroke"
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke={gold}
        strokeWidth="0.6"
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
        strokeWidth="0.6"
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
        strokeWidth="0.4"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
      />
      <circle
        className="sigil-dot"
        cx="40"
        cy="40"
        r="1.4"
        fill={gold}
        opacity="0"
      />
    </svg>
  )
}

export default function QuietLanding({
  serifClass,
  monoClass,
}: {
  serifClass: string
  monoClass: string
}) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.__samwiseQuietInit) return

    let lenis: any = null
    const cleanupFns: Array<() => void> = []
    let cancelled = false

    const tryInit = () => {
      if (cancelled) return
      const { gsap, Lenis } = window
      if (!gsap || !Lenis) {
        setTimeout(tryInit, 60)
        return
      }
      window.__samwiseQuietInit = true

      // smooth scroll
      lenis = new Lenis({ wheelMultiplier: 0.85, lerp: 0.1 })
      gsap.ticker.add((time: number) => lenis.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)
      lenis.stop()

      // candle-glow cursor
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
          cx += (mx - cx) * 0.08
          cy += (my - cy) * 0.08
          cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
        }
        gsap.ticker.add(tickerFn)
        gsap.to(cursor, { opacity: 1, duration: 2, delay: 1.6, ease: "power2.out" })
        cleanupFns.push(() => {
          window.removeEventListener("mousemove", onMove)
          gsap.ticker.remove(tickerFn)
        })
      } else if (cursor) {
        cursor.style.display = "none"
      }

      // intro
      const curtain = document.querySelector("[data-curtain]")
      const curtainRule = document.querySelector("[data-curtain-rule] line")
      const sigilStrokes = document.querySelectorAll("[data-sigil] .sigil-stroke")
      const sigilDot = document.querySelector("[data-sigil] .sigil-dot")
      const heroBlock = document.querySelector("[data-hero-block]")

      const intro = gsap.timeline({
        onComplete: () => {
          if (lenis) lenis.start()
        },
      })

      if (curtainRule) {
        intro.fromTo(
          curtainRule,
          { strokeDashoffset: 200 },
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
          0
        )
      }
      if (curtain) {
        intro.to(
          curtain,
          { yPercent: -100, duration: 1.4, ease: "expo.inOut" },
          0.9
        )
        intro.set(curtain, { display: "none" })
      }

      if (sigilStrokes.length) {
        intro.to(
          sigilStrokes,
          {
            strokeDashoffset: 0,
            duration: 1.6,
            stagger: 0.18,
            ease: "expo.out",
          },
          1.2
        )
      }
      if (sigilDot) {
        intro.to(sigilDot, { opacity: 1, duration: 0.8, ease: "power2.out" }, ">-0.4")
      }

      if (heroBlock) {
        intro.from(
          heroBlock,
          { opacity: 0, y: 18, duration: 1.4, ease: "power2.out" },
          1.8
        )
      }

      // No on-scroll reveal animations. Sections render as-is once the page loads.
      // The closing sigil is drawn once on page load, alongside the opening one.
      const endSigilStrokes = document.querySelectorAll<SVGElement>(
        "[data-sigil-end] .sigil-stroke"
      )
      const endSigilDot = document.querySelector<SVGElement>("[data-sigil-end] .sigil-dot")
      if (endSigilStrokes.length) {
        gsap.to(endSigilStrokes, {
          strokeDashoffset: 0,
          stagger: 0.18,
          duration: 1.6,
          delay: 1.4,
          ease: "expo.out",
        })
      }
      if (endSigilDot) {
        gsap.to(endSigilDot, { opacity: 1, duration: 0.8, delay: 3.2, ease: "power2.out" })
      }

      cleanupFns.push(() => {
        if (lenis) lenis.destroy()
        window.__samwiseQuietInit = false
      })
    }

    tryInit()

    return () => {
      cancelled = true
      cleanupFns.forEach((fn) => fn())
    }
  }, [])

  return (
    <>
      <style>{`
        html, body { background: ${bg}; margin: 0; }
        body { overflow-x: hidden; }
        ::selection { background: ${gold}; color: ${bg}; }

        .held-link {
          color: ${ink};
          text-decoration: none;
          border-bottom: 1px solid ${inkFaint};
          padding-bottom: 4px;
          transition: border-color 0.6s ease, color 0.6s ease;
        }
        .held-link:hover { border-color: ${gold}; color: ${gold}; }

        .cursor-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.16), rgba(201,169,110,0.04) 45%, rgba(201,169,110,0) 70%);
          pointer-events: none;
          opacity: 0;
          z-index: 1;
          mix-blend-mode: screen;
          will-change: transform;
        }

        .curtain {
          position: fixed;
          inset: 0;
          background: ${bg};
          z-index: 100;
          pointer-events: none;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 12vh;
        }
        .curtain svg { display: block; overflow: visible; }

        .section {
          position: relative;
          z-index: 2;
          padding: 14vh 28px;
          max-width: 720px;
          margin: 0 auto;
        }
        .sticky-wrap {
          position: relative;
          height: 200vh;
          z-index: 2;
        }
        .sticky-pin {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .sticky-wrap { height: 180vh; }
        }
        .section.center { text-align: center; }
        .num {
          font-size: 0.7rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${gold};
          opacity: 0.78;
          margin-bottom: 1.6rem;
        }
        .lead {
          font-size: 1.25rem;
          line-height: 1.7;
          color: ${ink};
        }
        .soft {
          color: ${inkSoft};
        }
        .arrow-list {
          list-style: none;
          padding: 0;
          margin: 1.8rem 0;
        }
        .arrow-list li {
          padding: 0.55rem 0;
          font-size: 1.15rem;
          color: ${ink};
          font-style: italic;
        }
        .arrow-list li::before {
          content: "→";
          color: ${gold};
          margin-right: 0.9rem;
          opacity: 0.85;
        }
        .step-block { margin: 2.6rem 0; }
        .step-num {
          font-size: 0.7rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${gold};
          margin-bottom: 0.7rem;
        }
        .step-title {
          font-size: 1.5rem;
          font-style: italic;
          color: ${ink};
          margin-bottom: 0.6rem;
        }
        .step-body {
          font-size: 1.08rem;
          color: ${inkSoft};
          line-height: 1.75;
        }
        .step-sub-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0 0 0.4rem;
        }
        .step-sub-list li {
          padding: 0.3rem 0;
          color: ${inkSoft};
          font-size: 1rem;
        }
        .step-sub-list li::before {
          content: "→";
          color: ${gold};
          margin-right: 0.7rem;
          opacity: 0.7;
        }
      `}</style>

      <div data-cursor className="cursor-glow" aria-hidden />

      <div data-curtain className="curtain" aria-hidden>
        <svg
          data-curtain-rule
          width="200"
          height="2"
          viewBox="0 0 200 2"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="1"
            x2="200"
            y2="1"
            stroke={gold}
            strokeWidth="0.6"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
        </svg>
      </div>

      <main
        ref={rootRef}
        className={serifClass}
        style={{
          background: bg,
          color: ink,
          minHeight: "100vh",
          fontWeight: 300,
          fontSize: "1.2rem",
          lineHeight: 1.7,
          letterSpacing: "0.005em",
        }}
      >
        {/* HERO — sticky for one viewport. The page rises beneath it. */}
        <div className="sticky-wrap">
          <div className="sticky-pin">
            <div className="section center" style={{ padding: "0 28px" }}>
              <div style={{ marginBottom: "3rem" }}>
                <Sigil size={64} />
              </div>
              <div data-hero-block>
                <p
                  className={monoClass}
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.4em",
                    textTransform: "uppercase",
                    color: inkSoft,
                    marginBottom: "2rem",
                  }}
                >
                  Samwise
                </p>
                <p
                  style={{
                    fontSize: "1.35rem",
                    lineHeight: 1.7,
                    color: ink,
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  We are a team of mental health professionals, spiritual guidance
                  practitioners and technology experts that want a definitive solution
                  to overcome the toughest, untreated and most insidious behavioural
                  challenges we have faced in our lives, the lives of our loved ones
                  and in the lives of our patients.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Hairline />

        {/* THE CHALLENGES — original list. */}
        <section className="section">
          <p className={`num ${monoClass}`}>i — what we treat</p>
          <ul className="arrow-list">
            <li>Screens addiction.</li>
            <li>Need for approval or impulsive love seeking behaviour.</li>
            <li>Addiction to porn.</li>
            <li>Social media addiction.</li>
            <li>Destructive relationships.</li>
          </ul>
          <p className="lead soft" style={{ fontStyle: "italic" }}>
            These are just a few examples among the many more — but all
            behavioural issues out of the patient&apos;s control.
          </p>
        </section>

        <Hairline />

        {/* THE SOLUTION */}
        <section className="section">
          <p className={`num ${monoClass}`}>ii — what we are building</p>
          <p className="lead">
            We are building a solution for this. A solution that remains with you
            at all times of your journey of getting rid of the disease of
            self-destruction, and will not let go until you are completely cleared.
          </p>
          <p className="lead" style={{ marginTop: "1.6rem" }}>
            We call it <span style={{ color: gold, fontStyle: "italic" }}>Samwise</span>.
          </p>
          <p className="lead soft" style={{ marginTop: "2.4rem", fontStyle: "italic" }}>
            Samwise is a system that helps you act against your own biology to be
            able to do what you need to do.
          </p>
        </section>

        <Hairline />

        {/* HOW — three steps. */}
        <section className="section">
          <p className={`num ${monoClass}`}>iii — how to begin</p>
          <p

            style={{
              fontSize: "1.6rem",
              fontStyle: "italic",
              color: ink,
              margin: "0 0 2.4rem",
              lineHeight: 1.4,
            }}
          >
            How can you make Samwise part of your life?
          </p>

          <div className="step-block">
            <div className={`step-num ${monoClass}`}>step one · twenty minutes</div>
            <div className="step-title">Schedule a Fit Assessment call.</div>
            <div className="step-body">
              All the questions about the program will be answered here. The
              outcome will be whether we are a good fit for your needs or not.
            </div>
            <ul className="step-sub-list">
              <li>If we are a fit, the program starts.</li>
              <li>
                If we are not, we will recommend you other services — so you can
                always get help.
              </li>
            </ul>
          </div>

          <div className="step-block">
            <div className={`step-num ${monoClass}`}>step two · ninety minutes</div>
            <div className="step-title">
              Schedule the Problem Clarification and Belief System session.
            </div>
            <div className="step-body">
              Yes, we know — it is long. We need to make sure we do this part
              right to actually be able to help you. You will get a clear picture
              of your problem here, a clear path to a solution, and the first set
              up of your first ritual and AI Agent for your calls.
            </div>
          </div>

          <div className="step-block">
            <div className={`step-num ${monoClass}`}>step three · the days that follow</div>
            <div className="step-title">You will start your ritual.</div>
            <div className="step-body">
              We will monitor your progress, so we can schedule an optimization
              session to help you achieve progress faster.
            </div>
          </div>
        </section>

        <Hairline />

        {/* CTA */}
        <section className="section center">
          <p className={`num ${monoClass}`}>iv — schedule your call</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", alignItems: "center", marginTop: "1rem" }}>
            <a
              className="held-link"
              href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
              style={{ fontSize: "1.3rem", fontStyle: "italic" }}
            >
              Fit Assessment
            </a>
            <div
              className={monoClass}
              style={{ fontSize: "0.72rem", color: inkFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              start here if it&apos;s your first time
            </div>

            <div style={{ height: "1.4rem" }} />

            <a
              className="held-link"
              href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief"
              style={{ fontSize: "1.15rem", fontStyle: "italic", color: inkSoft }}
            >
              Problem Clarification and Belief System
            </a>
            <div
              className={monoClass}
              style={{ fontSize: "0.72rem", color: inkFaint, letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              only if you&apos;ve completed the fit assessment, or are a current subscriber
            </div>
          </div>
        </section>

        <Hairline />

        {/* WITNESS */}
        <section className="section center">
          <p className={`num ${monoClass}`}>v — the witness</p>
          <p

            className="lead soft"
            style={{ fontStyle: "italic", marginBottom: "2.6rem" }}
          >
            The Samwise program has been designed with the close advice of
          </p>

          <div

            style={{
              width: "150px",
              height: "150px",
              margin: "0 auto",
              borderRadius: "50%",
              overflow: "hidden",
              border: `1px solid ${inkFaint}`,
              boxShadow: `0 0 60px ${gold}22`,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
              alt="Dr. Ana María Reyes Tirado"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(0.2) sepia(0.18) brightness(0.95)",
              }}
            />
          </div>

          <p

            style={{
              margin: "1.8rem 0 0",
              fontSize: "1.3rem",
              fontStyle: "italic",
              color: ink,
            }}
          >
            Dr. Ana María Reyes Tirado
          </p>
          <p

            className={monoClass}
            style={{
              margin: "0.8rem 0 0",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: inkSoft,
              lineHeight: 2,
            }}
          >
            Specialist in Neurofeedback · New Wind Academy, USA
            <br />
            Clinical Director · Fundación Syncronía
          </p>
        </section>

        {/* CLOSING */}
        <section className="section center" style={{ paddingTop: "8vh", paddingBottom: "16vh" }}>
          <div style={{ marginBottom: "2rem" }}>
            <Sigil size={40} dataAttr="data-sigil-end" />
          </div>
        </section>
      </main>
    </>
  )
}
