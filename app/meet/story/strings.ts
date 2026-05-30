import type { Lang } from "@/lib/qualify/strings"

export interface CycleStep {
  n: string
  head: string
  out: string
  body: string
}

export interface StoryCopy {
  doc_kicker: string
  doc_title: string
  doc_body: string
  doc_sections: [string, string, string]
  doc_slot_note: string

  cycle_kicker: string
  cycle_title: string
  cycle_doc_label: string
  cycle_steps: CycleStep[]

  neuro_kicker: string
  neuro_title: string
  neuro_body: string // approved copy — behavioural framing, no clinical claim
  neuro_curve_old: string
  neuro_curve_new: string
  neuro_axis: string
}

export const STORY_STRINGS: Record<Lang, StoryCopy> = {
  en: {
    doc_kicker: "Your Ritual",
    doc_title: "One document holds all of it.",
    doc_body:
      "Everything we build lives on one page — your ritual, the call that runs it, and how it sharpens over time. It's yours, and it travels with you.",
    doc_sections: ["Problem & Solution", "The Ritual Call", "Metadata"],
    doc_slot_note: "Your words above become the first page.",

    cycle_kicker: "How it works",
    cycle_title: "Six steps. One loop. The document at the center.",
    cycle_doc_label: "Your Ritual Document",
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

    neuro_kicker: "What's happening underneath",
    neuro_title: "We phase one out as we phase the other in.",
    neuro_body:
      "Each time you live the ritual instead of the old pattern, that path gets stronger and the other gets quieter. We don't erase anything overnight — we trade one for the other, call by call.",
    neuro_curve_old: "the old pattern",
    neuro_curve_new: "your ritual",
    neuro_axis: "call by call",
  },
  es: {
    doc_kicker: "Tu Ritual",
    doc_title: "Un solo documento lo contiene todo.",
    doc_body:
      "Todo lo que construimos vive en una página — tu ritual, la llamada que lo activa, y cómo se va afinando con el tiempo. Es tuyo, y va con vos.",
    doc_sections: ["Problema y Solución", "La Llamada del Ritual", "Metadata"],
    doc_slot_note: "Tus palabras de arriba se vuelven la primera página.",

    cycle_kicker: "Cómo funciona",
    cycle_title: "Seis pasos. Un ciclo. El documento en el centro.",
    cycle_doc_label: "Tu Documento del Ritual",
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

    neuro_kicker: "Lo que pasa por debajo",
    neuro_title: "Vamos sacando uno mientras metemos el otro.",
    neuro_body:
      "Cada vez que vivís el ritual en lugar del viejo patrón, ese camino se hace más fuerte y el otro más callado. No borramos nada de un día para otro — cambiamos uno por el otro, llamada por llamada.",
    neuro_curve_old: "el viejo patrón",
    neuro_curve_new: "tu ritual",
    neuro_axis: "llamada por llamada",
  },
}
