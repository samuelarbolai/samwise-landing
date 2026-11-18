import type { Metadata } from "next"
import { CliniciansLanding } from "../landing/clinicians"
import { CLINICIAN_ES } from "../landing/clinician-copy"

const TITLE = "Samwise para clínicos: su plan, seguido cada día entre sesiones"
const DESCRIPTION = CLINICIAN_ES.hero.sub
const URL = "https://samwise.life/clinicos"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { es: URL, en: "https://samwise.life/clinicians" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website", locale: "es" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Clinician page in Spanish. Sign-ups go to the clinician sign-up, tagged ?src=clinicos. */
export default function Page() {
  return <CliniciansLanding pageLang="es" defaultSrc="clinicos" />
}
