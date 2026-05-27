"use client"

import { useEffect } from "react"
import type { Lang } from "@/lib/qualify/strings"
import "./book.css"

// Type declaration for the Cal global that embed.js installs on window.
// We type minimally — only the surface we actually call.
declare global {
  interface Window {
    Cal?: {
      (...args: unknown[]): void
      loaded?: boolean
      ns?: Record<string, ((...args: unknown[]) => void) | undefined>
      q?: unknown[]
    }
  }
}

const STRINGS = {
  en: {
    lead: "Pick a time that works for you.",
    sub: "We'll send the call link to your inbox.",
    cta: "Open the calendar",
  },
  es: {
    lead: "Elige un horario que te quede bien.",
    sub: "Te enviamos el link de la llamada por correo.",
    cta: "Abrir el calendario",
  },
} as const

interface BookClientProps {
  lang: Lang
}

export function BookClient({ lang }: BookClientProps) {
  // Inject Cal's embed.js exactly once per page life. Mirrors the
  // snippet Cal generates in admin, ported to a React useEffect so
  // it plays well with Next.js' hydration + StrictMode (the loaded
  // flag on window.Cal protects against double-init).
  useEffect(() => {
    ;(function (C: Window, A: string, L: string) {
      const p = function (a: { q?: unknown[] }, ar: unknown) {
        a.q?.push(ar)
      }
      const d = C.document
      const cal =
        C.Cal ||
        (function () {
          const fn = function (...args: unknown[]) {
            const c = C.Cal!
            const ar = args
            if (!c.loaded) {
              c.ns = {}
              c.q = c.q || []
              const s = d.createElement("script")
              s.src = A
              d.head.appendChild(s)
              c.loaded = true
            }
            if (ar[0] === L) {
              const api = function (...inner: unknown[]) {
                p(api as unknown as { q?: unknown[] }, inner)
              }
              const namespace = ar[1]
              ;(api as unknown as { q: unknown[] }).q = []
              if (typeof namespace === "string") {
                c.ns![namespace] = (c.ns![namespace] || api) as (
                  ...args: unknown[]
                ) => void
                p(
                  c.ns![namespace] as unknown as { q?: unknown[] },
                  ar,
                )
                p(c as unknown as { q?: unknown[] }, [
                  "initNamespace",
                  namespace,
                ])
              } else {
                p(c as unknown as { q?: unknown[] }, ar)
              }
              return
            }
            p(c as unknown as { q?: unknown[] }, ar)
          }
          C.Cal = fn as Window["Cal"]
          return C.Cal!
        })()
      cal("init", "breakthrough", { origin: "https://app.cal.com" })
      if (cal.ns?.breakthrough) {
        cal.ns.breakthrough("ui", {
          hideEventTypeDetails: false,
          layout: "month_view",
        })
      }
    })(window, "https://app.cal.com/embed/embed.js", "init")
  }, [])

  const s = STRINGS[lang]

  return (
    <main className="book-root" lang={lang}>
      <header className="book-header">
        <a href="/" className="book-brand" aria-label="Samwise">
          Samwise
          <span className="book-brand-star" aria-hidden="true">
            ✦
          </span>
        </a>
      </header>

      <section className="book-center">
        <p className="book-lead">{s.lead}</p>
        <p className="book-sub">{s.sub}</p>

        <button
          type="button"
          className="book-cta"
          data-cal-link="samuel-giraldo-concha-yqvtot/breakthrough"
          data-cal-namespace="breakthrough"
          data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
        >
          <span className="book-cta-dashes" aria-hidden="true">
            ―
          </span>
          <span className="book-cta-text">{s.cta}</span>
          <span className="book-cta-dashes" aria-hidden="true">
            ―
          </span>
        </button>
      </section>
    </main>
  )
}
