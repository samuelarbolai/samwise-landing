import type { Metadata } from "next"
import { Home } from "./home"

const DESCRIPTION =
  "Your daily check-in companion. Samwise helps you do a daily check-in through WhatsApp and a short call each day, and calls your trusted people when you need them."

export const metadata: Metadata = {
  title: "Samwise — your daily check-in companion",
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life" },
  openGraph: {
    title: "Samwise — your daily check-in companion",
    description: DESCRIPTION,
    url: "https://samwise.life",
    siteName: "Samwise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samwise — your daily check-in companion",
    description: DESCRIPTION,
  },
}

export default function Page() {
  return <Home />
}
