import { query } from "@/lib/v2/db"
import { readJson, handleError } from "@/lib/v2/http"
import { deviceFromRequest, json, refuse } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

/** Ticks one of the person's own open tasks (the things they set themselves for after the check-in). */
export async function POST(req: Request) {
  try {
    const device = await deviceFromRequest(req)
    if (!device) return refuse("This Mac is not connected", 401)

    const { id } = await readJson(req)
    const taskId = typeof id === "number" ? id : typeof id === "string" && /^\d{1,15}$/.test(id) ? Number(id) : NaN
    if (!Number.isSafeInteger(taskId) || taskId <= 0) return refuse("Which task?")

    const rows = await query<{ id: string }>(
      `UPDATE user_tasks SET status = 'done', done_at = now(), updated_at = now()
       WHERE id = $1 AND user_id = $2 AND status = 'open'
       RETURNING id`,
      [taskId, device.userId],
    )
    return json({ ok: true, changed: rows.length })
  } catch (err) {
    return handleError(err)
  }
}
