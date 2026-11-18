import type { LandingCopy } from "./landing-copy"

/**
 * Clinician page copy (Samwise Dev, 2026-11-18, from facts v12 + v16: the clinician plan as it
 * is live). /terapeutas starts in Spanish, /for-clinicians in English. Free: no prices here.
 */
export const LANDING_CLINICIAN_ES: LandingCopy = {
  nav: { how: "Cómo funciona", questions: "Preguntas", cta: "Crea tu plan" },
  hero: {
    title: "Tus preguntas, en el chequeo diario de tu paciente.",
    sub: "Le dices a Samwise por WhatsApp qué quieres preguntarle a tu paciente. Samwise lo pregunta en su llamada de chequeo cada día, y tu paciente decide cuándo enviarte un resumen.",
    cta: "Crea tu plan para pacientes",
    under: "Gratis. Sin app. Un minuto para empezar.",
    chip: "¿Cuántas horas dormiste anoche?",
    entry: {
      day: "Martes · desliz",
      before: "Cansado, solo después del trabajo, el celular en la cama.",
      during: "Anestesiado. Me dije que solo cinco minutos.",
      after: "Avergonzado. Esta noche el celular carga en la cocina.",
      next: "→ hablarlo en la próxima sesión",
    },
    caption: "Ejemplo del cuaderno de un paciente. Solo lo ves si tu paciente te lo muestra. No es de una persona real.",
  },
  how: {
    title: "Cómo funciona",
    steps: [
      {
        title: "Escribe tus preguntas.",
        body: "Te registras con tu WhatsApp y le dices a Samwise qué quieres que pregunte. Te sugiere máximo 3 y te dice por qué; si quieres más, puedes dejarlas.",
      },
      {
        title: "Envía el enlace a tu paciente.",
        body: "Recibes un enlace samwise.life/p/… Tu paciente se registra con él, hace su configuración normal y acepta, cambia o salta cada pregunta.",
      },
      {
        title: "Recibe el resumen cuando tu paciente lo pida.",
        body: "Samwise hace las preguntas aceptadas una vez al día en sus llamadas de chequeo. Cuando tu paciente lo pide por WhatsApp, ve el texto exacto y dice que sí, te llega por correo.",
      },
    ],
  },
  net: {
    title: "Entre sesiones, tu paciente no está solo.",
    steps: [
      { label: "Su hora", body: "Samwise lo llama cada día. ¿Sin tiempo? Puede pedir que lo llame más tarde." },
      { label: "30 minutos", body: "Si no contesta, puede llamar a Samwise o hacer su chequeo en los siguientes 30 minutos y nadie recibe aviso." },
      { label: "Después", body: "Samwise llama a las personas de confianza que tu paciente eligió. Quien no conteste recibe un correo." },
    ],
  },
  yours: {
    title: "Lo que cuida tu paciente",
    items: [
      "Nada te llega solo: únicamente el resumen que tu paciente aprueba.",
      "El resumen trae las llamadas contestadas y las respuestas a tus preguntas. Nunca transcripciones, deslices ni su cuaderno.",
      "Tu paciente puede cambiar o saltar cualquier pregunta.",
      "Samwise es una herramienta que tú usas, no un servicio clínico.",
    ],
  },
  faq: {
    title: "Preguntas",
    items: [
      { q: "¿Cuánto cuesta?", a: "Nada. Es gratis para ti y para tu paciente." },
      { q: "¿Necesito una app?", a: "No. Tú usas WhatsApp; tu paciente usa WhatsApp y recibe llamadas." },
      { q: "¿Qué recibo exactamente?", a: "Un correo con las llamadas contestadas y las respuestas a tus preguntas, solo cuando tu paciente lo pide y lo aprueba." },
      { q: "¿Para qué conductas sirve?", a: "Para la que tú y tu paciente elijan: pornografía, sexo, juego, videojuegos, internet, alcohol u otras sustancias." },
      { q: "¿Todo es en español?", a: "Sí: esta página, el chat de WhatsApp, las llamadas y el resumen." },
    ],
  },
  close: { title: "Tu trabajo, cada día, entre sesiones.", cta: "Crea tu plan para pacientes", under: "Gratis. Un minuto. En español o inglés." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Diseñado con la psicóloga conductual Ana María Reyes. Samwise es una herramienta independiente.",
    mac: "Samwise para Mac",
  },
}

export const LANDING_CLINICIAN_EN: LandingCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Create your plan" },
  hero: {
    title: "Your questions, in your patient's daily check-in.",
    sub: "Tell Samwise on WhatsApp what you want to ask your patient. Samwise asks it on their check-in call every day, and your patient decides when to send you a summary.",
    cta: "Create a plan for your patients",
    under: "Free. No app. One minute to start.",
    chip: "How many hours did you sleep last night?",
    entry: {
      day: "Tuesday · slip",
      before: "Tired, alone after work, phone in bed.",
      during: "Numb. Told myself just five minutes.",
      after: "Ashamed. Phone charges in the kitchen tonight.",
      next: "→ bring it to the next session",
    },
    caption: "Example from a patient's journal. You only see it if your patient shows you. Not a real person.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Write your questions.",
        body: "Sign up with your WhatsApp and tell Samwise what you want asked. It suggests at most 3 and says why; if you want more, you can keep them.",
      },
      {
        title: "Send your patient the link.",
        body: "You get a link samwise.life/p/… Your patient signs up through it, does the normal setup, then accepts, rewords or skips each question.",
      },
      {
        title: "Get the summary when your patient asks.",
        body: "Samwise asks the accepted questions once a day on their check-in calls. When your patient asks for it on WhatsApp, sees the exact text and says yes, it reaches you by email.",
      },
    ],
  },
  net: {
    title: "Between sessions, your patient isn't alone.",
    steps: [
      { label: "Their call time", body: "Samwise calls every day. Busy? They can ask it to call back later." },
      { label: "30 minutes", body: "If they miss it, they can call Samwise or do their check-in within 30 minutes and nobody is told." },
      { label: "Then", body: "Samwise calls the trusted people your patient chose. Anyone who misses the call gets an email." },
    ],
  },
  yours: {
    title: "What your patient keeps",
    items: [
      "Nothing reaches you on its own: only the summary your patient approves.",
      "The summary has calls answered and the answers to your questions. Never transcripts, slips or their journal.",
      "Your patient can reword or skip any question.",
      "Samwise is a tool you use, not a clinical service.",
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "What does it cost?", a: "Nothing. It's free for you and your patient." },
      { q: "Do I need an app?", a: "No. You use WhatsApp; your patient uses WhatsApp and gets calls." },
      { q: "What exactly do I get?", a: "An email with the calls answered and the answers to your questions, only when your patient asks for it and approves it." },
      { q: "Which behaviors is it for?", a: "Whichever you and your patient choose: porn, sex, gambling, gaming, internet, alcohol or other substances." },
      { q: "Is it in Spanish?", a: "Yes: the page, the WhatsApp chat, the calls and the summary." },
    ],
  },
  close: { title: "Your work, every day, between sessions.", cta: "Create a plan for your patients", under: "Free. One minute. English or Spanish." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
    mac: "Samwise for Mac",
  },
}
