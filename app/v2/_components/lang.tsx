"use client"

import { useCallback, useEffect, useState } from "react"
import { V2_STRINGS, type Lang, type V2Strings } from "../strings"

const KEY = "samwise:v2-lang"

/**
 * Starts at "en" on both server and client, then reconciles from ?lang / storage
 * in an effect — otherwise the first paint would mismatch during hydration.
 */
export function useLang(): { lang: Lang; setLang: (l: Lang) => void; s: V2Strings } {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")
    const stored = window.localStorage.getItem(KEY)
    const next = fromUrl === "es" || fromUrl === "en" ? fromUrl : stored === "es" ? "es" : "en"
    setLangState(next as Lang)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(KEY, l)
    } catch {
      // Private mode / storage disabled — the toggle still works for this view.
    }
  }, [])

  return { lang, setLang, s: V2_STRINGS[lang] }
}

export function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="v2-lang">
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <span>/</span>
      <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>
        ES
      </button>
    </div>
  )
}
