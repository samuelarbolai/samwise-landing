/**
 * Clinician marketing page copy (Samwise Sales, approved by Samuel 2026-11-15; GO 2026-11-18,
 * requests sheet row 31). Verbatim except lines that were not true as built (facts v16):
 * - every price line -> "Free for you and your patient." (no billing, Samuel 2026-11-15)
 * - no ready-made "12-step template" exists: the clinician names the plan and writes the questions
 * - "Am I at risk today?" is not asked on calls (it is in the journal); the slip question is
 * - "what to track" dropped: the plan is questions plus suggested call times
 * - the patient's summary has calls answered + plan answers + an optional note, never slips or journal
 * - alerts: true unless the patient lists the clinician as a trusted person
 * Served at /clinicians (EN) and /clinicos (ES).
 */
import type { PageLang } from "@/lib/lang"

export type ClinicianCopy = {
  nav: { how: string; questions: string; cta: string }
  hero: {
    tag: string
    title: string
    sub: string
    cta: string
    under: string
    planLabel: string
    questions: { text: string; yours: boolean }[]
    chip: string
    sentLabel: string
    sent: string[]
    caption: string
  }
  how: { title: string; steps: { title: string; body: string }[] }
  control: { title: string; items: { title: string; body: string }[] }
  not: { title: string; items: string[] }
  faq: { title: string; items: { q: string; a: string }[] }
  close: { title: string; cta: string; under: string }
  footer: { left: string; right: string }
}

export const CLINICIAN_EN: ClinicianCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Create your first plan" },
  hero: {
    tag: "For psychologists and therapists",
    title: "Your plan, followed every day between sessions.",
    sub: "You propose the questions and the call times. Samwise calls your patient every day. Your patient decides what to send you.",
    cta: "Create your first plan",
    under: "Free for you and your patient.",
    planLabel: "Your plan · 12-step daily check-in",
    questions: [
      { text: "Have I slipped since my last check-in?", yours: false },
      { text: "How many hours did I sleep?", yours: true },
      { text: "Who did I reach out to today?", yours: true },
    ],
    chip: "Samwise calls · 8:00 every morning",
    sentLabel: "Sent to you by your patient · Thursday",
    sent: ["Answered 6 of 7 calls.", "Sleep: 5 to 6 hours most nights.", "Note: I want to talk about evenings."],
    caption:
      "Example written for this page. Not a real patient. Brown lines are questions the therapist added; the slip question is on every check-in.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Propose a plan.",
        body: "On WhatsApp, name your plan, like a 12-step daily check-in, write your questions and suggest call times. You get a link for your patient.",
      },
      {
        title: "Samwise calls every day.",
        body: "A short call at the time your patient picks, asking your questions. No app.",
      },
      {
        title: "Your patient sends you the answers.",
        body: "Before the next session, they choose what to share with you.",
      },
    ],
  },
  control: {
    title: "Your patient stays in control.",
    items: [
      { title: "They accept the plan", body: "Your plan is a proposal. Your patient can accept, reword or skip each question, or leave the plan." },
      { title: "They choose what you see", body: "Nothing reaches you unless your patient sends it." },
      { title: "You are not on call", body: "If a call is missed, Samwise calls family or friends your patient chose. Not you." },
    ],
  },
  not: {
    title: "What Samwise is not",
    items: [
      "Not a treatment and not a replacement for your sessions.",
      "Early: no outcome data and no study yet.",
      "Not a referral program. You receive nothing for recommending it.",
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Who pays?", a: "Nobody. Free for you and your patient." },
      { q: "Do I get paid for recommending it?", a: "No. Samwise pays no referral fees." },
      {
        q: "Will I get alerts?",
        a: "No. Missed calls go to family or friends your patient chose, unless they choose you as one of them.",
      },
      { q: "Does my patient need an app?", a: "No. A phone call and WhatsApp. English or Spanish." },
    ],
  },
  close: { title: "Your plan, between every session.", cta: "Create your first plan", under: "Free for you and your patient." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
  },
}

export const CLINICIAN_ES: ClinicianCopy = {
  nav: { how: "Cómo funciona", questions: "Preguntas", cta: "Cree su primer plan" },
  hero: {
    tag: "Para psicólogos y terapeutas",
    title: "Su plan, seguido cada día entre sesiones.",
    sub: "Usted propone las preguntas y los horarios de llamada. Samwise llama a su paciente cada día. Su paciente decide qué le envía.",
    cta: "Cree su primer plan",
    under: "Gratis para usted y su paciente.",
    planLabel: "Su plan · chequeo diario de 12 pasos",
    questions: [
      { text: "¿He tenido un desliz desde mi último chequeo?", yours: false },
      { text: "¿Cuántas horas dormí?", yours: true },
      { text: "¿A quién busqué hoy?", yours: true },
    ],
    chip: "Samwise llama · 8:00 cada mañana",
    sentLabel: "Enviado por su paciente · jueves",
    sent: ["Contestó 6 de 7 llamadas.", "Sueño: 5 a 6 horas casi todas las noches.", "Nota: quiero hablar de las noches."],
    caption:
      "Ejemplo escrito para esta página. No es un paciente real. Las líneas en café son preguntas que agregó el terapeuta; la pregunta del desliz va en cada chequeo.",
  },
  how: {
    title: "Cómo funciona",
    steps: [
      {
        title: "Proponga un plan.",
        body: "Por WhatsApp, póngale nombre a su plan, como un chequeo diario de 12 pasos, escriba sus preguntas y sugiera horarios. Recibe un enlace para su paciente.",
      },
      {
        title: "Samwise llama cada día.",
        body: "Una llamada corta a la hora que elige su paciente, con sus preguntas. Sin app.",
      },
      {
        title: "Su paciente le envía las respuestas.",
        body: "Antes de la siguiente sesión, su paciente elige qué compartir con usted.",
      },
    ],
  },
  control: {
    title: "Su paciente siempre tiene el control.",
    items: [
      { title: "Acepta el plan", body: "Su plan es una propuesta. Su paciente puede aceptar, reformular u omitir cada pregunta, o salir del plan." },
      { title: "Elige qué ve usted", body: "Nada le llega a usted si su paciente no lo envía." },
      {
        title: "Usted no está de turno",
        body: "Si su paciente no contesta, Samwise llama a familiares o amigos que su paciente eligió. No a usted.",
      },
    ],
  },
  not: {
    title: "Lo que Samwise no es",
    items: [
      "No es un tratamiento ni reemplaza sus sesiones.",
      "Etapa temprana: aún no hay datos de resultados ni estudios.",
      "No es un programa de referidos. Usted no recibe nada por recomendarlo.",
    ],
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Quién paga?", a: "Nadie. Gratis para usted y su paciente." },
      { q: "¿Me pagan por recomendarlo?", a: "No. Samwise no paga comisiones por referidos." },
      {
        q: "¿Recibiré alertas?",
        a: "No. Si no contesta, Samwise llama a familiares o amigos que su paciente eligió, salvo que lo elija a usted como uno de ellos.",
      },
      { q: "¿Mi paciente necesita una app?", a: "No. Una llamada y WhatsApp. En español o inglés." },
    ],
  },
  close: { title: "Su plan, entre cada sesión.", cta: "Cree su primer plan", under: "Gratis para usted y su paciente." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Diseñado con la psicóloga conductual Ana María Reyes. Samwise es una herramienta independiente.",
  },
}

export const CLINICIAN_COPY: Record<PageLang, ClinicianCopy> = { en: CLINICIAN_EN, es: CLINICIAN_ES }
