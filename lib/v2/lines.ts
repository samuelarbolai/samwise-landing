import { query } from "@/lib/v2/db"

/**
 * Samwise's WhatsApp lines (Neon samwise_lines, 2026-11-18). Users and patients write the user
 * line (+1 507 920 1622, also the calls number). Clinicians and sponsors get their own line
 * (+1 618 228 1456) once `whatsapp_live` is set for it, so one phone can be a patient on one line
 * and a clinician on the other. Until then everyone uses the user line, as before.
 */
export { USER_LINE, formatLine } from "@/lib/v2/line-format"
import { USER_LINE } from "@/lib/v2/line-format"

export type Lines = { user: string; clinician: string | null }

export async function getLines(): Promise<Lines> {
  try {
    const rows = await query<{ line: string; phone: string; whatsapp_live: boolean }>(
      `SELECT line, phone, whatsapp_live FROM samwise_lines`,
    )
    const user = rows.find((r) => r.line === "user")
    const clinician = rows.find((r) => r.line === "clinician" && r.whatsapp_live)
    return { user: user?.phone || USER_LINE, clinician: clinician?.phone || null }
  } catch {
    // No table or no database: the user line, exactly as before the clinician line existed.
    return { user: USER_LINE, clinician: null }
  }
}

/** The WhatsApp number a person with this role chats with. */
export function lineFor(lines: Lines, role: string | null | undefined): string {
  return role === "clinician" && lines.clinician ? lines.clinician : lines.user
}
