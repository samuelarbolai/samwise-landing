import type { Metadata } from "next"
import "./v2.css"

export const metadata: Metadata = {
  title: "Samwise — your account",
  robots: { index: false, follow: false },
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className="v2-root">{children}</div>
}
