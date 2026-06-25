import type { Lang } from "@/lib/qualify/strings"

// Bilingual content for the in-call THERAPIST DEMO visuals. Self-contained
// here (NOT shared with the landing /therapists page, which stays English
// only per the user's "don't touch the landing" rule). Source of truth for
// the case, framework templates, collaboration plugins, offer copy, setup-doc
// outline, and every UI label rendered by TherapistDemoStory.

export interface StageHeader {
  eyebrow: string
  heading: string
}

export interface ArtifactTemplate {
  label: string
  title: string
  blurb: string
  inputsLead: string
  inputs: string[]
  componentsLead: string
  components: string[]
  beats: ("doc" | "mechanism" | "loop" | "cycle")[]
  showCalls?: boolean
}

export interface CaseApplication {
  text: string // the "with {name}" application paragraph
  quote?: string // optional verbatim line (e.g. mantra)
}

export interface CaseCopy {
  name: string // shared (display name)
  intro: string
  motivation: string
  problems: string[]
  ritual: CaseApplication
  call: CaseApplication
  calls: { name: string; time: string; body: string }[]
}

export interface CollabPlugin {
  head: string
  body: string
}

export interface OfferCopy {
  // The user's verbatim offer (translated for ES).
  paragraph1: string
  paragraph2: string
  caveat: string
  figureLabel: string // "of the AI revenue" / "del ingreso de la IA"
  figureMath: string // "$25 / mo to you · $50 / mo charged"
}

export interface SetupDocSection {
  label: string // section name
  items?: string[] // sub-items (ghosted)
}

export interface SetupDocCopy {
  kicker: string // "After the call" / "Después de la llamada"
  title: string
  body: string
  sections: SetupDocSection[]
  progress: string // "Built together" / "Lo construimos juntos"
  note: string // small footnote
}

export interface InCallStrings {
  // Labels reused across artifact-anatomy presentation
  artifact: {
    frameworkTag: string // "The framework" / "El marco"
    appliedTag: string // "With {name}" / "Con {name}"
  }
  // The seven steps (commitment block)
  seven_steps: string[]
  seven_steps_lead: string
  // Stage headers
  headers: {
    case: StageHeader
    arc: StageHeader
    collaboration: StageHeader
    offer: StageHeader
  }
  // Templates
  artifact_ritual: ArtifactTemplate
  artifact_call: ArtifactTemplate
  // Case (Mara)
  mara: CaseCopy
  // Collaboration plugins (3-item grid)
  collab_lead: string
  collab_plugins: CollabPlugin[]
  // Offer
  offer: OfferCopy
  // Setup doc (persistent layer)
  setup_doc: SetupDocCopy
}

// ── ENGLISH ─────────────────────────────────────────────────────────────────
const EN: InCallStrings = {
  artifact: {
    frameworkTag: "The framework",
    appliedTag: "With",
  },
  seven_steps_lead:
    "You keep your price, your pace, and your language. What you commit to is the work itself — the seven steps that produce a ritual worth running:",
  seven_steps: [
    "Functional analysis of the last relapse",
    "Desidentification",
    "Mapping of origin",
    "Identification of enablers",
    "Design of protection",
    "Identification of the current belief system",
    "Design of action toward the new belief system",
  ],
  headers: {
    case: { eyebrow: "A real case", heading: "Meet Mara." },
    arc: { eyebrow: "Over time", heading: "Then you keep sharpening it." },
    collaboration: { eyebrow: "Working together", heading: "Where you fit." },
    offer: { eyebrow: "The offer", heading: "Your terms. Our engine." },
  },
  artifact_ritual: {
    label: "What you build · 1",
    title: "The ritual",
    blurb:
      "The daily practice the person lives. You produce its raw material in session; we assemble it into a ritual they can keep.",
    inputsLead: "What you gather (the seven steps yield these)",
    inputs: [
      "The last relapse, functionally analyzed — one concrete moment, grounded.",
      "The behaviour, desidentified — named as an enemy, not the person.",
      "Its origin, mapped.",
      "The enablers that feed it.",
      "The current belief system.",
    ],
    componentsLead: "What the ritual is built into",
    components: [
      "Mantras — what they say.",
      "Protection — what they do to stop the behaviour now.",
      "A new belief system — what they do to shift thoughts and feelings over time.",
      "A schedule — times, with fallbacks.",
      "Accountability — the people who hold them to it.",
    ],
    // In-call therapist surface drops the embedded prospect DocSpine beat
    // here (the landing /therapists keeps it). On the in-call surface the
    // persistent SetupDoc below already plays the "doc" role for the
    // therapist; stacking three doc-like things would be too much.
    beats: ["mechanism"],
  },
  artifact_call: {
    label: "What you build · 2",
    title: "The call that runs it",
    blurb:
      "The daily call that carries the person into the ritual, so keeping it never rests on memory. You gather its inputs in the call-design session; we write the call.",
    inputsLead: "What you gather (the call-design session)",
    inputs: [
      "A symbol — the symbolic help they anchor to.",
      "Consciousness — what they hold gratitude or awareness for.",
      "Their intentions.",
      "A pact — a small, concrete commitment.",
      "Their company — who is with them.",
    ],
    componentsLead: "What the call is built into (its four parts)",
    components: ["The Stop.", "The Consciousness.", "The Intention.", "The Commitment."],
    beats: ["loop"],
    showCalls: true,
  },
  mara: {
    name: "Mara",
    intro:
      "Mara was losing her days to her phone. The moment a task felt too big, she reached for it — scrolling, checking, anything but starting — until whole afternoons disappeared into the screen.",
    motivation:
      "to become my most self-sufficient, capable self — someone who can hold a family and her businesses",
    problems: [
      "Screen addiction: reaching for the phone the moment the real work got hard, then losing hours to it.",
      "Underneath it, a perfectionist standard that made starting feel pointless — so the screen always won.",
    ],
    ritual: {
      text:
        "She named her enemy, then built protection that breaks her isolation each morning — assess the vulnerable state, activate a family member, instead of disappearing into the screen — and a new belief that trades first-attempt perfection for effort-based pride.",
      quote: "I am being attacked by an enemy that makes me mistreat myself.",
    },
    call: {
      text: "Her ritual runs on three short calls a day, on her cadence, not a default:",
    },
    calls: [
      {
        name: "Morning Protection",
        time: "8am (10am fallback; 6am Tuesdays)",
        body: "Assess the vulnerable state, activate support, coordinate logistics and meals.",
      },
      {
        name: "Afternoon Faith-Building",
        time: "2pm (3pm fallback)",
        body: "Document the tasks attempted; name the learning from failures or unknowns.",
      },
      {
        name: "Evening Preparation",
        time: "9pm (10pm fallback)",
        body: "Plan the next morning's logistics.",
      },
    ],
  },
  collab_lead:
    "You keep your price, your pace, and your language. What you commit to is the work itself — the seven steps that produce a ritual worth running:",
  collab_plugins: [
    {
      head: "You build the ritual",
      body:
        "In your onboarding session you run the seven steps and map the loop — the work you already do, in your own room.",
    },
    {
      head: "We make it daily",
      body:
        "Samwise turns your output into the ritual document and the AI calls that run it, and carries the day-to-day so nothing rests on memory.",
    },
    {
      head: "You re-sharpen it",
      body:
        "When the ritual stops holding, you run an optimization session. We rewrite the part that slipped. The document gets truer each loop.",
    },
  ],
  offer: {
    paragraph1:
      "We offer you to supply the sessions at your own price, pace and language, as long as you fulfill the steps (functional analysis of last relapse, desidentification, mapping of origin, identification of enablers, design of protection, identification of current belief system, design of action to new belief system).",
    paragraph2:
      "We offer you 50% of the revenue coming from the AI system. Which is 25 USD per month, since we charge the AI agent at 50 USD monthly.",
    caveat:
      "We have the goal of increasing the availability of therapists thanks to efficiencies gained from Samwise, but this is yet to be proven.",
    figureLabel: "of the AI revenue",
    figureMath: "$25 / mo to you · $50 / mo charged",
  },
  setup_doc: {
    kicker: "After the call",
    title: "Your Samwise setup, on one page.",
    body:
      "By the end of this call we will have everything we need to set you up. This is the document we will hand you — yours, ready to start.",
    sections: [
      {
        label: "Your seven-step process",
        items: ["Adapted to your voice", "Ready to deliver in session"],
      },
      {
        label: "Your first user",
        items: ["Who they are", "What they want to change", "Start date"],
      },
      {
        label: "Your terms",
        items: ["Your price", "Your pace", "Your language"],
      },
      {
        label: "Your assets",
        items: ["Your case", "Your visuals", "Your shareable page"],
      },
      {
        label: "Your call cadence",
        items: ["Default schedule", "Per-user overrides"],
      },
    ],
    progress: "Built together",
    note: "We'll send this to you after the call. You'll be able to edit and share it.",
  },
}

// ── SPANISH ─────────────────────────────────────────────────────────────────
const ES: InCallStrings = {
  artifact: {
    frameworkTag: "El marco",
    appliedTag: "Con",
  },
  seven_steps_lead:
    "Mantienes tu precio, tu ritmo y tu idioma. Lo que comprometes es el trabajo en sí — los siete pasos que producen un ritual que vale la pena vivir:",
  seven_steps: [
    "Análisis funcional de la última recaída",
    "Desidentificación",
    "Mapeo del origen",
    "Identificación de habilitadores",
    "Diseño de la protección",
    "Identificación del sistema de creencias actual",
    "Diseño de acción hacia el nuevo sistema de creencias",
  ],
  headers: {
    case: { eyebrow: "Un caso real", heading: "Te presento a Mara." },
    arc: { eyebrow: "Con el tiempo", heading: "Y se sigue afinando." },
    collaboration: { eyebrow: "Trabajando juntos", heading: "Dónde encajas." },
    offer: { eyebrow: "La oferta", heading: "Tus términos. Nuestro motor." },
  },
  artifact_ritual: {
    label: "Lo que construyes · 1",
    title: "El ritual",
    blurb:
      "La práctica diaria que la persona vive. Tú produces el material en sesión; nosotros lo ensamblamos en un ritual que puedan sostener.",
    inputsLead: "Lo que reúnes (los siete pasos producen esto)",
    inputs: [
      "La última recaída, analizada funcionalmente — un momento concreto, aterrizado.",
      "El comportamiento, desidentificado — nombrado como un enemigo, no como la persona.",
      "Su origen, mapeado.",
      "Los habilitadores que lo alimentan.",
      "El sistema de creencias actual.",
    ],
    componentsLead: "En qué se convierte el ritual",
    components: [
      "Mantras — lo que dicen.",
      "Protección — lo que hacen para frenar el comportamiento ahora.",
      "Un nuevo sistema de creencias — lo que hacen para que el pensar y el sentir cambien con el tiempo.",
      "Un horario — con planes B.",
      "Acompañamiento — las personas que los sostienen.",
    ],
    beats: ["mechanism"],
  },
  artifact_call: {
    label: "Lo que construyes · 2",
    title: "La llamada que lo activa",
    blurb:
      "La llamada diaria que lleva a la persona al ritual, para que sostenerlo no dependa de la memoria. Tú reúnes los insumos en la sesión de diseño; nosotros escribimos la llamada.",
    inputsLead: "Lo que reúnes (la sesión de diseño)",
    inputs: [
      "Un símbolo — la ayuda simbólica en la que se anclan.",
      "Consciencia — aquello por lo que sienten gratitud o conciencia.",
      "Sus intenciones.",
      "Un pacto — un compromiso pequeño y concreto.",
      "Su compañía — quién está con ellos.",
    ],
    componentsLead: "En qué se convierte la llamada (sus cuatro partes)",
    components: ["El Alto.", "La Consciencia.", "La Intención.", "El Compromiso."],
    beats: ["loop"],
    showCalls: true,
  },
  mara: {
    name: "Mara",
    intro:
      "Mara estaba perdiendo sus días con el teléfono. Apenas una tarea se sentía demasiado grande, lo agarraba — scroll, revisar, lo que fuera menos empezar — hasta que tardes enteras desaparecían en la pantalla.",
    motivation:
      "convertirme en mi versión más autosuficiente y capaz — alguien que pueda sostener una familia y sus negocios",
    problems: [
      "Adicción a la pantalla: agarrar el teléfono apenas el trabajo real se ponía difícil, y perder horas ahí.",
      "Debajo, un estándar perfeccionista que hacía que empezar se sintiera inútil — y entonces la pantalla siempre ganaba.",
    ],
    ritual: {
      text:
        "Nombró a su enemigo, y construyó una protección que rompe su aislamiento cada mañana — evalúa su estado de vulnerabilidad, activa a un familiar, en vez de desaparecer en la pantalla — y un nuevo sistema de creencias que cambia la perfección al primer intento por el orgullo basado en el esfuerzo.",
      quote: "Estoy siendo atacada por un enemigo que me hace maltratarme.",
    },
    call: {
      text: "Su ritual corre con tres llamadas cortas al día, en su cadencia, no por defecto:",
    },
    calls: [
      {
        name: "Protección de la mañana",
        time: "8am (10am plan B; 6am los martes)",
        body: "Evaluar el estado de vulnerabilidad, activar el apoyo, coordinar la logística y las comidas.",
      },
      {
        name: "Construcción de fe en la tarde",
        time: "2pm (3pm plan B)",
        body: "Documentar las tareas intentadas; nombrar el aprendizaje de los fracasos o lo desconocido.",
      },
      {
        name: "Preparación de la noche",
        time: "9pm (10pm plan B)",
        body: "Planear la logística de la mañana siguiente.",
      },
    ],
  },
  collab_lead:
    "Mantienes tu precio, tu ritmo y tu idioma. Lo que comprometes es el trabajo en sí — los siete pasos que producen un ritual que vale la pena vivir:",
  collab_plugins: [
    {
      head: "Tú construyes el ritual",
      body:
        "En tu sesión de onboarding corres los siete pasos y mapeas el loop — el trabajo que ya haces, en tu propio espacio.",
    },
    {
      head: "Nosotros lo volvemos diario",
      body:
        "Samwise convierte tu salida en el documento del ritual y en las llamadas de IA que lo activan, y carga el día a día para que nada dependa de la memoria.",
    },
    {
      head: "Tú lo vuelves a afilar",
      body:
        "Cuando el ritual deja de sostener, corres una sesión de optimización. Reescribimos la parte que se aflojó. El documento se vuelve más fiel a la persona en cada vuelta.",
    },
  ],
  offer: {
    paragraph1:
      "Te ofrecemos que des las sesiones a tu propio precio, ritmo e idioma, siempre y cuando cumplas los pasos (análisis funcional de la última recaída, desidentificación, mapeo del origen, identificación de habilitadores, diseño de protección, identificación del sistema de creencias actual, diseño de acción hacia el nuevo sistema de creencias).",
    paragraph2:
      "Te ofrecemos el 50% del ingreso que viene del sistema de IA. Que es 25 USD por mes, ya que cobramos al agente de IA 50 USD mensuales.",
    caveat:
      "Tenemos el objetivo de aumentar la disponibilidad de terapeutas gracias a las eficiencias que da Samwise, pero esto está aún por probarse.",
    figureLabel: "del ingreso de la IA",
    figureMath: "$25 / mes para ti · $50 / mes cobrado",
  },
  setup_doc: {
    kicker: "Después de la llamada",
    title: "Tu setup de Samwise, en una página.",
    body:
      "Al final de esta llamada tendremos todo lo necesario para dejarte listo. Este es el documento que te entregaremos — tuyo, listo para arrancar.",
    sections: [
      {
        label: "Tu proceso de siete pasos",
        items: ["Adaptado a tu voz", "Listo para entregar en sesión"],
      },
      {
        label: "Tu primer usuario",
        items: ["Quién es", "Qué quiere cambiar", "Fecha de inicio"],
      },
      {
        label: "Tus términos",
        items: ["Tu precio", "Tu ritmo", "Tu idioma"],
      },
      {
        label: "Tus activos",
        items: ["Tu caso", "Tus visuales", "Tu página para compartir"],
      },
      {
        label: "Tu cadencia de llamadas",
        items: ["Horario por defecto", "Ajustes por usuario"],
      },
    ],
    progress: "Construido juntos",
    note: "Te lo enviamos después de la llamada. Vas a poder editarlo y compartirlo.",
  },
}

export const THERAPIST_DEMO_STRINGS: Record<Lang, InCallStrings> = { en: EN, es: ES }
