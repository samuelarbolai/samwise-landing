export type Lang = "en" | "es"

export type HomeCopy = {
  announce: string
  navHow: string
  navCall: string
  navFaq: string
  navLogin: string
  navCta: string

  heroEyebrow: string
  heroH1a: string
  heroH1b: string
  heroSub: string
  heroCta: string
  heroMicro: string
  cardCaller: string
  cardState: string
  cardTime: string
  cardFoot: string

  loopEyebrow: string
  loopH2: string
  loopBody: string

  howEyebrow: string
  howH2: string
  steps: ReadonlyArray<{ n: string; title: string; body: string }>

  callEyebrow: string
  callH2: string
  callBody: string
  specs: ReadonlyArray<string>

  helpEyebrow: string
  helpH2: string
  helpBody: string
  helpBadge: string

  credEyebrow: string
  credName: string
  credLine1: string
  credLine2: string

  faqEyebrow: string
  faqH2: string
  faq: ReadonlyArray<{ q: string; a: string }>

  finalH2: string
  finalBody: string
  finalCta: string
  finalMicro: string

  footerV1: string
  footerRights: string
}

export const HOME_COPY: Record<Lang, HomeCopy> = {
  en: {
    announce: "Open beta — Samwise is free right now.",
    navHow: "How it works",
    navCall: "The call",
    navFaq: "FAQ",
    navLogin: "Log in",
    navCta: "Start free",

    heroEyebrow: "Daily accountability calls",
    heroH1a: "Break the loop.",
    heroH1b: "One call a day.",
    heroSub:
      "Samwise learns exactly how your pattern runs, builds you a ritual that takes minutes, and calls you every day to walk you through it. The moment you're about to fall, it calls your people.",
    heroCta: "Start free",
    heroMicro: "No card. Two-minute setup. Your first call can be tomorrow.",
    cardCaller: "Samwise",
    cardState: "calling…",
    cardTime: "07:00",
    cardFoot: "Your time. Every day.",

    loopEyebrow: "The loop",
    loopH2: "You already know what to do. That has never been the problem.",
    loopBody:
      "The problem is the moment. The 11pm moment. The moment after the argument. The moment you are alone and tired and the thing is right there. Willpower is not a plan. Nobody breaks a loop like this alone — and nobody should have to.",

    howEyebrow: "How it works",
    howH2: "Three things happen. That is the whole product.",
    steps: [
      {
        n: "01",
        title: "We learn your pattern.",
        body: "A first conversation maps how the loop actually runs in you — the triggers, the enablers, the moments it wins. Not a generic habit tracker. Your specific mechanism, written down.",
      },
      {
        n: "02",
        title: "You get one ritual.",
        body: "Not twenty habits. One short daily ritual built around your pattern — what to say, what to do, what to avoid — designed to work on your worst day, not your best.",
      },
      {
        n: "03",
        title: "Your people get called.",
        body: "You name the people who have your back. When you miss the ritual, or the call hears you sliding, Samwise reaches them. Support arrives before the fall, not after.",
      },
    ],

    callEyebrow: "The daily call",
    callH2: "A real phone call. At a time you choose.",
    callBody:
      "Your phone rings. You talk — out loud, like a person. Samwise walks you through the ritual, notices what is different today, and adapts. Two minutes, or ten if you need it.",
    specs: [
      "Set as many call times a day as you need",
      "Your timezone, your wall clock — 7:00 means 7:00",
      "English or Spanish, spoken naturally",
      "Every call summarised and scored, so you can watch the pattern move",
      "Change or pause your times any time, in seconds",
    ],

    helpEyebrow: "The part nobody else does",
    helpH2: "When you are about to fall, someone picks up.",
    helpBody:
      "Most tools log your failure after it happens. Samwise listens for it before. A missed ritual, a voice flatter than yesterday, the words you use right before a relapse — these are signals, and they trigger the only thing that has ever reliably worked: another human being showing up.",
    helpBadge: "New — live now in the open beta.",

    credEyebrow: "Designed with clinical guidance",
    credName: "Dr. Ana María Reyes Tirado",
    credLine1: "Specialist in Neurofeedback, New Wind Academy, USA.",
    credLine2: "Clinical Director, Fundación Syncronía.",

    faqEyebrow: "Before you ask",
    faqH2: "The honest answers.",
    faq: [
      {
        q: "Is it really free?",
        a: "Yes. Samwise is in open beta and there is no paywall — no card, no trial timer. When we start charging, you will hear it from us first.",
      },
      {
        q: "What does the call actually sound like?",
        a: "A normal conversation. A voice asks how you are doing, walks you through your ritual, and responds to what you actually say. You can talk back, interrupt, and keep it to two minutes.",
      },
      {
        q: "What if I do not pick up?",
        a: "Nothing is held against you. The miss is a signal — it is one of the things that tells us the loop is getting louder, and it is what reaches the support contacts you named.",
      },
      {
        q: "Which behaviours is this for?",
        a: "The stubborn ones. Screens, porn, social media, compulsive approval-seeking, destructive relationships. If you have tried to stop and it keeps coming back, that is the case this was built for.",
      },
      {
        q: "Who sees my calls?",
        a: "You do. Call summaries live in your account. We do not sell your data, and we do not share it with anyone you have not named yourself.",
      },
      {
        q: "Can I change my call times?",
        a: "Any time, from your settings. Add times, pause them, delete them — it takes seconds, and the change applies to the next call.",
      },
    ],

    finalH2: "Tomorrow morning, your phone rings.",
    finalBody:
      "That is the whole commitment. Set it up in two minutes and find out what a year of not fighting alone actually does.",
    finalCta: "Start free",
    finalMicro: "Open beta · No card · Cancel any time",

    footerV1: "Read the original Samwise letter",
    footerRights: "Samwise · Built with clinicians, spiritual guides and engineers.",
  },

  es: {
    announce: "Beta abierta — Samwise es gratis ahora mismo.",
    navHow: "Cómo funciona",
    navCall: "La llamada",
    navFaq: "Preguntas",
    navLogin: "Entrar",
    navCta: "Empieza gratis",

    heroEyebrow: "Llamadas diarias de acompañamiento",
    heroH1a: "Rompe el ciclo.",
    heroH1b: "Una llamada al día.",
    heroSub:
      "Samwise aprende exactamente cómo funciona tu patrón, te construye un ritual de pocos minutos y te llama todos los días para acompañarte. En el momento en que estás a punto de caer, llama a tu gente.",
    heroCta: "Empieza gratis",
    heroMicro: "Sin tarjeta. Dos minutos de configuración. Tu primera llamada puede ser mañana.",
    cardCaller: "Samwise",
    cardState: "llamando…",
    cardTime: "07:00",
    cardFoot: "Tu hora. Todos los días.",

    loopEyebrow: "El ciclo",
    loopH2: "Ya sabes qué hacer. Ese nunca fue el problema.",
    loopBody:
      "El problema es el momento. El momento de las once de la noche. El momento después de la pelea. El momento en que estás solo, cansado, y eso está ahí. La fuerza de voluntad no es un plan. Nadie rompe un ciclo así solo — y nadie debería tener que hacerlo.",

    howEyebrow: "Cómo funciona",
    howH2: "Pasan tres cosas. Ese es todo el producto.",
    steps: [
      {
        n: "01",
        title: "Aprendemos tu patrón.",
        body: "Una primera conversación mapea cómo funciona el ciclo en ti — los detonantes, los facilitadores, los momentos en que gana. No es un tracker de hábitos genérico. Es tu mecanismo específico, por escrito.",
      },
      {
        n: "02",
        title: "Recibes un ritual.",
        body: "No veinte hábitos. Un ritual diario corto, construido alrededor de tu patrón — qué decir, qué hacer, qué evitar — diseñado para funcionar en tu peor día, no en el mejor.",
      },
      {
        n: "03",
        title: "Llamamos a tu gente.",
        body: "Tú nombras a las personas que te sostienen. Cuando fallas el ritual, o la llamada escucha que estás resbalando, Samwise las contacta. El apoyo llega antes de la caída, no después.",
      },
    ],

    callEyebrow: "La llamada diaria",
    callH2: "Una llamada real. A la hora que tú elijas.",
    callBody:
      "Tu teléfono suena. Hablas — en voz alta, como una persona. Samwise te acompaña por el ritual, nota qué es distinto hoy y se adapta. Dos minutos, o diez si los necesitas.",
    specs: [
      "Pon tantas horas de llamada al día como necesites",
      "Tu zona horaria, tu reloj — las 7:00 son las 7:00",
      "Español o inglés, hablado con naturalidad",
      "Cada llamada resumida y evaluada, para ver el patrón moverse",
      "Cambia o pausa tus horarios cuando quieras, en segundos",
    ],

    helpEyebrow: "Lo que nadie más hace",
    helpH2: "Cuando estás a punto de caer, alguien contesta.",
    helpBody:
      "La mayoría de las herramientas registran tu caída después de que pasa. Samwise la escucha antes. Un ritual fallado, una voz más apagada que ayer, las palabras que usas justo antes de una recaída — son señales, y activan lo único que siempre ha funcionado: que otro ser humano aparezca.",
    helpBadge: "Nuevo — ya disponible en la beta abierta.",

    credEyebrow: "Diseñado con acompañamiento clínico",
    credName: "Dra. Ana María Reyes Tirado",
    credLine1: "Especialista en Neurofeedback, New Wind Academy, EE. UU.",
    credLine2: "Directora Clínica de Fundación Syncronía.",

    faqEyebrow: "Antes de que preguntes",
    faqH2: "Las respuestas honestas.",
    faq: [
      {
        q: "¿De verdad es gratis?",
        a: "Sí. Samwise está en beta abierta y no hay muro de pago — sin tarjeta, sin contador de prueba. Cuando empecemos a cobrar, te enterarás por nosotros primero.",
      },
      {
        q: "¿Cómo suena la llamada en realidad?",
        a: "Como una conversación normal. Una voz te pregunta cómo vas, te acompaña por tu ritual y responde a lo que de verdad dices. Puedes contestar, interrumpir y dejarla en dos minutos.",
      },
      {
        q: "¿Y si no contesto?",
        a: "No se te reprocha nada. La llamada perdida es una señal — es una de las cosas que nos dice que el ciclo está subiendo de volumen, y es lo que activa a los contactos de apoyo que nombraste.",
      },
      {
        q: "¿Para qué comportamientos sirve?",
        a: "Para los tercos. Pantallas, porno, redes sociales, búsqueda compulsiva de aprobación, relaciones destructivas. Si has intentado parar y vuelve una y otra vez, para eso se construyó esto.",
      },
      {
        q: "¿Quién ve mis llamadas?",
        a: "Tú. Los resúmenes viven en tu cuenta. No vendemos tus datos ni los compartimos con nadie a quien tú no hayas nombrado.",
      },
      {
        q: "¿Puedo cambiar mis horarios?",
        a: "Cuando quieras, desde tu configuración. Agrega horas, páusalas, elimínalas — toma segundos y aplica desde la siguiente llamada.",
      },
    ],

    finalH2: "Mañana en la mañana, tu teléfono suena.",
    finalBody:
      "Ese es todo el compromiso. Configúralo en dos minutos y descubre qué hace de verdad un año sin pelear solo.",
    finalCta: "Empieza gratis",
    finalMicro: "Beta abierta · Sin tarjeta · Cancela cuando quieras",

    footerV1: "Lee la carta original de Samwise",
    footerRights: "Samwise · Construido con clínicos, guías espirituales e ingenieros.",
  },
}
