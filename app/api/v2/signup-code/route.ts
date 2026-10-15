import { randomInt } from "node:crypto"
import { query } from "@/lib/v2/db"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isHHMM, isLanguage, isName, isTimezone, toPgTime } from "@/lib/v2/validate"

/**
 * Sign-up step 1 of 2. Stores the person's details under a one-time 6-digit
 * code. Step 2 happens on WhatsApp: when they send the code to Samwise, n8n
 * creates the user with the WhatsApp number (so the phone is verified by
 * WhatsApp itself) and the chat agent starts setup. No password, no Google.
 */
export async function POST(req: Request) {
  try {
    const { name, timezone, language, call_time } = await readJson(req)

    if (!isName(name)) return fail("Enter your name")
    if (!isTimezone(timezone)) return fail("Select a valid timezone")
    if (!isLanguage(language)) return fail("Select a supported call language")
    if (call_time !== undefined && call_time !== "" && !isHHMM(call_time)) {
      return fail("Call time must be a valid 24h time, e.g. 07:30")
    }
    const time = typeof call_time === "string" && isHHMM(call_time) ? toPgTime(call_time) : null

    // Retry on the (unlikely) clash with a live code.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
      const rows = await query<{ code: string }>(
        `INSERT INTO signup_codes (code, name, language, timezone, call_time)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name, language = EXCLUDED.language, timezone = EXCLUDED.timezone,
           call_time = EXCLUDED.call_time, created_at = now(),
           expires_at = now() + interval '24 hours', used_at = NULL, user_id = NULL
         WHERE signup_codes.used_at IS NOT NULL OR signup_codes.expires_at < now()
         RETURNING code`,
        [code, (name as string).trim(), language, timezone, time],
      )
      if (rows.length) return ok({ code: rows[0].code }, 201)
    }
    return fail("Please try again", 503)
  } catch (err) {
    return handleError(err)
  }
}
