import type { Metadata } from "next"
import { LekatchilaJourney } from "./lekatchila-journey"

export const metadata: Metadata = {
  title: "Samwise for Lekatchila — a variant for the first year of marriage",
  description:
    "A Samwise variant built so each couple's first-year work survives the gap between alignment-point meetings.",
  openGraph: {
    title: "Samwise for Lekatchila",
    description:
      "A Samwise variant built so each couple's first-year work survives the gap between alignment-point meetings.",
  },
}

export default function LekatchilaPage() {
  return <LekatchilaJourney />
}
