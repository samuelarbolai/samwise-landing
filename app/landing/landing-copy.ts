/**
 * Landing page copy (Samwise Sales, approved by Samuel 2026-11-14, facts v8).
 * Keep it verbatim. Later variants (therapy, on your own) swap a few lines here
 * and keep the template in landing.tsx unchanged.
 */
export type LandingCopy = {
  nav: { how: string; questions: string; cta: string }
  hero: {
    title: string
    sub: string
    cta: string
    under: string
    chip: string
    entry: { day: string; before: string; during: string; after: string; next: string }
    caption: string
  }
  how: { title: string; steps: { title: string; body: string }[] }
  net: { title: string; steps: { label: string; body: string }[] }
  yours: { title: string; items: string[] }
  faq: { title: string; items: { q: string; a: string }[] }
  close: { title: string; cta: string; under: string }
  footer: { left: string; right: string; mac: string }
}

export const LANDING_EN: LandingCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Start your first check-in" },
  hero: {
    title: "Turn every slip into something you can work on.",
    sub: "Samwise calls you every day to check in. When you slip, you write what happened, in your own journal, ready for your sponsor.",
    cta: "Start your first check-in",
    under: "Free. No app. A short phone call and a notebook.",
    chip: "Have I slipped since my last check-in?",
    entry: {
      day: "Tuesday · slip",
      before: "Tired, alone after work, phone in bed.",
      during: "Numb. Told myself just five minutes.",
      after: "Ashamed. Phone charges in the kitchen tonight.",
      next: "→ talk to my sponsor Thursday",
    },
    caption: "Example entry written for this page. Not a real user.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Check in every day.",
        body: "A short call that asks: “Any slip since your last check-in?” Your journal starts with “Am I at risk today?” and “Have I slipped since my last check-in?”",
      },
      {
        title: "Write it down.",
        body: "Slipped? Write how you felt before, during and after. On paper or in your own Google Doc. Samwise keeps the dated entries.",
      },
      { title: "Bring it to your sponsor.", body: "It’s your journal. You choose who reads it." },
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
      "Works next to your meetings and your sponsor. It doesn’t replace them.",
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do I need an app?", a: "No. A phone call, WhatsApp, and your notebook or Google Doc." },
      { q: "Who reads my journal?", a: "You, whoever you show it to, and Samwise, so it can follow your steps. Your trusted people only hear that you wrote an entry, never what it says." },
      { q: "What if I miss a call?", a: "Call Samwise yourself within 30 minutes and nobody is told." },
    ],
  },
  close: { title: "One honest check-in a day.", cta: "Start your first check-in", under: "Free. No app. English or Spanish." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
    // Link to /mac, the optional check-in alarm for Mac (added 2026-11-16; not part of the approved 11-14 copy).
    mac: "Samwise for Mac",
  },
}

/**
 * Spanish of the home page. Translated by Dev 2026-11-16 with the plain-wording glossary
 * (chequeo, cuaderno, desliz, personas de confianza) so the page can follow the visitor's
 * language; lines shared with the self-managed page use Sales' approved Spanish.
 * Sales may replace any line.
 */
export const LANDING_ES: LandingCopy = {
  nav: { how: "Cómo funciona", questions: "Preguntas", cta: "Empieza tu primer chequeo" },
  hero: {
    title: "Convierte cada desliz en algo que puedes trabajar.",
    sub: "Samwise te llama cada día para tu chequeo. Cuando tienes un desliz, escribes lo que pasó, en tu propio cuaderno, listo para tu padrino.",
    cta: "Empieza tu primer chequeo",
    under: "Gratis. Sin app. Una llamada corta y un cuaderno.",
    chip: "¿He tenido un desliz desde mi último chequeo?",
    entry: {
      day: "Martes · desliz",
      before: "Cansancio, a solas después del trabajo, el celular en la cama.",
      during: "Como anestesiado. Me dije que solo cinco minutos.",
      after: "Vergüenza. Esta noche el celular se carga en la cocina.",
      next: "→ hablar con mi padrino el jueves",
    },
    caption: "Entrada de ejemplo escrita para esta página. No es de una persona real.",
  },
  how: {
    title: "Cómo funciona",
    steps: [
      {
        title: "Haz tu chequeo cada día.",
        body: "Una llamada corta que pregunta: “¿Algún desliz desde tu último chequeo?” Tu cuaderno empieza con “¿Estoy en riesgo hoy?” y “¿He tenido un desliz desde mi último chequeo?”",
      },
      {
        title: "Escríbelo.",
        body: "¿Tuviste un desliz? Escribe cómo te sentiste antes, durante y después. En papel o en tu propio Google Doc. Samwise guarda las entradas con su fecha.",
      },
      { title: "Llévalo a tu padrino.", body: "Es tu cuaderno. Tú decides quién lo lee." },
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
      "Funciona junto a tus reuniones y tu padrino. No los reemplaza.",
    ],
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Necesito una app?", a: "No. Una llamada, WhatsApp y tu cuaderno o Google Doc." },
      { q: "¿Quién lee mi cuaderno?", a: "Tú, quien tú quieras, y Samwise, para seguir tus pasos. Tus personas de confianza solo saben que escribiste una entrada, nunca lo que dice." },
      { q: "¿Y si no contesto?", a: "Llama tú a Samwise en los siguientes 30 minutos y nadie recibe aviso." },
    ],
  },
  close: { title: "Un chequeo honesto al día.", cta: "Empieza tu primer chequeo", under: "Gratis. Sin app. En español o inglés." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Diseñado con la psicóloga conductual Ana María Reyes. Samwise es una herramienta independiente.",
    mac: "Samwise para Mac",
  },
}
