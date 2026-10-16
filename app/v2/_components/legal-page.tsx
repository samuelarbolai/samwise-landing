import Link from "next/link"
import { Brand } from "./brand"
import "../v2.css"

/** Plain page shell for the privacy policy and terms (public, linked from sign-up and the SMS campaign). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="v2-root">
      <header className="v2-header">
        <Brand />
        <div className="v2-header-right">
          <Link className="v2-headerlink" href="/">
            Home
          </Link>
        </div>
      </header>
      <main className="v2-main v2-legal">
        <h1 className="v2-title">{title}</h1>
        <p className="v2-sub">Last updated {updated}</p>
        {children}
      </main>
    </div>
  )
}
