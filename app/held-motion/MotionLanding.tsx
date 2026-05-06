"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    SplitText?: any
    CustomEase?: any
    Lenis?: any
    __samwiseMotionInit?: boolean
  }
}

const ink = "#e8dec8"
const inkSoft = "rgba(232, 222, 200, 0.62)"
const inkFaint = "rgba(232, 222, 200, 0.32)"
const inkGhost = "rgba(232, 222, 200, 0.12)"
const gold = "#c9a96e"
const bg = "#0a0807"

function DualText({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`dual-text ${className ?? ""}`} style={{ position: "relative", display: "inline-block", ...style }}>
      <span className="dual-back" aria-hidden style={{ color: inkGhost, position: "absolute", inset: 0 }}>
        {children}
      </span>
      <span className="dual-front" style={{ color: ink, position: "relative" }}>
        {children}
      </span>
    </div>
  )
}

function Hairline() {
  return (
    <svg
      className="hairline"
      width="1"
      height="64"
      viewBox="0 0 1 64"
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <line
        x1="0.5"
        y1="0"
        x2="0.5"
        y2="64"
        stroke={inkFaint}
        strokeWidth="1"
        strokeDasharray="64"
        strokeDashoffset="64"
      />
    </svg>
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

export default function MotionLanding({
  serifClass,
  monoClass,
}: {
  serifClass: string
  monoClass: string
}) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.__samwiseMotionInit) return

    let lenis: any = null
    const cleanupFns: Array<() => void> = []
    let cancelled = false

    const tryInit = () => {
      if (cancelled) return
      const { gsap, ScrollTrigger, SplitText, CustomEase, Lenis } = window
      if (!gsap || !ScrollTrigger || !SplitText || !CustomEase || !Lenis) {
        setTimeout(tryInit, 60)
        return
      }
      window.__samwiseMotionInit = true

      gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
      const sacredEase = CustomEase.create("sacred", "M0,0 C0.3,0.193 0.04,1 1,1")

      lenis = new Lenis({ wheelMultiplier: 0.8, lerp: 0.1 })
      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add((time: number) => lenis.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)

      lenis.stop()

      const front = document.querySelectorAll<HTMLElement>(".dual-front")
      gsap.set(front, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      })

      const hairlines = document.querySelectorAll<SVGLineElement>(".hairline line")

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

      const intro = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          if (lenis) lenis.start()
        },
      })

      const curtain = document.querySelector("[data-curtain]")
      const curtainRule = document.querySelector("[data-curtain-rule] line")
      const sigilStrokes = document.querySelectorAll("[data-sigil] .sigil-stroke")
      const sigilDot = document.querySelector("[data-sigil] .sigil-dot")
      const summons = document.querySelector("[data-summons]")
      const summonsKicker = document.querySelector("[data-summons-kicker]")

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
          {
            yPercent: -100,
            duration: 1.4,
            ease: sacredEase,
          },
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
            ease: sacredEase,
          },
          1.2
        )
      }
      if (sigilDot) {
        intro.to(
          sigilDot,
          { opacity: 1, duration: 0.8, ease: "power2.out" },
          ">-0.4"
        )
      }

      if (summons) {
        const split = new SplitText(summons, {
          type: "lines, words",
          mask: "lines",
          linesClass: "line",
          wordsClass: "word",
        })
        intro.from(
          split.words,
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.6,
            stagger: 0.08,
            ease: sacredEase,
          },
          1.8
        )
      }

      if (summonsKicker) {
        intro.from(
          summonsKicker,
          { opacity: 0, y: 12, duration: 1.2, ease: "power2.out" },
          ">-0.6"
        )
      }

      intro.add(() => ScrollTrigger.refresh(), "+=0.1")

      const promise = document.querySelector<HTMLElement>("[data-promise]")
      if (promise) {
        ScrollTrigger.create({
          trigger: promise,
          start: "center center",
          end: "+=90%",
          pin: true,
          pinSpacing: true,
        })
        const promiseFront = promise.querySelector<HTMLElement>(".dual-front")
        const promiseBack = promise.querySelector<HTMLElement>(".dual-back")
        if (promiseFront) {
          gsap.fromTo(
            promiseFront,
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: sacredEase,
              scrollTrigger: {
                trigger: promise,
                start: "center center",
                end: "+=70%",
                scrub: true,
              },
            }
          )
        }
        if (promiseBack) {
          gsap.fromTo(
            promiseBack,
            { yPercent: 8, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: promise,
                start: "center 90%",
                end: "center center",
                scrub: true,
              },
            }
          )
        }
      }

      document.querySelectorAll<HTMLElement>("[data-dual]:not([data-promise])").forEach((el) => {
        const frontEl = el.querySelector<HTMLElement>(".dual-front")
        const backEl = el.querySelector<HTMLElement>(".dual-back")
        if (!frontEl) return

        gsap.fromTo(
          frontEl,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: sacredEase,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
          }
        )

        if (backEl) {
          gsap.fromTo(
            backEl,
            { yPercent: 8, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                end: "top 60%",
                scrub: true,
              },
            }
          )
        }
      })

      document.querySelectorAll<HTMLElement>("[data-litany]").forEach((el) => {
        const split = new SplitText(el, {
          type: "lines, words",
          mask: "lines",
          linesClass: "line",
          wordsClass: "word",
        })
        gsap.from(split.words, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.04,
          ease: sacredEase,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "bottom 62%",
            scrub: true,
          },
        })
      })

      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        })
      })

      document.querySelectorAll<HTMLElement>("[data-rite]").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 1.1,
          ease: sacredEase,
          delay: i * 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })

      hairlines.forEach((line) => {
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 92%",
            end: "bottom 60%",
            scrub: true,
          },
        })
      })

      const endSigilStrokes = document.querySelectorAll<SVGElement>(
        "[data-sigil-end] .sigil-stroke"
      )
      const endSigilDot = document.querySelector<SVGElement>("[data-sigil-end] .sigil-dot")
      if (endSigilStrokes.length) {
        gsap.to(endSigilStrokes, {
          strokeDashoffset: 0,
          stagger: 0.18,
          ease: sacredEase,
          scrollTrigger: {
            trigger: endSigilStrokes[0].closest("svg"),
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
      if (endSigilDot) {
        gsap.fromTo(
          endSigilDot,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: endSigilDot.closest("svg"),
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        )
      }

      const witnessImg = document.querySelector("[data-witness-img]")
      if (witnessImg) {
        gsap.from(witnessImg, {
          scale: 0.8,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: witnessImg,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
      }

      cleanupFns.push(() => {
        ScrollTrigger.getAll().forEach((t: any) => t.kill())
        if (lenis) lenis.destroy()
        window.__samwiseMotionInit = false
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

        .dual-front { display: inline-block; }
        .dual-back  { display: inline-block; pointer-events: none; }

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
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 10vh 28px;
          text-align: center;
        }
        .inner { max-width: 580px; width: 100%; }

        .num {
          font-size: 0.72rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${gold};
          opacity: 0.78;
          margin-bottom: 1.6rem;
        }

        .rite-row {
          text-align: left;
          padding-left: 32px;
          border-left: 1px solid ${inkFaint};
          margin-bottom: 3.2rem;
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
          fontSize: "1.32rem",
          lineHeight: 1.7,
          letterSpacing: "0.005em",
        }}
      >
        {/* I. SUMMONS — locked, then released */}
        <section className="section">
          <div className="inner">
            <div style={{ marginBottom: "3rem" }}>
              <Sigil size={64} />
            </div>
            <p
              data-summons
              style={{
                fontSize: "1.95rem",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: ink,
                margin: 0,
              }}
            >
              If you are here, it is not by accident.
            </p>
            <p
              data-summons-kicker
              className={monoClass}
              style={{
                marginTop: "4rem",
                fontSize: "0.7rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: inkSoft,
              }}
            >
              Samwise
            </p>
          </div>
        </section>

        <Hairline />

        {/* II. NAMING — litany, scrubbed word-by-word */}
        <section className="section">
          <div className="inner">
            <p className={`num ${monoClass}`}>i — the naming</p>
            <p data-reveal style={{ margin: 0, fontSize: "1.45rem", lineHeight: 1.6 }}>
              There are things that stay with us in the dark.
            </p>
            <div style={{ height: "2.4rem" }} />
            <ul
              data-litany
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: inkSoft,
                fontStyle: "italic",
                fontSize: "1.2rem",
                lineHeight: 2.1,
              }}
            >
              <li>The screen we cannot put down.</li>
              <li>The love we keep asking for.</li>
              <li>The hands we cannot stop using.</li>
              <li>The ones who wound us, and call us back.</li>
              <li>The hunger that does not name itself.</li>
            </ul>
            <div style={{ height: "3rem" }} />
            <p data-reveal style={{ margin: 0, fontSize: "1.25rem", color: ink }}>
              We know them.
            </p>
          </div>
        </section>

        <Hairline />

        {/* III. PROMISE — pinned, dual text fills while held */}
        <section className="section" data-promise data-dual>
          <div className="inner">
            <p className={`num ${monoClass}`}>ii — the promise</p>
            <DualText
              style={{
                fontSize: "2.4rem",
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              We will hold you.
            </DualText>
            <div style={{ height: "2.4rem" }} />
            <p
              data-reveal
              style={{
                margin: 0,
                fontSize: "1.2rem",
                color: inkSoft,
                lineHeight: 2,
              }}
            >
              Not for an hour.
              <br />
              Not for a week.
              <br />
              Until you are <em>clear</em>.
            </p>
          </div>
        </section>

        <Hairline />

        {/* IV. PATH — three rites */}
        <section className="section" style={{ minHeight: "100vh" }}>
          <div className="inner" style={{ maxWidth: "620px" }}>
            <p className={`num ${monoClass}`}>iii — the path</p>
            <p
              data-reveal
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontStyle: "italic",
                color: ink,
                marginBottom: "4rem",
              }}
            >
              How you come to begin.
            </p>

            {[
              {
                n: "i.",
                title: "The Listening",
                meta: "twenty minutes",
                body:
                  "We hear you. We see if this work is for you. If it is not, we will name where else you should go.",
              },
              {
                n: "ii.",
                title: "The Clarifying",
                meta: "ninety minutes",
                body:
                  "We map the exact shape of what holds you. We build, together, the first ritual and the agent that will walk it with you.",
              },
              {
                n: "iii.",
                title: "The Walking",
                meta: "the days that follow",
                body:
                  "Your ritual begins. We watch closely. We adjust. We do not leave.",
              },
            ].map((step) => (
              <div key={step.title} data-rite className="rite-row">
                <div
                  className={monoClass}
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: gold,
                    marginBottom: "0.6rem",
                  }}
                >
                  {step.n} &nbsp; {step.meta}
                </div>
                <div
                  style={{
                    fontSize: "1.55rem",
                    fontStyle: "italic",
                    color: ink,
                    marginBottom: "0.6rem",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: "1.08rem", color: inkSoft, lineHeight: 1.75 }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Hairline />

        {/* V. THRESHOLD — two doors */}
        <section className="section">
          <div className="inner">
            <p className={`num ${monoClass}`}>iv — the threshold</p>
            <p
              data-reveal
              style={{
                margin: 0,
                fontSize: "1.7rem",
                fontStyle: "italic",
                color: ink,
                lineHeight: 1.5,
                marginBottom: "3.5rem",
              }}
            >
              We are ready when you are.
            </p>

            <div data-reveal style={{ display: "flex", flexDirection: "column", gap: "1.8rem", alignItems: "center" }}>
              <a
                className="held-link"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                style={{ fontSize: "1.3rem", fontStyle: "italic" }}
              >
                The Listening
              </a>
              <div className={monoClass} style={{ fontSize: "0.7rem", color: inkFaint, letterSpacing: "0.2em" }}>
                if we do not yet know you
              </div>

              <div style={{ height: "1.2rem" }} />

              <a
                className="held-link"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief"
                style={{ fontSize: "1.15rem", fontStyle: "italic", color: inkSoft }}
              >
                The Clarifying
              </a>
              <div className={monoClass} style={{ fontSize: "0.7rem", color: inkFaint, letterSpacing: "0.2em" }}>
                if we have already met
              </div>
            </div>
          </div>
        </section>

        <Hairline />

        {/* VI. WITNESS */}
        <section className="section">
          <div className="inner">
            <p className={`num ${monoClass}`}>v — the witness</p>
            <p
              data-reveal
              style={{
                margin: 0,
                fontSize: "1.15rem",
                color: inkSoft,
                fontStyle: "italic",
                lineHeight: 1.7,
                marginBottom: "2.8rem",
              }}
            >
              This work is held in the counsel of
            </p>

            <div
              data-witness-img
              style={{
                width: "140px",
                height: "140px",
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
              data-reveal
              style={{
                margin: "2rem 0 0",
                fontSize: "1.3rem",
                fontStyle: "italic",
                color: ink,
              }}
            >
              Dr. Ana María Reyes Tirado
            </p>
            <p
              data-reveal
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
              Specialist in Neurofeedback · New Wind Academy
              <br />
              Clinical Director · Fundación Syncronía
            </p>
          </div>
        </section>

        {/* VIII. ESTAMOS AQUÍ — closing dual text */}
        <section className="section" data-dual style={{ minHeight: "70vh" }}>
          <div className="inner">
            <div style={{ marginBottom: "2.4rem" }}>
              <Sigil size={40} dataAttr="data-sigil-end" />
            </div>
            <DualText style={{ fontSize: "1.6rem", fontStyle: "italic" }}>
              Estamos aquí.
            </DualText>
            <p
              data-reveal
              className={monoClass}
              style={{
                marginTop: "0.8rem",
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: inkFaint,
              }}
            >
              we are here
            </p>
          </div>
        </section>

        <div style={{ height: "10vh" }} />
      </main>
    </>
  )
}
