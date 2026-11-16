/**
 * Self-managed ("on your own" / "por tu cuenta") variant of the home landing page.
 * Copy by Samwise Sales (v2, 2026-11-16, facts v14), approved by Samuel 2026-11-16 19:00 UTC.
 * Keep it verbatim. Not addiction-framed: it is about doing what you set out to do each day.
 * Served at /por-tu-cuenta (ES) and /on-your-own (EN).
 */
import type { LandingCopy } from "./landing-copy"

export const LANDING_SELF_ES: LandingCopy = {
  nav: { how: "Cómo funciona", questions: "Preguntas", cta: "Empieza tu primer chequeo" },
  hero: {
    title: "Un chequeo al día para cumplir lo que te propones.",
    sub: "Samwise te llama cada día: qué te propones hoy y un pequeño compromiso. Tú escribes cómo te fue en tu propio cuaderno, y cada lunes recibes tu semana en WhatsApp.",
    cta: "Empieza tu primer chequeo",
    under: "Gratis. Sin app. Una llamada corta y un cuaderno.",
    chip: "¿Cuál es tu compromiso para hoy?",
    entry: {
      day: "Martes · me propuse caminar antes del almuerzo",
      before: "Ganas de dejarlo para mañana.",
      during: "Empecé con diez minutos y seguí.",
      after: "Contenta. Mañana a la misma hora.",
      next: "→ una reflexión corta y contárselo a alguien",
    },
    caption: "Entrada de ejemplo escrita para esta página. No es de una persona real.",
  },
  how: {
    title: "Cómo funciona",
    steps: [
      {
        title: "Haz tu chequeo cada día.",
        body: "Una llamada corta: qué te propones hoy, un pequeño compromiso y si tuviste un desliz desde tu último chequeo. Tú decides qué cuenta como desliz.",
      },
      {
        title: "Escríbelo.",
        body: "Escribe cómo te fue: antes, durante y después. En papel o en tu propio Google Doc. Samwise guarda las entradas con su fecha.",
      },
      {
        title: "Mira tu semana.",
        body: "Cada lunes te llega por WhatsApp tu semana: qué días hiciste tu chequeo y cuáles no. Puedes reenviarla a quien tú quieras.",
      },
    ],
  },
  net: {
    title: "Si faltas a un chequeo, tus personas de confianza reciben una llamada.",
    steps: [
      { label: "Tu hora", body: "Samwise te llama. ¿Sin tiempo? Pídele que te llame más tarde." },
      { label: "30 minutos", body: "Llama tú a Samwise o haz tu chequeo en los siguientes 30 minutos y nadie recibe aviso." },
      { label: "Después", body: "Samwise llama a tus personas de confianza. Quien no conteste recibe un correo." },
    ],
  },
  yours: {
    title: "Lo que sigue siendo tuyo",
    items: [
      "Samwise nunca comparte lo que escribes.",
      "Sin rachas.",
      "Tu cuaderno trae una oración o reflexión corta (opcional).",
      "Tú decides los pasos que agregas, uno a la vez.",
    ],
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Necesito una app?", a: "No. Una llamada, WhatsApp y tu cuaderno o Google Doc." },
      { q: "¿Quién lee mi cuaderno?", a: "Tú, quien tú quieras, y Samwise, para seguir tus pasos. Tus personas de confianza solo saben que escribiste una entrada, nunca lo que dice." },
      { q: "¿Y si no contesto?", a: "Llama tú a Samwise en los siguientes 30 minutos y nadie recibe aviso." },
      { q: "¿Qué reviso en mi chequeo?", a: "Lo que tú quieras cambiar o construir. Empiezas con lo básico y agregas pasos uno a la vez." },
      { q: "¿Todo es en español?", a: "Sí: esta página, el chat de WhatsApp y las llamadas." },
    ],
  },
  close: { title: "Un chequeo honesto al día.", cta: "Empieza tu primer chequeo", under: "Gratis. Sin app. En español o inglés." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Diseñado con la psicóloga conductual Ana María Reyes. Samwise es una herramienta independiente.",
    mac: "Samwise para Mac",
  },
}

export const LANDING_SELF_EN: LandingCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Start your first check-in" },
  hero: {
    title: "One check-in a day to do what you set out to do.",
    sub: "Samwise calls you every day: what you aim for today and one small commitment. You write how it went in your own journal, and every Monday you get your week on WhatsApp.",
    cta: "Start your first check-in",
    under: "Free. No app. A short phone call and a notebook.",
    chip: "What is your commitment for today?",
    entry: {
      day: "Tuesday · I planned a walk before lunch",
      before: "Wanted to put it off until tomorrow.",
      during: "Started with ten minutes and kept going.",
      after: "Glad. Same time tomorrow.",
      next: "→ a short reflection and tell someone",
    },
    caption: "Example entry written for this page. Not a real user.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Check in every day.",
        body: "A short call: what you aim for today, one small commitment, and whether you slipped since your last check-in. You decide what counts as a slip.",
      },
      {
        title: "Write it down.",
        body: "Write how it went: before, during and after. On paper or in your own Google Doc. Samwise keeps the dated entries.",
      },
      {
        title: "See your week.",
        body: "Every Monday your week arrives on WhatsApp: which days you checked in and which you didn’t. Forward it to anyone you choose.",
      },
    ],
  },
  net: {
    title: "Miss a check-in, and your trusted people get a call.",
    steps: [
      { label: "Your call time", body: "Samwise calls. Busy? Ask it to call back later." },
      { label: "30 minutes", body: "Call Samwise yourself or do your check-in within 30 minutes and nobody is told." },
      { label: "Then", body: "Samwise calls your trusted people. Anyone who misses the call gets an email." },
    ],
  },
  yours: {
    title: "What stays yours",
    items: [
      "Samwise never shares what you write.",
      "No streaks.",
      "Your journal offers a short prayer or reflection (optional).",
      "You choose the steps you add, one at a time.",
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do I need an app?", a: "No. A phone call, WhatsApp, and your notebook or Google Doc." },
      { q: "Who reads my journal?", a: "You, whoever you show it to, and Samwise, so it can follow your steps. Your trusted people only hear that you wrote an entry, never what it says." },
      { q: "What if I miss a call?", a: "Call Samwise yourself within 30 minutes and nobody is told." },
      { q: "What does my check-in cover?", a: "Whatever you want to change or build. You start with the basics and add steps one at a time." },
      { q: "Is it in Spanish?", a: "Yes: this page, the WhatsApp chat and the calls." },
    ],
  },
  close: { title: "One honest check-in a day.", cta: "Start your first check-in", under: "Free. No app. English or Spanish." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
    mac: "Samwise for Mac",
  },
}
