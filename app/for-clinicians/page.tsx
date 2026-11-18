import type { Metadata } from "next"
import { ClinicianLanding } from "../landing/clinician"
import { LANDING_CLINICIAN_EN } from "../landing/landing-copy-clinician"

const TITLE = "Samwise for clinicians: your questions in your patient's daily check-in"
const DESCRIPTION = LANDING_CLINICIAN_EN.hero.sub
const URL = "https://samwise.life/for-clinicians"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { en: URL, es: "https://samwise.life/terapeutas" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website", locale: "en" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Clinician page in English. Sign-ups are tagged ?src=for-clinicians and open the clinician sign-up. */
export default function Page() {
  return <ClinicianLanding pageLang="en" defaultSrc="for-clinicians" />
}
