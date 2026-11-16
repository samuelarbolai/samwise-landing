import type { Metadata } from "next"
import { SelfManagedLanding } from "../landing/self-managed"
import { LANDING_SELF_ES } from "../landing/landing-copy-self-managed"

const TITLE = "Samwise: un chequeo al día para cumplir lo que te propones"
const DESCRIPTION = LANDING_SELF_ES.hero.sub
const URL = "https://samwise.life/por-tu-cuenta"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { es: URL, en: "https://samwise.life/on-your-own" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website", locale: "es" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Self-managed home page in Spanish. Sign-ups are tagged ?src=por-tu-cuenta. */
export default function Page() {
  return <SelfManagedLanding pageLang="es" defaultSrc="por-tu-cuenta" />
}
