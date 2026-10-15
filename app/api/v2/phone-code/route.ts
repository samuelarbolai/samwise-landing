import { randomInt } from "node:crypto"
import { query } from "@/lib/v2/db"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { PHONE_CODE_HOOK } from "@/lib/v2/phone"
import { isE164, isHHMM, isLanguage, isName, isTimezone, toPgTime } from "@/lib/v2/validate"

/**
 * Sign-up step 1 of 2. Saves the person's details under a 6-digit code (10 min)
 * and asks n8n to send the code to their WhatsApp. Step 2 is /phone-code/verify.
 */
export async function POST(req: Request) {
  try {
    const { name, phone, timezone, language, call_time } = await readJson(req)

    if (!isName(name)) return fail("Enter your name")
    if (!isE164(phone)) return fail("Enter a valid phone number")
    if (!isTimezone(timezone)) return fail("Select a valid timezone")
    if (!isLanguage(language)) return fail("Select a supported call language")
    if (call_time !== undefined && call_time !== "" && !isHHMM(call_time)) {
      return fail("Call time must be a valid 24h time, e.g. 07:30")
    }
    const time = typeof call_time === "string" && isHHMM(call_time) ? toPgTime(call_time) : null

    // Each code costs a WhatsApp message: at most one per 30 s and 5 per hour per number.
    const [recent] = await query<{ last_30s: number; last_hour: number }>(
      `SELECT count(*) FILTER (WHERE created_at > now() - interval '30 seconds')::int AS last_30s,
              count(*)::int AS last_hour
       FROM phone_codes WHERE phone = $1 AND created_at > now() - interval '1 hour'`,
      [phone],
    )
    if (recent.last_30s > 0 || recent.last_hour >= 5) return fail("Wait a moment before asking for another code", 429)

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
    const [row] = await query<{ id: string }>(
      `INSERT INTO phone_codes (phone, code, name, language, timezone, call_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [phone, code, (name as string).trim(), language, timezone, time],
    )

    const res = await fetch(PHONE_CODE_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(row.id), action: "send" }),
      signal: AbortSignal.timeout(15000),
    }).catch(() => null)
    const sent = res?.ok ? ((await res.json().catch(() => ({}))) as { sent?: boolean }).sent : false
    if (!sent) return fail("We couldn't send a WhatsApp code to that number. Check it and try again.", 502)

    return ok({ id: Number(row.id) }, 201)
  } catch (err) {
    return handleError(err)
  }
}
