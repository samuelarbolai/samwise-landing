import type { Metadata } from "next"

// The v1 editorial landing, preserved verbatim at its own route after v2
// took over `/`. Kept out of the index so it doesn't compete with the
// canonical page for the same queries.
export const metadata: Metadata = {
  title: "Samwise",
  robots: { index: false, follow: true },
}

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return children
}
