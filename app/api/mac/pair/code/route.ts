import { randomInt } from "node:crypto"
import { query, toId } from "@/lib/v2/db"
import { readJson, handleError } from "@/lib/v2/http"
import { cleanPairCode, connectDevice, deviceInfo, json, loadConfig, pause, refuse, sha256 } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

/**
 * Connect a Mac with a pairing code that Samwise gave the person directly (mac_pair_codes).
 * A code is 10 random characters, works once and expires, and only its hash is stored.
 */
export async function POST(req: Request) {
  try {
    const body = await readJson(req)
    const code = cleanPairCode(body.code)
    if (code.length < 8) return refuse("Enter the pairing code")

    const [row] = await query<{ user_id: string }>(
      `UPDATE mac_pair_codes SET used_at = now()
       WHERE code_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [sha256(code)],
    )
    if (!row) {
      await pause(150 + randomInt(0, 250))
      return refuse("That pairing code is not right or has expired.", 401)
    }

    const { token, device } = await connectDevice(toId(row.user_id), deviceInfo(body))
    return json({ token, config: await loadConfig(device) })
  } catch (err) {
    return handleError(err)
  }
}
