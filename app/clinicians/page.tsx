import type { Metadata } from "next"
import { CliniciansLanding } from "../landing/clinicians"
import { CLINICIAN_EN } from "../landing/clinician-copy"

const TITLE = "Samwise for clinicians: your plan, followed every day between sessions"
const DESCRIPTION = CLINICIAN_EN.hero.sub
const URL = "https://samwise.life/clinicians"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { en: URL, es: "https://samwise.life/clinicos" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website", locale: "en" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Clinician page in English. Sign-ups go to the clinician sign-up, tagged ?src=clinicians. */
export default function Page() {
  return <CliniciansLanding pageLang="en" defaultSrc="clinicians" />
}
