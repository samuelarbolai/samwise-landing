export type Lang = "en" | "es"

export type HomeCopy = {
  title: string
  titleEm: string
  body: string
  cta: string
  micro: string
  loginLead: string
  login: string
  waMessage: string
  imageAlt: string
}

export const HOME_COPY: Record<Lang, HomeCopy> = {
  en: {
    title: "Your daily ritual companion.",
    titleEm: "One step at a time, and never alone.",
    body: "Samwise helps you keep a daily ritual through WhatsApp and a short call each day, and reaches your people when you need them.",
    cta: "Sign up free",
    micro: "It takes a minute. Then we talk on WhatsApp.",
    loginLead: "Already signed up?",
    login: "Write to Samwise on WhatsApp",
    waMessage: "Hi Samwise",
    imageAlt: "Samwise looking up at a bright star in the night sky",
  },
  es: {
    title: "Tu compañero para el ritual diario.",
    titleEm: "Paso a paso, y nunca solo.",
    body: "Samwise te ayuda a mantener un ritual diario por WhatsApp y con una llamada corta cada día, y avisa a tu gente cuando la necesitas.",
    cta: "Regístrate gratis",
    micro: "Toma un minuto. Luego hablamos por WhatsApp.",
    loginLead: "¿Ya te registraste?",
    login: "Escríbele a Samwise por WhatsApp",
    waMessage: "Hola Samwise",
    imageAlt: "Samwise mirando una estrella brillante en el cielo nocturno",
  },
}
