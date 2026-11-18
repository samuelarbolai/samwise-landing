import { CLINICIAN_EN, CLINICIAN_ES } from "../clinician-copy"
import { fromClinicianCopy } from "./from-landing-copy"
import type { Variant } from "./types"

/** /clinicians (EN) and /clinicos (ES): clinician plan (Sales copy approved 2026-11-15, live 2026-11-18). */
export const CLINICIANS: Variant = {
  key: "clinicians",
  audience: "professional",
  signup: "clinician",
  video: "clinician-plan",
  checkinFocus: "recovery",
  copy: { en: fromClinicianCopy(CLINICIAN_EN), es: fromClinicianCopy(CLINICIAN_ES) },
  routes: [
    {
      path: "/clinicians",
      lang: "en",
      src: "clinicians",
      title: "Samwise for clinicians: your plan, followed every day between sessions",
      description: CLINICIAN_EN.hero.sub,
      twin: "/clinicos",
    },
    {
      path: "/clinicos",
      lang: "es",
      src: "clinicos",
      title: "Samwise para clínicos: su plan, seguido cada día entre sesiones",
      description: CLINICIAN_ES.hero.sub,
      twin: "/clinicians",
    },
  ],
}
