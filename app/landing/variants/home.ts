import { LANDING_EN, LANDING_ES } from "../landing-copy"
import { fromLandingCopy } from "./from-landing-copy"
import type { Variant } from "./types"

/** samwise.life/ — the home page (12-step framed copy, approved 2026-11-14). */
export const HOME: Variant = {
  key: "home",
  audience: "end-user",
  signup: "user",
  video: "first-week",
  checkinFocus: "recovery",
  copy: { en: fromLandingCopy(LANDING_EN), es: fromLandingCopy(LANDING_ES) },
  routes: [
    {
      path: "/",
      src: "landing",
      title: "Samwise — turn every slip into something you can work on",
      description:
        "Samwise calls you every day to check in. When you slip, you write what happened, in your own journal, ready for your sponsor.",
    },
  ],
}
