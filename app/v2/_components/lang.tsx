"use client"

import { useCallback, useEffect, useState } from "react"
import { V2_STRINGS, type Lang, type V2Strings } from "../strings"
import { detectLang, saveLang } from "@/lib/lang"

/**
 * Starts at "en" on both server and client, then reconciles in an effect from
 * ?lang, the saved choice, or the browser's language (Spanish when it starts with
 * "es") — otherwise the first paint would mismatch during hydration.
 */
export function useLang(): { lang: Lang; setLang: (l: Lang) => void; s: V2Strings } {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    saveLang(l)
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
