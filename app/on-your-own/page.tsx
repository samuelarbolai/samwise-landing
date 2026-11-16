import type { Metadata } from "next"
import { SelfManagedLanding } from "../landing/self-managed"
import { LANDING_SELF_EN } from "../landing/landing-copy-self-managed"

const TITLE = "Samwise: one check-in a day to do what you set out to do"
const DESCRIPTION = LANDING_SELF_EN.hero.sub
const URL = "https://samwise.life/on-your-own"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: { en: URL, es: "https://samwise.life/por-tu-cuenta" } },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Samwise", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/** Self-managed home page in English. Sign-ups are tagged ?src=on-your-own. */
export default function Page() {
  return <SelfManagedLanding pageLang="en" defaultSrc="on-your-own" />
}
