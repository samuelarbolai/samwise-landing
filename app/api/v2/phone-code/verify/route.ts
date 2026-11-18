import { query, toId } from "@/lib/v2/db"
import { createSession } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { PHONE_CODE_HOOK } from "@/lib/v2/phone"
import { getLines, lineFor } from "@/lib/v2/lines"

/**
 * Sign-up step 2 of 2. Checks the code (5 tries, 10 min). A new number becomes a
 * user in setup; a number that already has an account just signs in. Either way
 * the next step is saying hi to Samwise on WhatsApp.
 */
export async function POST(req: Request) {
  try {
    const { id, code } = await readJson(req)
    if (typeof id !== "number" || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return fail("Enter the 6-digit code")
    }

    const [row] = await query<{
      phone: string; code: string; name: string; language: string; timezone: string
      role: string | null; plan_code: string | null
    }>(
      `UPDATE phone_codes SET attempts = attempts + 1
       WHERE id = $1 AND verified_at IS NULL AND expires_at > now() AND attempts < 5
       RETURNING phone, code, name, language, timezone, role, plan_code`,
      [id],
    )
    if (!row) return fail("This code expired. Ask for a new one.", 410)
    if (row.code !== code) return fail("That code is not right. Check it and try again.", 401)

    // Once the clinician WhatsApp line is live, one phone may own two accounts: a user account
    // (user line) and a clinician account (clinician line). Signing up in one role then finds or
    // creates the account for that role. Before that: one account per number, as it always was.
    const lines = await getLines()
    const wantClinician = row.role === "clinician"
    const [match] = await query<{ id: string; name: string; role: string }>(
      `SELECT id, name, role FROM users WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
       ORDER BY ((COALESCE(role, 'user') = 'clinician') = $2) DESC, id LIMIT 1`,
      [row.phone, wantClinician],
    )
    const existing = match && (!lines.clinician || (match.role === "clinician") === wantClinician) ? match : undefined

    let userId: number
    let name: string
    if (existing) {
      userId = toId(existing.id)
      name = existing.name
      await query(`UPDATE phone_codes SET verified_at = now(), user_id = $2, setup_done_at = now() WHERE id = $1`, [id, userId])
    } else if (row.role === "clinician") {
      // A clinician writes plans in the chat. No check-in calls, so no setup row and no first call time.
      const [created] = await query<{ id: string }>(
        `WITH u AS (
           INSERT INTO users (name, phone, timezone, language, role) VALUES ($1, $2, $3, $4, 'clinician') RETURNING id
         ), mark AS (
           UPDATE phone_codes SET verified_at = now(), user_id = (SELECT id FROM u), setup_done_at = now() WHERE id = $5
         )
         SELECT id FROM u`,
        [row.name, row.phone, row.timezone, row.language, id],
      )
      userId = toId(created.id)
      name = row.name
    } else {
      const [created] = await query<{ id: string }>(
        `WITH u AS (
           INSERT INTO users (name, phone, timezone, language) VALUES ($1, $2, $3, $4) RETURNING id
         ), onb AS (
           INSERT INTO user_onboarding (user_id, status, preferred_channel) SELECT id, 'in_setup', 'whatsapp' FROM u
         ), mark AS (
           UPDATE phone_codes SET verified_at = now(), user_id = (SELECT id FROM u) WHERE id = $5
         )
         SELECT id FROM u`,
        [row.name, row.phone, row.timezone, row.language, id],
      )
      userId = toId(created.id)
      name = row.name
      // Saves the first call time (and queues today's call if it's still ahead).
      await fetch(PHONE_CODE_HOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "verified" }),
        signal: AbortSignal.timeout(15000),
      }).catch(() => null)
    }

    // One role per number: an existing account keeps the role it has.
    const role = existing ? existing.role : row.role === "clinician" ? "clinician" : "user"

    // Came from a clinician's invite link: the plan is offered in the chat, where the person
    // accepts, rewords or skips each question. Nothing is active until they say so.
    if (row.plan_code && role !== "clinician") {
      await query(
        `INSERT INTO plan_enrollments (plan_id, patient_id)
         SELECT id, $2 FROM clinician_plans WHERE code = $1 AND status = 'active'
         ON CONFLICT (plan_id, patient_id) DO NOTHING`,
        [row.plan_code, userId],
      )
    }

    await createSession(userId)
    return ok({ name, existing: !!existing, role, wa_number: lineFor(lines, role) })
  } catch (err) {
    return handleError(err)
  }
}
