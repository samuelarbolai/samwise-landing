import { randomInt } from "node:crypto"
import { query } from "@/lib/v2/db"
import { readJson, handleError } from "@/lib/v2/http"
import { connectDevice, deviceInfo, digitsOf, json, loadConfig, pause, refuse, sameText, userByPhoneDigits } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

const WRONG = "That code is not right or has expired. Check it, or ask for a new one."

/**
 * Connect a Mac, step 2 of 2: checks the code sent to the account's WhatsApp and gives this Mac
 * its own token. Any code of the last 10 minutes that has not been used works (a second code
 * asked for while the first was on its way does not cancel the first). Every wrong try counts
 * against all of them, five tries each.
 *
 * A wrong code, an expired code and an unknown number all get the same answer after about the
 * same wait, so this endpoint does not tell a stranger which numbers have an account either.
 */
export async function POST(req: Request) {
  const started = Date.now()
  const wrong = async () => {
    const floor = 450 + randomInt(0, 300)
    const spent = Date.now() - started
    if (spent < floor) await pause(floor - spent)
    return refuse(WRONG, 401)
  }
  try {
    const body = await readJson(req)
    const digits = digitsOf(body.phone)
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : ""
    if (!/^\d{6}$/.test(code)) return refuse("Enter the 6-digit code")

    const user = await userByPhoneDigits(digits)
    if (!user) return wrong()

    const live = await query<{ id: string; code: string }>(
      `WITH live AS (
         SELECT id, code FROM phone_codes
         WHERE phone = $1 AND src = 'mac-app' AND verified_at IS NULL AND expires_at > now() AND attempts < 5
       ), tried AS (
         UPDATE phone_codes SET attempts = attempts + 1 WHERE id IN (SELECT id FROM live)
       )
       SELECT id, code FROM live`,
      [user.phone],
    )
    const match = live.find((row) => sameText(row.code, code))
    if (!match) return wrong()

    await query(
      `UPDATE phone_codes SET verified_at = now(), user_id = $2, setup_done_at = COALESCE(setup_done_at, now()) WHERE id = $1`,
      [match.id, user.id],
    )
    // The code is used: any other code still on its way stops working.
    await query(
      `UPDATE phone_codes SET expires_at = now()
       WHERE phone = $1 AND src = 'mac-app' AND verified_at IS NULL AND expires_at > now()`,
      [user.phone],
    )
    const { token, device } = await connectDevice(user.id, deviceInfo(body))
    return json({ token, config: await loadConfig(device) })
  } catch (err) {
    return handleError(err)
  }
}
