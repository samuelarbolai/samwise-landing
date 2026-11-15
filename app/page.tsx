import type { Metadata } from "next"
import { Landing } from "./landing/landing"

const TITLE = "Samwise — turn every slip into something you can work on"
const DESCRIPTION =
  "Samwise calls you every day to check in. When you slip, you write what happened, in your own journal, ready for your sponsor."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://samwise.life",
    siteName: "Samwise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function Page() {
  return <Landing />
}
