const E164 = /^\+[1-9]\d{7,14}$/
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isE164(v: unknown): v is string {
  return typeof v === "string" && E164.test(v)
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL.test(v)
}

export function isHHMM(v: unknown): v is string {
  return typeof v === "string" && HHMM.test(v)
}

/** `HH:MM` → `HH:MM:SS`. The user's local wall clock, stored verbatim. */
export function toPgTime(hhmm: string): string {
  return `${hhmm}:00`
}

/** `HH:MM:SS` (or `HH:MM`) → `HH:MM` for form inputs. */
export function toHHMM(pgTime: string): string {
  return pgTime.slice(0, 5)
}

export function isTimezone(v: unknown): v is string {
  if (typeof v !== "string" || !v) return false
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: v })
    return true
  } catch {
    return false
  }
}

export const SUPPORTED_LANGUAGES = ["es", "en", "he"] as const
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]

/** ISO 639-1, restricted to the three launch languages. Anything else is rejected. */
export function isLanguage(v: unknown): v is LanguageCode {
  return typeof v === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(v)
}

export function isName(v: unknown): v is string {
  return typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 120
}

export function isPassword(v: unknown): v is string {
  return typeof v === "string" && v.length >= 8 && v.length <= 200
}
