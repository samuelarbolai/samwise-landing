import type { Metadata } from "next"
import { Home } from "./home"

// The long product-page home (live until 2026-10-15), kept as a variant.
export const metadata: Metadata = {
  title: "Samwise — break the loop, one call a day",
  description:
    "Samwise calls you every day at a time you choose, walks you through a ritual built around your pattern, and reaches your people the moment you are about to fall. Free during the open beta.",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <Home />
}
