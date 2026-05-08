"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import "./styles.css"

type Lang = "en" | "es"

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
    stepsLabel: "How can you make Samwise part of your life?",
    step1Title: "Schedule a Fit Assessment call.",
    step1Body: "It will last 30 minutes. All the questions about the program will be answered here. The outcome will be whether we are a good fit for your needs or not.",
    step1ListIfFit: "If we are a fit, program starts!",
    step1ListIfNot: "If we are not, don't worry! We will recommend you other services, so you can always get help.",
    step2Title: "Schedule the Problem Clarification and Belief System session.",
    step2Body: "It will last 90 minutes. (Yes we know, it is long. We need to make sure we do this part right to actually be able to help you). You will get a clear picture of your problem here, a clear path to a solution, and the first set up of your first ritual and AI Agent for your calls.",
    step3Title: "You will start your ritual.",
    step3Body: "We will monitor your progress, so we can schedule an optimization session to help you achieve progress faster.",
    step1Cta: "Schedule here",
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
    stepsLabel: "¿Cómo puedes hacer parte de tu vida a Samwise?",
    step1Title: "Agenda una llamada de Evaluación de Ajuste.",
    step1Body: "Durará 30 minutos. Todas las preguntas sobre el programa se responderán aquí. El resultado será determinar si somos un buen ajuste para tus necesidades o no.",
    step1ListIfFit: "Si somos un buen ajuste, ¡el programa comienza!",
    step1ListIfNot: "Si no lo somos, ¡no te preocupes! Te recomendaremos otros servicios, para que siempre puedas recibir ayuda.",
    step2Title: "Agenda la sesión de Clarificación del Problema y Sistema de Creencias.",
    step2Body: "Durará 90 minutos. (Sí, sabemos que es larga. Necesitamos hacer esta parte bien para poder ayudarte de verdad). Aquí obtendrás una imagen clara de tu problema, un camino claro hacia una solución, y la primera configuración de tu primer ritual y Agente de IA para tus llamadas.",
    step3Title: "Comenzarás tu ritual.",
    step3Body: "Monitorearemos tu progreso, para poder agendar una sesión de optimización que te ayude a avanzar más rápido.",
    step1Cta: "Agenda aquí",
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
  },
}

/* FourPointStar — thin four-pointed sparkle (✦), ink black via
   currentColor. Subtle quadratic curves between points so it reads as
   elegant rather than geometric. Used as the navbar's collapsed state. */
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

/* FixedScene — anchor beats (hero + interp+sigs) live as fixed full-viewport
   overlays. They NEVER move; only their opacity changes. Each gets explicit
   scrollY ranges so the page choreography can be tuned freely. */
function FixedScene({
  children,
  id,
  fadeInStart,
  fadeInEnd,
  fadeOutStart,
  fadeOutEnd,
  isFirst = false,
  className = "",
}: {
  children: ReactNode
  id?: string
  fadeInStart: number
  fadeInEnd: number
  fadeOutStart: number
  fadeOutEnd: number
  isFirst?: boolean
  className?: string
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

/* PinFadeScene — for browseable beats (voice). The content sits in
   document flow and uses CSS `position: sticky` so it pins to the top
   of the viewport while the user scrolls into it. Opacity fades from
   0 to 1 over a configurable scrollY range while pinned. Once fade-in
   completes, the section's container ends and the content unpins,
   continuing to scroll naturally with the page. */
function PinFadeScene({
  children,
  id,
  fadeInStart,
  fadeInEnd,
  className = "",
}: {
  children: ReactNode
  id?: string
  fadeInStart: number
  fadeInEnd: number
  className?: string
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

/* StickyScene — section that pins via CSS sticky (top:88) without any
   section-level opacity transform. Use when child elements have their
   own scrollY-tied reveals (StepItem, ChallengeItem) and the section as
   a whole shouldn't fade as a unit. */
function StickyScene({
  children,
  id,
  className = "",
}: {
  children: ReactNode
  id?: string
  className?: string
}) {
  return (
    <section className={`pin-fade-scene ${className}`} id={id}>
      <div className="pin-fade-content">{children}</div>
    </section>
  )
}

/* StepItem — single step with scrollY-tied fade-in. Used inside a
   StickyScene so steps reveal one-by-one as the user scrolls past the
   pinned section (mirrors canonical's nth-child stagger but tied to
   scroll position rather than time). */
function StepItem({
  children,
  fadeInStart,
  fadeInEnd,
}: {
  children: ReactNode
  fadeInStart: number
  fadeInEnd: number
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.div className="step" style={{ opacity, y }}>{children}</motion.div>
  )
}

/* ViewTriggeredStep — step that fades in based on its own viewport
   position (not absolute scrollY). Uses motion's useScroll with a
   target ref + offset ["start 80%", "start 30%"], so progress is 0
   while the step's top is below 80% of the viewport, ramps to 1 when
   the step's top is at 30% of the viewport. This means:
   - During pin (step.top ~ 80% of viewport on desktop, below viewport
     on mobile), progress stays at 0 (clamped).
   - After pin releases and the user scrolls, the step's top crosses
     into the active fade zone in viewport-relative coordinates, so
     the fade is visible regardless of viewport size.
   Used for steps 2 and 3 (step 1 is handled by StepItem during pin). */
function ViewTriggeredStep({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 30%"],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [20, 0])
  return (
    <motion.div ref={ref} className="step" style={{ opacity, y }}>{children}</motion.div>
  )
}

/* FadeWrapper — generic opacity-only fade-in wrapper. No translateY —
   used for elements that should appear in place without rising motion
   (like the section-label that introduces the steps). */
function FadeWrapper({
  children,
  fadeInStart,
  fadeInEnd,
  className = "",
}: {
  children: ReactNode
  fadeInStart: number
  fadeInEnd: number
  className?: string
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  return (
    <motion.div className={className} style={{ opacity }}>{children}</motion.div>
  )
}

/* ChallengePostscript — italic paragraph that follows the challenges
   list (matches the styleless variant's pattern of "these are just a
   few examples..." sitting under the list). Fades in via scrollY-tied
   opacity right after the last list item, while the freeze pin is
   still holding the section. */
function ChallengePostscript({
  children,
  fadeInStart,
  fadeInEnd,
}: {
  children: ReactNode
  fadeInStart: number
  fadeInEnd: number
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.p className="challenge-postscript" style={{ opacity, y }}>{children}</motion.p>
  )
}

/* ChallengeItem — challenge list item with scrollY-tied fade-in. Used
   inside ChallengesFreezeScene so items reveal AFTER the freeze pin
   activates (when the user is actually looking at the pinned content),
   not earlier during the pre-pin phase when the user's eye is still on
   the pinned lede above. Opacity 0→1 and translateY(20px)→0 over
   [fadeInStart, fadeInEnd] scrollY range, mirroring canonical's
   `.reveal` rise-fade but tied to scroll position rather than viewport
   intersection. */
function ChallengeItem({
  children,
  fadeInStart,
  fadeInEnd,
}: {
  children: ReactNode
  fadeInStart: number
  fadeInEnd: number
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.li style={{ opacity, y }}>{children}</motion.li>
  )
}

/* ChallengesFreezeScene — challenges list. Section is 200vh tall (set
   in CSS); content sits at section top in natural flow. After content's
   natural top scrolls past viewport top:88, CSS `position: sticky` pins
   the content there, holding the frozen state. Items inside fade in
   sequentially via ChallengeItem (scrollY-tied, post-pin). Opacity
   fades 1 → 0 over [fadeOutStart, fadeOutEnd] scrollY range. */
function ChallengesFreezeScene({
  children,
  fadeOutStart,
  fadeOutEnd,
}: {
  children: ReactNode
  fadeOutStart: number
  fadeOutEnd: number
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
    <div className="editorial-root letter-root">
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
          <a href="/" className="brand">Samwise</a>
          <div className="nav-right">
            <a href="#us" className="nav-link">{t.navUs}</a>
            <a href="#try" className="nav-link">{t.navTry}</a>
            <a href="#advisors" className="nav-link">{t.navAdvisors}</a>
            <a href="/scientific-evidence" className="nav-link">{t.navValidation} →</a>
            <div className="lang-toggle" role="group" aria-label="Language">
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
              <span className="sep">/</span>
              <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Anchor scenes (hero, interp+sigs) live as fixed overlays — they
          don't take document space, never move, only their opacities change. */}

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
          </header>
        </div>
      </FixedScene>

      {/* Interp+sigs — fixed always (anchor beat). Lives at scrollY range
          [3.2vh, 4.1vh]. */}
      <FixedScene
        fadeInStart={vh * 3.2}
        fadeInEnd={vh * 3.5}
        fadeOutStart={vh * 3.8}
        fadeOutEnd={vh * 4.1}
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
        {/* Hero spacer — empty 100vh that pushes the rest of the doc below
            the hero overlay's scrollY range. id="us" anchors the navbar's
            "Us" link to the top of the main content. */}
        <div id="us" className="hero-spacer" aria-hidden="true" />

        {/* Voice (lede only) — pin-fade beat. Sticky content pins from
            scroll ~vh and fades in over 1.0vh–1.3vh. After fade-in the
            content unpins and scrolls naturally up. */}
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

        {/* Challenges — sticky freeze scene. Items reveal one-by-one via
            ChallengeItem after the freeze pin activates. Then opacity
            fades to 0 over [2.8vh, 3.05vh]. */}
        <ChallengesFreezeScene fadeOutStart={vh * 2.8} fadeOutEnd={vh * 3.05}>
          <div className="editorial-wrap">
            <div className="section-label">
              <span>{t.challengesLabel}</span>
            </div>
            <ol className="challenge-list">
              {/* Items reveal sequentially AFTER freeze pin activates (~2.04vh).
                  Stagger 0.08vh between items, each fades over 0.16vh.
                  Last item revealed at 2.52vh. */}
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

            {/* Postscript — italic paragraph after the list. Continues the
                stagger cadence (0.08vh after Item 5's start), so it fades
                in once Item 5 is mostly done. */}
            <ChallengePostscript fadeInStart={vh * 2.44} fadeInEnd={vh * 2.6}>
              {t.pullquote}
            </ChallengePostscript>
          </div>
        </ChallengesFreezeScene>

        {/* Steps — sticky pin (no section-level fade). Section starts
            immediately after the freeze-scene so the sticky pin activates
            during the tail of interp's fade-out. Section-label is wrapped
            in FadeWrapper so it stays invisible during the pre-pin rise
            AND during interp's fade-out — first appears together with
            Step 1 at 4.1vh. Steps 2 and 3 use ViewTriggeredStep (viewport-
            relative) so they fade in as the user scrolls past pin release. */}
        <StickyScene id="try" className="steps-section">
          <div className="editorial-wrap">
            <section className="editorial-section">
              <FadeWrapper
                className="section-label"
                fadeInStart={vh * 4.1}
                fadeInEnd={vh * 4.26}
              >
                <span>{t.stepsLabel}</span>
              </FadeWrapper>

              <StepItem fadeInStart={vh * 4.1} fadeInEnd={vh * 4.26}>
                <div className="step-number">01</div>
                <div>
                  <h3 className="step-title">{t.step1Title}</h3>
                  <div className="step-body">
                    <p>{t.step1Body}</p>
                    <ul>
                      <li>{t.step1ListIfFit}</li>
                      <li>{t.step1ListIfNot}</li>
                    </ul>
                    <p style={{ marginTop: 28 }}>
                      <a
                        className="cta cta--primary"
                        href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.step1Cta}
                      </a>
                    </p>
                  </div>
                </div>
              </StepItem>

              <ViewTriggeredStep>
                <div className="step-number">02</div>
                <div>
                  <h3 className="step-title">{t.step2Title}</h3>
                  <div className="step-body">
                    <p>{t.step2Body}</p>
                  </div>
                </div>
              </ViewTriggeredStep>

              <ViewTriggeredStep>
                <div className="step-number">03</div>
                <div>
                  <h3 className="step-title">{t.step3Title}</h3>
                  <div className="step-body">
                    <p>{t.step3Body}</p>
                  </div>
                </div>
              </ViewTriggeredStep>
            </section>
          </div>
        </StickyScene>

        {/* Advisors + footer continue in natural flow. */}
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
