import type { Metadata } from "next"
import { Home } from "./home"

const DESCRIPTION =
  "Your daily ritual companion. Samwise helps you keep a daily ritual through WhatsApp and a short call each day, and reaches your people when you need them."

export const metadata: Metadata = {
  title: "Samwise — your daily ritual companion",
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life" },
  openGraph: {
    title: "Samwise — your daily ritual companion",
    description: DESCRIPTION,
    url: "https://samwise.life",
    siteName: "Samwise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samwise — your daily ritual companion",
    description: DESCRIPTION,
  },
}

export default function Page() {
  return <Home />
}
