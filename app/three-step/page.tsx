"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import "../styles.css"

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
    step1Body: "All the questions about the program will be answered here. The outcome will be whether we are a good fit for your needs or not. It will last 30 minutes.",
    step1ListIfFit: "If we are a fit, program starts!",
    step1ListIfNot: "If we are not, don't worry! We will recommend you other services, so you can always get help.",
    step2Title: "Schedule the Problem Clarification and Belief System session.",
    step2Body: "After the session, you will start receiving daily calls on track to ensure the sustainability of your rituals and desired behaviour.",
    step2Detail: "It will last 90 minutes. You will get a clear picture of your problem here, a clear path to a solution, and the first set up of your first ritual and AI Agent for your calls.",
    step3Title: "You will start your ritual.",
    step3Body: "We will monitor your progress, so we can schedule an optimization session to help you achieve progress faster.",
    step1Cta: "Schedule here",
    step1Free: "This call is free of charge.",
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
    step1Body: "Todas las preguntas sobre el programa se responderán aquí. El resultado será determinar si somos un buen ajuste para tus necesidades o no. Durará 30 minutos.",
    step1ListIfFit: "Si somos un buen ajuste, ¡el programa comienza!",
    step1ListIfNot: "Si no lo somos, ¡no te preocupes! Te recomendaremos otros servicios, para que siempre puedas recibir ayuda.",
    step2Title: "Agenda la sesión de Clarificación del Problema y Sistema de Creencias.",
    step2Body: "Después de la sesión, comenzarás a recibir llamadas diarias de seguimiento para asegurar la sostenibilidad de tus rituales y del comportamiento deseado.",
    step2Detail: "Durará 90 minutos. Aquí obtendrás una imagen clara de tu problema, un camino claro hacia una solución, y la primera configuración de tu primer ritual y Agente de IA para tus llamadas.",
    step3Title: "Comenzarás tu ritual.",
    step3Body: "Monitorearemos tu progreso, para poder agendar una sesión de optimización que te ayude a avanzar más rápido.",
    step1Cta: "Agenda aquí",
    step1Free: "Esta llamada es gratuita.",
    authorLabel: "Asesoría clínica",
    authorIntro: "El programa Samwise ha sido diseñado con la asesoría cercana de",
    authorName: "Dra. Ana María Reyes Tirado",
    authorCred1: "Especialista en Neurofeedback of New Wind Academy, EE. UU.",
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

function StepItem({
  children, fadeInStart, fadeInEnd,
}: {
  children: ReactNode; fadeInStart: number; fadeInEnd: number;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  const y = useTransform(scrollY, [fadeInStart, fadeInEnd], [20, 0])
  return (
    <motion.div className="step" style={{ opacity, y }}>{children}</motion.div>
  )
}

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

function FadeWrapper({
  children, fadeInStart, fadeInEnd, className = "",
}: {
  children: ReactNode; fadeInStart: number; fadeInEnd: number; className?: string;
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  return (
    <motion.div className={className} style={{ opacity }}>{children}</motion.div>
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

export default function ThreeStepHome() {
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
          <a href="/three-step" className="brand">Samwise</a>
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

        <StickyScene id="try" className="steps-section">
          <div className="editorial-wrap">
            <section className="editorial-section">
              <FadeWrapper
                className="section-label"
                fadeInStart={vh * 4.3}
                fadeInEnd={vh * 4.46}
              >
                <span>{t.stepsLabel}</span>
              </FadeWrapper>

              <StepItem fadeInStart={vh * 4.3} fadeInEnd={vh * 4.46}>
                <div className="step-number">01</div>
                <div>
                  <h3 className="step-title">{t.step1Title}</h3>
                  <div className="step-body">
                    <p>{t.step1Body}</p>
                    <ul>
                      <li>{t.step1ListIfFit}</li>
                      <li>{t.step1ListIfNot}</li>
                    </ul>
                    <p style={{ marginTop: 24, fontStyle: "italic" }}>
                      {t.step1Free}
                    </p>
                    <p style={{ marginTop: 16 }}>
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
                    <p className="step-detail">{t.step2Detail}</p>
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
