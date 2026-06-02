"use client"

import { useEffect, useState } from "react"
import "../styles.css"

type Lang = "en" | "es"

const copy = {
  en: {
    eyebrow: "Samwise",
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
    stepsLabel: "How can you make Samwise part of your life?",
    step1Title: "Schedule a Fit Assessment call.",
    step1Body: "It will last 30 minutes. All the questions about the program will be answered here. The outcome will be whether we are a good fit for your needs or not.",
    step1ListIfFit: "If we are a fit, program starts!",
    step1ListIfNot: "If we are not, don't worry! We will recommend you other services, so you can always get help.",
    step2Title: "Schedule the Problem Clarification and Belief System session.",
    step2Body: "It will last 150 minutes. (Yes we know, it is long. We need to make sure we do this part right to actually be able to help you). You will get a clear picture of your problem here, a clear path to a solution, and the first set up of your first ritual and AI Agent for your calls.",
    step3Title: "You will start your ritual.",
    step3Body: "We will monitor your progress, so we can schedule an optimization session to help you achieve progress faster.",
    scheduleLabel: "Schedule your call",
    scheduleCard1Tag: "First-time visitors",
    scheduleCard1Title: "Fit Assessment",
    scheduleCard1Body: "Start here if it's your first time.",
    scheduleCard1Cta: "Schedule —",
    scheduleCard2Tag: "Returning",
    scheduleCard2Title: "Problem Clarification and Belief System",
    scheduleCard2Body: "Only if you've completed the Fit Assessment or are a current subscriber.",
    scheduleCard2Cta: "Schedule —",
    authorLabel: "Clinical advisor",
    authorIntro: "The Samwise program has been designed with the close advice of",
    authorName: "Dr. Ana María Reyes Tirado",
    authorCred1: "Specialist in Neurofeedback of New Wind Academy, USA.",
    authorCred2: "Clinical Director of Fundación Syncronía.",
    navHome: "Home",
    navValidation: "Scientific Evidence",
    footer: "Last updated · May 2026",
  },
  es: {
    eyebrow: "Samwise",
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
    stepsLabel: "¿Cómo puedes hacer parte de tu vida a Samwise?",
    step1Title: "Agenda una llamada de Evaluación de Ajuste.",
    step1Body: "Durará 30 minutos. Todas las preguntas sobre el programa se responderán aquí. El resultado será determinar si somos un buen ajuste para tus necesidades o no.",
    step1ListIfFit: "Si somos un buen ajuste, ¡el programa comienza!",
    step1ListIfNot: "Si no lo somos, ¡no te preocupes! Te recomendaremos otros servicios, para que siempre puedas recibir ayuda.",
    step2Title: "Agenda la sesión de Clarificación del Problema y Sistema de Creencias.",
    step2Body: "Durará 150 minutos. (Sí, sabemos que es larga. Necesitamos hacer esta parte bien para poder ayudarte de verdad). Aquí obtendrás una imagen clara de tu problema, un camino claro hacia una solución, y la primera configuración de tu primer ritual y Agente de IA para tus llamadas.",
    step3Title: "Comenzarás tu ritual.",
    step3Body: "Monitorearemos tu progreso, para poder agendar una sesión de optimización que te ayude a avanzar más rápido.",
    scheduleLabel: "Agenda tu llamada",
    scheduleCard1Tag: "Primera vez",
    scheduleCard1Title: "Evaluación de Ajuste",
    scheduleCard1Body: "Comienza aquí si es tu primera vez.",
    scheduleCard1Cta: "Agendar —",
    scheduleCard2Tag: "Recurrentes",
    scheduleCard2Title: "Clarificación del Problema y Sistema de Creencias",
    scheduleCard2Body: "Solo si has completado la Evaluación de Ajuste o eres suscriptor actual.",
    scheduleCard2Cta: "Agendar —",
    authorLabel: "Asesoría clínica",
    authorIntro: "El programa Samwise ha sido diseñado con la asesoría cercana de",
    authorName: "Dra. Ana María Reyes Tirado",
    authorCred1: "Especialista en Neurofeedback de New Wind Academy, EE. UU.",
    authorCred2: "Directora Clínica de la Fundación Syncronía.",
    navHome: "Inicio",
    navValidation: "Evidencia Científica",
    footer: "Última actualización · Mayo 2026",
  },
}

export default function EditorialHome() {
  const [lang, setLang] = useState<Lang>("en")
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

  return (
    <div className="editorial-root">
      <nav className="editorial-nav">
        <a href="/previous" className="brand">Samwise</a>
        <div className="nav-right">
          <a href="/scientific-evidence" className="nav-link">
            {t.navValidation} →
          </a>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
            <span className="sep">/</span>
            <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
          </div>
        </div>
      </nav>

      <div className="editorial-wrap">
        <header className="editorial-landing-hero">
          <div className="eyebrow reveal">{t.eyebrow}</div>
          <p className="lede reveal">{t.lede}</p>
        </header>

        <section className="editorial-section">
          <div className="section-label">
            <span>{t.challengesLabel}</span>
          </div>
          <ol className="challenge-list">
            {t.challenges.map((c, i) => (
              <li key={i} className="reveal">{c}</li>
            ))}
          </ol>
        </section>

        <section className="interpretation">
          <h2 className="interp-heading reveal">{t.interpHeading}</h2>
          <div className="interp-body reveal">
            <p>{t.interpBody1.split("Samwise")[0]}<strong>Samwise</strong>{t.interpBody1.split("Samwise")[1] ?? ""}</p>
            <div className="pullquote">{t.pullquote}</div>
            <p>{t.interpBody2}</p>
          </div>
        </section>

        <section className="editorial-section">
          <div className="section-label">
            <span>{t.stepsLabel}</span>
          </div>

          <div className="step reveal">
            <div className="step-number">01</div>
            <div>
              <h3 className="step-title">{t.step1Title}</h3>
              <div className="step-body">
                <p>{t.step1Body}</p>
                <ul>
                  <li>{t.step1ListIfFit}</li>
                  <li>{t.step1ListIfNot}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="step reveal">
            <div className="step-number">02</div>
            <div>
              <h3 className="step-title">{t.step2Title}</h3>
              <div className="step-body">
                <p>{t.step2Body}</p>
              </div>
            </div>
          </div>

          <div className="step reveal">
            <div className="step-number">03</div>
            <div>
              <h3 className="step-title">{t.step3Title}</h3>
              <div className="step-body">
                <p>{t.step3Body}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="editorial-section">
          <div className="section-label">
            <span>{t.scheduleLabel}</span>
          </div>
          <div className="schedule-grid">
            <div className="schedule-card reveal">
              <div className="card-tag">{t.scheduleCard1Tag}</div>
              <div className="card-title">{t.scheduleCard1Title}</div>
              <p className="card-body">{t.scheduleCard1Body}</p>
              <a
                className="cta"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.scheduleCard1Cta}
              </a>
            </div>
            <div className="schedule-card reveal">
              <div className="card-tag">{t.scheduleCard2Tag}</div>
              <div className="card-title">{t.scheduleCard2Title}</div>
              <p className="card-body">{t.scheduleCard2Body}</p>
              <a
                className="cta"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.scheduleCard2Cta}
              </a>
            </div>
          </div>
        </section>

        <section className="editorial-section">
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
    </div>
  )
}
