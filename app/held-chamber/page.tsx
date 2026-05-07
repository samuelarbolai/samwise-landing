import { Cinzel, EB_Garamond, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import type { Metadata } from "next"
import Chamber from "./Chamber"

const display = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-display",
})

const body = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-body",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Samwise",
  description:
    "A team of mental health professionals, spiritual guidance practitioners and technology experts building a definitive solution to the toughest behavioural challenges.",
}

export default function HeldChamberPage() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/lenis@1.3.15/dist/lenis.min.js" strategy="afterInteractive" />
      <Chamber
        displayClass={display.className}
        bodyClass={body.className}
        monoClass={mono.className}
      />
    </>
  )
}
