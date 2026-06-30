"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { useRouter } from "next/navigation"
import "./styles.css"

type Lang = "en" | "es"

// Cross-origin destination for the inverted onboarding flow (added
// 2026-06-29). Reads NEXT_PUBLIC_SAMWISE_APP_URL (already in active
// use across landing — see /book, /meet, /api/qualify/voice-init).
// `?from=transition` is the signal flag — the app's /start route reads
// it on mount and runs its own opacity fade-in to mask the cross-
// origin white flash. The gold-star transition overlay lives in this
// document and cannot survive cross-origin navigation; this is the
// best web platforms allow.
const APP_URL = process.env.NEXT_PUBLIC_SAMWISE_APP_URL ?? "http://localhost:3000"
const startUrl = () => `${APP_URL}/start?from=transition`

const copy = {
  en: {
    eyebrow: "Samwise",
    heroH1: "If you are here, it is not by accident.",
    lede: "We are a team of mental health professionals, spiritual guidance practitioners and technology experts that want a definitive solution to overcome the toughest, untreated and most insidious behavioural challenges we have faced in our lives, the lives of our loved ones and in the lives of our patients:",
    challenges: [
      "Screens addiction.",
      "Need for approval or impulsive love seeking behaviour.",
      "Addiction to porn.",
      "Social media addiction.",
      "Destructive relationships.",
    ],
    challengesLabel: "The challenges",
    pullquote: "These are just a few examples among the many more. But all behavioural issues out of the patient's control.",
    interpHeading: "We are building a solution for this.",
    interpBody1: "A solution that remains with you at all times of your journey of getting rid of the disease of self-destruction, and will not let go until you are completely cleared. We call it Samwise.",
    interpBody2: "Samwise is a system that helps you act against your own biology to be able to do what you need to do.",
    sig1Name: "Samuel",
    sig1Title: "Founder",
    sig2Name: "Dr. Ana María Reyes Tirado",
    sig2Title: "Clinical Director",
    ctaTitle: "Find out if Samwise can break the loop.",
    ctaBody: "50 minutes. Free. We'll tell you if you're ready — and if you're not, we'll point you to someone that can get you ready.",
    ctaButton: "Start the call",
    teaserLabel: "What awaits, if we're a fit",
    teaserHeadline: ["We watch what works.", "We adapt.", "You stop fighting alone."],
    teaserStep2: "A 150-minute session maps exactly how the loop runs in you — and ends with an AI that calls you, every day, to make it easy for you to keep yourself out of it.",
    teaserStep3: "As soon as the loop creeps back, we open another consultation — fine-tuning the ritual or your daily call until it works for you. Always included, always works.",
    authorLabel: "Clinical advisor",
    authorIntro: "The Samwise program has been designed with the close advice of",
    authorName: "Dr. Ana María Reyes Tirado",
    authorCred1: "Specialist in Neurofeedback of New Wind Academy, USA.",
    authorCred2: "Clinical Director of Fundación Syncronía.",
    navUs: "Us",
    navTry: "Try",
    navAdvisors: "Advisors",
    navValidation: "Scientific Evidence",
    footer: "Last updated · May 2026",
    quietCtaLabel: "Book your Breakthrough Call",
    dualCtaStart: "Start now",
    dualCtaDiscover: "Discover Samwise",
    navStartNow: "Start now",
  },
  es: {
    eyebrow: "Samwise",
    heroH1: "Si estás aquí, no es por accidente.",
    lede: "Somos un equipo de profesionales de salud mental, guías de acompañamiento espiritual y expertos en tecnología que buscamos una solución definitiva para superar los desafíos conductuales más duros, más desatendidos y más insidiosos que hemos enfrentado en nuestras vidas, en las de nuestros seres queridos y en las de nuestros pacientes:",
    challenges: [
      "Adicción a las pantallas.",
      "Necesidad de aprobación o búsqueda impulsiva de amor.",
      "Adicción a la pornografía.",
      "Adicción a las redes sociales.",
      "Relaciones destructivas.",
    ],
    challengesLabel: "Los desafíos",
    pullquote: "Estos son apenas algunos ejemplos entre muchos otros. Pero todos son problemas conductuales fuera del control del paciente.",
    interpHeading: "Estamos construyendo una solución para esto.",
    interpBody1: "Una solución que permanece contigo en todo momento de tu camino para librarte de la enfermedad de la autodestrucción, y que no te soltará hasta que estés completamente libre. La llamamos Samwise.",
    interpBody2: "Samwise es un sistema que te ayuda a actuar en contra de tu propia biología para poder hacer lo que necesitas hacer.",
    sig1Name: "Samuel",
    sig1Title: "Fundador",
    sig2Name: "Dra. Ana María Reyes Tirado",
    sig2Title: "Directora Clínica",
    ctaTitle: "Descubre si Samwise puede romper el ciclo.",
    ctaBody: "50 minutos. Gratis. Te diremos si estás listo — y si no, te indicaremos a alguien que pueda ayudarte a estarlo.",
    ctaButton: "Empieza la llamada",
    teaserLabel: "Lo que viene después, si encajamos",
    teaserHeadline: ["Observamos qué funciona.", "Adaptamos.", "Dejas de luchar solo."],
    teaserStep2: "Una sesión de 150 minutos traza cómo se ejecuta el ciclo en ti — y termina con una IA que te llama, cada día, para que te sea fácil mantenerte fuera de él.",
    teaserStep3: "En cuanto el ciclo vuelve a colarse, abrimos otra consulta — afinando el ritual o tu llamada diaria hasta que funcione para ti. Siempre incluida, siempre funciona.",
    authorLabel: "Asesoría clínica",
    authorIntro: "El programa Samwise ha sido diseñado con la asesoría cercana de",
    authorName: "Dra. Ana María Reyes Tirado",
    authorCred1: "Especialista en Neurofeedback de New Wind Academy, EE. UU.",
    authorCred2: "Directora Clínica de la Fundación Syncronía.",
    navUs: "Nosotros",
    navTry: "Probar",
    navAdvisors: "Asesores",
    navValidation: "Evidencia Científica",
    footer: "Última actualización · Mayo 2026",
    quietCtaLabel: "Reserva tu Llamada de Avance",
    dualCtaStart: "Empieza ahora",
    dualCtaDiscover: "Descubre Samwise",
    navStartNow: "Empieza ahora",
  },
}

/* FourPointStar — thin four-pointed sparkle. */
function FourPointStar({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="four-point-star"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

function SignatureUnderline({ variant }: { variant: 1 | 2 }) {
  const path =
    variant === 1
      ? "M2 6 Q 24 2, 48 4 T 96 5"
      : "M3 5 Q 22 7, 46 4 T 95 6"
  return (
    <svg
      className="sig-underline"
      viewBox="0 0 100 8"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function useViewportHeight() {
  const [vh, setVh] = useState(800)
  useEffect(() => {
    const update = () => setVh(window.innerHeight)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return vh
}

function FixedScene({
  children, id, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, isFirst = false, className = "",
}: {
  children: ReactNode; id?: string; fadeInStart: number; fadeInEnd: number;
  fadeOutStart: number; fadeOutEnd: number; isFirst?: boolean; className?: string;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(
    scrollY,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [isFirst ? 1 : 0, 1, 1, 0]
  )
  return (
    <motion.section className={`fixed-scene ${className}`} id={id} style={{ opacity }}>
      <div className="fixed-scene-inner">{children}</div>
    </motion.section>
  )
}

function PinFadeScene({
  children, id, fadeInStart, fadeInEnd, className = "",
}: {
  children: ReactNode; id?: string; fadeInStart: number; fadeInEnd: number; className?: string;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  return (
    <section className={`pin-fade-scene ${className}`} id={id}>
      <motion.div className="pin-fade-content" style={{ opacity }}>
        {children}
      </motion.div>
    </section>
  )
}

function StickyScene({
  children, id, className = "",
}: {
  children: ReactNode; id?: string; className?: string;
}) {
  return (
    <section className={`pin-fade-scene ${className}`} id={id}>
      <div className="pin-fade-content">{children}</div>
    </section>
  )
}

/* CtaBlockReveal — generic motion.div with scrollY-tied opacity + rise.
   No .step className — the canonical's CTA block doesn't use the step
   grid layout, so this stays a plain container. */
function CtaBlockReveal({
  children, fadeInStart, fadeInEnd,
}: {
  children: ReactNode; fadeInStart: number; fadeInEnd: number;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.div className="cta-block" style={{ opacity, y }}>{children}</motion.div>
  )
}

/* TeaserHeadline — manifesto-style stacked headline. 3 short clauses,
   each on its own line, big Fraunces Roman with the SOFT axis (matches
   the page hero's display register). Fades in as a single block via
   viewport-relative scrollY when the section scrolls into the upper
   reading area. */
function TeaserHeadline({ lines }: { lines: readonly string[] }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [20, 0])
  return (
    <motion.h3 ref={ref} className="teaser-headline" style={{ opacity, y }}>
      {lines.map((l, i) => <span key={i}>{l}</span>)}
    </motion.h3>
  )
}

/* TeaserLine — italic preview line that fades in via viewport-relative
   scrollY (offset start 80% → start 30%), so each line transitions in
   as the user scrolls past pin release. */
function TeaserLine({
  children, className = "teaser-line",
}: {
  children: ReactNode; className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 30%"],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [20, 0])
  return (
    <motion.p ref={ref} className={className} style={{ opacity, y }}>{children}</motion.p>
  )
}

function ChallengePostscript({
  children, fadeInStart, fadeInEnd,
}: {
  children: ReactNode; fadeInStart: number; fadeInEnd: number;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.p className="challenge-postscript" style={{ opacity, y }}>{children}</motion.p>
  )
}

function ChallengeItem({
  children, fadeInStart, fadeInEnd,
}: {
  children: ReactNode; fadeInStart: number; fadeInEnd: number;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.li style={{ opacity, y }}>{children}</motion.li>
  )
}

function ChallengesFreezeScene({
  children, fadeOutStart, fadeOutEnd,
}: {
  children: ReactNode; fadeOutStart: number; fadeOutEnd: number;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(
    scrollY,
    [fadeOutStart - 1, fadeOutStart, fadeOutEnd],
    [1, 1, 0]
  )
  return (
    <section className="challenges-section editorial-section freeze-scene">
      <motion.div className="freeze-content" style={{ opacity }}>
        {children}
      </motion.div>
    </section>
  )
}

export default function EditorialHome() {
  const [lang, setLang] = useState<Lang>("en")
  const [navOpen, setNavOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const router = useRouter()

  // Discover-glow runs as a pure CSS animation. We manipulate the class
  // via ref + a forced reflow so successive clicks re-trigger cleanly
  // without React state churn (which had a re-render race against the
  // animation's lifecycle in dev).
  const discoverGlowRef = useRef<HTMLDivElement>(null)

  // Start-now click: a diffuse gold glow emanates from the navbar star.
  // The dual-cta page fades out at the same time. The glow holds at
  // peak coverage while navigation fires and /qualify mounts. /qualify
  // is fade-gated by a sessionStorage flag: it stays at opacity 0 until
  // the glow has covered the screen, then fades in as the glow contracts.
  //
  // The overlay element is appended to document.body so it survives the
  // client-side route change (Next.js swaps route segments but leaves
  // body intact).
  const handleStartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // Respect reduced motion — skip the flourish.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      window.location.href = startUrl()
      return
    }

    const starEl = document.querySelector(".nav-star") as HTMLElement | null
    if (!starEl) {
      window.location.href = startUrl()
      return
    }

    const rect = starEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    // sessionStorage flag retired 2026-06-29 — cross-origin navigation
    // to app.samwise.life means the receiving app can't read this
    // origin's storage. Signal moved to the `?from=transition` URL
    // param the app reads on mount to fade itself in.

    // Hero fade-out + glow expansion run in parallel. Cross-origin
    // navigation at t=525ms = gold's peak. App's /start route reads
    // ?from=transition and runs its own opacity fade-in to mask the
    // cross-origin white flash (the overlay element lives in this
    // document and cannot survive cross-origin nav).
    setIsLeaving(true)

    const GLOW_DURATION_MS = 1500

    const overlay = document.createElement("div")
    overlay.setAttribute("data-qualify-transition-overlay", "")
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "9999",
      // Ultra-diffuse radial gradient — tiny solid core, long graded
      // falloff with multiple soft stops, transparent well before the
      // element's edges. Paired with a generous blur to dissolve any
      // hint of a bounding shape.
      background: `radial-gradient(circle at ${cx}px ${cy}px, #D4A85A 0%, rgba(212, 168, 90, 0.85) 14%, rgba(212, 168, 90, 0.55) 32%, rgba(212, 168, 90, 0.25) 55%, rgba(212, 168, 90, 0) 80%)`,
      transformOrigin: `${cx}px ${cy}px`,
      filter: "blur(80px)",
      willChange: "transform, opacity, filter",
      opacity: "0",
      transform: "scale(0.05)",
    } as Partial<CSSStyleDeclaration>)
    document.body.appendChild(overlay)

    const animation = overlay.animate(
      [
        { transform: "scale(0.05)", opacity: 0, offset: 0 },
        { transform: "scale(1.4)", opacity: 1, offset: 0.35 },
        { transform: "scale(1.4)", opacity: 1, offset: 0.55 },
        { transform: "scale(0.05)", opacity: 0, offset: 1 },
      ],
      { duration: GLOW_DURATION_MS, easing: "ease-in-out", fill: "forwards" },
    )

    // Navigate at the glow's peak so the cross-origin white flash
    // happens while the gold is at full coverage. window.location.href
    // (NOT router.push) because we're crossing origins.
    setTimeout(() => {
      window.location.href = startUrl()
    }, GLOW_DURATION_MS * 0.35)

    animation.finished
      .then(() => overlay.remove())
      .catch(() => overlay.remove())
  }

  const handleDiscoverClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
    }
    const el = discoverGlowRef.current
    if (el) {
      el.classList.remove("is-active")
      // Force reflow so a subsequent re-add of the class restarts the animation.
      void el.offsetWidth
      el.classList.add("is-active")
    }
  }
  const t = copy[lang]

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
      { threshold: 0.12 }
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lang])

  const midParts = t.interpBody1.split("Samwise")
  const vh = useViewportHeight()


  return (
    <div className={`editorial-root letter-root tease-root${isLeaving ? " is-leaving" : ""}`}>
      <div ref={discoverGlowRef} className="discover-glow" aria-hidden="true" />
      <nav
        className={`editorial-nav editorial-nav--fixed editorial-nav--star ${navOpen ? "is-open" : "is-closed"}`}
        onMouseEnter={() => setNavOpen(true)}
        onMouseLeave={() => setNavOpen(false)}
      >
        <button
          className="nav-star"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
        >
          <FourPointStar />
        </button>

        <div className="nav-content" aria-hidden={!navOpen}>
          <a href="/" className="brand">
            Samwise
            <span className="brand-star" aria-hidden="true">
              <FourPointStar size={8} />
            </span>
          </a>
          <div className="nav-right">
            <a href={startUrl()} className="nav-link" onClick={handleStartClick}>{t.navStartNow}</a>
            <a href="#us" className="nav-link">{t.navUs}</a>
            <a href="#try" className="nav-link">{t.navTry}</a>
            <a href="/scientific-evidence" className="nav-link">{t.navValidation} →</a>
            <div className="lang-toggle" role="group" aria-label="Language">
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
              <span className="sep">/</span>
              <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      <FixedScene
        isFirst
        fadeInStart={0}
        fadeInEnd={1}
        fadeOutStart={vh * 0.5}
        fadeOutEnd={vh * 0.85}
      >
        <div className="editorial-wrap">
          <header className="editorial-landing-hero">
            <div className="eyebrow">{t.eyebrow}</div>
            <h1 className="editorial-hero-statement">{t.heroH1}</h1>
            <div className="dual-cta-row">
              <a className="cta cta--primary" href={startUrl()} onClick={handleStartClick}>
                <span className="cta-text">{t.dualCtaStart}</span>
              </a>
              <a
                className="cta cta--primary"
                href="#voice"
                onClick={handleDiscoverClick}
              >
                <span className="cta-text">{t.dualCtaDiscover}</span>
              </a>
            </div>
          </header>
        </div>
      </FixedScene>

      <FixedScene
        fadeInStart={vh * 3.2}
        fadeInEnd={vh * 3.5}
        fadeOutStart={vh * 4.0}
        fadeOutEnd={vh * 4.3}
      >
        <div className="editorial-wrap">
          <section className="interpretation">
            <h2 className="interp-heading">{t.interpHeading}</h2>
            <div className="interp-body">
              <p>
                {midParts[0]}
                <strong>Samwise</strong>
                {midParts[1] ?? ""}
              </p>
              <div className="pullquote">{t.pullquote}</div>
              <p>{t.interpBody2}</p>

              <footer className="letter-signature">
                <div className="sig">
                  <span className="sig-name">{t.sig1Name}</span>
                  <SignatureUnderline variant={1} />
                  <span className="sig-title">{t.sig1Title}</span>
                </div>
                <div className="sig">
                  <span className="sig-name">{t.sig2Name}</span>
                  <SignatureUnderline variant={2} />
                  <span className="sig-title">{t.sig2Title}</span>
                </div>
              </footer>
            </div>
          </section>
        </div>
      </FixedScene>

      <main className="letter-main">
        <div id="us" className="hero-spacer" aria-hidden="true" />

        {/* Lede snap anchor — invisible 1px element at hero-spacer's bottom
            (doc Y = 1.0vh on any viewport). With scroll-snap-stop:always
            and scroll-margin-top:-30vh, the browser snaps scroll to
            1.0vh − (-30vh) = 1.3vh, exactly when the lede's fade-in
            completes. Mirrors the interp-snap-anchor below the freeze. */}
        <PinFadeScene
          id="voice"
          className="voice-section"
          fadeInStart={vh * 1.0}
          fadeInEnd={vh * 1.3}
        >
          <div className="editorial-wrap">
            <header className="editorial-landing-hero voice-hero">
              <div className="eyebrow">{t.eyebrow}</div>
              <p className="lede">{t.lede}</p>
            </header>
          </div>
        </PinFadeScene>

        <ChallengesFreezeScene fadeOutStart={vh * 2.8} fadeOutEnd={vh * 3.05}>
          <div className="editorial-wrap">
            <div className="section-label">
              <span>{t.challengesLabel}</span>
            </div>
            <ol className="challenge-list">
              {t.challenges.map((c, i) => (
                <ChallengeItem
                  key={i}
                  fadeInStart={vh * (2.04 + i * 0.08)}
                  fadeInEnd={vh * (2.04 + i * 0.08 + 0.16)}
                >
                  {c}
                </ChallengeItem>
              ))}
            </ol>
            <ChallengePostscript fadeInStart={vh * 2.44} fadeInEnd={vh * 2.6}>
              {t.pullquote}
            </ChallengePostscript>
          </div>
        </ChallengesFreezeScene>

        <div className="interp-snap-anchor" aria-hidden="true" />

        {/* CTA — single block, pinned and faded in. The teaser block
            below sits in natural flow as a separate "what awaits"
            preview in lesser hierarchy. */}
        <StickyScene id="try" className="steps-section">
          <div className="editorial-wrap">
            <section className="editorial-section">
              <CtaBlockReveal fadeInStart={vh * 4.3} fadeInEnd={vh * 4.46}>
                <h2 className="cta-title">{t.ctaTitle}</h2>
                <p className="cta-body">{t.ctaBody}</p>
                <p className="cta-action">
                  <a
                    className="cta cta--primary"
                    href={startUrl()}
                    onClick={handleStartClick}
                  >
                    <span className="cta-text">{t.ctaButton}</span>
                  </a>
                </p>
              </CtaBlockReveal>
            </section>
          </div>
        </StickyScene>

        {/* Teaser — what comes after, in a smaller editorial register.
            Sits in natural flow after the CTA's pin releases, so the
            user only acts on one thing (the Breakthrough Call) but glimpses
            the journey. The manifesto headline carries the section's
            main message. */}
        <div className="editorial-wrap">
          <section className="editorial-section teaser-section">
            <TeaserLine className="teaser-label">{t.teaserLabel}</TeaserLine>
            <TeaserHeadline lines={t.teaserHeadline} />
            <TeaserLine>{t.teaserStep2}</TeaserLine>
            <TeaserLine>{t.teaserStep3}</TeaserLine>
          </section>
        </div>

        <div className="editorial-wrap">
          <section id="advisors" className="editorial-section">
            <div className="author-panel reveal">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
                alt={t.authorName}
              />
              <div className="author-meta">
                <div className="label">{t.authorLabel}</div>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 300, fontSize: "16px", color: "var(--ink-soft)", marginBottom: "10px", fontStyle: "italic" }}>
                  {t.authorIntro}
                </p>
                <div className="name">{t.authorName}</div>
                <div className="credentials">
                  <p>{t.authorCred1}</p>
                  <p>{t.authorCred2}</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="editorial-footer">
            <span className="ornament">·</span>
            {t.footer}
          </footer>
        </div>
      </main>
    </div>
  )
}
