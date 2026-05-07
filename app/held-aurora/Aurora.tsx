"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    gsap?: any
    Lenis?: any
    __samwiseAuroraInit?: boolean
  }
}

// ──────────────────────────────────────────────────────────
// PALETTE — warm celestial, dawn-through-chapel
// ──────────────────────────────────────────────────────────
const ink = "#f4e9d4"
const inkSoft = "rgba(244, 233, 212, 0.66)"
const inkFaint = "rgba(244, 233, 212, 0.32)"
const inkGhost = "rgba(244, 233, 212, 0.14)"
const ember = "#d4a373"      // warm amber accent
const emberDeep = "#a87245"  // deep ember
const bg = "#0d0608"         // near-black aubergine
const bgWarm = "#1a0a10"     // warmed deep aubergine

// ──────────────────────────────────────────────────────────
// EMBERS — drifting motes (decorative, ambient)
// fixed positions in viewport-space; rise slowly across many seconds.
// ──────────────────────────────────────────────────────────

const EMBERS = Array.from({ length: 14 }).map((_, i) => {
  // deterministic distribution
  const x = (i * 73) % 100
  const dur = 28 + ((i * 13) % 24)
  const delay = -((i * 7) % 30)
  const size = 1 + ((i * 5) % 3) * 0.5
  const drift = -8 + ((i * 11) % 16)
  return { x, dur, delay, size, drift, key: i }
})

// scattered constellation positions for the 5 behaviours.
// percentages relative to constellation container.
const CONSTELLATION = [
  { text: "Screens addiction.", x: 16, y: 18, scale: 1.05 },
  { text: "Need for approval.\nImpulsive love-seeking.", x: 64, y: 30, scale: 0.92 },
  { text: "Addiction to porn.", x: 8, y: 56, scale: 1.0 },
  { text: "Social media addiction.", x: 52, y: 64, scale: 0.95 },
  { text: "Destructive relationships.", x: 30, y: 84, scale: 1.08 },
] as const

function Sigil({ size = 44 }: { size?: number }) {
  return (
    <svg
      data-sigil
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
        stroke={ember}
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
        stroke={ember}
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
        stroke={ember}
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
        fill={ember}
        opacity="0"
      />
    </svg>
  )
}

export default function Aurora({
  displayClass,
  bodyClass,
  monoClass,
}: {
  displayClass: string
  bodyClass: string
  monoClass: string
}) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.__samwiseAuroraInit) return

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
      window.__samwiseAuroraInit = true

      lenis = new Lenis({ wheelMultiplier: 0.9, lerp: 0.1 })
      gsap.ticker.add((t: number) => lenis.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)

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
          cx += (mx - cx) * 0.1
          cy += (my - cy) * 0.1
          cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
        }
        gsap.ticker.add(tickerFn)
        gsap.to(cursor, { opacity: 1, duration: 1.6, delay: 1.6, ease: "power2.out" })
        cleanupFns.push(() => {
          window.removeEventListener("mousemove", onMove)
          gsap.ticker.remove(tickerFn)
        })
      } else if (cursor) {
        cursor.style.display = "none"
      }

      // ── Dawn intro: atmosphere brightens, sigil draws, headline materializes
      const dawn = document.querySelector("[data-dawn]")
      const sigilStrokes = document.querySelectorAll("[data-sigil] .sigil-stroke")
      const sigilDot = document.querySelector("[data-sigil] .sigil-dot")
      const heroBlocks = gsap.utils.toArray<HTMLElement>("[data-hero-fade]")

      const intro = gsap.timeline()

      if (dawn) {
        intro.fromTo(
          dawn,
          { opacity: 0 },
          { opacity: 1, duration: 2.6, ease: "power2.out" },
          0
        )
      }

      if (sigilStrokes.length) {
        intro.to(
          sigilStrokes,
          {
            strokeDashoffset: 0,
            duration: 1.8,
            stagger: 0.2,
            ease: "expo.out",
          },
          0.4
        )
      }
      if (sigilDot) {
        intro.to(sigilDot, { opacity: 1, duration: 0.8, ease: "power2.out" }, ">-0.4")
      }

      if (heroBlocks.length) {
        intro.from(
          heroBlocks,
          {
            opacity: 0,
            y: 14,
            duration: 1.6,
            stagger: 0.4,
            ease: "power2.out",
          },
          0.8
        )
      }

      // gentle parallax: the constellation drifts at half scroll-rate.
      const constellation = document.querySelector<HTMLElement>("[data-constellation]")
      if (constellation) {
        const onScroll = () => {
          const rect = constellation.getBoundingClientRect()
          const vh = window.innerHeight
          // -1 (well above) to 1 (well below)
          const norm = (rect.top + rect.height / 2 - vh / 2) / vh
          const drift = norm * 36 // px
          constellation.style.transform = `translateY(${drift}px)`
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        cleanupFns.push(() => window.removeEventListener("scroll", onScroll))
      }

      cleanupFns.push(() => {
        if (lenis) lenis.destroy()
        window.__samwiseAuroraInit = false
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
        :root { color-scheme: dark; }
        html, body { background: ${bg}; margin: 0; padding: 0; }
        body { overflow-x: hidden; color: ${ink}; }
        ::selection { background: ${ember}; color: ${bg}; }

        /* ── persistent atmosphere — fixed to the viewport ── */
        .dawn {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(1400px 900px at 18% 12%, rgba(212,163,115,0.16), rgba(212,163,115,0) 55%),
            radial-gradient(1100px 800px at 84% 68%, rgba(168,114,69,0.18), rgba(168,114,69,0) 55%),
            radial-gradient(900px 700px at 50% 110%, rgba(212,163,115,0.10), rgba(212,163,115,0) 60%),
            linear-gradient(180deg, ${bg} 0%, ${bgWarm} 38%, ${bg} 100%);
        }

        .stars {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 12% 8%, rgba(244,233,212,0.55), transparent 50%),
            radial-gradient(1px 1px at 68% 14%, rgba(244,233,212,0.45), transparent 55%),
            radial-gradient(1.5px 1.5px at 32% 22%, rgba(212,163,115,0.5), transparent 55%),
            radial-gradient(1px 1px at 88% 6%, rgba(244,233,212,0.4), transparent 55%),
            radial-gradient(1px 1px at 5% 30%, rgba(244,233,212,0.35), transparent 60%),
            radial-gradient(1px 1px at 47% 4%, rgba(244,233,212,0.5), transparent 50%),
            radial-gradient(1px 1px at 76% 36%, rgba(244,233,212,0.3), transparent 55%),
            radial-gradient(1.5px 1.5px at 22% 12%, rgba(212,163,115,0.45), transparent 55%);
          opacity: 0.7;
          mask-image: linear-gradient(180deg, black 0%, black 35%, transparent 65%);
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 35%, transparent 65%);
          animation: starbreathe 14s ease-in-out infinite;
        }
        @keyframes starbreathe {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.82; }
        }

        .embers {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .ember {
          position: absolute;
          bottom: -10%;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: ${ember};
          box-shadow: 0 0 6px ${ember}, 0 0 12px rgba(212,163,115,0.4);
          opacity: 0;
          animation-name: emberRise;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        @keyframes emberRise {
          0%   { transform: translate(0, 0) scale(0.7); opacity: 0; }
          10%  { opacity: 0.9; }
          80%  { opacity: 0.5; }
          100% { transform: translate(var(--drift), -110vh) scale(1.2); opacity: 0; }
        }

        .grain {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.07;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.96  0 0 0 0 0.91  0 0 0 0 0.83  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(13,6,8,0.6) 100%);
        }

        .cursor-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,163,115,0.18), rgba(212,163,115,0.05) 45%, rgba(212,163,115,0) 70%);
          pointer-events: none;
          opacity: 0;
          z-index: 2;
          mix-blend-mode: screen;
          will-change: transform;
        }

        /* ── content ── */
        main {
          position: relative;
          z-index: 3;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 6vw;
        }

        .pool {
          position: relative;
        }
        .pool::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 120%;
          height: 220%;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse at center, rgba(212,163,115,0.08), rgba(212,163,115,0) 60%);
          z-index: -1;
          pointer-events: none;
        }

        /* ── opening ── */
        .opening {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14vh 0 6vh;
          gap: 2.4rem;
        }
        .wordmark {
          font-family: var(--font-display), serif;
          font-size: 0.78rem;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: ${inkSoft};
        }
        .opening-display {
          font-family: var(--font-display), serif;
          font-size: clamp(2.6rem, 6.4vw, 5.4rem);
          font-weight: 400;
          letter-spacing: 0.005em;
          line-height: 1.05;
          color: ${ink};
          margin: 0;
          max-width: 14ch;
        }
        .opening-display em {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-weight: 300;
          color: ${ember};
          font-size: 0.78em;
          letter-spacing: 0;
        }
        .opening-prose {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.18rem;
          line-height: 1.65;
          color: ${inkSoft};
          max-width: 56ch;
          margin: 0 auto;
          font-weight: 400;
        }
        .opening-prose strong {
          color: ${ink};
          font-weight: 500;
        }

        /* ── constellation ── */
        .constellation-zone {
          position: relative;
          padding: 16vh 0 18vh;
        }
        .constellation-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: ${ember};
          opacity: 0.78;
          margin: 0 0 1.6rem;
          font-weight: 300;
        }
        .constellation-display {
          font-family: var(--font-display), serif;
          font-size: clamp(1.8rem, 3.6vw, 3rem);
          font-weight: 400;
          line-height: 1.2;
          color: ${ink};
          margin: 0 0 6vh;
          max-width: 22ch;
        }
        .constellation {
          position: relative;
          width: 100%;
          height: 70vh;
          min-height: 480px;
        }
        .star {
          position: absolute;
          font-family: var(--font-body), serif;
          font-style: italic;
          font-weight: 400;
          color: ${ink};
          line-height: 1.35;
          white-space: pre-line;
          padding-left: 22px;
          transition: color 0.6s, transform 0.6s;
        }
        .star::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${ember};
          box-shadow: 0 0 10px ${ember}, 0 0 20px rgba(212,163,115,0.5);
        }
        .star:hover { color: ${ember}; transform: translateY(-2px); }

        .constellation-aside {
          position: absolute;
          right: 0;
          bottom: -2rem;
          max-width: 36ch;
          font-family: var(--font-body), serif;
          font-style: italic;
          color: ${inkSoft};
          font-size: 1.05rem;
          line-height: 1.6;
          text-align: right;
        }

        /* ── promise (asymmetric) ── */
        .promise-zone {
          padding: 14vh 0;
          display: grid;
          grid-template-columns: 5fr 4fr;
          gap: 4vw;
          align-items: end;
        }
        .promise-zone .left {
          grid-column: 1;
        }
        .promise-zone .right {
          grid-column: 2;
          align-self: center;
          padding-left: 2vw;
          border-left: 1px solid ${inkGhost};
        }
        .promise-display {
          font-family: var(--font-display), serif;
          font-size: clamp(2rem, 4.4vw, 3.6rem);
          line-height: 1.15;
          color: ${ink};
          margin: 0;
          font-weight: 400;
        }
        .promise-display em {
          font-family: var(--font-body), serif;
          font-style: italic;
          color: ${ember};
          font-weight: 400;
        }
        .promise-aside {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.18rem;
          line-height: 1.55;
          color: ${inkSoft};
          margin: 0;
        }
        .samwise-name {
          font-family: var(--font-display), serif;
          font-size: 1.6rem;
          letter-spacing: 0.04em;
          color: ${ember};
          margin-top: 1.2rem;
          display: inline-block;
        }
        @media (max-width: 820px) {
          .promise-zone { grid-template-columns: 1fr; gap: 3rem; }
          .promise-zone .right { padding-left: 0; border-left: none; padding-top: 1.6rem; border-top: 1px solid ${inkGhost}; }
        }

        /* ── mechanism ── */
        .mechanism-zone {
          padding: 18vh 0 16vh;
          text-align: center;
        }
        .mechanism-display {
          font-family: var(--font-display), serif;
          font-size: clamp(2rem, 4.6vw, 3.6rem);
          line-height: 1.15;
          color: ${ink};
          margin: 0 auto;
          max-width: 18ch;
          font-weight: 400;
        }
        .mechanism-display em {
          font-family: var(--font-body), serif;
          font-style: italic;
          color: ${ember};
          font-weight: 400;
        }

        /* ── path (cascading rites) ── */
        .path-zone {
          padding: 12vh 0 14vh;
        }
        .path-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: ${ember};
          opacity: 0.78;
          margin: 0 0 1.6rem;
          font-weight: 300;
        }
        .path-question {
          font-family: var(--font-display), serif;
          font-size: clamp(1.8rem, 3.8vw, 3.2rem);
          line-height: 1.2;
          color: ${ink};
          margin: 0 0 8vh;
          max-width: 20ch;
          font-weight: 400;
        }
        .rites {
          display: flex;
          flex-direction: column;
          gap: 4vh;
        }
        .rite {
          position: relative;
          max-width: 56ch;
          padding: 1.2rem 1.6rem 1.6rem 2rem;
          border-left: 1px solid ${inkFaint};
        }
        .rite:nth-child(1) { margin-left: 0; }
        .rite:nth-child(2) { margin-left: 12vw; }
        .rite:nth-child(3) { margin-left: 24vw; }
        .rite::before {
          content: "";
          position: absolute;
          left: -0.8rem;
          top: 1.4rem;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, ${ember} 0%, rgba(212,163,115,0) 70%);
          box-shadow: 0 0 14px ${ember};
        }
        .rite-num {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${ember};
          margin-bottom: 0.7rem;
          font-weight: 300;
        }
        .rite-title {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.5rem;
          color: ${ink};
          margin-bottom: 0.6rem;
          line-height: 1.3;
          font-weight: 400;
        }
        .rite-body {
          font-family: var(--font-body), serif;
          font-size: 1.06rem;
          color: ${inkSoft};
          line-height: 1.7;
        }
        .rite-sub {
          margin-top: 0.9rem;
          padding-left: 0.5rem;
          font-family: var(--font-body), serif;
          color: ${inkSoft};
          font-size: 1rem;
          line-height: 1.7;
        }
        .rite-sub div::before {
          content: "↳ ";
          color: ${ember};
          opacity: 0.7;
        }
        @media (max-width: 720px) {
          .rite:nth-child(2), .rite:nth-child(3) { margin-left: 0; }
        }

        /* ── threshold (doorways) ── */
        .threshold-zone {
          padding: 14vh 0 12vh;
          text-align: center;
        }
        .threshold-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: ${ember};
          opacity: 0.78;
          margin: 0 0 1.4rem;
          font-weight: 300;
        }
        .threshold-prompt {
          font-family: var(--font-display), serif;
          font-size: clamp(1.7rem, 3.2vw, 2.6rem);
          color: ${ink};
          margin: 0 0 5vh;
          font-weight: 400;
        }
        .doorways {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3vw;
          max-width: 920px;
          margin: 0 auto;
        }
        .doorway {
          position: relative;
          display: block;
          padding: 3.2rem 2rem 2.4rem;
          border: 1px solid ${inkGhost};
          border-radius: 4px;
          text-decoration: none;
          color: ${ink};
          background:
            radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.18), rgba(212,163,115,0) 70%),
            linear-gradient(180deg, rgba(244,233,212,0.025), rgba(244,233,212,0) 100%);
          transition: border-color 0.7s, transform 0.7s, background 0.7s;
          overflow: hidden;
        }
        .doorway::after {
          content: "";
          position: absolute;
          left: 0; right: 0; top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${ember}, transparent);
          opacity: 0.4;
          transition: opacity 0.7s;
        }
        .doorway:hover {
          border-color: ${ember};
          transform: translateY(-4px);
          background:
            radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.32), rgba(212,163,115,0) 70%),
            linear-gradient(180deg, rgba(244,233,212,0.04), rgba(244,233,212,0) 100%);
        }
        .doorway:hover::after { opacity: 1; }
        .doorway-name {
          font-family: var(--font-display), serif;
          font-size: 1.5rem;
          line-height: 1.25;
          margin-bottom: 1rem;
          color: ${ink};
          letter-spacing: 0.02em;
        }
        .doorway-meta {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${inkSoft};
          line-height: 1.7;
          font-weight: 300;
        }
        @media (max-width: 720px) {
          .doorways { grid-template-columns: 1fr; gap: 1.6rem; }
        }

        /* ── witness (haloed icon) ── */
        .witness-zone {
          padding: 16vh 0 14vh;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 4vw;
          align-items: center;
          max-width: 980px;
          margin: 0 auto;
        }
        .witness-portrait-wrap {
          position: relative;
          width: 220px;
          height: 220px;
          margin: 0 auto;
        }
        .witness-portrait-wrap::before {
          content: "";
          position: absolute;
          inset: -36px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,163,115,0.30), rgba(212,163,115,0) 65%);
          z-index: 0;
          animation: halo 9s ease-in-out infinite;
        }
        @keyframes halo {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.06); }
        }
        .witness-portrait {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid ${inkFaint};
          z-index: 1;
        }
        .witness-portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.18) sepia(0.22) brightness(0.96);
        }
        .witness-text {
          position: relative;
        }
        .witness-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 0.66rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: ${ember};
          opacity: 0.8;
          margin: 0 0 1.2rem;
          font-weight: 300;
        }
        .witness-intro {
          font-family: var(--font-body), serif;
          font-style: italic;
          font-size: 1.18rem;
          color: ${inkSoft};
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        .witness-name {
          font-family: var(--font-display), serif;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          color: ${ink};
          margin: 0 0 1rem;
          letter-spacing: 0.01em;
          line-height: 1.15;
          font-weight: 400;
        }
        .witness-credit {
          font-family: var(--font-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${inkSoft};
          line-height: 2;
          font-weight: 300;
        }
        @media (max-width: 820px) {
          .witness-zone { grid-template-columns: 1fr; gap: 2rem; text-align: center; }
          .witness-text { text-align: center; }
        }

        /* ── closing ── */
        .closing {
          padding: 14vh 0 18vh;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.4rem;
        }
        .closing-display {
          font-family: var(--font-display), serif;
          font-size: clamp(2.4rem, 5vw, 4rem);
          color: ${ink};
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .closing-meta {
          font-family: var(--font-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: ${inkFaint};
          font-weight: 300;
        }
      `}</style>

      {/* atmosphere */}
      <div data-cursor className="cursor-glow" aria-hidden />
      <div data-dawn className="dawn" aria-hidden />
      <div className="stars" aria-hidden />
      <div className="embers" aria-hidden>
        {EMBERS.map((e) => (
          <span
            key={e.key}
            className="ember"
            style={{
              left: `${e.x}%`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              ["--drift" as any]: `${e.drift}vw`,
            }}
          />
        ))}
      </div>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      <main ref={rootRef} className={bodyClass}>
        {/* ─── OPENING ─── */}
        <section className="opening pool">
          <div data-hero-fade>
            <Sigil size={56} />
          </div>
          <div data-hero-fade className={`wordmark ${displayClass}`}>
            Samwise
          </div>
          <h1 data-hero-fade className={`opening-display ${displayClass}`}>
            We will not let go <em>until you are clear.</em>
          </h1>
          <p data-hero-fade className="opening-prose">
            We are a team of <strong>mental health professionals</strong>,
            <strong> spiritual guidance practitioners</strong>, and
            <strong> technology experts</strong> — building a definitive solution
            to overcome the toughest, untreated and most insidious behavioural
            challenges we have faced in our lives, the lives of our loved ones,
            and in the lives of our patients.
          </p>
        </section>

        {/* ─── CONSTELLATION ─── */}
        <section className="constellation-zone">
          <p className={`constellation-eyebrow`}>★ what stays in the dark</p>
          <h2 className={`constellation-display ${displayClass}`}>
            The behaviours that hold us — out of our own control.
          </h2>
          <div data-constellation className="constellation">
            {CONSTELLATION.map((s, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: `${1.2 * s.scale}rem`,
                }}
              >
                {s.text}
              </div>
            ))}
            <p className="constellation-aside">
              — and many more. Each one a behaviour out of the patient&apos;s
              control. Each one held quietly, for years, without resolution.
            </p>
          </div>
        </section>

        {/* ─── PROMISE ─── */}
        <section className="promise-zone pool">
          <div className="left">
            <h2 className={`promise-display ${displayClass}`}>
              A solution that <em>remains with you</em> at all times of your
              journey — and will not let go until you are completely cleared.
            </h2>
          </div>
          <div className="right">
            <p className="promise-aside">
              We are building this for the people who have tried everything.
              For ourselves. For the ones we love.
            </p>
            <span className={`samwise-name ${displayClass}`}>We call it Samwise.</span>
          </div>
        </section>

        {/* ─── MECHANISM ─── */}
        <section className="mechanism-zone">
          <h2 className={`mechanism-display ${displayClass}`}>
            Samwise helps you act <em>against your own biology</em> — to do what
            you need to do.
          </h2>
        </section>

        {/* ─── PATH ─── */}
        <section className="path-zone">
          <p className={`path-eyebrow`}>★ the path</p>
          <h2 className={`path-question ${displayClass}`}>
            How can you make Samwise part of your life?
          </h2>

          <div className="rites">
            <div className="rite">
              <div className="rite-num">step one · twenty minutes</div>
              <div className="rite-title">Schedule a Fit Assessment call.</div>
              <div className="rite-body">
                All your questions about the program will be answered here. The
                outcome will be whether we are a good fit for your needs — or
                not.
              </div>
              <div className="rite-sub">
                <div>If we are a fit, the program starts.</div>
                <div>
                  If we are not, we will recommend you other services — so you
                  can always get help.
                </div>
              </div>
            </div>

            <div className="rite">
              <div className="rite-num">step two · ninety minutes</div>
              <div className="rite-title">
                Schedule the Problem Clarification &amp; Belief System session.
              </div>
              <div className="rite-body">
                Yes, we know — it is long. We need to make sure we do this part
                right to actually be able to help you. You will get a clear
                picture of your problem here, a clear path to a solution, and
                the first set-up of your first ritual and AI Agent for your
                calls.
              </div>
            </div>

            <div className="rite">
              <div className="rite-num">step three · the days that follow</div>
              <div className="rite-title">You will start your ritual.</div>
              <div className="rite-body">
                We will monitor your progress, so we can schedule an
                optimization session to help you achieve progress faster.
              </div>
            </div>
          </div>
        </section>

        {/* ─── THRESHOLD ─── */}
        <section className="threshold-zone">
          <p className={`threshold-eyebrow`}>★ the threshold</p>
          <h2 className={`threshold-prompt ${displayClass}`}>
            Schedule your call.
          </h2>

          <div className="doorways">
            <a className="doorway" href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment">
              <div className={`doorway-name ${displayClass}`}>Fit Assessment</div>
              <div className="doorway-meta">
                start here, if it&apos;s your first time
              </div>
            </a>
            <a className="doorway" href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief">
              <div className={`doorway-name ${displayClass}`}>
                Problem Clarification
                <br />
                &amp; Belief System
              </div>
              <div className="doorway-meta">
                only after the fit assessment, or for current subscribers
              </div>
            </a>
          </div>
        </section>

        {/* ─── WITNESS ─── */}
        <section className="witness-zone">
          <div className="witness-portrait-wrap">
            <div className="witness-portrait">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
                alt="Dr. Ana María Reyes Tirado"
              />
            </div>
          </div>
          <div className="witness-text">
            <p className={`witness-eyebrow`}>★ designed with</p>
            <p className="witness-intro">
              The Samwise program has been designed with the close advice of —
            </p>
            <h3 className={`witness-name ${displayClass}`}>
              Dr. Ana María Reyes Tirado
            </h3>
            <p className="witness-credit">
              Specialist in Neurofeedback · New Wind Academy, USA
              <br />
              Clinical Director · Fundación Syncronía
            </p>
          </div>
        </section>

        {/* ─── CLOSING ─── */}
        <section className="closing">
          <Sigil size={48} />
          <h2 className={`closing-display ${displayClass}`}>Estamos aquí.</h2>
          <p className={`closing-meta`}>we are here</p>
        </section>
      </main>
    </>
  )
}
