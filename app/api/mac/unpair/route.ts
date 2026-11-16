import { query } from "@/lib/v2/db"
import { handleError } from "@/lib/v2/http"
import { deviceFromRequest, json, refuse } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

/** Disconnects this Mac: its token stops working at once. */
export async function POST(req: Request) {
  try {
    const device = await deviceFromRequest(req)
    if (!device) return refuse("This Mac is not connected", 401)
    await query(`UPDATE mac_devices SET revoked_at = now() WHERE id = $1`, [device.id])
    return json({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}
