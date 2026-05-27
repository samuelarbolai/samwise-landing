// UI copy for /demo-call/[bookingId]. Bilingual.
//
// IMPORTANT (per samwise-landing-page skill): the word "demo" is rejected
// in user-facing copy — reads as transactional/sales-y; the landing voice
// is editorial. The URL path keeps the internal name for routing; the
// copy says "your call" / "your session." Same rule that landed
// "Book the call →" on the qualify FinalScreen.

export const DEMO_CALL_STRINGS = {
  es: {
    // Loading state — the moment between page load and init response.
    pre_join_loading: "Preparando la sala…",

    // Pre-join lobby — connected, ready to join.
    pre_join_lead: "Tu llamada con Samuel está por empezar.",
    pre_join_sub: "Cuando estés listo, entra a la sala.",
    pre_join_cta: "Entrar a la sala",
    pre_join_test_av: "Probar micrófono y cámara",

    // Pre-join error states.
    pre_join_not_found_lead: "No encontramos esta llamada.",
    pre_join_not_found_sub:
      "Es posible que el link haya cambiado o que la reserva no exista. Escríbenos si crees que es un error.",
    pre_join_cancelled_lead: "Esta llamada fue cancelada.",
    pre_join_cancelled_sub: "Si quieres reagendarla, escríbenos.",
    pre_join_back_home: "Volver a Samwise",

    // In-call status (during LiveKit handshake / waiting for Samuel).
    call_connecting_lead: "Conectando con Samuel…",
    call_connecting_sub: "Un momento.",
    call_waiting_lead: "Esperando a Samuel…",
    call_waiting_sub: "Va a entrar a la sala en un momento.",
    call_ended_lead: "La llamada terminó.",
    call_ended_sub: "Gracias por tu tiempo.",

    // Notes panel header label.
    notes_section_label: "Lo que está anotando",
  },
  en: {
    pre_join_loading: "Preparing the room…",

    pre_join_lead: "Your call with Samuel is about to begin.",
    pre_join_sub: "Whenever you're ready, step into the room.",
    pre_join_cta: "Join the call",
    pre_join_test_av: "Test mic and camera",

    pre_join_not_found_lead: "We couldn't find this call.",
    pre_join_not_found_sub:
      "The link may have changed or the booking may not exist. Write us if you think this is an error.",
    pre_join_cancelled_lead: "This call was cancelled.",
    pre_join_cancelled_sub: "Write us if you'd like to reschedule.",
    pre_join_back_home: "Back to Samwise",

    call_connecting_lead: "Connecting to Samuel…",
    call_connecting_sub: "One moment.",
    call_waiting_lead: "Waiting for Samuel…",
    call_waiting_sub: "He'll be in the room shortly.",
    call_ended_lead: "The call has ended.",
    call_ended_sub: "Thank you for your time.",

    notes_section_label: "What he's writing down",
  },
} as const

export type DemoCallStrings = (typeof DEMO_CALL_STRINGS)["en"]
