import { listCallLogs } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, handleError } from "@/lib/v2/http"

// Read-only surface. `call_logs` is written by the n8n automation; this app
// never inserts, updates or deletes there.
export async function GET() {
  try {
    const userId = await requireSessionUserId()
    return ok({ calls: await listCallLogs(userId, 20) })
  } catch (err) {
    return handleError(err)
  }
}
