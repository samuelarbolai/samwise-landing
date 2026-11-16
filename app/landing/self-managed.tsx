"use client"

import { Landing } from "./landing"
import { LANDING_SELF_EN, LANDING_SELF_ES } from "./landing-copy-self-managed"
import type { PageLang } from "@/lib/lang"

const COPY = { en: LANDING_SELF_EN, es: LANDING_SELF_ES }

/** The self-managed home page: /por-tu-cuenta starts in Spanish, /on-your-own in English. */
export function SelfManagedLanding({ pageLang, defaultSrc }: { pageLang: PageLang; defaultSrc: string }) {
  return <Landing copy={COPY} pageLang={pageLang} defaultSrc={defaultSrc} />
}
