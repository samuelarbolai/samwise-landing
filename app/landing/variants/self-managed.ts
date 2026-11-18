import { LANDING_SELF_EN, LANDING_SELF_ES } from "../landing-copy-self-managed"
import { fromLandingCopy } from "./from-landing-copy"
import type { Variant } from "./types"

/** /on-your-own (EN) and /por-tu-cuenta (ES): self-managed check-in (Sales v2, approved 2026-11-16). */
export const SELF_MANAGED: Variant = {
  key: "self-managed",
  audience: "end-user",
  signup: "user",
  video: "first-week",
  checkinFocus: "own",
  copy: { en: fromLandingCopy(LANDING_SELF_EN), es: fromLandingCopy(LANDING_SELF_ES) },
  routes: [
    {
      path: "/on-your-own",
      lang: "en",
      src: "on-your-own",
      title: "Samwise: one check-in a day to do what you set out to do",
      description: LANDING_SELF_EN.hero.sub,
      twin: "/por-tu-cuenta",
    },
    {
      path: "/por-tu-cuenta",
      lang: "es",
      src: "por-tu-cuenta",
      title: "Samwise: un chequeo al día para cumplir lo que te propones",
      description: LANDING_SELF_ES.hero.sub,
      twin: "/on-your-own",
    },
  ],
}
