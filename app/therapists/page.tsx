import type { Metadata } from "next"
import { TherapistsJourney } from "./therapists-journey"

// Route-specific metadata. The app-root opengraph-image.tsx auto-applies its
// brand-mark card to this route too (reuse canonical OG, per the plan), so we
// only override title/description here.
export const metadata: Metadata = {
  title: "For behavioural change experts — Samwise",
  description:
    "How Samwise turns the work you already do into a daily ritual and an agent that keeps it, on your own price, pace and language.",
  openGraph: {
    title: "For behavioural change experts — Samwise",
    description:
      "How Samwise turns the work you already do into a daily ritual and an agent that keeps it.",
  },
}

export default function TherapistsPage() {
  return <TherapistsJourney />
}
