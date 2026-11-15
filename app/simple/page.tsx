import type { Metadata } from "next"
import { Home } from "../home"

/** The previous one-screen home (EN/ES), kept until Sales sends the Spanish landing copy. */
export const metadata: Metadata = {
  title: "Samwise — your daily check-in companion",
  robots: { index: false, follow: true },
}

export default function SimpleHome() {
  return <Home />
}
