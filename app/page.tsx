import type { Metadata } from "next"
import { Home } from "./home"

const DESCRIPTION =
  "Samwise calls you every day at a time you choose, walks you through a ritual built around your pattern, and reaches your people the moment you are about to fall. Free during the open beta."

export const metadata: Metadata = {
  title: "Samwise — break the loop, one call a day",
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life" },
  openGraph: {
    title: "Samwise — break the loop, one call a day",
    description: DESCRIPTION,
    url: "https://samwise.life",
    siteName: "Samwise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samwise — break the loop, one call a day",
    description: DESCRIPTION,
  },
}

export default function Page() {
  return <Home />
}
