import { LANDING_EN, LANDING_ES } from "../landing-copy"
import { fromLandingCopy } from "./from-landing-copy"
import type { Variant, VariantCopy } from "./types"

/**
 * /12-steps (EN) and /12-pasos (ES): the home page's 12-step copy on its own address, so a 12-step
 * audience can be counted apart from "/" (Samuel via Sales, requests row 42, 2026-11-18).
 * Same copy as "/" with one fix: the missed-call lines said a call-back alone stops the trusted-people
 * call. Samuel decided (2026-11-18) the check-in must be complete, so these pages say that.
 */
const MISSED_EN = {
  net: "Within 30 minutes, call Samwise back and do your check-in, or send a photo of your journal page. If it's complete, nobody is told.",
  faq: "Within 30 minutes, call Samwise back and do your check-in, or send a photo of your journal page. If your check-in is complete, nobody is told.",
}
const MISSED_ES = {
  net: "En los siguientes 30 minutos, llama a Samwise y haz tu chequeo, o envía una foto de la página de tu cuaderno. Si está completo, nadie recibe aviso.",
  faq: "En los siguientes 30 minutos, llama a Samwise y haz tu chequeo, o envía una foto de la página de tu cuaderno. Si tu chequeo está completo, nadie recibe aviso.",
}

function withMissedFix(c: VariantCopy, fix: { net: string; faq: string }): VariantCopy {
  return {
    ...c,
    sections: c.sections.map((s) => {
      if (s.kind === "columns") return { ...s, items: s.items.map((i, n) => (n === 1 ? { ...i, body: fix.net } : i)) }
      if (s.kind === "faq") return { ...s, items: s.items.map((i, n) => (n === 2 ? { ...i, a: fix.faq } : i)) }
      return s
    }),
  }
}

export const TWELVE_STEPS: Variant = {
  key: "12-steps",
  audience: "end-user",
  signup: "user",
  video: "first-week",
  checkinFocus: "recovery",
  copy: { en: withMissedFix(fromLandingCopy(LANDING_EN), MISSED_EN), es: withMissedFix(fromLandingCopy(LANDING_ES), MISSED_ES) },
  routes: [
    {
      path: "/12-steps",
      lang: "en",
      src: "12step",
      title: "Samwise — turn every slip into something you can work on",
      description: LANDING_EN.hero.sub,
      twin: "/12-pasos",
    },
    {
      path: "/12-pasos",
      lang: "es",
      src: "12pasos",
      title: "Samwise — convierte cada desliz en algo que puedes trabajar",
      description: LANDING_ES.hero.sub,
      twin: "/12-steps",
    },
  ],
}
