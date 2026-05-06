import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import type { Metadata } from "next"
import MotionLanding from "./MotionLanding"

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
  title: "Samwise — held.",
  description: "If you are here, it is not by accident.",
}

export default function HeldMotionPage() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/lenis@1.3.15/dist/lenis.min.js" strategy="afterInteractive" />
      <MotionLanding serifClass={serif.className} monoClass={mono.className} />
    </>
  )
}
