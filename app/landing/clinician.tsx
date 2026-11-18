"use client"

import { Landing } from "./landing"
import { LANDING_CLINICIAN_EN, LANDING_CLINICIAN_ES } from "./landing-copy-clinician"
import type { PageLang } from "@/lib/lang"

const COPY = { en: LANDING_CLINICIAN_EN, es: LANDING_CLINICIAN_ES }

/** The clinician page: /terapeutas starts in Spanish, /for-clinicians in English. Buttons open the clinician sign-up. */
export function ClinicianLanding({ pageLang, defaultSrc }: { pageLang: PageLang; defaultSrc: string }) {
  return <Landing copy={COPY} pageLang={pageLang} defaultSrc={defaultSrc} role="clinician" video="clinician-plan" />
}
