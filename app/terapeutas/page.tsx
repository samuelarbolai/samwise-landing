import type { Metadata } from "next"
import { ClinicianLanding } from "../landing/clinician"
import { LANDING_CLINICIAN_ES } from "../landing/landing-copy-clinician"

const TITLE = "Samwise para terapeutas: tus preguntas en el chequeo diario de tu paciente"
const DESCRIPTION = LANDING_CLINICIAN_ES.hero.sub
const URL = "https://samwise.life/terapeutas"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { es: URL, en: "https://samwise.life/for-clinicians" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website", locale: "es" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Clinician page in Spanish. Sign-ups are tagged ?src=terapeutas and open the clinician sign-up. */
export default function Page() {
  return <ClinicianLanding pageLang="es" defaultSrc="terapeutas" />
}
