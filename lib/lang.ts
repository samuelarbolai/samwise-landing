/**
 * Page language (EN/ES) for the public pages.
 * Order: ?lang= in the link, then the choice the visitor saved with the EN/ES switch,
 * then the browser's first language (Spanish when it starts with "es"), then the fallback.
 * Client only: call it from an effect, never during render.
 */
export type PageLang = "en" | "es"

export const LANG_KEY = "samwise:v2-lang"

function asLang(v: string | null | undefined): PageLang | null {
  return v === "es" || v === "en" ? v : null
}

/** Spanish when the browser's first language starts with "es" (es, es-CO, es-419...). */
export function browserLang(): PageLang | null {
  if (typeof navigator === "undefined") return null
  const first = (navigator.languages && navigator.languages[0]) || navigator.language || ""
  if (!first) return null
  return first.toLowerCase().startsWith("es") ? "es" : "en"
}

export function langFromUrl(): PageLang | null {
  return asLang(new URLSearchParams(window.location.search).get("lang"))
}

export function savedLang(): PageLang | null {
  try {
    return asLang(window.localStorage.getItem(LANG_KEY))
  } catch {
    return null
  }
}

export function saveLang(l: PageLang) {
  try {
    window.localStorage.setItem(LANG_KEY, l)
  } catch {
    // Private mode / storage disabled: the switch still applies to this view.
  }
}

export function detectLang(fallback: PageLang = "en"): PageLang {
  return langFromUrl() ?? savedLang() ?? browserLang() ?? fallback
}
