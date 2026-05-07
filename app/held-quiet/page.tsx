import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import type { Metadata } from "next"
import QuietLanding from "./QuietLanding"

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Samwise",
  description:
    "A team of mental health professionals, spiritual guidance practitioners and technology experts building a definitive solution for the toughest behavioural challenges.",
}

export default function HeldQuietPage() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/lenis@1.3.15/dist/lenis.min.js" strategy="afterInteractive" />
      <QuietLanding serifClass={serif.className} monoClass={mono.className} />
    </>
  )
}
