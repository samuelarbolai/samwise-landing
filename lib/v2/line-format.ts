// Client-safe helpers for Samwise's WhatsApp lines (no database import). See lib/v2/lines.ts.

/** The user line: users and patients chat here, and it is also the calls number. */
export const USER_LINE = "+15079201622"

/** "+15079201622" -> "+1 507 920 1622" (US numbers); other numbers stay as they are. */
export function formatLine(e164: string): string {
  const d = e164.replace(/\D/g, "")
  return d.length === 11 && d.startsWith("1") ? `+1 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : e164
}
