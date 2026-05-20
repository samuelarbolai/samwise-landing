// UI copy for /qualify. Bilingual. Lives in the landing module only —
// the worker doesn't render UI, so this is not copied.
//
// Copy reviewed during build. Final tone target for the DQ note:
// firm-honest. Not gentle, not punishing.

export const STRINGS = {
  es: {
    picker_heading: "¿Cómo prefieres hablar?",
    picker_lang_label: "Idioma",
    picker_name_label: "Tu nombre",
    picker_name_placeholder: "¿Cómo te llamas?",
    picker_email_label: "Tu correo",
    picker_email_placeholder: "tu@correo.com",
    picker_email_invalid: "Correo no válido",
    picker_proceed_voice: "Hablar",
    picker_text_fallback: "Prefiero escribir",
    picker_pick_one_hint: "↑ elige uno",

    voice_starting: "Conectando…",
    voice_mic_blocked: "Necesitamos acceso al micrófono para empezar.",
    voice_mic_idle_label: "Hablar",
    voice_mic_armed_label: "·",
    voice_mic_speaking_hold_label: "Escuchando",
    voice_mic_speaking_toggle_label: "Escuchando",
    voice_end_button: "Terminar",

    final_qualified_headline: "Te escuchamos.",
    final_qualified_body:
      "El siguiente paso es una llamada de 45 minutos con un guía de Samwise que ya sabe lo que compartiste. Vamos a mapear el camino desde aquí.",
    final_qualified_cta: "Reservar la llamada →",

    final_disqualified_headline: "Te damos el link.",
    final_disqualified_note:
      "Antes de agendar: vas a necesitar trabajar en definir mejor qué quieres cambiar para que esta sesión te dé valor real. Te damos el link igual, pero entra con esto en mente.",
    final_disqualified_cta: "Reservar tu sesión →",

    error_generic: "Algo salió mal. Recarga para intentar otra vez.",
  },
  en: {
    picker_heading: "How would you like to talk?",
    picker_lang_label: "Language",
    picker_name_label: "Your name",
    picker_name_placeholder: "What's your name?",
    picker_email_label: "Your email",
    picker_email_placeholder: "you@email.com",
    picker_email_invalid: "Invalid email",
    picker_proceed_voice: "Talk",
    picker_text_fallback: "I'd rather type",
    picker_pick_one_hint: "↑ pick one",

    voice_starting: "Connecting…",
    voice_mic_blocked: "We need microphone access to start.",
    voice_mic_idle_label: "Speak",
    voice_mic_armed_label: "·",
    voice_mic_speaking_hold_label: "Listening",
    voice_mic_speaking_toggle_label: "Listening",
    voice_end_button: "End",

    final_qualified_headline: "We listened.",
    final_qualified_body:
      "The next step is a 45-minute call with a Samwise guide who already knows what you shared. We'll map the path from here.",
    final_qualified_cta: "Book the call →",

    final_disqualified_headline: "Here's the link.",
    final_disqualified_note:
      "Before you book: you'll need to work on defining what you want to change before this session can give you real value. We're still giving you the link — go in with that in mind.",
    final_disqualified_cta: "Book your session →",

    error_generic: "Something went wrong. Reload to try again.",
  },
} as const

export type Lang = keyof typeof STRINGS
export type StringKey = keyof (typeof STRINGS)["es"]
