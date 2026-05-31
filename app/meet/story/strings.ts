import type { Lang } from "@/lib/qualify/strings"

// Experience beat (the six steps = the whole journey: map → design → live
// → optimize → live → repeat). Multi-session; optimization is its own
// session, not a daily thing.
export interface CycleStep {
  n: string
  head: string
  out: string
  body: string
}

// Daily-loop beat (the engine that runs every day): agent calls → user
// does the ritual → a short call tracks how it went. Generic on purpose —
// it does NOT name the tracking agent.
export interface LoopNode {
  label: string
  body: string
}

// One row of the persistent doc spine. `locked` = a section the prospect
// will fill in onboarding (ghosted "to-come"); the unlocked first section
// is seeded LIVE from his captured notes. `sub` is an optional second line
// (e.g. the Ritual Call's four parts).
export interface DocSection {
  label: string
  locked?: boolean
  sub?: string
  // Ghosted sub-fields nested under this section (the real doc nests the
  // ritual details inside "Problem & Solution"). Rendered muted.
  items?: string[]
}

export interface StoryCopy {
  // Persistent document spine (rendered above every beat).
  doc_kicker: string
  doc_title: string
  doc_body: string
  doc_sections: DocSection[]
  doc_progress: string
  doc_slot_note: string

  // Beat 1 — the promise (reworked neuro, three curves). Editorial voice
  // preserved from the original approved neuro copy; layers the two
  // changes (behaviour now / thoughts & feelings slowly) without
  // sloganeering, and opens with the tactical-empathy reassurance that
  // disarms the "I've tried things and they faded" fear.
  promise_kicker: string
  promise_title: string
  promise_body: string
  promise_curve_old: string // fallback when behaviour_to_change is empty
  promise_curve_behaviour: string
  promise_curve_mind: string
  promise_axis: string

  // Beat 2 — the whole experience (six steps). Unchanged from the
  // original approved copy.
  cycle_kicker: string
  cycle_title: string
  cycle_steps: CycleStep[]

  // Beat 3 — the daily loop.
  loop_kicker: string
  loop_title: string
  loop_body: string
  loop_nodes: [LoopNode, LoopNode, LoopNode]
  loop_repeat: string

  // Beat 4 — the ritual mechanism (Paso 3). Three components; the two
  // actionable ones map to the promise's two changes (protection → stops
  // the behaviour now; new belief system → shifts thoughts/feelings).
  mechanism_kicker: string
  mechanism_title: string
  mechanism_said_label: string
  mechanism_said: string
  mechanism_action_label: string
  mechanism_actions: { head: string; body: string }[]

  // Non-invasive "yet to be answered" overlay — open loops the rep leaves
  // to build anticipation for onboarding. Item count derives from stage.
  unanswered_kicker: string
  unanswered_items: [string, string]
}

export const STORY_STRINGS: Record<Lang, StoryCopy> = {
  en: {
    doc_kicker: "Your Ritual",
    doc_title: "One document holds all of it.",
    doc_body:
      "Everything we build lives on one page — your ritual, the call that runs it, and how it sharpens over time. It's yours, and it travels with you.",
    doc_sections: [
      {
        label: "Problem & Solution",
        items: [
          "Unsettling reality",
          "The solution",
          "The enemy, named",
          "The ritual — mantras & protection",
          "Your schedule",
        ],
      },
      {
        label: "The Ritual Call",
        sub: "Your symbol · gratitude · intentions · commitment · company",
        locked: true,
      },
      { label: "Metadata", locked: true },
    ],
    doc_progress: "1 of 3 — so far",
    doc_slot_note: "Your words above become the first page.",

    promise_kicker: "What's happening underneath",
    promise_title: "We phase one out as we phase the other in.",
    promise_body:
      "You don't have to feel different first. Each time you live the ritual instead of the old pattern, what you do shifts that same day — and how you think and feel follows, slower. We don't erase anything overnight; we trade one for the other.",
    promise_curve_old: "the old pattern",
    promise_curve_behaviour: "what you do — now",
    promise_curve_mind: "how you think and feel — over time",
    promise_axis: "call by call",

    cycle_kicker: "How it works",
    cycle_title: "Six steps. One loop. The document at the center.",
    cycle_steps: [
      {
        n: "01",
        head: "Map & create your ritual",
        out: "→ the Problem & Solution page",
        body: "We turn your words into a ritual: the activity, the time, the fallback, the people who hold you to it.",
      },
      {
        n: "02",
        head: "Design your call",
        out: "→ the Ritual Call page",
        body: "We write the four-part call that runs your ritual — the Stop, the Consciousness, the Intention, the Commitment.",
      },
      {
        n: "03",
        head: "Live your first call",
        out: "→ a real run",
        body: "You live it once. We watch what holds and what slips.",
      },
      {
        n: "04",
        head: "Optimize",
        out: "→ a sharper page",
        body: "We rewrite the part that didn't hold — the ritual, or the call.",
      },
      {
        n: "05",
        head: "Live the next call",
        out: "→ the sharper run",
        body: "You live the better version.",
      },
      {
        n: "06",
        head: "Repeat",
        out: "↻ back to the page",
        body: "Each loop the document gets truer to you — and the old pattern gets quieter.",
      },
    ],

    loop_kicker: "Day to day",
    loop_title: "A short loop you don't have to carry.",
    loop_body:
      "The hard part of any ritual isn't building it — it's keeping it. So the days hold themselves: a call brings you into your ritual, you live it, and a short call after keeps what happened. You don't have to remember anything.",
    loop_nodes: [
      { label: "The call", body: "Brings you into your ritual." },
      { label: "Your ritual", body: "You live it, in your own words." },
      { label: "What happened", body: "A short call keeps it." },
    ],
    loop_repeat: "↻ every day",

    mechanism_kicker: "Inside the ritual",
    mechanism_title: "What you say, and what you do.",
    mechanism_said_label: "What you say",
    mechanism_said: "Your mantras",
    mechanism_action_label: "What you do",
    mechanism_actions: [
      { head: "Protection", body: "stops the behaviour — now" },
      {
        head: "A new belief system",
        body: "shifts how you think and feel — gradually",
      },
    ],

    unanswered_kicker: "Yet to be answered",
    unanswered_items: ["Why we call you every day", "Why the mantras"],
  },
  es: {
    doc_kicker: "Tu Ritual",
    doc_title: "Un solo documento lo contiene todo.",
    doc_body:
      "Todo lo que construimos vive en una página — tu ritual, la llamada que lo activa, y cómo se va afinando con el tiempo. Es tuyo, y va con vos.",
    doc_sections: [
      {
        label: "Problema y Solución",
        items: [
          "Realidad inquietante",
          "La solución",
          "El enemigo, con nombre",
          "El ritual — mantras y protección",
          "Tus horarios",
        ],
      },
      {
        label: "La Llamada del Ritual",
        sub: "Tu símbolo · gratitud · intenciones · compromiso · compañía",
        locked: true,
      },
      { label: "Metadata", locked: true },
    ],
    doc_progress: "1 de 3 — por ahora",
    doc_slot_note: "Tus palabras de arriba se vuelven la primera página.",

    promise_kicker: "Lo que pasa por debajo",
    promise_title: "Vamos sacando uno mientras metemos el otro.",
    promise_body:
      "No tenés que sentirte distinto primero. Cada vez que vivís el ritual en lugar del viejo patrón, lo que hacés cambia ese mismo día — y tu manera de pensar y sentir va detrás, más lento. No borramos nada de un día para otro; cambiamos uno por el otro.",
    promise_curve_old: "el viejo patrón",
    promise_curve_behaviour: "lo que hacés — ya",
    promise_curve_mind: "cómo pensás y sentís — con el tiempo",
    promise_axis: "llamada por llamada",

    cycle_kicker: "Cómo funciona",
    cycle_title: "Seis pasos. Un ciclo. El documento en el centro.",
    cycle_steps: [
      {
        n: "01",
        head: "Mapear y crear tu ritual",
        out: "→ la página de Problema y Solución",
        body: "Convertimos tus palabras en un ritual: la actividad, la hora, el plan B, y las personas que te sostienen.",
      },
      {
        n: "02",
        head: "Diseñar tu llamada",
        out: "→ la página de la Llamada del Ritual",
        body: "Escribimos la llamada de cuatro partes que activa tu ritual — el Alto, la Consciencia, la Intención, el Compromiso.",
      },
      {
        n: "03",
        head: "Vivir tu primera llamada",
        out: "→ una ronda real",
        body: "La vivís una vez. Vemos qué sostiene y qué se afloja.",
      },
      {
        n: "04",
        head: "Optimizar",
        out: "→ una página más afilada",
        body: "Reescribimos la parte que no sostuvo — el ritual, o la llamada.",
      },
      {
        n: "05",
        head: "Vivir la siguiente llamada",
        out: "→ la ronda afilada",
        body: "Vivís la versión mejor.",
      },
      {
        n: "06",
        head: "Repetir",
        out: "↻ de vuelta a la página",
        body: "Cada vuelta el documento se vuelve más fiel a vos — y el viejo patrón se hace más callado.",
      },
    ],

    loop_kicker: "El día a día",
    loop_title: "Un ciclo corto que no tenés que cargar.",
    loop_body:
      "Lo difícil de un ritual no es armarlo — es cumplirlo. Por eso los días se sostienen solos: una llamada te lleva a tu ritual, lo vivís, y una llamada corta después guarda lo que pasó. No tenés que acordarte de nada.",
    loop_nodes: [
      { label: "La llamada", body: "Te lleva a tu ritual." },
      { label: "Tu ritual", body: "Lo vivís, en tus palabras." },
      { label: "Lo que pasó", body: "Una llamada corta lo guarda." },
    ],
    loop_repeat: "↻ cada día",

    mechanism_kicker: "Adentro del ritual",
    mechanism_title: "Lo que decís, y lo que hacés.",
    mechanism_said_label: "Lo que decís",
    mechanism_said: "Tus mantras",
    mechanism_action_label: "Lo que hacés",
    mechanism_actions: [
      { head: "Protección", body: "frena el comportamiento — ya" },
      {
        head: "Nuevo sistema de creencia",
        body: "cambia cómo pensás y sentís — de a poco",
      },
    ],

    unanswered_kicker: "Aún por responder",
    unanswered_items: ["Por qué te llamamos cada día", "Por qué los mantras"],
  },
}
