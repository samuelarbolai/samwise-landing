import type { Variant, VariantCopy } from "./types"

/**
 * /coaches (EN) and /acompanamiento (ES): recovery coaches and counselors who offer accountability
 * (Sales draft rows 15-16, built on Samuel's GO, requests row 43, 2026-11-18).
 * Changes from the Sales copy, all told to Sales in row 43:
 * - price -> "Free for you and your client." / "Who pays? Nobody, today."
 * - step 3: "their own Google Doc" -> "their own Google Doc, or a private journal link if they don't use Google" (facts v22)
 * - FAQ "Will Samwise send me reports? No." -> what the client chooses to send + the trusted-person case
 * Product changed to match step 2: clients from these tags hear "Am I at risk today?" and the slip
 * question on the call, and no phone question at night (check-in focus "accountability").
 */
const EN: VariantCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Start with one client" },
  hero: {
    tag: "For recovery coaches and counselors",
    title: "A daily record of your client's week.",
    sub: "Samwise calls your client every day for a short check-in. They keep a dated journal of slips and what happened. They share it with you.",
    cta: "Start with one client",
    under: "Free for you and your client.",
    card: {
      kind: "journal",
      chip: "Samwise calls · 8:00 every morning",
      label: "Journal · Tuesday",
      rows: [
        { q: "Have I slipped since my last check-in?", a: "Yes, last night." },
        { q: "What happened: before", a: "Home late, tired, alone with my phone." },
        { q: "During", a: "Two hours. Kept saying five more minutes." },
        { q: "After", a: "Ashamed. Did not want to tell anyone." },
        { q: "What I can control", a: "Phone stays in the kitchen after 10." },
      ],
      sentLabel: "Shared with you by your client · before Thursday's session",
    },
    caption: "Example written for this page. Not a real person.",
  },
  sections: [
    {
      kind: "steps",
      title: "How it works",
      items: [
        { title: "Your client signs up.", body: "With a WhatsApp number. No app. They pick the times Samwise calls." },
        { title: "Samwise calls every day.", body: "A short check-in: “Am I at risk today?” and “Have I slipped since my last check-in?”" },
        {
          title: "They write, then share.",
          body: "The journal is their own Google Doc, or a private journal link if they don't use Google, one dated entry a day. They share it with you before the session.",
        },
      ],
    },
    {
      kind: "columns",
      title: "It fits how you already work.",
      items: [
        { label: "Your steps, added one at a time", body: "Your client adds the steps you set together to their daily check-in." },
        { label: "Your client chooses what you see", body: "The journal belongs to them. Nothing reaches you unless they share it." },
        { label: "A missed check-in is noticed", body: "Samwise calls the trusted people your client chose. That can include you, if they list you." },
      ],
    },
    {
      kind: "list",
      title: "What Samwise is not",
      items: [
        "Not a replacement for you. It records the days between your sessions.",
        "Not a test. The journal is what your client reports.",
        "Not a referral program. You receive nothing for recommending it.",
      ],
    },
    {
      kind: "faq",
      title: "Questions",
      items: [
        { q: "Which problems does it cover?", a: "Whatever you and your client are working on: porn, gambling, alcohol, drugs, screens." },
        { q: "Who pays?", a: "Nobody, today. Free for you and your client." },
        { q: "Do I get paid for recommending it?", a: "No. Samwise pays no referral fees." },
        { q: "Is there proof it works?", a: "Not yet. Samwise is new and has no outcome data." },
        { q: "Does my client need an app?", a: "No. A phone call and WhatsApp. English or Spanish." },
        {
          q: "Will Samwise send me reports?",
          a: "Only what your client chooses to send: their week, by WhatsApp, if they say yes. If your client lists you as a trusted person, you also get a call after a missed or bad check-in, and an email that an entry exists, never what it says.",
        },
      ],
    },
  ],
  close: {
    title: "Start with one client, for one week.",
    text: "Send them this link. They sign up in two minutes.",
    under: "Free for you and your client.",
  },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
  },
}

const ES: VariantCopy = {
  nav: { how: "Cómo funciona", questions: "Preguntas", cta: "Empiece con un cliente" },
  hero: {
    tag: "Para coaches y consejeros en recuperación",
    title: "Un registro diario de la semana de su cliente.",
    sub: "Samwise llama a su cliente cada día para un chequeo corto. Su cliente lleva un cuaderno con fecha de sus deslices y de lo que pasó. Y lo comparte con usted.",
    cta: "Empiece con un cliente",
    under: "Gratis para usted y su cliente.",
    card: {
      kind: "journal",
      chip: "Samwise llama · 8:00 cada mañana",
      label: "Cuaderno · martes",
      rows: [
        { q: "¿He tenido un desliz desde mi último chequeo?", a: "Sí, anoche." },
        { q: "Qué pasó: antes", a: "Llegué tarde, cansado, solo con el celular." },
        { q: "Durante", a: "Dos horas. Me decía cinco minutos más." },
        { q: "Después", a: "Vergüenza. No quería contárselo a nadie." },
        { q: "Lo que puedo controlar", a: "El celular se queda en la cocina después de las 10." },
      ],
      sentLabel: "Compartido con usted por su cliente · antes de la sesión del jueves",
    },
    caption: "Ejemplo escrito para esta página. No es una persona real.",
  },
  sections: [
    {
      kind: "steps",
      title: "Cómo funciona",
      items: [
        { title: "Su cliente se registra.", body: "Con un número de WhatsApp. Sin app. Elige las horas en que Samwise llama." },
        { title: "Samwise llama cada día.", body: "Un chequeo corto: “¿Estoy en riesgo hoy?” y “¿He tenido un desliz desde mi último chequeo?”" },
        {
          title: "Escribe y comparte.",
          body: "El cuaderno es su propio Google Doc, o un enlace privado a su cuaderno si no usa Google, una entrada con fecha por día. Lo comparte con usted antes de la sesión.",
        },
      ],
    },
    {
      kind: "columns",
      title: "Encaja con su forma de trabajar.",
      items: [
        { label: "Sus pasos, uno a la vez", body: "Su cliente agrega a su chequeo diario los pasos que ustedes acuerden." },
        { label: "Su cliente elige qué ve usted", body: "El cuaderno es suyo. Nada le llega a usted si no lo comparte." },
        { label: "Un chequeo perdido no pasa desapercibido", body: "Samwise llama a las personas de confianza que su cliente eligió. Puede incluirle a usted, si su cliente lo pone en la lista." },
      ],
    },
    {
      kind: "list",
      title: "Lo que Samwise no es",
      items: [
        "No le reemplaza a usted. Registra los días entre sus sesiones.",
        "No es una prueba. El cuaderno es lo que su cliente reporta.",
        "No es un programa de referidos. Usted no recibe nada por recomendarlo.",
      ],
    },
    {
      kind: "faq",
      title: "Preguntas",
      items: [
        { q: "¿Qué problemas cubre?", a: "Lo que usted y su cliente estén trabajando: pornografía, juego, alcohol, drogas, pantallas." },
        { q: "¿Quién paga?", a: "Nadie, por ahora. Gratis para usted y su cliente." },
        { q: "¿Me pagan por recomendarlo?", a: "No. Samwise no paga comisiones por referidos." },
        { q: "¿Hay pruebas de que funciona?", a: "Todavía no. Samwise es nuevo y no tiene datos de resultados." },
        { q: "¿Mi cliente necesita una app?", a: "No. Una llamada y WhatsApp. En español o inglés." },
        {
          q: "¿Samwise me enviará reportes?",
          a: "Solo lo que su cliente decida enviarle: su semana, por WhatsApp, si dice que sí. Si su cliente lo pone como persona de confianza, también recibe una llamada después de un chequeo perdido o difícil, y un correo de que hay una entrada nueva, nunca lo que dice.",
        },
      ],
    },
  ],
  close: {
    title: "Empiece con un cliente, por una semana.",
    text: "Envíele este enlace. Se registra en dos minutos.",
    under: "Gratis para usted y su cliente.",
  },
  footer: {
    left: "Samwise · samwise.life",
    right: "Diseñado con la psicóloga conductual Ana María Reyes. Samwise es una herramienta independiente.",
  },
}

export const COACHES: Variant = {
  key: "coaches",
  audience: "professional",
  signup: "share-link",
  video: "clinician-plan",
  checkinFocus: "accountability",
  copy: { en: EN, es: ES },
  routes: [
    { path: "/coaches", lang: "en", src: "accountability", title: "Samwise for coaches: a daily record of your client's week", description: EN.hero.sub, twin: "/acompanamiento" },
    { path: "/acompanamiento", lang: "es", src: "acompanamiento", title: "Samwise para coaches: un registro diario de la semana de su cliente", description: ES.hero.sub, twin: "/coaches" },
  ],
}
