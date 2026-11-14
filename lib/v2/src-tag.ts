/**
 * Sign-up source tag (?src=). Carried from the landing page into sign-up and stored
 * in phone_codes.src, so sign-ups can be counted by where they came from.
 * Lowercase letters, digits, "-" and "_", up to 40 characters. Anything else is dropped.
 */
export const SRC_KEY = "samwise:src"
const SRC = /^[a-z0-9_-]{1,40}$/

export function cleanSrc(v: unknown): string | null {
  if (typeof v !== "string") return null
  const s = v.trim().toLowerCase()
  return SRC.test(s) ? s : null
}
